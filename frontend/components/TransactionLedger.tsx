'use client';

import React, { useState } from 'react';
import {
  List,
  Search,
  Copy,
  Check,
  Download,
  X,
  ShieldCheck,
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

  return (
    <div className="bg-forensic-surface border border-forensic-border rounded shadow-sm flex flex-col text-xs relative transition-colors">
      {/* Header & Controls Toolbar */}
      <div className="p-3 border-b border-forensic-border bg-forensic-bg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <List className="h-4 w-4 text-blue-500" />
          <h3 className="font-mono uppercase font-bold text-forensic-text text-xs tracking-wider">
            Forensic Transaction Ledger
          </h3>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-forensic-surfaceRaised border border-forensic-border text-forensic-textMuted font-semibold">
            {filtered.length} Observed Transfers
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-forensic-textDim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search tx hash or counterparty..."
              className="pl-8 pr-3 py-1 bg-forensic-bg border border-forensic-border rounded text-forensic-text placeholder-forensic-textDim font-mono text-[11px] focus:outline-none focus:border-blue-500 w-48 sm:w-64 transition-colors"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-forensic-surfaceRaised hover:bg-forensic-border border border-forensic-border text-forensic-text font-medium text-[11px] transition-colors"
          >
            <Download className="h-3 w-3 text-forensic-textMuted" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Forensic Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-forensic-border bg-forensic-bg text-[10px] uppercase font-mono tracking-wider text-forensic-textDim">
              <th className="py-2.5 px-3">Tx Hash</th>
              <th className="py-2.5 px-3">Timestamp (UTC)</th>
              <th className="py-2.5 px-3">From Address</th>
              <th className="py-2.5 px-3">To Address</th>
              <th className="py-2.5 px-3 text-right">Volume</th>
              <th className="py-2.5 px-3 text-center">Hop</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forensic-borderMuted font-mono text-[11px]">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-forensic-textDim">
                  No forensic transactions recorded for this parameter set.
                </td>
              </tr>
            ) : (
              paginated.map((tx, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-forensic-surfaceRaised/60 cursor-pointer transition-colors"
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-forensic-text truncate max-w-[120px]">
                        {tx.tx_hash}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(tx.tx_hash, tx.tx_hash);
                        }}
                        title="Copy Tx Hash"
                        className="p-0.5 hover:text-forensic-text text-forensic-textDim"
                      >
                        {copiedHash === tx.tx_hash ? (
                          <Check className="h-3 w-3 text-forensic-teal" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-2 px-3 text-forensic-textDim text-[10px]">
                    {new Date(tx.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                  </td>

                  <td className="py-2 px-3 text-forensic-textMuted truncate max-w-[130px]">
                    {tx.from_address}
                  </td>

                  <td className="py-2 px-3 text-forensic-text truncate max-w-[130px]">
                    {tx.to_address}
                  </td>

                  <td className="py-2 px-3 text-right font-bold text-forensic-teal">
                    {tx.amount.toFixed(4)} {tx.token_symbol || 'ETH'}
                  </td>

                  <td className="py-2 px-3 text-center">
                    <span className="px-1.5 py-0.2 rounded bg-forensic-surfaceRaised border border-forensic-border text-forensic-textDim text-[10px]">
                      H{tx.hop || 1}
                    </span>
                  </td>

                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTx(tx);
                      }}
                      className="text-blue-500 hover:underline text-[10px] uppercase font-semibold"
                    >
                      Details →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-2.5 border-t border-forensic-border bg-forensic-bg flex items-center justify-between text-[11px] text-forensic-textDim font-mono">
        <div>
          Showing {paginated.length} of {filtered.length} transfers
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="px-2 py-0.5 rounded bg-forensic-surfaceRaised border border-forensic-border disabled:opacity-40 hover:bg-forensic-border text-forensic-text transition-colors"
          >
            Prev
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page >= totalPages - 1}
            className="px-2 py-0.5 rounded bg-forensic-surfaceRaised border border-forensic-border disabled:opacity-40 hover:bg-forensic-border text-forensic-text transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Right-Side Forensic Transaction Detail Drawer */}
      {selectedTx && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-forensic-surface border-l border-forensic-border shadow-2xl flex flex-col font-mono text-xs">
          <div className="p-4 border-b border-forensic-border bg-forensic-bg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-forensic-teal" />
              <h3 className="font-bold text-forensic-text uppercase text-xs">
                Transaction Forensic Details
              </h3>
            </div>
            <button
              onClick={() => setSelectedTx(null)}
              className="p-1 rounded hover:bg-forensic-surfaceRaised text-forensic-textDim hover:text-forensic-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-forensic-textDim block">Transaction Hash</span>
              <span className="text-forensic-text break-all select-all block bg-forensic-bg p-2 rounded border border-forensic-border">
                {selectedTx.tx_hash}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="p-2.5 bg-forensic-surfaceRaised rounded border border-forensic-border">
                <span className="text-[10px] uppercase text-forensic-textDim block">Transferred Volume</span>
                <strong className="text-forensic-teal font-bold text-sm">
                  {selectedTx.amount} {selectedTx.token_symbol || 'ETH'}
                </strong>
              </div>
              <div className="p-2.5 bg-forensic-surfaceRaised rounded border border-forensic-border">
                <span className="text-[10px] uppercase text-forensic-textDim block">Hop Position</span>
                <strong className="text-forensic-text text-sm">Hop {selectedTx.hop || 1}</strong>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase text-forensic-textDim block">Origin Address (From)</span>
              <span className="text-forensic-text break-all select-all block bg-forensic-bg p-2 rounded border border-forensic-border">
                {selectedTx.from_address}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase text-forensic-textDim block">Recipient Address (To)</span>
              <span className="text-forensic-text break-all select-all block bg-forensic-bg p-2 rounded border border-forensic-border">
                {selectedTx.to_address}
              </span>
            </div>

            <div className="p-3 bg-forensic-surfaceRaised rounded border border-forensic-border text-[11px] space-y-1">
              <span className="text-[10px] uppercase text-forensic-textDim block">Timestamp & Block Height</span>
              <div className="text-forensic-text">UTC: {new Date(selectedTx.timestamp).toUTCString()}</div>
              {selectedTx.block_number && (
                <div className="text-forensic-textDim">Block Number: {selectedTx.block_number}</div>
              )}
            </div>

            <div className="pt-2">
              <a
                href={
                  selectedTx.tx_hash.startsWith('0x')
                    ? `https://etherscan.io/tx/${selectedTx.tx_hash}`
                    : `https://tronscan.org/#/transaction/${selectedTx.tx_hash}`
                }
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-blue-700 hover:bg-blue-600 rounded text-center block text-white font-medium text-xs transition-colors"
              >
                Inspect on Public Blockchain Explorer
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
