'use client';

import React from 'react';
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
          </p>
        </div>

        {/* Pillar 2: Heuristic Model */}
        <div className="p-5 bg-surface-raised/40 rounded-xl border border-border space-y-3">
          <div className="inline-flex items-center gap-2 text-verified font-semibold text-xs uppercase tracking-wider">
            <FileCheck className="h-4 w-4 shrink-0" />
            <span>2. Explainable Heuristics</span>
          </div>
          <p className="text-text-secondary text-xs leading-relaxed">
            Attribution scores (0–100) are mathematically formulated using graph proximity (35%), observable volume (25%),
            interaction frequency (20%), behavior consistency (10%), and temporal recency (10%) with configurable decay coefficients.
          </p>
        </div>

        {/* Pillar 3: Analytical Boundaries & Disclaimer */}
        <div className="p-5 bg-surface-raised/40 rounded-xl border border-border space-y-3">
          <div className="inline-flex items-center gap-2 text-warning font-semibold text-xs uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>3. Analytical Boundaries</span>
          </div>
          <p className="text-text-secondary text-xs leading-relaxed">
            VASP attribution represents probabilistic graph proximity and observable on-chain fund flows. It constitutes an
            actionable investigatory lead for issuing Section 91 CrPC requisitions and does not alone establish definitive legal ownership.
          </p>
        </div>
      </div>
    </div>
  );
};
