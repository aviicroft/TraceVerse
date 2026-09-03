import logging
from typing import List, Dict, Any, Optional
import networkx as nx

from backend.app.schemas.analysis import EvidenceSchema, AttributionSchema
from backend.app.services.vasp.matcher import vasp_matcher

logger = logging.getLogger(__name__)


class EvidenceGenerator:
    """
    Constructs concrete, auditable evidence items linking every attribution 
    conclusion back to specific blockchain transactions, addresses, and hops.
    """

    @staticmethod
    def generate_evidence_for_attribution(
        graph: nx.MultiDiGraph,
        root_wallet: str,
        attribution: AttributionSchema
    ) -> List[EvidenceSchema]:
        evidence_list: List[EvidenceSchema] = []
        vasp_name = attribution.vasp_name

        # Find all nodes in graph belonging to this VASP
        target_nodes = [
            node for node, data in graph.nodes(data=True)
            if data.get("vasp_name") == vasp_name
        ]

        if not target_nodes:
            return evidence_list

        for vasp_node in target_nodes:
            node_data = graph.nodes[vasp_node]
            hop = node_data.get("hop", 1)
            source_proof = node_data.get("source", "Verified Registry")
            conf = node_data.get("vasp_confidence", "VERIFIED")

            # 1. Entity Verification Evidence
            evidence_list.append(
                EvidenceSchema(
                    evidence_type="Entity Identification",
                    source_address=vasp_node,
                    target_address=None,
                    tx_hash=None,
                    hop_distance=hop,
                    amount=None,
                    asset_symbol=None,
                    explanation=(
                        f"Target address {vasp_node[:10]}...{vasp_node[-6:]} matches curated public {vasp_name} "
                        f"cluster ({node_data.get('address_type', 'hot_wallet')}). Provenance: {source_proof} ({conf})."
                    ),
                    strength="HIGH" if conf == "VERIFIED" else "MEDIUM"
                )
            )

            # 2. Graph Proximity Evidence
            evidence_list.append(
                EvidenceSchema(
                    evidence_type="Graph Proximity",
                    source_address=root_wallet,
                    target_address=vasp_node,
                    tx_hash=None,
                    hop_distance=hop,
                    amount=None,
                    asset_symbol=None,
                    explanation=(
                        f"Observed {hop}-hop directional connection from input wallet "
                        f"{root_wallet[:8]}... to {vasp_name} endpoint {vasp_node[:8]}..."
                    ),
                    strength="HIGH" if hop <= 2 else "MEDIUM"
                )
            )

            # 3. Direct/Inbound Transaction Evidence
            in_edges = list(graph.in_edges(vasp_node, keys=True, data=True))
            for u, v, key, edata in in_edges[:5]:  # Capture top transactions
                tx_hash = edata.get("tx_hash", "")
                amt = float(edata.get("amount", 0.0))
                sym = edata.get("asset_symbol", "ETH")
                tx_hop = edata.get("hop", hop)

                evidence_list.append(
                    EvidenceSchema(
                        evidence_type="Fund Flow Transfer",
                        source_address=u,
                        target_address=v,
                        tx_hash=tx_hash,
                        hop_distance=tx_hop,
                        amount=amt,
                        asset_symbol=sym,
                        explanation=(
                            f"Fund transfer of {amt:.4f} {sym} observed from intermediary/source "
                            f"{u[:8]}... to {vasp_name} endpoint {v[:8]}... (Tx: {tx_hash[:10]}...)"
                        ),
                        strength="HIGH"
                    )
                )

        return evidence_list
