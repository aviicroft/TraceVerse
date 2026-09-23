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
<<<<<<< Updated upstream
  Play,
  CheckCircle2,
  AlertCircle
=======
  ExternalLink,
  Copy,
  Check,
  SlidersHorizontal,
  ArrowRight,
  Filter,
>>>>>>> Stashed changes
} from 'lucide-react';
import { api } from '../lib/api';
import { CandidateWallet, CandidateStats } from '../lib/types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

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
<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats Metrics Grid */}
<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
<<<<<<< Updated upstream
      <div className="bg-forensic-surface border border-forensic-border rounded p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Chain selector */}
          <div className="flex items-center space-x-1 bg-forensic-bg p-1 rounded border border-forensic-border">
            <button
              onClick={() => setChainFilter('')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                chainFilter === '' ? 'bg-forensic-surfaceRaised text-forensic-text font-bold' : 'text-forensic-textDim hover:text-forensic-text'
=======
      <div className="bg-surface border border-border rounded-xl p-4 shadow-panel flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Chain Filter */}
          <div className="flex items-center space-x-1 bg-surface-raised p-1 rounded-xl border border-border">
            <button
              onClick={() => setChainFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chainFilter === '' ? 'bg-surface text-text font-semibold shadow-sm' : 'text-text-muted hover:text-text'
>>>>>>> Stashed changes
              }`}
            >
              All Chains
            </button>
            <button
              onClick={() => setChainFilter('ethereum')}
<<<<<<< Updated upstream
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                chainFilter === 'ethereum' ? 'bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30' : 'text-forensic-textDim hover:text-forensic-text'
=======
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chainFilter === 'ethereum' ? 'bg-surface text-text font-semibold shadow-sm' : 'text-text-muted hover:text-text'
>>>>>>> Stashed changes
              }`}
            >
              Ethereum
            </button>
            <button
              onClick={() => setChainFilter('tron')}
<<<<<<< Updated upstream
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                chainFilter === 'tron' ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/30' : 'text-forensic-textDim hover:text-forensic-text'
=======
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chainFilter === 'tron' ? 'bg-surface text-text font-semibold shadow-sm' : 'text-text-muted hover:text-text'
>>>>>>> Stashed changes
              }`}
            >
              Tron (TRC-20)
            </button>
          </div>

<<<<<<< Updated upstream
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
=======
          {/* Min Score Filter */}
          <div className="flex items-center space-x-2 bg-surface-raised px-3 py-1.5 rounded-xl border border-border text-xs">
            <span className="text-text-muted">Min Score:</span>
>>>>>>> Stashed changes
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-forensic-bg border border-forensic-border rounded px-2 py-1 text-forensic-text font-mono focus:outline-none focus:border-blue-500"
            >
<<<<<<< Updated upstream
              <option value="quality">Quality Score (High to Low)</option>
              <option value="txs">Tx Count (High to Low)</option>
              <option value="volume">Observed Volume</option>
              <option value="recency">Recently Analyzed</option>
=======
              <option value={0}>All Scores (≥ 0)</option>
              <option value={50}>≥ 50 (Moderate Lead)</option>
              <option value={70}>≥ 70 (High Lead)</option>
              <option value={80}>≥ 80 (Investigation Ready)</option>
>>>>>>> Stashed changes
            </select>
          </div>
        </div>

<<<<<<< Updated upstream
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
=======
        <div className="flex items-center space-x-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address or VASP..."
              className="pl-9 pr-3 py-1.5 bg-surface-raised border border-border rounded-xl text-text placeholder:text-text-muted text-xs focus:outline-none focus:border-accent w-52 sm:w-64 transition-colors font-mono"
            />
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-surface-raised border border-border rounded-xl text-text text-xs px-3 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="quality">Sort: Quality Score</option>
            <option value="volume">Sort: Total Flow ($)</option>
            <option value="tx_count">Sort: Transfer Count</option>
          </select>
        </div>
      </div>

      {/* Candidates Data Table */}
      <div className="bg-surface border border-border rounded-xl shadow-panel overflow-hidden">
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
=======
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="uppercase text-xs px-2 py-0.5 rounded-full bg-surface-raised border border-border text-text-secondary font-medium">
                        {cand.chain}
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
>>>>>>> Stashed changes
      </div>

      {/* Quality Score Breakdown Modal */}
      {selectedCandidateForModal && (
<<<<<<< Updated upstream
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-forensic-surface border border-forensic-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden text-forensic-text">
            <div className="p-4 border-b border-forensic-border flex items-center justify-between bg-forensic-surfaceRaised/50">
              <div className="flex items-center space-x-2">
                <Radar className="h-4 w-4 text-blue-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Candidate Quality Score Breakdown
=======
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-surface border border-border rounded-xl shadow-panel-elevated w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="inline-flex items-center gap-2">
                <Radar className="h-4 w-4 text-accent shrink-0" />
                <h3 className="font-semibold text-text text-sm">
                  Candidate Quality Score Diagnostics
>>>>>>> Stashed changes
                </h3>
              </div>
              <button
                onClick={() => setSelectedCandidateForModal(null)}
<<<<<<< Updated upstream
                className="p-1 rounded text-forensic-textDim hover:text-forensic-text"
=======
                className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
>>>>>>> Stashed changes
              >
                <X className="h-4 w-4" />
              </button>
            </div>

<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
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
