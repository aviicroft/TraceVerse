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
      <div className="bg-forensic-surface border border-forensic-border rounded p-4 text-xs transition-colors">
        <div className="flex items-center space-x-2 border-b border-forensic-border pb-2.5 mb-2">
          <ShieldAlert className="h-4 w-4 text-forensic-textDim" />
          <h3 className="font-mono uppercase font-bold text-forensic-text text-xs tracking-wider">
            Structural Risk Classification
          </h3>
        </div>
        <p className="text-forensic-textDim text-[11px] font-mono">Assessment pending pipeline completion.</p>
      </div>
    );
  }

  const { risk_level, score, indicators, explanation } = riskAssessment;

  const getRiskBadge = (level: string) => {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-500/15 text-forensic-rose border-red-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-forensic-amber border-amber-500/30';
      default:
        return 'bg-teal-500/15 text-forensic-teal border-teal-500/30';
    }
  };

  return (
    <div className="bg-forensic-surface border border-forensic-border rounded shadow-sm text-xs space-y-3 p-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-forensic-border pb-2.5">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-4 w-4 text-forensic-amber" />
          <h3 className="font-mono uppercase font-bold text-forensic-text text-xs tracking-wider">
            Structural Risk Classification
          </h3>
        </div>
        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border uppercase ${getRiskBadge(risk_level)}`}>
          {risk_level} RISK RATING
        </span>
      </div>

      {/* Rationale Box */}
      <div className="p-3 bg-forensic-bg border border-forensic-border rounded space-y-1.5 font-mono text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-forensic-textDim uppercase text-[10px] font-semibold">Composite Risk Index</span>
          <span className="text-forensic-text font-bold">{score.toFixed(1)} / 100</span>
        </div>
        <p className="text-forensic-textMuted font-sans text-xs leading-relaxed pt-1">
          {explanation}
        </p>
      </div>

      {/* Observed Behavioral Signals Matrix */}
      <div className="space-y-1.5 font-mono">
        <span className="text-[10px] uppercase text-forensic-textDim font-semibold block">
          Observed Analytical Signals ({indicators.length}):
        </span>

        <div className="space-y-1 text-[11px]">
          {indicators.map((ind, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded bg-forensic-bg/60 border border-forensic-borderMuted"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="text-forensic-textDim text-[10px]">SIG-0{idx + 1}</span>
                <span className="text-forensic-text truncate">{ind}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-forensic-surfaceRaised text-forensic-textMuted border border-forensic-border flex-shrink-0">
                ACTIVE
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
