import pytest
from datetime import datetime, timezone

from backend.app.services.discovery.candidate_miner import CandidateMiner
from backend.app.services.discovery.candidate_scorer import CandidateQualityScorer
from backend.app.schemas.analysis import NormalizedTransaction


@pytest.fixture
def miner():
    return CandidateMiner()


@pytest.fixture
def scorer():
    return CandidateQualityScorer()


def test_vasp_exclusion(miner):
    # Binance hot wallet
    binance_addr = "0x28c6c06298d514db089934071355e5743bf21d60"
    is_valid, reason = miner.filter_candidate(binance_addr, "ethereum")
    assert is_valid is False
    assert "VASP Registry" in reason


def test_contract_and_burn_exclusion(miner):
    # Null address
    is_valid, reason = miner.filter_candidate("0x0000000000000000000000000000000000000000", "ethereum")
    assert is_valid is False
    assert "Null/Burn" in reason

    # USDT contract on ETH
    is_valid_usdt, reason_usdt = miner.filter_candidate("0xdac17f958d2ee523a2206206994597c13d831ec7", "ethereum")
    assert is_valid_usdt is False
    assert "Token contract" in reason_usdt


def test_candidate_quality_scoring_bounds(scorer):
    # High activity candidate
    high_res = scorer.calculate_score(
        tx_count=200,
        token_transfers_count=45,
        unique_counterparties=30,
        total_volume_usd=150000.0,
        active_days=25,
        incoming_tx=100,
        outgoing_tx=100,
        min_hop_to_vasp=1,
        reachable_vasp_count=3,
        total_paths_to_vasps=8,
        flow_to_vasp_ratio=0.8
    )

    assert 0.0 <= high_res["candidate_quality_score"] <= 100.0
    assert high_res["candidate_quality_score"] >= 70.0
    assert "breakdown" in high_res
    assert high_res["breakdown"]["history_quality"] > 50.0

    # Low activity candidate
    low_res = scorer.calculate_score(
        tx_count=2,
        token_transfers_count=0,
        unique_counterparties=1,
        total_volume_usd=50.0,
        active_days=1,
        incoming_tx=1,
        outgoing_tx=1,
        min_hop_to_vasp=3,
        reachable_vasp_count=1,
        total_paths_to_vasps=1,
        flow_to_vasp_ratio=0.1
    )

    assert 0.0 <= low_res["candidate_quality_score"] <= 100.0
    assert low_res["candidate_quality_score"] < high_res["candidate_quality_score"]


def test_counterparty_extraction_provenance(miner):
    vasp_seed = "0x28c6c06298d514db089934071355e5743bf21d60"
    mock_unknown = "0x3333333333333333333333333333333333333333"

    txs = [
        NormalizedTransaction(
            tx_hash="0xabc123",
            chain="ethereum",
            block_number=18000000,
            timestamp=datetime.now(timezone.utc),
            from_address=vasp_seed,
            to_address=mock_unknown,
            asset_type="ERC20",
            token_symbol="USDT",
            amount=5000.0
        )
    ]

    extracted = miner.extract_counterparties_from_transactions(
        seed_vasp_name="Binance",
        seed_vasp_address=vasp_seed,
        transactions=txs
    )

    assert len(extracted) == 1
    cand = extracted[0]
    assert cand["address"].lower() == mock_unknown.lower()
    assert cand["discovery_vasp_name"] == "Binance"
    assert cand["discovered_from_tx_hash"] == "0xabc123"
    assert cand["is_valid"] is True


def test_candidate_profile_analysis(miner):
    mock_cand = {
        "address": "0x3333333333333333333333333333333333333333",
        "chain": "ethereum",
        "discovery_vasp_name": "Binance",
        "discovery_vasp_address": "0x28c6c06298d514db089934071355e5743bf21d60",
        "discovered_from_tx_hash": "0x987654"
    }

    txs = [
        NormalizedTransaction(
            tx_hash="0x111",
            chain="ethereum",
            block_number=18000000,
            timestamp=datetime.now(timezone.utc),
            from_address=mock_cand["address"],
            to_address="0x28c6c06298d514db089934071355e5743bf21d60",
            asset_type="ERC20",
            token_symbol="USDT",
            amount=2500.0
        ),
        NormalizedTransaction(
            tx_hash="0x222",
            chain="ethereum",
            block_number=18000050,
            timestamp=datetime.now(timezone.utc),
            from_address="0x1111111111111111111111111111111111111111",
            to_address=mock_cand["address"],
            asset_type="ETH",
            token_symbol="ETH",
            amount=1.5
        )
    ]

    profile = miner.analyze_candidate_profile(mock_cand, txs)

    assert profile["address"] == mock_cand["address"]
    assert profile["transaction_count"] == 2
    assert profile["unique_counterparties_count"] == 2
    assert profile["candidate_quality_score"] > 0.0
    assert profile["min_hop_to_vasp"] == 1
    assert "Binance" in profile["reachable_vasps_json"]

