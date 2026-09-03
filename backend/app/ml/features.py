import logging
from typing import Dict, List, Any, Optional
import networkx as nx
from datetime import datetime

logger = logging.getLogger(__name__)

FEATURE_NAMES = [
    "min_hop_distance",
    "path_count",
    "direct_transfer_count",
    "indirect_transfer_count",
    "total_cluster_inflow",
    "root_outflow_total",
    "flow_volume_ratio",
    "interaction_count",
    "direct_interaction_ratio",
    "unique_counterparties_to_vasp",
    "total_graph_nodes",
    "total_graph_edges",
    "max_graph_hop",
    "avg_transfer_amount",
    "max_transfer_amount",
    "activity_timespan_hours",
    "burst_density",
    "vasp_known_addresses_in_graph",
    "vasp_confidence_mean",
    "is_direct_hop1",
    "is_hop2",
    "is_hop3",
]


def extract_candidate_features(
    graph: nx.MultiDiGraph,
    root_wallet: str,
    candidate_vasp_name: str,
    candidate_nodes: List[Dict[str, Any]],
) -> Dict[str, float]:
    """
    Extracts structured, tabular graph and flow features for a specific candidate VASP cluster.
    """
    total_nodes = len(graph.nodes)
    total_edges = len(graph.edges)
    max_graph_hop = max([data.get("hop", 0) for _, data in graph.nodes(data=True)], default=0)

    # Root total outflow
    root_outflow = sum(
        float(data.get("amount", 0.0))
        for _, _, _, data in graph.out_edges(root_wallet, keys=True, data=True)
    ) or 1.0

    best_hop = 99
    paths_found = 0
    total_cluster_flow = 0.0
    interaction_count = 0
    direct_transfers = 0
    indirect_transfers = 0
    transfer_amounts = []
    transfer_timestamps = []
    unique_sources = set()
    conf_scores = []

    # DiGraph copy for simple paths
    try:
        simple_dg = nx.DiGraph(graph)
    except Exception:
        simple_dg = None

    for item in candidate_nodes:
        target_node = item["node"]
        data = item["data"]
        hop = data.get("hop", 3)
        if hop < best_hop:
            best_hop = hop

        conf = float(data.get("confidence_score", 95.0) or 95.0)
        conf_scores.append(conf)

        if simple_dg and nx.has_path(simple_dg, root_wallet, target_node):
            try:
                paths = list(nx.all_simple_paths(simple_dg, root_wallet, target_node, cutoff=3))
                paths_found += len(paths)
            except Exception:
                pass

        in_edges = graph.in_edges(target_node, data=True)
        for u, _, edata in in_edges:
            amt = float(edata.get("amount", 0.0))
            transfer_amounts.append(amt)
            total_cluster_flow += amt
            interaction_count += 1
            unique_sources.add(u)

            ts = edata.get("timestamp")
            if isinstance(ts, datetime):
                transfer_timestamps.append(ts)

            if u == root_wallet:
                direct_transfers += 1
            else:
                indirect_transfers += 1

    if best_hop == 99:
        best_hop = 3

    flow_ratio = min(total_cluster_flow / max(root_outflow, 1e-6), 1.0)
    direct_ratio = direct_transfers / max(1, interaction_count)
    avg_amt = (sum(transfer_amounts) / len(transfer_amounts)) if transfer_amounts else 0.0
    max_amt = max(transfer_amounts) if transfer_amounts else 0.0

    timespan_hours = 0.0
    if len(transfer_timestamps) >= 2:
        transfer_timestamps.sort()
        timespan_hours = (transfer_timestamps[-1] - transfer_timestamps[0]).total_seconds() / 3600.0

    burst_density = interaction_count / max(0.1, timespan_hours if timespan_hours > 0 else 1.0)
    mean_conf = (sum(conf_scores) / len(conf_scores)) if conf_scores else 95.0

    return {
        "min_hop_distance": float(best_hop),
        "path_count": float(paths_found),
        "direct_transfer_count": float(direct_transfers),
        "indirect_transfer_count": float(indirect_transfers),
        "total_cluster_inflow": float(total_cluster_flow),
        "root_outflow_total": float(root_outflow),
        "flow_volume_ratio": float(flow_ratio),
        "interaction_count": float(interaction_count),
        "direct_interaction_ratio": float(direct_ratio),
        "unique_counterparties_to_vasp": float(len(unique_sources)),
        "total_graph_nodes": float(total_nodes),
        "total_graph_edges": float(total_edges),
        "max_graph_hop": float(max_graph_hop),
        "avg_transfer_amount": float(avg_amt),
        "max_transfer_amount": float(max_amt),
        "activity_timespan_hours": float(timespan_hours),
        "burst_density": float(burst_density),
        "vasp_known_addresses_in_graph": float(len(candidate_nodes)),
        "vasp_confidence_mean": float(mean_conf),
        "is_direct_hop1": 1.0 if best_hop == 1 else 0.0,
        "is_hop2": 1.0 if best_hop == 2 else 0.0,
        "is_hop3": 1.0 if best_hop == 3 else 0.0,
    }


def feature_dict_to_vector(features: Dict[str, float]) -> List[float]:
    """Ensures deterministic ordering of extracted features for model input."""
    return [float(features.get(k, 0.0)) for k in FEATURE_NAMES]
