import pytest
import datetime
import networkx as nx
from typing import List
from backend.app.schemas.analysis import NormalizedTransaction
from backend.app.services.blockchain.base import BlockchainProvider
from backend.app.services.graph.builder import TransactionGraphBuilder


class MockBlockchainProvider(BlockchainProvider):
    """
    Mock provider generating a controlled 4-hop chain for traversal validation:
    Root (Hop 0) -> Hop1 -> Hop2 -> Hop3 (Binance) -> Hop4 (Ignored)
    """
    async def get_native_transactions(self, address: str, page: int = 1, offset: int = 50) -> List[NormalizedTransaction]:
        return []

    async def get_token_transfers(self, address: str, page: int = 1, offset: int = 50) -> List[NormalizedTransaction]:
        return []

    async def get_address_activity(self, address: str, max_tx: int = 50) -> List[NormalizedTransaction]:
        now = datetime.datetime.now(datetime.timezone.utc)
        if address == "0x1111111111111111111111111111111111111111":
            # Root transfers to Hop1
            return [
                NormalizedTransaction(
                    tx_hash="0xhash1",
                    block_number=100,
                    timestamp=now,
                    from_address="0x1111111111111111111111111111111111111111",
                    to_address="0x2222222222222222222222222222222222222222",
                    asset_type="ETH",
                    amount=10.0
                )
            ]
        elif address == "0x2222222222222222222222222222222222222222":
            # Hop1 transfers to Hop2
            return [
                NormalizedTransaction(
                    tx_hash="0xhash2",
                    block_number=101,
                    timestamp=now,
                    from_address="0x2222222222222222222222222222222222222222",
                    to_address="0x3333333333333333333333333333333333333333",
                    asset_type="ETH",
                    amount=9.5
                )
            ]
        elif address == "0x3333333333333333333333333333333333333333":
            # Hop2 transfers to known Binance address (Hop 3)
            return [
                NormalizedTransaction(
                    tx_hash="0xhash3",
                    block_number=102,
                    timestamp=now,
                    from_address="0x3333333333333333333333333333333333333333",
                    to_address="0x28c6c06298d514db089934071355e5743bf21d60",  # Binance
                    asset_type="ETH",
                    amount=9.0
                )
            ]
        return []


@pytest.mark.asyncio
async def test_3_hop_bounded_traversal():
    provider = MockBlockchainProvider()
    builder = TransactionGraphBuilder(blockchain_provider=provider, max_hops=3)
    root = "0x1111111111111111111111111111111111111111"
    
    graph = await builder.build_graph_for_wallet(root)
    
    assert len(graph.nodes) == 4
    assert len(graph.edges) == 3
    
    # Verify node hops
    assert graph.nodes[root]["hop"] == 0
    assert graph.nodes["0x2222222222222222222222222222222222222222"]["hop"] == 1
    assert graph.nodes["0x3333333333333333333333333333333333333333"]["hop"] == 2
    assert graph.nodes["0x28c6c06298d514db089934071355e5743bf21d60"]["hop"] == 3
    assert graph.nodes["0x28c6c06298d514db089934071355e5743bf21d60"]["is_vasp"] is True
    assert graph.nodes["0x28c6c06298d514db089934071355e5743bf21d60"]["vasp_name"] == "Binance"
