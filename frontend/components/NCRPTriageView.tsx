'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Filter, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { CustomSelect } from './ui/Select';

interface NCRPTriageViewProps {
  onSelectCase: (walletAddress: string, maxHops: number) => void;
}

export const NCRPTriageView: React.FC<NCRPTriageViewProps> = ({ onSelectCase }) => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterTypology, setFilterTypology] = useState<string>('ALL');

  useEffect(() => {
    async function loadCases() {
      try {
        setLoading(true);
        const data = await api.getNCRPCases();
        setCases(data || []);
      } catch (err) {
        console.error('Failed loading NCRP complaints:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  const filtered = cases.filter(
    (c) =>
      filterTypology === 'ALL' ||
      c.scam_typology.toLowerCase().includes(filterTypology.toLowerCase())
  );

  return (
    <div className="bg-surface border border-border rounded-xl shadow-panel text-xs font-sans transition-colors overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-surface-raised/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-2.5 flex-wrap">
            <ShieldAlert className="h-4 w-4 text-warning shrink-0" />
            <h2 className="font-bold text-text text-sm tracking-wide">
              NCRP Incident Triage Queue
            </h2>
            <Badge variant="warning" dot={true}>
              {filtered.length} Active Incidents
            </Badge>
          </div>
          <p className="text-xs text-text-muted mt-1">
            National Cybercrime Reporting Portal automated recovery triage & priority fast-freeze dispatch
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <CustomSelect
            value={filterTypology}
            onChange={(val) => setFilterTypology(String(val))}
            options={[
              { value: 'ALL', label: 'All Fraud Typologies' },
              { value: 'Task', label: 'Part-Time Task Scam' },
              { value: 'Investment', label: 'Investment & Forex App' },
              { value: 'Impersonation', label: 'Digital Arrest Scam' },
              { value: 'Courier', label: 'FedEx Parcel Extortion' },
            ]}
            prefix={<Filter className="h-3.5 w-3.5 text-[#94A3B8]" />}
            align="right"
            className="w-full sm:min-w-[220px]"
            size="md"
          />
        </div>
      </div>

      {/* Incident Queue Table (Desktop) */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-raised/30 text-xs text-text-muted font-medium">
              <th className="py-3 px-4">Complaint Ref</th>
              <th className="py-3 px-4">Police Jurisdiction</th>
              <th className="py-3 px-4">Scam Typology</th>
              <th className="py-3 px-4 text-right">Victim Loss (INR)</th>
              <th className="py-3 px-4">Suspect Target Wallet</th>
              <th className="py-3 px-4">Detected VASP</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-14 text-center text-text-muted">
                  <div className="inline-flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-accent shrink-0" />
                    <span>Loading incident dispatch queue...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-14 text-center text-text-muted">
                  No complaints matching selected filter.
                </td>
              </tr>
            ) : (
              filtered.map((c, idx) => (
                <tr key={idx} className="hover:bg-surface-raised/40 transition-colors h-14">
                  <td className="py-3 px-4 font-mono font-bold text-text text-technical">
                    {c.complaint_id}
                  </td>

                  <td className="py-3 px-4 text-text-secondary text-xs">
                    {c.district}
                  </td>

                  <td className="py-3 px-4 text-text font-medium text-xs">
                    {c.scam_typology}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-text">
                    ₹{c.victim_loss_inr.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-4 font-mono text-technical text-text-secondary truncate max-w-[140px] select-all">
                    {c.suspect_wallet.slice(0, 8)}...{c.suspect_wallet.slice(-6)}
                  </td>

                  <td className="py-3 px-4 text-accent font-semibold text-xs">
                    {c.suggested_vasp}
                  </td>

                  <td className="py-3 px-4">
                    <Badge
                      variant={c.urgency_level === 'CRITICAL' ? 'danger' : 'warning'}
                      size="sm"
                    >
                      {c.urgency_level}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectCase(c.suspect_wallet, 3)}
                      icon={<ArrowRight className="h-3.5 w-3.5" />}
                      iconPosition="right"
                    >
                      Trace
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Incident Cards (Mobile View) */}
      <div className="md:hidden divide-y divide-border/60">
        {loading ? (
          <div className="p-8 text-center text-text-muted">
            <div className="inline-flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-accent shrink-0" />
              <span className="text-xs">Loading incident dispatch queue...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-xs">
            No complaints matching selected filter.
          </div>
        ) : (
          filtered.map((c, idx) => (
            <div key={idx} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-text text-xs tracking-wider block">
                    {c.complaint_id}
                  </span>
                  <span className="text-[11px] text-text-muted block">
                    {c.district}
                  </span>
                </div>
                <Badge
                  variant={c.urgency_level === 'CRITICAL' ? 'danger' : 'warning'}
                  size="sm"
                >
                  {c.urgency_level}
                </Badge>
              </div>

              <div className="bg-surface-raised/40 rounded-xl p-3 border border-border/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Typology:</span>
                  <span className="font-medium text-text">{c.scam_typology}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Victim Loss:</span>
                  <span className="font-mono font-bold text-accent">₹{c.victim_loss_inr.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Detected VASP:</span>
                  <span className="font-semibold text-accent">{c.suggested_vasp}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                  <span className="text-text-muted">Suspect:</span>
                  <span className="font-mono text-text truncate max-w-[170px] select-all">
                    {c.suspect_wallet.slice(0, 8)}...{c.suspect_wallet.slice(-6)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectCase(c.suspect_wallet, 3)}
                className="w-full min-h-[44px] rounded-xl bg-accent text-white font-semibold text-xs inline-flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors shadow-sm"
              >
                <span>Triage & Trace Incident</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
