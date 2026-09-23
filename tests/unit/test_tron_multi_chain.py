from backend.app.core.address_validator import (
    is_valid_tron_address,
    is_valid_eth_address,
    detect_blockchain,
    is_valid_crypto_address,
    normalize_address,
    validate_address,
)
from backend.app.services.vasp.matcher import vasp_matcher
from backend.app.services.discovery.candidate_miner import CandidateMiner
from backend.app.schemas.analysis import NormalizedTransaction
from datetime import datetime, timezone


def test_tron_address_validation():
    # Real on-chain verified Tron addresses
    valid_tron_hot = "TDqSquXBgUCLYvYC4XZgrprLK589dkhSCf"  # Binance Hot 7
    valid_tron_usdt = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" # Official USDT TRC-20
    valid_tron_okx = "TLaGjwhvA8XQYSxFAcAXy7Dvuue9eGYitv"  # OKX Hot 8

    assert is_valid_tron_address(valid_tron_hot) is True
    assert is_valid_tron_address(valid_tron_usdt) is True
    assert is_valid_tron_address(valid_tron_okx) is True
    assert is_valid_crypto_address(valid_tron_hot) is True
    assert detect_blockchain(valid_tron_hot) == "tron"
    assert normalize_address(valid_tron_hot) == valid_tron_hot


def test_tron_address_rejection():
    # Invalid checksum (last character altered)
    bad_checksum = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6a"
    assert is_valid_tron_address(bad_checksum) is False

    # Invalid Base58 character ('0' is forbidden in Base58)
    bad_char = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj0"
    assert is_valid_tron_address(bad_char) is False

    # Wrong length
    short_addr = "TR7NHqjeKQxGTCi8q8ZY"
    assert is_valid_tron_address(short_addr) is False

    # Ethereum address passed to Tron validator
    eth_addr = "0x28C6c06298d514Db089934071355E5743bf21d60"
    assert is_valid_tron_address(eth_addr) is False


def test_chain_aware_validation():
    eth_addr = "0x28C6c06298d514Db089934071355E5743bf21d60"
    tron_addr = "TDqSquXBgUCLYvYC4XZgrprLK589dkhSCf"

    assert validate_address(eth_addr, "ethereum") is True
    assert validate_address(eth_addr, "tron") is False
    assert validate_address(tron_addr, "tron") is True
    assert validate_address(tron_addr, "ethereum") is False


def test_eth_vs_tron_detection():
    eth_addr = "0x28C6c06298d514Db089934071355E5743bf21d60"
    tron_addr = "TDqSquXBgUCLYvYC4XZgrprLK589dkhSCf"

    assert detect_blockchain(eth_addr) == "ethereum"
    assert detect_blockchain(tron_addr) == "tron"
    assert is_valid_crypto_address(eth_addr) is True
    assert is_valid_crypto_address(tron_addr) is True


def test_tron_vasp_matching():
    binance_tron = "TDqSquXBgUCLYvYC4XZgrprLK589dkhSCf"
    okx_tron = "TLaGjwhvA8XQYSxFAcAXy7Dvuue9eGYitv"

    assert vasp_matcher.is_vasp(binance_tron) is True
    match = vasp_matcher.match_address(binance_tron)
    assert match is not None
    assert match["vasp_name"] == "Binance"
    assert match["chain"] == "tron"

    match_okx = vasp_matcher.match_address(okx_tron)
    assert match_okx is not None
    assert match_okx["vasp_name"] == "OKX"


def test_tron_candidate_mining_and_profile():
    miner = CandidateMiner()
    seed_vasp = "Binance"
    seed_addr = "TDqSquXBgUCLYvYC4XZgrprLK589dkhSCf"
    candidate_addr = "TLGoX5oGnnGidxZuKd4FHNYxGLp14qXNYs"

    mock_tx = NormalizedTransaction(
        tx_hash="42818539903867fcdf208e65deb47bdec29198d9e9931a82bcd0e19b7caa494c",
        chain="tron",
        block_number=0,
        timestamp=datetime.now(timezone.utc),
        from_address=seed_addr,
        to_address=candidate_addr,
        asset_type="TRC20",
        token_symbol="USDT",
        token_decimals=6,
        amount=3500.0,
        is_error=False
    )

    extracted = miner.extract_counterparties_from_transactions(
        seed_vasp_name=seed_vasp,
        seed_vasp_address=seed_addr,
        transactions=[mock_tx]
    )

    assert len(extracted) == 1
    cand = extracted[0]
    assert cand["address"] == candidate_addr
    assert cand["chain"] == "tron"
    assert cand["is_valid"] is True

    profile = miner.analyze_candidate_profile(cand, [mock_tx])
    assert profile["address"] == candidate_addr
    assert profile["chain"] == "tron"
    assert profile["candidate_quality_score"] > 0
    assert profile["discovery_vasp_name"] == "Binance"
