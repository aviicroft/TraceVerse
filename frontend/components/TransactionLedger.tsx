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
import { TechnicalValue } from './ui/TechnicalValue';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { CustomSelect } from './ui/Select';

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
  const pageSize = 12;

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
    link.setAttribute('download', `traceverse_transactions_${Date.now()}.csv`);
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

  const uniqueTokens = Array.from(
    new Set((transactions || []).map((t) => (t.token_symbol || 'ETH').toUpperCase()))
  );

  return (
    <div className="bg-surface border border-border rounded-xl shadow-panel flex flex-col relative transition-colors overflow-hidden">
      {/* Header & Controls Toolbar */}
      <div className="p-4 border-b border-border bg-surface-raised/40 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2.5">
          <List className="h-4 w-4 text-accent shrink-0" />
          <h3 className="font-semibold text-text text-sm tracking-wide">
            Forensic Transaction Ledger
          </h3>
          <Badge variant="neutral" size="sm">
            {filtered.length} Transfers
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex-1 sm:flex-none w-full sm:w-auto group">
            <Search className="h-4 w-4 text-[#94A3B8] group-focus-within:text-[#E63946] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none shrink-0 transition-colors" />
            <input
              type="text"
              placeholder="Search hash or address..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="pl-9 pr-3 py-2 sm:py-1.5 bg-[#102347] border border-[#29436B] hover:border-[#3C5C89] rounded-xl text-[#F8FAFC] placeholder:text-[#94A3B8] placeholder:opacity-100 text-xs focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 w-full sm:w-56 transition-all font-mono min-h-[44px] sm:min-h-[36px]"
            />
          </div>

          {/* Asset Filter */}
          {uniqueTokens.length > 1 && (
            <div className="w-full sm:w-auto">
              <CustomSelect
                value={selectedAsset}
                onChange={(val) => {
                  setSelectedAsset(String(val));
                  setPage(0);
                }}
                options={[
                  { value: 'ALL', label: 'All Assets' },
                  ...uniqueTokens.map((t) => ({ value: t, label: t })),
                ]}
                className="w-full sm:min-w-[120px]"
                size="md"
              />
            </div>
          )}

          {/* Hop Filter */}
          <div className="w-full sm:w-auto">
            <CustomSelect
              value={selectedHop}
              onChange={(val) => {
                setSelectedHop(String(val));
                setPage(0);
              }}
              options={[
                { value: 'ALL', label: 'All Hops' },
                { value: '1', label: 'Hop 1 (Direct)' },
                { value: '2', label: 'Hop 2' },
                { value: '3', label: 'Hop 3' },
              ]}
              className="w-full sm:min-w-[130px]"
              size="md"
            />
          </div>

          {/* CSV Export */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="h-3.5 w-3.5" />}
            title="Export CSV"
            className="min-h-[44px] sm:min-h-[36px] w-full sm:w-auto"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Desktop Table Section (md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-raised/30 text-xs text-text-muted font-medium">
              <th className="py-3 px-4">Tx Hash</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">From</th>
              <th className="py-3 px-4">To</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Hop</th>
              <th className="py-3 px-4 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-text-muted">
                  No transactions found matching the filter criteria.
                </td>
              </tr>
            ) : (
              paginated.map((tx, idx) => (
                <tr
                  key={tx.tx_hash + idx}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-surface-raised/50 cursor-pointer transition-colors group h-14"
                >
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-mono text-text font-medium text-technical">
                        {tx.tx_hash.slice(0, 8)}...{tx.tx_hash.slice(-6)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(tx.tx_hash, tx.tx_hash);
                        }}
                        className="p-1 rounded hover:bg-surface-raised text-text-muted hover:text-text transition-colors"
                        title="Copy Tx Hash"
                      >
                        {copiedHash === tx.tx_hash ? (
                          <Check className="h-3.5 w-3.5 text-verified" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-text-secondary whitespace-nowrap">
                    {new Date(tx.timestamp).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="py-3 px-4 font-mono text-technical text-text-secondary">
                    {tx.from_address.slice(0, 6)}...{tx.from_address.slice(-4)}
                  </td>

                  <td className="py-3 px-4 font-mono text-technical text-text-secondary">
                    {tx.to_address.slice(0, 6)}...{tx.to_address.slice(-4)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-semibold text-text">
                    {tx.amount.toFixed(4)}{' '}
                    <span className="text-text-muted font-normal text-xs">
                      {tx.token_symbol || 'ETH'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium border ${
                        tx.hop === 1
                          ? 'bg-accent/10 text-accent border-accent/25'
                          : 'bg-surface-raised text-text-muted border-border'
                      }`}
                    >
                      Hop {tx.hop || 1}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <a
                      href={
                        tx.tx_hash.startsWith('0x')
                          ? `https://etherscan.io/tx/${tx.tx_hash}`
                          : `https://tronscan.org/#/transaction/${tx.tx_hash}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-md hover:bg-surface-raised text-text-muted hover:text-accent transition-colors inline-flex items-center justify-center"
                      title="Inspect on block explorer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Transaction Cards Section (< md) */}
      <div className="md:hidden divide-y divide-border/60">
        {paginated.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-xs">
            No transactions found matching the filter criteria.
          </div>
        ) : (
          paginated.map((tx, idx) => (
            <div
              key={tx.tx_hash + idx}
              onClick={() => setSelectedTx(tx)}
              className="p-4 hover:bg-surface-raised/40 active:bg-surface-raised/60 transition-colors cursor-pointer space-y-3"
            >
              {/* Top row: Hash, Hop badge, Time */}
              <div className="flex items-center justify-between text-xs">
                <div className="inline-flex items-center gap-2">
                  <span className="font-mono text-text font-bold text-xs">
                    {tx.tx_hash.slice(0, 8)}...{tx.tx_hash.slice(-6)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(tx.tx_hash, tx.tx_hash);
                    }}
                    className="h-8 w-8 rounded-lg hover:bg-surface-raised text-text-muted hover:text-text transition-colors inline-flex items-center justify-center"
                    title="Copy Tx Hash"
                  >
                    {copiedHash === tx.tx_hash ? (
                      <Check className="h-3.5 w-3.5 text-verified" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <div className="inline-flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
                      tx.hop === 1
                        ? 'bg-accent/10 text-accent border-accent/25'
                        : 'bg-surface-raised text-text-muted border-border'
                    }`}
                  >
                    Hop {tx.hop || 1}
                  </span>
                </div>
              </div>

              {/* Value & Timestamp */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-text-muted block">Transfer Value</span>
                  <strong className="font-mono text-base font-bold text-text">
                    {tx.amount.toFixed(4)}{' '}
                    <span className="text-text-muted font-normal text-xs">
                      {tx.token_symbol || 'ETH'}
                    </span>
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-text-muted block">Timestamp</span>
                  <span className="text-xs text-text-secondary font-mono">
                    {new Date(tx.timestamp).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Routing Addresses */}
              <div className="p-2.5 bg-surface-raised/60 rounded-lg border border-border/70 text-[11px] font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">From:</span>
                  <span className="text-text-secondary font-medium">
                    {tx.from_address.slice(0, 8)}...{tx.from_address.slice(-6)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">To:</span>
                  <span className="text-text-secondary font-medium">
                    {tx.to_address.slice(0, 8)}...{tx.to_address.slice(-6)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-accent font-medium">
                  Tap to view forensic record →
                </span>
                <a
                  href={
                    tx.tx_hash.startsWith('0x')
                      ? `https://etherscan.io/tx/${tx.tx_hash}`
                      : `https://tronscan.org/#/transaction/${tx.tx_hash}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 px-2 rounded-md hover:bg-surface-raised text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1 text-[11px]"
                >
                  <span>Explorer</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-border bg-surface-raised/30 flex items-center justify-between text-xs text-text-muted">
          <span>
            Page {page + 1} of {totalPages} ({filtered.length} total transfers)
          </span>
          <div className="inline-flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              icon={<ChevronLeft className="h-3.5 w-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              icon={<ChevronRight className="h-3.5 w-3.5" />}
              iconPosition="right"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Detail Slideover Drawer */}
      {selectedTx && (
        <div className="absolute inset-0 z-30 bg-surface/95 backdrop-blur-sm p-6 overflow-y-auto animate-in fade-in duration-150 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="inline-flex items-center gap-2">
                <List className="h-4 w-4 text-accent shrink-0" />
                <h4 className="font-semibold text-text text-sm">
                  Transaction Audit Record
                </h4>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg hover:bg-surface-raised text-text-muted hover:text-text transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-raised/50 border border-border rounded-xl space-y-1">
                <span className="text-xs text-text-muted">Transaction Hash</span>
                <div className="font-mono text-xs text-text font-bold break-all select-all">
                  {selectedTx.tx_hash}
                </div>
              </div>

              <div className="p-4 bg-surface-raised/50 border border-border rounded-xl space-y-1">
                <span className="text-xs text-text-muted">Transfer Value</span>
                <div className="font-mono text-base text-text font-bold">
                  {selectedTx.amount} {selectedTx.token_symbol || 'ETH'}
                </div>
              </div>

              <div className="p-4 bg-surface-raised/50 border border-border rounded-xl space-y-1">
                <span className="text-xs text-text-muted">Source Wallet (From)</span>
                <div className="font-mono text-xs text-text font-semibold break-all select-all">
                  {selectedTx.from_address}
                </div>
              </div>

              <div className="p-4 bg-surface-raised/50 border border-border rounded-xl space-y-1">
                <span className="text-xs text-text-muted">Destination Wallet (To)</span>
                <div className="font-mono text-xs text-text font-semibold break-all select-all">
                  {selectedTx.to_address}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setSelectedTx(null)}>
              Close
            </Button>
            <a
              href={
                selectedTx.tx_hash.startsWith('0x')
                  ? `https://etherscan.io/tx/${selectedTx.tx_hash}`
                  : `https://tronscan.org/#/transaction/${selectedTx.tx_hash}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" size="md" icon={<ExternalLink className="h-4 w-4" />}>
                Open Block Explorer
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
