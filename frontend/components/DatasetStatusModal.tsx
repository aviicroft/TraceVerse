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
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

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
                    Idle / Standby
                  </Badge>
                )}
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Genuine multi-chain on-chain transaction records anchored to verified VASP seed clusters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-raised text-text-muted hover:text-text transition-colors inline-flex items-center justify-center shrink-0"
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
            <div className="p-4 rounded-xl bg-danger-subtle border border-danger-border text-danger inline-flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : status ? (
            <>
              {/* Progress Toward 100K Target Bar */}
              <div className="p-5 rounded-xl bg-surface-raised/40 border border-border space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <div className="inline-flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent shrink-0" />
                    <span className="font-semibold text-text">Progress Toward 100,000+ Record Benchmark</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-accent">
                    {status.current_transactions.toLocaleString()} / {status.target_transactions.toLocaleString()} ({status.progress_percent || 0}%)
                  </div>
                </div>
                <div className="w-full bg-surface rounded-full h-2.5 overflow-hidden border border-border">
                  <div
                    className="bg-accent h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(2, status.progress_percent || 0))}%` }}
                  />
                </div>
                {status.last_active_address && (
                  <div className="text-xs text-text-muted truncate font-mono">
                    Active Counterparty Seed: <span className="text-text font-medium">{status.last_active_address}</span>
                  </div>
                )}
              </div>

              {/* Core Dataset Metrics Grid */}
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
                  </div>
                </div>

                <div className="inline-flex items-center gap-2">
                  {status.is_running ? (
                    <Button
                      variant="danger"
                      size="md"
                      onClick={handleStopIngestion}
                      disabled={actionLoading}
                      isLoading={actionLoading}
                      icon={<Square className="h-3.5 w-3.5" />}
                    >
                      Stop Ingestion Worker
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleStartIngestion}
                      disabled={actionLoading}
                      isLoading={actionLoading}
                      icon={<Play className="h-3.5 w-3.5" />}
                    >
                      Start 100K Pipeline
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-raised/40 flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close Monitor
          </Button>
        </div>
      </div>
    </div>
  );
};
