'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { RiskAssessment } from '../lib/types';
import { Badge } from './ui/Badge';

interface RiskCardProps {
  riskAssessment: RiskAssessment | null | undefined;
}

export const RiskCard: React.FC<RiskCardProps> = ({ riskAssessment }) => {
  if (!riskAssessment) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 shadow-panel transition-colors">
        <div className="inline-flex items-center gap-2 border-b border-border pb-3 mb-2 w-full">
          <ShieldAlert className="h-4 w-4 text-text-muted shrink-0" />
          <h3 className="font-semibold text-text text-sm tracking-wide">
            Structural Risk Classification
          </h3>
        </div>
        <p className="text-text-muted text-xs">Assessment pending pipeline completion.</p>
      </div>
    );
  }

  const { risk_level, score, indicators, explanation } = riskAssessment;

  const getRiskVariant = (level: string) => {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
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
          {explanation}
        </p>
      </div>

      {/* Observed Behavioral Signals Matrix */}
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
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
