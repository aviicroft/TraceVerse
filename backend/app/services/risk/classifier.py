import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import networkx as nx

from backend.app.schemas.analysis import RiskAssessmentSchema

logger = logging.getLogger(__name__)


class RiskClassifier:
    """
    Transparent, explainable risk indicator classifier based on observable
    on-chain structural patterns such as pass-through layering, velocity, and dispersion.
    """

    @staticmethod
    def evaluate_risk(
        graph: nx.MultiDiGraph, 
        root_wallet: str
    ) -> RiskAssessmentSchema:
        indicators: List[str] = []
        risk_score = 0.0

        total_nodes = len(graph.nodes)
        total_edges = len(graph.edges)
        max_hop = max([data.get("hop", 0) for _, data in graph.nodes(data=True)], default=0)

        # 1. Multi-hop Layering Indicator
        if max_hop >= 3:
            indicators.append("Multi-hop layering: Fund flow observed traversing 3 intermediary hops.")
            risk_score += 40.0
        elif max_hop == 2:
            indicators.append("Intermediary hop: Fund flow routed through at least 1 intermediate counterparty.")
            risk_score += 20.0

        # 2. High Velocity / Burst Activity
        if total_edges > 20:
            indicators.append(f"High transaction volume: {total_edges} distinct transfers detected in local graph.")
            risk_score += 25.0
        elif total_edges > 8:
            indicators.append(f"Active transaction volume: {total_edges} transfers detected in local graph.")
            risk_score += 10.0

        # 3. Intermediary Dispersion / Fan-out
        intermediary_nodes = [
            n for n, d in graph.nodes(data=True) 
            if d.get("role") in ["INTERMEDIARY_HOP_1", "INTERMEDIARY_HOP_2"]
        ]
        if len(intermediary_nodes) >= 3:
            indicators.append(f"Counterparty dispersion: Flow split across {len(intermediary_nodes)} intermediary addresses.")
            risk_score += 25.0

        # 4. Rapid Pass-through Temporal Velocity
        timestamps = []
        for _, _, data in graph.edges(data=True):
            ts = data.get("timestamp")
            if ts:
                if getattr(ts, "tzinfo", None) is None:
                    ts = ts.replace(tzinfo=timezone.utc)
                else:
                    ts = ts.astimezone(timezone.utc)
                timestamps.append(ts)

        if len(timestamps) >= 2:
            timestamps.sort()
            duration_hours = (timestamps[-1] - timestamps[0]).total_seconds() / 3600.0
            if duration_hours < 2.0 and total_edges >= 4:
                indicators.append(f"Rapid pass-through: {total_edges} transfers executed within {duration_hours:.1f} hours.")
                risk_score += 25.0

        # 5. Determine Overall Risk Level
        risk_score = min(risk_score, 100.0)

        if risk_score >= 50.0 or (max_hop >= 3 and len(indicators) >= 2):
            risk_level = "HIGH"
            explanation = (
                "High risk indicators observed. Observable transaction flow demonstrates rapid "
                "multi-hop layering across several intermediary addresses prior to reaching terminal endpoints."
            )
        elif risk_score >= 25.0 or len(indicators) >= 1:
            risk_level = "MEDIUM"
            explanation = (
                "Moderate risk indicators observed. Observed flow involves intermediary counterparty "
                "routing and moderate structural complexity."
            )
        else:
            risk_level = "LOW"
            explanation = (
                "Low risk indicators observed. Direct or low-hop observable activity with standard "
                "counterparty flow patterns."
            )

        if not indicators:
            indicators.append("Direct or low-complexity transaction flow with no suspicious layering indicators.")

        return RiskAssessmentSchema(
            risk_level=risk_level,
            score=round(risk_score, 1),
            indicators=indicators,
            explanation=explanation
        )
