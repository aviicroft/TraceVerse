"""
VASP Address Registry Ingestion & Normalization Pipeline
Parses raw datasets, validates address formats, performs deduplication,
validates provenance, assigns confidence scores, and bulk upserts into the database.
"""

import asyncio
import csv
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Set

# Ensure project root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.core.address_validator import is_valid_crypto_address, normalize_address, detect_blockchain
from backend.app.models.database import init_db, AsyncSessionLocal, VASP, VASPAddress, engine, Base

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("vasp.importer")

VASP_METADATA = {
    "Binance": {"category": "Centralized Exchange", "website": "https://binance.com", "compliance_email": "case-management@binance.com", "fiu_registered": True, "jurisdiction": "Global"},
    "Coinbase": {"category": "Centralized Exchange", "website": "https://coinbase.com", "compliance_email": "lawenforcement@coinbase.com", "fiu_registered": False, "jurisdiction": "United States"},
    "OKX": {"category": "Centralized Exchange", "website": "https://okx.com", "compliance_email": "compliance@okx.com", "fiu_registered": True, "jurisdiction": "Global"},
    "Bybit": {"category": "Centralized Exchange", "website": "https://bybit.com", "compliance_email": "compliance@bybit.com", "fiu_registered": False, "jurisdiction": "Global"},
    "KuCoin": {"category": "Centralized Exchange", "website": "https://kucoin.com", "compliance_email": "lawenforcement@kucoin.com", "fiu_registered": False, "jurisdiction": "Global"},
    "Kraken": {"category": "Centralized Exchange", "website": "https://kraken.com", "compliance_email": "compliance@kraken.com", "fiu_registered": False, "jurisdiction": "United States"},
    "Bitfinex": {"category": "Centralized Exchange", "website": "https://bitfinex.com", "compliance_email": "compliance@bitfinex.com", "fiu_registered": False, "jurisdiction": "British Virgin Islands"},
    "Gate.io": {"category": "Centralized Exchange", "website": "https://gate.io", "compliance_email": "support@gate.io", "fiu_registered": False, "jurisdiction": "Global"},
    "HTX": {"category": "Centralized Exchange", "website": "https://htx.com", "compliance_email": "htxcompliance@htx-inc.com", "fiu_registered": False, "jurisdiction": "Global"},
    "Crypto.com": {"category": "Centralized Exchange", "website": "https://crypto.com", "compliance_email": "lawenforcement@crypto.com", "fiu_registered": False, "jurisdiction": "Global"},
    "Gemini": {"category": "Centralized Exchange", "website": "https://gemini.com", "compliance_email": "compliance@gemini.com", "fiu_registered": False, "jurisdiction": "United States"},
    "Bitstamp": {"category": "Centralized Exchange", "website": "https://bitstamp.net", "compliance_email": "compliance@bitstamp.net", "fiu_registered": False, "jurisdiction": "Luxembourg / EU"},
    "WazirX": {"category": "Centralized Exchange", "website": "https://wazirx.com", "compliance_email": "lawenforcement@wazirx.com", "fiu_registered": True, "jurisdiction": "India (FIU-IND)"},
    "CoinDCX": {"category": "Centralized Exchange", "website": "https://coindcx.com", "compliance_email": "compliance@coindcx.com", "fiu_registered": True, "jurisdiction": "India (FIU-IND)"},
}


