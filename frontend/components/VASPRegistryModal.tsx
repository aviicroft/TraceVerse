'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  ExternalLink,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { api } from '../lib/api';

interface VASPRegistryModalProps {
  onClose?: () => void;
  isFullPageView?: boolean;
}

export const VASPRegistryModal: React.FC<VASPRegistryModalProps> = ({ onClose, isFullPageView = false }) => {
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
              Curated public Proof-of-Reserves, Etherscan verified labels, Tronscan tags & FIU-IND registrations
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-forensic-textDim hover:text-forensic-text hover:bg-forensic-surfaceRaised"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* High-Level Stat Counters */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-forensic-bg border-b border-forensic-border text-xs">
          <div className="p-2.5 bg-forensic-surface rounded border border-forensic-border">
            <span className="text-[10px] uppercase text-forensic-textDim block">Registered Entities</span>
            <strong className="text-base text-blue-500">{stats.total_vasps} VASPs</strong>
          </div>
          <div className="p-2.5 bg-forensic-surface rounded border border-forensic-border">
            <span className="text-[10px] uppercase text-forensic-textDim block">Known Addresses</span>
            <strong className="text-base text-forensic-teal">
              {stats.total_addresses.toLocaleString()}
            </strong>
          </div>
          <div className="p-2.5 bg-forensic-surface rounded border border-forensic-border">
            <span className="text-[10px] uppercase text-forensic-textDim block">ETH Addresses</span>
            <strong className="text-base text-forensic-text">
              {stats.by_chain?.ETHEREUM || 0}
            </strong>
          </div>
          <div className="p-2.5 bg-forensic-surface rounded border border-forensic-border">
            <span className="text-[10px] uppercase text-forensic-textDim block">TRON Addresses</span>
            <strong className="text-base text-forensic-rose">
              {stats.by_chain?.TRON || 0}
            </strong>
          </div>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="p-3 bg-forensic-surfaceRaised border-b border-forensic-border flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-forensic-textDim" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search by address (0x... or T...), VASP, or notes..."
            className="w-full pl-8 pr-3 py-1.5 bg-forensic-bg border border-forensic-border rounded text-forensic-text placeholder-forensic-textDim font-mono text-[11px] focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedChain}
            onChange={(e) => {
              setSelectedChain(e.target.value);
              setPage(0);
            }}
            className="bg-forensic-bg border border-forensic-border text-forensic-text rounded px-2 py-1.5 text-[11px] font-mono"
          >
            <option value="ALL">All Chains</option>
            <option value="ethereum">Ethereum</option>
            <option value="tron">Tron (TRC-20)</option>
          </select>

          <select
            value={selectedVasp}
            onChange={(e) => {
              setSelectedVasp(e.target.value);
              setPage(0);
            }}
            className="bg-forensic-bg border border-forensic-border text-forensic-text rounded px-2 py-1.5 text-[11px] font-mono"
          >
            <option value="ALL">All VASPs</option>
            {stats?.by_vasp &&
              Object.keys(stats.by_vasp).map((vname) => (
                <option key={vname} value={vname}>
                  {vname} ({stats.by_vasp[vname]})
                </option>
              ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(0);
            }}
            className="bg-forensic-bg border border-forensic-border text-forensic-text rounded px-2 py-1.5 text-[11px] font-mono"
          >
            <option value="ALL">All Types</option>
            <option value="hot_wallet">Hot Wallet</option>
            <option value="cold_storage">Cold Storage</option>
            <option value="deposit">Deposit Collector</option>
            <option value="withdrawal">Withdrawal Hub</option>
            <option value="treasury">Treasury</option>
          </select>
        </div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-forensic-borderMuted font-mono text-[11px]">
                {addresses.map((item, idx) => (
                  <tr key={idx} className="hover:bg-forensic-surfaceRaised/50 transition-colors">
                    <td className="py-2 px-3">
                      <strong className="text-forensic-text">{item.vasp_name}</strong>
                    </td>

                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-forensic-textMuted truncate max-w-[220px]">
                          {item.address}
                        </span>
                        <button
                          onClick={() => handleCopy(item.address)}
                          title="Copy address"
                          className="p-0.5 hover:text-forensic-text text-forensic-textDim"
                        >
                          {copiedAddr === item.address ? (
                            <Check className="h-3 w-3 text-forensic-teal" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                        <a
                          href={
                            item.chain === 'ethereum'
                              ? `https://etherscan.io/address/${item.address}`
                              : `https://tronscan.org/#/address/${item.address}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="p-0.5 text-blue-500 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        item.chain === 'ethereum' ? 'bg-sky-500/15 text-blue-600 dark:text-sky-300 border border-sky-500/30' : 'bg-rose-500/15 text-red-600 dark:text-rose-300 border border-rose-500/30'
                      }`}>
                        {item.chain?.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-forensic-textDim text-[10px]">
                      {item.address_type?.replace('_', ' ')}
                    </td>

                    <td className="py-2 px-3">
                      {item.source_url ? (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:underline inline-flex items-center space-x-1 text-[10px]"
                        >
                          <span>{item.source_name || item.source}</span>
                          <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                        </a>
                      ) : (
                        <span className="text-forensic-textDim text-[10px]">{item.source_name || item.source}</span>
                      )}
                    </td>

                    <td className="py-2 px-3 text-forensic-teal font-bold text-[10px]">
                      {item.confidence_score ? `${item.confidence_score}%` : '95%'}
                    </td>

                    <td className="py-2 px-3">
                      <span className="text-forensic-teal text-[10px] font-bold">
                        VERIFIED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      <div className="p-2.5 bg-forensic-surface border-t border-forensic-border flex items-center justify-between text-[11px] text-forensic-textDim font-mono">
        <div>
          Showing {addresses.length} of {totalMatches.toLocaleString()} records
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
    </div>
  );

  if (isFullPageView) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      {content}
    </div>
  );
};
