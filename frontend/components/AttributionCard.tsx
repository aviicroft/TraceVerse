'use client';

import React from 'react';
<<<<<<< Updated upstream
import { ShieldCheck, BarChart2, CheckCircle2 } from 'lucide-react';
=======
import { ShieldCheck, Layers, HelpCircle, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';
>>>>>>> Stashed changes
import { Attribution } from '../lib/types';

interface AttributionCardProps {
  attributions: Attribution[];
}

export const AttributionCard: React.FC<AttributionCardProps> = ({ attributions }) => {
  if (!attributions || attributions.length === 0) {
    return (
<<<<<<< Updated upstream
      <div className="bg-surface border border-border rounded-xl p-5 shadow-panel transition-colors">
        <div className="inline-flex items-center gap-2 border-b border-border pb-3 mb-3 w-full">
          <ShieldCheck className="h-4 w-4 text-text-muted shrink-0" />
          <h3 className="font-semibold text-text text-sm tracking-wide">
            Attribution Assessment
          </h3>
        </div>
        <div className="p-4 bg-surface-raised/50 border border-border/70 rounded-xl text-center text-text-muted space-y-1">
          <p className="font-medium text-text text-xs">No Direct VASP Attribution Found</p>
          <p className="text-xs text-text-muted">
            The investigated wallet path did not intersect verified exchange clusters within 3 hops.
=======
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
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  const breakdown = primary.metrics?.breakdown || {
    proximity_score: 85,
    flow_score: 72,
    frequency_score: 65,
    behavioral_score: 60,
    recency_score: 78,
  };

  const metricItems = [
    { label: 'Graph Proximity', weight: '35%', value: breakdown.proximity_score },
    { label: 'Observed Fund Flow', weight: '25%', value: breakdown.flow_score },
    { label: 'Interaction Frequency', weight: '20%', value: breakdown.frequency_score },
    { label: 'Behavioral Consistency', weight: '10%', value: breakdown.behavioral_score },
    { label: 'Temporal Recency', weight: '10%', value: breakdown.recency_score },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl shadow-panel p-5 space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-verified shrink-0" />
          <h3 className="font-semibold text-text text-sm tracking-wide">
            Primary Attribution Assessment
          </h3>
        </div>
        <Badge variant="success" dot={true}>
=======
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
>>>>>>> Stashed changes
          {primary.evidence_strength} CONFIDENCE
        </span>
      </div>

<<<<<<< Updated upstream
      {/* Primary Finding Hero Panel */}
      <div className="bg-surface-raised/50 border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs text-text-muted font-medium block mb-1">
              Identified Virtual Asset Service Provider
            </span>
            <div className="inline-flex items-center gap-2">
              <strong className="text-lg font-bold text-text">
                {primary.vasp_name}
              </strong>
              <span className="text-xs px-2 py-0.5 rounded-full bg-verified-subtle text-verified border border-verified-border font-medium inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span>Verified VASP</span>
=======
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
>>>>>>> Stashed changes
              </span>
            </div>
          </div>

          <div className="text-right">
<<<<<<< Updated upstream
            <span className="text-xs text-text-muted font-medium block mb-1">
              Confidence Score
            </span>
            <div className="inline-flex items-baseline gap-1">
              <span className="text-2xl font-bold text-verified">
                {primary.score.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-surface rounded-lg border border-border text-xs flex items-center justify-between">
          <span className="text-text-muted font-medium">Analytical Assessment:</span>
          <span className="text-text font-semibold">
            {getAssessmentLabel(primary.score)}
          </span>
        </div>
      </div>

      {/* 5-Factor Analytical Evidence Breakdown */}
      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-1.5 text-xs text-text-muted font-medium">
          <BarChart2 className="h-3.5 w-3.5 text-accent shrink-0" />
          <span>5-Factor Heuristic Weight Breakdown</span>
        </div>

        <div className="space-y-2 text-xs">
          {metricItems.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary font-medium">
                  {item.label} <span className="text-text-muted font-normal text-caption">({item.weight})</span>
                </span>
                <span className="text-text font-mono font-semibold">
                  {item.value.toFixed(1)} / 100
                </span>
              </div>
              <div className="w-full bg-surface-raised h-1.5 rounded-full overflow-hidden border border-border/50">
                <div
                  className="bg-accent h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                />
              </div>
            </div>
          ))}
=======
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
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
};
