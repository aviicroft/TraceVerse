import asyncio
import logging
from backend.app.models.database import init_db
from backend.app.workers.candidate_discovery_worker import candidate_worker

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)


async def main():
    logger.info("Initializing database tables for candidate discovery...")
    await init_db()

    logger.info("Triggering real on-chain Candidate Discovery sweep across VASP seeds...")
    # Sweep across top 15 VASP seeds (Binance, OKX, Gate.io, Coinbase, etc.)
    await candidate_worker.run_discovery_cycle(max_seeds=15, max_candidates_per_seed=12)

    stats = await candidate_worker.get_stats()
    logger.info("Candidate Discovery sweep finished!")
    logger.info(f"Summary Stats: {stats}")


if __name__ == "__main__":
    asyncio.run(main())
