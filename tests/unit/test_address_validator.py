import pytest
from backend.app.core.address_validator import (
    is_valid_eth_address,
    normalize_eth_address,
    to_checksum_address
)

def test_valid_eth_addresses():
    valid_addr = "0x28C6c06298d514Db089934071355E5743bf21d60"
    assert is_valid_eth_address(valid_addr) is True
    assert normalize_eth_address(valid_addr) == "0x28c6c06298d514db089934071355e5743bf21d60"

def test_invalid_eth_addresses():
    assert is_valid_eth_address("0x123") is False
    assert is_valid_eth_address("not_an_address") is False
    assert is_valid_eth_address("0xG8C6c06298d514Db089934071355E5743bf21d60") is False  # invalid hex 'G'
    assert is_valid_eth_address("") is False
    assert is_valid_eth_address(None) is False

def test_normalization_error_on_invalid():
    with pytest.raises(ValueError):
        normalize_eth_address("0xinvalid")
