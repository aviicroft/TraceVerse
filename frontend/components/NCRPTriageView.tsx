'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Filter, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

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
    <div className="bg-surface border border-border rounded-xl shadow-vercel text-xs font-mono transition-colors overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-surface-raised/40 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-warning shrink-0" />
            <h2 className="font-semibold text-text uppercase text-xs tracking-wider">
              NCRP Cyber Financial Crime Incident Triage Queue
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-raised text-text-muted border border-border font-medium">
              {filtered.length} Active Incidents
            </span>
          </div>
          <p className="text-[11px] text-text-dim font-sans mt-1">
            National Cybercrime Reporting Portal automated asset recovery prioritization & fast-freeze dispatch
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-text-dim shrink-0" />
          <select
            value={filterTypology}
            onChange={(e) => setFilterTypology(e.target.value)}
            className="bg-bg border border-border text-text text-[11px] rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-accent cursor-pointer"
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
            <tr className="border-b border-border bg-surface-raised/20 text-[10px] uppercase font-mono tracking-wider text-text-dim font-semibold">
              <th className="py-3 px-4">Complaint Ref</th>
              <th className="py-3 px-4">Law Enforcement Unit</th>
              <th className="py-3 px-4">Scam Typology</th>
              <th className="py-3 px-4 text-right">Victim Loss (INR)</th>
              <th className="py-3 px-4">Suspect Target Wallet</th>
              <th className="py-3 px-4">Detected VASP</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-mono text-[11px]">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-text-dim font-sans">
                  <div className="inline-flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-accent shrink-0" />
                    <span>Loading incident dispatch queue...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-text-dim font-sans">
                  No complaints matching selected filter.
                </td>
              </tr>
            ) : (
              filtered.map((c, idx) => (
                <tr key={idx} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-text">
                    {c.complaint_id}
                  </td>

                  <td className="py-3 px-4 text-text-muted text-[10px]">
                    {c.district}
                  </td>

                  <td className="py-3 px-4 text-text font-sans text-xs">
                    {c.scam_typology}
                  </td>

                  <td className="py-3 px-4 text-right font-bold text-text">
                    ₹ {c.victim_loss_inr.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-4 text-text-muted truncate max-w-[140px] select-all">
                    {c.suspect_wallet}
                  </td>

                  <td className="py-3 px-4 text-accent font-semibold">
                    {c.suggested_vasp}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        c.urgency_level === 'CRITICAL'
                          ? 'bg-danger-subtle text-danger border-danger-border'
                          : 'bg-warning-subtle text-warning border-warning-border'
                      }`}
                    >
                      {c.urgency_level}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectCase(c.suspect_wallet, 3)}
                      className="px-3 py-1 bg-text text-bg hover:opacity-90 font-medium rounded-md text-[11px] transition-opacity font-sans"
                    >
                      Trace Target →
                    </button>
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
