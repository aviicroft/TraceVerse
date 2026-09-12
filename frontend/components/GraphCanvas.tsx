'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  X,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  Filter,
  Eye,
  Network,
  Share2,
  Coins,
  Scale,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { GraphData, GraphNode, GraphEdge, NormalizedTransaction } from '../lib/types';
import { SankeyFlowView } from './SankeyFlowView';
import { TimelineReplayBar } from './TimelineReplayBar';

// Register dagre layout plugin safely
if (typeof window !== 'undefined') {
  try {
    cytoscape.use(dagre);
  } catch (e) {
    // Already registered
  }
}

type LayoutType = 'flow' | 'force' | 'hierarchical' | 'radial';
type ViewMode = 'NETWORK' | 'FUND_FLOW' | 'TIMELINE' | 'EVIDENCE';
type RiskFilterType = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH';

interface GraphCanvasProps {
  graphData: GraphData | null | undefined;
  isFullScreenView?: boolean;
  transactions?: NormalizedTransaction[];
  onPivotTarget?: (address: string) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graphData,
  isFullScreenView = false,
  transactions,
  onPivotTarget
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // View & Layout State
  const [layoutMode, setLayoutMode] = useState<LayoutType>('flow');
  const [viewMode, setViewMode] = useState<ViewMode>('NETWORK');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(isFullScreenView);

  // Filter States
  const [selectedHops, setSelectedHops] = useState<Set<number>>(new Set([1, 2, 3]));
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<Set<string>>(
    new Set(['TARGET', 'VASP', 'INTERMEDIARY', 'EXTERNAL'])
  );
  const [selectedToken, setSelectedToken] = useState<string>('ALL');
  const [minAmount, setMinAmount] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<RiskFilterType>('ALL');

  // Inspection & Path Focus State
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [focusedPath, setFocusedPath] = useState<{
    targetNodeId: string;
    nodeIds: Set<string>;
    edgeIds: Set<string>;
    totalVolume: number;
    hopDistance: number;
    destinationName?: string;
  } | null>(null);

  const [copied, setCopied] = useState<boolean>(false);

  // Compute Root Target Wallet from data
  const rootNode = useMemo(() => {
    if (!graphData?.nodes) return null;
    return graphData.nodes.find(
      (n: any) => (n.data?.role === 'INPUT_WALLET' || n.data?.is_root || n.data?.hop === 0)
    )?.data || null;
  }, [graphData]);

  const rootAddress = rootNode?.address || rootNode?.id || graphData?.stats?.root_wallet || '0x...';

  // Compute Aggregate Live Metrics from Graph Data
  const graphMetrics = useMemo(() => {
    if (!graphData?.nodes) {
      return {
        totalNodes: 0,
        totalTransfers: 0,
        maxHops: 3,
        vaspEndpoints: 0,
        totalObservedVolume: 0,
        primaryToken: 'USDT',
        tokensAvailable: ['ALL'],
      };
    }

    const totalNodes = graphData.nodes.length;
    const totalTransfers = graphData.edges?.length || 0;
    const vaspEndpoints = graphData.nodes.filter((n: any) => n.data?.is_vasp || n.data?.role === 'KNOWN_VASP').length;
    const maxHops = Math.max(...graphData.nodes.map((n: any) => n.data?.hop || 0), 3);

    let totalVolume = 0;
    const tokens = new Set<string>(['ALL']);

    graphData.edges?.forEach((e: any) => {
      const amt = Number(e.data?.amount || 0);
      totalVolume += amt;
      const sym = e.data?.asset_symbol || e.data?.token_symbol || 'ETH';
      if (sym) tokens.add(sym.toUpperCase());
    });

    return {
      totalNodes,
      totalTransfers,
      maxHops,
      vaspEndpoints,
      totalObservedVolume: totalVolume,
      primaryToken: tokens.has('USDT') ? 'USDT' : 'ETH',
      tokensAvailable: Array.from(tokens),
    };
  }, [graphData]);

