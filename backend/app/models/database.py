import datetime
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Index, UniqueConstraint

from backend.app.core.config import settings

# Async engine for FastAPI
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ==============================================================================
# Database Models
# ==============================================================================

class Wallet(Base):
    __tablename__ = "wallets"

    address: Mapped[str] = mapped_column(String(100), primary_key=True, index=True)
    chain: Mapped[str] = mapped_column(String(32), default="ethereum", index=True)
    first_seen: Mapped[datetime.datetime | None] = mapped_column(DateTime, nullable=True)
    last_seen: Mapped[datetime.datetime | None] = mapped_column(DateTime, nullable=True)
    label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_contract: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tx_hash: Mapped[str] = mapped_column(String(100), index=True)
    chain: Mapped[str] = mapped_column(String(32), default="ethereum", index=True)
    block_number: Mapped[int] = mapped_column(Integer, index=True)
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime, index=True)
    from_address: Mapped[str] = mapped_column(String(100), index=True)
    to_address: Mapped[str] = mapped_column(String(100), index=True)
    asset_type: Mapped[str] = mapped_column(String(16), default="ETH")  # ETH, ERC20, TRX, TRC20
    token_address: Mapped[str | None] = mapped_column(String(100), nullable=True)
    token_symbol: Mapped[str | None] = mapped_column(String(32), nullable=True)
    token_decimals: Mapped[int | None] = mapped_column(Integer, nullable=True)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    gas_used: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_error: Mapped[bool] = mapped_column(Boolean, default=False)
    source_api: Mapped[str] = mapped_column(String(100), default="blockchain_explorer", index=True)
    ingested_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, index=True)

    __table_args__ = (
        Index("idx_tx_from_to", "from_address", "to_address"),
        Index("idx_tx_hash_chain", "tx_hash", "chain"),
        Index("idx_tx_token_contract", "token_address"),
        Index("idx_tx_timestamp", "timestamp"),
        UniqueConstraint("chain", "tx_hash", "token_address", "from_address", "to_address", name="uq_chain_tx_transfer")
    )


class VASP(Base):
    __tablename__ = "vasps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(50), default="Centralized Exchange")
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    jurisdiction: Mapped[str | None] = mapped_column(String(100), nullable=True)
    compliance_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    fiu_registered: Mapped[bool] = mapped_column(Boolean, default=False)
    risk_rating: Mapped[str] = mapped_column(String(20), default="LOW")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    addresses: Mapped[list["VASPAddress"]] = relationship("VASPAddress", back_populates="vasp", cascade="all, delete-orphan")


class VASPAddress(Base):
    __tablename__ = "vasp_addresses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vasp_id: Mapped[int] = mapped_column(Integer, ForeignKey("vasps.id"), index=True)
    address: Mapped[str] = mapped_column(String(100), index=True)
    chain: Mapped[str] = mapped_column(String(32), default="ethereum", index=True)
    address_type: Mapped[str] = mapped_column(String(50), default="hot_wallet", index=True)  # hot_wallet, cold_storage, deposit, withdrawal, treasury, unknown
    source_name: Mapped[str] = mapped_column(String(150), index=True)  # e.g. "DefiLlama Proof of Reserves"
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source_type: Mapped[str] = mapped_column(String(100), default="blockchain explorer public label")  # VASP official source, blockchain explorer public label, public entity database
    source_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    verification_status: Mapped[str] = mapped_column(String(32), default="verified", index=True)  # verified, publicly_labeled, unverified
    confidence: Mapped[str] = mapped_column(String(20), default="HIGH")  # HIGH, MEDIUM, LOW
    confidence_score: Mapped[float] = mapped_column(Float, default=95.0)
    first_verified_at: Mapped[datetime.datetime | None] = mapped_column(DateTime, nullable=True)
    last_verified_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    vasp: Mapped["VASP"] = relationship("VASP", back_populates="addresses")

    __table_args__ = (
        Index("idx_chain_address", "chain", "address"),
        UniqueConstraint("chain", "address", name="uq_chain_address")
    )


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # UUID
    wallet_address: Mapped[str] = mapped_column(String(100), index=True)
    max_hops: Mapped[int] = mapped_column(Integer, default=3)
    status: Mapped[str] = mapped_column(String(32), default="QUEUED", index=True)  # QUEUED, FETCHING_DATA, BUILDING_GRAPH, ANALYZING, COMPLETED, FAILED
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    completed_at: Mapped[datetime.datetime | None] = mapped_column(DateTime, nullable=True)
    num_transactions: Mapped[int] = mapped_column(Integer, default=0)
    num_nodes: Mapped[int] = mapped_column(Integer, default=0)
    num_edges: Mapped[int] = mapped_column(Integer, default=0)

    attributions: Mapped[list["Attribution"]] = relationship("Attribution", back_populates="analysis", cascade="all, delete-orphan")
    evidence: Mapped[list["Evidence"]] = relationship("Evidence", back_populates="analysis", cascade="all, delete-orphan")
    risk_assessment: Mapped["RiskAssessment | None"] = relationship("RiskAssessment", back_populates="analysis", uselist=False, cascade="all, delete-orphan")


