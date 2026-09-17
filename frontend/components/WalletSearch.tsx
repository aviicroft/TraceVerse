'use client';

import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, ArrowRight, Radar, Sparkles, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';
import { CandidateWallet } from '../lib/types';

interface WalletSearchProps {
  onAnalyze: (address: string, maxHops: number) => void;
  isLoading: boolean;
}

const DEFAULT_REAL_CANDIDATES: CandidateWallet[] = [
  {
    id: 1,
    address: '0x3f8702cfb1662195fcc98593789682da91dfaae3',
    chain: 'ethereum',
    discovery_source: 'vasp_counterparty_mining',
    discovery_vasp_name: 'Binance',
    discovery_vasp_address: '0x28c6c06298d514db089934071355e5743bf21d60',
    discovered_at: '2026-08-26T05:00:00Z',
    last_analyzed_at: '2026-08-26T05:00:00Z',
    transaction_count: 40,
    token_transfers_count: 22,
    unique_counterparties_count: 28,
    usdt_volume: 5200000.0,
    usdc_volume: 1200000.0,
    total_volume_usd: 92402800.0,
    active_days: 18,
    incoming_tx_count: 20,
    outgoing_tx_count: 20,
    incoming_volume: 46201400.0,
    outgoing_volume: 46201400.0,
    reachable_vasps: [
      { name: 'Binance', min_hop: 1, direct_tx_count: 7, flow_volume_usd: 92402800.0, paths_count: 7 },
      { name: 'OKX', min_hop: 1, direct_tx_count: 1, flow_volume_usd: 420000.0, paths_count: 1 },
    ],
    min_hop_to_vasp: 1,
    reachable_vasp_count: 2,
    total_paths_to_vasps: 8,
    candidate_quality_score: 82.1,
    status: 'investigation_ready',
  },
  {
    id: 2,
    address: '0x0051cc1d8bbf0b3373b02e22ea5a2fe483266cea',
    chain: 'ethereum',
    discovery_source: 'vasp_counterparty_mining',
    discovery_vasp_name: 'Binance',
    discovery_vasp_address: '0x28c6c06298d514db089934071355e5743bf21d60',
    discovered_at: '2026-08-26T05:00:00Z',
    last_analyzed_at: '2026-08-26T05:00:00Z',
    transaction_count: 40,
    token_transfers_count: 15,
    unique_counterparties_count: 24,
    usdt_volume: 722510.0,
    usdc_volume: 395631.0,
    total_volume_usd: 1118141.0,
    active_days: 14,
    incoming_tx_count: 18,
    outgoing_tx_count: 22,
    incoming_volume: 550000.0,
    outgoing_volume: 568141.0,
    reachable_vasps: [
      { name: 'Gate.io', min_hop: 1, direct_tx_count: 6, flow_volume_usd: 722510.0, paths_count: 6 },
      { name: 'Binance', min_hop: 1, direct_tx_count: 5, flow_volume_usd: 395631.0, paths_count: 5 },
    ],
    min_hop_to_vasp: 1,
    reachable_vasp_count: 2,
    total_paths_to_vasps: 11,
    candidate_quality_score: 76.6,
    status: 'investigation_ready',
  },
  {
    id: 3,
    address: '0x35465d7b8ec8f28b06c90ab562c85a012337f687',
    chain: 'ethereum',
    discovery_source: 'vasp_counterparty_mining',
    discovery_vasp_name: 'Binance',
    discovery_vasp_address: '0x28c6c06298d514db089934071355e5743bf21d60',
    discovered_at: '2026-08-26T05:00:00Z',
    last_analyzed_at: '2026-08-26T05:00:00Z',
    transaction_count: 40,
    token_transfers_count: 10,
    unique_counterparties_count: 19,
    usdt_volume: 100.0,
    usdc_volume: 0.0,
    total_volume_usd: 100.0,
    active_days: 12,
    incoming_tx_count: 20,
    outgoing_tx_count: 20,
    incoming_volume: 50.0,
    outgoing_volume: 50.0,
    reachable_vasps: [
      { name: 'Binance', min_hop: 1, direct_tx_count: 1, flow_volume_usd: 100.0, paths_count: 1 },
    ],
    min_hop_to_vasp: 1,
    reachable_vasp_count: 1,
    total_paths_to_vasps: 1,
    candidate_quality_score: 75.3,
    status: 'investigation_ready',
  },
  {
    id: 4,
    address: '0x77134cbc06cb00b66f4c7e623d5fdbf6777635ec',
    chain: 'ethereum',
    discovery_source: 'vasp_counterparty_mining',
    discovery_vasp_name: 'Binance',
    discovery_vasp_address: '0x28c6c06298d514db089934071355e5743bf21d60',
    discovered_at: '2026-08-26T05:00:00Z',
    last_analyzed_at: '2026-08-26T05:00:00Z',
    transaction_count: 40,
    token_transfers_count: 18,
    unique_counterparties_count: 22,
    usdt_volume: 40049597.0,
    usdc_volume: 0.0,
    total_volume_usd: 40049597.0,
    active_days: 16,
    incoming_tx_count: 22,
    outgoing_tx_count: 18,
    incoming_volume: 20000000.0,
    outgoing_volume: 20049597.0,
    reachable_vasps: [
      { name: 'Binance', min_hop: 1, direct_tx_count: 1, flow_volume_usd: 40049597.0, paths_count: 1 },
    ],
    min_hop_to_vasp: 1,
    reachable_vasp_count: 1,
    total_paths_to_vasps: 1,
    candidate_quality_score: 74.8,
    status: 'investigation_ready',
  },
  {
    id: 5,
    address: '0x0084dfd7202e5f5c0c8be83503a492837ca3e95e',
    chain: 'ethereum',
    discovery_source: 'vasp_counterparty_mining',
    discovery_vasp_name: 'Binance',
    discovery_vasp_address: '0x28c6c06298d514db089934071355e5743bf21d60',
    discovered_at: '2026-08-26T05:00:00Z',
    last_analyzed_at: '2026-08-26T05:00:00Z',
    transaction_count: 40,
    token_transfers_count: 12,
    unique_counterparties_count: 20,
    usdt_volume: 1942624.0,
    usdc_volume: 0.0,
    total_volume_usd: 1942624.0,
    active_days: 15,
    incoming_tx_count: 20,
    outgoing_tx_count: 20,
    incoming_volume: 971312.0,
    outgoing_volume: 971312.0,
    reachable_vasps: [
      { name: 'Binance', min_hop: 1, direct_tx_count: 5, flow_volume_usd: 1942624.0, paths_count: 5 },
    ],
    min_hop_to_vasp: 1,
    reachable_vasp_count: 1,
    total_paths_to_vasps: 5,
    candidate_quality_score: 74.4,
    status: 'investigation_ready',
  },
  {
    id: 6,
    address: '0xdd57f5ea9c7ca2c16e243627ca9cad9f7c2cb3cb',
    chain: 'ethereum',
    discovery_source: 'vasp_counterparty_mining',
    discovery_vasp_name: 'Binance',
    discovery_vasp_address: '0x28c6c06298d514db089934071355e5743bf21d60',
    discovered_at: '2026-08-26T05:00:00Z',
    last_analyzed_at: '2026-08-26T05:00:00Z',
    transaction_count: 40,
    token_transfers_count: 14,
    unique_counterparties_count: 21,
    usdt_volume: 52814.0,
    usdc_volume: 0.0,
    total_volume_usd: 52814.0,
    active_days: 10,
    incoming_tx_count: 19,
    outgoing_tx_count: 21,
    incoming_volume: 26400.0,
    outgoing_volume: 26414.0,
    reachable_vasps: [
      { name: 'Binance', min_hop: 1, direct_tx_count: 8, flow_volume_usd: 52814.0, paths_count: 8 },
    ],
    min_hop_to_vasp: 1,
    reachable_vasp_count: 1,
    total_paths_to_vasps: 8,
    candidate_quality_score: 74.0,
    status: 'investigation_ready',
  },
];

