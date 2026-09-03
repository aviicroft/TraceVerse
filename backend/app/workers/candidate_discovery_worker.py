import asyncio
import logging
import json
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from sqlalchemy import select, func
from sqlalchemy.dialects.sqlite import insert as sqlite_insert

from backend.app.core.config import settings
from backend.app.models.database import AsyncSessionLocal, CandidateWallet, VASPAddress, Transaction
from backend.app.services.vasp.matcher import vasp_matcher
from backend.app.services.blockchain.etherscan import EtherscanProvider
from backend.app.services.blockchain.tron import TronProvider
from backend.app.services.discovery.candidate_miner import CandidateMiner

logger = logging.getLogger(__name__)


class CandidateDiscoveryWorker:
    """
    Background worker that iterates through verified VASP seed addresses,
    extracts real counterparty wallets, filters them, constructs 1-3 hop profiles,
    calculates Candidate Quality Scores, and persists them into candidate_wallets.
    """

    def __init__(self):
        self.miner = CandidateMiner()
        self.eth_provider = EtherscanProvider()
        self.tron_provider = TronProvider()
        self.is_running = False
        self.stop_requested = False
        self._lock = asyncio.Lock()
        
        # In-memory progress tracking
        self.stats = {
            "vasp_seeds_processed": 0,
            "total_counterparties_discovered": 0,
            "total_rejected": 0,
            "total_surviving_candidates": 0,
            "hop_1_count": 0,
            "hop_2_count": 0,
            "hop_3_count": 0,
            "is_running": False,
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "last_processed_address": None
        }

    async def get_stats(self) -> Dict[str, Any]:
        """Returns live discovery pipeline summary and database candidate counts."""
        async with AsyncSessionLocal() as session:
            total_cand = await session.scalar(select(func.count(CandidateWallet.id))) or 0
            ready_cand = await session.scalar(
                select(func.count(CandidateWallet.id)).where(CandidateWallet.status == "investigation_ready")
            ) or 0
            hop_1 = await session.scalar(
                select(func.count(CandidateWallet.id)).where(CandidateWallet.min_hop_to_vasp == 1)
            ) or 0
            hop_2 = await session.scalar(
                select(func.count(CandidateWallet.id)).where(CandidateWallet.min_hop_to_vasp == 2)
            ) or 0
            hop_3 = await session.scalar(
                select(func.count(CandidateWallet.id)).where(CandidateWallet.min_hop_to_vasp == 3)
            ) or 0

            avg_score = await session.scalar(select(func.avg(CandidateWallet.candidate_quality_score))) or 0.0

        return {
            "total_candidates_stored": total_cand,
            "investigation_ready_count": ready_cand,
            "hop_1_count": hop_1,
            "hop_2_count": hop_2,
            "hop_3_count": hop_3,
            "average_quality_score": round(float(avg_score), 1),
            "is_running": self.is_running,
            "vasp_seeds_processed": self.stats["vasp_seeds_processed"],
            "total_counterparties_discovered": self.stats["total_counterparties_discovered"],
            "total_rejected": self.stats["total_rejected"],
            "last_processed_address": self.stats["last_processed_address"],
            "last_updated": self.stats["last_updated"]
        }

    async def run_discovery_cycle(self, max_seeds: int = 20, max_candidates_per_seed: int = 15):
        """
        Executes one full discovery sweep across VASP seeds.
        """
        async with self._lock:
            if self.is_running:
                logger.warning("Discovery cycle already in progress.")
                return
            self.is_running = True
            self.stop_requested = False
            self.stats["is_running"] = True

        logger.info(f"Starting Candidate Discovery sweep (max_seeds={max_seeds})...")

        try:
            # 1. Fetch seed VASP addresses from VASP matcher
            all_seeds = vasp_matcher.get_all_addresses()
            logger.info(f"Loaded {len(all_seeds)} candidate VASP seed addresses from registry.")

            seeds_to_process = all_seeds[:max_seeds]

            for seed in seeds_to_process:
                if self.stop_requested:
                    logger.info("Discovery run gracefully stopped by user request.")
                    break

                seed_addr = seed["address"]
                seed_chain = seed["chain"].lower()
                seed_vasp = seed["vasp_name"]

                self.stats["last_processed_address"] = seed_addr
                self.stats["vasp_seeds_processed"] += 1

                # 2. Fetch VASP transaction activity
                try:
                    if seed_chain == "tron":
                        txs = await self.tron_provider.get_address_activity(seed_addr, max_tx=30)
                    else:
                        txs = await self.eth_provider.get_address_activity(seed_addr, max_tx=30)
                except Exception as e:
                    logger.warning(f"Failed to fetch transactions for VASP seed {seed_addr}: {e}")
                    continue

                if not txs:
                    continue

                # 3. Extract and filter counterparties
                extracted = self.miner.extract_counterparties_from_transactions(
                    seed_vasp_name=seed_vasp,
                    seed_vasp_address=seed_addr,
                    transactions=txs
                )

                self.stats["total_counterparties_discovered"] += len(extracted)

                valid_candidates = [c for c in extracted if c["is_valid"]]
                rejected_candidates = [c for c in extracted if not c["is_valid"]]

                self.stats["total_rejected"] += len(rejected_candidates)
                self.stats["total_surviving_candidates"] += len(valid_candidates)

                # 4. Profile surviving candidates
                for cand in valid_candidates[:max_candidates_per_seed]:
                    if self.stop_requested:
                        break

                    cand_addr = cand["address"]
                    cand_chain = cand["chain"].lower()

                    try:
                        # Fetch candidate's own transaction activity
                        if cand_chain == "tron":
                            cand_txs = await self.tron_provider.get_address_activity(cand_addr, max_tx=40)
                        else:
                            cand_txs = await self.eth_provider.get_address_activity(cand_addr, max_tx=40)
                    except Exception as e:
                        logger.warning(f"Could not fetch activity for candidate {cand_addr}: {e}")
                        cand_txs = cand["transactions"]

                    # If API gave no txs, fallback to observed seed tx
                    if not cand_txs:
                        cand_txs = cand["transactions"]

                    # Profile and calculate Candidate Quality Score
                    profile = self.miner.analyze_candidate_profile(cand, cand_txs)

                    # Persist to database
                    await self._upsert_candidate(profile)

                    hop = profile.get("min_hop_to_vasp", 1)
                    if hop == 1:
                        self.stats["hop_1_count"] += 1
                    elif hop == 2:
                        self.stats["hop_2_count"] += 1
                    elif hop >= 3:
                        self.stats["hop_3_count"] += 1

                self.stats["last_updated"] = datetime.now(timezone.utc).isoformat()
                await asyncio.sleep(0.1)

            logger.info("Candidate Discovery sweep completed successfully.")

        except Exception as e:
            logger.error(f"Error during candidate discovery cycle: {e}", exc_info=True)
        finally:
            self.is_running = False
            self.stats["is_running"] = False
            self.stats["last_updated"] = datetime.now(timezone.utc).isoformat()

    async def _upsert_candidate(self, profile: Dict[str, Any]):
        """Inserts or updates a CandidateWallet record in the database."""
        async with AsyncSessionLocal() as session:
            try:
                # Check if existing
                stmt = select(CandidateWallet).where(
                    CandidateWallet.chain == profile["chain"],
                    CandidateWallet.address == profile["address"]
                )
                res = await session.execute(stmt)
                existing = res.scalar_one_or_none()

                if existing:
                    existing.transaction_count = profile["transaction_count"]
                    existing.token_transfers_count = profile["token_transfers_count"]
                    existing.unique_counterparties_count = profile["unique_counterparties_count"]
                    existing.usdt_volume = profile["usdt_volume"]
                    existing.usdc_volume = profile["usdc_volume"]
                    existing.total_volume_usd = profile["total_volume_usd"]
                    existing.first_activity = profile["first_activity"]
                    existing.latest_activity = profile["latest_activity"]
                    existing.active_days = profile["active_days"]
                    existing.incoming_tx_count = profile["incoming_tx_count"]
                    existing.outgoing_tx_count = profile["outgoing_tx_count"]
                    existing.incoming_volume = profile["incoming_volume"]
                    existing.outgoing_volume = profile["outgoing_volume"]
                    existing.reachable_vasps_json = profile["reachable_vasps_json"]
                    existing.min_hop_to_vasp = profile["min_hop_to_vasp"]
                    existing.reachable_vasp_count = profile["reachable_vasp_count"]
                    existing.total_paths_to_vasps = profile["total_paths_to_vasps"]
                    existing.candidate_quality_score = profile["candidate_quality_score"]
                    existing.quality_breakdown_json = profile["quality_breakdown_json"]
                    existing.status = profile["status"]
                    existing.last_analyzed_at = datetime.now(timezone.utc)
                else:
                    new_cand = CandidateWallet(
                        address=profile["address"],
                        chain=profile["chain"],
                        discovery_source=profile["discovery_source"],
                        discovery_vasp_name=profile["discovery_vasp_name"],
                        discovery_vasp_address=profile["discovery_vasp_address"],
                        discovered_from_tx_hash=profile["discovered_from_tx_hash"],
                        discovered_at=datetime.now(timezone.utc),
                        last_analyzed_at=datetime.now(timezone.utc),
                        transaction_count=profile["transaction_count"],
                        token_transfers_count=profile["token_transfers_count"],
                        unique_counterparties_count=profile["unique_counterparties_count"],
                        usdt_volume=profile["usdt_volume"],
                        usdc_volume=profile["usdc_volume"],
                        total_volume_usd=profile["total_volume_usd"],
                        first_activity=profile["first_activity"],
                        latest_activity=profile["latest_activity"],
                        active_days=profile["active_days"],
                        incoming_tx_count=profile["incoming_tx_count"],
                        outgoing_tx_count=profile["outgoing_tx_count"],
                        incoming_volume=profile["incoming_volume"],
                        outgoing_volume=profile["outgoing_volume"],
                        reachable_vasps_json=profile["reachable_vasps_json"],
                        min_hop_to_vasp=profile["min_hop_to_vasp"],
                        reachable_vasp_count=profile["reachable_vasp_count"],
                        total_paths_to_vasps=profile["total_paths_to_vasps"],
                        candidate_quality_score=profile["candidate_quality_score"],
                        quality_breakdown_json=profile["quality_breakdown_json"],
                        status=profile["status"],
                        rejection_reason=profile.get("rejection_reason")
                    )
                    session.add(new_cand)

                await session.commit()
            except Exception as e:
                await session.rollback()
                logger.error(f"Error persisting candidate {profile.get('address')}: {e}")

    def stop(self):
        """Requests running discovery worker to stop."""
        self.stop_requested = True


# Global singleton worker instance
candidate_worker = CandidateDiscoveryWorker()
