import {
  AnalysisStatus,
  GraphData,
  Attribution,
  EvidenceItem,
  NormalizedTransaction,
  InvestigationReport,
  VASPItem,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'API request failed';
    try {
      const data = await res.json();
      errorDetail = data.detail || errorDetail;
    } catch {
      errorDetail = res.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  async startAnalysis(walletAddress: string, maxHops: number = 3): Promise<AnalysisStatus> {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_address: walletAddress, max_hops: maxHops }),
    });
    return handleResponse<AnalysisStatus>(res);
  },

  async getAnalysisStatus(analysisId: string): Promise<AnalysisStatus> {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}`, { cache: 'no-store' });
    return handleResponse<AnalysisStatus>(res);
  },

  async getAnalysisGraph(analysisId: string): Promise<GraphData> {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}/graph`, { cache: 'no-store' });
    return handleResponse<GraphData>(res);
  },

  async getAnalysisAttributions(analysisId: string): Promise<Attribution[]> {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}/attributions`, { cache: 'no-store' });
    return handleResponse<Attribution[]>(res);
  },

  async getAnalysisEvidence(analysisId: string): Promise<EvidenceItem[]> {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}/evidence`, { cache: 'no-store' });
    return handleResponse<EvidenceItem[]>(res);
  },

  async getAnalysisTransactions(analysisId: string): Promise<NormalizedTransaction[]> {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}/transactions`, { cache: 'no-store' });
    return handleResponse<NormalizedTransaction[]>(res);
  },

  async getAnalysisReport(analysisId: string, format: 'json' | 'markdown' = 'json'): Promise<InvestigationReport | { report_markdown: string }> {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}/report?format=${format}`, { cache: 'no-store' });
    return handleResponse(res);
  },

  async getVASPRegistry(): Promise<VASPItem[]> {
    const res = await fetch(`${API_BASE_URL}/vasps`, { cache: 'no-store' });
    return handleResponse<VASPItem[]>(res);
  },

  async getVASPStats(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/vasps/stats`, { cache: 'no-store' });
    return handleResponse(res);
  },

  async getVASPAddresses(params: {
    query?: string;
    chain?: string;
    vasp_name?: string;
    address_type?: string;
    verification_status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ total: number; limit: number; offset: number; addresses: any[] }> {
    const sp = new URLSearchParams();
    if (params.query) sp.append('query', params.query);
    if (params.chain) sp.append('chain', params.chain);
    if (params.vasp_name) sp.append('vasp_name', params.vasp_name);
    if (params.address_type) sp.append('address_type', params.address_type);
    if (params.verification_status) sp.append('verification_status', params.verification_status);
    if (params.limit !== undefined) sp.append('limit', params.limit.toString());
    if (params.offset !== undefined) sp.append('offset', params.offset.toString());
    const res = await fetch(`${API_BASE_URL}/vasps/addresses?${sp.toString()}`, { cache: 'no-store' });
    return handleResponse(res);
  },

  async getRecentAnalyses(): Promise<AnalysisStatus[]> {
    const res = await fetch(`${API_BASE_URL}/recent`, { cache: 'no-store' });
    return handleResponse<AnalysisStatus[]>(res);
  },

  async getFreezeNotice(analysisId: string, officerName?: string, policeStation?: string, crimeNumber?: string): Promise<any> {
    const params = new URLSearchParams();
    if (officerName) params.append('officer_name', officerName);
    if (policeStation) params.append('police_station', policeStation);
    if (crimeNumber) params.append('crime_number', crimeNumber);
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}/freeze-notice?${params.toString()}`, { cache: 'no-store' });
    return handleResponse(res);
  },

  async getNCRPCases(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/ncrp/cases`, { cache: 'no-store' });
    return handleResponse<any[]>(res);
  },

  async getHealth(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
    return handleResponse(res);
  },

  async getMLEvaluation(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/ml/evaluation`, { cache: 'no-store' });
    return handleResponse(res);
  },

  async getDatasetIngestionStatus(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/data/ingestion-status`, { cache: 'no-store' });
    return handleResponse(res);
  },

  async startDatasetIngestion(target: number = 100000): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/data/start-ingestion?target=${target}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
  },

  async stopDatasetIngestion(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/data/stop-ingestion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
  },

  async getCandidates(params: {
    chain?: string;
    min_score?: number;
    min_tx?: number;
    vasp?: string;
    status?: string;
    search?: string;
    sort_by?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<any> {
    const sp = new URLSearchParams();
    if (params.chain) sp.append('chain', params.chain);
    if (params.min_score !== undefined) sp.append('min_score', params.min_score.toString());
    if (params.min_tx !== undefined) sp.append('min_tx', params.min_tx.toString());
    if (params.vasp) sp.append('vasp', params.vasp);
    if (params.status) sp.append('status', params.status);
    if (params.search) sp.append('search', params.search);
    if (params.sort_by) sp.append('sort_by', params.sort_by);
    if (params.limit !== undefined) sp.append('limit', params.limit.toString());
    if (params.offset !== undefined) sp.append('offset', params.offset.toString());
    const res = await fetch(`${API_BASE_URL}/candidates?${sp.toString()}`, { cache: 'no-store' });
    return handleResponse(res);
  },

  async getCandidateStats(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/candidates/stats`, { cache: 'no-store' });
    return handleResponse(res);
  },

  async triggerCandidateDiscovery(max_seeds: number = 20, max_candidates_per_seed: number = 15): Promise<any> {
    const res = await fetch(
      `${API_BASE_URL}/candidates/discover?max_seeds=${max_seeds}&max_candidates_per_seed=${max_candidates_per_seed}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return handleResponse(res);
  },
};


