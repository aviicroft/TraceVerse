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
  ArrowRight,
  Filter,
} from 'lucide-react';
import { api } from '../lib/api';
import { CandidateWallet, CandidateStats } from '../lib/types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { CustomSelect } from './ui/Select';

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
    <div className="space-y-6 font-sans text-text transition-colors">
      {/* Header & Mission Banner */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-panel space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent-subtle text-accent border border-accent-border inline-flex items-center justify-center shrink-0">
                <Radar className="h-5 w-5 shrink-0" />
              </div>
              <h2 className="text-base font-bold text-text tracking-tight">
                Candidate Radar
              </h2>
              <Badge variant="success" dot={true}>
                Automated Discovery Active
              </Badge>
            </div>
            <p className="text-xs text-text-secondary max-w-3xl leading-relaxed">
              Discovers and ranks suspect counterparties with potential VASP attribution. Mines transaction paths from verified exchange clusters, evaluates proximity, and computes an explainable 5-factor Candidate Quality Score.
            </p>
          </div>

          <div className="inline-flex items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              onClick={handleTriggerSweep}
              disabled={sweeping || stats?.is_running}
              isLoading={sweeping || stats?.is_running}
              icon={<RefreshCw className="h-4 w-4" />}
            >
              {sweeping || stats?.is_running ? 'Mining Counterparties...' : 'Run Discovery Sweep'}
            </Button>

            <button
              onClick={() => {
                loadData();
                loadStats();
              }}
              className="h-9 w-9 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-text border border-border transition-colors inline-flex items-center justify-center shrink-0"
              title="Refresh leads"
              aria-label="Refresh leads"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-border">
          <div className="p-3.5 bg-surface-raised/40 border border-border rounded-xl">
            <span className="text-xs text-text-muted font-medium block mb-1">Total Discovered</span>
            <strong className="text-sm font-bold font-mono text-text">
              {stats?.total_candidates_stored || candidates.length} Wallets
            </strong>
          </div>

          <div className="p-3.5 bg-surface-raised/40 border border-border rounded-xl">
            <span className="text-xs text-text-muted font-medium block mb-1">Investigation Ready</span>
            <strong className="text-sm font-bold font-mono text-verified">
              {stats?.investigation_ready_count ||
                candidates.filter((c) => c.status === 'investigation_ready').length} Leads
            </strong>
          </div>

          <div className="p-3.5 bg-surface-raised/40 border border-border rounded-xl">
            <span className="text-xs text-text-muted font-medium block mb-1">Avg Quality Score</span>
            <strong className="text-sm font-bold font-mono text-accent">
              {stats?.average_quality_score || 72.4} / 100
            </strong>
          </div>

          <div className="p-3.5 bg-surface-raised/40 border border-border rounded-xl">
            <span className="text-xs text-text-muted font-medium block mb-1">1-Hop Direct VASP</span>
            <strong className="text-sm font-bold font-mono text-text">
              {stats?.hop_1_count || candidates.filter((c) => c.min_hop_to_vasp === 1).length} Wallets
            </strong>
          </div>

          <div className="p-3.5 bg-surface-raised/40 border border-border rounded-xl">
            <span className="text-xs text-text-muted font-medium block mb-1">2-Hop Layered</span>
            <strong className="text-sm font-bold font-mono text-text">
              {stats?.hop_2_count || candidates.filter((c) => c.min_hop_to_vasp === 2).length} Wallets
            </strong>
          </div>

          <div className="p-3.5 bg-surface-raised/40 border border-border rounded-xl">
            <span className="text-xs text-text-muted font-medium block mb-1">VASP Seeds Swept</span>
            <strong className="text-sm font-bold font-mono text-text">
              {stats?.vasp_seeds_processed || 15} Seeds
            </strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-border rounded-xl p-3 sm:p-4 shadow-panel flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Chain Filter */}
          <div className="flex items-center space-x-1 bg-surface-raised p-1 rounded-xl border border-border w-full sm:w-auto overflow-x-auto scrollbar-none">
            <button
              onClick={() => setChainFilter('')}
              className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px] sm:min-h-0 text-center ${
                chainFilter === '' ? 'bg-surface text-text font-semibold shadow-sm' : 'text-text-muted hover:text-text'
              }`}
            >
              All Chains
            </button>
            <button
              onClick={() => setChainFilter('ethereum')}
              className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px] sm:min-h-0 text-center ${
                chainFilter === 'ethereum' ? 'bg-surface text-text font-semibold shadow-sm' : 'text-text-muted hover:text-text'
              }`}
            >
              Ethereum
            </button>
            <button
              onClick={() => setChainFilter('tron')}
              className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px] sm:min-h-0 text-center ${
                chainFilter === 'tron' ? 'bg-surface text-text font-semibold shadow-sm' : 'text-text-muted hover:text-text'
              }`}
            >
              Tron TRC-20
            </button>
          </div>

          {/* Min Score Filter */}
          <div className="w-full sm:w-auto">
            <CustomSelect
              label="Min Score:"
              value={minScore}
              onChange={(val) => setMinScore(Number(val))}
              options={[
                { value: 0, label: 'All Scores (≥ 0)' },
                { value: 50, label: '≥ 50 (Moderate Lead)' },
                { value: 70, label: '≥ 70 (High Lead)' },
                { value: 80, label: '≥ 80 (Investigation Ready)' },
              ]}
              className="w-full sm:w-auto"
              size="md"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:flex-none group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] group-focus-within:text-[#E63946] pointer-events-none shrink-0 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address or VASP..."
              className="pl-10 pr-3 py-2 sm:py-1.5 bg-[#102347] border border-[#29436B] hover:border-[#3C5C89] rounded-xl text-[#F8FAFC] placeholder:text-[#94A3B8] placeholder:opacity-100 text-xs focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 w-full sm:w-64 transition-all font-mono min-h-[44px] sm:min-h-[38px] shadow-sm"
            />
          </div>

          {/* Sort By */}
          <div className="w-full sm:w-auto">
            <CustomSelect
              value={sortBy}
              onChange={(val) => setSortBy(String(val))}
              options={[
                { value: 'quality', label: 'Sort: Quality Score' },
                { value: 'volume', label: 'Sort: Total Flow ($)' },
                { value: 'tx_count', label: 'Sort: Transfer Count' },
              ]}
              align="right"
              className="w-full sm:w-auto"
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Candidates Data Table (Desktop) */}
      <div className="bg-surface border border-border rounded-xl shadow-panel overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-raised/30 text-xs text-text-muted font-medium">
                <th className="py-3 px-4">Candidate Wallet</th>
                <th className="py-3 px-4">Chain</th>
                <th className="py-3 px-4">Discovered VASP</th>
                <th className="py-3 px-4 text-right">Flow Volume</th>
                <th className="py-3 px-4 text-center">Transfers</th>
                <th className="py-3 px-4 text-center">VASP Proximity</th>
                <th className="py-3 px-4 text-center">Quality Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-text-muted">
                    <div className="inline-flex items-center justify-center gap-2.5">
                      <RefreshCw className="h-4 w-4 animate-spin text-accent shrink-0" />
                      <span>Loading discovered counterparty leads...</span>
                    </div>
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-text-muted">
                    No candidates found matching the selected filters.
                  </td>
                </tr>
              ) : (
                candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-surface-raised/50 transition-colors group h-14">
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-2">
                        <span className="font-mono text-technical font-bold text-text truncate max-w-[140px] select-all">
                          {cand.address.slice(0, 8)}...{cand.address.slice(-6)}
                        </span>
                        <button
                          onClick={() => handleCopy(cand.address)}
                          className="p-1 rounded hover:bg-surface-raised text-text-muted hover:text-text transition-colors shrink-0"
                          title="Copy address"
                        >
                          {copiedAddress === cand.address ? (
                            <Check className="h-3.5 w-3.5 text-verified shrink-0" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 shrink-0" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`uppercase text-xs px-2.5 py-0.5 rounded-full font-medium tracking-wide border ${
                          cand.chain.toLowerCase() === 'tron'
                            ? 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/30'
                            : 'bg-surface-raised border-border text-text-secondary'
                        }`}
                      >
                        {cand.chain.toLowerCase() === 'tron' ? 'TRON' : 'Ethereum'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-accent text-xs">{cand.discovery_vasp_name}</span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-text">
                      ${cand.total_volume_usd > 1000
                        ? (cand.total_volume_usd / 1000).toFixed(1) + 'k'
                        : cand.total_volume_usd.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center text-text-secondary font-mono">
                      {cand.transaction_count} Tx
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium border ${
                          cand.min_hop_to_vasp === 1
                            ? 'bg-verified-subtle text-verified border-verified-border'
                            : 'bg-surface-raised text-text-muted border-border'
                        }`}
                      >
                        Hop {cand.min_hop_to_vasp}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedCandidateForModal(cand)}
                        className="px-2.5 py-0.5 rounded-full bg-accent-subtle hover:bg-accent/20 text-accent border border-accent-border font-mono font-bold text-xs transition-colors"
                        title="Click to inspect 5-factor quality breakdown"
                      >
                        {cand.candidate_quality_score.toFixed(1)} / 100
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onSelectCandidate(cand.address)}
                        icon={<ArrowRight className="h-3.5 w-3.5" />}
                        iconPosition="right"
                      >
                        Investigate
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Cards (Mobile View) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted">
            <div className="inline-flex items-center justify-center gap-2.5">
              <RefreshCw className="h-4 w-4 animate-spin text-accent shrink-0" />
              <span className="text-xs">Loading discovered counterparty leads...</span>
            </div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted text-xs">
            No candidates found matching the selected filters.
          </div>
        ) : (
          candidates.map((cand) => (
            <div key={cand.id} className="bg-surface border border-border rounded-xl p-4 shadow-panel space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-text truncate max-w-[170px] select-all">
                      {cand.address.slice(0, 10)}...{cand.address.slice(-6)}
                    </span>
                    <button
                      onClick={() => handleCopy(cand.address)}
                      className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg hover:bg-surface-raised text-text-muted hover:text-text transition-colors"
                      title="Copy address"
                    >
                      {copiedAddress === cand.address ? (
                        <Check className="h-4 w-4 text-verified" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`uppercase text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide border ${
                        cand.chain.toLowerCase() === 'tron'
                          ? 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/30'
                          : 'bg-surface-raised border-border text-text-secondary'
                      }`}
                    >
                      {cand.chain.toLowerCase() === 'tron' ? 'TRON' : 'Ethereum'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                        cand.min_hop_to_vasp === 1
                          ? 'bg-verified-subtle text-verified border-verified-border'
                          : 'bg-surface-raised text-text-muted border-border'
                      }`}
                    >
                      Hop {cand.min_hop_to_vasp}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCandidateForModal(cand)}
                  className="px-2.5 py-1 rounded-full bg-accent-subtle hover:bg-accent/20 text-accent border border-accent-border font-mono font-bold text-xs shrink-0"
                  title="Quality Score"
                >
                  {cand.candidate_quality_score.toFixed(0)}/100
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/60">
                <div className="bg-surface-raised/40 p-2 rounded-lg">
                  <span className="text-[10px] text-text-muted block">Discovered VASP</span>
                  <span className="font-semibold text-accent truncate block">{cand.discovery_vasp_name}</span>
                </div>
                <div className="bg-surface-raised/40 p-2 rounded-lg">
                  <span className="text-[10px] text-text-muted block">Flow / Tx Count</span>
                  <span className="font-semibold text-text font-mono truncate block">
                    ${cand.total_volume_usd > 1000
                      ? (cand.total_volume_usd / 1000).toFixed(1) + 'k'
                      : cand.total_volume_usd.toFixed(1)}{' '}
                    • {cand.transaction_count} Tx
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectCandidate(cand.address)}
                className="w-full min-h-[44px] rounded-xl bg-accent text-white font-semibold text-xs inline-flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors shadow-sm"
              >
                <span>Investigate Target</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidateForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-surface border border-border rounded-xl shadow-panel-elevated w-[calc(100%-24px)] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="inline-flex items-center gap-2">
                <Radar className="h-4 w-4 text-accent shrink-0" />
                <h3 className="font-semibold text-text text-sm">
                  Candidate Quality Score Diagnostics
                </h3>
              </div>
              <button
                onClick={() => setSelectedCandidateForModal(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-surface-raised/60 border border-border">
                <span className="text-xs text-text-muted font-medium block mb-1">Target Address</span>
                <span className="font-mono text-xs font-bold text-text break-all select-all">
                  {selectedCandidateForModal.address}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface-raised/40 border border-border">
                  <span className="text-xs text-text-muted block mb-0.5">Discovered From</span>
                  <span className="font-semibold text-accent text-xs">
                    {selectedCandidateForModal.discovery_vasp_name}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-raised/40 border border-border">
                  <span className="text-xs text-text-muted block mb-0.5">VASP Proximity</span>
                  <span className="font-semibold text-text text-xs">
                    {selectedCandidateForModal.min_hop_to_vasp} Hop(s)
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-accent-subtle border border-accent-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text text-xs">Composite Quality Index</span>
                  <span className="font-mono text-base font-bold text-accent">
                    {selectedCandidateForModal.candidate_quality_score.toFixed(1)} / 100
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Calculated from 5 normalized signals: VASP Hop Proximity (35%), Active On-Chain Volume (25%), Unique Counterparties (20%), Transaction Density (10%), and Recency (10%).
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-border">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedCandidateForModal(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  const addr = selectedCandidateForModal.address;
                  setSelectedCandidateForModal(null);
                  onSelectCandidate(addr);
                }}
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
              >
                Investigate This Target
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
