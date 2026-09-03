# Investigation Methodology & Scoring Formulation

## 1. Graph Traversal Algorithm
The system constructs a directed multi-edge transaction graph using NetworkX:
- **Root Node (Hop 0)**: The input target Ethereum wallet address.
- **Hop 1**: Direct counterparties (senders and receivers interacting directly with Root).
- **Hop 2**: Counterparties interacting with Hop 1 addresses.
- **Hop 3**: Counterparties interacting with Hop 2 addresses.

### Cycle Protection & Bound Enforcement:
1. **Visited Set Tracking**: Prevents endless loops if funds circulate between wallets.
2. **Terminal Node Halting**: When a traversal reaches a known VASP endpoint (e.g. exchange deposit/hot wallet), traversal ceases past that node.
3. **Explosion Cap**: Local graph construction stops if total nodes exceed `MAX_NODES_PER_ANALYSIS` (default: 150 nodes).

---

## 2. Explainable Attribution Scoring Formula

The Attribution Score ($S_{total}$) ranges from $0$ to $100$ and is computed as:

$$S_{total} = (S_{prox} \times w_{prox}) + (S_{flow} \times w_{flow}) + (S_{freq} \times w_{freq}) + (S_{behav} \times w_{behav}) + (S_{rec} \times w_{rec})$$

Where:
- $w_{prox} = 0.35$ (Graph Proximity Weight)
  - Hop 1 = $100.0$
  - Hop 2 = $60.0$
  - Hop 3 = $30.0$
- $w_{flow} = 0.25$ (Fund Flow Weight): $\min(\frac{\text{Observed Flow to VASP Cluster}}{\text{Root Outflow}}, 1.0) \times 100$
- $w_{freq} = 0.20$ (Interaction Frequency Weight): $\min(\text{Interactions} \times 10.0, 100.0)$
- $w_{behav} = 0.10$ (Behavioral Continuity): Structural path consistency.
- $w_{rec} = 0.10$ (Temporal Recency): Recency of interaction timestamps.

---

## 3. Structural Risk Classification
The risk classifier categorizes observed fund flow into `LOW`, `MEDIUM`, or `HIGH`:
1. **Multi-Hop Layering**: Fund movement across 3 hops (+40 risk points).
2. **High Velocity / Burst Transfers**: > 20 transactions in the local graph (+25 risk points).
3. **Counterparty Dispersion**: Flow split across $\ge 3$ intermediate addresses (+25 risk points).
4. **Rapid Pass-through**: Transfers executed in $< 2$ hours (+25 risk points).
