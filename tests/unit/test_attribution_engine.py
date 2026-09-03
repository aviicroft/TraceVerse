import networkx as nx
from backend.app.services.attribution.engine import AttributionEngine

def test_attribution_scoring_hop1_vs_hop3():
    engine = AttributionEngine()
    
    # Create graph with direct Hop 1 connection to Binance
    g1 = nx.MultiDiGraph()
    root = "0xroot000000000000000000000000000000000000"
    binance = "0x28c6c06298d514db089934071355e5743bf21d60"
    
    g1.add_node(root, hop=0, is_vasp=False)
    g1.add_node(binance, hop=1, is_vasp=True, vasp_name="Binance", vasp_confidence="VERIFIED")
    g1.add_edge(root, binance, key="e1", amount=10.0, asset_symbol="ETH")
    
    attr1 = engine.calculate_attributions(g1, root)
    assert len(attr1) == 1
    assert attr1[0].vasp_name == "Binance"
    assert attr1[0].score >= 70.0  # Hop 1 direct should score high
    assert attr1[0].evidence_strength in ["High", "Medium"]

    # Create graph with Hop 3 connection to Binance
    g3 = nx.MultiDiGraph()
    hop1 = "0xhop100000000000000000000000000000000000"
    hop2 = "0xhop200000000000000000000000000000000000"
    
    g3.add_node(root, hop=0, is_vasp=False)
    g3.add_node(hop1, hop=1, is_vasp=False)
    g3.add_node(hop2, hop=2, is_vasp=False)
    g3.add_node(binance, hop=3, is_vasp=True, vasp_name="Binance", vasp_confidence="VERIFIED")
    
    g3.add_edge(root, hop1, key="e1", amount=10.0, asset_symbol="ETH")
    g3.add_edge(hop1, hop2, key="e2", amount=9.5, asset_symbol="ETH")
    g3.add_edge(hop2, binance, key="e3", amount=9.0, asset_symbol="ETH")
    
    attr3 = engine.calculate_attributions(g3, root)
    assert len(attr3) == 1
    # Hop 3 score should be strictly less than Hop 1 score due to distance decay
    assert attr3[0].score < attr1[0].score
