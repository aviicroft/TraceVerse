# TRACEVERSE REST API Reference

Base URLs:
- **Production Backend**: `https://TRACEVERSE-backend.onrender.com/api/v1`
- **Local Development**: `http://localhost:8000/api/v1`
- **Interactive Documentation**: `https://TRACEVERSE-sand.vercel.app/docs.html`

---

## 1. Multi-Chain Investigation Lifecycle

### `POST /api/v1/analyze`
Initiates an asynchronous 1–3 hop VASP attribution analysis on an Ethereum (`0x...`) or Tron (`T...`) address.

#### Request Body:
```json
{
  "wallet_address": "0x28C6c06298d514Db089934071355E5743bf21d60",
  "max_hops": 3
}
```

#### Response (`200 OK`):
```json
{
  "analysis_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "wallet_address": "0x28c6c06298d514db089934071355e5743bf21d60",
  "status": "QUEUED",
  "started_at": "2026-08-28T05:00:00Z",
  "num_transactions": 0,
  "num_nodes": 1,
  "num_edges": 0
}
```

---

### `GET /api/v1/analysis/{analysis_id}`
Polls current execution status, node counts, top attribution, and risk assessments.

#### Status Lifecycle:
`QUEUED` → `FETCHING_DATA` → `BUILDING_GRAPH` → `ANALYZING` → `COMPLETED` / `FAILED`

---

### `GET /api/v1/analysis/{analysis_id}/graph`
Retrieves Cytoscape.js compatible nodes and edges with per-node volumetric inflows, outflows, and styling roles.

---

### `GET /api/v1/analysis/{analysis_id}/attributions`
Retrieves ranked candidate VASPs with 5-pillar mathematical score breakdowns ($S_{\text{prox}}, S_{\text{flow}}, S_{\text{freq}}, S_{\text{behav}}, S_{\text{rec}}$) and evidence strength (`HIGH`, `MEDIUM`, `LOW`).

---

### `GET /api/v1/analysis/{analysis_id}/evidence`
Retrieves timestamped audit trail linking each attribution finding to specific transaction hashes and hop distances.

---

### `GET /api/v1/analysis/{analysis_id}/report?format=json|markdown`
Generates court-admissible forensic dossiers with cryptographic hashes, Section 65B certificates, and methodology disclaimers.

---

### `GET /api/v1/analysis/{analysis_id}/legal-notice`
Generates a pre-filled **Section 91 CrPC / Section 94 BNSS Asset Preservation & Freeze Order** addressed to the top attributed VASP compliance unit.

---

## 2. Automated Unknown Candidate Discovery & Quality Ranking

### `GET /api/v1/candidates`
Returns dynamically discovered and ranked unknown wallet candidates suitable for investigation.

#### Query Parameters:
- `chain` (*string, optional*): Filter by `ethereum` or `tron`.
- `min_score` (*float, optional*): Minimum Candidate Quality Score ($0 - 100$).
- `min_tx` (*int, optional*): Minimum observed transaction count.
- `vasp` (*string, optional*): Filter by reachable or discovery VASP name.
- `status` (*string, optional*): `investigation_ready` or `insufficient_activity`.
- `search` (*string, optional*): Search by wallet address prefix or suffix.
- `sort_by` (*string, default `quality`*): `quality`, `txs`, `volume`, or `recency`.
- `limit` (*int, default 50*): Page limit ($1 - 200$).
- `offset` (*int, default 0*): Page offset.

---

### `GET /api/v1/candidates/stats`
Returns live summary statistics on VASP seeds swept, counterparties extracted, filtered count, surviving count, and hop distribution.

---

### `POST /api/v1/candidates/discover`
Dispatches background worker to sweep VASP seeds for new counterparties.

---

## 3. VASP Registry & Intelligence Endpoints

### `GET /api/v1/vasps`
Returns all indexed VASP entities with addresses, categories, and proof citations.

### `GET /api/v1/vasps/stats`
Returns aggregate statistics of the 1,595+ verified VASP addresses across chains and categories.

---

## 4. NCRP Cybercrime Triage Endpoints

### `GET /api/v1/ncrp/cases`
Returns mock or live National Cyber Crime Reporting Portal (NCRP) complaints.

### `POST /api/v1/ncrp/triage`
Submits bulk NCRP incident lists for automated batch attribution scoring.

---

## 5. Machine Learning & Diagnostics Endpoints

### `GET /api/v1/ml/evaluation`
Returns offline hold-out benchmark metrics across Deterministic Rule Baseline, ML Alone, and Hybrid Ensemble.

### `GET /api/v1/ml/status`
Returns active status of tabular ML gradient boosted ranker.

---

## 6. System Health & Ingestion Management

### `GET /api/v1/health`
Returns system status, supported chains (`Ethereum Mainnet`, `Tron Network (TRC-20)`), and indexed VASP count (1,595).

### `GET /api/v1/data/ingestion-status`
Returns multi-chain transaction ingestion counts, data integrity verification metrics, and rate limit statistics.
