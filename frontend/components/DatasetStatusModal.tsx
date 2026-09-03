'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Layers,
  Activity,
  CheckCircle2,
  RefreshCw,
  X,
  Play,
  Square,
  ShieldCheck,
  Coins,
  Cpu,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';

interface IngestionStatus {
  target_transactions: number;
  current_transactions: number;
  progress_percent: number;
  ethereum_transactions: number;
  tron_transactions: number;
  erc20_transactions: number;
  trc20_transactions: number;
  usdt_transactions: number;
  unique_counterparties: number;
  vasp_seed_addresses: number;
  addresses_processed: number;
  addresses_remaining: number;
  api_requests_made: number;
  failed_requests: number;
  duplicate_records_skipped: number;
  is_running: boolean;
  last_updated: string;
  last_active_address?: string;
}

interface DatasetStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatasetStatusModal: React.FC<DatasetStatusModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<IngestionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await api.getDatasetIngestionStatus();
      setStatus(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch dataset status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleStartIngestion = async () => {
    setActionLoading(true);
    try {
      await api.startDatasetIngestion(100000);
      await fetchStatus();
    } catch (err: any) {
      setError(err?.message || 'Failed to start ingestion');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopIngestion = async () => {
    setActionLoading(true);
    try {
      await api.stopDatasetIngestion();
      await fetchStatus();
    } catch (err: any) {
      setError(err?.message || 'Failed to stop ingestion');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-forensic-surface border border-forensic-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-forensic-text">
        {/* Header */}
        <div className="p-4 border-b border-forensic-border flex items-center justify-between bg-forensic-surfaceRaised/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-forensic-teal">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold tracking-wide uppercase">
                  Blockchain Dataset Intelligence & 100K+ Ingestion Monitor
                </h2>
                {status?.is_running ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-teal-500/15 text-forensic-teal border border-teal-500/30 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-forensic-teal animate-pulse" />
                    <span>Live Ingestion Active</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-forensic-surfaceRaised text-forensic-textDim border border-forensic-border">
                    Idle / Standby
                  </span>
                )}
              </div>
              <p className="text-xs text-forensic-textDim mt-0.5">
                Genuine multi-chain on-chain transaction records anchored to verified VASP seed clusters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-forensic-surfaceRaised text-forensic-textMuted hover:text-forensic-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {loading && !status ? (
            <div className="py-20 text-center text-forensic-textMuted flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-forensic-teal" />
              <span>Querying PostgreSQL database metrics...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              {error}
            </div>
          ) : status ? (
            <>
              {/* Progress Toward 100K Target Bar */}
              <div className="p-4 rounded-xl bg-forensic-surfaceRaised/50 border border-forensic-border space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-forensic-teal" />
                    <span className="font-bold text-forensic-text">Progress Toward Target (100,000+ Records)</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-forensic-teal">
                    {status.current_transactions.toLocaleString()} / {status.target_transactions.toLocaleString()} txs ({status.progress_percent || 0}%)
                  </div>
                </div>
                <div className="w-full bg-forensic-bg rounded-full h-3 overflow-hidden border border-forensic-border">
                  <div
                    className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(2, status.progress_percent || 0))}%` }}
                  />
                </div>
                {status.last_active_address && (
                  <div className="text-[11px] text-forensic-textDim font-mono truncate">
                    Active Seed Ingestion: <span className="text-forensic-text">{status.last_active_address}</span>
                  </div>
                )}
              </div>

              {/* Core Dataset Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg bg-forensic-surfaceRaised/40 border border-forensic-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-forensic-textDim text-[11px] uppercase tracking-wider">Total Records</span>
                    <Database className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-forensic-text">
                    {status.current_transactions.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-forensic-textDim mt-0.5">PostgreSQL Table Rows</div>
                </div>

                <div className="p-3.5 rounded-lg bg-forensic-surfaceRaised/40 border border-forensic-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-forensic-textDim text-[11px] uppercase tracking-wider">Ethereum (ETH / ERC-20)</span>
                    <Layers className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-blue-400">
                    {status.ethereum_transactions.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-forensic-textDim mt-0.5">{status.erc20_transactions.toLocaleString()} ERC-20 Transfers</div>
                </div>

                <div className="p-3.5 rounded-lg bg-forensic-surfaceRaised/40 border border-forensic-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-forensic-textDim text-[11px] uppercase tracking-wider">Tron (TRX / TRC-20)</span>
                    <Layers className="h-4 w-4 text-rose-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-rose-400">
                    {status.tron_transactions.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-forensic-textDim mt-0.5">{status.trc20_transactions.toLocaleString()} TRC-20 Transfers</div>
                </div>

                <div className="p-3.5 rounded-lg bg-forensic-surfaceRaised/40 border border-forensic-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-forensic-textDim text-[11px] uppercase tracking-wider">USDT Movements</span>
                    <Coins className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {status.usdt_transactions.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-forensic-textDim mt-0.5">Tether ERC-20 + TRC-20</div>
                </div>
              </div>

              {/* Secondary Details: Counterparties, Seed Wallets, API Resilience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Card: Provenance & Counterparties */}
                <div className="p-4 rounded-xl bg-forensic-surfaceRaised/40 border border-forensic-border space-y-3 font-mono text-[11px]">
                  <div className="font-bold text-forensic-text uppercase tracking-wider font-sans text-xs flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-forensic-teal" />
                    <span>Provenance & Topological Reach</span>
                  </div>
                  <div className="space-y-2 divide-y divide-forensic-border/40">
                    <div className="flex justify-between pt-1">
                      <span className="text-forensic-textDim">Verified Seed Addresses:</span>
                      <span className="font-bold text-forensic-text">{status.vasp_seed_addresses.toLocaleString()} Wallets</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-forensic-textDim">Unique Counterparties Observed:</span>
                      <span className="font-bold text-teal-400">{status.unique_counterparties.toLocaleString()} Unique Addresses</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-forensic-textDim">Seed Addresses Ingested:</span>
                      <span className="text-forensic-text">{status.addresses_processed} / {status.vasp_seed_addresses}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-forensic-textDim">Duplicate Records Prevented:</span>
                      <span className="text-emerald-400 font-bold">{status.duplicate_records_skipped.toLocaleString()} Skipped</span>
                    </div>
                  </div>
                </div>

                {/* Right Card: API Throttling & Rate Limiting Health */}
                <div className="p-4 rounded-xl bg-forensic-surfaceRaised/40 border border-forensic-border space-y-3 font-mono text-[11px]">
                  <div className="font-bold text-forensic-text uppercase tracking-wider font-sans text-xs flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-blue-400" />
                    <span>API Performance & Throttling Health</span>
                  </div>
                  <div className="space-y-2 divide-y divide-forensic-border/40">
                    <div className="flex justify-between pt-1">
                      <span className="text-forensic-textDim">API Requests Dispatched:</span>
                      <span className="font-bold text-forensic-text">{status.api_requests_made.toLocaleString()} Requests</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-forensic-textDim">Throttling Delay:</span>
                      <span className="text-forensic-text">0.25s / call (Max ~4.0 req/s)</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-forensic-textDim">Failed / Retried Requests:</span>
                      <span className="text-amber-400">{status.failed_requests} (Auto-Recovered)</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-forensic-textDim">Local Disk Page Cache:</span>
                      <span className="text-emerald-400 font-bold">Enabled (data/cache/transactions/)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="p-4 rounded-xl bg-forensic-surfaceRaised/50 border border-forensic-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-forensic-text">Worker Process Control</div>
                  <div className="text-[11px] text-forensic-textDim">
                    Run or pause background multi-chain blockchain data ingestion with auto-checkpointing.
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {status.is_running ? (
                    <button
                      onClick={handleStopIngestion}
                      disabled={actionLoading}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors"
                    >
                      <Square className="h-3.5 w-3.5" />
                      <span>Stop Ingestion</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartIngestion}
                      disabled={actionLoading}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition-colors"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Start 100K Ingestion</span>
                    </button>
                  )}
                  <button
                    onClick={fetchStatus}
                    className="p-1.5 rounded-lg bg-forensic-surfaceRaised hover:bg-forensic-border text-forensic-text border border-forensic-border transition-colors"
                    title="Refresh Stats"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-forensic-border bg-forensic-surfaceRaised/40 flex items-center justify-between text-xs">
          <div className="text-[11px] text-forensic-textDim font-mono">
            Target: 100,000 Records | Last Updated: {status?.last_updated || 'Active'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-forensic-surfaceRaised hover:bg-forensic-border text-forensic-text border border-forensic-border transition-colors font-medium text-xs"
          >
            Close Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
