'use client';

import React, { useState } from 'react';
import { FileCheck2, Copy, Check, ChevronRight } from 'lucide-react';
import { EvidenceItem } from '../lib/types';
import { Badge } from './ui/Badge';

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
<<<<<<< Updated upstream
      <div className="bg-forensic-surface border border-forensic-border rounded p-4 text-xs transition-colors">
        <div className="flex items-center space-x-2 border-b border-forensic-border pb-2.5 mb-2">
          <FileCheck2 className="h-4 w-4 text-forensic-textDim" />
          <h3 className="font-mono uppercase font-bold text-forensic-text text-xs tracking-wider">
            Evidence & Analytical Findings
          </h3>
        </div>
        <p className="text-forensic-textDim text-[11px] font-mono">No evidence items generated for this run.</p>
=======
      <div className="bg-surface border border-border rounded-xl p-5 shadow-panel transition-colors">
        <div className="inline-flex items-center gap-2 border-b border-border pb-3 mb-2 w-full">
          <FileCheck2 className="h-4 w-4 text-text-muted shrink-0" />
          <h3 className="font-semibold text-text text-sm tracking-wide">
            Evidence & Analytical Findings
          </h3>
        </div>
        <p className="text-text-muted text-xs">No evidence records generated for this run.</p>
>>>>>>> Stashed changes
      </div>
    );
  }

  return (
<<<<<<< Updated upstream
    <div className="bg-forensic-surface border border-forensic-border rounded shadow-sm text-xs space-y-3 p-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-forensic-border pb-2.5">
        <div className="flex items-center space-x-2">
          <FileCheck2 className="h-4 w-4 text-forensic-teal" />
          <h3 className="font-mono uppercase font-bold text-forensic-text text-xs tracking-wider">
            Evidence & Analytical Findings Register
          </h3>
        </div>
        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-forensic-surfaceRaised text-forensic-textMuted border border-forensic-border">
          {evidence.length} Items Recorded
        </span>
=======
    <div className="bg-surface border border-border rounded-xl shadow-panel p-5 space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="inline-flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-accent shrink-0" />
          <h3 className="font-semibold text-text text-sm tracking-wide">
            Evidence Findings Register
          </h3>
        </div>
        <Badge variant="neutral">
          {evidence.length} Records
        </Badge>
>>>>>>> Stashed changes
      </div>

      {/* Evidence Register List */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-none">
        {evidence.map((item, idx) => {
          const evidenceId = `E-${String(idx + 1).padStart(3, '0')}`;

          return (
            <div
              key={idx}
<<<<<<< Updated upstream
              className="p-3 bg-forensic-bg border border-forensic-border rounded space-y-2 font-mono text-[11px]"
            >
              {/* Top Row: Evidence ID & Strength */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-forensic-text bg-forensic-surfaceRaised px-1.5 py-0.5 rounded border border-forensic-border">
                    {evidenceId}
                  </span>
                  <span className="text-forensic-textDim uppercase text-[10px]">
=======
              className="p-3.5 bg-surface-raised/40 hover:bg-surface-raised/70 border border-border rounded-xl space-y-2.5 transition-colors group"
            >
              {/* Top Row: Evidence ID & Strength */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <span className="font-semibold text-text font-mono text-xs bg-surface px-2 py-0.5 rounded-md border border-border">
                    {evidenceId}
                  </span>
                  <span className="text-xs text-text-muted font-medium">
>>>>>>> Stashed changes
                    {item.evidence_type}
                  </span>
                </div>

<<<<<<< Updated upstream
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                  item.strength === 'HIGH' ? 'bg-teal-500/15 text-forensic-teal border border-teal-500/30' : 'bg-forensic-surfaceRaised text-forensic-textMuted border border-forensic-border'
                }`}>
                  {item.strength} STRENGTH
                </span>
              </div>

              {/* Narrative Finding */}
              <p className="font-sans text-xs text-forensic-text leading-relaxed">
=======
                <Badge
                  variant={item.strength === 'HIGH' ? 'success' : item.strength === 'MEDIUM' ? 'warning' : 'neutral'}
                  size="sm"
                >
                  {item.strength} STRENGTH
                </Badge>
              </div>

              {/* Narrative Finding */}
              <p className="text-xs text-text-secondary leading-relaxed">
>>>>>>> Stashed changes
                {item.explanation}
              </p>

              {/* Associated Technical Artifacts */}
<<<<<<< Updated upstream
              <div className="pt-1.5 border-t border-forensic-borderMuted flex flex-wrap items-center justify-between gap-1 text-[10px] text-forensic-textDim">
                {item.hop_distance !== null && item.hop_distance !== undefined && (
                  <span>Hop Position: <strong className="text-forensic-text">{item.hop_distance}</strong></span>
                )}

                {item.amount !== null && item.amount !== undefined && (
                  <span>
                    Volume: <strong className="text-forensic-teal">{item.amount.toFixed(4)} {item.asset_symbol || 'ETH'}</strong>
                  </span>
                )}

                {item.tx_hash && (
                  <div className="flex items-center space-x-1">
                    <span>Tx: {item.tx_hash.slice(0, 10)}...</span>
                    <button
                      onClick={() => handleCopy(item.tx_hash!, evidenceId)}
                      title="Copy Tx Hash"
                      className="p-0.5 hover:text-forensic-text text-forensic-textDim"
                    >
                      {copiedId === evidenceId ? (
                        <Check className="h-3 w-3 text-forensic-teal" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
=======
              <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
                <div className="inline-flex items-center gap-3">
                  {item.hop_distance !== null && item.hop_distance !== undefined && (
                    <span>
                      Hop: <strong className="text-text font-semibold">{item.hop_distance}</strong>
                    </span>
                  )}

                  {item.amount !== null && item.amount !== undefined && (
                    <span>
                      Volume:{' '}
                      <strong className="text-text font-mono font-semibold">
                        {item.amount.toFixed(4)} {item.asset_symbol || 'ETH'}
                      </strong>
                    </span>
                  )}
                </div>

                {item.tx_hash && (
                  <button
                    onClick={() => handleCopy(item.tx_hash!, evidenceId)}
                    className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent font-mono transition-colors"
                    title="Copy Transaction Hash"
                  >
                    <span>{item.tx_hash.slice(0, 8)}...{item.tx_hash.slice(-6)}</span>
                    {copiedId === evidenceId ? (
                      <Check className="h-3 w-3 text-verified" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
>>>>>>> Stashed changes
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
