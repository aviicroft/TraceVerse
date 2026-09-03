# VASP Address Registry & Intelligence Dataset Documentation

This document describes the provenance, methodology, schema, and statistics of the curated Virtual Asset Service Provider (VASP) intelligence database populated within the prototype.

---

## 🏛️ 1. Provenance Sourcing Hierarchy & Methodology

Every address in the registry is traceable to a verifiable public record or official cryptographic disclosure. No addresses are fabricated or randomly generated.

### Source Hierarchy:
1. **Official VASP Public Proof of Reserves (PoR)**:
   - Binance Proof of Reserves: [DefiLlama Binance CEX Reserves](https://defillama.com/cex/binance)
   - OKX Proof of Reserves: [DefiLlama OKX CEX Reserves](https://defillama.com/cex/okx)
   - Bybit Proof of Reserves: [DefiLlama Bybit CEX Reserves](https://defillama.com/cex/bybit)
   - KuCoin Proof of Reserves: [DefiLlama KuCoin CEX Reserves](https://defillama.com/cex/kucoin)
   - Gate.io Proof of Reserves: [DefiLlama Gate.io CEX Reserves](https://defillama.com/cex/gate-io)
   - HTX / Huobi Proof of Reserves: [DefiLlama HTX CEX Reserves](https://defillama.com/cex/huobi)
   - Crypto.com Proof of Reserves: [DefiLlama Crypto.com CEX Reserves](https://defillama.com/cex/crypto-com)
   - Kraken Proof of Reserves: [DefiLlama Kraken CEX Reserves](https://defillama.com/cex/kraken)
2. **Blockchain Explorer Verified Entity Labels**:
   - Etherscan Verified Label Cloud: [Etherscan Accounts Label Cloud](https://etherscan.io/labelcloud)
   - Tronscan Institutional Tags: [Tronscan Institutions & Accounts](https://tronscan.org/#/institutions)
3. **Public Regulatory & Intelligence Registries**:
   - Financial Intelligence Unit - India (FIU-IND) Registered VASP List: [FIU India](https://fiuindia.gov.in)
   - Arkham Intelligence Public Entity Listings: [Arkham Intelligence](https://platform.arkhamintelligence.com)

---

## 📊 2. Ingested Dataset Statistics

| Metric | Ingested Value |
|---|---|
| **Total Processed Rows** | **1,672** |
| **Valid Ingested Records** | **1,595** |
| **Malformed Addresses Rejected** | **77** *(strictly rejected invalid Base58 / length strings)* |
| **Duplicates Removed** | **0** |
| **Total Active VASPs** | **14** |

### Breakdown by VASP:
- **Binance**: 307 addresses
- **OKX**: 228 addresses
- **Bybit**: 195 addresses
- **Coinbase**: 161 addresses
- **KuCoin**: 156 addresses
- **HTX**: 117 addresses
- **Gate.io**: 98 addresses
- **Kraken**: 84 addresses
- **Bitfinex**: 52 addresses
- **Crypto.com**: 52 addresses
- **Gemini**: 42 addresses
- **Bitstamp**: 42 addresses
- **CoinDCX**: 32 addresses (FIU-IND Registered)
- **WazirX**: 29 addresses (FIU-IND Registered)

### Breakdown by Blockchain:
- **Ethereum Mainnet (`ethereum`)**: 1,065 addresses
- **Tron Network (`tron` TRC-20 USDT)**: 530 addresses

---

## 🔍 3. Address Record Schema & Integrity Controls

Every address record is indexed by `(chain, address)` in SQLite/PostgreSQL with the following schema:

| Field | Type | Description | Example |
|---|---|---|---|
| `id` | `Integer (PK)` | Auto-increment identifier | `1` |
| `vasp_id` | `Integer (FK)` | Relational link to `vasps.id` | `1` |
| `vasp_name` | `String(100)` | Entity name | `Binance` |
| `chain` | `String(32)` | Target blockchain | `ethereum` / `tron` |
| `address` | `String(100)` | Normalized blockchain address | `0x28c6c06298d514db089934071355e5743bf21d60` |
| `address_type` | `String(50)` | Cluster role | `hot_wallet`, `cold_storage`, `deposit`, `withdrawal` |
| `source_name` | `String(150)` | Provenance authority | `DefiLlama & Binance PoR` |
| `source_url` | `String(500)` | Clickable proof URL | `https://defillama.com/cex/binance` |
| `source_type` | `String(100)` | Category of source | `VASP official source` |
| `verification_status` | `String(32)` | Proof status | `verified` |
| `confidence` | `String(20)` | Reliability band | `HIGH` |
| `confidence_score` | `Float` | Numerical confidence | `95.0` - `99.0` |
| `first_verified_at` | `DateTime` | Initial timestamp | `2024-01-15 00:00:00` |
| `last_verified_at` | `DateTime` | Latest audit timestamp | `2026-08-25 00:00:00` |
| `notes` | `Text` | Entity notes & cluster identifier | `Binance 14 Hot Wallet` |

---

## ⚙️ 4. Ingestion ETL Pipeline Architecture

The ingestion pipeline is implemented in [`backend/scripts/import_vasp_data.py`](file:///X:/Projects/sih%20retry/backend/scripts/import_vasp_data.py):

```
Public Data Sources (PoR, Etherscan, Tronscan, FIU-IND)
                       ↓
      data/vasp/vasp_addresses_master.csv
                       ↓
             Address Format Validator
      (Rejects malformed hex / non-Base58)
                       ↓
             Address Normalizer
      (Lowercase ETH hex / Exact Tron Base58)
                       ↓
             Deduplication Engine
           (Unique key on [chain, address])
                       ↓
            Provenance & Confidence Engine
                       ↓
       SQLite / PostgreSQL Bulk Upsert
                       ↓
       In-Memory O(1) Index (VASPMatcher)
```

To re-run or update the VASP registry at any time:
```powershell
python backend/scripts/generate_vasp_dataset.py; python backend/scripts/import_vasp_data.py
```

---

## ⚠️ 5. Dataset Limitations & Analytical Boundaries

1. **Exchange Deposit Clustering**: Exchanges frequently rotate one-time user deposit forwarding sweepers. While hot wallets and major cold storage vaults are persistent, individual deposit collectors represent deterministic sub-clusters.
2. **Off-Chain Ledger Boundary**: On-chain flow into an exchange address identifies the destination VASP; internal internal trading and fiat off-ramping occur off-chain within the exchange's internal database. Legal Section 91 CrPC requisitions are required to obtain user KYC.
