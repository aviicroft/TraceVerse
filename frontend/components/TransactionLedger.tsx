'use client';

import React, { useState } from 'react';
import {
  List,
  Search,
  Copy,
  Check,
  Download,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { NormalizedTransaction } from '../lib/types';

interface TransactionLedgerProps {
  transactions: NormalizedTransaction[];
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({ transactions }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<string>('ALL');
  const [selectedHop, setSelectedHop] = useState<string>('ALL');
  const [selectedTx, setSelectedTx] = useState<NormalizedTransaction | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const [page, setPage] = useState<number>(0);
  const pageSize = 15;

  const handleCopy = (text: string, hash: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) return;
    const headers = ['TxHash', 'Timestamp', 'FromAddress', 'ToAddress', 'Amount', 'Asset', 'Hop'];
    const rows = transactions.map((t) => [
      t.tx_hash,
      t.timestamp,
      t.from_address,
      t.to_address,
      t.amount,
      t.token_symbol || 'ETH',
      t.hop || 1,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `forensic_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = (transactions || []).filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        t.tx_hash.toLowerCase().includes(q) ||
        t.from_address.toLowerCase().includes(q) ||
        t.to_address.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedAsset !== 'ALL' && (t.token_symbol || 'ETH').toUpperCase() !== selectedAsset) {
      return false;
    }
    if (selectedHop !== 'ALL' && t.hop?.toString() !== selectedHop) {
      return false;
    }
    return true;
  });

  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  // Extract unique tokens for filter dropdown
  const uniqueTokens = Array.from(
    new Set((transactions || []).map((t) => (t.token_symbol || 'ETH').toUpperCase()))
  );

  return (
    <div className="bg-surface border border-border rounded-xl shadow-vercel flex flex-col text-xs relative transition-colors overflow-hidden">
      {/* Header & Controls Toolbar */}
      <div className="p-3.5 border-b border-border bg-surface-raised/40 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <List className="h-4 w-4 text-accent shrink-0" />
          <h3 className="font-mono uppercase font-semibold text-text text-xs tracking-wider">
            Forensic Transaction Ledger
          </h3>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-surface-raised border border-border text-text-muted font-medium shrink-0">
            {filtered.length} Observed Transfers
          </span>
        </div>

        <div className="inline-flex items-center gap-2">
          {/* Search Box */}
          <div className="relative inline-flex items-center">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-dim pointer-events-none shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Filter by hash, from, or to..."
              className="pl-8 pr-3 py-1.5 bg-bg border border-border rounded-md text-text placeholder:text-text-dim font-mono text-[11px] focus:outline-none focus:border-accent w-44 sm:w-56 transition-colors"
            />
          </div>

          {/* Token Filter */}
          <select
            value={selectedAsset}
            onChange={(e) => {
              setSelectedAsset(e.target.value);
              setPage(0);
            }}
            className="bg-bg border border-border rounded-md text-text text-[11px] font-mono px-2 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="ALL">All Assets</option>
            {uniqueTokens.map((tok) => (
              <option key={tok} value={tok}>
                {tok}
              </option>
            ))}
          </select>

          {/* Hop Filter */}
          <select
            value={selectedHop}
            onChange={(e) => {
              setSelectedHop(e.target.value);
              setPage(0);
            }}
            className="bg-bg border border-border rounded-md text-text text-[11px] font-mono px-2 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="ALL">All Hops</option>
            <option value="1">Hop 1</option>
            <option value="2">Hop 2</option>
            <option value="3">Hop 3</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={!transactions || transactions.length === 0}
            className="h-7 px-2.5 bg-surface-raised hover:bg-surface-hover text-text border border-border rounded-md transition-colors inline-flex items-center justify-center gap-1.5 font-mono text-[11px] disabled:opacity-50 shrink-0"
            title="Download Full Ledger as CSV"
          >
            <Download className="h-3 w-3 shrink-0" />
            <span className="hidden sm:inline leading-none">CSV</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] border-collapse font-mono">
          <thead>
            <tr className="border-b border-border bg-surface-raised/20 text-[10px] uppercase text-text-dim tracking-wider font-semibold">
              <th className="py-2.5 px-3">Tx Hash</th>
              <th className="py-2.5 px-3">Timestamp (UTC)</th>
              <th className="py-2.5 px-3">From Address</th>
              <th className="py-2.5 px-3">To Address</th>
              <th className="py-2.5 px-3 text-right">Transfer Amount</th>
              <th className="py-2.5 px-3 text-center">Hop</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-text-dim">
                  No transactions match the specified filter criteria.
                </td>
              </tr>
            ) : (
              paginated.map((tx, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-surface-raised/50 transition-colors cursor-pointer group"
                >
                  <td className="py-2 px-3 text-text group-hover:text-accent font-semibold transition-colors">
                    <span className="truncate block max-w-[110px]">
                      {tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-6)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-text-muted whitespace-nowrap">
                    {tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-US', { timeZone: 'UTC' }) : 'N/A'}
                  </td>
                  <td className="py-2 px-3 text-text-muted">
                    <span className="truncate block max-w-[120px]">
                      {tx.from_address.slice(0, 8)}...{tx.from_address.slice(-6)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-text-muted">
                    <span className="truncate block max-w-[120px]">
                      {tx.to_address.slice(0, 8)}...{tx.to_address.slice(-6)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-text font-semibold whitespace-nowrap">
                    {tx.amount >= 1000 ? (tx.amount / 1000).toFixed(2) + 'k' : tx.amount.toFixed(4)}{' '}
                    <span className="text-text-muted font-normal text-[10px]">
                      {tx.token_symbol || 'ETH'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="px-1.5 py-0.2 rounded-full bg-surface-raised border border-border text-[9px] text-text-muted font-bold">
                      H{tx.hop || 1}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(tx.tx_hash, tx.tx_hash);
                      }}
                      className="h-6 w-6 rounded hover:text-text text-text-dim transition-colors inline-flex items-center justify-center shrink-0"
                      title="Copy Tx Hash"
                    >
                      {copiedHash === tx.tx_hash ? (
                        <Check className="h-3 w-3 text-verified shrink-0" />
                      ) : (
                        <Copy className="h-3 w-3 shrink-0" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-border bg-surface-raised/30 flex items-center justify-between font-mono text-[11px] text-text-muted">
        <div>
          Showing {filtered.length > 0 ? page * pageSize + 1 : 0} to{' '}
          {Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length} records
        </div>

        <div className="inline-flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-6 w-6 rounded bg-bg hover:bg-surface-raised border border-border text-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center shrink-0"
          >
            <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
          </button>
          <span className="px-2 py-0.5 rounded bg-bg border border-border text-text text-[10px] leading-none shrink-0">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="h-6 w-6 rounded bg-bg hover:bg-surface-raised border border-border text-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center shrink-0"
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          </button>
        </div>
      </div>

      {/* Transaction Detail Drawer Modal */}
      {selectedTx && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-vercel-lg w-full max-w-lg p-5 space-y-4 text-xs font-mono animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="inline-flex items-center gap-2">
                <List className="h-4 w-4 text-accent shrink-0" />
                <h4 className="font-bold text-text uppercase tracking-wider">
                  Transaction Audit Inspector
                </h4>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                aria-label="Close inspector"
                className="h-7 w-7 rounded-md hover:text-text text-text-dim transition-colors inline-flex items-center justify-center shrink-0 hover:bg-surface-hover"
              >
                <X className="h-4 w-4 shrink-0" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] uppercase text-text-dim block mb-1">Transaction Hash:</span>
                <div className="flex items-center space-x-2 p-2 bg-bg border border-border rounded-md break-all">
                  <span className="text-text font-semibold select-all text-[11px]">{selectedTx.tx_hash}</span>
                  <button
                    onClick={() => handleCopy(selectedTx.tx_hash, 'drawer-hash')}
                    className="h-6 w-6 rounded text-text-dim hover:text-text inline-flex items-center justify-center shrink-0"
                  >
                    {copiedHash === 'drawer-hash' ? <Check className="h-3.5 w-3.5 text-verified shrink-0" /> : <Copy className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-bg border border-border rounded-md">
                  <span className="text-[10px] text-text-dim block uppercase">Transfer Amount:</span>
                  <span className="text-text font-bold">
                    {selectedTx.amount} {selectedTx.token_symbol || 'ETH'}
                  </span>
                </div>
                <div className="p-2 bg-bg border border-border rounded-md">
                  <span className="text-[10px] text-text-dim block uppercase">Hop Distance:</span>
                  <span className="text-text font-bold">Hop {selectedTx.hop || 1}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase text-text-dim block mb-1">Origin Address (From):</span>
                <div className="p-2 bg-bg border border-border rounded-md break-all text-text text-[11px] select-all">
                  {selectedTx.from_address}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase text-text-dim block mb-1">Destination Address (To):</span>
                <div className="p-2 bg-bg border border-border rounded-md break-all text-text text-[11px] select-all">
                  {selectedTx.to_address}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] border-t border-border">
                <span className="text-text-muted">
                  Timestamp: {selectedTx.timestamp ? new Date(selectedTx.timestamp).toUTCString() : 'N/A'}
                </span>
                <a
                  href={`https://etherscan.io/tx/${selectedTx.tx_hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline inline-flex items-center gap-1 font-semibold shrink-0"
                >
                  <span>Etherscan</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
