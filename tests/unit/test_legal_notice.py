import datetime
from backend.app.schemas.analysis import AttributionSchema, NormalizedTransaction
from backend.app.services.reporting.legal_notice_generator import LegalNoticeGenerator

def test_generate_freeze_notice():
    attr = AttributionSchema(
        vasp_name="Binance",
        score=87.5,
        evidence_strength="High",
        rank=1,
        summary="Flow traced to Binance cluster"
    )
    
    txs = [
        NormalizedTransaction(
            tx_hash="0xabcd1234ef567890",
            block_number=1000,
            timestamp=datetime.datetime.utcnow(),
            from_address="0xfrom1234567890",
            to_address="0xto1234567890",
            asset_type="ETH",
            amount=5.0,
            token_symbol="ETH"
        )
    ]
    
    notice = LegalNoticeGenerator.generate_freeze_notice(
        case_id="case-12345",
        wallet_address="0xfrom1234567890",
        chain="ethereum",
        attribution=attr,
        evidence=[],
        transactions=txs,
        officer_name="Inspector R. K. Sharma",
        police_station="Cyber Crime Police Station",
        crime_number="NCRP/2026/88421"
    )
    
    assert "notice_markdown" in notice
    assert "SECTION 91 OF CODE OF CRIMINAL PROCEDURE" in notice["notice_markdown"]
    assert "Binance" in notice["vasp_name"]
    assert "case-management@binance.com" in notice["compliance_email"]
    assert "0xabcd1234ef567890" in notice["notice_markdown"]
