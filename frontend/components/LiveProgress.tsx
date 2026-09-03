'use client';

import React from 'react';
import { CheckCircle2, Clock, Activity, AlertCircle } from 'lucide-react';
import { AnalysisStatus } from '../lib/types';

interface LiveProgressProps {
  status: AnalysisStatus;
}

const STAGES = [
  { key: 'FETCHING_DATA', label: '1. Blockchain Data Ingestion', desc: 'Querying live EVM / Tron explorer APIs' },
  { key: 'BUILDING_GRAPH', label: '2. Directed Graph Construction', desc: 'Synthesizing multi-hop counterparty network' },
  { key: 'ANALYZING', label: '3. Heuristic VASP Attribution', desc: 'Evaluating decay & fund flow metrics' },
  { key: 'COMPLETED', label: '4. Case Dossier Synthesized', desc: 'Forensic evidence compiled & ready' },
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
    <div className="bg-forensic-surface border border-forensic-border rounded p-3 text-xs shadow-sm space-y-2.5 transition-colors">
      <div className="flex items-center justify-between border-b border-forensic-border pb-2">
        <div className="flex items-center space-x-2">
          <Activity className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-mono uppercase font-bold text-forensic-text text-[11px]">
            Investigation Pipeline Status
          </span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
            isFailed
              ? 'bg-red-500/20 text-forensic-rose border border-red-500/30'
              : status.status === 'COMPLETED'
              ? 'bg-teal-500/20 text-forensic-teal border border-teal-500/30'
              : 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 animate-pulse'
          }`}>
            {status.status}
          </span>
        </div>

        <div className="flex items-center space-x-4 font-mono text-[11px] text-forensic-textDim">
          <span>Observed Tx: <strong className="text-forensic-text">{status.num_transactions || 0}</strong></span>
          <span>•</span>
          <span>Network Nodes: <strong className="text-forensic-text">{status.num_nodes || 1}</strong></span>
          <span>•</span>
          <span>Edges: <strong className="text-forensic-text">{status.num_edges || 0}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 font-mono">
        {STAGES.map((stage, idx) => {
          const isDone = currentIndex > idx || status.status === 'COMPLETED';
          const isCurrent = currentIndex === idx && status.status !== 'COMPLETED' && !isFailed;

          return (
            <div
              key={stage.key}
              className={`p-2 rounded border text-left transition-all ${
                isDone
                  ? 'bg-forensic-surfaceRaised border-forensic-border text-forensic-text'
                  : isCurrent
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-200'
                  : 'bg-forensic-bg/60 border-forensic-borderMuted text-forensic-textDim'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1">
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-forensic-teal flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping mr-1" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-forensic-border flex-shrink-0" />
                )}
                <span className="font-semibold text-[11px] truncate">{stage.label}</span>
              </div>
              <p className="text-[10px] text-forensic-textDim leading-tight truncate">{stage.desc}</p>
            </div>
          );
        })}
      </div>

      {isFailed && (
        <div className="p-2 bg-red-500/10 border border-red-500/30 text-forensic-rose rounded text-[11px] flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Error in analysis pipeline: {status.error_message || 'Verification failed.'}</span>
        </div>
      )}
    </div>
  );
};
