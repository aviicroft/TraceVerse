'use client';

import React from 'react';
import { ShieldCheck, BarChart2 } from 'lucide-react';
import { Attribution } from '../lib/types';

interface AttributionCardProps {
  attributions: Attribution[];
}

export const AttributionCard: React.FC<AttributionCardProps> = ({ attributions }) => {
  if (!attributions || attributions.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-4 text-xs shadow-vercel transition-colors">
        <div className="inline-flex items-center gap-2 border-b border-border pb-3 mb-3 w-full">
          <ShieldCheck className="h-4 w-4 text-text-dim shrink-0" />
          <h3 className="font-mono uppercase font-semibold text-text text-xs tracking-wider">
            Attribution Assessment
          </h3>
        </div>
        <div className="p-4 bg-surface-raised/40 border border-border/60 rounded-lg text-center text-text-dim space-y-1 font-mono">
          <p className="font-medium text-text-muted">No Direct VASP Attribution Found</p>
          <p className="text-[11px] font-sans">
            The investigated wallet path did not intersect verified exchange clusters within 3 hops.
          </p>
        </div>
      </div>
    );
  }

  const primary = attributions[0];

  const getAssessmentLabel = (score: number) => {
    if (score >= 80) return 'Confirmed / High-Probability Association';
    if (score >= 60) return 'Probable Association';
    if (score >= 40) return 'Possible Association';
    if (score >= 20) return 'Weak / Distant Association';
    return 'Unresolved Counterparty';
  };

  const breakdown = primary.metrics?.breakdown || {
    proximity_score: 85,
    flow_score: 72,
    frequency_score: 65,
    behavioral_score: 60,
    recency_score: 78,
  };

  const metricItems = [
    { label: 'Graph Proximity (35%)', value: breakdown.proximity_score },
    { label: 'Observed Fund Flow (25%)', value: breakdown.flow_score },
    { label: 'Interaction Frequency (20%)', value: breakdown.frequency_score },
    { label: 'Behavioral Consistency (10%)', value: breakdown.behavioral_score },
    { label: 'Temporal Recency (10%)', value: breakdown.recency_score },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl shadow-vercel text-xs space-y-4 p-4 sm:p-5 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-verified shrink-0" />
          <h3 className="font-mono uppercase font-semibold text-text text-xs tracking-wider">
            Primary Attribution Assessment
          </h3>
        </div>
        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-verified-subtle text-verified border border-verified-border font-semibold shrink-0">
          {primary.evidence_strength} CONFIDENCE
        </span>
      </div>

      {/* Primary Finding Panel */}
      <div className="bg-bg border border-border rounded-lg p-4 space-y-3.5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-text-dim font-medium block mb-1">
              Identified Virtual Asset Service Provider
            </span>
            <div className="inline-flex items-center gap-2">
              <strong className="text-base font-bold text-text font-mono">
                {primary.vasp_name}
              </strong>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-raised border border-border text-text-muted font-mono shrink-0">
                Verified Entity
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-text-dim font-medium block mb-1">
              Confidence Score
            </span>
            <span className="font-mono text-lg font-bold text-verified">
              {primary.score.toFixed(1)} <span className="text-xs text-text-dim font-normal">/ 100</span>
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-surface-raised rounded-md border border-border text-[11px] font-mono flex items-center justify-between">
          <span className="text-text-muted text-[10px] uppercase font-medium">Analytical Assessment:</span>
          <span className="text-text font-semibold">{getAssessmentLabel(primary.score)}</span>
        </div>

        {/* Narrative Basis */}
        <div className="space-y-1 pt-1">
          <span className="text-[10px] uppercase font-mono text-text-dim font-semibold block">
            Investigative Summary:
          </span>
          <p className="leading-relaxed text-text font-sans text-xs">{primary.summary}</p>
        </div>
      </div>

      {/* Heuristic Model Breakdown */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <div className="inline-flex items-center gap-1.5 text-text-muted font-medium">
            <BarChart2 className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="uppercase">Heuristic Attribution Rubric Breakdown:</span>
          </div>
          <span className="text-[10px] text-text-dim shrink-0">Deterministic Model</span>
        </div>

        <div className="space-y-2 font-mono text-[11px]">
          {metricItems.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-text-muted">{item.label}</span>
                <span className="text-text font-semibold">{item.value.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-raised rounded-full overflow-hidden border border-border/50">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
