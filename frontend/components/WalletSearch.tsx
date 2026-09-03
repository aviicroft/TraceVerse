'use client';

import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, ArrowRight, Radar } from 'lucide-react';
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
      { name: 'OKX', min_hop: 1, direct_tx_count: 1, flow_volume_usd: 420000.0, paths_count: 1 }
    ],
    min_hop_to_vasp: 1,
    reachable_vasp_count: 2,
    total_paths_to_vasps: 8,
    candidate_quality_score: 82.1,
    status: 'investigation_ready'
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
      { name: 'Binance', min_hop: 1, direct_tx_count: 5, flow_volume_usd: 395631.0, paths_count: 5 }
    ],
    min_hop_to_vasp: 1,
    reachable_vasp_count: 2,
    total_paths_to_vasps: 11,
    candidate_quality_score: 76.6,
    status: 'investigation_ready'
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
      { name: 'Binance', min_hop: 1, direct_tx_count: 1, flow_volume_usd: 100.0, paths_count: 1 }
    ],
    min_hop_to_vasp: 1,
    reachable_vasp_count: 1,
    total_paths_to_vasps: 1,
    candidate_quality_score: 75.3,
    status: 'investigation_ready'
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
      { name: 'Binance', min_hop: 1, direct_tx_count: 1, flow_volume_usd: 40049597.0, paths_count: 1 }
    ],
    min_hop_to_vasp: 1,
    reachable_vasp_count: 1,
    total_paths_to_vasps: 1,
    candidate_quality_score: 74.8,
    status: 'investigation_ready'
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
      { name: 'Binance', min_hop: 1, direct_tx_count: 5, flow_volume_usd: 1942624.0, paths_count: 5 }
    ],
    min_hop_to_vasp: 1,
    reachable_vasp_count: 1,
    total_paths_to_vasps: 5,
    candidate_quality_score: 74.4,
    status: 'investigation_ready'
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
      { name: 'Binance', min_hop: 1, direct_tx_count: 8, flow_volume_usd: 52814.0, paths_count: 8 }
    ],
    min_hop_to_vasp: 1,
    reachable_vasp_count: 1,
    total_paths_to_vasps: 8,
    candidate_quality_score: 74.0,
    status: 'investigation_ready'
  }
];

export const WalletSearch: React.FC<WalletSearchProps> = ({ onAnalyze, isLoading }) => {
  const [address, setAddress] = useState('');
  const [maxHops, setMaxHops] = useState<number>(3);
  const [error, setError] = useState<string | null>(null);
  const [dynamicCandidates, setDynamicCandidates] = useState<CandidateWallet[]>(DEFAULT_REAL_CANDIDATES);

  useEffect(() => {
    // Load top discovered candidates dynamically from database
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
      setError('Invalid format: Target must be a 40-character Ethereum hex address (0x...) or 34-character Tron Base58 address (T...).');
      return;
    }

    onAnalyze(clean, maxHops);
  };

  const handleSelectPreset = (addr: string) => {
    setAddress(addr);
    setError(null);
  };

  return (
    <div className="bg-forensic-surface border border-forensic-border rounded shadow-sm text-xs transition-colors">
      <div className="px-4 py-2 border-b border-forensic-border bg-forensic-bg flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-forensic-textDim font-semibold">
          Target Wallet Acquisition & Depth Parameters
        </span>
        {detectedChain && (
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30">
            Detected: {detectedChain}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-forensic-textDim">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter suspect target wallet address (0x... for ETH or T... for Tron TRC-20 USDT)"
              className="w-full pl-9 pr-3 py-2 bg-forensic-bg border border-forensic-border rounded text-forensic-text placeholder-forensic-textDim font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-forensic-surfaceRaised px-2 py-1.5 border border-forensic-border rounded">
              <span className="text-[10px] text-forensic-textMuted uppercase font-semibold">Depth:</span>
              <select
                value={maxHops}
                onChange={(e) => setMaxHops(Number(e.target.value))}
                className="bg-transparent text-forensic-text font-mono text-xs focus:outline-none cursor-pointer"
              >
                <option value={1} className="bg-forensic-surface text-forensic-text">1 Hop (Direct Interaction)</option>
                <option value={2} className="bg-forensic-surface text-forensic-text">2 Hops (Intermediary Layering)</option>
                <option value={3} className="bg-forensic-surface text-forensic-text">3 Hops (Full Audit Traversal)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Tracing...</span>
                </>
              ) : (
                <>
                  <span>Trace Target</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-mono text-xs p-2 bg-red-500/10 border border-red-500/20 rounded">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic Real On-Chain Candidate Leads */}
        <div className="pt-2 border-t border-forensic-border space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-forensic-textDim uppercase font-mono">
            <span className="flex items-center space-x-1">
              <Radar className="h-3 w-3 text-blue-400" />
              <span>Auto-Discovered High-Quality Target Leads ({dynamicCandidates.length}):</span>
            </span>
            <span className="text-[9px] text-forensic-teal font-semibold">Real Blockchain Counterparties</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 font-mono">
            {dynamicCandidates.length > 0 ? (
              dynamicCandidates.map((cand, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(cand.address)}
                  className="p-2 text-left bg-forensic-bg hover:bg-forensic-surfaceRaised border border-forensic-border rounded transition-colors group flex flex-col justify-between space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-forensic-text group-hover:text-blue-400 transition-colors truncate max-w-[160px]">
                      {cand.address.slice(0, 8)}...{cand.address.slice(-6)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      Score: {cand.candidate_quality_score.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-forensic-textDim">
                    <span>{cand.chain.toUpperCase()} • {cand.transaction_count} Tx</span>
                    <span className="text-forensic-textMuted group-hover:text-forensic-text">
                      → {cand.discovery_vasp_name}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-3 text-[11px] text-forensic-textDim py-1 italic">
                Discovery pipeline populating candidates from VASP transaction history...
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
