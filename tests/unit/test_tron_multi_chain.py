from backend.app.core.address_validator import (
    is_valid_tron_address,
    detect_blockchain,
    is_valid_crypto_address,
    normalize_address
)

def test_tron_address_validation():
    # Valid Tron addresses (start with T, 34 chars Base58)
    valid_tron = "TMuA6YMeL4nNFYWAnWUCtqnmEvrCfsugnR"
    assert is_valid_tron_address(valid_tron) is True
    assert is_valid_crypto_address(valid_tron) is True
    assert detect_blockchain(valid_tron) == "tron"
    assert normalize_address(valid_tron) == valid_tron

def test_eth_vs_tron_detection():
    eth_addr = "0x28C6c06298d514Db089934071355E5743bf21d60"
    tron_addr = "TMuA6YMeL4nNFYWAnWUCtqnmEvrCfsugnR"
    
    assert detect_blockchain(eth_addr) == "ethereum"
    assert detect_blockchain(tron_addr) == "tron"
    assert is_valid_crypto_address(eth_addr) is True
    assert is_valid_crypto_address(tron_addr) is True
