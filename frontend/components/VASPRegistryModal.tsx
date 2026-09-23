'use client';

import React, { useState, useEffect } from 'react';
<<<<<<< Updated upstream
import { Database, Search, ExternalLink, Copy, Check, X, ChevronLeft, ChevronRight, RefreshCw, CheckCircle2 } from 'lucide-react';
=======
import {
  Database,
  Search,
  ExternalLink,
  Copy,
  Check,
  X,
} from 'lucide-react';
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    <div
      className={`bg-surface border border-border rounded-xl w-full flex flex-col font-sans text-xs overflow-hidden transition-colors ${
        isFullPageView ? 'shadow-panel' : 'max-w-6xl max-h-[92vh] shadow-panel-elevated'
      }`}
    >
      {/* Header */}
      <div className="p-5 border-b border-border flex flex-wrap items-center justify-between bg-surface-raised/40 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-subtle border border-accent-border text-accent inline-flex items-center justify-center shrink-0">
            <Database className="h-5 w-5 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-bold text-text">
                VASP & Entity Intelligence Registry
              </h2>
              <Badge variant="success" dot={true}>
                {stats ? `${stats.total_addresses.toLocaleString()} Verified Addresses` : 'Loading...'}
              </Badge>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
=======
    <div className={`bg-forensic-surface border border-forensic-border rounded w-full flex flex-col font-mono text-xs overflow-hidden transition-colors ${
      isFullPageView ? 'shadow-sm' : 'max-w-6xl max-h-[92vh] shadow-2xl'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-forensic-border flex items-center justify-between bg-forensic-bg">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded bg-forensic-surfaceRaised border border-forensic-border text-blue-500">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-bold text-forensic-text uppercase tracking-wider">
                VASPs & Entity Intelligence Registry
              </h2>
              <span className="px-1.5 py-0.2 rounded bg-teal-500/15 text-forensic-teal border border-teal-500/30 text-[10px] font-bold">
                {stats ? `${stats.total_addresses.toLocaleString()} VERIFIED ADDRESSES` : 'LOADING...'}
              </span>
            </div>
            <p className="text-[10px] text-forensic-textDim font-sans">
>>>>>>> Stashed changes
              Curated public Proof-of-Reserves, Etherscan verified labels, Tronscan tags & FIU-IND registrations
            </p>
          </div>
        </div>

        {onClose && !isFullPageView && (
          <button
            onClick={onClose}
<<<<<<< Updated upstream
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors inline-flex items-center justify-center shrink-0"
            aria-label="Close modal"
=======
            className="p-1 rounded text-forensic-textDim hover:text-forensic-text hover:bg-forensic-surfaceRaised"
>>>>>>> Stashed changes
          >
            <X className="h-4 w-4 shrink-0" />
          </button>
        )}
      </div>

<<<<<<< Updated upstream
      {/* Filter Toolbar */}
      <div className="p-3.5 bg-surface-raised/30 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search address, label, or entity..."
              className="pl-9 pr-3 py-1.5 bg-surface border border-border rounded-xl text-text placeholder:text-text-muted text-xs focus:outline-none focus:border-accent w-52 sm:w-64 transition-colors font-mono"
            />
=======
      {/* High-Level Stat Counters */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-forensic-bg border-b border-forensic-border text-xs">
          <div className="p-2.5 bg-forensic-surface rounded border border-forensic-border">
            <span className="text-[10px] uppercase text-forensic-textDim block">Registered Entities</span>
            <strong className="text-base text-blue-500">{stats.total_vasps} VASPs</strong>
>>>>>>> Stashed changes
          </div>

          {/* Chain Select */}
          <select
            value={selectedChain}
            onChange={(e) => {
              setSelectedChain(e.target.value);
              setPage(0);
            }}
<<<<<<< Updated upstream
            className="bg-surface border border-border rounded-xl text-text px-3 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
=======
            className="bg-forensic-bg border border-forensic-border text-forensic-text rounded px-2 py-1.5 text-[11px] font-mono"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            className="bg-surface border border-border rounded-xl text-text px-3 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
=======
            className="bg-forensic-bg border border-forensic-border text-forensic-text rounded px-2 py-1.5 text-[11px] font-mono"
>>>>>>> Stashed changes
          >
            <option value="ALL">All Entities</option>
            {stats?.supported_vasps?.map((v: string) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
<<<<<<< Updated upstream

        <div className="text-text-muted text-xs font-medium">
          Showing {totalMatches.toLocaleString()} matching records
        </div>
      </div>

      {/* Addresses Table */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-raised/40 text-xs text-text-muted font-medium sticky top-0">
              <th className="py-3 px-4">Entity / VASP</th>
              <th className="py-3 px-4">Chain</th>
              <th className="py-3 px-4">Address Type</th>
              <th className="py-3 px-4">Verified Cluster Address</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-text-muted">
                  <div className="inline-flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-accent shrink-0" />
                    <span>Loading registry records...</span>
                  </div>
                </td>
              </tr>
            ) : addresses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-text-muted">
                  No addresses found matching filter criteria.
                </td>
              </tr>
            ) : (
              addresses.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-raised/40 transition-colors h-13">
                  <td className="py-3 px-4 font-bold text-text">
                    <span className="text-accent text-xs font-semibold">{item.vasp_name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="uppercase text-xs px-2 py-0.5 rounded-full bg-surface-raised border border-border text-text-muted font-mono font-medium">
                      {item.chain}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-surface-raised border border-border text-text-secondary text-xs">
                      {item.address_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-technical text-text font-semibold select-all break-all">
                    {item.address}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="success" size="sm" dot={true}>
                      VERIFIED
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleCopy(item.address)}
                        className="p-1.5 rounded-lg hover:bg-surface-raised text-text-muted hover:text-text transition-colors shrink-0"
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
                        className="p-1.5 rounded-lg hover:bg-surface-raised text-text-muted hover:text-accent transition-colors shrink-0"
                        title="View on Explorer"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    </div>
                  </td>
=======
      </div>

      {/* Address Records Table */}
      <div className={`overflow-y-auto p-3 bg-forensic-bg ${isFullPageView ? 'min-h-[400px]' : 'flex-1'}`}>
        {loading ? (
          <div className="flex items-center justify-center py-20 text-forensic-textDim">
            <span>Querying verified entity registry...</span>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16 text-forensic-textDim">
            No verified VASP addresses match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-forensic-border bg-forensic-surface text-[10px] uppercase font-mono tracking-wider text-forensic-textDim">
                  <th className="py-2 px-3">Entity Name</th>
                  <th className="py-2 px-3">Blockchain Address</th>
                  <th className="py-2 px-3">Chain</th>
                  <th className="py-2 px-3">Cluster Role</th>
                  <th className="py-2 px-3">Provenance Authority</th>
                  <th className="py-2 px-3">Confidence</th>
                  <th className="py-2 px-3">Status</th>
>>>>>>> Stashed changes
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

<<<<<<< Updated upstream
      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-border bg-surface-raised/30 flex items-center justify-between text-text-muted text-xs">
=======
      {/* Pagination Bar */}
      <div className="p-2.5 bg-forensic-surface border-t border-forensic-border flex items-center justify-between text-[11px] text-forensic-textDim font-mono">
>>>>>>> Stashed changes
        <div>
          Page {page + 1} of {totalPages}
        </div>
<<<<<<< Updated upstream
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
          <span className="px-2.5 py-1 rounded-md bg-surface border border-border text-text font-mono text-xs font-semibold">
            {page + 1}
          </span>
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
=======

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
>>>>>>> Stashed changes
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
