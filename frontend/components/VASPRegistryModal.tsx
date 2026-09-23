'use client';

import React, { useState, useEffect } from 'react';
import { Database, Search, ExternalLink, Copy, Check, X, ChevronLeft, ChevronRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

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
  const pageSize = 20;

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
      className={`bg-surface border border-border rounded-xl w-[calc(100%-20px)] sm:w-full flex flex-col font-sans text-xs overflow-hidden transition-colors ${
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
              Curated public Proof-of-Reserves, Etherscan verified labels, Tronscan tags & FIU-IND registrations
            </p>
          </div>
        </div>

        {onClose && !isFullPageView && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors inline-flex items-center justify-center shrink-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 shrink-0" />
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 sm:p-3.5 bg-surface-raised/30 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search address, label, or entity..."
              className="pl-9 pr-3 py-2 sm:py-1.5 bg-surface border border-border rounded-xl text-text placeholder:text-text-muted text-xs focus:outline-none focus:border-accent w-full transition-colors font-mono min-h-[44px] sm:min-h-0"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Chain Select */}
            <select
              value={selectedChain}
              onChange={(e) => {
                setSelectedChain(e.target.value);
                setPage(0);
              }}
              className="bg-surface border border-border rounded-xl text-text px-3 py-2 sm:py-1.5 focus:outline-none focus:border-accent cursor-pointer flex-1 sm:flex-none min-h-[44px] sm:min-h-0"
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
              className="bg-surface border border-border rounded-xl text-text px-3 py-2 sm:py-1.5 focus:outline-none focus:border-accent cursor-pointer flex-1 sm:flex-none min-h-[44px] sm:min-h-0"
            >
              <option value="ALL">All Entities</option>
              {stats?.supported_vasps?.map((v: string) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-text-muted text-xs font-medium">
          Showing {totalMatches.toLocaleString()} matching records
        </div>
      </div>

      {/* Addresses Table (Desktop) */}
      <div className="overflow-y-auto flex-1 hidden md:block">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Addresses Cards (Mobile View) */}
      <div className="overflow-y-auto flex-1 md:hidden divide-y divide-border/60">
        {loading ? (
          <div className="p-8 text-center text-text-muted">
            <div className="inline-flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-accent shrink-0" />
              <span className="text-xs">Loading registry records...</span>
            </div>
          </div>
        ) : addresses.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-xs">
            No addresses found matching filter criteria.
          </div>
        ) : (
          addresses.map((item, idx) => (
            <div key={idx} className="p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold text-xs">{item.vasp_name}</span>
                  <span className="uppercase text-[10px] px-2 py-0.5 rounded-full bg-surface-raised border border-border text-text-muted font-mono font-medium">
                    {item.chain}
                  </span>
                </div>
                <Badge variant="success" size="sm" dot={true}>
                  VERIFIED
                </Badge>
              </div>

              <div className="bg-surface-raised/40 rounded-xl p-2.5 border border-border/60">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-text-muted">Type: {item.address_type}</span>
                </div>
                <div className="font-mono text-xs text-text font-semibold break-all select-all">
                  {item.address}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => handleCopy(item.address)}
                  className="min-h-[44px] px-3 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-text transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
                >
                  {copiedAddr === item.address ? (
                    <>
                      <Check className="h-4 w-4 text-verified" />
                      <span className="text-verified">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Address</span>
                    </>
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
                  className="min-h-[44px] px-3 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Explorer</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-3 sm:p-3.5 border-t border-border bg-surface-raised/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-text-muted text-xs">
        <div>
          Page {page + 1} of {totalPages}
        </div>
        <div className="inline-flex items-center gap-1.5 w-full sm:w-auto justify-center">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            icon={<ChevronLeft className="h-3.5 w-3.5" />}
          >
            Previous
          </Button>
          <span className="px-3 py-1.5 rounded-lg bg-surface border border-border text-text font-mono text-xs font-semibold">
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
