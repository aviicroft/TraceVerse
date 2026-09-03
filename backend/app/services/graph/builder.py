import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Set, Tuple, Any, Optional
import networkx as nx

from backend.app.core.config import settings
from backend.app.core.address_validator import normalize_address
from sqlalchemy import select
from backend.app.models.database import AsyncSessionLocal, Transaction as DBTransaction
from backend.app.schemas.analysis import (
    NormalizedTransaction, 
    GraphData, 
    GraphNode, 
    GraphNodeData, 
    GraphEdge, 
    GraphEdgeData
)
from backend.app.services.blockchain.base import BlockchainProvider
from backend.app.services.vasp.matcher import vasp_matcher

logger = logging.getLogger(__name__)


class TransactionGraphBuilder:
    """
    Constructs real, directed fund-flow graphs from blockchain transactions
    with bounded 3-hop traversal, cycle protection, and VASP detection.
    """

    def __init__(
        self,
        blockchain_provider: BlockchainProvider,
        max_hops: int = 3,
        max_nodes: int = 150,
        max_tx_per_address: int = 50
    ):
        self.provider = blockchain_provider
        self.max_hops = min(max_hops, settings.MAX_HOPS)
        self.max_nodes = max_nodes or settings.MAX_NODES_PER_ANALYSIS
        self.max_tx_per_address = max_tx_per_address or settings.MAX_TRANSACTIONS_PER_ADDRESS
        self.graph = nx.MultiDiGraph()
        self.all_transactions: List[NormalizedTransaction] = []
        self.node_hops: Dict[str, int] = {}
        self.visited_addresses: Set[str] = set()

    async def build_graph_for_wallet(self, root_wallet: str) -> nx.MultiDiGraph:
        """
        Executes bounded BFS from root wallet up to max_hops.
        Fetches genuine blockchain transactions for discovered nodes.
        """
        root_norm = normalize_address(root_wallet)
        self.graph.clear()
        self.all_transactions.clear()
        self.node_hops.clear()
        self.visited_addresses.clear()

        # Initialize Root Node
        self.node_hops[root_norm] = 0
        self._add_node_to_graph(root_norm, hop=0)

        # BFS queue storing (address, current_hop)
        queue: List[Tuple[str, int]] = [(root_norm, 0)]

        while queue and len(self.graph.nodes) < self.max_nodes:
            current_address, current_hop = queue.pop(0)

            if current_address in self.visited_addresses:
                continue
            self.visited_addresses.add(current_address)

            # If current node is already at max_hops, do not expand further
            if current_hop >= self.max_hops:
                continue

            # 1. Database-First check: Use local transaction store if available
            txs = await self._get_cached_transactions_from_db(current_address, max_tx=self.max_tx_per_address)

            # 2. If not found in DB, fetch from external blockchain explorer API
            if not txs:
                try:
                    txs = await self.provider.get_address_activity(
                        current_address, 
                        max_tx=self.max_tx_per_address
                    )
                except PermissionError as e:
                    # Critical configuration error: propagate so analysis is marked FAILED with clear instruction
                    logger.error(f"API Authorization error for {current_address}: {e}")
                    raise e
                except Exception as e:
                    logger.error(f"Failed fetching transactions for {current_address}: {e}")
                    continue

            for tx in txs:
                u = tx.from_address
                v = tx.to_address
                if not u or not v:
                    continue

                # Check if we need to add new nodes and whether we hit the max_nodes cap
                u_is_new = u not in self.node_hops
                v_is_new = v not in self.node_hops
                
                # If adding new nodes would exceed max_nodes cap, stop adding new nodes
                if u_is_new and len(self.graph.nodes) >= self.max_nodes:
                    break
                if v_is_new and len(self.graph.nodes) + (1 if u_is_new else 0) >= self.max_nodes:
                    break

                tx.hop = current_hop + 1
                self.all_transactions.append(tx)

                # Determine and assign hops
                if u_is_new:
                    self.node_hops[u] = current_hop + 1
                    self._add_node_to_graph(u, hop=current_hop + 1)
                    if current_hop + 1 < self.max_hops and len(self.graph.nodes) < self.max_nodes:
                        # If node is a known VASP endpoint, don't crawl past it (terminal VASP deposit/cold cluster)
                        if not vasp_matcher.is_known_vasp(u):
                            queue.append((u, current_hop + 1))

                if v_is_new:
                    self.node_hops[v] = current_hop + 1
                    self._add_node_to_graph(v, hop=current_hop + 1)
                    if current_hop + 1 < self.max_hops and len(self.graph.nodes) < self.max_nodes:
                        if not vasp_matcher.is_known_vasp(v):
                            queue.append((v, current_hop + 1))

                # Add directed edge representing transfer
                edge_id = f"{tx.tx_hash}_{u[:6]}_{v[:6]}_{tx.token_symbol}"
                self.graph.add_edge(
                    u,
                    v,
                    key=edge_id,
                    tx_hash=tx.tx_hash,
                    asset_symbol=tx.token_symbol or "ETH",
                    amount=tx.amount,
                    timestamp=tx.timestamp,
                    hop=current_hop + 1
                )

        logger.info(f"Graph built: {len(self.graph.nodes)} nodes, {len(self.graph.edges)} edges.")
        return self.graph

    async def _get_cached_transactions_from_db(self, address: str, max_tx: int = 50) -> List[NormalizedTransaction]:
        """Queries local PostgreSQL/SQLite transaction store before external API fetch."""
        try:
            async with AsyncSessionLocal() as session:
                stmt = (
                    select(DBTransaction)
                    .where((DBTransaction.from_address == address) | (DBTransaction.to_address == address))
                    .order_by(DBTransaction.timestamp.desc())
                    .limit(max_tx)
                )
                res = await session.execute(stmt)
                db_txs = res.scalars().all()

                if not db_txs:
                    return []

                normalized = []
                for t in db_txs:
                    normalized.append(
                        NormalizedTransaction(
                            tx_hash=t.tx_hash,
                            chain=t.chain,
                            block_number=t.block_number,
                            timestamp=t.timestamp,
                            from_address=t.from_address,
                            to_address=t.to_address,
                            asset_type=t.asset_type,
                            token_address=t.token_address,
                            token_symbol=t.token_symbol,
                            token_decimals=t.token_decimals or 18,
                            amount=t.amount,
                            gas_used=t.gas_used,
                            is_error=t.is_error
                        )
                    )
                return normalized
        except Exception as e:
            logger.warning(f"Failed to query local DB transactions for {address}: {e}")
            return []

    def _add_node_to_graph(self, address: str, hop: int):
        """Helper to register node attributes."""
        vasp_info = vasp_matcher.match_address(address)
        is_vasp = vasp_info is not None

        if hop == 0:
            role = "INPUT_WALLET"
        elif is_vasp:
            role = "KNOWN_VASP"
        elif hop == 1:
            role = "INTERMEDIARY_HOP_1"
        elif hop == 2:
            role = "INTERMEDIARY_HOP_2"
        elif hop == 3:
            role = "INTERMEDIARY_HOP_3"
        else:
            role = "EXTERNAL"

        short_label = f"{address[:6]}...{address[-4:]}"
        if is_vasp:
            short_label = f"[{vasp_info['vasp_name']}] {short_label}"

        self.graph.add_node(
            address,
            label=short_label,
            address=address,
            role=role,
            hop=hop,
            is_vasp=is_vasp,
            vasp_name=vasp_info["vasp_name"] if vasp_info else None,
            vasp_confidence=vasp_info["confidence"] if vasp_info else None,
            address_type=vasp_info["address_type"] if vasp_info else None,
            notes=vasp_info["notes"] if vasp_info else None
        )

    def export_cytoscape_data(self, root_wallet: str) -> GraphData:
        """
        Converts the NetworkX MultiDiGraph into a Cytoscape.js compatible JSON payload.
        """
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []

        # Compute in/out volume and tx counts per node
        node_stats: Dict[str, Dict[str, Any]] = {}
        for node in self.graph.nodes:
            node_stats[node] = {"inflow": 0.0, "outflow": 0.0, "tx_count": 0}

        for u, v, key, data in self.graph.edges(keys=True, data=True):
            amt = float(data.get("amount", 0.0))
            if u in node_stats:
                node_stats[u]["outflow"] += amt
                node_stats[u]["tx_count"] += 1
            if v in node_stats:
                node_stats[v]["inflow"] += amt
                node_stats[v]["tx_count"] += 1

            edges.append(
                GraphEdge(
                    data=GraphEdgeData(
                        id=str(key),
                        source=u,
                        target=v,
                        tx_hash=data.get("tx_hash", ""),
                        asset_symbol=data.get("asset_symbol", "ETH"),
                        amount=amt,
                        timestamp=data.get("timestamp", datetime.utcnow()),
                        hop=data.get("hop", 1)
                    )
                )
            )

        for node, data in self.graph.nodes(data=True):
            stats = node_stats.get(node, {"inflow": 0.0, "outflow": 0.0, "tx_count": 0})
            nodes.append(
                GraphNode(
                    data=GraphNodeData(
                        id=node,
                        label=data.get("label", node[:8]),
                        address=node,
                        role=data.get("role", "EXTERNAL"),
                        hop=data.get("hop", 0),
                        is_vasp=data.get("is_vasp", False),
                        vasp_name=data.get("vasp_name"),
                        vasp_confidence=data.get("vasp_confidence"),
                        address_type=data.get("address_type"),
                        tx_count=stats["tx_count"],
                        total_inflow=stats["inflow"],
                        total_outflow=stats["outflow"]
                    )
                )
            )

        summary_stats = {
            "root_wallet": root_wallet,
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "vasp_nodes_found": sum(1 for n in nodes if n.data.is_vasp),
            "max_hop_reached": max([n.data.hop for n in nodes], default=0)
        }

        return GraphData(nodes=nodes, edges=edges, stats=summary_stats)
