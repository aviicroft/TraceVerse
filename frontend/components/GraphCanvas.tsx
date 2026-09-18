'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  X,
  Share2,
  Sparkles,
  Download,
  Search,
  ArrowRight,
  FolderOpen,
  Network,
  Activity,
  Layers,
  Database,
} from 'lucide-react';
import { GraphData, NormalizedTransaction } from '../lib/types';
import { SankeyFlowView } from './SankeyFlowView';
import { TimelineReplayBar } from './TimelineReplayBar';
import { useTheme } from './ThemeProvider';

// Register dagre layout plugin safely
if (typeof window !== 'undefined') {
  try {
    cytoscape.use(dagre);
  } catch (e) {
    // Already registered
  }
}

export type LayoutType = 'flow' | 'force' | 'hierarchical' | 'radial';
export type ViewMode = 'NETWORK' | 'FUND_FLOW' | 'EVIDENCE';
export type RiskFilterType = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface GraphCanvasProps {
  graphData: GraphData | null | undefined;
  isFullScreenView?: boolean;
  transactions?: NormalizedTransaction[];
  onPivotTarget?: (address: string) => void;
  recentAnalyses?: any[];
  isLoading?: boolean;
  onStartAnalysis?: (address: string, maxHops: number) => void;
  onLoadCase?: (analysisId: string) => void;
}

// Helper to generate dynamic Cytoscape stylesheet for Dark/Light themes
function getCytoscapeStylesheet(isDarkMode: boolean): any[] {
  return [
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
        'font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        'font-size': '9px',
        'text-wrap': 'wrap',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': isDarkMode ? '#1e293b' : '#ffffff',
        'border-width': 2,
        'border-color': isDarkMode ? '#475569' : '#cbd5e1',
        width: 56,
        height: 56,
        shape: 'roundrectangle',
        'transition-property': 'background-color, border-color, width, height, opacity',
        'transition-duration': 0.15,
      },
    },
    {
      selector: 'node[?isRoot]',
      style: {
        'background-color': isDarkMode ? '#3b0d14' : '#fee2e2',
        'border-color': isDarkMode ? '#ef4444' : '#dc2626',
        'border-width': 3,
        color: isDarkMode ? '#fca5a5' : '#991b1b',
        width: 68,
        height: 68,
        'font-weight': 'bold',
        'font-size': '10px',
      },
    },
    {
      selector: 'node[?isVasp]',
      style: {
        'background-color': isDarkMode ? '#063522' : '#ecfdf5',
        'border-color': isDarkMode ? '#10b981' : '#059669',
        'border-width': 3,
        color: isDarkMode ? '#6ee7b7' : '#047857',
        width: 74,
        height: 58,
        shape: 'roundrectangle',
        'font-weight': 'bold',
        'font-size': '10px',
      },
    },
    {
      selector: 'node[hop = 1]:not([?isRoot]):not([?isVasp])',
      style: {
        'border-color': isDarkMode ? '#64748b' : '#94a3b8',
        'background-color': isDarkMode ? '#1e293b' : '#f8fafc',
        color: isDarkMode ? '#f8fafc' : '#1e293b',
      },
    },
    {
      selector: 'node[hop = 2]:not([?isRoot]):not([?isVasp])',
      style: {
        'border-color': isDarkMode ? '#475569' : '#cbd5e1',
        'background-color': isDarkMode ? '#182234' : '#f1f5f9',
        color: isDarkMode ? '#e2e8f0' : '#334155',
      },
    },
    {
      selector: 'node[hop = 3]:not([?isRoot]):not([?isVasp])',
      style: {
        'border-color': isDarkMode ? '#334155' : '#e2e8f0',
        'background-color': isDarkMode ? '#0f172a' : '#f4f4f5',
        color: isDarkMode ? '#cbd5e1' : '#475569',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': isDarkMode ? '#64748b' : '#94a3b8',
        'target-arrow-color': isDarkMode ? '#94a3b8' : '#64748b',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.0,
        'curve-style': 'bezier',
        label: 'data(label)',
        'font-size': '8.5px',
        'font-family': 'ui-monospace, SFMono-Regular, monospace',
        color: isDarkMode ? '#cbd5e1' : '#334155',
        'text-rotation': 'autorotate',
        'text-background-opacity': 0.95,
        'text-background-color': isDarkMode ? '#09090b' : '#ffffff',
        'text-background-padding': '3px',
        'text-background-shape': 'roundrectangle',
        'text-border-color': isDarkMode ? '#27272a' : '#e2e8f0',
        'text-border-width': 1,
        'text-border-opacity': 0.8,
        'transition-property': 'line-color, target-arrow-color, width, opacity',
        'transition-duration': 0.15,
      },
    },
    {
      selector: '.path-focused',
      style: {
        'line-color': '#ef4444',
        'target-arrow-color': '#ef4444',
        width: 4,
        'z-index': 999,
      },
    },
    {
      selector: 'node.path-focused',
      style: {
        'border-color': '#ef4444',
        'border-width': 3.5,
        'z-index': 999,
      },
    },
    {
      selector: '.path-dimmed',
      style: {
        opacity: 0.15,
      },
    },
    {
      selector: '.replay-active-edge',
      style: {
        'line-color': '#f59e0b',
        'target-arrow-color': '#f59e0b',
        width: 4.5,
        'z-index': 1000,
      },
    },
    {
      selector: 'node.replay-active-node',
      style: {
        'border-color': '#f59e0b',
        'border-width': 3.5,
        'z-index': 1000,
      },
    },
    {
      selector: ':selected',
      style: {
        'border-color': '#3b82f6',
        'border-width': 3.5,
        'line-color': '#3b82f6',
        'target-arrow-color': '#3b82f6',
      },
    },
  ];
}

