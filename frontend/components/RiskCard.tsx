'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { RiskAssessment } from '../lib/types';

interface RiskCardProps {
  riskAssessment: RiskAssessment | null | undefined;
}

export const RiskCard: React.FC<RiskCardProps> = ({ riskAssessment }) => {
  if (!riskAssessment) {
    return (
      <div className="bg-surface border border-border rounded-xl p-4 text-xs shadow-vercel transition-colors">
        <div className="inline-flex items-center gap-2 border-b border-border pb-3 mb-2 w-full">
          <ShieldAlert className="h-4 w-4 text-text-dim shrink-0" />
          <h3 className="font-mono uppercase font-semibold text-text text-xs tracking-wider">
            Structural Risk Classification
          </h3>
        </div>
        <p className="text-text-dim text-[11px] font-mono">Assessment pending pipeline completion.</p>
      </div>
    );
  }

  const { risk_level, score, indicators, explanation } = riskAssessment;

  const getRiskBadge = (level: string) => {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return 'bg-danger-subtle text-danger border-danger-border';
      case 'MEDIUM':
        return 'bg-warning-subtle text-warning border-warning-border';
      default:
        return 'bg-verified-subtle text-verified border-verified-border';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl shadow-vercel text-xs space-y-3.5 p-4 sm:p-5 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="inline-flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-warning shrink-0" />
          <h3 className="font-mono uppercase font-semibold text-text text-xs tracking-wider">
            Structural Risk Classification
          </h3>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full font-mono font-semibold text-[10px] border uppercase shrink-0 ${getRiskBadge(
            risk_level
          )}`}
        >
          {risk_level} Risk Rating
        </span>
      </div>

      {/* Rationale Box */}
      <div className="p-3.5 bg-bg border border-border rounded-lg space-y-2 font-mono text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-text-dim uppercase text-[10px] font-medium">Composite Risk Index</span>
          <span className="text-text font-bold text-sm">{score.toFixed(1)} / 100</span>
        </div>
        <p className="text-text-muted font-sans text-xs leading-relaxed pt-1">
          {explanation}
        </p>
      </div>

      {/* Observed Behavioral Signals Matrix */}
      <div className="space-y-2 font-mono">
        <span className="text-[10px] uppercase text-text-dim font-medium block">
          Observed Analytical Signals ({indicators.length}):
        </span>

        <div className="space-y-1.5 text-[11px]">
          {indicators.map((ind, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-md bg-surface-raised/60 border border-border/80"
            >
              <div className="inline-flex items-center gap-2 truncate">
                <span className="text-text-dim text-[10px] font-mono shrink-0">SIG-0{idx + 1}</span>
                <span className="text-text truncate text-xs">{ind}</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-surface border border-border text-text-muted shrink-0 font-medium">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
