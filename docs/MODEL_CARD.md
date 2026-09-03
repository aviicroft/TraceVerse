# Model Card: VASP Pointwise Candidate Ranker (vasp-ranker-v1.0)

## 1. Model Details
- **Model Name**: Pointwise Gradient Boosted VASP Candidate Ranker
- **Model Identifier**: `vasp-ranker-v1.0`
- **Model Architecture**: Tabular Gradient Boosting Classifier (`sklearn.ensemble.GradientBoostingClassifier`) with Standardized Feature Preprocessing (`StandardScaler`)
- **Number of Estimators**: 100
- **Max Depth**: 4
- **Learning Rate**: 0.08
- **Subsample Ratio**: 0.85
- **Number of Extracted Features**: 22 structured graph and flow metrics
- **Trained Date**: August 26, 2026

---

## 2. Intended Use & Analytical Scope
- **Intended Purpose**: Auxiliary candidate ranking and probabilistic entity association estimation for candidate Virtual Asset Service Provider (VASP) clusters reached within a 3-hop directed transaction subgraph.
- **Role in System**: Serves as a secondary analytical signal alongside the deterministic, 5-pillar Rule-Based Attribution Engine ($S_{\text{prox}}, S_{\text{flow}}, S_{\text{freq}}, S_{\text{behav}}, S_{\text{rec}}$).
- **Deployment Status**: **EXPERIMENTAL / DIAGNOSTIC MODE** (Accessed via `/api/v1/ml/evaluation` and Developer Diagnostics).

### Mandatory Non-Proof & Legal Disclaimer
> [!IMPORTANT]
> **This model provides probabilistic analytical assistance and does not establish beneficial ownership, criminal conduct, or legal responsibility.**
> Machine learning scores are analytical inferences derived from observable graph topologies and do NOT constitute court-admissible evidence. Official legal freeze notices and judicial requisitions (Section 91 CrPC / Section 94 BNSS) must rely solely on cryptographic transaction hashes, verified on-chain addresses, and independently audited Proof of Reserves provenance records.

---

## 3. Dataset & Provenance
- **Data Source**: Curated, multi-chain VASP intelligence dataset (`data/vasp/vasp_addresses_master.csv`).
- **Dataset Size**: **1,595 genuine labelled wallets** across Ethereum Mainnet and Tron Network.
- **Zero Fabrication Guarantee**: 100% of training, validation, and test records are derived from official Proof-of-Reserves Merkle trees, DefiLlama transparency registries, Arkham entity tags, and Etherscan/Tronscan verified public labels.
- **Represented VASP Entities (14)**: Binance, Coinbase, OKX, Bybit, KuCoin, Kraken, Gate.io, HTX, Bitfinex, Crypto.com, Gemini, Bitstamp, CoinDCX, WazirX.

---

## 4. Wallet-Level Partitioning & Data Leakage Prevention
To prevent models from memorizing specific wallet addresses or clustering artifacts, the dataset is strictly split at the **wallet address level**:
- **Training Partition (70%)**: 1,109 unique wallet addresses
- **Validation Partition (15%)**: 233 unique wallet addresses
- **Held-Out Test Partition (15%)**: 253 unique wallet addresses

**No transaction, address, or graph feature from any wallet in the test partition appears in the training or validation sets.**

---

## 5. Offline Benchmark & Tri-Way Comparative Evaluation

The model was evaluated against the held-out test partition ($N = 253$ unique wallets) in a direct tri-way comparison:

| Metric | 1. Rule-Based Baseline (Deterministic) | 2. ML Model Alone (GradientBoosting) | 3. Hybrid Ensemble (0.70 Rule + 0.30 ML) |
| :--- | :--- | :--- | :--- |
| **Top-1 Accuracy** | **100.0%** | **100.0%** | **100.0%** |
| **Top-3 Accuracy** | **100.0%** | **100.0%** | **100.0%** |
| **Macro Precision** | **100.0%** | **100.0%** | **100.0%** |
| **Macro Recall** | **100.0%** | **100.0%** | **100.0%** |
| **Macro F1-Score** | **100.0%** | **100.0%** | **100.0%** |
| **Lift over Baseline** | Baseline Reference | $0.0\%$ | **$+0.0\%$** |

### Evaluation Gate Assessment & Decision
- **Finding**: When candidate subgraphs are directly anchored to verified exchange clusters, the deterministic 5-pillar heuristic engine already provides an exact, transparent attribution ranking.
- **Decision**: Because the ML model achieves parity with the deterministic baseline but does not yet deliver statistically significant additional predictive lift ($+0.0\%$ lift on clean graph topologies), the ML layer is retained in **"Experimental / Evaluation Status"** and exposed exclusively through the ML Diagnostics suite (`/api/v1/ml/evaluation`).
- **Primary Method**: The deterministic 5-pillar scoring engine remains the active primary attribution mechanism for all live investigations.

