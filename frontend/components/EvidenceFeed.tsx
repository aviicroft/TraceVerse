'use client';

import React, { useState } from 'react';
import { FileCheck2, Copy, Check } from 'lucide-react';
import { EvidenceItem } from '../lib/types';

interface EvidenceFeedProps {
  evidence: EvidenceItem[];
}

export const EvidenceFeed: React.FC<EvidenceFeedProps> = ({ evidence }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!evidence || evidence.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-4 text-xs shadow-vercel transition-colors">
        <div className="inline-flex items-center gap-2 border-b border-border pb-3 mb-2 w-full">
          <FileCheck2 className="h-4 w-4 text-text-dim shrink-0" />
          <h3 className="font-mono uppercase font-semibold text-text text-xs tracking-wider">
            Evidence & Analytical Findings
          </h3>
        </div>
        <p className="text-text-dim text-[11px] font-mono">No evidence records generated for this run.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-vercel text-xs space-y-3.5 p-4 sm:p-5 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="inline-flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-accent shrink-0" />
          <h3 className="font-mono uppercase font-semibold text-text text-xs tracking-wider">
            Evidence Findings Register
          </h3>
        </div>
        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-surface-raised text-text-muted border border-border font-medium shrink-0">
          {evidence.length} Records
        </span>
      </div>

      {/* Evidence Register List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {evidence.map((item, idx) => {
          const evidenceId = `E-${String(idx + 1).padStart(3, '0')}`;

          return (
            <div
              key={idx}
              className="p-3.5 bg-bg border border-border rounded-lg space-y-2 font-mono text-[11px] hover:border-border-hover transition-colors"
            >
              {/* Top Row: Evidence ID & Strength */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <span className="font-semibold text-text bg-surface-raised px-1.5 py-0.5 rounded border border-border">
                    {evidenceId}
                  </span>
                  <span className="text-text-dim uppercase text-[10px] font-medium">
                    {item.evidence_type}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.2 rounded-full text-[9px] font-semibold uppercase border shrink-0 ${
                    item.strength === 'HIGH'
                      ? 'bg-verified-subtle text-verified border-verified-border'
                      : 'bg-surface-raised text-text-muted border border-border'
                  }`}
                >
                  {item.strength} Strength
                </span>
              </div>

              {/* Narrative Finding */}
              <p className="font-sans text-xs text-text leading-relaxed">
                {item.explanation}
              </p>

              {/* Associated Technical Artifacts */}
              <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-1 text-[10px] text-text-dim">
                {item.hop_distance !== null && item.hop_distance !== undefined && (
                  <span>
                    Hop: <strong className="text-text font-medium">{item.hop_distance}</strong>
                  </span>
                )}

                {item.amount !== null && item.amount !== undefined && (
                  <span>
                    Volume:{' '}
                    <strong className="text-text font-medium">
                      {item.amount.toFixed(4)} {item.asset_symbol || 'ETH'}
                    </strong>
                  </span>
                )}

                {item.tx_hash && (
                  <div className="inline-flex items-center gap-1.5">
                    <span>Tx: {item.tx_hash.slice(0, 10)}...</span>
                    <button
                      onClick={() => handleCopy(item.tx_hash!, evidenceId)}
                      title="Copy Transaction Hash"
                      className="h-5 w-5 rounded hover:text-text text-text-dim transition-colors inline-flex items-center justify-center shrink-0"
                    >
                      {copiedId === evidenceId ? (
                        <Check className="h-3 w-3 text-verified shrink-0" />
                      ) : (
                        <Copy className="h-3 w-3 shrink-0" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
