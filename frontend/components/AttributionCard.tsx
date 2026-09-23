'use client';

import React from 'react';
import { ShieldCheck, BarChart2, CheckCircle2 } from 'lucide-react';
import { Attribution } from '../lib/types';
import { Badge } from './ui/Badge';

interface AttributionCardProps {
  attributions: Attribution[];
}

export const AttributionCard: React.FC<AttributionCardProps> = ({ attributions }) => {
  if (!attributions || attributions.length === 0) {
    return (
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
    { label: 'Graph Proximity', weight: '35%', value: breakdown.proximity_score },
    { label: 'Observed Fund Flow', weight: '25%', value: breakdown.flow_score },
    { label: 'Interaction Frequency', weight: '20%', value: breakdown.frequency_score },
    { label: 'Behavioral Consistency', weight: '10%', value: breakdown.behavioral_score },
    { label: 'Temporal Recency', weight: '10%', value: breakdown.recency_score },
  ];

  const [showMobileBreakdown, setShowMobileBreakdown] = React.useState(false);

  return (
    <div className="bg-surface border border-border rounded-xl shadow-panel p-4 sm:p-5 space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-verified shrink-0" />
          <h3 className="font-semibold text-text text-sm tracking-wide">
            Primary Attribution Assessment
          </h3>
        </div>
        <Badge variant="success" dot={true}>
          {primary.evidence_strength} CONFIDENCE
        </Badge>
      </div>

      {/* Primary Finding Hero Panel */}
      <div className="bg-surface-raised/50 border border-border rounded-xl p-3.5 sm:p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs text-text-muted font-medium block mb-1">
              Identified Virtual Asset Service Provider
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <strong className="text-base sm:text-lg font-bold text-text">
                {primary.vasp_name}
              </strong>
              <span className="text-xs px-2 py-0.5 rounded-full bg-verified-subtle text-verified border border-verified-border font-medium inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span>Verified VASP</span>
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-text-muted font-medium block mb-1">
              Confidence Score
            </span>
            <div className="inline-flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-verified">
                {primary.score.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-surface rounded-lg border border-border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-text-muted font-medium">Analytical Assessment:</span>
          <span className="text-text font-semibold">
            {getAssessmentLabel(primary.score)}
          </span>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <div className="md:hidden">
        <button
          onClick={() => setShowMobileBreakdown(!showMobileBreakdown)}
          className="w-full min-h-[44px] px-3.5 rounded-xl bg-surface-raised hover:bg-surface-hover text-text font-semibold text-xs border border-border inline-flex items-center justify-between transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-accent" />
            <span>5-Factor Analytical Breakdown</span>
          </span>
          <span className="text-accent font-bold">
            {showMobileBreakdown ? 'Hide ▲' : 'View ▼'}
          </span>
        </button>
      </div>

      {/* 5-Factor Analytical Evidence Breakdown (Always on Desktop, Collapsible on Mobile) */}
      <div className={`space-y-2.5 ${showMobileBreakdown ? 'block' : 'hidden md:block'}`}>
        <div className="hidden md:inline-flex items-center gap-1.5 text-xs text-text-muted font-medium">
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
        </div>
      </div>
    </div>
  );
};
