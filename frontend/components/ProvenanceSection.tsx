'use client';

import React from 'react';
import { Scale, AlertTriangle, FileCheck, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ProvenanceSection: React.FC = () => {
  return (
    <div className="border border-forensic-border rounded bg-forensic-surface text-xs font-mono transition-colors shadow-sm">
      <div className="p-4 border-b border-forensic-border bg-forensic-bg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scale className="h-4 w-4 text-forensic-textDim" />
          <h3 className="font-bold text-forensic-text uppercase tracking-wider text-xs">
            Data Provenance, Mathematical Formulation & Analytical Boundaries
          </h3>
        </div>
        <span className="text-[10px] text-forensic-textDim uppercase">Audit Specification v2.4</span>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1: Deterministic Pipeline */}
        <div className="p-3 bg-forensic-surfaceRaised rounded border border-forensic-border space-y-2">
          <div className="flex items-center space-x-1.5 text-blue-500 font-bold text-xs uppercase">
            <Layers className="h-3.5 w-3.5" />
            <span>1. Deterministic Data Pipeline</span>
          </div>
          <p className="font-sans text-forensic-textMuted text-[11px] leading-relaxed">
            All transaction links, block heights, and multi-hop counterparty edges are ingested directly from real Ethereum and TronGrid blockchain explorer APIs. No placeholder graphs, synthetic predictions, or simulated topologies are utilized.
          </p>
        </div>

        {/* Pillar 2: Heuristic Model */}
        <div className="p-3 bg-forensic-surfaceRaised rounded border border-forensic-border space-y-2">
          <div className="flex items-center space-x-1.5 text-forensic-teal font-bold text-xs uppercase">
            <FileCheck className="h-3.5 w-3.5" />
            <span>2. Explainable Heuristic Rubric</span>
          </div>
          <p className="font-sans text-forensic-textMuted text-[11px] leading-relaxed">
            Attribution scores (0–100) are mathematically formulated using graph proximity (35%), observable volume (25%), interaction frequency (20%), behavior consistency (10%), and temporal recency (10%) with configurable decay coefficients.
          </p>
        </div>

        {/* Pillar 3: Analytical Boundaries & Disclaimer */}
        <div className="p-3 bg-forensic-surfaceRaised rounded border border-forensic-border space-y-2">
          <div className="flex items-center space-x-1.5 text-forensic-amber font-bold text-xs uppercase">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>3. Analytical Boundaries</span>
          </div>
          <p className="font-sans text-forensic-textMuted text-[11px] leading-relaxed">
            VASP attribution represents probabilistic graph proximity and observable on-chain fund flows. It constitutes an actionable investigatory lead for issuing Section 91 CrPC requisitions and does not alone establish definitive legal ownership.
          </p>
        </div>
      </div>
    </div>
  );
};
