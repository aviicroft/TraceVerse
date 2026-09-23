'use client';

import React, { useMemo, useState } from 'react';
import { GraphData, Attribution } from '../lib/types';
import { Layers, Building2, TrendingUp, ShieldCheck, Wallet, ArrowRight } from 'lucide-react';
import { Badge } from './ui/Badge';

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
  onSelectAddress,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { columns, totalRootVolume } = useMemo(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
      return { columns: [], totalRootVolume: 0 };
    }

    const hop0Nodes: FlowColumnNode[] = [];
    const hop1Nodes: FlowColumnNode[] = [];
    const hop2Nodes: FlowColumnNode[] = [];
    const vaspNodes: FlowColumnNode[] = [];

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
      const isRoot =
        nid.toLowerCase() === rootAddress.toLowerCase() ||
        n.role === 'INPUT_WALLET' ||
        n.is_root;
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
        percentage: 0,
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

    const cols = [
      { title: 'ROOT SUSPECT', nodes: hop0Nodes, badgeVariant: 'danger' },
      { title: 'HOP 1 DIRECT', nodes: hop1Nodes.slice(0, 6), badgeVariant: 'accent' },
      { title: 'HOP 2 LAYERING', nodes: hop2Nodes.slice(0, 6), badgeVariant: 'warning' },
      { title: 'DESTINATION VASPS', nodes: vaspNodes, badgeVariant: 'success' },
    ].filter((c) => c.nodes.length > 0);

    return { columns: cols, totalRootVolume: rootOutflow };
  }, [graphData, rootAddress]);

  return (
    <div className="flex flex-col h-full bg-bg p-5 sm:p-6 overflow-y-auto space-y-5 font-sans">
      {/* Top Intelligence Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-3 shadow-panel">
          <div className="w-9 h-9 rounded-lg bg-danger-subtle text-danger border border-danger-border inline-flex items-center justify-center shrink-0">
            <Wallet className="h-4 w-4 shrink-0" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-text-muted font-medium block">Root Origin</span>
            <span className="text-xs font-bold font-mono text-text truncate block max-w-[140px]">
              {rootAddress.slice(0, 10)}...
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-3 shadow-panel">
          <div className="w-9 h-9 rounded-lg bg-accent-subtle text-accent border border-accent-border inline-flex items-center justify-center shrink-0">
            <TrendingUp className="h-4 w-4 shrink-0" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-text-muted font-medium block">Observed Flow</span>
            <span className="text-xs font-bold font-mono text-accent">
              ${totalRootVolume > 1000 ? totalRootVolume.toLocaleString('en-US', { maximumFractionDigits: 0 }) : totalRootVolume.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-3 shadow-panel">
          <div className="w-9 h-9 rounded-lg bg-warning-subtle text-warning border border-warning-border inline-flex items-center justify-center shrink-0">
            <Layers className="h-4 w-4 shrink-0" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-text-muted font-medium block">Layering Depth</span>
            <span className="text-xs font-bold font-mono text-warning">
              {columns.length} Topological Stages
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-3 shadow-panel">
          <div className="w-9 h-9 rounded-lg bg-verified-subtle text-verified border border-verified-border inline-flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 shrink-0" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-text-muted font-medium block">Top Attributed VASP</span>
            <span className="text-xs font-bold text-verified truncate block max-w-[140px]">
              {attributions && attributions[0]
                ? `${attributions[0].vasp_name} (${attributions[0].score.toFixed(0)}%)`
                : 'Scanning...'}
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Column Sankey Flow Canvas */}
      <div className="p-6 rounded-xl bg-surface border border-border flex-1 flex flex-col justify-between shadow-panel">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
            <h3 className="text-sm font-semibold text-text tracking-wide">
              Volumetric Fund Flow & Entity Distribution Waterfall
            </h3>
          </div>
          <span className="text-xs text-text-muted">
            Left-to-Right Topological Fund Transit
          </span>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative">
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-semibold text-text uppercase tracking-wider">
                  {col.title}
                </span>
                <Badge variant={col.badgeVariant as any} size="sm">
                  {col.nodes.length}
                </Badge>
              </div>

              <div className="flex flex-col space-y-2.5">
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
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                        isHovered
                          ? 'border-accent bg-accent/10 shadow-panel scale-[1.02]'
                          : isVasp
                          ? 'border-verified/30 bg-verified-subtle hover:border-verified'
                          : isRoot
                          ? 'border-danger/30 bg-danger-subtle hover:border-danger'
                          : 'border-border bg-surface-raised hover:border-border-hover'
                      }`}
                    >
                      {/* Flow percentage bar background */}
                      <div
                        className={`absolute left-0 bottom-0 top-0 opacity-15 transition-all ${
                          isVasp ? 'bg-verified' : isRoot ? 'bg-danger' : 'bg-accent'
                        }`}
                        style={{ width: `${Math.max(8, node.percentage)}%` }}
                      />

                      <div className="relative z-10 flex flex-col space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-text truncate max-w-[140px]">
                            {node.vaspName ? (
                              <span className="text-accent font-bold flex items-center space-x-1">
                                <Building2 className="h-3.5 w-3.5 inline" />
                                <span>{node.vaspName}</span>
                              </span>
                            ) : (
                              <span className="font-mono text-technical">
                                {node.id.slice(0, 6)}...{node.id.slice(-4)}
                              </span>
                            )}
                          </span>

                          <span className="text-xs font-mono font-bold text-text-muted">
                            {node.percentage > 0 ? `${node.percentage.toFixed(0)}%` : ''}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-text-muted">
                          <span>
                            Vol: $
                            {node.totalVolume > 1000
                              ? node.totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })
                              : node.totalVolume.toFixed(2)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-surface border border-border text-xs font-medium font-mono">
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
        <div className="mt-8 pt-4 border-t border-border flex flex-wrap items-center justify-between text-xs text-text-muted gap-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-danger" />
              <span>Input Suspect</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span>Direct Hop 1</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-warning" />
              <span>Layering Hop 2</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-verified" />
              <span>VASP Endpoint</span>
            </span>
          </div>

          <div className="text-right text-text-muted">
            <span>Click any node to pivot investigation or view ledger details</span>
          </div>
        </div>
      </div>
    </div>
  );
};
