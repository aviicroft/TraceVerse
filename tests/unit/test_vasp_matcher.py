from backend.app.services.vasp.matcher import vasp_matcher

def test_vasp_seed_loading():
    count = vasp_matcher.load_seed_data()
    assert count >= 1000, f"Expected 1000+ addresses, loaded {count}"

def test_vasp_address_matching():
    # Known Binance 14 hot wallet
    binance_addr = "0x28C6c06298d514Db089934071355E5743bf21d60"
    match = vasp_matcher.match_address(binance_addr)
    assert match is not None
    assert match["vasp_name"] == "Binance"
    assert match["confidence"] in ["HIGH", "VERIFIED"]
    assert match["verification_status"] == "verified"
    assert vasp_matcher.is_known_vasp(binance_addr) is True

def test_unknown_address_matching():
    unknown_addr = "0x000000000000000000000000000000000000dead"
    match = vasp_matcher.match_address(unknown_addr)
    assert match is None
    assert vasp_matcher.is_known_vasp(unknown_addr) is False
