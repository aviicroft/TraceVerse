import asyncio
import argparse
import logging
from backend.app.workers.ingestion_worker import ingestion_worker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ingestion_cli")


async def main():
    parser = argparse.ArgumentParser(description="Ingest genuine on-chain transactions for verified VASP addresses.")
    parser.add_argument("--target", type=int, default=100000, help="Target total transaction count in database")
    parser.add_argument("--max-addresses", type=int, default=None, help="Max seed addresses to process in this run")
    parser.add_argument("--rps", type=float, default=4.0, help="Max requests per second")
    args = parser.parse_args()

    ingestion_worker.target_transactions = args.target
    ingestion_worker.rate_limit_delay = 1.0 / max(0.5, args.rps)

    logger.info(f"Starting ingestion to target {args.target:,} records (RPS: {args.rps})...")
    await ingestion_worker.run_pipeline(max_addresses=args.max_addresses)

    metrics = await ingestion_worker.get_db_metrics()
    print("\n" + "="*80)
    print("FINAL INGESTION METRICS SUMMARY")
    print("="*80)
    print(f"Total Transactions in DB: {metrics.get('current_transactions', 0):,}")
    print(f"Ethereum Transactions:    {metrics.get('ethereum_transactions', 0):,}")
    print(f"Tron Transactions:        {metrics.get('tron_transactions', 0):,}")
    print(f"ERC-20 Token Transfers:   {metrics.get('erc20_transactions', 0):,}")
    print(f"TRC-20 Token Transfers:   {metrics.get('trc20_transactions', 0):,}")
    print(f"USDT Transfers:           {metrics.get('usdt_transactions', 0):,}")
    print(f"Unique Counterparties:    {metrics.get('unique_counterparties', 0):,}")
    print(f"API Requests Made:        {metrics.get('api_requests_made', 0):,}")
    print(f"Duplicates Skipped:       {metrics.get('duplicate_records_skipped', 0):,}")
    print(f"Failed Requests:          {metrics.get('failed_requests', 0):,}")
    print("="*80)


if __name__ == "__main__":
    asyncio.run(main())
