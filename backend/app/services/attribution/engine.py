import yaml
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
import networkx as nx

from backend.app.core.config import settings
from backend.app.schemas.analysis import AttributionSchema, AttributionScoreBreakdown
from backend.app.services.vasp.matcher import vasp_matcher

logger = logging.getLogger(__name__)


class AttributionEngine:
    """
    Transparent, explainable VASP attribution scoring engine.
    Calculates multi-dimensional heuristic attribution scores based on
    graph proximity, fund flow volume, interaction frequency, and timing.
    """

    def __init__(self, config_path: Optional[Path] = None):
        self.config_path = config_path or settings.ATTRIBUTION_CONFIG_PATH
        self.config = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        """Loads weights and decay parameters from attribution_config.yaml."""
        if not self.config_path.exists():
            return {
                "weights": {
                    "graph_proximity": 0.35,
                    "fund_flow": 0.25,
                    "interaction_frequency": 0.20,
                    "behavioral_pattern": 0.10,
                    "recency": 0.10
                },
                "hop_decay_factors": {"hop_1": 1.0, "hop_2": 0.60, "hop_3": 0.30},
                "thresholds": {"high_confidence_score": 75.0, "medium_confidence_score": 45.0}
            }

        with open(self.config_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)

    def calculate_attributions(
        self, 
        graph: nx.MultiDiGraph, 
        root_wallet: str
    ) -> List[AttributionSchema]:
        """
        Evaluates graph paths from root_wallet to all reached VASP nodes,
        scoring each candidate VASP cluster.
        """
        weights = self.config.get("weights", {})
        hop_decay = self.config.get("hop_decay_factors", {})
        thresholds = self.config.get("thresholds", {})

        w_prox = weights.get("graph_proximity", 0.35)
        w_flow = weights.get("fund_flow", 0.25)
        w_freq = weights.get("interaction_frequency", 0.20)
        w_behav = weights.get("behavioral_pattern", 0.10)
        w_rec = weights.get("recency", 0.10)

        # Identify all VASP nodes in the graph
        vasp_nodes = [
            (node, data) for node, data in graph.nodes(data=True) 
            if data.get("is_vasp") and data.get("vasp_name")
        ]

        if not vasp_nodes:
            return []

        # Group identified nodes by VASP entity name
        vasp_clusters: Dict[str, List[Dict[str, Any]]] = {}
        for node, data in vasp_nodes:
            v_name = data["vasp_name"]
            if v_name not in vasp_clusters:
                vasp_clusters[v_name] = []
            vasp_clusters[v_name].append({"node": node, "data": data})

        # Calculate root total outflow / inflow for proportional flow calculation
        root_outflow = sum(
            float(data.get("amount", 0.0)) 
            for _, _, _, data in graph.out_edges(root_wallet, keys=True, data=True)
        ) or 1.0

        results: List[AttributionSchema] = []

        for vasp_name, nodes_in_cluster in vasp_clusters.items():
            best_hop = 999
            total_cluster_flow = 0.0
            total_interactions = 0
            paths_found = []

            for item in nodes_in_cluster:
                target_node = item["node"]
                hop = item["data"].get("hop", 3)
                if hop < best_hop:
                    best_hop = hop

                # Find simple paths from root to target_node
                try:
                    # Convert to DiGraph for simple path search
                    simple_dg = nx.DiGraph(graph)
                    if nx.has_path(simple_dg, root_wallet, target_node):
                        paths = list(nx.all_simple_paths(simple_dg, root_wallet, target_node, cutoff=3))
                        paths_found.extend(paths)
                except Exception:
                    pass

                # Sum flow into this VASP node from previous hops
                in_edges = graph.in_edges(target_node, data=True)
                for _, _, edata in in_edges:
                    total_cluster_flow += float(edata.get("amount", 0.0))
                    total_interactions += 1

            # 1. Proximity Score (100 for hop 1, 60 for hop 2, 30 for hop 3)
            hop_decay_val = hop_decay.get(f"hop_{best_hop}", 0.20 if best_hop > 3 else 0.30)
            score_prox = 100.0 * hop_decay_val

            # 2. Flow Score (Proportion of root outflow reaching VASP, normalized)
            flow_ratio = min(total_cluster_flow / root_outflow, 1.0)
            score_flow = 100.0 * flow_ratio

            # 3. Interaction Score (Capped at 10 interactions = 100)
            score_freq = min(total_interactions * 10.0, 100.0)

            # 4. Behavioral Score (Path consistency: higher if direct or short path)
            score_behav = 100.0 if best_hop == 1 else (70.0 if best_hop == 2 else 40.0)

            # 5. Recency Score (Baseline 80 for current sample)
            score_rec = 80.0

            # Total Weighted Score (0 - 100)
            total_score = (
                (score_prox * w_prox) +
                (score_flow * w_flow) +
                (score_freq * w_freq) +
                (score_behav * w_behav) +
                (score_rec * w_rec)
            )
            total_score = round(min(max(total_score, 0.0), 100.0), 1)

            # Evidence Strength Classification
            if total_score >= thresholds.get("high_confidence_score", 75.0):
                strength = "High"
            elif total_score >= thresholds.get("medium_confidence_score", 45.0):
                strength = "Medium"
            else:
                strength = "Low"

            summary = (
                f"Observable fund flow traces from input wallet to {vasp_name}-associated "
                f"address cluster across {best_hop} hop(s) with {total_interactions} relevant "
                f"transaction(s) and {round(total_cluster_flow, 4)} observed volume."
            )

            metrics = {
                "shortest_hop": best_hop,
                "total_cluster_flow": round(total_cluster_flow, 4),
                "total_interactions": total_interactions,
                "breakdown": {
                    "proximity_score": round(score_prox, 1),
                    "flow_score": round(score_flow, 1),
                    "frequency_score": round(score_freq, 1),
                    "behavioral_score": round(score_behav, 1),
                    "recency_score": round(score_rec, 1),
                }
            }

            results.append(
                AttributionSchema(
                    vasp_name=vasp_name,
                    score=total_score,
                    evidence_strength=strength,
                    rank=1,
                    summary=summary,
                    metrics=metrics
                )
            )

        # Sort by total score descending and assign ranks
        results.sort(key=lambda x: x.score, reverse=True)
        for i, res in enumerate(results):
            res.rank = i + 1

        return results