// Layout configuration builder
function getLayoutConfig(layoutMode: LayoutType, rootNodeId?: string) {
  if (layoutMode === 'force') {
    return {
      name: 'cose',
      animate: true,
      animationDuration: 400,
      randomize: false,
      componentSpacing: 80,
      nodeOverlap: 20,
      idealEdgeLength: 80,
      nodeRepulsion: 15000,
    };
  } else if (layoutMode === 'hierarchical') {
    return {
      name: 'breadthfirst',
      directed: true,
      roots: rootNodeId ? `node[id = "${rootNodeId}"]` : undefined,
      spacingFactor: 1.4,
      animate: true,
      animationDuration: 300,
    };
  } else if (layoutMode === 'radial') {
    return {
      name: 'concentric',
      concentric: (node: any) => 4 - (node.data('hop') || 1),
      levelWidth: () => 1,
      minNodeSpacing: 60,
      animate: true,
      animationDuration: 300,
    };
  }
  return {
    name: 'dagre',
    rankDir: 'LR',
    nodeSep: 65,
    rankSep: 110,
    animate: true,
    animationDuration: 300,
  };
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graphData,
  isFullScreenView = false,
  transactions,
  onPivotTarget,
  recentAnalyses,
  isLoading = false,
  onStartAnalysis,
  onLoadCase,
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // View & Layout State
  const [layoutMode, setLayoutMode] = useState<LayoutType>('flow');
  const [viewMode, setViewMode] = useState<ViewMode>('NETWORK');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  // Quick Launch Form State (used when canvas is empty)
  const [quickAddress, setQuickAddress] = useState<string>('');
  const [quickHops, setQuickHops] = useState<number>(3);

  // Filter States
  const [selectedHops, setSelectedHops] = useState<Set<number>>(new Set([1, 2, 3]));
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<Set<string>>(
    new Set(['TARGET', 'VASP', 'INTERMEDIARY', 'EXTERNAL'])
  );
  const [selectedToken, setSelectedToken] = useState<string>('ALL');
  const [minAmount, setMinAmount] = useState<number>(0);

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
    return (
      graphData.nodes.find(
        (n: any) => n.data?.role === 'INPUT_WALLET' || n.data?.is_root || n.data?.hop === 0
      )?.data || null
    );
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
    const vaspEndpoints = graphData.nodes.filter(
      (n: any) => n.data?.is_vasp || n.data?.role === 'KNOWN_VASP'
    ).length;
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

  // Path Focus Helper
  const highlightPathToNode = useCallback(
    (targetNode: cytoscape.NodeSingular) => {
      if (!cyRef.current) return;
      const cy = cyRef.current;
      const targetId = targetNode.id();
      const rootId = rootNode?.id || rootAddress;

      if (!rootId || targetId === rootId) {
        cy.elements().removeClass('path-focused path-dimmed');
        setFocusedPath(null);
        return;
      }

      const rootElem = cy.getElementById(rootId);
      if (!rootElem || rootElem.length === 0) {
        return;
      }

      try {
        const dijkstra = cy.elements().dijkstra({
          root: rootElem,
          weight: (edge: any) => 1 / (Number(edge.data('amount') || 1) + 1),
          directed: true,
        });

        const pathToTarget = dijkstra.pathTo(targetNode);

        if (pathToTarget && pathToTarget.length > 0) {
          cy.elements().addClass('path-dimmed').removeClass('path-focused');
          pathToTarget.removeClass('path-dimmed').addClass('path-focused');

          let totalVol = 0;
          const edgeIds = new Set<string>();
          const nodeIds = new Set<string>();

          pathToTarget.forEach((elem: any) => {
            if (elem.isEdge && elem.isEdge()) {
              edgeIds.add(elem.id());
              totalVol += Number(elem.data('amount') || 0);
            } else if (elem.id) {
              nodeIds.add(elem.id());
            }
          });

          setFocusedPath({
            targetNodeId: targetId,
            nodeIds,
            edgeIds,
            totalVolume: totalVol,
            hopDistance: targetNode.data('hop') || 1,
            destinationName: targetNode.data('vaspName'),
          });
        }
      } catch (err) {
        console.warn('Dijkstra pathfinding warning:', err);
      }
    },
    [rootNode, rootAddress]
  );

  // Cytoscape Graph Lifecycle (Build / Rebuild on Data & Filtering changes)
  useEffect(() => {
    if (!containerRef.current || !graphData || !graphData.nodes || graphData.nodes.length === 0) {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
      return;
    }

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const isDarkMode =
      typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const elements: cytoscape.ElementDefinition[] = [];
    const validNodeIds = new Set<string>();
    const seenNodeIds = new Set<string>();
    const seenEdgeIds = new Set<string>();

    // 1. Build Nodes with Filtering & Deduplication
    graphData.nodes.forEach((n: any) => {
      const d = n.data || n;
      const nodeId = String(d.id || d.address || '');
      if (!nodeId || seenNodeIds.has(nodeId)) return;
      seenNodeIds.add(nodeId);

      const isRoot = d.role === 'INPUT_WALLET' || d.is_root || d.hop === 0;
      const isVasp = d.is_vasp || d.role === 'KNOWN_VASP';
      const hop = d.hop ?? 1;

      // Hop filter
      if (!isRoot && !selectedHops.has(hop)) return;

      // Entity type filter
      let entityType = 'EXTERNAL';
      if (isRoot) entityType = 'TARGET';
      else if (isVasp) entityType = 'VASP';
      else if (hop >= 1 && hop <= 3) entityType = 'INTERMEDIARY';

      if (!selectedEntityTypes.has(entityType)) return;

      // View Mode Filtering
      if (viewMode === 'EVIDENCE' && !isRoot && !isVasp && hop > 2) return;

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

    // 2. Build Edges with Filtering & Deduplication
    graphData.edges?.forEach((e: any, idx: number) => {
      const d = e.data || e;
      const src = String(d.source || '');
      const tgt = String(d.target || '');
      const amt = Number(d.amount || 0);
      const sym = (d.asset_symbol || d.token_symbol || 'ETH').toUpperCase();
      const edgeId = String(d.id || `edge-${src}-${tgt}-${idx}`);

      if (seenEdgeIds.has(edgeId)) return;
      seenEdgeIds.add(edgeId);

      if (!validNodeIds.has(src) || !validNodeIds.has(tgt)) return;
      if (selectedToken !== 'ALL' && sym !== selectedToken) return;
      if (minAmount > 0 && amt < minAmount) return;

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

    // 3. Initialize Cytoscape
    const layoutConfig = getLayoutConfig(layoutMode, rootNode?.id);
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: getCytoscapeStylesheet(isDarkMode),
      layout: { name: 'null' },
      boxSelectionEnabled: false,
      autounselectify: false,
      wheelSensitivity: 0.25,
      minZoom: 0.15,
      maxZoom: 3.5,
    });

    // 4. Register Event Handlers
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedElement({ type: 'NODE', data: node.data() });
      if (node.data('isVasp')) {
        highlightPathToNode(node);
      }
    });

    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      setSelectedElement({ type: 'EDGE', data: edge.data() });
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedElement(null);
        cy.elements().removeClass('path-focused path-dimmed replay-active-node replay-active-edge');
        setFocusedPath(null);
      }
    });

    cyRef.current = cy;

    // Run layout with stop callback to guarantee fit and visibility
    const layoutInstance = cy.layout({
      ...layoutConfig,
      stop: () => {
        cy.resize();
        cy.fit(undefined, 40);
      },
    });
    layoutInstance.run();

    // Trigger initial fit after layout finishes
    cy.ready(() => {
      cy.resize();
      cy.fit(undefined, 40);
    });

    // Handle geometry settling in browser flexbox
    const rafId = requestAnimationFrame(() => {
      if (cyRef.current) {
        cyRef.current.resize();
        cyRef.current.fit(undefined, 40);
      }
    });

    const timer = setTimeout(() => {
      if (cyRef.current) {
        cyRef.current.resize();
        cyRef.current.fit(undefined, 40);
      }
    }, 350);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      cy.destroy();
      cyRef.current = null;
    };
  }, [
    graphData,
    viewMode,
    selectedHops,
    selectedEntityTypes,
    selectedToken,
    minAmount,
    highlightPathToNode,
    rootNode,
    isDarkMode,
  ]);

  // Dynamic Layout Switch (Without destroying Cytoscape instance)
  useEffect(() => {
    if (cyRef.current && graphData?.nodes && graphData.nodes.length > 0) {
      const config = getLayoutConfig(layoutMode, rootNode?.id);
      const l = cyRef.current.layout({
        ...config,
        stop: () => {
          if (cyRef.current) {
            cyRef.current.resize();
            cyRef.current.fit(undefined, 40);
          }
        },
      });
      l.run();
    }
  }, [layoutMode, rootNode]);

  // Dynamic Theme Switch Listener (Updates Cytoscape style in-place)
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.style(getCytoscapeStylesheet(isDarkMode)).update();
    }
  }, [isDarkMode]);

  // ResizeObserver on Container to guarantee crisp Cytoscape dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    let didInitialFit = false;
    const ro = new ResizeObserver(() => {
      if (cyRef.current) {
        cyRef.current.resize();
        if (!didInitialFit) {
          cyRef.current.fit(undefined, 40);
          didInitialFit = true;
        }
      }
    });
    ro.observe(containerRef.current);

    const handleWindowResize = () => {
      if (cyRef.current) {
        cyRef.current.resize();
      }
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // Debounced resize when panels or modes change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cyRef.current) {
        cyRef.current.resize();
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [isSidebarOpen, isFullScreen, viewMode]);

  // Escape key listener for fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // Toolbar Handlers
  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.resize();
      cyRef.current.fit(undefined, 40);
    }
  };
  const handleResetLayout = () => {
    if (cyRef.current) {
      const config = getLayoutConfig(layoutMode, rootNode?.id);
      const l = cyRef.current.layout({
        ...config,
        stop: () => {
          if (cyRef.current) {
            cyRef.current.resize();
            cyRef.current.fit(undefined, 40);
          }
        },
      });
      l.run();
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchNode = (query: string) => {
    setSearchQuery(query);
    if (!cyRef.current || !query.trim()) {
      cyRef.current?.elements().removeClass(':selected');
      return;
    }
    const q = query.trim().toLowerCase();
    const cy = cyRef.current;
    const matches = cy.nodes().filter((n: any) => {
      const d = n.data();
      const addr = (d.fullAddress || d.id || '').toLowerCase();
      const vasp = (d.vaspName || '').toLowerCase();
      return addr.includes(q) || vasp.includes(q);
    });

    if (matches.length > 0) {
      const target = matches[0];
      cy.elements().removeClass(':selected');
      target.select();
      cy.animate({
        center: { eles: target },
        zoom: 1.6,
        duration: 250,
      });
      setSelectedElement({ type: 'NODE', data: target.data() });
      if (target.data('isVasp')) {
        highlightPathToNode(target);
      }
    }
  };

  const handleExportPNG = () => {
    if (!cyRef.current) return;
    const isDarkMode =
      typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const pngData = cyRef.current.png({
      full: true,
      bg: isDarkMode ? '#050505' : '#ffffff',
      scale: 2,
    });
    const link = document.createElement('a');
    link.href = pngData;
    link.download = `traceverse_graph_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    if (!graphData) return;
    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `traceverse_graph_topology_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const toggleHopFilter = (hop: number) => {
    setSelectedHops((prev) => {
      const next = new Set(prev);
      if (next.has(hop)) next.delete(hop);
      else next.add(hop);
      return next;
    });
  };

  const toggleEntityType = (type: string) => {
    setSelectedEntityTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const handleClearFilters = () => {
    setSelectedHops(new Set([1, 2, 3]));
    setSelectedEntityTypes(new Set(['TARGET', 'VASP', 'INTERMEDIARY', 'EXTERNAL']));
    setSelectedToken('ALL');
    setMinAmount(0);
  };

  const handleClearReplayHighlight = () => {
    if (cyRef.current) {
      cyRef.current.elements().removeClass('replay-active-edge replay-active-node path-dimmed');
    }
  };

  const hasData = Boolean(graphData && graphData.nodes && graphData.nodes.length > 0);

  return (
    <div
      className={`bg-surface border border-border rounded-xl shadow-vercel flex flex-col overflow-hidden transition-all duration-150 ${
        isFullScreen
          ? 'fixed inset-2 sm:inset-4 z-50 shadow-2xl bg-surface'
          : isFullScreenView
          ? 'h-[calc(100vh-13rem)] min-h-[660px] relative'
          : 'h-[640px] relative'
      }`}
    >
      {/* 1. TOP CONTROL TOOLBAR */}
      <div className="p-3 border-b border-border bg-surface-raised/50 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Left: View Mode Tabs */}
        <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-bg border border-border">
          <button
            onClick={() => setViewMode('NETWORK')}
            className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium transition-all ${
              viewMode === 'NETWORK'
                ? 'bg-surface text-text shadow-sm border border-border'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Network Graph
          </button>
          <button
            onClick={() => setViewMode('FUND_FLOW')}
            className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium transition-all ${
              viewMode === 'FUND_FLOW'
                ? 'bg-surface text-text shadow-sm border border-border'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Sankey Flow
          </button>
          <button
            onClick={() => setViewMode('EVIDENCE')}
            className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium transition-all ${
              viewMode === 'EVIDENCE'
                ? 'bg-surface text-text shadow-sm border border-border'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Evidence Subgraph
          </button>
        </div>

        {/* Center: Layout Switcher & In-Canvas Node Search */}
        {hasData && viewMode === 'NETWORK' && (
          <div className="flex items-center space-x-2">
            <div className="hidden lg:flex items-center space-x-1 bg-bg p-0.5 rounded-lg border border-border font-mono text-[11px]">
              <span className="text-text-dim px-2 text-[10px] uppercase font-semibold">Layout:</span>
              {(['flow', 'force', 'hierarchical', 'radial'] as LayoutType[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLayoutMode(mode)}
                  className={`px-2 py-0.5 rounded-md capitalize transition-all ${
                    layoutMode === mode
                      ? 'bg-surface text-text shadow-sm border border-border font-semibold'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* In-Canvas Search */}
            <div className="relative hidden sm:inline-flex items-center">
              <Search className="h-3.5 w-3.5 absolute left-2.5 text-text-dim pointer-events-none shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchNode(e.target.value)}
                placeholder="Find node or VASP..."
                className="pl-8 pr-7 h-7 bg-bg border border-border rounded-md text-text text-xs font-mono placeholder:text-text-dim focus:outline-none focus:border-accent w-36 md:w-48 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchNode('')}
                  aria-label="Clear search"
                  className="absolute right-1.5 h-4 w-4 text-text-dim hover:text-text inline-flex items-center justify-center shrink-0"
                >
                  <X className="h-3 w-3 shrink-0" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right: Canvas Controls */}
        <div className="inline-flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            disabled={!hasData}
            className={`h-7 px-2 rounded-md border transition-colors inline-flex items-center justify-center gap-1.5 text-xs font-mono disabled:opacity-40 shrink-0 ${
              isSidebarOpen
                ? 'bg-surface text-text border-border'
                : 'bg-bg text-text-muted border-border hover:text-text'
            }`}
            title="Toggle Filter Sidebar"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden md:inline text-[11px] leading-none">Filters</span>
          </button>

          <div className="h-4 w-px bg-border mx-0.5" />

          <button
            onClick={handleZoomIn}
            disabled={!hasData}
            className="h-7 w-7 rounded-md bg-bg hover:bg-surface-raised border border-border text-text-muted hover:text-text transition-colors disabled:opacity-40 inline-flex items-center justify-center shrink-0"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5 shrink-0" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={!hasData}
            className="h-7 w-7 rounded-md bg-bg hover:bg-surface-raised border border-border text-text-muted hover:text-text transition-colors disabled:opacity-40 inline-flex items-center justify-center shrink-0"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5 shrink-0" />
          </button>
          <button
            onClick={handleFit}
            disabled={!hasData}
            className="h-7 px-2 rounded-md bg-bg hover:bg-surface-raised border border-border text-text-muted hover:text-text transition-colors font-mono text-[11px] disabled:opacity-40 inline-flex items-center justify-center shrink-0 leading-none"
            title="Fit to Center"
          >
            Fit
          </button>
          <button
            onClick={handleResetLayout}
            disabled={!hasData}
            className="h-7 w-7 rounded-md bg-bg hover:bg-surface-raised border border-border text-text-muted hover:text-text transition-colors disabled:opacity-40 inline-flex items-center justify-center shrink-0"
            title="Reset Layout"
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
          </button>

          {/* Export Menu */}
          <div className="relative inline-flex items-center">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={!hasData}
              className="h-7 w-7 rounded-md bg-bg hover:bg-surface-raised border border-border text-text-muted hover:text-text transition-colors disabled:opacity-40 inline-flex items-center justify-center shrink-0"
              title="Export Forensic Topology"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-surface border border-border rounded-lg shadow-vercel-lg p-1 z-30 font-mono text-xs">
                <button
                  onClick={handleExportPNG}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-surface-raised text-text flex items-center justify-between"
                >
                  <span>Export PNG</span>
                  <span className="text-[10px] text-text-dim">High-Res</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-surface-raised text-text flex items-center justify-between"
                >
                  <span>Export Topology</span>
                  <span className="text-[10px] text-text-dim">JSON</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={`h-7 w-7 rounded-md border transition-colors inline-flex items-center justify-center shrink-0 ${
              isFullScreen
                ? 'bg-accent text-white border-accent'
                : 'bg-bg hover:bg-surface-raised border-border text-text-muted hover:text-text'
            }`}
            title={isFullScreen ? 'Exit Full Screen (Esc)' : 'Expand Full Screen'}
          >
            {isFullScreen ? <Minimize2 className="h-3.5 w-3.5 shrink-0" /> : <Maximize2 className="h-3.5 w-3.5 shrink-0" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN GRAPH WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* LEFT FILTER SIDEBAR (Responsive drawer on mobile, flex child on md+) */}
        {hasData && isSidebarOpen && (
          <>
            {/* Backdrop on mobile */}
            <div
              className="md:hidden fixed inset-0 bg-black/40 z-20"
              onClick={() => setIsSidebarOpen(false)}
            />

            <div
              className={`border-r border-border bg-surface transition-all duration-200 flex flex-col z-20 overflow-y-auto font-mono text-xs ${
                'w-64 p-4 shrink-0 absolute md:relative inset-y-0 left-0 shadow-2xl md:shadow-none'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="font-semibold text-text uppercase text-[11px] tracking-wider">
                    Graph Filters
                  </span>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="Close sidebar"
                    className="h-6 w-6 rounded text-text-dim hover:text-text hover:bg-surface-hover inline-flex items-center justify-center shrink-0 transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </div>

                {/* HOP DEPTH */}
                <div>
                  <div className="text-[10px] uppercase text-text-dim font-bold mb-2 tracking-wider">
                    Hop Distance
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    {[1, 2, 3].map((hop) => (
                      <label key={hop} className="flex items-center space-x-2 cursor-pointer text-text hover:text-text-muted">
                        <input
                          type="checkbox"
                          checked={selectedHops.has(hop)}
                          onChange={() => toggleHopFilter(hop)}
                          className="rounded border-border text-accent focus:ring-0 h-3.5 w-3.5"
                        />
                        <span>Hop {hop} Counterparties</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* ENTITY TYPES */}
                <div>
                  <div className="text-[10px] uppercase text-text-dim font-bold mb-2 tracking-wider">
                    Entity Types
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    {[
                      { id: 'TARGET', label: 'Target Suspect Wallet', color: 'text-danger' },
                      { id: 'VASP', label: 'VASP Custodial Clusters', color: 'text-accent' },
                      { id: 'INTERMEDIARY', label: 'Intermediary Wallets', color: 'text-text' },
                      { id: 'EXTERNAL', label: 'External Contracts / Unknown', color: 'text-text-dim' },
                    ].map((e) => (
                      <label key={e.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEntityTypes.has(e.id)}
                          onChange={() => toggleEntityType(e.id)}
                          className="rounded border-border text-accent focus:ring-0 h-3.5 w-3.5"
                        />
                        <span className={e.color}>{e.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* ASSET TOKEN FILTER */}
                <div className="space-y-2.5 pt-2 border-t border-border">
                  <div className="text-[10px] uppercase text-text-dim font-bold tracking-wider">
                    Transaction Filters
                  </div>
                  <div>
                    <label className="text-[11px] text-text-dim block mb-1">Asset Token</label>
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-text font-mono text-xs focus:outline-none focus:border-accent"
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
                      <label className="text-[11px] text-text-dim">Minimum Transfer</label>
                      <span className="font-mono text-[10px] text-text">
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
                      className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-text font-mono text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Reset Filters */}
                <div className="pt-2 border-t border-border">
                  <button
                    onClick={handleClearFilters}
                    className="w-full py-1.5 rounded-md bg-surface-raised hover:bg-surface-hover text-text border border-border transition-colors font-mono text-xs inline-flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-text-dim shrink-0" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 3. CYTOSCAPE CANVAS / SANKEY VIEW / EMPTY STATE */}
        {!hasData ? (
          // GRAPH STUDIO QUICK-LAUNCH EMPTY STATE
          <div className="flex-1 bg-bg-canvas p-6 flex flex-col items-center justify-center text-center font-mono">
            <div className="max-w-lg w-full bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-vercel space-y-5">
              <div className="w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center mx-auto text-accent">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Network className="h-6 w-6" />
                )}
              </div>

              <div>
                <h3 className="font-sans font-bold text-base text-text">
                  {isLoading ? 'Tracing Blockchain Topology...' : 'Graph Studio Viewport Ready'}
                </h3>
                <p className="text-xs text-text-dim font-sans mt-1.5 leading-relaxed">
                  {isLoading
                    ? 'Extracting directed transfers, resolving custodial clusters, and running heuristic attribution algorithms...'
                    : 'Enter suspect target wallet address to map multi-hop fund routing, counterparty nodes, and VASP deposit endpoints.'}
                </p>
              </div>

              {/* Direct Search Bar */}
              {onStartAnalysis && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (quickAddress.trim()) {
                      onStartAnalysis(quickAddress.trim(), quickHops);
                    }
                  }}
                  className="space-y-3 pt-1 text-left"
                >
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-2.5 text-text-dim" />
                    <input
                      type="text"
                      value={quickAddress}
                      onChange={(e) => setQuickAddress(e.target.value)}
                      placeholder="0x... or Tron address"
                      className="w-full pl-9 pr-3 py-2 bg-bg border border-border rounded-lg text-text font-mono text-xs focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={quickHops}
                      onChange={(e) => setQuickHops(Number(e.target.value))}
                      className="bg-bg border border-border rounded-lg px-3 py-2 text-text font-mono text-xs focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value={1}>1 Hop (Direct)</option>
                      <option value={2}>2 Hops (Intermediary)</option>
                      <option value={3}>3 Hops (Full Audit)</option>
                    </select>

                    <button
                      type="submit"
                      disabled={isLoading || !quickAddress.trim()}
                      className="flex-1 py-2 bg-text text-bg hover:opacity-90 disabled:opacity-40 rounded-lg font-sans font-medium text-xs flex items-center justify-center space-x-1.5 transition-opacity"
                    >
                      <span>Trace Target</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              )}

              {/* Or load recent case */}
              {recentAnalyses && recentAnalyses.length > 0 && onStartAnalysis && (
                <div className="pt-3 border-t border-border text-left space-y-2">
                  <div className="text-[10px] text-text-dim uppercase font-bold tracking-wider">
                    Or Load Investigation from Register:
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {recentAnalyses.slice(0, 3).map((r, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (onLoadCase && r.analysis_id && r.status === 'COMPLETED') {
                            onLoadCase(r.analysis_id);
                          } else if (onStartAnalysis) {
                            onStartAnalysis(r.wallet_address, 3);
                          }
                        }}
                        className="w-full p-2 rounded-lg bg-surface-raised hover:bg-surface-hover border border-border/80 text-left flex items-center justify-between text-[11px] transition-colors"
                      >
                        <span className="font-bold text-text truncate max-w-[200px]">
                          {r.wallet_address.slice(0, 10)}...{r.wallet_address.slice(-6)}
                        </span>
                        <span className="text-[10px] text-accent font-sans font-medium">Load →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : viewMode === 'FUND_FLOW' ? (
          <div className="flex-1 bg-bg h-full overflow-hidden min-h-0">
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
          <div className="flex-1 relative bg-bg-canvas h-full flex flex-col min-h-0">
            {/* CYTOSCAPE CONTAINER */}
            <div className="relative flex-1 w-full h-full min-h-[420px] overflow-hidden">
              <div ref={containerRef} className="absolute inset-0 w-full h-full" />
            </div>

            {/* Timeline Replay Bar */}
            {transactions && transactions.length > 0 && (
              <div className="p-3 border-t border-border bg-surface/95 z-10 shrink-0">
                <TimelineReplayBar
                  transactions={transactions}
                  onClearReplay={handleClearReplayHighlight}
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
                      return (
                        (s === src && t === dst) ||
                        (e.data('txHash') &&
                          e.data('txHash').toLowerCase() === tx.tx_hash.toLowerCase())
                      );
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

            {/* Active Path Focus Banner */}
            {focusedPath && (
              <div className="absolute bottom-20 left-4 z-10 p-3 rounded-lg bg-surface/95 border border-accent/40 shadow-vercel-lg backdrop-blur-md font-mono text-xs max-w-md animate-in fade-in duration-150">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="inline-flex items-center gap-1.5 text-accent font-semibold">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse shrink-0" />
                    <span>PRIMARY FUND FLOW FOCUS</span>
                  </div>
                  <button
                    onClick={() => {
                      cyRef.current?.elements().removeClass('path-focused path-dimmed');
                      setFocusedPath(null);
                    }}
                    aria-label="Close path focus"
                    className="text-text-dim hover:text-text h-5 w-5 rounded inline-flex items-center justify-center shrink-0"
                  >
                    <X className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </div>
                <div className="text-[11px] text-text-muted space-y-1">
                  <div>
                    Destination:{' '}
                    <strong className="text-text">
                      {focusedPath.destinationName || focusedPath.targetNodeId.slice(0, 10) + '...'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Hop: <strong>{focusedPath.hopDistance}</strong></span>
                    <span>Volume: <strong className="text-accent">{focusedPath.totalVolume.toFixed(2)} {graphMetrics.primaryToken}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. RIGHT FORENSIC INSPECTOR DRAWER (Responsive drawer on mobile/tablet) */}
        {selectedElement && (
          <>
            {/* Backdrop on small screens */}
            <div
              className="lg:hidden fixed inset-0 bg-black/40 z-20"
              onClick={() => setSelectedElement(null)}
            />

            <div className="w-80 border-l border-border bg-surface p-4 overflow-y-auto z-30 flex flex-col justify-between text-xs font-sans shadow-vercel absolute lg:relative inset-y-0 right-0 animate-in slide-in-from-right duration-150 shrink-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="inline-flex items-center gap-2 font-mono font-bold text-text uppercase text-[11px]">
                    <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
                    <span>{selectedElement.type === 'NODE' ? 'Node Forensics' : 'Transfer Details'}</span>
                  </div>
                  <button
                    onClick={() => setSelectedElement(null)}
                    aria-label="Close inspector"
                    className="text-text-dim hover:text-text h-7 w-7 rounded-md inline-flex items-center justify-center shrink-0 hover:bg-surface-hover transition-colors"
                  >
                    <X className="h-4 w-4 shrink-0" />
                  </button>
                </div>

                {/* NODE DETAILS */}
                {selectedElement.type === 'NODE' && (
                  <div className="space-y-3 font-mono text-[11px]">
                    <div>
                      <div className="text-text-dim text-[10px] uppercase font-medium">Cryptocurrency Address</div>
                      <div className="flex items-center justify-between p-2 rounded-md bg-bg border border-border mt-1">
                        <span className="font-bold text-text break-all text-[11px]">
                          {selectedElement.data.fullAddress || selectedElement.data.id}
                        </span>
                        <button
                          onClick={() => handleCopy(selectedElement.data.fullAddress || selectedElement.data.id)}
                          className="ml-2 h-6 w-6 rounded inline-flex items-center justify-center text-text-dim hover:text-text transition-colors shrink-0"
                          title="Copy Address"
                        >
                          {copied ? <Check className="h-3.5 w-3.5 text-verified shrink-0" /> : <Copy className="h-3.5 w-3.5 shrink-0" />}
                        </button>
                      </div>
                    </div>

                    {selectedElement.data.isVasp && (
                      <div className="p-3 rounded-lg bg-accent/10 border border-accent/25 text-[11px] space-y-1">
                        <div className="text-accent font-bold">
                          {selectedElement.data.vaspName} ({selectedElement.data.addressType})
                        </div>
                        <div className="text-text-dim text-[10px]">
                          Provenance: Verified Proof of Reserves / Etherscan Label
                        </div>
                      </div>
                    )}

                    <div className="p-3 rounded-lg bg-bg border border-border space-y-1.5 font-mono text-[11px]">
                      <div className="text-[10px] uppercase text-text-dim font-bold font-sans">
                        Topological Flow Metrics
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-dim">Hop Distance:</span>
                        <span className="text-text font-bold">Hop {selectedElement.data.hop}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-dim">Total Inflow:</span>
                        <span className="text-verified font-bold">
                          {Number(selectedElement.data.totalInflow || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-dim">Total Outflow:</span>
                        <span className="text-danger font-bold">
                          {Number(selectedElement.data.totalOutflow || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-dim">Transactions:</span>
                        <span className="text-text">{selectedElement.data.txCount || 0} Transfers</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 font-sans">
                      <a
                        href={`https://etherscan.io/address/${selectedElement.data.fullAddress || selectedElement.data.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-surface-raised hover:bg-surface-hover border border-border text-text font-medium text-xs transition-colors shrink-0"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        <span>View on Public Explorer</span>
                      </a>

                      {onPivotTarget && (
                        <button
                          onClick={() => onPivotTarget(selectedElement.data.fullAddress || selectedElement.data.id)}
                          className="w-full py-2 rounded-lg bg-text text-bg hover:opacity-90 font-medium text-xs inline-flex items-center justify-center gap-1.5 shadow-sm transition-opacity shrink-0"
                        >
                          <Share2 className="h-3.5 w-3.5 shrink-0" />
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
                      <div className="text-text-dim text-[10px] uppercase font-medium">Transaction Hash</div>
                      <div className="p-2 rounded-md bg-bg border border-border mt-1 break-all text-text font-semibold">
                        {selectedElement.data.txHash || selectedElement.data.id}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-bg border border-border space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-text-dim">Amount:</span>
                        <span className="text-text font-bold">
                          {selectedElement.data.amount} {selectedElement.data.tokenSymbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-dim">Hop Level:</span>
                        <span className="text-text font-bold">Hop {selectedElement.data.hop}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