export const WalletSearch: React.FC<WalletSearchProps> = ({ onAnalyze, isLoading }) => {
  const [address, setAddress] = useState('');
  const [maxHops, setMaxHops] = useState<number>(3);
  const [error, setError] = useState<string | null>(null);
  const [dynamicCandidates, setDynamicCandidates] = useState<CandidateWallet[]>(DEFAULT_REAL_CANDIDATES);

  useEffect(() => {
    const fetchTopCandidates = async () => {
      try {
        const res = await api.getCandidates({ limit: 6, min_score: 40, sort_by: 'quality' });
        if (res?.candidates && res.candidates.length > 0) {
          setDynamicCandidates(res.candidates);
        }
      } catch (err) {
        console.warn('Failed to load top candidates for search presets:', err);
      }
    };
    fetchTopCandidates();
  }, []);

  const detectedChain = address.startsWith('0x')
    ? 'Ethereum Mainnet'
    : address.startsWith('T')
    ? 'Tron Network (TRC-20)'
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = address.trim();
    if (!clean) {
      setError('Please input a valid target Ethereum (0x...) or Tron (T...) wallet address.');
      return;
    }

    const isEth = /^0x[0-9a-fA-F]{40}$/.test(clean);
    const isTron = /^T[1-9A-HJ-NP-za-km-z]{33}$/.test(clean);

    if (!isEth && !isTron) {
      setError(
        'Invalid address format: Must be a 40-character Ethereum address (0x...) or 34-character Tron Base58 address (T...).'
      );
      return;
    }

    onAnalyze(clean, maxHops);
  };

  const handleSelectPreset = (addr: string) => {
    setAddress(addr);
    setError(null);
  };

  return (
    <div className="bg-surface border border-border rounded-xl shadow-vercel text-xs transition-colors overflow-hidden">
      {/* Top Meta Bar */}
      <div className="px-4 py-2.5 border-b border-border bg-surface-raised/50 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-text-muted font-mono text-[11px]">
          <Search className="h-3.5 w-3.5 text-accent shrink-0" />
          <span className="font-semibold uppercase tracking-wider text-text">
            Target Wallet Acquisition & Depth Parameters
          </span>
        </div>

        {detectedChain && (
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/25 font-medium inline-flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
            <span>{detectedChain}</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
        {/* Main Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 inline-flex items-center pointer-events-none text-text-dim group-focus-within:text-accent transition-colors">
              <Search className="h-4 w-4 shrink-0" />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter suspect target wallet address (0x... or T...)"
              className="w-full pl-10 pr-12 py-2.5 bg-bg border border-border rounded-lg text-text placeholder:text-text-dim font-mono text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 inline-flex items-center pointer-events-none">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-raised border border-border text-text-muted">
                ↵
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 shrink-0">
            {/* Depth Selector */}
            <div className="relative inline-flex items-center">
              <select
                value={maxHops}
                onChange={(e) => setMaxHops(Number(e.target.value))}
                className="appearance-none pl-3 pr-8 py-2.5 bg-bg border border-border rounded-lg text-text font-mono text-xs focus:outline-none focus:border-accent cursor-pointer shadow-sm transition-colors"
              >
                <option value={1}>1 Hop (Direct)</option>
                <option value={2}>2 Hops (Intermediary)</option>
                <option value={3}>3 Hops (Full Audit)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-dim pointer-events-none shrink-0" />
            </div>

            {/* Trace Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 bg-text text-bg hover:opacity-90 disabled:opacity-50 font-medium rounded-lg transition-opacity inline-flex items-center justify-center gap-2 shadow-sm font-sans shrink-0"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-bg border-t-transparent rounded-full animate-spin shrink-0" />
                  <span className="leading-none">Tracing Graph...</span>
                </>
              ) : (
                <>
                  <span className="leading-none">Trace Target</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="inline-flex items-center gap-2 text-danger font-mono text-xs p-3 bg-danger-subtle border border-danger-border rounded-lg animate-in fade-in duration-150 w-full">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic Real On-Chain Candidate Leads */}
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="inline-flex items-center gap-1.5 text-text-muted font-medium">
              <Radar className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>Auto-Discovered High-Quality Target Leads ({dynamicCandidates.length}):</span>
            </span>
            <span className="text-[10px] text-text-dim">Click any address to load</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 font-mono">
            {dynamicCandidates.length > 0 ? (
              dynamicCandidates.map((cand, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(cand.address)}
                  className="p-2.5 text-left bg-surface-raised/40 hover:bg-surface-raised border border-border/80 hover:border-border rounded-lg transition-all group flex flex-col justify-between space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-text group-hover:text-accent transition-colors truncate max-w-[150px]">
                      {cand.address.slice(0, 8)}...{cand.address.slice(-6)}
                    </span>
                    <span className="text-[10px] font-semibold text-verified bg-verified-subtle px-1.5 py-0.2 rounded-full border border-verified-border">
                      Score: {cand.candidate_quality_score.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-text-dim">
                    <span>{cand.chain.toUpperCase()} • {cand.transaction_count} Tx</span>
                    <span className="text-text-muted group-hover:text-text transition-colors">
                      → {cand.discovery_vasp_name}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-3 text-[11px] text-text-dim py-2 italic font-mono text-center">
                Mining discovered candidates from VASP on-chain transaction history...
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
