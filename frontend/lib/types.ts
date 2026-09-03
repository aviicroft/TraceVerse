export interface NormalizedTransaction {
  tx_hash: string;
  chain: string;
  block_number: number;
  timestamp: string;
  from_address: string;
  to_address: string;
  asset_type: string;
  token_address?: string | null;
  token_symbol: string;
  token_decimals: number;
  amount: number;
  amount_usd_if_available?: number | null;
  gas_used?: number | null;
  is_error: boolean;
  hop?: number;
  direction?: 'INCOMING' | 'OUTGOING';
}

export interface GraphNodeData {
  id: string;
  label: string;
  address: string;
  role: 'INPUT_WALLET' | 'INTERMEDIARY_HOP_1' | 'INTERMEDIARY_HOP_2' | 'INTERMEDIARY_HOP_3' | 'KNOWN_VASP' | 'EXTERNAL';
  hop: number;
  is_vasp: boolean;
  vasp_name?: string | null;
  vasp_confidence?: string | null;
  address_type?: string | null;
  tx_count: number;
  total_inflow: number;
  total_outflow: number;
  is_contract?: boolean;
}

export interface GraphNode {
  data: GraphNodeData;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  tx_hash: string;
  asset_symbol: string;
  amount: number;
  timestamp: string;
  hop: number;
}

export interface GraphEdge {
  data: GraphEdgeData;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    root_wallet: string;
    total_nodes: number;
    total_edges: number;
    vasp_nodes_found: number;
    max_hop_reached: number;
  };
}

export interface Attribution {
  id?: number;
  vasp_name: string;
  score: number;
  evidence_strength: 'High' | 'Medium' | 'Low';
  rank: number;
  summary: string;
  metrics?: {
    shortest_hop: number;
    total_cluster_flow: number;
    total_interactions: number;
    breakdown: {
      proximity_score: number;
      flow_score: number;
      frequency_score: number;
      behavioral_score: number;
      recency_score: number;
    };
  };
}

export interface EvidenceItem {
  id?: number;
  evidence_type: string;
  source_address?: string | null;
  target_address?: string | null;
  tx_hash?: string | null;
  hop_distance?: number | null;
  amount?: number | null;
  asset_symbol?: string | null;
  explanation: string;
  strength: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface RiskAssessment {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;
  indicators: string[];
  explanation: string;
}

export interface AnalysisStatus {
  analysis_id: string;
  wallet_address: string;
  status: 'QUEUED' | 'FETCHING_DATA' | 'BUILDING_GRAPH' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  error_message?: string | null;
  started_at: string;
  completed_at?: string | null;
  num_transactions: number;
  num_nodes: number;
  num_edges: number;
  top_attribution?: Attribution | null;
  risk_assessment?: RiskAssessment | null;
}

export interface VASPAddress {
  address: string;
  chain: string;
  address_type: string;
  source: string;
  confidence: string;
  notes?: string;
}

export interface VASPItem {
  name: string;
  category: string;
  website?: string;
  risk_rating: string;
  notes?: string;
  addresses: VASPAddress[];
}

export interface InvestigationReport {
  case_id: string;
  input_wallet: string;
  chain: string;
  analysis_timestamp: string;
  data_sources: string[];
  summary_metrics: Record<string, any>;
  top_attribution?: Attribution;
  all_attributions: Attribution[];
  key_evidence: EvidenceItem[];
  risk_assessment?: RiskAssessment;
  critical_transactions: any[];
  methodology_summary: string;
  limitations: string[];
  legal_disclaimer: string;
}

export interface ReachableVASPSummary {
  name: string;
  min_hop: number;
  direct_tx_count: number;
  flow_volume_usd: number;
  paths_count: number;
}

export interface CandidateQualityBreakdown {
  history_quality: number;
  activity_quality: number;
  graph_quality: number;
  vasp_connectivity: number;
  flow_quality: number;
}

export interface CandidateWallet {
  id: number;
  address: string;
  chain: string;
  discovery_source: string;
  discovery_vasp_name: string;
  discovery_vasp_address: string;
  discovered_from_tx_hash?: string | null;
  discovered_at: string;
  last_analyzed_at: string;
  transaction_count: number;
  token_transfers_count: number;
  unique_counterparties_count: number;
  usdt_volume: number;
  usdc_volume: number;
  total_volume_usd: number;
  first_activity?: string | null;
  latest_activity?: string | null;
  active_days: number;
  incoming_tx_count: number;
  outgoing_tx_count: number;
  incoming_volume: number;
  outgoing_volume: number;
  reachable_vasps: ReachableVASPSummary[];
  min_hop_to_vasp: number;
  reachable_vasp_count: number;
  total_paths_to_vasps: number;
  candidate_quality_score: number;
  quality_breakdown?: CandidateQualityBreakdown;
  status: 'investigation_ready' | 'insufficient_activity' | 'incomplete_data' | 'filtered';
  rejection_reason?: string | null;
}

export interface CandidateListResponse {
  total: number;
  limit: number;
  offset: number;
  candidates: CandidateWallet[];
}

export interface CandidateStats {
  total_candidates_stored: number;
  investigation_ready_count: number;
  hop_1_count: number;
  hop_2_count: number;
  hop_3_count: number;
  average_quality_score: number;
  is_running: boolean;
  vasp_seeds_processed: number;
  total_counterparties_discovered: number;
  total_rejected: number;
  last_processed_address?: string | null;
  last_updated: string;
}