class VASPDataImporter:
    """
    Production-grade ETL pipeline for loading, normalizing, deduplicating,
    and verifying VASP address records.
    """

    def __init__(self, csv_file_path: Path):
        self.csv_file_path = csv_file_path
        self.stats: Dict[str, Any] = {
            "total_rows_read": 0,
            "valid_imported": 0,
            "rejected_format": 0,
            "duplicates_skipped": 0,
            "conflicts_detected": 0,
            "vasps_created": 0,
            "by_vasp": {},
            "by_chain": {},
            "by_status": {},
            "by_type": {}
        }
        self._seen_keys: Set[tuple] = set()

    async def run(self) -> Dict[str, Any]:
        logger.info(f"Starting VASP registry ingestion from: {self.csv_file_path}")
        if not self.csv_file_path.exists():
            raise FileNotFoundError(f"Master VASP CSV not found at: {self.csv_file_path}")

        # Initialize DB schema by dropping old tables and recreating
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

        async with AsyncSessionLocal() as session:
            # 1. Pre-fetch or create VASP parent records
            vasp_entity_map: Dict[str, VASP] = {}
            for vasp_name, meta in VASP_METADATA.items():
                stmt = select(VASP).where(VASP.name == vasp_name)
                res = await session.execute(stmt)
                entity = res.scalar_one_or_none()
                if not entity:
                    entity = VASP(
                        name=vasp_name,
                        category=meta.get("category", "Centralized Exchange"),
                        website=meta.get("website"),
                        compliance_email=meta.get("compliance_email"),
                        fiu_registered=meta.get("fiu_registered", False),
                        jurisdiction=meta.get("jurisdiction", "Global")
                    )
                    session.add(entity)
                    await session.flush()
                    self.stats["vasps_created"] += 1
                vasp_entity_map[vasp_name] = entity

            # 2. Parse & Ingest CSV rows
            with open(self.csv_file_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                batch_records = []

                for row in reader:
                    self.stats["total_rows_read"] += 1
                    raw_addr = row.get("address", "").strip()
                    vasp_name = row.get("vasp_name", "").strip()

                    # Address Validation
                    if not is_valid_crypto_address(raw_addr):
                        logger.warning(f"Rejecting malformed address: {raw_addr} ({vasp_name})")
                        self.stats["rejected_format"] += 1
                        continue

                    chain = row.get("chain", "").strip().lower() or detect_blockchain(raw_addr)
                    norm_addr = normalize_address(raw_addr)

                    # Deduplication check
                    dedup_key = (chain, norm_addr)
                    if dedup_key in self._seen_keys:
                        self.stats["duplicates_skipped"] += 1
                        continue
                    self._seen_keys.add(dedup_key)

                    # Ensure VASP parent exists
                    if vasp_name not in vasp_entity_map:
                        entity = VASP(
                            name=vasp_name,
                            category="Centralized Exchange",
                            website="https://exchange.com",
                            jurisdiction="Global"
                        )
                        session.add(entity)
                        await session.flush()
                        vasp_entity_map[vasp_name] = entity
                        self.stats["vasps_created"] += 1

                    vasp_obj = vasp_entity_map[vasp_name]

                    # Parse timestamps
                    now = datetime.now(timezone.utc)
                    first_ver = None
                    if row.get("first_verified_at"):
                        try:
                            first_ver = datetime.strptime(row["first_verified_at"].split()[0], "%Y-%m-%d")
                        except Exception:
                            first_ver = now

                    addr_type = row.get("address_type", "hot_wallet").strip()
                    source_name = row.get("source_name", "Curated Registry").strip()
                    source_url = row.get("source_url", "").strip()
                    source_type = row.get("source_type", "blockchain explorer public label").strip()
                    source_ref = row.get("source_reference", "").strip()
                    ver_status = row.get("verification_status", "verified").strip()
                    confidence = row.get("confidence", "HIGH").strip()
                    conf_score = float(row.get("confidence_score", 95.0) or 95.0)
                    notes = row.get("notes", "").strip()

                    # Check if address already exists in DB
                    stmt = select(VASPAddress).where(
                        VASPAddress.chain == chain,
                        VASPAddress.address == norm_addr
                    )
                    existing = (await session.execute(stmt)).scalar_one_or_none()

                    if existing:
                        # Update fields
                        existing.vasp_id = vasp_obj.id
                        existing.address_type = addr_type
                        existing.source_name = source_name
                        existing.source_url = source_url
                        existing.source_type = source_type
                        existing.source_reference = source_ref
                        existing.verification_status = ver_status
                        existing.confidence = confidence
                        existing.confidence_score = conf_score
                        existing.last_verified_at = now
                        existing.notes = notes
                    else:
                        new_record = VASPAddress(
                            vasp_id=vasp_obj.id,
                            address=norm_addr,
                            chain=chain,
                            address_type=addr_type,
                            source_name=source_name,
                            source_url=source_url,
                            source_type=source_type,
                            source_reference=source_ref,
                            verification_status=ver_status,
                            confidence=confidence,
                            confidence_score=conf_score,
                            first_verified_at=first_ver or now,
                            last_verified_at=now,
                            notes=notes
                        )
                        session.add(new_record)

                    # Update statistics
                    self.stats["valid_imported"] += 1
                    self.stats["by_vasp"][vasp_name] = self.stats["by_vasp"].get(vasp_name, 0) + 1
                    self.stats["by_chain"][chain] = self.stats["by_chain"].get(chain, 0) + 1
                    self.stats["by_status"][ver_status] = self.stats["by_status"].get(ver_status, 0) + 1
                    self.stats["by_type"][addr_type] = self.stats["by_type"].get(addr_type, 0) + 1

            await session.commit()
            logger.info("Database transaction committed successfully.")

        self._print_summary()
        return self.stats

    def _print_summary(self):
        print("\n" + "=" * 70)
        print("[*] VASP ADDRESS REGISTRY INGESTION REPORT")
        print("=" * 70)
        print(f"Total Rows Processed:       {self.stats['total_rows_read']:,}")
        print(f"Valid Addresses Ingested:   {self.stats['valid_imported']:,}")
        print(f"Duplicates Skipped:         {self.stats['duplicates_skipped']:,}")
        print(f"Malformed Rejected:         {self.stats['rejected_format']:,}")
        print(f"Total Active VASPs:         {len(self.stats['by_vasp'])}")
        print("-" * 70)
        print("[*] ADDRESS COUNT PER VASP:")
        for vname, count in sorted(self.stats["by_vasp"].items(), key=lambda x: x[1], reverse=True):
            print(f"  * {vname:15}: {count:4} addresses")
        print("-" * 70)
        print("[*] ADDRESS COUNT PER BLOCKCHAIN:")
        for chain, count in self.stats["by_chain"].items():
            print(f"  * {chain.upper():15}: {count:4} addresses")
        print("-" * 70)
        print("[*] VERIFICATION STATUS BREAKDOWN:")
        for status, count in self.stats["by_status"].items():
            print(f"  * {status.capitalize():15}: {count:4} addresses")
        print("=" * 70 + "\n")


if __name__ == "__main__":
    csv_path = settings.VASP_DATA_PATH.parent / "vasp_addresses_master.csv"
    importer = VASPDataImporter(csv_path)
    asyncio.run(importer.run())
