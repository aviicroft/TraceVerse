'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Filter } from 'lucide-react';
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
    (c) => filterTypology === 'ALL' || c.scam_typology.toLowerCase().includes(filterTypology.toLowerCase())
  );

  return (
    <div className="bg-forensic-surface border border-forensic-border rounded shadow-sm text-xs font-mono transition-colors">
      {/* Header */}
      <div className="p-3.5 border-b border-forensic-border bg-forensic-bg flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-forensic-amber" />
            <h2 className="font-bold text-forensic-text uppercase text-xs tracking-wider">
              NCRP Cyber Financial Crime Incident Triage Queue
            </h2>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-forensic-surfaceRaised text-forensic-textMuted border border-forensic-border">
              {filtered.length} ACTIVE INCIDENTS
            </span>
          </div>
          <p className="text-[10px] text-forensic-textDim font-sans mt-0.5">
            National Cybercrime Reporting Portal automated asset recovery prioritization & fast-freeze dispatch
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-3.5 w-3.5 text-forensic-textDim" />
          <select
            value={filterTypology}
            onChange={(e) => setFilterTypology(e.target.value)}
            className="bg-forensic-bg border border-forensic-border text-forensic-text text-[11px] rounded px-2 py-1 font-mono focus:outline-none"
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
            <tr className="border-b border-forensic-border bg-forensic-surface text-[10px] uppercase font-mono tracking-wider text-forensic-textDim">
              <th className="py-2.5 px-3">Complaint Ref</th>
              <th className="py-2.5 px-3">Law Enforcement Unit</th>
              <th className="py-2.5 px-3">Scam Typology</th>
              <th className="py-2.5 px-3 text-right">Victim Loss (INR)</th>
              <th className="py-2.5 px-3">Suspect Target Wallet</th>
              <th className="py-2.5 px-3">Detected VASP</th>
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forensic-borderMuted font-mono text-[11px]">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-forensic-textDim">
                  Loading incident dispatch queue...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-forensic-textDim">
                  No complaints matching selected filter.
                </td>
              </tr>
            ) : (
              filtered.map((c, idx) => (
                <tr key={idx} className="hover:bg-forensic-surfaceRaised/60 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-blue-500">
                    {c.complaint_id}
                  </td>

                  <td className="py-2.5 px-3 text-forensic-textMuted text-[10px]">
                    {c.district}
                  </td>

                  <td className="py-2.5 px-3 text-forensic-text font-sans text-xs">
                    {c.scam_typology}
                  </td>

                  <td className="py-2.5 px-3 text-right font-bold text-forensic-teal">
                    ₹ {c.victim_loss_inr.toLocaleString('en-IN')}
                  </td>

                  <td className="py-2.5 px-3 text-forensic-textDim truncate max-w-[140px]">
                    {c.suspect_wallet}
                  </td>

                  <td className="py-2.5 px-3 text-forensic-text font-semibold">
                    {c.suggested_vasp}
                  </td>

                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      c.urgency_level === 'CRITICAL' ? 'bg-red-500/15 text-forensic-rose border border-red-500/30' : 'bg-amber-500/15 text-forensic-amber border border-amber-500/30'
                    }`}>
                      {c.urgency_level}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectCase(c.suspect_wallet, 3)}
                      className="px-2.5 py-1 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded text-[10px] transition-colors"
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