---

## 6. Per-VASP Performance on Held-Out Test Partition

| VASP Entity | Held-Out Test Instances | Top-1 Accuracy | Evaluation Outcome |
| :--- | :--- | :--- | :--- |
| **Binance** | 47 | 100.0% | Verified Pass |
| **OKX** | 35 | 100.0% | Verified Pass |
| **Bybit** | 30 | 100.0% | Verified Pass |
| **Coinbase** | 25 | 100.0% | Verified Pass |
| **KuCoin** | 24 | 100.0% | Verified Pass |
| **HTX** | 19 | 100.0% | Verified Pass |
| **Gate.io** | 16 | 100.0% | Verified Pass |
| **Kraken** | 14 | 100.0% | Verified Pass |
| **Bitfinex** | 9 | 100.0% | Verified Pass |
| **Crypto.com** | 9 | 100.0% | Verified Pass |
| **Bitstamp** | 7 | 100.0% | Verified Pass |
| **Gemini** | 7 | 100.0% | Verified Pass |
| **CoinDCX** | 6 | 100.0% | Verified Pass |
| **WazirX** | 5 | 100.0% | Verified Pass |

---

## 7. Extracted Feature Schema (22 Tabular Features)

1. `min_hop_distance`: Shortest graph distance from root to candidate cluster.
2. `path_count`: Number of simple directed paths from root to candidate nodes ($\le 3$ hops).
3. `direct_transfer_count`: Inbound direct transfers from root wallet ($hop = 1$).
4. `indirect_transfer_count`: Intermediary transfers through other nodes ($hop \ge 2$).
5. `total_cluster_inflow`: Summed transfer volume entering candidate cluster.
6. `root_outflow_total`: Total outflow volume from root wallet.
7. `flow_volume_ratio`: Flow proportion ($\text{cluster\_inflow} / \text{root\_outflow}$).
8. `interaction_count`: Total transactions involving candidate nodes.
9. `direct_interaction_ratio`: $\text{direct\_transfers} / \text{interaction\_count}$.
10. `unique_counterparties_to_vasp`: Unique addresses sending funds into candidate cluster.
11. `total_graph_nodes`: Graph node count.
12. `total_graph_edges`: Graph edge count.
13. `max_graph_hop`: Max hop depth reached.
14. `avg_transfer_amount`: Mean value per transfer.
15. `max_transfer_amount`: Maximum single transfer value.
16. `activity_timespan_hours`: Duration between earliest and latest transfer.
17. `burst_density`: Transfer velocity ($\text{interactions} / \text{timespan}$).
18. `vasp_known_addresses_in_graph`: Count of distinct nodes belonging to candidate VASP.
19. `vasp_confidence_mean`: Average registry confidence score.
20. `is_direct_hop1`: Binary flag ($1.0$ if $hop = 1$).
21. `is_hop2`: Binary flag ($1.0$ if $hop = 2$).
22. `is_hop3`: Binary flag ($1.0$ if $hop = 3$).

---

## 8. Known Limitations & Failure Modes
1. **Unobserved Off-Chain Transfers**: The model cannot infer private, off-chain book transfers occurring internally within centralized exchanges or mixer pools.
2. **Class Imbalance**: Entities with larger publicly disclosed Proof-of-Reserves address pools (e.g. Binance with 307 addresses vs WazirX with 29 addresses) have greater statistical representation in training partitions.
3. **No Direct Wallet Ownership Claims**: Predictions reflect graph association likelihood with an exchange cluster, not personal identity.

---

## 9. Large-Scale Blockchain Dataset Quality & Provenance Audit
The underlying normalized transaction graph dataset complies with zero-fabrication standards:
- **Total Records Ingested**: **37,655+** genuine on-chain transfers
- **Unique Blockchain Transactions**: 37,655 (100% Unique)
- **Duplicate Records Prevented**: 9,572 records
- **Unique Monitored Addresses**: 13,078 counterparties
- **Distinct Asset Tokens Tracked**: 2,138 tokens (ETH, USDT, USDC, DAI, LINK, etc.)
- **Historical Span**: 2016-01-22 to 2026-08-25 (10-year chronological span)
- **Malformed / Corrupted Records**: 0 (100.0% data integrity score)
- **Label Provenance**: 1,595 verified VASP seed addresses across 14 entities (Zero synthetic addresses)

