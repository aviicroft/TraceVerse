'use client';

import React from 'react';
<<<<<<< Updated upstream
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
=======
import { Scale, AlertTriangle, FileCheck, Layers } from 'lucide-react';
import { Badge } from './ui/Badge';

export const ProvenanceSection: React.FC = () => {
  return (
    <div className="border border-border rounded-xl bg-surface shadow-panel overflow-hidden transition-colors">
      <div className="p-5 border-b border-border bg-surface-raised/40 flex items-center justify-between">
        <div className="inline-flex items-center gap-2.5">
          <Scale className="h-4 w-4 text-accent shrink-0" />
          <h3 className="font-semibold text-text text-sm tracking-wide">
            Data Provenance, Mathematical Formulation & Analytical Boundaries
          </h3>
        </div>
        <Badge variant="neutral">
          Audit Specification v2.4
        </Badge>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1: Deterministic Pipeline */}
        <div className="p-5 bg-surface-raised/40 rounded-xl border border-border space-y-3">
          <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
            <Layers className="h-4 w-4 shrink-0" />
            <span>1. Deterministic Pipeline</span>
          </div>
          <p className="text-text-secondary text-xs leading-relaxed">
            All transaction links, block heights, and multi-hop counterparty edges are ingested directly from real Ethereum
            and TronGrid explorer APIs. No placeholder graphs, synthetic predictions, or simulated topologies are utilized.
>>>>>>> Stashed changes
          </p>
        </div>

        {/* Pillar 2: Heuristic Model */}
<<<<<<< Updated upstream
        <div className="p-3 bg-forensic-surfaceRaised rounded border border-forensic-border space-y-2">
          <div className="flex items-center space-x-1.5 text-forensic-teal font-bold text-xs uppercase">
            <FileCheck className="h-3.5 w-3.5" />
            <span>2. Explainable Heuristic Rubric</span>
          </div>
          <p className="font-sans text-forensic-textMuted text-[11px] leading-relaxed">
            Attribution scores (0–100) are mathematically formulated using graph proximity (35%), observable volume (25%), interaction frequency (20%), behavior consistency (10%), and temporal recency (10%) with configurable decay coefficients.
=======
        <div className="p-5 bg-surface-raised/40 rounded-xl border border-border space-y-3">
          <div className="inline-flex items-center gap-2 text-verified font-semibold text-xs uppercase tracking-wider">
            <FileCheck className="h-4 w-4 shrink-0" />
            <span>2. Explainable Heuristics</span>
          </div>
          <p className="text-text-secondary text-xs leading-relaxed">
            Attribution scores (0–100) are mathematically formulated using graph proximity (35%), observable volume (25%),
            interaction frequency (20%), behavior consistency (10%), and temporal recency (10%) with configurable decay coefficients.
>>>>>>> Stashed changes
          </p>
        </div>

        {/* Pillar 3: Analytical Boundaries & Disclaimer */}
<<<<<<< Updated upstream
        <div className="p-3 bg-forensic-surfaceRaised rounded border border-forensic-border space-y-2">
          <div className="flex items-center space-x-1.5 text-forensic-amber font-bold text-xs uppercase">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>3. Analytical Boundaries</span>
          </div>
          <p className="font-sans text-forensic-textMuted text-[11px] leading-relaxed">
            VASP attribution represents probabilistic graph proximity and observable on-chain fund flows. It constitutes an actionable investigatory lead for issuing Section 91 CrPC requisitions and does not alone establish definitive legal ownership.
=======
        <div className="p-5 bg-surface-raised/40 rounded-xl border border-border space-y-3">
          <div className="inline-flex items-center gap-2 text-warning font-semibold text-xs uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>3. Analytical Boundaries</span>
          </div>
          <p className="text-text-secondary text-xs leading-relaxed">
            VASP attribution represents probabilistic graph proximity and observable on-chain fund flows. It constitutes an
            actionable investigatory lead for issuing Section 91 CrPC requisitions and does not alone establish definitive legal ownership.
>>>>>>> Stashed changes
          </p>
        </div>
      </div>
    </div>
  );
};
