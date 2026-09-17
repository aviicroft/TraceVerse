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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-sans">
      <div className="bg-surface border border-border rounded-xl shadow-vercel-lg w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-text transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-raised/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 text-accent inline-flex items-center justify-center shrink-0">
              <Database className="h-5 w-5 shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-wide uppercase font-mono">
                  Blockchain Dataset Intelligence & 100K+ Ingestion Monitor
                </h2>
                {status?.is_running ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-verified-subtle text-verified border border-verified-border inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse shrink-0" />
                    <span>Live Ingestion Active</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-surface-raised text-text-muted border border-border">
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
            className="w-8 h-8 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors inline-flex items-center justify-center shrink-0"
            aria-label="Close modal"
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
            <div className="p-4 rounded-lg bg-danger-subtle border border-danger-border text-danger font-mono inline-flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : status ? (
            <>
              {/* Progress Toward 100K Target Bar */}
              <div className="p-4 sm:p-5 rounded-xl bg-surface-raised/50 border border-border space-y-3 shadow-sm font-mono">
                <div className="flex items-center justify-between text-xs">
                  <div className="inline-flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent shrink-0" />
                    <span className="font-semibold text-text">Progress Toward 100,000+ Record Benchmark</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-accent">
                    {status.current_transactions.toLocaleString()} / {status.target_transactions.toLocaleString()} txs ({status.progress_percent || 0}%)
                  </div>
                </div>
                <div className="w-full bg-bg rounded-full h-2.5 overflow-hidden border border-border">
                  <div
                    className="bg-accent h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(2, status.progress_percent || 0))}%` }}
                  />
                </div>
                {status.last_active_address && (
                  <div className="text-[11px] text-text-dim truncate">
                    Active Counterparty Seed: <span className="text-text">{status.last_active_address}</span>
                  </div>
                )}
              </div>

              {/* Core Dataset Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-3.5 rounded-xl bg-surface border border-border shadow-vercel">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-dim text-[10px] uppercase font-medium">Total Records</span>
                    <Database className="h-3.5 w-3.5 text-accent shrink-0" />
                  </div>
                  <div className="text-lg font-bold text-text">
                    {status.current_transactions.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-text-dim mt-0.5">Database Table Rows</div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-border shadow-vercel">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-dim text-[10px] uppercase font-medium">Ethereum (ETH / ERC)</span>
                    <Layers className="h-3.5 w-3.5 text-accent shrink-0" />
                  </div>
                  <div className="text-lg font-bold text-text">
                    {status.ethereum_transactions.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-text-dim mt-0.5">{status.erc20_transactions.toLocaleString()} ERC-20 Transfers</div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-border shadow-vercel">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-dim text-[10px] uppercase font-medium">Tron (TRX / TRC)</span>
                    <Layers className="h-3.5 w-3.5 text-verified shrink-0" />
                  </div>
                  <div className="text-lg font-bold text-text">
                    {status.tron_transactions.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-text-dim mt-0.5">{status.trc20_transactions.toLocaleString()} TRC-20 Transfers</div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-border shadow-vercel">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-dim text-[10px] uppercase font-medium">Unique Entities</span>
                    <ShieldCheck className="h-3.5 w-3.5 text-warning shrink-0" />
                  </div>
                  <div className="text-lg font-bold text-text">
                    {status.unique_counterparties.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-text-dim mt-0.5">Distinct Counterparties</div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="p-4 rounded-xl bg-surface-raised/40 border border-border flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-text">Background Ingestion Worker</div>
                  <div className="text-text-muted text-[11px] mt-0.5">
                    Controls continuous polling and multi-hop counterparty expansion across Etherscan and TronGrid APIs.
                  </div>
                </div>

                <div className="inline-flex items-center gap-2">
                  {status.is_running ? (
                    <button
                      onClick={handleStopIngestion}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 rounded-lg bg-danger hover:bg-danger-hover text-white font-medium text-xs inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      <Square className="h-3.5 w-3.5 shrink-0" />
                      <span>Stop Ingestion Worker</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartIngestion}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 rounded-lg bg-text text-bg hover:opacity-90 font-medium text-xs inline-flex items-center justify-center gap-1.5 transition-opacity disabled:opacity-50 shadow-sm"
                    >
                      <Play className="h-3.5 w-3.5 shrink-0" />
                      <span>Start 100K Pipeline</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
