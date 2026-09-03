import datetime
from typing import Dict, Any, List, Optional
from backend.app.schemas.analysis import AttributionSchema, EvidenceSchema, NormalizedTransaction

VASP_COMPLIANCE_CONTACTS: Dict[str, Dict[str, str]] = {
    "Binance": {
        "entity": "Binance Holdings Ltd. / Compliance Department",
        "email": "case-management@binance.com",
        "portal": "https://www.binance.com/en/support/law-enforcement",
        "jurisdiction": "Global / FIU-IND Registered"
    },
    "WazirX": {
        "entity": "Zanmai Labs Pvt. Ltd. (WazirX Compliance Desk)",
        "email": "lawenforcement@wazirx.com",
        "portal": "https://wazirx.com/law-enforcement",
        "jurisdiction": "India (FIU-IND Registered)"
    },
    "CoinDCX": {
        "entity": "Neblio Technologies Pvt. Ltd. (CoinDCX Legal)",
        "email": "compliance@coindcx.com",
        "portal": "https://coindcx.com/legal",
        "jurisdiction": "India (FIU-IND Registered)"
    },
    "Coinbase": {
        "entity": "Coinbase, Inc. Legal Process Team",
        "email": "lawenforcement@coinbase.com",
        "portal": "https://www.coinbase.com/legal/law-enforcement",
        "jurisdiction": "United States / Global"
    },
    "Kraken": {
        "entity": "Payward, Inc. (Kraken Compliance)",
        "email": "compliance@kraken.com",
        "portal": "https://www.kraken.com/legal",
        "jurisdiction": "Global"
    },
    "OKX": {
        "entity": "OKX Global Law Enforcement Operations",
        "email": "compliance@okx.com",
        "portal": "https://www.okx.com/help",
        "jurisdiction": "Global"
    },
    "KuCoin": {
        "entity": "KuCoin Legal Team",
        "email": "lawenforcement@kucoin.com",
        "portal": "https://www.kucoin.com",
        "jurisdiction": "Global"
    }
}


class LegalNoticeGenerator:
    """
    Generates standardized Law Enforcement Asset Preservation & Freeze Notices
    under Section 91 CrPC / Section 94 BNSS (Bharatiya Nagarik Suraksha Sanhita, 2023)
    and international Mutual Legal Assistance frameworks.
    """

    @staticmethod
    def generate_freeze_notice(
        case_id: str,
        wallet_address: str,
        chain: str,
        attribution: Optional[AttributionSchema],
        evidence: List[EvidenceSchema],
        transactions: List[NormalizedTransaction],
        officer_name: str = "Investigating Officer",
        police_station: str = "Cyber Crime Police Station / CID",
        crime_number: str = "NCRP/2026/CYBER-FRAUD",
        victim_loss: str = "₹ 15,00,000 (INR Equivalent)"
    ) -> Dict[str, Any]:
        vasp_name = attribution.vasp_name if attribution else "Virtual Asset Service Provider"
        contact_info = VASP_COMPLIANCE_CONTACTS.get(vasp_name, {
            "entity": f"{vasp_name} Legal & Compliance Operations",
            "email": "compliance@exchange.com",
            "portal": "Official Law Enforcement Portal",
            "jurisdiction": "International"
        })

        date_str = datetime.datetime.utcnow().strftime("%d-%B-%Y")
        ref_no = f"LEA/CYBER/{datetime.datetime.utcnow().year}/{case_id[:8].upper()}"

        # Extract target VASP deposit transactions
        vasp_txs = [
            t for t in transactions[:5]
        ]

        notice_text = f"""
================================================================================
FORMAL NOTICE FOR PRESERVATION & FREEZING OF CRYPTO ASSETS / BENEFICIAL KYC
UNDER SECTION 91 OF CODE OF CRIMINAL PROCEDURE, 1973 / SECTION 94 OF BNSS, 2023
================================================================================

REF NO: {ref_no}
DATE OF ISSUANCE: {date_str}
NCRP ACKNOWLEDGEMENT NO: {crime_number}

TO:
The Nodal Officer / Compliance Department,
{contact_info['entity']}
Designated Email: {contact_info['email']}
Official LEA Portal: {contact_info['portal']}

FROM:
{officer_name},
{police_station},
Law Enforcement Agency, Republic of India.

SUBJECT: URGENT NOTICE TO PRESERVE AND FREEZE PROCEEDS OF CRIME IN CYBER FRAUD CASE

Sir/Madam,

1. Whereas an investigation is currently underway at this Police Unit regarding organized cyber financial fraud / unauthorized siphoning of victim funds amounting to approximately {victim_loss}.

2. Observable blockchain intelligence and directed fund flow analysis confirm that proceeds of crime originated from/traversed through the following target address and were directly deposited into your platform's custodial infrastructure:

   - Target Suspect Wallet: {wallet_address}
   - Blockchain Network: {chain.upper()}
   - Identified Destination VASP: {vasp_name}
   - Attribution Score: {attribution.score if attribution else 0}/100 ({attribution.evidence_strength if attribution else 'N/A'} Confidence)

3. CRITICAL ON-CHAIN TRANSACTION PROOFS IDENTIFYING DEPOSIT INTO YOUR VASP:
"""

        for i, tx in enumerate(vasp_txs, 1):
            notice_text += f"""
   [{i}] Transaction Hash: {tx.tx_hash}
       - Timestamp: {tx.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}
       - Amount: {tx.amount} {tx.token_symbol}
       - From Address: {tx.from_address}
       - Destination VASP Deposit Address: {tx.to_address}
"""

        notice_text += f"""
4. DIRECTIVES / LEGAL REQUISITIONS UNDER SECTION 91 Cr.P.C. / BNSS:
   You are hereby requested and directed to:
   a) IMMEDIATELY FREEZE / LOCK all funds, crypto balances, and fiat withdrawal capabilities associated with the recipient User UID / Account ID linked to the destination deposit address.
   b) PRESERVE and provide complete KYC (Know Your Customer) records, including full name, verified passport/Aadhaar/national ID, registered phone number, registered email, residential address, and IP login logs (with timestamps and port numbers).
   c) PROVIDE full deposit and withdrawal history for the subject account from inception to date.
   d) CONFIRM compliance with this freeze order via reply email within TWENTY-FOUR (24) HOURS of receipt.

5. NON-DISCLOSURE DIRECTIVE (Gag Order):
   In the interest of ongoing criminal investigation, you are strictly instructed NOT to disclose the existence of this request to the account holder.

Issued under signature and seal of the Investigating Authority.

____________________________________
({officer_name})
{police_station}
Contact / Email: cybercell@police.gov.in
================================================================================
"""

        return {
            "notice_markdown": notice_text.strip(),
            "vasp_name": vasp_name,
            "compliance_email": contact_info["email"],
            "compliance_portal": contact_info["portal"],
            "ref_number": ref_no,
            "crime_number": crime_number,
            "generated_at": datetime.datetime.utcnow().isoformat()
        }
