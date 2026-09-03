from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from backend.app.core.address_validator import is_valid_eth_address, normalize_eth_address


# ==============================================================================
# Request Schemas
# ==============================================================================

class AnalyzeRequest(BaseModel):
    wallet_address: str = Field(..., description="Ethereum wallet address (0x...)")
    max_hops: int = Field(default=3, ge=1, le=3, description="Maximum traversal depth (1 to 3)")

    @field_validator("wallet_address")
    @classmethod
    def validate_address(cls, v: str) -> str:
        if not is_valid_eth_address(v):
            raise ValueError(f"Invalid Ethereum address: {v}. Must be a 42-character hex address starting with 0x.")
        return normalize_eth_address(v)


# ==============================================================================
# Transaction & Blockchain DTOs
# ==============================================================================

class NormalizedTransaction(BaseModel):
    tx_hash: str
    chain: str = "ethereum"
    block_number: int
    timestamp: datetime
    from_address: str
    to_address: str
    asset_type: str  # ETH or ERC20
    token_address: Optional[str] = None
    token_symbol: Optional[str] = "ETH"
    token_decimals: Optional[int] = 18
    amount: float
    amount_usd_if_available: Optional[float] = None
    gas_used: Optional[int] = None
    is_error: bool = False
    hop: Optional[int] = None
    direction: Optional[str] = None  # INCOMING or OUTGOING relative to wallet


# ==============================================================================
# Graph Visualization Schemas (Cytoscape-compatible)
# ==============================================================================

class GraphNodeData(BaseModel):
    id: str
    label: str
    address: str
    role: str  # INPUT_WALLET, INTERMEDIARY_HOP_1, INTERMEDIARY_HOP_2, INTERMEDIARY_HOP_3, KNOWN_VASP, EXTERNAL
    hop: int
    is_vasp: bool = False
    vasp_name: Optional[str] = None
    vasp_confidence: Optional[str] = None
    address_type: Optional[str] = None
    tx_count: int = 0
    total_inflow: float = 0.0
    total_outflow: float = 0.0
    is_contract: bool = False


class GraphNode(BaseModel):
    data: GraphNodeData


class GraphEdgeData(BaseModel):
    id: str
    source: str
    target: str
    tx_hash: str
    asset_symbol: str
    amount: float
    timestamp: datetime
    hop: int


class GraphEdge(BaseModel):
    data: GraphEdgeData


class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    stats: Dict[str, Any]


# ==============================================================================
# Attribution & Evidence Schemas
# ==============================================================================

class EvidenceSchema(BaseModel):
    id: Optional[int] = None
    evidence_type: str
    source_address: Optional[str] = None
    target_address: Optional[str] = None
    tx_hash: Optional[str] = None
    hop_distance: Optional[int] = None
    amount: Optional[float] = None
    asset_symbol: Optional[str] = None
    explanation: str
    strength: str  # HIGH, MEDIUM, LOW


class AttributionScoreBreakdown(BaseModel):
    graph_proximity_score: float
    fund_flow_score: float
    interaction_frequency_score: float
    behavioral_pattern_score: float
    recency_score: float
    total_weighted_score: float


class AttributionSchema(BaseModel):
    id: Optional[int] = None
    vasp_name: str
    score: float  # 0.0 - 100.0
    evidence_strength: str  # High, Medium, Low
    rank: int
    summary: str
    metrics: Optional[Dict[str, Any]] = None


class RiskAssessmentSchema(BaseModel):
    risk_level: str  # LOW, MEDIUM, HIGH
    score: float
    indicators: List[str]
    explanation: str


# ==============================================================================
# Analysis Run & Status Responses
# ==============================================================================

class AnalysisStatusResponse(BaseModel):
    analysis_id: str
    wallet_address: str
    status: str  # QUEUED, FETCHING_DATA, BUILDING_GRAPH, ANALYZING, COMPLETED, FAILED
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    num_transactions: int = 0
    num_nodes: int = 0
    num_edges: int = 0
    top_attribution: Optional[AttributionSchema] = None
    risk_assessment: Optional[RiskAssessmentSchema] = None


class AnalysisDetailResponse(BaseModel):
    analysis_id: str
    wallet_address: str
    status: str
    max_hops: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    stats: Dict[str, Any]
    attributions: List[AttributionSchema]
    evidence: List[EvidenceSchema]
    risk_assessment: Optional[RiskAssessmentSchema]
    graph: Optional[GraphData] = None


# ==============================================================================
# Investigation Report Schema
# ==============================================================================

class InvestigationReportSchema(BaseModel):
    case_id: str
    input_wallet: str
    chain: str = "Ethereum Mainnet"
    analysis_timestamp: datetime
    data_sources: List[str]
    summary_metrics: Dict[str, Any]
    top_attribution: Optional[AttributionSchema]
    all_attributions: List[AttributionSchema]
    key_evidence: List[EvidenceSchema]
    risk_assessment: Optional[RiskAssessmentSchema]
    critical_transactions: List[Dict[str, Any]]
    methodology_summary: str
    limitations: List[str]
    legal_disclaimer: str


# ==============================================================================
# VASP Schemas
# ==============================================================================

class VASPAddressSchema(BaseModel):
    address: str
    chain: str = "ethereum"
    address_type: str
    source: str
    confidence: str
    notes: Optional[str] = None


class VASPSchema(BaseModel):
    name: str
    category: str
    website: Optional[str] = None
    risk_rating: str
    notes: Optional[str] = None
    addresses: List[VASPAddressSchema] = []


# ==============================================================================
# Candidate Wallet Discovery Schemas
# ==============================================================================

class ReachableVASPSummary(BaseModel):
    name: str
    min_hop: int
    direct_tx_count: int = 0
    flow_volume_usd: float = 0.0
    paths_count: int = 1


class CandidateQualityBreakdown(BaseModel):
    history_quality: float
    activity_quality: float
    graph_quality: float
    vasp_connectivity: float
    flow_quality: float


class CandidateWalletSchema(BaseModel):
    id: int
    address: str
    chain: str
    discovery_source: str
    discovery_vasp_name: str
    discovery_vasp_address: str
    discovered_from_tx_hash: Optional[str] = None
    discovered_at: datetime
    last_analyzed_at: datetime
    transaction_count: int
    token_transfers_count: int
    unique_counterparties_count: int
    usdt_volume: float
    usdc_volume: float
    total_volume_usd: float
    first_activity: Optional[datetime] = None
    latest_activity: Optional[datetime] = None
    active_days: int
    incoming_tx_count: int
    outgoing_tx_count: int
    incoming_volume: float
    outgoing_volume: float
    reachable_vasps: List[ReachableVASPSummary]
    min_hop_to_vasp: int
    reachable_vasp_count: int
    total_paths_to_vasps: int
    candidate_quality_score: float
    quality_breakdown: Optional[CandidateQualityBreakdown] = None
    status: str
    rejection_reason: Optional[str] = None


class CandidateStatsSchema(BaseModel):
    total_candidates_stored: int
    investigation_ready_count: int
    hop_1_count: int
    hop_2_count: int
    hop_3_count: int
    average_quality_score: float
    is_running: bool
    vasp_seeds_processed: int
    total_counterparties_discovered: int
    total_rejected: int
    last_processed_address: Optional[str] = None
    last_updated: str

