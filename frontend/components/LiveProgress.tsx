'use client';

import React from 'react';
import { CheckCircle2, Activity, AlertCircle } from 'lucide-react';
import { AnalysisStatus } from '../lib/types';
import { Badge } from './ui/Badge';

interface LiveProgressProps {
  status: AnalysisStatus;
}

const STAGES = [
  { key: 'FETCHING_DATA', label: '1. Ingestion', desc: 'Querying live blockchain explorer APIs' },
  { key: 'BUILDING_GRAPH', label: '2. Directed Graph', desc: 'Synthesizing multi-hop counterparty network' },
  { key: 'ANALYZING', label: '3. Heuristic Attribution', desc: 'Evaluating decay & fund flow metrics' },
  { key: 'COMPLETED', label: '4. Case Dossier', desc: 'Forensic evidence compiled & ready' },
];

export const LiveProgress: React.FC<LiveProgressProps> = ({ status }) => {
  const getStageIndex = (st: string) => {
    switch (st) {
      case 'QUEUED':
      case 'FETCHING_DATA':
        return 0;
      case 'BUILDING_GRAPH':
        return 1;
      case 'ANALYZING':
        return 2;
      case 'COMPLETED':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(status.status);
  const isFailed = status.status === 'FAILED';

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-panel space-y-4 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="inline-flex items-center gap-2.5">
          <Activity className="h-4 w-4 text-accent shrink-0" />
          <span className="font-semibold text-text text-sm">
            Investigation Pipeline
          </span>
          <Badge
            variant={
              isFailed
                ? 'danger'
                : status.status === 'COMPLETED'
                ? 'success'
                : 'accent'
            }
            dot={true}
            pulse={status.status !== 'COMPLETED' && !isFailed}
          >
            {status.status}
          </Badge>
        </div>

        <div className="inline-flex items-center gap-2 font-mono text-xs text-text-muted shrink-0">
          <span>
            Tx: <strong className="text-text font-semibold">{status.num_transactions || 0}</strong>
          </span>
          <span>•</span>
          <span>
            Nodes: <strong className="text-text font-semibold">{status.num_nodes || 1}</strong>
          </span>
          <span>•</span>
          <span>
            Edges: <strong className="text-text font-semibold">{status.num_edges || 0}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {STAGES.map((stage, idx) => {
          const isDone = currentIndex > idx || status.status === 'COMPLETED';
          const isCurrent = currentIndex === idx && status.status !== 'COMPLETED' && !isFailed;

          return (
            <div
              key={stage.key}
              className={`p-3.5 rounded-xl border transition-all ${
                isDone
                  ? 'bg-surface-raised/70 border-border text-text shadow-sm'
                  : isCurrent
                  ? 'bg-accent/10 border-accent/40 text-accent shadow-sm'
                  : 'bg-surface-raised/30 border-border/50 text-text-muted'
              }`}
            >
              <div className="inline-flex items-center gap-2 mb-1.5 w-full">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-verified shrink-0" />
                ) : isCurrent ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-accent animate-ping mr-1 shrink-0" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-border shrink-0" />
                )}
                <span className="font-semibold text-xs truncate">{stage.label}</span>
              </div>
              <p className="text-xs text-text-muted leading-snug">{stage.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
