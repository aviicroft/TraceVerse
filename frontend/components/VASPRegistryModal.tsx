'use client';

import React, { useState, useEffect } from 'react';
import { Database, Search, ExternalLink, Copy, Check, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

interface VASPRegistryModalProps {
  onClose?: () => void;
  isFullPageView?: boolean;
}

export const VASPRegistryModal: React.FC<VASPRegistryModalProps> = ({
  onClose,
  isFullPageView = false,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState<string>('ALL');
  const [selectedVasp, setSelectedVasp] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [page, setPage] = useState<number>(0);
  const pageSize = 25;

  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [searchQuery, selectedChain, selectedVasp, selectedType, page]);

  const loadStats = async () => {
    try {
      const s = await api.getVASPStats();
      setStats(s);
    } catch (e) {
      console.error('Failed to load VASP stats:', e);
    }
  };

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.getVASPAddresses({
        query: searchQuery || undefined,
        chain: selectedChain !== 'ALL' ? selectedChain : undefined,
        vasp_name: selectedVasp !== 'ALL' ? selectedVasp : undefined,
        address_type: selectedType !== 'ALL' ? selectedType : undefined,
        limit: pageSize,
        offset: page * pageSize,
      });
      setAddresses(res.addresses || []);
      setTotalMatches(res.total || 0);
    } catch (e) {
      console.error('Failed to load VASP addresses:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  const totalPages = Math.ceil(totalMatches / pageSize) || 1;

  const content = (
    <div
      className={`bg-surface border border-border rounded-xl w-full flex flex-col font-mono text-xs overflow-hidden transition-colors ${
        isFullPageView ? 'shadow-vercel' : 'max-w-6xl max-h-[92vh] shadow-vercel-lg'
      }`}
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border flex flex-wrap items-center justify-between bg-surface-raised/40 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 text-accent inline-flex items-center justify-center shrink-0">
            <Database className="h-4 w-4 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold text-text uppercase tracking-wider">
                VASPs & Entity Intelligence Registry
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-verified-subtle text-verified border border-verified-border text-[10px] font-bold">
                {stats ? `${stats.total_addresses.toLocaleString()} VERIFIED ADDRESSES` : 'LOADING...'}
              </span>
            </div>
            <p className="text-[10px] text-text-dim font-sans mt-0.5">
              Curated public Proof-of-Reserves, Etherscan verified labels, Tronscan tags & FIU-IND registrations
            </p>
          </div>
        </div>

        {onClose && !isFullPageView && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-text-dim hover:text-text hover:bg-surface-hover transition-colors inline-flex items-center justify-center shrink-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 shrink-0" />
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-bg border-b border-border flex flex-wrap items-center justify-between gap-2.5 text-[11px]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-dim pointer-events-none shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search address, label, or entity..."
              className="pl-8 pr-3 py-1.5 bg-surface border border-border rounded-lg text-text placeholder:text-text-dim text-[11px] focus:outline-none focus:border-accent w-48 sm:w-64 transition-colors"
            />
          </div>

          {/* Chain Select */}
          <select
            value={selectedChain}
            onChange={(e) => {
              setSelectedChain(e.target.value);
              setPage(0);
            }}
            className="bg-surface border border-border rounded-lg text-text px-2 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="ALL">All Chains</option>
            <option value="ethereum">Ethereum</option>
            <option value="tron">Tron TRC-20</option>
          </select>

          {/* VASP Select */}
          <select
            value={selectedVasp}
            onChange={(e) => {
              setSelectedVasp(e.target.value);
              setPage(0);
            }}
            className="bg-surface border border-border rounded-lg text-text px-2 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="ALL">All Entities</option>
            {stats?.supported_vasps?.map((v: string) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="text-text-dim text-[11px]">
          Showing {totalMatches.toLocaleString()} matching records
        </div>
      </div>

      {/* Addresses Table */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-border bg-surface-raised/20 text-[10px] uppercase text-text-dim tracking-wider font-semibold sticky top-0">
              <th className="py-2.5 px-4">Entity / VASP</th>
              <th className="py-2.5 px-4">Chain</th>
              <th className="py-2.5 px-4">Address Type</th>
              <th className="py-2.5 px-4">Verified Cluster Address</th>
              <th className="py-2.5 px-4 text-center">Confidence</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-dim font-sans">
                  <div className="inline-flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-accent shrink-0" />
                    <span>Loading registry records...</span>
                  </div>
                </td>
              </tr>
            ) : addresses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-dim font-sans">
                  No addresses found matching filter criteria.
                </td>
              </tr>
            ) : (
              addresses.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-text">
                    <span className="text-accent">{item.vasp_name}</span>
                  </td>
                  <td className="py-2.5 px-4 uppercase text-[10px] text-text-muted">
                    {item.chain}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-1.5 py-0.2 rounded bg-surface-raised border border-border text-text-muted text-[10px]">
                      {item.address_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-text select-all break-all">
                    {item.address}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="text-verified font-semibold text-[10px]">
                      {item.confidence || 'HIGH'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleCopy(item.address)}
                        className="w-6 h-6 inline-flex items-center justify-center rounded hover:bg-surface-raised/80 text-text-dim hover:text-text transition-colors shrink-0"
                        title="Copy Address"
                      >
                        {copiedAddr === item.address ? (
                          <Check className="h-3.5 w-3.5 text-verified shrink-0" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 shrink-0" />
                        )}
                      </button>
                      <a
                        href={
                          item.chain === 'tron'
                            ? `https://tronscan.org/#/address/${item.address}`
                            : `https://etherscan.io/address/${item.address}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="w-6 h-6 inline-flex items-center justify-center rounded hover:bg-surface-raised/80 text-text-dim hover:text-text transition-colors shrink-0"
                        title="View on Explorer"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-border bg-surface-raised/30 flex items-center justify-between text-text-muted text-[11px]">
        <div>
          Page {page + 1} of {totalPages}
        </div>
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-6 h-6 rounded bg-surface hover:bg-surface-raised border border-border text-text disabled:opacity-40 transition-colors inline-flex items-center justify-center shrink-0"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
          </button>
          <span className="px-2 py-0.5 rounded bg-surface border border-border text-text text-[10px]">
            {page + 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="w-6 h-6 rounded bg-surface hover:bg-surface-raised border border-border text-text disabled:opacity-40 transition-colors inline-flex items-center justify-center shrink-0"
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );

  if (isFullPageView) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      {content}
    </div>
  );
};
