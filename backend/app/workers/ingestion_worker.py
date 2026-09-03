import os
import json
import logging
import asyncio
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional, Set
import httpx
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings, BASE_DIR
from backend.app.core.address_validator import normalize_address, is_valid_crypto_address, detect_blockchain
from backend.app.models.database import AsyncSessionLocal, Transaction as DBTransaction, init_db
from backend.app.schemas.analysis import NormalizedTransaction
from backend.app.services.vasp.matcher import vasp_matcher
from backend.app.services.blockchain.factory import BlockchainProviderFactory

logger = logging.getLogger(__name__)

CACHE_DIR = BASE_DIR / "data" / "cache" / "transactions"
CHECKPOINT_PATH = BASE_DIR / "data" / "ingestion_checkpoint.json"


class BlockchainIngestionWorker:
    """
    Resilient, scalable multi-chain blockchain ingestion engine.
    Ingests genuine historical transaction and token transfer streams for verified VASP addresses.
    Features local page caching, checkpointing, rate limiting, and deduplication.
    """

    def __init__(
        self,
        target_transactions: int = 100000,
        requests_per_second: float = 4.0,
        batch_commit_size: int = 250
    ):
        self.target_transactions = target_transactions
        self.rate_limit_delay = 1.0 / max(0.5, requests_per_second)
        self.batch_commit_size = batch_commit_size
        self._is_running = False
        self._stop_requested = False

        # In-memory tracking metrics
        self.stats: Dict[str, Any] = {
            "target_transactions": target_transactions,
            "current_transactions": 0,
            "ethereum_transactions": 0,
            "tron_transactions": 0,
            "erc20_transactions": 0,
            "trc20_transactions": 0,
            "usdt_transactions": 0,
            "unique_counterparties": 0,
            "vasp_seed_addresses": 0,
            "addresses_processed": 0,
            "addresses_remaining": 0,
            "api_requests_made": 0,
            "failed_requests": 0,
            "duplicate_records_skipped": 0,
            "is_running": False,
            "last_updated": datetime.utcnow().isoformat(),
            "last_active_address": None,
            "error_log": []
        }

        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        CHECKPOINT_PATH.parent.mkdir(parents=True, exist_ok=True)
        self._load_checkpoint()

    def _load_checkpoint(self):
        """Loads persistent progress and processed address set from disk."""
        if CHECKPOINT_PATH.exists():
            try:
                with open(CHECKPOINT_PATH, "r", encoding="utf-8") as f:
                    saved = json.load(f)
                    self.stats.update(saved)
                    self.stats["is_running"] = False
                    logger.info(f"Loaded ingestion checkpoint: {self.stats.get('current_transactions', 0)} transactions.")
            except Exception as e:
                logger.warning(f"Failed to load checkpoint file: {e}")

    def _save_checkpoint(self):
        """Persists ingestion progress state to disk."""
        self.stats["last_updated"] = datetime.utcnow().isoformat()
        try:
            with open(CHECKPOINT_PATH, "w", encoding="utf-8") as f:
                json.dump(self.stats, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save ingestion checkpoint: {e}")

    async def get_db_metrics(self) -> Dict[str, Any]:
        """Queries live, exact counts from the underlying database."""
        async with AsyncSessionLocal() as session:
            try:
                # Total count
                res_total = await session.execute(select(func.count(DBTransaction.id)))
                total_tx = res_total.scalar() or 0

                # By Chain
                res_eth = await session.execute(
                    select(func.count(DBTransaction.id)).where(DBTransaction.chain == "ethereum")
                )
                eth_tx = res_eth.scalar() or 0

                res_tron = await session.execute(
                    select(func.count(DBTransaction.id)).where(DBTransaction.chain == "tron")
                )
                tron_tx = res_tron.scalar() or 0

                # USDT Count
                res_usdt = await session.execute(
                    select(func.count(DBTransaction.id)).where(
                        DBTransaction.token_symbol.ilike("%USDT%")
                    )
                )
                usdt_tx = res_usdt.scalar() or 0

                # Token types
                res_erc20 = await session.execute(
                    select(func.count(DBTransaction.id)).where(DBTransaction.asset_type == "ERC20")
                )
                erc20_tx = res_erc20.scalar() or 0

                res_trc20 = await session.execute(
                    select(func.count(DBTransaction.id)).where(DBTransaction.asset_type == "TRC20")
                )
                trc20_tx = res_trc20.scalar() or 0

                # Unique Counterparties (Sources + Destinations)
                res_from = await session.execute(select(func.count(func.distinct(DBTransaction.from_address))))
                res_to = await session.execute(select(func.count(func.distinct(DBTransaction.to_address))))
                unique_counterparties = max(res_from.scalar() or 0, res_to.scalar() or 0)

                self.stats["current_transactions"] = total_tx
                self.stats["ethereum_transactions"] = eth_tx
                self.stats["tron_transactions"] = tron_tx
                self.stats["erc20_transactions"] = erc20_tx
                self.stats["trc20_transactions"] = trc20_tx
                self.stats["usdt_transactions"] = usdt_tx
                self.stats["unique_counterparties"] = unique_counterparties

                progress = min(100.0, round((total_tx / max(1, self.target_transactions)) * 100.0, 2))
                self.stats["progress_percent"] = progress

                return self.stats
            except Exception as e:
                logger.error(f"Error querying DB metrics: {e}")
                return self.stats

    async def ingest_address_batch(
        self,
        address: str,
        chain: str,
        pages: int = 5,
        offset_per_page: int = 50
    ) -> int:
        """
        Fetches multiple historical pages of transactions for a single verified seed address.
        """
        provider = BlockchainProviderFactory.get_provider(address)
        new_records_count = 0
        seen_hashes = set()

        async with AsyncSessionLocal() as session:
            # Query existing tx hashes in DB for this address to avoid inserting duplicates
            existing_stmt = select(DBTransaction.tx_hash).where(
                (DBTransaction.from_address == address) | (DBTransaction.to_address == address)
            )
            existing_res = await session.execute(existing_stmt)
            existing_hashes = set(existing_res.scalars().all())

            for page in range(1, pages + 1):
                if self._stop_requested:
                    break

                cache_key = f"{chain}_{address}_{page}_{offset_per_page}.json"
                cache_file = CACHE_DIR / cache_key
                tx_batch: List[NormalizedTransaction] = []

                # 1. Check local disk page cache
                if cache_file.exists():
                    try:
                        with open(cache_file, "r", encoding="utf-8") as f:
                            cached_data = json.load(f)
                            for item in cached_data:
                                item["timestamp"] = datetime.fromisoformat(item["timestamp"])
                                tx_batch.append(NormalizedTransaction(**item))
                    except Exception as e:
                        logger.warning(f"Error reading cache {cache_key}: {e}")

                # 2. If not cached, query live provider API
                if not tx_batch:
                    self.stats["api_requests_made"] += 1
                    try:
                        if chain == "ethereum":
                            # Parallel fetch of native ETH + ERC20
                            t_native = provider.get_native_transactions(address, page=page, offset=offset_per_page)
                            t_token = provider.get_token_transfers(address, page=page, offset=offset_per_page)
                            results = await asyncio.gather(t_native, t_token, return_exceptions=True)
                            for r in results:
                                if isinstance(r, list):
                                    tx_batch.extend(r)
                                elif isinstance(r, Exception):
                                    self.stats["failed_requests"] += 1
                        else:
                            # Tron provider
                            tx_batch = await provider.get_address_activity(address, max_tx=offset_per_page)

                        # Write to local page cache
                        if tx_batch:
                            cache_payload = [
                                {
                                    **t.model_dump(),
                                    "timestamp": t.timestamp.isoformat()
                                }
                                for t in tx_batch
                            ]
                            with open(cache_file, "w", encoding="utf-8") as f:
                                json.dump(cache_payload, f)

                    except Exception as e:
                        self.stats["failed_requests"] += 1
                        logger.warning(f"API fetch failed for {address} (page {page}): {e}")
                        await asyncio.sleep(1.0)
                        continue

                # 3. Deduplicate and Insert into Database
                for tx in tx_batch:
                    composite_key = f"{tx.chain}_{tx.tx_hash}_{tx.token_address}_{tx.from_address}_{tx.to_address}"
                    if tx.tx_hash in existing_hashes or composite_key in seen_hashes:
                        self.stats["duplicate_records_skipped"] += 1
                        continue

                    seen_hashes.add(composite_key)
                    existing_hashes.add(tx.tx_hash)

                    db_tx = DBTransaction(
                        tx_hash=tx.tx_hash,
                        chain=tx.chain,
                        block_number=tx.block_number,
                        timestamp=tx.timestamp,
                        from_address=tx.from_address,
                        to_address=tx.to_address,
                        asset_type=tx.asset_type,
                        token_address=tx.token_address,
                        token_symbol=tx.token_symbol,
                        token_decimals=tx.token_decimals,
                        amount=tx.amount,
                        gas_used=tx.gas_used,
                        is_error=tx.is_error,
                        source_api="Etherscan v2 / TronGrid REST API",
                        ingested_at=datetime.utcnow()
                    )
                    session.add(db_tx)
                    new_records_count += 1

                # Commit batch
                if new_records_count > 0:
                    try:
                        await session.commit()
                    except Exception as e:
                        await session.rollback()
                        logger.error(f"Database commit error for {address}: {e}")

                # Rate limiting delay
                await asyncio.sleep(self.rate_limit_delay)

                # If returned items are fewer than offset, no more historical pages exist
                if len(tx_batch) < (offset_per_page // 2):
                    break

        return new_records_count

    async def run_pipeline(self, max_addresses: Optional[int] = None):
        """
        Main continuous ingestion loop across all verified VASP addresses.
        """
        if self._is_running:
            logger.info("Ingestion worker is already running.")
            return

        self._is_running = True
        self._stop_requested = False
        self.stats["is_running"] = True
        logger.info(f"Starting blockchain ingestion pipeline (Target: {self.target_transactions:,} records)")

        # Ensure DB tables exist
        await init_db()

        # Load all genuine VASP seed records
        vasp_addresses = list(vasp_matcher._address_map.values())
        self.stats["vasp_seed_addresses"] = len(vasp_addresses)

        # Refresh baseline stats from DB
        await self.get_db_metrics()

        addresses_to_process = vasp_addresses[:max_addresses] if max_addresses else vasp_addresses
        total_to_process = len(addresses_to_process)

        for idx, item in enumerate(addresses_to_process, 1):
            if self._stop_requested or self.stats["current_transactions"] >= self.target_transactions:
                logger.info(f"Ingestion reached stop condition (Total: {self.stats['current_transactions']:,} records).")
                break

            addr = item["address"]
            chain = item.get("chain", "ethereum")
            self.stats["last_active_address"] = f"[{item['vasp_name']}] {addr[:10]}... ({chain})"
            self.stats["addresses_processed"] = idx
            self.stats["addresses_remaining"] = total_to_process - idx

            try:
                # Fetch up to 10 historical pages (up to 500 txs per seed address)
                added = await self.ingest_address_batch(addr, chain, pages=10, offset_per_page=50)
                self.stats["current_transactions"] += added

                if idx % 5 == 0 or added > 100:
                    await self.get_db_metrics()
                    self._save_checkpoint()
                    logger.info(
                        f"[{idx}/{total_to_process}] Ingested {added} txs for {item['vasp_name']}. "
                        f"Total DB Count: {self.stats['current_transactions']:,} ({self.stats.get('progress_percent', 0)}%)"
                    )

            except Exception as e:
                logger.error(f"Error processing address {addr}: {e}")
                self.stats["failed_requests"] += 1
                self.stats["error_log"].append({"address": addr, "error": str(e), "time": datetime.utcnow().isoformat()})
                self.stats["error_log"] = self.stats["error_log"][-50:]  # Keep last 50

        self._is_running = False
        self.stats["is_running"] = False
        await self.get_db_metrics()
        self._save_checkpoint()
        logger.info(f"Ingestion completed. Final record count: {self.stats['current_transactions']:,}")

    def stop(self):
        """Requests graceful shutdown of ingestion loop."""
        self._stop_requested = True
        self._is_running = False
        self.stats["is_running"] = False
        self._save_checkpoint()


# Global singleton ingestion worker
ingestion_worker = BlockchainIngestionWorker(target_transactions=100000)
