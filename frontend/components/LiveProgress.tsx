'use client';

import React from 'react';
import { CheckCircle2, Activity, AlertCircle } from 'lucide-react';
import { AnalysisStatus } from '../lib/types';

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
    <div className="bg-surface border border-border rounded-xl p-4 text-xs shadow-vercel space-y-3 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="inline-flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent shrink-0" />
          <span className="font-mono uppercase font-semibold text-text text-xs tracking-wider">
            Investigation Pipeline
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border shrink-0 ${
              isFailed
                ? 'bg-danger-subtle text-danger border-danger-border'
                : status.status === 'COMPLETED'
                ? 'bg-verified-subtle text-verified border-verified-border'
                : 'bg-accent-subtle text-accent border-accent-border animate-pulse'
            }`}
          >
            {status.status}
          </span>
        </div>

        <div className="inline-flex items-center gap-2 font-mono text-[11px] text-text-muted shrink-0">
          <span>
            Tx: <strong className="text-text">{status.num_transactions || 0}</strong>
          </span>
          <span>•</span>
          <span>
            Nodes: <strong className="text-text">{status.num_nodes || 1}</strong>
          </span>
          <span>•</span>
          <span>
            Edges: <strong className="text-text">{status.num_edges || 0}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 font-mono">
        {STAGES.map((stage, idx) => {
          const isDone = currentIndex > idx || status.status === 'COMPLETED';
          const isCurrent = currentIndex === idx && status.status !== 'COMPLETED' && !isFailed;

          return (
            <div
              key={stage.key}
              className={`p-3 rounded-lg border transition-all ${
                isDone
                  ? 'bg-surface-raised/80 border-border text-text shadow-sm'
                  : isCurrent
                  ? 'bg-accent/10 border-accent text-accent shadow-sm'
                  : 'bg-bg/40 border-border/50 text-text-dim'
              }`}
            >
              <div className="inline-flex items-center gap-2 mb-1 w-full">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-verified shrink-0" />
                ) : isCurrent ? (
                  <div className="h-2 w-2 rounded-full bg-accent animate-ping mr-1 shrink-0" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-border shrink-0" />
                )}
                <span className="font-semibold text-xs truncate leading-none">{stage.label}</span>
              </div>
              <p className="text-[11px] text-text-dim leading-snug truncate font-sans">{stage.desc}</p>
            </div>
          );
        })}
      </div>

      {isFailed && (
        <div className="p-3 bg-danger-subtle border border-danger-border text-danger rounded-lg text-xs inline-flex items-center gap-2 font-mono w-full">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Investigation aborted: {status.error_message || 'Blockchain RPC / Node API timeout.'}</span>
        </div>
      )}
    </div>
  );
};
