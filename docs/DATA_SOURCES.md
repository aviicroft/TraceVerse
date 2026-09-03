# Data Sources & Provenance

## 1. Blockchain Data Acquisition Infrastructure

The platform acquires live, tamper-evident on-chain data directly from public explorer and node APIs across multiple blockchains:

### A. Ethereum Mainnet
- **Endpoint**: Etherscan v2 JSON-RPC / REST API (`https://api.etherscan.io/v2/api`)
- **Acquired Data**:
  - Native ETH normal transactions (`module=account&action=txlist`)
  - ERC-20 token transfer events (`module=account&action=tokentx` - USDT, USDC, WETH, DAI)
  - Block heights, UTC timestamps, sender, recipient, gas usage, and execution status.

### B. Tron Network (TRC-20)
- **Endpoint**: TronGrid Pro REST API (`https://api.trongrid.io`)
- **Authentication**: `TRON-PRO-API-KEY` header for high-throughput rate limits
- **Acquired Data**:
  - Native TRX account transactions (`/v1/accounts/{address}/transactions`)
  - TRC-20 USDT token transfers (`/v1/accounts/{address}/transactions/trc20`)
  - Block timestamps, contract results, energy, and net usage.

---

## 2. Curated Master VASP Registry (`data/vasp/vasp_addresses_master.csv`)

To prevent fabricated or unverified exchange associations, the VASP registry contains **1,595 verified addresses** across 14 centralized entities curated from authoritative ground-truth sources:

| VASP Entity | Supported Chains | Roles / Types | Ground-Truth Provenance Source |
| :--- | :--- | :--- | :--- |
| **Binance** | Ethereum, Tron | Hot Wallets (7, 14, 15, 16, Sweepers), Cold Reserves | Etherscan Official Labels, DefiLlama Proof of Reserves, Tronscan Verified |
| **Coinbase** | Ethereum | Hot Wallets (1, 2, 3), Prime Custody, Liquidity Hubs | Etherscan Public Labels, Coinbase Official Proof of Reserves |
| **Kraken** | Ethereum, Tron | Hot Wallets (1, 2, 3), Cold Vaults | Etherscan Verified Labels, Arkham Intelligence Entity Tags |
| **OKX** | Ethereum, Tron | Hot Wallets, Deposit Aggregators, Cold Vaults | DefiLlama Reserve Proofs, Arkham Verified |
| **KuCoin** | Ethereum, Tron | Hot Wallets (5, 6), Sweep Collectors | Etherscan Public Labels, DefiLlama Reserves |
| **Gate.io** | Ethereum, Tron | Hot & Deposit Collectors, Cold Storage | Etherscan Public Labels, DefiLlama Reserves |
| **Bitfinex** | Ethereum, Tron | Hot Wallets, Cold Storage Hubs | Etherscan Public Labels, Tronscan Public Labels |
| **WazirX** | Ethereum, Tron | Indian Exchange Hot Wallets & Collectors | FIU-IND Registered, Public Etherscan / Tronscan Labels |
| **CoinDCX** | Ethereum, Tron | Indian VASP Custody & Sweep Wallets | FIU-IND Registered, Public Reserves |
| **HTX / Huobi** | Ethereum, Tron | Hot Wallets, Cold Reserve Clusters | Etherscan Public Labels, Arkham Verified |
| **Bybit** | Ethereum, Tron | High-Volume Sweepers, Reserve Hubs | DefiLlama Proof of Reserves |

---

## 3. Unknown Candidate Discovery Counterparty Sources

Rather than using manual or hardcoded test wallets, candidate target leads are automatically extracted from verified VASP transactions:
- **Seed Origins**: 15+ verified VASP clusters.
- **Counterparty Extraction**: All non-zero transfers sent to or received from verified VASP clusters.
- **Exclusion Filters**: Filtered against the 1,595 VASP addresses, 80+ token contracts, precompiles, and burn addresses (`0x000...000`, `0xdEaD...`).
- **Graph Multi-Hop Validation**: Each candidate's transaction history is fetched and profiled across 1–3 hop VASP paths.

---

## 4. Provenance Integrity Rules

1. **Strict Attribution Disclaimer**: Unknown wallets are legally characterized as: *"Unknown wallet with observed on-chain association to a verified VASP cluster."*
2. **Deterministic Reproducibility**: Every attribution claim cites exact transaction hashes (`tx_hash`), block heights, and hop distances.
3. **Zero Fabrication**: If API responses return no transactions, the system reports this transparently and never substitutes dummy data.
