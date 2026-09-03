import logging
import json
from typing import Dict, List, Any, Optional, Set, Tuple
from datetime import datetime, timezone
import networkx as nx

from backend.app.core.config import settings
from backend.app.core.address_validator import (
    is_valid_eth_address,
    is_valid_tron_address,
    normalize_address
)
from backend.app.services.vasp.matcher import vasp_matcher
from backend.app.services.discovery.candidate_scorer import CandidateQualityScorer
from backend.app.schemas.analysis import NormalizedTransaction

logger = logging.getLogger(__name__)

# Known null / burn / system addresses
BURN_ADDRESSES = {
    "0x0000000000000000000000000000000000000000",
    "0x000000000000000000000000000000000000dead",
    "0x0000000000000000000000000000000000000001",
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    "t9yd14nj9j7xab4dbgeix9h8unkkhxuwb",
    "t9yd14nj9j7xab4dbgeix9h8unkkhxuwb".lower()
}

# Major known contract tokens to filter out as wallet candidates
KNOWN_CONTRACTS = {
    "0xdac17f958d2ee523a2206206994597c13d831ec7",  # USDT ETH
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",  # USDC ETH
    "0x6b175474e89094c44da98b954eedeac495271d0f",  # DAI ETH
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",  # WETH
    "tr7nhqjekkqxgtci8q8zy4pl8otszgjlj6",          # USDT TRON
    "te2rkndd5evbf1usznjup9j5tqwhs54vde",          # USDC TRON
}