class Attribution(Base):
    __tablename__ = "attributions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    analysis_id: Mapped[str] = mapped_column(String(36), ForeignKey("analysis_runs.id"), index=True)
    vasp_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("vasps.id"), nullable=True)
    vasp_name: Mapped[str] = mapped_column(String(100))
    score: Mapped[float] = mapped_column(Float)  # 0.0 to 100.0
    evidence_strength: Mapped[str] = mapped_column(String(20))  # High, Medium, Low
    rank: Mapped[int] = mapped_column(Integer, default=1)
    summary: Mapped[str] = mapped_column(Text)
    metrics_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    analysis: Mapped["AnalysisRun"] = relationship("AnalysisRun", back_populates="attributions")


class Evidence(Base):
    __tablename__ = "evidence"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    analysis_id: Mapped[str] = mapped_column(String(36), ForeignKey("analysis_runs.id"), index=True)
    evidence_type: Mapped[str] = mapped_column(String(50))  # Graph proximity, Fund flow, Interaction frequency, Behavioral pattern
    source_address: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target_address: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tx_hash: Mapped[str | None] = mapped_column(String(100), nullable=True)
    hop_distance: Mapped[int | None] = mapped_column(Integer, nullable=True)
    amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    asset_symbol: Mapped[str | None] = mapped_column(String(32), nullable=True)
    explanation: Mapped[str] = mapped_column(Text)
    strength: Mapped[str] = mapped_column(String(20), default="MEDIUM")  # HIGH, MEDIUM, LOW

    analysis: Mapped["AnalysisRun"] = relationship("AnalysisRun", back_populates="evidence")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    analysis_id: Mapped[str] = mapped_column(String(36), ForeignKey("analysis_runs.id"), unique=True, index=True)
    risk_level: Mapped[str] = mapped_column(String(20))  # LOW, MEDIUM, HIGH
    score: Mapped[float] = mapped_column(Float, default=0.0)  # 0.0 to 100.0
    indicators_json: Mapped[str] = mapped_column(Text)  # JSON list of observed indicators
    explanation: Mapped[str] = mapped_column(Text)

    analysis: Mapped["AnalysisRun"] = relationship("AnalysisRun", back_populates="risk_assessment")


class CandidateWallet(Base):
    __tablename__ = "candidate_wallets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    address: Mapped[str] = mapped_column(String(100), index=True)
    chain: Mapped[str] = mapped_column(String(32), default="ethereum", index=True)
    
    # Provenance Tracking
    discovery_source: Mapped[str] = mapped_column(String(100), default="vasp_counterparty_miner", index=True)
    discovery_vasp_name: Mapped[str] = mapped_column(String(100), index=True)
    discovery_vasp_address: Mapped[str] = mapped_column(String(100), index=True)
    discovered_from_tx_hash: Mapped[str | None] = mapped_column(String(100), nullable=True)
    discovered_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    last_analyzed_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, index=True)

    # Activity & Ledger Metrics
    transaction_count: Mapped[int] = mapped_column(Integer, default=0, index=True)
    token_transfers_count: Mapped[int] = mapped_column(Integer, default=0)
    unique_counterparties_count: Mapped[int] = mapped_column(Integer, default=0)
    usdt_volume: Mapped[float] = mapped_column(Float, default=0.0)
    usdc_volume: Mapped[float] = mapped_column(Float, default=0.0)
    total_volume_usd: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Temporal Dynamics
    first_activity: Mapped[datetime.datetime | None] = mapped_column(DateTime, nullable=True)
    latest_activity: Mapped[datetime.datetime | None] = mapped_column(DateTime, nullable=True)
    active_days: Mapped[int] = mapped_column(Integer, default=1)
    incoming_tx_count: Mapped[int] = mapped_column(Integer, default=0)
    outgoing_tx_count: Mapped[int] = mapped_column(Integer, default=0)
    incoming_volume: Mapped[float] = mapped_column(Float, default=0.0)
    outgoing_volume: Mapped[float] = mapped_column(Float, default=0.0)

    # VASP Graph & Multi-Hop Connections
    reachable_vasps_json: Mapped[str] = mapped_column(Text, default="[]")  # List of reachable VASP summaries
    min_hop_to_vasp: Mapped[int] = mapped_column(Integer, default=1, index=True)
    reachable_vasp_count: Mapped[int] = mapped_column(Integer, default=1)
    total_paths_to_vasps: Mapped[int] = mapped_column(Integer, default=1)

    # Quality Scoring & Classification (0.0 to 100.0)
    candidate_quality_score: Mapped[float] = mapped_column(Float, default=0.0, index=True)
    quality_breakdown_json: Mapped[str] = mapped_column(Text, default="{}")
    status: Mapped[str] = mapped_column(String(32), default="investigation_ready", index=True)  # investigation_ready, insufficient_activity, incomplete_data, filtered
    rejection_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)

    __table_args__ = (
        Index("idx_cand_chain_addr", "chain", "address"),
        Index("idx_cand_quality", "candidate_quality_score", "status"),
        UniqueConstraint("chain", "address", name="uq_cand_chain_address")
    )

