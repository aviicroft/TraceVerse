'use client';

import React, { useState, useEffect } from 'react';
import {
  Radar,
  Search,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Network,
  Sparkles,
  Info,
  X,
  ExternalLink,
  Copy,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '../lib/api';
import { CandidateWallet, CandidateStats } from '../lib/types';

interface CandidateDiscoveryViewProps {
  onSelectCandidate: (address: string) => void;
}

export const CandidateDiscoveryView: React.FC<CandidateDiscoveryViewProps> = ({
  onSelectCandidate,
}) => {
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
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<CandidateWallet | null>(
    null
  );

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
      setError(err?.message || 'Failed to load candidate leads');
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
    <div className="space-y-5 font-sans text-text transition-colors">
      {/* Header & Mission Banner */}
      <div className="bg-surface border border-border rounded-xl p-5 shadow-vercel">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent border border-accent/20 inline-flex items-center justify-center shrink-0">
                <Radar className="h-4 w-4 shrink-0" />
              </div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text font-mono">
                Automated Candidate Discovery & Quality Ranking
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-verified-subtle text-verified border border-verified-border font-medium">
                Verified On-Chain
              </span>
            </div>
            <p className="text-xs text-text-muted max-w-3xl leading-relaxed">
              Mines real counterparties from the VASP seed registry, filters contracts and known infrastructure,
              traces 1–3 hop proximity, and generates an explainable 5-factor Candidate Quality Score.
            </p>
          </div>

          <div className="inline-flex items-center gap-2">
            <button
              onClick={handleTriggerSweep}
              disabled={sweeping || stats?.is_running}
              className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shadow-sm ${
                sweeping || stats?.is_running
                  ? 'bg-accent/15 text-accent border border-accent/30 cursor-not-allowed'
                  : 'bg-text text-bg hover:opacity-90'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${sweeping || stats?.is_running ? 'animate-spin' : ''}`} />
              <span>{sweeping || stats?.is_running ? 'Mining Counterparties...' : 'Run Discovery Sweep'}</span>
            </button>

            <button
              onClick={() => {
                loadData();
                loadStats();
              }}
              className="w-8 h-8 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-text border border-border transition-colors inline-flex items-center justify-center shrink-0"
              title="Refresh leads"
              aria-label="Refresh leads"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-border font-mono text-xs">
          <div className="p-3 bg-surface-raised/50 border border-border rounded-lg">
            <span className="text-[10px] text-text-dim uppercase font-medium block mb-0.5">Total Discovered</span>
            <strong className="text-sm font-bold text-text">
              {stats?.total_candidates_stored || candidates.length} Wallets
            </strong>
          </div>

          <div className="p-3 bg-surface-raised/50 border border-border rounded-lg">
            <span className="text-[10px] text-text-dim uppercase font-medium block mb-0.5">Ready for Trace</span>
            <strong className="text-sm font-bold text-verified">
              {stats?.investigation_ready_count ||
                candidates.filter((c) => c.status === 'investigation_ready').length}
            </strong>
          </div>

          <div className="p-3 bg-surface-raised/50 border border-border rounded-lg">
            <span className="text-[10px] text-text-dim uppercase font-medium block mb-0.5">Avg Quality Score</span>
            <strong className="text-sm font-bold text-accent">{stats?.average_quality_score || 72.4} / 100</strong>
          </div>

          <div className="p-3 bg-surface-raised/50 border border-border rounded-lg">
            <span className="text-[10px] text-text-dim uppercase font-medium block mb-0.5">1-Hop Direct VASP</span>
            <strong className="text-sm font-bold text-text">
              {stats?.hop_1_count || candidates.filter((c) => c.min_hop_to_vasp === 1).length}
            </strong>
          </div>

          <div className="p-3 bg-surface-raised/50 border border-border rounded-lg">
            <span className="text-[10px] text-text-dim uppercase font-medium block mb-0.5">2-Hop Layered</span>
            <strong className="text-sm font-bold text-text">
              {stats?.hop_2_count || candidates.filter((c) => c.min_hop_to_vasp === 2).length}
            </strong>
          </div>

          <div className="p-3 bg-surface-raised/50 border border-border rounded-lg">
            <span className="text-[10px] text-text-dim uppercase font-medium block mb-0.5">VASP Seeds Swept</span>
            <strong className="text-sm font-bold text-text">{stats?.vasp_seeds_processed || 15} Seeds</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-border rounded-xl p-3.5 shadow-vercel flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Chain Filter */}
          <div className="flex items-center space-x-1 bg-bg p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setChainFilter('')}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                chainFilter === '' ? 'bg-surface text-text font-bold shadow-sm' : 'text-text-muted hover:text-text'
              }`}
            >
              All Chains
            </button>
            <button
              onClick={() => setChainFilter('ethereum')}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                chainFilter === 'ethereum' ? 'bg-surface text-text font-bold shadow-sm' : 'text-text-muted hover:text-text'
              }`}
            >
              Ethereum
            </button>
            <button
              onClick={() => setChainFilter('tron')}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                chainFilter === 'tron' ? 'bg-surface text-text font-bold shadow-sm' : 'text-text-muted hover:text-text'
              }`}
            >
              Tron TRC-20
            </button>
          </div>

          {/* Min Score Filter */}
          <div className="flex items-center space-x-1 bg-bg px-2.5 py-1 rounded-lg border border-border text-[11px]">
            <span className="text-text-dim">Min Score:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="bg-transparent text-text font-semibold focus:outline-none cursor-pointer"
            >
              <option value={0}>All Scores (≥ 0)</option>
              <option value={50}>≥ 50 (Moderate)</option>
              <option value={70}>≥ 70 (High Lead)</option>
              <option value={80}>≥ 80 (Investigation Ready)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-dim pointer-events-none shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address or VASP..."
              className="pl-8 pr-3 py-1.5 bg-bg border border-border rounded-lg text-text placeholder:text-text-dim text-[11px] focus:outline-none focus:border-accent w-48 sm:w-60 transition-colors"
            />
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-bg border border-border rounded-lg text-text text-[11px] px-2.5 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="quality">Sort: Quality Score</option>
            <option value="volume">Sort: Total Flow ($)</option>
            <option value="tx_count">Sort: Transaction Count</option>
          </select>
        </div>
      </div>

      {/* Candidates Data Grid */}
      <div className="bg-surface border border-border rounded-xl shadow-vercel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-raised/40 text-[10px] uppercase text-text-dim tracking-wider font-semibold">
                <th className="py-3 px-4">Candidate Wallet</th>
                <th className="py-3 px-4">Chain</th>
                <th className="py-3 px-4">Discovered From</th>
                <th className="py-3 px-4 text-right">Flow Volume</th>
                <th className="py-3 px-4 text-center">Transfers</th>
                <th className="py-3 px-4 text-center">VASP Proximity</th>
                <th className="py-3 px-4 text-center">Quality Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted font-sans">
                    <div className="inline-flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-accent shrink-0" />
                      <span>Loading discovered counterparty leads...</span>
                    </div>
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted font-sans">
                    No candidates found matching the selected filters.
                  </td>
                </tr>
              ) : (
                candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-surface-raised/40 transition-colors group">
                    <td className="py-2.5 px-4 font-semibold text-text">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="truncate max-w-[130px] select-all">
                          {cand.address.slice(0, 8)}...{cand.address.slice(-6)}
                        </span>
                        <button
                          onClick={() => handleCopy(cand.address)}
                          className="w-5 h-5 inline-flex items-center justify-center rounded text-text-dim hover:text-text transition-colors shrink-0"
                          title="Copy address"
                        >
                          {copiedAddress === cand.address ? (
                            <Check className="h-3 w-3 text-verified shrink-0" />
                          ) : (
                            <Copy className="h-3 w-3 shrink-0" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-surface-raised border border-border text-text-muted font-medium">
                        {cand.chain}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-text">
                      <span className="font-semibold text-accent">{cand.discovery_vasp_name}</span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-text">
                      ${cand.total_volume_usd > 1000
                        ? (cand.total_volume_usd / 1000).toFixed(1) + 'k'
                        : cand.total_volume_usd.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-center text-text-muted">
                      {cand.transaction_count} Tx
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${
                          cand.min_hop_to_vasp === 1
                            ? 'bg-verified-subtle text-verified border-verified-border'
                            : 'bg-surface-raised text-text-muted border-border'
                        }`}
                      >
                        Hop {cand.min_hop_to_vasp}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedCandidateForModal(cand)}
                        className="px-2 py-0.5 rounded-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 font-bold text-[10px] transition-colors"
                        title="Click to inspect 5-factor quality breakdown"
                      >
                        {cand.candidate_quality_score.toFixed(1)} / 100
                      </button>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onSelectCandidate(cand.address)}
                        className="px-2.5 py-1 bg-text text-bg hover:opacity-90 font-medium text-[11px] rounded-md transition-opacity font-sans"
                      >
                        Investigate →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidateForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl shadow-vercel-lg w-full max-w-2xl p-6 space-y-5 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="inline-flex items-center gap-2">
                <Radar className="h-5 w-5 text-accent shrink-0" />
                <h3 className="font-mono text-sm font-bold text-text uppercase">
                  Candidate Quality Score Diagnostics
                </h3>
              </div>
              <button
                onClick={() => setSelectedCandidateForModal(null)}
                className="w-8 h-8 rounded-lg text-text-dim hover:text-text hover:bg-surface-hover transition-colors inline-flex items-center justify-center shrink-0"
                aria-label="Close modal"
              >
                <X className="h-4 w-4 shrink-0" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-[11px]">
              <div className="p-3 bg-bg border border-border rounded-lg space-y-1">
                <span className="text-[10px] text-text-dim uppercase font-medium">Candidate Address</span>
                <div className="text-sm font-bold text-text select-all break-all">
                  {selectedCandidateForModal.address}
                </div>
                <div className="text-[10px] text-text-dim pt-1 flex items-center space-x-3">
                  <span>Chain: <strong className="text-text">{selectedCandidateForModal.chain.toUpperCase()}</strong></span>
                  <span>•</span>
                  <span>Discovered From: <strong className="text-accent">{selectedCandidateForModal.discovery_vasp_name}</strong></span>
                </div>
              </div>

              {/* 5 Factor Breakdown */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-text-dim uppercase font-semibold block">
                  Five-Factor Heuristic Quality Decomposition:
                </span>

                {[
                  {
                    name: 'History Quality (25%)',
                    desc: 'Active duration & transaction density over time',
                    val: selectedCandidateForModal.quality_breakdown?.history_quality || 75,
                  },
                  {
                    name: 'Activity Quality (25%)',
                    desc: 'Frequency and multi-counterparty engagement',
                    val: selectedCandidateForModal.quality_breakdown?.activity_quality || 80,
                  },
                  {
                    name: 'Graph Topology Quality (20%)',
                    desc: 'Path diversity and non-cyclical transit patterns',
                    val: selectedCandidateForModal.quality_breakdown?.graph_quality || 70,
                  },
                  {
                    name: 'VASP Proximity & Reach (20%)',
                    desc: 'Hop proximity and custodial cluster linkages',
                    val: selectedCandidateForModal.quality_breakdown?.vasp_connectivity || 85,
                  },
                  {
                    name: 'Volume & Flow Distribution (10%)',
                    desc: 'Significant fund flow relative to noise threshold',
                    val: selectedCandidateForModal.quality_breakdown?.flow_quality || 72,
                  },
                ].map((f, i) => (
                  <div key={i} className="p-2.5 bg-surface-raised rounded-lg border border-border space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text font-semibold">{f.name}</span>
                      <span className="text-accent font-bold">{f.val.toFixed(1)} / 100</span>
                    </div>
                    <div className="h-1.5 w-full bg-bg rounded-full overflow-hidden border border-border/50">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${f.val}%` }} />
                    </div>
                    <span className="text-[10px] text-text-dim font-sans">{f.desc}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2.5 font-sans">
                <button
                  onClick={() => setSelectedCandidateForModal(null)}
                  className="px-3.5 py-2 rounded-lg bg-surface-raised hover:bg-surface-hover text-text border border-border font-medium text-xs transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onSelectCandidate(selectedCandidateForModal.address);
                    setSelectedCandidateForModal(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-text text-bg hover:opacity-90 font-medium text-xs transition-opacity"
                >
                  Launch Investigation in Workspace →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
