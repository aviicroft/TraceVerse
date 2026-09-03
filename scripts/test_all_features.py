import requests
import time
import sys

BASE = 'http://localhost:8000/api/v1'

def main():
    print("--- 1. Testing Health & API Connectivity ---")
    r = requests.get(f'{BASE}/health')
    assert r.status_code == 200, f"Health check failed: {r.status_code}"
    print(f"[PASS] Health Check OK: {r.json()}")

    print("\n--- 2. Testing VASP Registry (1,595 Addresses) ---")
    r = requests.get(f'{BASE}/vasps/stats')
    assert r.status_code == 200, f"VASP stats failed: {r.status_code}"
    stats = r.json()
    print(f"[PASS] VASP Stats: {stats['total_addresses']} addresses across {stats['total_vasps']} VASPs")

    r = requests.get(f'{BASE}/vasps/addresses?query=binance&limit=5')
    assert r.status_code == 200, f"VASP search failed: {r.status_code}"
    print(f"[PASS] VASP Search: found {r.json()['total']} matches for 'binance'")

    print("\n--- 3. Testing NCRP Complaint Triage Intake ---")
    r = requests.get(f'{BASE}/ncrp/cases')
    assert r.status_code == 200, f"NCRP cases failed: {r.status_code}"
    cases = r.json()
    print(f"[PASS] NCRP Intake: {len(cases)} complaints queued")

    print("\n--- 4. Testing End-to-End Multi-Hop Forensic Trace ---")
    target = '0x28C6c06298d514Db089934071355E5743bf21d60'
    r = requests.post(f'{BASE}/analyze', json={'wallet_address': target, 'max_hops': 2})
    assert r.status_code == 200, f"Start analysis failed: {r.status_code}"
    aid = r.json()['analysis_id']
    print(f"   Analysis initiated: {aid}")

    # Poll status
    status = 'QUEUED'
    for i in range(25):
        time.sleep(1)
        st = requests.get(f'{BASE}/analysis/{aid}').json()
        status = st.get('status')
        if status in ('COMPLETED', 'FAILED'):
            print(f"[PASS] Analysis finished in {i+1}s with status: {status}")
            break

    assert status == 'COMPLETED', f"Pipeline failed: {status}"

    print("\n--- 5. Testing Multi-Hop Graph Traversal Synthesis ---")
    g = requests.get(f'{BASE}/analysis/{aid}/graph').json()
    print(f"[PASS] Graph Data: {len(g.get('nodes', []))} nodes, {len(g.get('edges', []))} edges")

    print("\n--- 6. Testing Mathematical Attribution Scoring ---")
    attrs = requests.get(f'{BASE}/analysis/{aid}/attributions').json()
    assert len(attrs) > 0, "No attributions produced"
    print(f"[PASS] Attribution: Top VASP = {attrs[0]['vasp_name']}, Score = {attrs[0]['score']}, Strength = {attrs[0]['evidence_strength']}")

    print("\n--- 7. Testing Evidence & Findings Register ---")
    ev = requests.get(f'{BASE}/analysis/{aid}/evidence').json()
    assert len(ev) > 0, "No evidence generated"
    print(f"[PASS] Evidence Register: {len(ev)} verifiable evidence items generated")

    print("\n--- 8. Testing Section 91 CrPC Statutory Freeze Notice Generation ---")
    fn = requests.get(
        f'{BASE}/analysis/{aid}/freeze-notice',
        params={
            'officer_name': 'Inspector R. K. Sharma',
            'police_station': 'Cyber Crime Police Station, CID',
            'crime_number': 'NCRP/2026/CYBER-FIN/8842'
        }
    ).json()
    assert 'notice_markdown' in fn, "Freeze notice missing markdown"
    print(f"[PASS] Freeze Notice Generated:")
    print(f"   VASP: {fn.get('vasp_name')}")
    print(f"   Reference: {fn.get('ref_number')}")
    print(f"   Target Email: {fn.get('compliance_email')}")
    print(f"   First 120 chars: {fn.get('notice_markdown')[:120].strip()}...")

    print("\n--- 9. Testing Case Dossier Markdown & JSON Export ---")
    rep = requests.get(f'{BASE}/analysis/{aid}/report?format=markdown').json()
    assert 'report_markdown' in rep, "Case dossier missing markdown"
    print(f"[PASS] Case Dossier Generated: {len(rep['report_markdown'])} chars")

    print("\n========================================================")
    print("ALL 9 CRITICAL FORENSIC WORKFLOWS VALIDATED & WORKING")
    print("========================================================")

if __name__ == '__main__':
    main()
