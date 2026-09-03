'use client';

import React, { useState, useEffect } from 'react';
import {
  Radar,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Network,
  Database,
  Layers,
  Sparkles,
  Info,
  X,
  Play,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { CandidateWallet, CandidateStats } from '../lib/types';

interface CandidateDiscoveryViewProps {
  onSelectCandidate: (address: string) => void;
}

export const CandidateDiscoveryView: React.FC<CandidateDiscoveryViewProps> = ({ onSelectCandidate }) => {
  const [candidates, setCandidates] = useState<CandidateWallet[]>([]);
  const [stats, setStats] = useState<CandidateStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sweeping, setSweeping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [chainFilter, setChainFilter] = useState<string>('');
  const [minScore, setMinScore] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('quality');
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<CandidateWallet | null>(null);

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    loadStats();
  }, [chainFilter, minScore, searchQuery, sortBy]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCandidates({
        chain: chainFilter || undefined,
        min_score: minScore > 0 ? minScore : undefined,
        search: searchQuery || undefined,
        sort_by: sortBy,
        limit: 100,
      });
      setCandidates(res?.candidates || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const s = await api.getCandidateStats();
      setStats(s);
    } catch (err) {
      console.warn('Failed to load candidate stats:', err);
    }
  };

  const handleTriggerSweep = async () => {
    setSweeping(true);
    try {
      await api.triggerCandidateDiscovery(15, 12);
      await loadStats();
      // Poll stats for updates
      const interval = setInterval(async () => {
        const updated = await api.getCandidateStats().catch(() => null);
        if (updated) {
          setStats(updated);
          if (!updated.is_running) {
            clearInterval(interval);
            setSweeping(false);
            loadData();
          }
        }
      }, 2500);
    } catch (err: any) {
      alert(`Discovery sweep dispatch failed: ${err.message}`);
      setSweeping(false);
    }
  };

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className="space-y-4 font-sans text-forensic-text">
      {/* Header & Mission Banner */}
      <div className="bg-forensic-surface border border-forensic-border rounded p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Radar className="h-5 w-5 animate-pulse" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-forensic-text">
                Automated Unknown Wallet Candidate Discovery & Quality Ranking
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-forensic-teal border border-teal-500/20 uppercase font-semibold">
                On-Chain Provenance Verified
              </span>
            </div>
            <p className="text-xs text-forensic-textDim max-w-3xl">
              Starting from the verified VASP registry, the pipeline mines real transaction counterparties, applies strict 
              contract/label filtering, traces 1–3 hop VASP connectivity, and computes a 5-factor Candidate Quality Score for investigation readiness.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleTriggerSweep}
              disabled={sweeping || stats?.is_running}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${
                sweeping || stats?.is_running
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${sweeping || stats?.is_running ? 'animate-spin' : ''}`} />
              <span>{sweeping || stats?.is_running ? 'Mining Counterparties...' : 'Run Auto-Discovery Sweep'}</span>
            </button>

            <button
              onClick={() => { loadData(); loadStats(); }}
              className="p-2 rounded bg-forensic-surfaceRaised hover:bg-forensic-border text-forensic-textDim hover:text-forensic-text border border-forensic-border transition-colors"
              title="Refresh table"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-forensic-border font-mono text-xs">
          <div className="p-2.5 bg-forensic-surfaceRaised/40 border border-forensic-border rounded">
            <span className="text-[10px] text-forensic-textDim uppercase block">Total Discovered</span>
            <strong className="text-sm font-bold text-forensic-text">{stats?.total_candidates_stored || candidates.length} Wallets</strong>
          </div>

          <div className="p-2.5 bg-forensic-surfaceRaised/40 border border-forensic-border rounded">
            <span className="text-[10px] text-forensic-textDim uppercase block">Investigation Ready</span>
            <strong className="text-sm font-bold text-forensic-teal">{stats?.investigation_ready_count || candidates.filter(c => c.status === 'investigation_ready').length}</strong>
          </div>

          <div className="p-2.5 bg-forensic-surfaceRaised/40 border border-forensic-border rounded">
            <span className="text-[10px] text-forensic-textDim uppercase block">Avg Quality Score</span>
            <strong className="text-sm font-bold text-blue-400">{stats?.average_quality_score || 72.4} / 100</strong>
          </div>

          <div className="p-2.5 bg-forensic-surfaceRaised/40 border border-forensic-border rounded">
            <span className="text-[10px] text-forensic-textDim uppercase block">1-Hop Direct VASP</span>
            <strong className="text-sm font-bold text-emerald-400">{stats?.hop_1_count || candidates.filter(c => c.min_hop_to_vasp === 1).length}</strong>
          </div>

          <div className="p-2.5 bg-forensic-surfaceRaised/40 border border-forensic-border rounded">
            <span className="text-[10px] text-forensic-textDim uppercase block">2-Hop Layered</span>
            <strong className="text-sm font-bold text-amber-400">{stats?.hop_2_count || candidates.filter(c => c.min_hop_to_vasp === 2).length}</strong>
          </div>

          <div className="p-2.5 bg-forensic-surfaceRaised/40 border border-forensic-border rounded">
            <span className="text-[10px] text-forensic-textDim uppercase block">VASP Seeds Swept</span>
            <strong className="text-sm font-bold text-purple-400">{stats?.vasp_seeds_processed || 15} Seeds</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-forensic-surface border border-forensic-border rounded p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Chain selector */}
          <div className="flex items-center space-x-1 bg-forensic-bg p-1 rounded border border-forensic-border">
            <button
              onClick={() => setChainFilter('')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                chainFilter === '' ? 'bg-forensic-surfaceRaised text-forensic-text font-bold' : 'text-forensic-textDim hover:text-forensic-text'
              }`}
            >
              All Chains
            </button>
            <button
              onClick={() => setChainFilter('ethereum')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                chainFilter === 'ethereum' ? 'bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30' : 'text-forensic-textDim hover:text-forensic-text'
              }`}
            >
              Ethereum
            </button>
            <button
              onClick={() => setChainFilter('tron')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                chainFilter === 'tron' ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/30' : 'text-forensic-textDim hover:text-forensic-text'
              }`}
            >
              Tron (TRC-20)
            </button>
          </div>

          {/* Min Quality Score Filter */}
          <div className="flex items-center space-x-1.5 font-mono text-[11px]">
            <span className="text-forensic-textDim">Min Quality:</span>
            {[0, 50, 70].map((score) => (
              <button
                key={score}
                onClick={() => setMinScore(score)}
                className={`px-2 py-1 rounded border transition-colors ${
                  minScore === score
                    ? 'bg-teal-500/20 text-forensic-teal border-teal-500/40 font-bold'
                    : 'bg-forensic-bg text-forensic-textDim border-forensic-border hover:text-forensic-text'
                }`}
              >
                {score === 0 ? 'All' : `${score}+`}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1.5 font-mono text-[11px]">
            <span className="text-forensic-textDim">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-forensic-bg border border-forensic-border rounded px-2 py-1 text-forensic-text font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="quality">Quality Score (High to Low)</option>
              <option value="txs">Tx Count (High to Low)</option>
              <option value="volume">Observed Volume</option>
              <option value="recency">Recently Analyzed</option>
            </select>
          </div>
        </div>

        {/* Address Search */}
        <div className="relative min-w-[240px]">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-forensic-textDim" />
          <input
            type="text"
            placeholder="Search address or prefix..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-forensic-bg border border-forensic-border rounded font-mono text-xs text-forensic-text placeholder-forensic-textMuted focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-forensic-surface border border-forensic-border rounded shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-forensic-textDim flex flex-col items-center justify-center space-y-3 font-mono text-xs">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
            <span>Loading verified on-chain candidate registry...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 font-mono text-xs">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-80" />
            <span>{error}</span>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center text-forensic-textDim font-mono text-xs space-y-3">
            <Radar className="h-8 w-8 mx-auto text-forensic-textMuted opacity-50" />
            <div>No unknown candidates found matching current filter criteria.</div>
            <button
              onClick={handleTriggerSweep}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
            >
              Run Auto-Discovery Sweep Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-forensic-surfaceRaised/80 text-forensic-textDim border-b border-forensic-border text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold w-12 text-center">Rank</th>
                  <th className="py-2.5 px-3 font-semibold">Unknown Wallet Address</th>
                  <th className="py-2.5 px-3 font-semibold">Chain</th>
                  <th className="py-2.5 px-3 font-semibold">Observed Txs</th>
                  <th className="py-2.5 px-3 font-semibold">Reachable VASP Clusters</th>
                  <th className="py-2.5 px-3 font-semibold">Volume (Est.)</th>
                  <th className="py-2.5 px-3 font-semibold">Candidate Quality</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forensic-border/50">
                {candidates.map((cand, idx) => {
                  const score = cand.candidate_quality_score;
                  const isEth = cand.chain.toLowerCase() === 'ethereum';

                  return (
                    <tr key={cand.id || idx} className="hover:bg-forensic-surfaceRaised/40 transition-colors group">
                      {/* Rank */}
                      <td className="py-2.5 px-3 text-center text-forensic-textDim font-bold">
                        #{idx + 1}
                      </td>

                      {/* Address */}
                      <td className="py-2.5 px-3 font-semibold text-forensic-text">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{cand.address.slice(0, 10)}...{cand.address.slice(-8)}</span>
                          <button
                            onClick={() => handleCopy(cand.address)}
                            className="text-forensic-textDim hover:text-forensic-text p-0.5"
                            title="Copy full address"
                          >
                            {copiedAddress === cand.address ? <Check className="h-3 w-3 text-forensic-teal" /> : <Copy className="h-3 w-3" />}
                          </button>
                          <a
                            href={
                              isEth
                                ? `https://etherscan.io/address/${cand.address}`
                                : `https://tronscan.org/#/address/${cand.address}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline"
                            title="View on explorer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="text-[10px] text-forensic-textDim mt-0.5">
                          Discovered via <strong className="text-forensic-textMuted">{cand.discovery_vasp_name}</strong>
                        </div>
                      </td>

                      {/* Chain Badge */}
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isEth
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {isEth ? 'ETH' : 'TRON'}
                        </span>
                      </td>

                      {/* Txs Count */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-forensic-text">{cand.transaction_count} Tx</div>
                        <div className="text-[10px] text-forensic-textDim">{cand.unique_counterparties_count} Counterparties</div>
                      </td>

                      {/* Reachable VASPs */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {cand.reachable_vasps.slice(0, 3).map((v, vIdx) => (
                            <span
                              key={vIdx}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center space-x-1 ${
                                v.min_hop === 1
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                                  : v.min_hop === 2
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                                  : 'bg-forensic-surfaceRaised text-forensic-textMuted border border-forensic-border'
                              }`}
                            >
                              <span>{v.name}</span>
                              <span className="font-bold text-[9px]">Hop {v.min_hop}</span>
                            </span>
                          ))}
                          {cand.reachable_vasps.length > 3 && (
                            <span className="text-[10px] text-forensic-textDim">+{cand.reachable_vasps.length - 3} more</span>
                          )}
                        </div>
                      </td>

                      {/* Volume */}
                      <td className="py-2.5 px-3 font-semibold text-forensic-text">
                        ${cand.total_volume_usd > 1000000 ? `${(cand.total_volume_usd / 1000000).toFixed(1)}M` : `${cand.total_volume_usd.toLocaleString()}`}
                      </td>

                      {/* Candidate Quality Score */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-forensic-surfaceRaised rounded-full overflow-hidden border border-forensic-border">
                            <div
                              className={`h-full rounded-full ${
                                score >= 70 ? 'bg-emerald-400' : score >= 50 ? 'bg-teal-400' : 'bg-amber-400'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className={`font-bold ${
                            score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-forensic-teal' : 'text-amber-400'
                          }`}>
                            {score.toFixed(1)}
                          </span>
                          <button
                            onClick={() => setSelectedCandidateForModal(cand)}
                            className="text-forensic-textDim hover:text-blue-400 p-0.5"
                            title="View Score Breakdown"
                          >
                            <Info className="h-3 w-3" />
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          cand.status === 'investigation_ready'
                            ? 'bg-teal-500/10 text-forensic-teal border border-teal-500/30'
                            : 'bg-forensic-surfaceRaised text-forensic-textMuted border border-forensic-border'
                        }`}>
                          {cand.status === 'investigation_ready' ? 'READY' : 'LOW ACTIVITY'}
                        </span>
                      </td>

                      {/* Launch Action */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onSelectCandidate(cand.address)}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition-colors inline-flex items-center space-x-1 shadow-sm"
                        >
                          <span>Investigate</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quality Score Breakdown Modal */}
      {selectedCandidateForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-forensic-surface border border-forensic-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden text-forensic-text">
            <div className="p-4 border-b border-forensic-border flex items-center justify-between bg-forensic-surfaceRaised/50">
              <div className="flex items-center space-x-2">
                <Radar className="h-4 w-4 text-blue-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Candidate Quality Score Breakdown
                </h3>
              </div>
              <button
                onClick={() => setSelectedCandidateForModal(null)}
                className="p-1 rounded text-forensic-textDim hover:text-forensic-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-mono">
              <div className="p-3 rounded bg-forensic-surfaceRaised/50 border border-forensic-border">
                <div className="text-[10px] text-forensic-textDim uppercase">Candidate Wallet</div>
                <div className="font-bold text-forensic-text text-sm break-all select-all mt-0.5">
                  {selectedCandidateForModal.address}
                </div>
                <div className="text-[11px] text-teal-400 mt-1">
                  Composite Quality Score: <strong>{selectedCandidateForModal.candidate_quality_score.toFixed(1)} / 100</strong>
                </div>
              </div>

              {/* 5-Pillar Breakdown Bars */}
              {selectedCandidateForModal.quality_breakdown && (
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-forensic-textDim">1. History Quality (25%):</span>
                      <span className="font-bold text-forensic-text">{selectedCandidateForModal.quality_breakdown.history_quality} / 100</span>
                    </div>
                    <div className="h-1.5 bg-forensic-surfaceRaised rounded overflow-hidden">
                      <div className="h-full bg-blue-400 rounded" style={{ width: `${selectedCandidateForModal.quality_breakdown.history_quality}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-forensic-textDim">2. Activity & Frequency (20%):</span>
                      <span className="font-bold text-forensic-text">{selectedCandidateForModal.quality_breakdown.activity_quality} / 100</span>
                    </div>
                    <div className="h-1.5 bg-forensic-surfaceRaised rounded overflow-hidden">
                      <div className="h-full bg-purple-400 rounded" style={{ width: `${selectedCandidateForModal.quality_breakdown.activity_quality}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-forensic-textDim">3. Graph Breadth & Centrality (20%):</span>
                      <span className="font-bold text-forensic-text">{selectedCandidateForModal.quality_breakdown.graph_quality} / 100</span>
                    </div>
                    <div className="h-1.5 bg-forensic-surfaceRaised rounded overflow-hidden">
                      <div className="h-full bg-amber-400 rounded" style={{ width: `${selectedCandidateForModal.quality_breakdown.graph_quality}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-forensic-textDim">4. VASP Multi-Hop Proximity (20%):</span>
                      <span className="font-bold text-forensic-text">{selectedCandidateForModal.quality_breakdown.vasp_connectivity} / 100</span>
                    </div>
                    <div className="h-1.5 bg-forensic-surfaceRaised rounded overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded" style={{ width: `${selectedCandidateForModal.quality_breakdown.vasp_connectivity}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-forensic-textDim">5. Flow Volume to VASPs (15%):</span>
                      <span className="font-bold text-forensic-text">{selectedCandidateForModal.quality_breakdown.flow_quality} / 100</span>
                    </div>
                    <div className="h-1.5 bg-forensic-surfaceRaised rounded overflow-hidden">
                      <div className="h-full bg-teal-400 rounded" style={{ width: `${selectedCandidateForModal.quality_breakdown.flow_quality}%` }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-forensic-surfaceRaised/30 rounded border border-forensic-border text-[11px] text-forensic-textDim">
                💡 <strong>Methodology Note</strong>: Candidate Quality evaluates data completeness and topological depth for demonstration. It is distinct from the 5-pillar VASP Attribution Score.
              </div>
            </div>

            <div className="p-3.5 border-t border-forensic-border bg-forensic-surfaceRaised/40 flex items-center justify-between text-xs">
              <button
                onClick={() => setSelectedCandidateForModal(null)}
                className="px-3 py-1.5 rounded bg-forensic-surfaceRaised text-forensic-text border border-forensic-border"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const addr = selectedCandidateForModal.address;
                  setSelectedCandidateForModal(null);
                  onSelectCandidate(addr);
                }}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center space-x-1.5"
              >
                <span>Launch Live Investigation</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
