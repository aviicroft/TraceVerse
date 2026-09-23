'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Layers,
  RefreshCw,
  X,
  Play,
  Square,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
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
<<<<<<< Updated upstream
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-sans">
      <div className="bg-surface border border-border rounded-xl shadow-panel-elevated w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-text transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface-raised/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-subtle border border-accent-border text-accent inline-flex items-center justify-center shrink-0">
              <Database className="h-5 w-5 shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold tracking-tight text-text">
                  Blockchain Dataset Intelligence & 100K+ Ingestion Monitor
                </h2>
                {status?.is_running ? (
                  <Badge variant="success" dot={true} pulse={true}>
                    LIVE INGESTION ACTIVE
                  </Badge>
                ) : (
                  <Badge variant="neutral">
=======
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
>>>>>>> Stashed changes
                    Idle / Standby
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Genuine multi-chain on-chain transaction records anchored to verified VASP seed clusters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
<<<<<<< Updated upstream
            className="p-1.5 rounded-lg hover:bg-surface-raised text-text-muted hover:text-text transition-colors inline-flex items-center justify-center shrink-0"
            aria-label="Close modal"
=======
            className="p-1.5 rounded-lg hover:bg-forensic-surfaceRaised text-forensic-textMuted hover:text-forensic-text transition-colors"
>>>>>>> Stashed changes
          >
            <X className="h-4 w-4 shrink-0" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {loading && !status ? (
            <div className="py-20 text-center text-text-muted flex flex-col items-center justify-center space-y-3 font-sans">
              <RefreshCw className="h-6 w-6 animate-spin text-accent shrink-0" />
              <span>Querying database transaction scale...</span>
            </div>
          ) : error ? (
<<<<<<< Updated upstream
            <div className="p-4 rounded-xl bg-danger-subtle border border-danger-border text-danger inline-flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
=======
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              {error}
>>>>>>> Stashed changes
            </div>
          ) : status ? (
            <>
              {/* Progress Toward 100K Target Bar */}
<<<<<<< Updated upstream
              <div className="p-5 rounded-xl bg-surface-raised/40 border border-border space-y-3 shadow-sm">
=======
              <div className="p-4 rounded-xl bg-forensic-surfaceRaised/50 border border-forensic-border space-y-2.5">
>>>>>>> Stashed changes
                <div className="flex items-center justify-between text-xs">
                  <div className="inline-flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent shrink-0" />
                    <span className="font-semibold text-text">Progress Toward 100,000+ Record Benchmark</span>
                  </div>
<<<<<<< Updated upstream
                  <div className="font-mono text-sm font-bold text-accent">
                    {status.current_transactions.toLocaleString()} / {status.target_transactions.toLocaleString()} ({status.progress_percent || 0}%)
                  </div>
                </div>
                <div className="w-full bg-surface rounded-full h-2.5 overflow-hidden border border-border">
=======
                  <div className="font-mono text-sm font-bold text-forensic-teal">
                    {status.current_transactions.toLocaleString()} / {status.target_transactions.toLocaleString()} txs ({status.progress_percent || 0}%)
                  </div>
                </div>
                <div className="w-full bg-forensic-bg rounded-full h-3 overflow-hidden border border-forensic-border">
>>>>>>> Stashed changes
                  <div
                    className="bg-accent h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(2, status.progress_percent || 0))}%` }}
                  />
                </div>
                {status.last_active_address && (
<<<<<<< Updated upstream
                  <div className="text-xs text-text-muted truncate font-mono">
                    Active Counterparty Seed: <span className="text-text font-medium">{status.last_active_address}</span>
=======
                  <div className="text-[11px] text-forensic-textDim font-mono truncate">
                    Active Seed Ingestion: <span className="text-forensic-text">{status.last_active_address}</span>
>>>>>>> Stashed changes
                  </div>
                )}
              </div>

              {/* Core Dataset Metrics Grid */}
<<<<<<< Updated upstream
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-surface border border-border shadow-panel space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-xs font-medium">Total Records</span>
                    <Database className="h-4 w-4 text-accent shrink-0" />
                  </div>
                  <div className="text-xl font-bold font-mono text-text">
                    {status.current_transactions.toLocaleString()}
                  </div>
                  <div className="text-xs text-text-muted">Database Table Rows</div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border shadow-panel space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-xs font-medium">Ethereum Transfers</span>
                    <Layers className="h-4 w-4 text-accent shrink-0" />
                  </div>
                  <div className="text-xl font-bold font-mono text-text">
                    {status.ethereum_transactions.toLocaleString()}
                  </div>
                  <div className="text-xs text-text-muted">{status.erc20_transactions.toLocaleString()} ERC-20 Tokens</div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border shadow-panel space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-xs font-medium">Tron Transfers</span>
                    <Layers className="h-4 w-4 text-verified shrink-0" />
                  </div>
                  <div className="text-xl font-bold font-mono text-text">
                    {status.tron_transactions.toLocaleString()}
                  </div>
                  <div className="text-xs text-text-muted">{status.trc20_transactions.toLocaleString()} TRC-20 Tokens</div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border shadow-panel space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-xs font-medium">Unique Entities</span>
                    <ShieldCheck className="h-4 w-4 text-warning shrink-0" />
                  </div>
                  <div className="text-xl font-bold font-mono text-text">
                    {status.unique_counterparties.toLocaleString()}
                  </div>
                  <div className="text-xs text-text-muted">Distinct Counterparties</div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="p-5 rounded-xl bg-surface-raised/40 border border-border flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-text text-sm">Background Ingestion Worker</div>
                  <div className="text-text-secondary text-xs mt-0.5">
                    Controls continuous polling and multi-hop counterparty expansion across Etherscan and TronGrid APIs.
=======
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
>>>>>>> Stashed changes
                  </div>
                </div>

                <div className="inline-flex items-center gap-2">
                  {status.is_running ? (
                    <button
                      onClick={handleStopIngestion}
                      disabled={actionLoading}
<<<<<<< Updated upstream
                      isLoading={actionLoading}
                      icon={<Square className="h-3.5 w-3.5" />}
                    >
                      Stop Ingestion Worker
                    </Button>
=======
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors"
                    >
                      <Square className="h-3.5 w-3.5" />
                      <span>Stop Ingestion</span>
                    </button>
>>>>>>> Stashed changes
                  ) : (
                    <button
                      onClick={handleStartIngestion}
                      disabled={actionLoading}
<<<<<<< Updated upstream
                      isLoading={actionLoading}
                      icon={<Play className="h-3.5 w-3.5" />}
                    >
                      Start 100K Pipeline
                    </Button>
=======
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition-colors"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Start 100K Ingestion</span>
                    </button>
>>>>>>> Stashed changes
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
<<<<<<< Updated upstream
        <div className="p-4 border-t border-border bg-surface-raised/40 flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close Monitor
          </Button>
=======
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
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
};
