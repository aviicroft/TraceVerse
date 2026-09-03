import networkx as nx
from backend.app.services.risk.classifier import RiskClassifier

def test_risk_classification_low():
    g = nx.MultiDiGraph()
    root = "0xroot000000000000000000000000000000000000"
    target = "0xtarget0000000000000000000000000000000000"
    g.add_node(root, hop=0, role="INPUT_WALLET")
    g.add_node(target, hop=1, role="KNOWN_VASP")
    g.add_edge(root, target, key="e1", amount=1.0)
    
    risk = RiskClassifier.evaluate_risk(g, root)
    assert risk.risk_level in ["LOW", "MEDIUM"]
    assert len(risk.indicators) >= 1

def test_risk_classification_high_layering():
    g = nx.MultiDiGraph()
    root = "0xroot"
    h1 = "0xh1"
    h2 = "0xh2"
    h3 = "0xh3"
    g.add_node(root, hop=0, role="INPUT_WALLET")
    g.add_node(h1, hop=1, role="INTERMEDIARY_HOP_1")
    g.add_node(h2, hop=2, role="INTERMEDIARY_HOP_2")
    g.add_node(h3, hop=3, role="KNOWN_VASP")
    
    # Add multiple transfers
    for i in range(25):
        g.add_edge(root, h1, key=f"e_{i}", amount=1.0)
        
    risk = RiskClassifier.evaluate_risk(g, root)
    assert risk.risk_level == "HIGH"
    assert any("Multi-hop layering" in ind for ind in risk.indicators)
