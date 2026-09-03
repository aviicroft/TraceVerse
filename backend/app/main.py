import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from backend.app.core.config import settings
from backend.app.models.database import init_db, AsyncSessionLocal
from backend.app.services.vasp.matcher import vasp_matcher
from backend.app.api.v1.router import api_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SIH Crypto Attribution Intelligence Service...")
    # 1. Initialize DB schema
    await init_db()
    
    # 2. Load VASP seed database
    loaded_count = vasp_matcher.load_seed_data()
    logger.info(f"Loaded {loaded_count} verified VASP addresses into memory cache.")
    
    # 3. Synchronize VASP records to relational database
    try:
        async with AsyncSessionLocal() as session:
            await vasp_matcher.sync_to_database(session)
    except Exception as e:
        logger.warning(f"Database VASP sync notice: {e}")

    # 4. Seed discovered candidate wallets if database table is empty
    try:
        from backend.app.models.database import CandidateWallet
        from sqlalchemy import select, func
        import json
        from pathlib import Path
        from datetime import datetime, timezone

        seed_file = Path(__file__).resolve().parent.parent.parent / "data" / "candidates" / "discovered_candidates_seed.json"
        if seed_file.exists():
            async with AsyncSessionLocal() as session:
                cand_count = await session.scalar(select(func.count(CandidateWallet.id))) or 0
                if cand_count == 0:
                    with open(seed_file, "r", encoding="utf-8") as f:
                        cand_items = json.load(f)
                    for item in cand_items:
                        cand = CandidateWallet(
                            address=item["address"],
                            chain=item["chain"],
                            discovery_source=item.get("discovery_source", "vasp_counterparty_mining"),
                            discovery_vasp_name=item["discovery_vasp_name"],
                            discovery_vasp_address=item["discovery_vasp_address"],
                            discovered_from_tx_hash=item.get("discovered_from_tx_hash"),
                            discovered_at=datetime.fromisoformat(item["discovered_at"]) if item.get("discovered_at") else datetime.now(timezone.utc),
                            last_analyzed_at=datetime.fromisoformat(item["last_analyzed_at"]) if item.get("last_analyzed_at") else datetime.now(timezone.utc),
                            transaction_count=item["transaction_count"],
                            token_transfers_count=item.get("token_transfers_count", 0),
                            unique_counterparties_count=item["unique_counterparties_count"],
                            usdt_volume=item.get("usdt_volume", 0.0),
                            usdc_volume=item.get("usdc_volume", 0.0),
                            total_volume_usd=item["total_volume_usd"],
                            first_activity=datetime.fromisoformat(item["first_activity"]) if item.get("first_activity") else None,
                            latest_activity=datetime.fromisoformat(item["latest_activity"]) if item.get("latest_activity") else None,
                            active_days=item.get("active_days", 1),
                            incoming_tx_count=item.get("incoming_tx_count", 0),
                            outgoing_tx_count=item.get("outgoing_tx_count", 0),
                            incoming_volume=item.get("incoming_volume", 0.0),
                            outgoing_volume=item.get("outgoing_volume", 0.0),
                            reachable_vasps_json=item.get("reachable_vasps_json", "[]"),
                            min_hop_to_vasp=item.get("min_hop_to_vasp", 1),
                            reachable_vasp_count=item.get("reachable_vasp_count", 1),
                            total_paths_to_vasps=item.get("total_paths_to_vasps", 1),
                            candidate_quality_score=item["candidate_quality_score"],
                            quality_breakdown_json=item.get("quality_breakdown_json", "{}"),
                            status=item.get("status", "investigation_ready"),
                            rejection_reason=item.get("rejection_reason")
                        )
                        session.add(cand)
                    await session.commit()
                    logger.info(f"Auto-seeded {len(cand_items)} verified on-chain candidate wallets.")
    except Exception as e:
        logger.warning(f"Candidate wallet auto-seed notice: {e}")
        
    yield
    logger.info("Shutting down service...")


app = FastAPI(
    title="Cryptocurrency Wallet-to-VASP Attribution Engine",
    description="Automated attribution of unknown cryptocurrency wallets to nearest Virtual Asset Service Providers (VASPs) through real blockchain intelligence APIs.",
    version="1.0.0",
    lifespan=lifespan
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "title": "SIH Cryptocurrency Wallet-to-VASP Attribution Platform",
        "version": "1.0.0",
        "docs_url": "/docs",
        "judge_docs_url": "/judge-docs",
        "api_prefix": "/api/v1",
        "blockchain": "Ethereum Mainnet",
        "max_hops": settings.MAX_HOPS
    }


@app.get("/judge-docs", include_in_schema=False)
@app.get("/docs.html", include_in_schema=False)
async def serve_judge_docs():
    docs_path = Path(__file__).resolve().parent.parent.parent / "docs.html"
    if docs_path.exists():
        return FileResponse(docs_path, media_type="text/html")
    return {"error": "docs.html not found"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