class CandidateMiner:
    """
    Automated discovery pipeline for identifying high-interest unlabeled
    unknown wallet candidates from verified VASP transaction interactions.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or self._load_default_config()
        self.scorer = CandidateQualityScorer(self.config.get("candidate_discovery", {}))
        self.thresholds = self.config.get("candidate_discovery", {}).get("thresholds", {
            "min_transactions": 10,
            "min_token_transfers": 2,
            "min_unique_counterparties": 2,
            "min_volume_usd": 10.0,
            "ready_min_transactions": 50,
            "ready_min_quality_score": 45.0
        })

    def _load_default_config(self) -> Dict[str, Any]:
        return {
            "candidate_discovery": {
                "thresholds": {
                    "min_transactions": 10,
                    "min_token_transfers": 2,
                    "min_unique_counterparties": 2,
                    "min_volume_usd": 10.0,
                    "ready_min_transactions": 50,
                    "ready_min_quality_score": 45.0
                },
                "weights": {
                    "history_quality": 0.25,
                    "activity_quality": 0.20,
                    "graph_quality": 0.20,
                    "vasp_connectivity": 0.20,
                    "flow_quality": 0.15
                }
            }
        }

    def filter_candidate(self, address: str, chain: str) -> Tuple[bool, Optional[str]]:
        """
        Determines whether an address is a valid UNKNOWN candidate.
        Returns: (is_valid, rejection_reason)
        """
        if not address:
            return False, "Empty address"

        norm_addr = address.lower()

        # 1. Null / burn address filter
        if norm_addr in BURN_ADDRESSES:
            return False, "Null/Burn address"

        # 2. Known token contract filter
        if norm_addr in KNOWN_CONTRACTS:
            return False, "Smart contract / Token contract address"

        # 3. Format validation
        if chain.lower() == "ethereum":
            if not is_valid_eth_address(address):
                return False, "Invalid Ethereum address format"
        elif chain.lower() == "tron":
            if not is_valid_tron_address(address):
                return False, "Invalid Tron address format"

        # 4. Verified VASP registry exclusion
        if vasp_matcher.is_vasp(address):
            match_info = vasp_matcher.match_address(address)
            vasp_name = match_info.get("vasp_name", "Known VASP") if match_info else "Known VASP"
            return False, f"Address is already verified in VASP Registry ({vasp_name})"

        return True, None

    def extract_counterparties_from_transactions(
        self,
        seed_vasp_name: str,
        seed_vasp_address: str,
        transactions: List[NormalizedTransaction]
    ) -> List[Dict[str, Any]]:
        """
        Extracts unique counterparty wallet candidates from a VASP transaction list.
        Tracks origin VASP and transaction provenance.
        """
        seed_norm = seed_vasp_address.lower()
        candidates_map: Dict[str, Dict[str, Any]] = {}

        for tx in transactions:
            from_addr = tx.from_address
            to_addr = tx.to_address

            # Check both endpoints
            for peer in [from_addr, to_addr]:
                if not peer:
                    continue
                if peer.lower() == seed_norm:
                    continue  # Skip the seed address itself

                peer_norm = peer.lower()
                is_valid, reason = self.filter_candidate(peer, tx.chain)

                if peer_norm not in candidates_map:
                    candidates_map[peer_norm] = {
                        "address": peer,
                        "chain": tx.chain,
                        "is_valid": is_valid,
                        "rejection_reason": reason,
                        "discovery_vasp_name": seed_vasp_name,
                        "discovery_vasp_address": seed_vasp_address,
                        "discovered_from_tx_hash": tx.tx_hash,
                        "transactions": []
                    }
                candidates_map[peer_norm]["transactions"].append(tx)

        return list(candidates_map.values())

    def analyze_candidate_profile(
        self,
        candidate_info: Dict[str, Any],
        activity_txs: List[NormalizedTransaction],
        known_vasps_graph: Optional[nx.MultiDiGraph] = None
    ) -> Dict[str, Any]:
        """
        Builds a comprehensive profile for a candidate wallet from its full transaction history,
        computing volume, timespan, reachable VASPs, and the Candidate Quality Score.
        """
        address = candidate_info["address"]
        chain = candidate_info["chain"]
        addr_norm = address.lower()

        tx_count = len(activity_txs)
        token_tx_count = 0
        counterparties: Set[str] = set()
        usdt_vol = 0.0
        usdc_vol = 0.0
        total_vol_usd = 0.0

        incoming_count = 0
        outgoing_count = 0
        incoming_vol = 0.0
        outgoing_vol = 0.0

        timestamps: List[datetime] = []

        # Reachable VASPs tracking
        reachable_vasps_map: Dict[str, Dict[str, Any]] = {}

        # Direct (Hop 1) VASP interactions observed in activity
        for tx in activity_txs:
            if tx.timestamp:
                timestamps.append(tx.timestamp)

            is_token = tx.asset_type in ["ERC20", "TRC20"]
            if is_token:
                token_tx_count += 1

            # Determine USD value estimate
            amt = tx.amount
            sym = (tx.token_symbol or "ETH").upper()
            tx_usd = amt
            if sym == "USDT":
                usdt_vol += amt
                tx_usd = amt
            elif sym == "USDC":
                usdc_vol += amt
                tx_usd = amt
            elif sym in ["ETH", "WETH"]:
                tx_usd = amt * 2800.0  # Normalized reference price
            elif sym in ["TRX", "WTRX"]:
                tx_usd = amt * 0.15    # Normalized reference price

            total_vol_usd += tx_usd

            # Counterparty tracking
            if tx.from_address and tx.from_address.lower() == addr_norm:
                outgoing_count += 1
                outgoing_vol += tx_usd
                if tx.to_address:
                    counterparties.add(tx.to_address.lower())
                    # Check if destination is a VASP
                    if vasp_matcher.is_vasp(tx.to_address):
                        v_info = vasp_matcher.match_address(tx.to_address)
                        v_name = v_info.get("vasp_name", "Known VASP") if v_info else "Known VASP"
                        if v_name not in reachable_vasps_map:
                            reachable_vasps_map[v_name] = {
                                "name": v_name,
                                "min_hop": 1,
                                "direct_tx_count": 0,
                                "flow_volume_usd": 0.0,
                                "paths_count": 0
                            }
                        reachable_vasps_map[v_name]["direct_tx_count"] += 1
                        reachable_vasps_map[v_name]["flow_volume_usd"] += tx_usd
                        reachable_vasps_map[v_name]["paths_count"] += 1

            elif tx.to_address and tx.to_address.lower() == addr_norm:
                incoming_count += 1
                incoming_vol += tx_usd
                if tx.from_address:
                    counterparties.add(tx.from_address.lower())
                    # Check if origin is a VASP
                    if vasp_matcher.is_vasp(tx.from_address):
                        v_info = vasp_matcher.match_address(tx.from_address)
                        v_name = v_info.get("vasp_name", "Known VASP") if v_info else "Known VASP"
                        if v_name not in reachable_vasps_map:
                            reachable_vasps_map[v_name] = {
                                "name": v_name,
                                "min_hop": 1,
                                "direct_tx_count": 0,
                                "flow_volume_usd": 0.0,
                                "paths_count": 0
                            }
                        reachable_vasps_map[v_name]["direct_tx_count"] += 1
                        reachable_vasps_map[v_name]["flow_volume_usd"] += tx_usd
                        reachable_vasps_map[v_name]["paths_count"] += 1

        # Also incorporate the originating discovery VASP if not already tracked
        discovery_vasp = candidate_info.get("discovery_vasp_name")
        if discovery_vasp and discovery_vasp not in reachable_vasps_map:
            reachable_vasps_map[discovery_vasp] = {
                "name": discovery_vasp,
                "min_hop": 1,
                "direct_tx_count": 1,
                "flow_volume_usd": usdt_vol or 100.0,
                "paths_count": 1
            }

        # Multi-Hop VASP graph enrichment if graph provided
        if known_vasps_graph:
            for node, data in known_vasps_graph.nodes(data=True):
                if data.get("is_vasp") and data.get("vasp_name"):
                    v_name = data["vasp_name"]
                    try:
                        if nx.has_path(known_vasps_graph, address, node):
                            path_len = nx.shortest_path_length(known_vasps_graph, address, node)
                            if 0 < path_len <= 3:
                                if v_name not in reachable_vasps_map:
                                    reachable_vasps_map[v_name] = {
                                        "name": v_name,
                                        "min_hop": path_len,
                                        "direct_tx_count": 0,
                                        "flow_volume_usd": 0.0,
                                        "paths_count": 1
                                    }
                                else:
                                    reachable_vasps_map[v_name]["min_hop"] = min(
                                        reachable_vasps_map[v_name]["min_hop"], path_len
                                    )
                                    reachable_vasps_map[v_name]["paths_count"] += 1
                    except Exception:
                        pass

        # Temporal metrics
        first_act = min(timestamps) if timestamps else None
        latest_act = max(timestamps) if timestamps else None
        active_days = 1
        if first_act and latest_act:
            diff_days = (latest_act - first_act).days
            active_days = max(1, diff_days + 1)

        # Reachable VASP summary
        reachable_vasps_list = list(reachable_vasps_map.values())
        reachable_vasps_list.sort(key=lambda x: (x["min_hop"], -x["flow_volume_usd"]))
        
        min_hop = reachable_vasps_list[0]["min_hop"] if reachable_vasps_list else 1
        total_paths = sum(v["paths_count"] for v in reachable_vasps_list) if reachable_vasps_list else 1
        vasp_count = len(reachable_vasps_list)

        # Flow ratio to VASPs
        vasp_routed_vol = sum(v["flow_volume_usd"] for v in reachable_vasps_list)
        flow_ratio = (vasp_routed_vol / max(1.0, total_vol_usd)) if total_vol_usd > 0 else 0.5
        flow_ratio = min(1.0, max(0.0, flow_ratio))

        # Calculate Candidate Quality Score (0-100)
        score_result = self.scorer.calculate_score(
            tx_count=tx_count,
            token_transfers_count=token_tx_count,
            unique_counterparties=len(counterparties),
            total_volume_usd=total_vol_usd,
            active_days=active_days,
            incoming_tx=incoming_count,
            outgoing_tx=outgoing_count,
            min_hop_to_vasp=min_hop,
            reachable_vasp_count=vasp_count,
            total_paths_to_vasps=total_paths,
            flow_to_vasp_ratio=flow_ratio
        )

        quality_score = score_result["candidate_quality_score"]

        # Classification status
        if quality_score >= self.thresholds.get("ready_min_quality_score", 45.0) and tx_count >= 10:
            status = "investigation_ready"
        elif tx_count < self.thresholds.get("min_transactions", 10):
            status = "insufficient_activity"
        else:
            status = "investigation_ready"

        return {
            "address": address,
            "chain": chain,
            "discovery_source": candidate_info.get("discovery_source", "vasp_counterparty_miner"),
            "discovery_vasp_name": candidate_info.get("discovery_vasp_name", "Unknown VASP"),
            "discovery_vasp_address": candidate_info.get("discovery_vasp_address", ""),
            "discovered_from_tx_hash": candidate_info.get("discovered_from_tx_hash"),
            "transaction_count": tx_count,
            "token_transfers_count": token_tx_count,
            "unique_counterparties_count": len(counterparties),
            "usdt_volume": round(usdt_vol, 2),
            "usdc_volume": round(usdc_vol, 2),
            "total_volume_usd": round(total_vol_usd, 2),
            "first_activity": first_act,
            "latest_activity": latest_act,
            "active_days": active_days,
            "incoming_tx_count": incoming_count,
            "outgoing_tx_count": outgoing_count,
            "incoming_volume": round(incoming_vol, 2),
            "outgoing_volume": round(outgoing_vol, 2),
            "reachable_vasps_json": json.dumps(reachable_vasps_list),
            "min_hop_to_vasp": min_hop,
            "reachable_vasp_count": vasp_count,
            "total_paths_to_vasps": total_paths,
            "candidate_quality_score": quality_score,
            "quality_breakdown_json": json.dumps(score_result["breakdown"]),
            "status": status,
            "rejection_reason": candidate_info.get("rejection_reason")
        }
