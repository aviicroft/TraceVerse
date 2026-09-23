'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Filter, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

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
      <div className="p-5 border-b border-border bg-surface-raised/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2.5">
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

        <div className="inline-flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <select
            value={filterTypology}
            onChange={(e) => setFilterTypology(e.target.value)}
            className="bg-surface border border-border text-text text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="ALL">All Fraud Typologies</option>
            <option value="Task">Part-Time Task Scam</option>
            <option value="Investment">Investment & Forex App</option>
            <option value="Impersonation">Digital Arrest Scam</option>
            <option value="Courier">FedEx Parcel Extortion</option>
          </select>
        </div>
      </div>

      {/* Incident Queue Table */}
      <div className="overflow-x-auto">
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
    </div>
  );
};
