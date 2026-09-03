import math
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone

from backend.app.core.config import settings

logger = logging.getLogger(__name__)


class CandidateQualityScorer:
    """
    Computes a normalized Candidate Quality Score (0.0 to 100.0)
    for unknown wallet candidates to determine suitability for investigation/demo.
    
    NOTE: This score reflects graph richness and investigation interest.
    It does NOT imply criminality, fraud, or VASP beneficial ownership.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        weights = self.config.get("weights", {})
        self.w_hist = weights.get("history_quality", 0.25)
        self.w_act = weights.get("activity_quality", 0.20)
        self.w_graph = weights.get("graph_quality", 0.20)
        self.w_conn = weights.get("vasp_connectivity", 0.20)
        self.w_flow = weights.get("flow_quality", 0.15)

    def calculate_score(
        self,
        tx_count: int,
        token_transfers_count: int,
        unique_counterparties: int,
        total_volume_usd: float,
        active_days: int,
        incoming_tx: int,
        outgoing_tx: int,
        min_hop_to_vasp: int,
        reachable_vasp_count: int,
        total_paths_to_vasps: int,
        flow_to_vasp_ratio: float = 0.5
    ) -> Dict[str, Any]:
        """
        Calculates composite quality score and detailed sub-scores (0-100).
        """
        # 1. History Quality (0-100): Depth of transaction history and active days
        # tx_count: saturates around 250 tx
        tx_score = min(100.0, (math.log1p(tx_count) / math.log1p(250)) * 100.0)
        token_score = min(100.0, (math.log1p(token_transfers_count) / math.log1p(50)) * 100.0)
        days_score = min(100.0, (math.log1p(active_days) / math.log1p(30)) * 100.0)
        history_quality = 0.50 * tx_score + 0.30 * token_score + 0.20 * days_score

        # 2. Activity Quality (0-100): Bidirectional flow and transfer frequency
        total_in_out = incoming_tx + outgoing_tx
        if total_in_out > 0:
            ratio = min(incoming_tx, outgoing_tx) / max(incoming_tx, outgoing_tx)
            balance_score = ratio * 100.0  # 100 if equal in/out, lower if 1-way
        else:
            balance_score = 30.0
        
        freq_rate = tx_count / max(1, active_days)
        freq_score = min(100.0, (freq_rate / 10.0) * 100.0)
        activity_quality = 0.60 * balance_score + 0.40 * freq_score

        # 3. Graph Quality (0-100): Counterparty breadth and peer dispersion
        cp_score = min(100.0, (math.log1p(unique_counterparties) / math.log1p(40)) * 100.0)
        dispersion = min(100.0, (unique_counterparties / max(1, tx_count)) * 150.0)
        graph_quality = 0.70 * cp_score + 0.30 * dispersion

        # 4. VASP Connectivity (0-100): Multi-hop proximity and reachable VASP count
        hop_weights = {1: 100.0, 2: 70.0, 3: 40.0}
        hop_score = hop_weights.get(min_hop_to_vasp, 20.0)
        vasp_count_score = min(100.0, reachable_vasp_count * 40.0)
        path_score = min(100.0, (total_paths_to_vasps / 5.0) * 100.0)
        vasp_connectivity = 0.50 * hop_score + 0.30 * vasp_count_score + 0.20 * path_score

        # 5. Flow Quality (0-100): Total volume and proportion connected to VASP endpoints
        vol_score = min(100.0, (math.log1p(total_volume_usd) / math.log1p(50000.0)) * 100.0)
        flow_ratio_score = min(100.0, flow_to_vasp_ratio * 100.0)
        flow_quality = 0.50 * vol_score + 0.50 * flow_ratio_score

        # Weighted Total Score
        total_score = (
            self.w_hist * history_quality +
            self.w_act * activity_quality +
            self.w_graph * graph_quality +
            self.w_conn * vasp_connectivity +
            self.w_flow * flow_quality
        )

        total_score = max(0.0, min(100.0, round(total_score, 1)))

        return {
            "candidate_quality_score": total_score,
            "breakdown": {
                "history_quality": round(history_quality, 1),
                "activity_quality": round(activity_quality, 1),
                "graph_quality": round(graph_quality, 1),
                "vasp_connectivity": round(vasp_connectivity, 1),
                "flow_quality": round(flow_quality, 1)
            },
            "metrics": {
                "transaction_count": tx_count,
                "token_transfers_count": token_transfers_count,
                "unique_counterparties": unique_counterparties,
                "total_volume_usd": round(total_volume_usd, 2),
                "active_days": active_days,
                "min_hop_to_vasp": min_hop_to_vasp,
                "reachable_vasp_count": reachable_vasp_count,
                "total_paths_to_vasps": total_paths_to_vasps
            }
        }
