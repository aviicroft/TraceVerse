'use client';

import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, ArrowRight, Radar, Sparkles, ChevronDown, Check } from 'lucide-react';
import { api } from '../lib/api';
import { CandidateWallet } from '../lib/types';
import { Button } from './ui/Button';

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
      { name: 'Binance', min_hop: 1, direct_tx_count: 4, flow_volume_usd: 40049597.0, paths_count: 4 },
    ],
    min_hop_to_vasp: 1,
    reachable_vasp_count: 1,
    total_paths_to_vasps: 4,
    candidate_quality_score: 74.8,
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

  const clean = address.trim();
  const detectedChain = clean.startsWith('0x')
    ? 'Ethereum Mainnet'
    : clean.startsWith('T')
    ? 'Tron Network (TRC-20)'
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clean) {
      setError('Please input a valid target Ethereum (0x...) or Tron (T...) wallet address.');
      return;
    }

    const isEth = /^0x[0-9a-fA-F]{40}$/.test(clean);
    const isTron = /^T[1-9A-HJ-NP-za-km-z]{33}$/.test(clean);

    if (!isEth && !isTron) {
      setError(
        'Invalid address format: Must be a 40-character Ethereum address (0x...) or 34-character Tron address (T...).'
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
    <div className="bg-surface border border-border rounded-xl shadow-panel overflow-hidden transition-colors">
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-border bg-surface-raised/40 flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <Search className="h-4 w-4 text-accent shrink-0" />
          <h2 className="text-xs font-semibold text-text uppercase tracking-wider font-sans">
            Target Investigation & Depth Parameters
          </h2>
        </div>

        {detectedChain && (
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium inline-flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
            <span>{detectedChain}</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        {/* Prominent Search Bar Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 inline-flex items-center pointer-events-none text-text-muted group-focus-within:text-accent transition-colors">
              <Search className="h-5 w-5 shrink-0" />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter suspect target wallet address, transaction, or case ID..."
              className="w-full pl-11 pr-14 py-3 bg-surface-raised/60 hover:bg-surface-raised border border-border focus:border-accent rounded-xl text-text placeholder:text-text-muted font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 inline-flex items-center pointer-events-none">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-surface border border-border text-text-muted">
                ↵
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2.5 shrink-0">
            {/* Depth Selector */}
            <div className="relative inline-flex items-center">
              <select
                value={maxHops}
                onChange={(e) => setMaxHops(Number(e.target.value))}
                className="appearance-none pl-3.5 pr-9 py-3 bg-surface-raised border border-border hover:border-border-hover rounded-xl text-text font-sans text-xs font-medium focus:outline-none focus:border-accent cursor-pointer shadow-sm transition-colors"
                title="Investigation Hop Depth"
              >
                <option value={1}>1 Hop (Direct Transfers)</option>
                <option value={2}>2 Hops (Layered Intermediaries)</option>
                <option value={3}>3 Hops (Full Audit Traversal)</option>
              </select>
              <div className="absolute right-3 pointer-events-none text-text-muted">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
              className="px-6 rounded-xl font-semibold shadow-md"
            >
              Trace Target
            </Button>
          </div>
        </div>

        {/* Validation Error Message */}
        {error && (
          <div className="p-3 bg-danger-subtle border border-danger-border rounded-lg text-danger flex items-center gap-2 text-xs font-medium animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Verified Target Presets Bar */}
        <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="inline-flex items-center gap-2 text-text-muted">
            <Radar className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="font-medium">Recent High-Confidence Candidate Leads:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {dynamicCandidates.slice(0, 3).map((cand) => (
              <button
                key={cand.id}
                type="button"
                onClick={() => handleSelectPreset(cand.address)}
                className={`px-2.5 py-1 rounded-lg border text-xs transition-all inline-flex items-center gap-1.5 ${
                  clean.toLowerCase() === cand.address.toLowerCase()
                    ? 'bg-accent/15 border-accent text-accent font-semibold'
                    : 'bg-surface-raised hover:bg-surface-hover border-border text-text-secondary hover:text-text'
                }`}
                title={`VASP: ${cand.discovery_vasp_name} | Quality: ${cand.candidate_quality_score}`}
              >
                <span className="font-mono text-xs font-medium">
                  {cand.address.slice(0, 6)}...{cand.address.slice(-4)}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface border border-border text-text-muted">
                  {cand.discovery_vasp_name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
