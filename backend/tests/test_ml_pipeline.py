import pytest
import networkx as nx
from datetime import datetime

from backend.app.ml.features import (
    FEATURE_NAMES,
    extract_candidate_features,
    feature_dict_to_vector
)
from backend.app.ml.dataset import DatasetBuilder
from backend.app.ml.inference import MLInferenceService
from backend.app.ml.evaluate import OfflineEvaluator


def test_feature_extraction():
    g = nx.MultiDiGraph()
    root = "0x1111111111111111111111111111111111111111"
    vasp_node = "0x28c6c06298d514db089934071355e5743bf21d60"

    g.add_node(root, hop=0, role="INPUT_WALLET")
    g.add_node(vasp_node, hop=1, role="KNOWN_VASP", vasp_name="Binance", confidence_score=98.0)
    g.add_edge(root, vasp_node, key="tx1", amount=10.5, timestamp=datetime.utcnow())

    candidate_nodes = [{"node": vasp_node, "data": g.nodes[vasp_node]}]
    feats = extract_candidate_features(g, root, "Binance", candidate_nodes)

    assert isinstance(feats, dict)
    assert len(feats) == len(FEATURE_NAMES)
    assert feats["min_hop_distance"] == 1.0
    assert feats["direct_transfer_count"] == 1.0
    assert feats["total_cluster_inflow"] == 10.5
    assert feats["is_direct_hop1"] == 1.0

    vec = feature_dict_to_vector(feats)
    assert len(vec) == len(FEATURE_NAMES)


def test_wallet_level_split_no_leakage():
    builder = DatasetBuilder()
    records = builder.load_labelled_addresses()
    assert len(records) > 0

    train_rec, val_rec, test_rec = builder.create_wallet_level_split(records, random_seed=42)

    train_addrs = set(r["address"] for r in train_rec)
    val_addrs = set(r["address"] for r in val_rec)
    test_addrs = set(r["address"] for r in test_rec)

    # Assert strict zero-overlap
    assert len(train_addrs.intersection(val_addrs)) == 0
    assert len(train_addrs.intersection(test_addrs)) == 0
    assert len(val_addrs.intersection(test_addrs)) == 0


def test_ml_inference_service():
    is_avail = MLInferenceService.is_available()
    assert is_avail is True

    g = nx.MultiDiGraph()
    root = "0x1111111111111111111111111111111111111111"
    vasp_node = "0x28c6c06298d514db089934071355e5743bf21d60"

    g.add_node(root, hop=0, role="INPUT_WALLET")
    g.add_node(vasp_node, hop=1, role="KNOWN_VASP", vasp_name="Binance", confidence_score=98.0)
    g.add_edge(root, vasp_node, key="tx1", amount=10.5, timestamp=datetime.utcnow())

    candidate_nodes = [{"node": vasp_node, "data": g.nodes[vasp_node]}]
    pred = MLInferenceService.predict_candidate(g, root, "Binance", candidate_nodes)

    assert pred["ml_available"] is True
    assert pred["ml_score"] is not None
    assert 0.0 <= pred["ml_score"] <= 100.0
    assert len(pred["top_features"]) > 0


def test_offline_evaluator():
    evaluator = OfflineEvaluator(random_seed=42)
    results = evaluator.run_evaluation()

    assert "comparative_benchmarks" in results
    benchmarks = results["comparative_benchmarks"]

    assert "rule_based_baseline" in benchmarks
    assert "ml_model_alone" in benchmarks
    assert "hybrid_ensemble_0.70_rule_0.30_ml" in benchmarks

    assert results["dataset_summary"]["usable_test_wallets"] > 0
    assert results["deployment_status"] in ["EXPERIMENTAL_EVALUATION_ONLY", "ACTIVE_WITH_EXPLAINABILITY"]
