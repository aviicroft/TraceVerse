'use client';

import React, { useMemo, useState } from 'react';
import { GraphData, Attribution } from '../lib/types';
import { Layers, Building2, TrendingUp, ShieldCheck, Wallet } from 'lucide-react';

interface SankeyFlowViewProps {
  graphData?: GraphData | null;
  rootAddress: string;
  attributions?: Attribution[];
  onSelectAddress?: (address: string) => void;
}

interface FlowColumnNode {
  id: string;
  label: string;
  role: string;
  vaspName?: string;
  hop: number;
  inflow: number;
  outflow: number;
  totalVolume: number;
  percentage: number;
}

export const SankeyFlowView: React.FC<SankeyFlowViewProps> = ({
  graphData,
  rootAddress,
  attributions,
  onSelectAddress
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { columns, flows, totalRootVolume } = useMemo(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
      return { columns: [], flows: [], totalRootVolume: 0 };
    }

    const hop0Nodes: FlowColumnNode[] = [];
    const hop1Nodes: FlowColumnNode[] = [];
    const hop2Nodes: FlowColumnNode[] = [];
    const vaspNodes: FlowColumnNode[] = [];

    // Calculate total root outflow
    let rootOutflow = 0;
    (graphData.edges || []).forEach((edgeItem: any) => {
      const e = edgeItem.data || edgeItem;
      const src = (e.source || '').toLowerCase();
      if (src === rootAddress.toLowerCase()) {
        rootOutflow += Number(e.amount_usd) || Number(e.amount) || 1;
      }
    });
    if (rootOutflow === 0) rootOutflow = 100;

    (graphData.nodes || []).forEach((nodeItem: any) => {
      const n = nodeItem.data || nodeItem;
      const nid = n.id || n.address || '';
      const isRoot = nid.toLowerCase() === rootAddress.toLowerCase() || n.role === 'INPUT_WALLET' || n.is_root;
      const isVasp = n.role === 'KNOWN_VASP' || !!n.vasp_name;
      const hop = Number(n.hop ?? n.hop_distance ?? (isRoot ? 0 : 1));

      const inflow = Number(n.inflow_usd || n.total_inflow || n.inflow_native || 0);
      const outflow = Number(n.outflow_usd || n.total_outflow || n.outflow_native || 0);
      const totalVolume = inflow + outflow;

      const nodeObj: FlowColumnNode = {
        id: nid,
        label: n.label || n.vasp_name || (nid ? `${nid.slice(0, 6)}...${nid.slice(-4)}` : 'Node'),
        role: n.role || (isVasp ? 'KNOWN_VASP' : 'INTERMEDIARY'),
        vaspName: n.vasp_name,
        hop,
        inflow,
        outflow,
        totalVolume,
        percentage: 0
      };

      if (isRoot) {
        nodeObj.percentage = 100;
        hop0Nodes.push(nodeObj);
      } else if (isVasp) {
        nodeObj.percentage = Math.min(100, (inflow / rootOutflow) * 100);
        vaspNodes.push(nodeObj);
      } else if (hop === 1) {
        nodeObj.percentage = Math.min(100, (totalVolume / rootOutflow) * 100);
        hop1Nodes.push(nodeObj);
      } else {
        nodeObj.percentage = Math.min(100, (totalVolume / rootOutflow) * 100);
        hop2Nodes.push(nodeObj);
      }
    });

    // Prepare flow lines
    const flowList = (graphData.edges || []).map((edgeItem: any, idx: number) => {
      const e = edgeItem.data || edgeItem;
      const amount = Number(e.amount_usd) || Number(e.amount) || 0;
      return {
        id: `flow-${idx}`,
        source: e.source,
        target: e.target,
        amount,
        symbol: e.asset_symbol || e.token_symbol || 'ETH',
        txHash: e.tx_hash
      };
    });

    const cols = [
      { title: 'ROOT SUSPECT', nodes: hop0Nodes, color: 'border-amber-500/40 text-amber-400' },
      { title: 'HOP 1 DIRECT', nodes: hop1Nodes.slice(0, 6), color: 'border-blue-500/40 text-blue-400' },
      { title: 'HOP 2 LAYERING', nodes: hop2Nodes.slice(0, 6), color: 'border-purple-500/40 text-purple-400' },
      { title: 'DESTINATION VASPS', nodes: vaspNodes, color: 'border-emerald-500/40 text-emerald-400' }
    ].filter(c => c.nodes.length > 0);

    return { columns: cols, flows: flowList, totalRootVolume: rootOutflow };
  }, [graphData, rootAddress]);

  return (
    <div className="flex flex-col h-full bg-forensic-bg p-5 overflow-y-auto space-y-6">
      {/* Top Intelligence Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-forensic-surface border border-forensic-border flex items-center space-x-3">
          <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] text-forensic-textDim uppercase font-mono block">Root Origin</span>
            <span className="text-xs font-bold font-mono text-forensic-text truncate block max-w-[140px]">
              {rootAddress.slice(0, 10)}...
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-forensic-surface border border-forensic-border flex items-center space-x-3">
          <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] text-forensic-textDim uppercase font-mono block">Observed Flow</span>
            <span className="text-xs font-bold font-mono text-blue-400">
              ${totalRootVolume > 1000 ? totalRootVolume.toLocaleString('en-US', { maximumFractionDigits: 0 }) : totalRootVolume.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-forensic-surface border border-forensic-border flex items-center space-x-3">
          <div className="p-2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] text-forensic-textDim uppercase font-mono block">Layering Depth</span>
            <span className="text-xs font-bold font-mono text-purple-400">
              {columns.length} Topological Stages
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-forensic-surface border border-forensic-border flex items-center space-x-3">
          <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] text-forensic-textDim uppercase font-mono block">Top Attributed VASP</span>
            <span className="text-xs font-bold font-mono text-emerald-400">
              {attributions && attributions[0] ? `${attributions[0].vasp_name} (${attributions[0].score.toFixed(0)}%)` : 'Scanning...'}
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Column Sankey Flow Canvas */}
      <div className="p-5 rounded-lg bg-forensic-surface border border-forensic-border flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-forensic-border pb-3 mb-6">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <h3 className="text-xs font-bold text-forensic-text uppercase tracking-wider">
              Volumetric Fund Flow & Entity Distribution Waterfall
            </h3>
          </div>
          <span className="text-[10px] font-mono text-forensic-textDim">
            Left-to-Right Topological Fund Transit
          </span>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col space-y-3">
              <div className={`text-[10px] font-bold font-mono uppercase tracking-widest pb-1 border-b ${col.color}`}>
                {col.title} ({col.nodes.length})
              </div>

              <div className="flex flex-col space-y-3">
                {col.nodes.map((node, nodeIdx) => {
                  const isHovered = hoveredNode === node.id;
                  const isVasp = node.role === 'KNOWN_VASP' || !!node.vaspName;
                  const isRoot = node.hop === 0;

                  return (
                    <div
                      key={nodeIdx}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => onSelectAddress?.(node.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                        isHovered
                          ? 'border-blue-400 bg-blue-500/10 shadow-lg scale-[1.02]'
                          : isVasp
                          ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60'
                          : isRoot
                          ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70'
                          : 'border-forensic-border bg-forensic-surfaceRaised/60 hover:border-forensic-borderHover'
                      }`}
                    >
                      {/* Flow percentage bar background */}
                      <div
                        className={`absolute left-0 bottom-0 top-0 opacity-15 transition-all ${
                          isVasp ? 'bg-emerald-500' : isRoot ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.max(8, node.percentage)}%` }}
                      />

                      <div className="relative z-10 flex flex-col space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] font-mono text-forensic-text truncate max-w-[150px]">
                            {node.vaspName ? (
                              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                                <Building2 className="h-3 w-3 inline" />
                                <span>{node.vaspName}</span>
                              </span>
                            ) : (
                              `${node.id.slice(0, 6)}...${node.id.slice(-4)}`
                            )}
                          </span>

                          <span className="text-[10px] font-mono font-bold text-forensic-textDim">
                            {node.percentage > 0 ? `${node.percentage.toFixed(0)}%` : ''}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-forensic-textDim">
                          <span>Vol: ${node.totalVolume > 1000 ? node.totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 }) : node.totalVolume.toFixed(2)}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-forensic-bg border border-forensic-border">
                            Hop {node.hop}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Flow Insights */}
        <div className="mt-8 pt-4 border-t border-forensic-border flex flex-wrap items-center justify-between text-[11px] font-mono text-forensic-textDim gap-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Input Suspect</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              <span>Direct Hop 1</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              <span>Layering Hop 2</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>VASP Endpoint</span>
            </span>
          </div>

          <div className="text-right">
            <span>Click any node to pivot investigation or view ledger details</span>
          </div>
        </div>
      </div>
    </div>
  );
};
