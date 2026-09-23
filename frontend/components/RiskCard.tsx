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
<<<<<<< Updated upstream
      <div className="bg-surface border border-border rounded-xl p-5 shadow-panel transition-colors">
        <div className="inline-flex items-center gap-2 border-b border-border pb-3 mb-2 w-full">
          <ShieldAlert className="h-4 w-4 text-text-muted shrink-0" />
          <h3 className="font-semibold text-text text-sm tracking-wide">
            Structural Risk Classification
          </h3>
        </div>
        <p className="text-text-muted text-xs">Assessment pending pipeline completion.</p>
=======
      <div className="bg-forensic-surface border border-forensic-border rounded p-4 text-xs transition-colors">
        <div className="flex items-center space-x-2 border-b border-forensic-border pb-2.5 mb-2">
          <ShieldAlert className="h-4 w-4 text-forensic-textDim" />
          <h3 className="font-mono uppercase font-bold text-forensic-text text-xs tracking-wider">
            Structural Risk Classification
          </h3>
        </div>
        <p className="text-forensic-textDim text-[11px] font-mono">Assessment pending pipeline completion.</p>
>>>>>>> Stashed changes
      </div>
    );
  }

  const { risk_level, score, indicators, explanation } = riskAssessment;

  const getRiskBadge = (level: string) => {
    switch (level.toUpperCase()) {
      case 'HIGH':
<<<<<<< Updated upstream
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      default:
        return 'success';
=======
        return 'bg-red-500/15 text-forensic-rose border-red-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-forensic-amber border-amber-500/30';
      default:
        return 'bg-teal-500/15 text-forensic-teal border-teal-500/30';
>>>>>>> Stashed changes
    }
  };

  return (
<<<<<<< Updated upstream
    <div className="bg-surface border border-border rounded-xl shadow-panel p-5 space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="inline-flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-warning shrink-0" />
          <h3 className="font-semibold text-text text-sm tracking-wide">
            Structural Risk Classification
          </h3>
        </div>
        <Badge variant={getRiskVariant(risk_level) as any} dot={true}>
          {risk_level} RISK RATING
        </Badge>
      </div>

      {/* Rationale Hero Box */}
      <div className="p-4 bg-surface-raised/50 border border-border rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted font-medium">Composite Risk Index</span>
          <span className="text-text font-bold text-base font-mono">
            {score.toFixed(1)} <span className="text-xs text-text-muted font-normal">/ 100</span>
          </span>
        </div>
        <p className="text-text-secondary text-xs leading-relaxed">
=======
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
>>>>>>> Stashed changes
          {explanation}
        </p>
      </div>

      {/* Observed Behavioral Signals Matrix */}
<<<<<<< Updated upstream
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted font-medium">
            Observed Analytical Signals ({indicators.length})
          </span>
        </div>

        <div className="space-y-1.5">
          {indicators.map((ind, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border/80 hover:border-border transition-colors gap-2"
            >
              <div className="inline-flex items-center gap-2 truncate">
                <span className="text-xs font-mono text-text-muted bg-surface-raised px-1.5 py-0.5 rounded border border-border shrink-0">
                  SIG-0{idx + 1}
                </span>
                <span className="text-text text-xs truncate font-medium">{ind}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-raised text-text-muted border border-border shrink-0 font-medium">
                Active Signal
=======
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
>>>>>>> Stashed changes
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
