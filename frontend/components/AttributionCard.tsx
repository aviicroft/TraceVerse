'use client';

import React from 'react';
import { ShieldCheck, Layers, HelpCircle, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';
import { Attribution } from '../lib/types';

interface AttributionCardProps {
  attributions: Attribution[];
}

export const AttributionCard: React.FC<AttributionCardProps> = ({ attributions }) => {
  if (!attributions || attributions.length === 0) {
    return (
      <div className="bg-forensic-surface border border-forensic-border rounded p-4 text-xs transition-colors">
        <div className="flex items-center space-x-2 border-b border-forensic-border pb-2.5 mb-3">
          <ShieldCheck className="h-4 w-4 text-forensic-textDim" />
          <h3 className="font-mono uppercase font-bold text-forensic-text text-xs tracking-wider">
            Attribution Assessment
          </h3>
        </div>
        <div className="p-4 bg-forensic-bg/60 border border-forensic-borderMuted rounded text-center text-forensic-textDim space-y-1 font-mono">
          <p className="font-semibold text-forensic-textMuted">No Direct VASP Attribution Found</p>
          <p className="text-[11px]">
            The investigated wallet path did not directly intersect known exchange clusters within 3 hops.
          </p>
        </div>
      </div>
    );
  }

  const primary = attributions[0];

  const getAssessmentLabel = (score: number) => {
    if (score >= 80) return 'CONFIRMED / HIGH-PROBABILITY ASSOCIATION';
    if (score >= 60) return 'PROBABLE ASSOCIATION';
    if (score >= 40) return 'POSSIBLE ASSOCIATION';
    if (score >= 20) return 'WEAK / DISTANT ASSOCIATION';
    return 'UNRESOLVED';
  };

  return (
    <div className="bg-forensic-surface border border-forensic-border rounded shadow-sm text-xs space-y-3.5 p-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-forensic-border pb-2.5">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-blue-500" />
          <h3 className="font-mono uppercase font-bold text-forensic-text text-xs tracking-wider">
            Primary Attribution Assessment
          </h3>
        </div>
        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-teal-500/15 text-forensic-teal border border-teal-500/30 font-bold">
          {primary.evidence_strength} CONFIDENCE
        </span>
      </div>

      {/* Primary Finding Panel */}
      <div className="bg-forensic-bg border border-forensic-border rounded p-3.5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-forensic-textDim font-semibold block mb-0.5">
              Identified Virtual Asset Service Provider
            </span>
            <div className="flex items-center space-x-2">
              <strong className="text-base font-bold text-forensic-text font-mono">
                {primary.vasp_name}
              </strong>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-forensic-surfaceRaised border border-forensic-border text-forensic-textMuted font-mono">
                CEX
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-forensic-textDim font-semibold block mb-0.5">
              Attribution Score
            </span>
            <span className="font-mono text-base font-bold text-forensic-teal">
              {primary.score.toFixed(1)} <span className="text-xs text-forensic-textDim font-normal">/ 100</span>
            </span>
          </div>
        </div>

        <div className="p-2 bg-forensic-surfaceRaised rounded border border-forensic-borderMuted text-[11px] font-mono">
          <span className="text-forensic-textDim uppercase text-[9px] block font-semibold">Analytical Assessment:</span>
          <span className="text-forensic-text font-bold">
            {getAssessmentLabel(primary.score)}
          </span>
        </div>

        {/* Narrative Basis */}
        <div className="text-[11px] text-forensic-textMuted space-y-1">
          <span className="text-[10px] uppercase font-mono text-forensic-textDim font-semibold block">
            Investigative Basis:
          </span>
          <p className="leading-relaxed text-forensic-text font-sans text-xs">{primary.summary}</p>
        </div>
      </div>

      {/* Heuristic Model Breakdown */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[10px] uppercase font-mono text-forensic-textDim font-semibold">
          <span>Mathematical Weight Distribution</span>
          <span>Evaluation Rubric</span>
        </div>

        <div className="space-y-1 text-[11px] font-mono">
          <div className="flex items-center justify-between p-1.5 bg-forensic-bg/60 rounded border border-forensic-borderMuted">
            <span className="text-forensic-textMuted">Graph Proximity (35%)</span>
            <span className="text-forensic-text font-bold">
              {primary.score >= 70 ? 'DIRECT / 1-HOP' : primary.score >= 40 ? '2-HOPS' : '3-HOPS'}
            </span>
          </div>

          <div className="flex items-center justify-between p-1.5 bg-forensic-bg/60 rounded border border-forensic-borderMuted">
            <span className="text-forensic-textMuted">Fund Flow Volume (25%)</span>
            <span className="text-forensic-text font-bold">WEIGHTED FLOW</span>
          </div>

          <div className="flex items-center justify-between p-1.5 bg-forensic-bg/60 rounded border border-forensic-borderMuted">
            <span className="text-forensic-textMuted">Interaction Frequency (20%)</span>
            <span className="text-forensic-text font-bold">CLUSTER FREQ</span>
          </div>

          <div className="flex items-center justify-between p-1.5 bg-forensic-bg/60 rounded border border-forensic-borderMuted">
            <span className="text-forensic-textMuted">Behavior & Recency (20%)</span>
            <span className="text-forensic-text font-bold">ACTIVE CLUSTER</span>
          </div>
        </div>
      </div>

      {/* Alternative Candidates */}
      {attributions.length > 1 && (
        <div className="pt-2 border-t border-forensic-borderMuted space-y-1.5">
          <span className="text-[10px] uppercase font-mono text-forensic-textDim font-semibold block">
            Alternative Counterparty Entities ({attributions.length - 1}):
          </span>
          <div className="space-y-1 font-mono">
            {attributions.slice(1, 4).map((alt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded bg-forensic-bg border border-forensic-borderMuted text-xs"
              >
                <div className="flex items-center space-x-1.5">
                  <span className="text-forensic-textDim">#{alt.rank}</span>
                  <span className="text-forensic-text font-medium">{alt.vasp_name}</span>
                </div>
                <span className="text-forensic-textMuted font-bold">{alt.score.toFixed(1)} / 100</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