  // Cytoscape Elements & Graph Lifecycle
  useEffect(() => {
    if (!containerRef.current || !graphData || !graphData.nodes || graphData.nodes.length === 0) {
      return;
    }

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const isDarkMode = document.documentElement.classList.contains('dark');
    const elements: cytoscape.ElementDefinition[] = [];
    const validNodeIds = new Set<string>();

    // 1. Build Nodes with Filtering
    graphData.nodes.forEach((n: any) => {
      const d = n.data || n;
      const nodeId = d.id || d.address;
      const isRoot = d.role === 'INPUT_WALLET' || d.is_root || d.hop === 0;
      const isVasp = d.is_vasp || d.role === 'KNOWN_VASP';
      const hop = d.hop ?? 1;

      // Hop filter
      if (!isRoot && !selectedHops.has(hop)) {
        return;
      }

      // Entity type filter
      let entityType = 'EXTERNAL';
      if (isRoot) entityType = 'TARGET';
      else if (isVasp) entityType = 'VASP';
      else if (hop >= 1 && hop <= 3) entityType = 'INTERMEDIARY';

      if (!selectedEntityTypes.has(entityType)) {
        return;
      }

      // View Mode Filtering
      if (viewMode === 'EVIDENCE' && !isRoot && !isVasp && hop > 2) {
        return;
      }

      validNodeIds.add(nodeId);

      const shortAddr = `${nodeId.slice(0, 6)}...${nodeId.slice(-4)}`;
      const label = isRoot
        ? `[TARGET]\n${shortAddr}`
        : isVasp
        ? `[${d.vasp_name?.toUpperCase() || 'VASP'}]\n${shortAddr}`
        : `${shortAddr}\n(Hop ${hop})`;

      elements.push({
        group: 'nodes',
        data: {
          id: nodeId,
          label: label,
          isRoot: isRoot,
          isVasp: isVasp,
          vaspName: d.vasp_name,
          vaspConfidence: d.vasp_confidence || 95,
          hop: hop,
          addressType: d.address_type || 'hot_wallet',
          fullAddress: nodeId,
          totalInflow: d.total_inflow || 0,
          totalOutflow: d.total_outflow || 0,
          txCount: d.tx_count || 0,
          role: d.role || entityType,
        },
      });
    });

    // 2. Build Edges with Filtering
    graphData.edges?.forEach((e: any, idx: number) => {
      const d = e.data || e;
      const src = d.source;
      const tgt = d.target;
      const amt = Number(d.amount || 0);
      const sym = (d.asset_symbol || d.token_symbol || 'ETH').toUpperCase();
      const edgeId = d.id || `edge-${idx}`;

      if (!validNodeIds.has(src) || !validNodeIds.has(tgt)) {
        return;
      }

      // Token filter
      if (selectedToken !== 'ALL' && sym !== selectedToken) {
        return;
      }

      // Min amount filter
      if (minAmount > 0 && amt < minAmount) {
        return;
      }

      const label = amt > 0 ? `${amt >= 1000 ? (amt / 1000).toFixed(1) + 'k' : amt.toFixed(2)} ${sym}` : '';

      elements.push({
        group: 'edges',
        data: {
          id: edgeId,
          source: src,
          target: tgt,
          label: label,
          amount: amt,
          tokenSymbol: sym,
          txHash: d.tx_hash || '',
          timestamp: d.timestamp || '',
          hop: d.hop || 1,
        },
      });
    });

    // 3. Layout Options Factory
    let layoutConfig: any = {
      name: 'dagre',
      rankDir: 'LR',
      nodeSep: 65,
      rankSep: 110,
      animate: true,
      animationDuration: 300,
    };

    if (layoutMode === 'force') {
      layoutConfig = {
        name: 'cose',
        animate: false,
        randomize: false,
        componentSpacing: 100,
        nodeOverlap: 20,
        idealEdgeLength: 100,
        nodeRepulsion: 400000,
      };
    } else if (layoutMode === 'hierarchical') {
      layoutConfig = {
        name: 'breadthfirst',
        directed: true,
        roots: rootNode?.id ? [`#${rootNode.id}`] : undefined,
        spacingFactor: 1.4,
        animate: true,
      };
    } else if (layoutMode === 'radial') {
      layoutConfig = {
        name: 'concentric',
        concentric: (node: any) => 4 - (node.data('hop') || 1),
        levelWidth: () => 1,
        minNodeSpacing: 60,
        animate: true,
      };
    }

    // 4. Forensic Theme Stylesheet
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': isDarkMode ? '#cbd5e1' : '#1e293b',
            'font-family': 'ui-monospace, SFMono-Regular, monospace',
            'font-size': '9px',
            'text-wrap': 'wrap',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': isDarkMode ? '#0f172a' : '#f1f5f9',
            'border-width': 1.5,
            'border-color': isDarkMode ? '#334155' : '#cbd5e1',
            'width': 50,
            'height': 50,
            'shape': 'roundrectangle',
            'transition-property': 'background-color, border-color, width, height, opacity',
            'transition-duration': 0.2,
          },
        },
        {
          selector: 'node[?isRoot]',
          style: {
            'background-color': isDarkMode ? '#450a0a' : '#fee2e2',
            'border-color': '#ef4444',
            'border-width': 2.5,
            'color': isDarkMode ? '#fca5a5' : '#991b1b',
            'width': 64,
            'height': 64,
            'font-weight': 'bold',
            'font-size': '10px',
          },
        },
        {
          selector: 'node[?isVasp]',
          style: {
            'background-color': isDarkMode ? 'rgba(217,92,99,0.10)' : 'rgba(217,92,99,0.15)',
            'border-color': '#D95C63',
            'border-width': 2.5,
            'color': isDarkMode ? '#EA747A' : '#7A252B',
            'width': 68,
            'height': 56,
            'shape': 'roundrectangle',
            'font-weight': 'bold',
            'font-size': '10px',
          },
        },
        {
          selector: 'node[hop = 1]:not([?isRoot]):not([?isVasp])',
          style: {
            'border-color': '#A94A52',
            'background-color': isDarkMode ? 'rgba(217,92,99,0.06)' : 'rgba(217,92,99,0.10)',
            'color': isDarkMode ? '#A5A8AF' : '#7A252B',
          },
        },
        {
          selector: 'node[hop = 2]:not([?isRoot]):not([?isVasp])',
          style: {
            'border-color': '#D95C63',
            'background-color': isDarkMode ? 'rgba(217,92,99,0.10)' : 'rgba(217,92,99,0.12)',
            'color': isDarkMode ? '#EA747A' : '#F3F4F6',
          },
        },
        {
          selector: 'node[hop = 3]:not([?isRoot]):not([?isVasp])',
          style: {
            'border-color': '#B94D55',
            'background-color': isDarkMode ? 'rgba(217,92,99,0.08)' : 'rgba(217,92,99,0.10)',
            'color': isDarkMode ? '#EA747A' : '#7A252B',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1.8,
            'line-color': isDarkMode ? '#A94A52' : '#A94A52',
            'target-arrow-color': isDarkMode ? '#A94A52' : '#A94A52',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.9,
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '8.5px',
            'font-family': 'ui-monospace, SFMono-Regular, monospace',
            'color': isDarkMode ? '#94a3b8' : '#475569',
            'text-rotation': 'autorotate',
            'text-background-opacity': 0.85,
            'text-background-color': isDarkMode ? '#090d16' : '#ffffff',
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
            'transition-property': 'line-color, target-arrow-color, width, opacity',
            'transition-duration': 0.2,
          },
        },
        // Focused Path Highlighting Styles
        {
          selector: '.path-focused',
          style: {
            'line-color': '#EA747A',
            'target-arrow-color': '#EA747A',
            'width': 3.5,
            'z-index': 999,
          },
        },
        {
          selector: 'node.path-focused',
          style: {
            'border-color': '#EA747A',
            'border-width': 3,
            'z-index': 999,
          },
        },
        {
          selector: '.path-dimmed',
          style: {
            'opacity': 0.15,
          },
        },
        {
          selector: '.replay-active-edge',
          style: {
            'line-color': '#F08086',
            'target-arrow-color': '#F08086',
            'width': 4.5,
            'z-index': 1000,
          },
        },
        {
          selector: 'node.replay-active-node',
          style: {
            'border-color': '#F08086',
            'border-width': 4,
            'z-index': 1000,
          },
        },
        {
          selector: ':selected',
          style: {
            'border-color': '#F08086',
            'border-width': 3.5,
            'line-color': '#F08086',
            'target-arrow-color': '#F08086',
          },
        },
      ],
      layout: layoutConfig,
    });

    // Path Focus Helper: Computes simple path from target root to clicked node
    const highlightPathToNode = (targetNode: cytoscape.NodeSingular) => {
      const targetId = targetNode.id();
      const rootId = rootNode?.id || rootAddress;

      if (!rootId || targetId === rootId) {
        cy.elements().removeClass('path-focused path-dimmed');
        setFocusedPath(null);
        return;
      }

      // Find shortest directed path using Dijkstra
      const dijkstra = cy.elements().dijkstra({
        root: `#${rootId}`,
        directed: true,
      });

      const pathToTarget = dijkstra.pathTo(targetNode);

      if (pathToTarget && pathToTarget.length > 0) {
        cy.elements().addClass('path-dimmed').removeClass('path-focused');
        pathToTarget.removeClass('path-dimmed').addClass('path-focused');

        const nodeIds = new Set<string>();
        const edgeIds = new Set<string>();
        let volume = 0;

        pathToTarget.forEach((el: any) => {
          if (el.isNode && el.isNode()) {
            nodeIds.add(el.id());
          } else if (el.isEdge && el.isEdge()) {
            edgeIds.add(el.id());
            volume += Number(el.data('amount') || 0);
          }
        });

        setFocusedPath({
          targetNodeId: targetId,
          nodeIds,
          edgeIds,
          totalVolume: volume,
          hopDistance: targetNode.data('hop') || 1,
          destinationName: targetNode.data('vaspName'),
        });
      }
    };

    // Event Handlers
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedElement({
        type: 'NODE',
        data: node.data(),
      });
      highlightPathToNode(node);
    });

    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      setSelectedElement({
        type: 'EDGE',
        data: edge.data(),
      });
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedElement(null);
        cy.elements().removeClass('path-focused path-dimmed');
        setFocusedPath(null);
      }
    });

    // Auto-focus primary fund flow in FUND_FLOW view
    if (viewMode === 'FUND_FLOW') {
      const topVaspNode = cy.nodes('[?isVasp]').first();
      if (topVaspNode.length > 0) {
        highlightPathToNode(topVaspNode);
      }
    }

    cyRef.current = cy;
  }, [
    graphData,
    layoutMode,
    viewMode,
    selectedHops,
    selectedEntityTypes,
    selectedToken,
    minAmount,
    timeRange,
    riskFilter,
  ]);

  // Controls
  const handleFit = () => cyRef.current?.fit(undefined, 30);
  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleReset = () => {
    cyRef.current?.reset();
    cyRef.current?.elements().removeClass('path-focused path-dimmed');
    setFocusedPath(null);
    setSelectedElement(null);
    handleFit();
  };

  const toggleHopFilter = (hop: number) => {
    const next = new Set(selectedHops);
    if (next.has(hop)) next.delete(hop);
    else next.add(hop);
    setSelectedHops(next);
  };

  const toggleEntityType = (type: string) => {
    const next = new Set(selectedEntityTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setSelectedEntityTypes(next);
  };

  const handleClearFilters = () => {
    setSelectedHops(new Set([1, 2, 3]));
    setSelectedEntityTypes(new Set(['TARGET', 'VASP', 'INTERMEDIARY', 'EXTERNAL']));
    setSelectedToken('ALL');
    setMinAmount(0);
    setTimeRange('ALL');
    setRiskFilter('ALL');
    setViewMode('NETWORK');
    setLayoutMode('flow');
    handleReset();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-forensic-surface border border-forensic-border rounded-xl shadow-lg flex flex-col relative text-xs overflow-hidden transition-all duration-300 ${
        isFullScreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : isFullScreenView ? 'h-[80vh]' : 'h-[620px]'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. INVESTIGATION SUMMARY HEADER BAR */}
      {/* ========================================================================= */}
      <div className="p-3 border-b border-forensic-border bg-forensic-surfaceRaised/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Target & Core Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 pr-3 border-r border-forensic-border">
            <div className="p-1.5 rounded bg-forensic-accent/10 border border-forensic-accent/30 text-forensic-accent">
              <Network className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 font-mono text-[11px] font-bold text-forensic-text uppercase">
                <span>GRAPH STUDIO</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-forensic-accent/10 text-forensic-accent border border-forensic-accent/20 font-normal">
                  PRO
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[11px] font-mono text-forensic-textDim">
                <span>Target:</span>
                <span className="text-forensic-text font-medium">{rootAddress ? `${rootAddress.slice(0, 8)}...${rootAddress.slice(-4)}` : 'N/A'}</span>
                <button
                  onClick={() => handleCopy(rootAddress)}
                  className="hover:text-forensic-text transition-colors p-0.5"
                  title="Copy Target Wallet"
                >
                  {copied ? <Check className="h-3 w-3 text-[#E6C766]" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Genuine Response Metrics Badges */}
          <div className="hidden sm:flex items-center space-x-2 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded bg-forensic-surface border border-forensic-border text-forensic-text font-medium">
              <strong className="text-forensic-accent">{graphMetrics.totalNodes}</strong> Nodes
            </span>
            <span className="px-2.5 py-1 rounded bg-forensic-surface border border-forensic-border text-forensic-text font-medium">
              <strong className="text-[#E6C766]">{graphMetrics.totalTransfers}</strong> Transfers
            </span>
            <span className="px-2.5 py-1 rounded bg-forensic-surface border border-forensic-border text-forensic-text font-medium">
              <strong className="text-forensic-rose">{graphMetrics.maxHops}</strong> Hops
            </span>
            <span className="px-2.5 py-1 rounded bg-forensic-surface border border-forensic-border text-[#E6C766] font-medium">
              <strong className="text-[#E6C766]">{graphMetrics.vaspEndpoints}</strong> VASP Endpoints
            </span>
            {graphMetrics.totalObservedVolume > 0 && (
              <span className="px-2.5 py-1 rounded bg-forensic-surface border border-forensic-border text-amber-400 font-medium">
                {graphMetrics.totalObservedVolume >= 1000
                  ? (graphMetrics.totalObservedVolume / 1000).toFixed(1) + 'k'
                  : graphMetrics.totalObservedVolume.toFixed(2)}{' '}
                {graphMetrics.primaryToken} Observed
              </span>
            )}
          </div>
        </div>

        {/* Right: View Modes & Canvas Actions */}
        <div className="flex items-center space-x-2">
          {/* View Switcher: [Network] [Fund Flow] [Timeline] [Evidence] */}
          <div className="flex items-center bg-forensic-surface border border-forensic-border rounded p-0.5 font-mono text-[10px]">
            {(['NETWORK', 'FUND_FLOW', 'TIMELINE', 'EVIDENCE'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-forensic-accent text-[#111111] font-bold'
                    : 'text-forensic-textMuted hover:text-forensic-text hover:bg-forensic-surfaceRaised'
                }`}
              >
                {mode === 'FUND_FLOW' ? 'Fund Flow' : mode.charAt(0) + mode.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Quick Hop Filters */}
          <div className="hidden xl:flex items-center bg-forensic-surface border border-forensic-border rounded p-0.5 font-mono text-[10px]">
            <button
              onClick={() => setSelectedHops(new Set([1, 2, 3]))}
              className={`px-2 py-1 rounded transition-colors ${
                selectedHops.size === 3 ? 'bg-forensic-surfaceRaised text-forensic-text font-bold' : 'text-forensic-textMuted'
              }`}
            >
              All Hops
            </button>
            {[1, 2, 3].map((hop) => (
              <button
                key={hop}
                onClick={() => toggleHopFilter(hop)}
                className={`px-2 py-1 rounded transition-colors ${
                  selectedHops.has(hop) && selectedHops.size < 3
                    ? 'bg-forensic-accent text-[#111111] font-bold'
                    : 'text-forensic-textMuted hover:text-forensic-text'
                }`}
              >
                Hop {hop}
              </button>
            ))}
          </div>

          {/* Canvas Actions */}
          <div className="flex items-center space-x-1 border-l border-forensic-border pl-2">
            <button
              onClick={handleReset}
              className="p-1.5 rounded hover:bg-forensic-surfaceRaised text-forensic-textMuted hover:text-forensic-text border border-transparent hover:border-forensic-border transition-colors"
              title="Reset View & Clear Path Focus"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleFit}
              className="p-1.5 rounded hover:bg-forensic-surfaceRaised text-forensic-textMuted hover:text-forensic-text border border-transparent hover:border-forensic-border transition-colors"
              title="Fit Graph"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-forensic-surfaceRaised text-forensic-textMuted hover:text-forensic-text border border-transparent hover:border-forensic-border transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-forensic-surfaceRaised text-forensic-textMuted hover:text-forensic-text border border-transparent hover:border-forensic-border transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 rounded hover:bg-forensic-surfaceRaised text-forensic-textMuted hover:text-forensic-text border border-transparent hover:border-forensic-border transition-colors"
              title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE BODY: (Left Panel + Cytoscape Canvas + Right Drawer) */}
      {/* ========================================================================= */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* ======================================================================= */}
        {/* 2. LEFT INVESTIGATION CONTROL PANEL */}
        {/* ======================================================================= */}
        <div
          className={`border-r border-forensic-border bg-forensic-surfaceRaised/95 backdrop-blur-md transition-all duration-300 flex flex-col z-20 overflow-y-auto ${
            isSidebarOpen ? 'w-64 min-w-[16rem]' : 'w-10 min-w-[2.5rem]'
          }`}
        >
          {/* Collapse Header */}
          <div className="p-2.5 border-b border-forensic-border flex items-center justify-between">
            {isSidebarOpen ? (
              <div className="flex items-center space-x-2 font-mono text-xs font-bold text-forensic-text uppercase">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#E6C766]" />
                <span>Investigation Filters</span>
              </div>
            ) : (
              <SlidersHorizontal className="h-4 w-4 text-forensic-textDim mx-auto" />
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded hover:bg-forensic-surface text-forensic-textMuted hover:text-forensic-text transition-colors"
              title={isSidebarOpen ? 'Collapse Panel' : 'Expand Panel'}
            >
              {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>

          {isSidebarOpen && (
            <div className="p-3.5 space-y-4 text-xs">
              {/* LAYOUT Engine Selector */}
              <div>
                <div className="text-[10px] font-mono uppercase text-forensic-textDim font-bold mb-2 tracking-wider">
                  Graph Layout
                </div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  {[
                    { id: 'flow', label: 'Flow (DAG)' },
                    { id: 'force', label: 'Force (CoSE)' },
                    { id: 'hierarchical', label: 'Hierarchical' },
                    { id: 'radial', label: 'Radial' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLayoutMode(l.id as LayoutType)}
                      className={`px-2 py-1.5 rounded text-left flex items-center space-x-1.5 border transition-colors ${
                        layoutMode === l.id
                          ? 'bg-forensic-accent/10 border-forensic-accent/40 text-forensic-accent font-bold'
                          : 'bg-forensic-surface border-forensic-border text-forensic-textMuted hover:text-forensic-text'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${layoutMode === l.id ? 'bg-forensic-accent' : 'bg-transparent border border-forensic-border'}`} />
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* HOPS Selection */}
              <div>
                <div className="text-[10px] font-mono uppercase text-forensic-textDim font-bold mb-2 tracking-wider">
                  Hop Traversal Depth
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {[1, 2, 3].map((hop) => (
                    <label key={hop} className="flex items-center space-x-2 cursor-pointer text-forensic-text hover:text-white">
                      <input
                        type="checkbox"
                        checked={selectedHops.has(hop)}
                        onChange={() => toggleHopFilter(hop)}
                        className="rounded border-forensic-border bg-forensic-surface text-forensic-accent focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
                      />
                      <span>Hop {hop} Counterparties</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ENTITY TYPES */}
              <div>
                <div className="text-[10px] font-mono uppercase text-forensic-textDim font-bold mb-2 tracking-wider">
                  Entity Types
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {[
                    { id: 'TARGET', label: 'Target Suspect Wallet', color: 'text-rose-400' },
                    { id: 'VASP', label: 'VASP Custodial Clusters', color: 'text-[#E6C766]' },
                    { id: 'INTERMEDIARY', label: 'Intermediary Wallets', color: 'text-forensic-rose' },
                    { id: 'EXTERNAL', label: 'External Contracts / Unknown', color: 'text-forensic-textDim' },
                  ].map((e) => (
                    <label key={e.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEntityTypes.has(e.id)}
                        onChange={() => toggleEntityType(e.id)}
                        className="rounded border-forensic-border bg-forensic-surface text-forensic-accent focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
                      />
                      <span className={e.color}>{e.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* TRANSACTION FILTERS: Token & Min Amount */}
              <div className="space-y-2.5 pt-2 border-t border-forensic-border">
                <div className="text-[10px] font-mono uppercase text-forensic-textDim font-bold tracking-wider">
                  Transaction Filters
                </div>
                <div>
                  <label className="text-[11px] text-forensic-textDim block mb-1">Asset Token</label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full bg-forensic-surface border border-forensic-border rounded px-2 py-1.5 text-forensic-text font-mono text-xs focus:outline-none focus:border-forensic-accent"
                  >
                    {graphMetrics.tokensAvailable.map((t) => (
                      <option key={t} value={t}>
                        {t === 'ALL' ? 'All Tokens' : t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] text-forensic-textDim">Minimum Transfer</label>
                    <span className="font-mono text-[10px] text-[#E6C766]">
                      {minAmount > 0 ? `≥ ${minAmount}` : 'No Minimum'}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    placeholder="0.00"
                    value={minAmount || ''}
                    onChange={(e) => setMinAmount(Number(e.target.value) || 0)}
                    className="w-full bg-forensic-surface border border-forensic-border rounded px-2 py-1.5 text-forensic-text font-mono text-xs focus:outline-none focus:border-forensic-accent"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {[0, 100, 1000, 5000].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setMinAmount(preset)}
                        className={`flex-1 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                          minAmount === preset
                            ? 'bg-forensic-accent text-[#111111] border-forensic-accent'
                            : 'bg-forensic-surface border-forensic-border text-forensic-textDim hover:text-forensic-text'
                        }`}
                      >
                        {preset === 0 ? 'All' : `${preset >= 1000 ? preset / 1000 + 'k' : preset}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-forensic-textDim block mb-1">Time Horizon</label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="w-full bg-forensic-surface border border-forensic-border rounded px-2 py-1.5 text-forensic-text font-mono text-xs focus:outline-none focus:border-forensic-accent"
                  >
                    <option value="ALL">All Time</option>
                    <option value="24H">Last 24 Hours</option>
                    <option value="7D">Last 7 Days</option>
                    <option value="30D">Last 30 Days</option>
                  </select>
                </div>
              </div>

              {/* RISK LEVEL FILTER */}
              <div className="pt-2 border-t border-forensic-border">
                <div className="text-[10px] font-mono uppercase text-forensic-textDim font-bold mb-2 tracking-wider">
                  Risk Assessment Scope
                </div>
                <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                  {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as RiskFilterType[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRiskFilter(r)}
                      className={`py-1 rounded font-medium border transition-colors ${
                        riskFilter === r
                          ? r === 'HIGH'
                            ? 'bg-rose-600 text-white border-rose-500'
                            : r === 'MEDIUM'
                            ? 'bg-amber-600 text-white border-amber-500'
                            : r === 'LOW'
                            ? 'bg-[#E6C766] text-white border-[#E6C766]'
                            : 'bg-forensic-accent text-[#111111] border-forensic-accent'
                          : 'bg-forensic-surface border-forensic-border text-forensic-textDim hover:text-forensic-text'
                      }`}
                    >
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters Action */}
              <div className="pt-3">
                <button
                  onClick={handleClearFilters}
                  className="w-full py-1.5 rounded-lg bg-forensic-surface hover:bg-forensic-border text-forensic-text border border-forensic-border transition-colors font-mono text-xs flex items-center justify-center space-x-1.5"
                >
                  <RotateCcw className="h-3 w-3 text-forensic-textDim" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* 3. CYTOSCAPE GRAPH CANVAS / SANKEY DUAL VIEW */}
        {/* ======================================================================= */}
        {viewMode === 'FUND_FLOW' ? (
          <div className="flex-1 bg-forensic-bg h-full overflow-hidden">
            <SankeyFlowView
              graphData={graphData}
              rootAddress={rootAddress}
              onSelectAddress={(addr) => {
                const node = cyRef.current?.getElementById(addr);
                if (node && node.length > 0) {
                  node.select();
                  setSelectedElement({ type: 'NODE', data: node.data() });
                }
              }}
            />
          </div>
        ) : (
          <div className="flex-1 relative bg-forensic-bg h-full flex flex-col">
            <div ref={containerRef} className="w-full flex-1" />

            {/* Timeline Time-Machine Replay Bar */}
            {transactions && transactions.length > 0 && (
              <div className="p-3 border-t border-forensic-border bg-forensic-bg/95 z-10">
                <TimelineReplayBar
                  transactions={transactions}
                  onStepChange={(tx) => {
                    if (!cyRef.current || !tx) return;
                    const cy = cyRef.current;
                    cy.elements().removeClass('replay-active-edge replay-active-node path-dimmed');

                    const src = (tx.from_address || '').toLowerCase();
                    const dst = (tx.to_address || '').toLowerCase();

                    cy.elements().addClass('path-dimmed');

                    const matchingNodes = cy.nodes().filter((n: any) => {
                      const nid = n.id().toLowerCase();
                      return nid === src || nid === dst;
                    });

                    const matchingEdges = cy.edges().filter((e: any) => {
                      const s = e.source().id().toLowerCase();
                      const t = e.target().id().toLowerCase();
                      return (s === src && t === dst) || (e.data('txHash') && e.data('txHash').toLowerCase() === tx.tx_hash.toLowerCase());
                    });

                    matchingNodes.removeClass('path-dimmed').addClass('replay-active-node');
                    matchingEdges.removeClass('path-dimmed').addClass('replay-active-edge');

                    if (matchingEdges.length > 0) {
                      cy.animate({
                        center: { eles: matchingEdges },
                        duration: 250,
                      });
                    }
                  }}
                />
              </div>
            )}

            {/* Active Path Focus Banner (Bottom Left of Canvas) */}
            {focusedPath && (
              <div className="absolute bottom-20 left-4 z-10 p-3 rounded-lg bg-forensic-surface/95 border border-forensic-accent/30 shadow-xl backdrop-blur-md font-mono text-xs max-w-md animate-fade-in">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5 text-forensic-accent font-bold">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    <span>PRIMARY FUND FLOW FOCUS</span>
                  </div>
                  <button
                    onClick={() => {
                      cyRef.current?.elements().removeClass('path-focused path-dimmed');
                      setFocusedPath(null);
                    }}
                    className="text-forensic-textDim hover:text-forensic-text p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-forensic-textDim space-y-1">
                  <div>
                    Destination:{' '}
                    <strong className="text-[#E6C766]">
                      {focusedPath.destinationName || focusedPath.targetNodeId.slice(0, 10) + '...'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Hop Distance: <strong>{focusedPath.hopDistance} Hop(s)</strong></span>
                    <span>Observable Flow: <strong className="text-forensic-accent">{focusedPath.totalVolume.toFixed(2)} {graphMetrics.primaryToken}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* 4. RIGHT FORENSIC INSPECTOR DRAWER */}
        {/* ======================================================================= */}
        {selectedElement && (
          <div className="w-80 border-l border-forensic-border bg-forensic-surfaceRaised/95 backdrop-blur-md p-4 overflow-y-auto z-20 flex flex-col justify-between animate-slide-left text-xs font-sans">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-forensic-border">
                <div className="flex items-center space-x-2 font-mono font-bold text-forensic-text uppercase text-[11px]">
                  <ShieldCheck className="h-4 w-4 text-[#E6C766]" />
                  <span>{selectedElement.type === 'NODE' ? 'Node Forensics' : 'Transfer Details'}</span>
                </div>
                <button
                  onClick={() => setSelectedElement(null)}
                  className="text-forensic-textDim hover:text-forensic-text p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* NODE DETAILS */}
              {selectedElement.type === 'NODE' && (
                <div className="space-y-3 font-mono text-[11px]">
                  {/* Address Badge */}
                  <div>
                    <div className="text-forensic-textDim text-[10px] uppercase">Cryptocurrency Address</div>
                    <div className="flex items-center justify-between p-2 rounded bg-forensic-surface border border-forensic-border mt-1">
                      <span className="font-bold text-forensic-text break-all text-[11px]">
                        {selectedElement.data.fullAddress || selectedElement.data.id}
                      </span>
                      <button
                        onClick={() => handleCopy(selectedElement.data.fullAddress || selectedElement.data.id)}
                        className="ml-2 p-1 text-forensic-textDim hover:text-forensic-text"
                        title="Copy Address"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-[#E6C766]" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Entity Provenance if VASP */}
                  {selectedElement.data.isVasp && (
                    <div className="p-3 rounded-lg bg-[#E6C766]/10 border border-[#E6C766]/25 text-[11px] space-y-1">
                      <div className="text-[#E6C766] font-bold">
                        {selectedElement.data.vaspName} ({selectedElement.data.addressType})
                      </div>
                      <div className="text-forensic-textDim text-[10px]">
                        Provenance: Verified Proof of Reserves / Etherscan Public Label
                      </div>
                      <div className="text-[#E6C766] text-[10px]">
                        Confidence: {selectedElement.data.vaspConfidence || 98}% (HIGH)
                      </div>
                    </div>
                  )}

                  {/* Financial Flow Summary */}
                  <div className="p-3 rounded-lg bg-forensic-surface border border-forensic-border space-y-1.5 font-mono text-[11px]">
                    <div className="text-[10px] uppercase text-forensic-textDim font-bold font-sans">
                      Topological Flow Metrics
                    </div>
                    <div className="flex justify-between">
                      <span className="text-forensic-textDim">Hop Distance:</span>
                      <span className="text-forensic-text font-bold">Hop {selectedElement.data.hop}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-forensic-textDim">Total Inflow:</span>
                      <span className="text-[#E6C766] font-bold">{Number(selectedElement.data.totalInflow || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-forensic-textDim">Total Outflow:</span>
                      <span className="text-rose-400 font-bold">{Number(selectedElement.data.totalOutflow || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-forensic-textDim">Transactions:</span>
                      <span className="text-forensic-text">{selectedElement.data.txCount || 0} Transfers</span>
                    </div>
                  </div>

                  {/* Action Link & Pivot Trigger */}
                  <div className="space-y-2 pt-1">
                    <a
                      href={`https://etherscan.io/address/${selectedElement.data.fullAddress || selectedElement.data.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center space-x-1.5 w-full py-2 rounded bg-forensic-surfaceRaised hover:bg-forensic-border border border-forensic-border text-forensic-text font-medium text-xs transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View on Blockchain Explorer</span>
                    </a>

                    {onPivotTarget && (
                      <button
                        onClick={() => onPivotTarget(selectedElement.data.fullAddress || selectedElement.data.id)}
                        className="w-full py-2 rounded bg-forensic-accent hover:bg-[#F1D98A] text-[#111111] font-bold font-mono text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Pivot & Trace This Target</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* EDGE DETAILS */}
              {selectedElement.type === 'EDGE' && (
                <div className="space-y-3 font-mono text-[11px]">
                  <div>
                    <div className="text-forensic-textDim text-[10px] uppercase">Transaction Hash</div>
                    <div className="p-2 rounded bg-forensic-surface border border-forensic-border mt-1 font-bold text-forensic-text break-all">
                      {selectedElement.data.txHash || selectedElement.data.id}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-forensic-surface border border-forensic-border space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-forensic-textDim">Transfer Amount:</span>
                      <span className="text-[#E6C766] font-bold">
                        {selectedElement.data.amount} {selectedElement.data.tokenSymbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-forensic-textDim">Hop Depth:</span>
                      <span className="text-forensic-text">Hop {selectedElement.data.hop}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-forensic-textDim">Timestamp:</span>
                      <span className="text-forensic-textDim">{selectedElement.data.timestamp ? new Date(selectedElement.data.timestamp).toLocaleString() : 'Recent'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-forensic-surface border border-forensic-border text-[10px] space-y-1 font-mono">
                    <div className="text-forensic-textDim">FROM: {selectedElement.data.source}</div>
                    <div className="text-forensic-textDim">TO: {selectedElement.data.target}</div>
                  </div>

                  {selectedElement.data.txHash && (
                    <a
                      href={`https://etherscan.io/tx/${selectedElement.data.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center space-x-1.5 w-full py-2 rounded bg-forensic-accent hover:bg-[#F1D98A] text-[#111111] font-medium text-xs transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Verify on Explorer</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-forensic-border text-[10px] text-forensic-textDim font-mono text-center">
              TRACEVERSE Financial Intelligence Core
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
