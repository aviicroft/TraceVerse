'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Database,
  FileText,
  Search,
  ListFilter,
  Sun,
  Moon,
  Scale,
  Network,
  BrainCircuit,
  Radar,
  BookOpen,
<<<<<<< Updated upstream
  Menu,
  X,
  ChevronDown,
  Activity,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Badge } from './ui/Badge';
=======
} from 'lucide-react';
>>>>>>> Stashed changes

export type ActiveTabType =
  | 'WORKSPACE'
  | 'CANDIDATE_DISCOVERY'
  | 'GRAPH_STUDIO'
  | 'NCRP_TRIAGE'
  | 'VASP_REGISTRY'
  | 'LEGAL_STUDIO'
  | 'METHODOLOGY';

interface NavbarProps {
  activeTab: ActiveTabType;
  onSelectTab: (tab: ActiveTabType) => void;
  onOpenMLEval?: () => void;
  onOpenDatasetStatus?: () => void;
  caseCount?: number;
  hasActiveTarget?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMLEval,
  onOpenDatasetStatus,
  caseCount = 4,
  hasActiveTarget = false,
}) => {
<<<<<<< Updated upstream
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  const intelligenceRef = useRef<HTMLDivElement>(null);
  const reportsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        intelligenceRef.current &&
        !intelligenceRef.current.contains(event.target as Node)
      ) {
        setIntelligenceOpen(false);
      }
      if (
        reportsRef.current &&
        !reportsRef.current.contains(event.target as Node)
      ) {
        setReportsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary 4 tabs
  const primaryTabs: { id: ActiveTabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'WORKSPACE',
      label: 'Target Workspace',
      icon: <Search className="h-4 w-4 shrink-0" />,
    },
    {
      id: 'GRAPH_STUDIO',
      label: 'Graph Studio',
      icon: <Network className="h-4 w-4 shrink-0" />,
      badge: hasActiveTarget ? 'Active' : undefined,
    },
    {
      id: 'CANDIDATE_DISCOVERY',
      label: 'Candidate Radar',
      icon: <Radar className="h-4 w-4 shrink-0" />,
    },
    {
      id: 'NCRP_TRIAGE',
      label: 'NCRP Queue',
      icon: <ListFilter className="h-4 w-4 shrink-0" />,
      badge: `${caseCount}`,
    },
  ];

  const isIntelligenceActive = activeTab === 'VASP_REGISTRY';
  const isReportsActive = activeTab === 'LEGAL_STUDIO' || activeTab === 'METHODOLOGY';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md select-none transition-colors">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Desktop Navigation */}
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/" className="inline-flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-accent text-white inline-flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105 shrink-0">
              <Shield className="h-4 w-4 shrink-0" />
            </div>
            <div className="flex flex-col">
              <div className="inline-flex items-center gap-2">
                <span className="font-bold text-text text-sm tracking-tight font-sans">
                  Trace<span className="text-text-muted font-normal">Verse</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-raised border border-border text-text-muted font-mono font-medium">
                  v2.0
                </span>
              </div>
=======
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Check initial preference from localStorage or default dark
    const stored = localStorage.getItem('TRACEVERSE_theme');
    if (stored === 'light') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      localStorage.setItem('TRACEVERSE_theme', 'light');
      document.documentElement.classList.remove('dark');
    } else {
      setTheme('dark');
      localStorage.setItem('TRACEVERSE_theme', 'dark');
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <header className="border-b border-forensic-border bg-forensic-surface sticky top-0 z-40 text-xs select-none transition-colors">
      {/* Main Workstation Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between py-2.5">
        {/* Left: Branding & Core Navigation */}
        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-2.5 pr-4 border-r border-forensic-border">
            <div className="h-7 w-7 rounded bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 leading-none">
                <span className="font-bold text-forensic-text tracking-wider text-sm">
                  TRACE<span className="text-blue-500">VERSE</span>
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-forensic-surfaceRaised border border-forensic-border text-forensic-textMuted font-mono uppercase">
                  v1.2
                </span>
              </div>
              <span className="text-[10px] text-forensic-textDim tracking-tight block mt-0.5">
                Financial Intelligence Workstation
              </span>
>>>>>>> Stashed changes
            </div>
          </Link>

<<<<<<< Updated upstream
          {/* Desktop Navigation Bar (Visible on lg+) */}
          <nav className="hidden lg:inline-flex items-center gap-1 p-1 rounded-xl bg-surface-raised/70 border border-border/80 shrink-0">
            {primaryTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-accent-subtle text-text border border-accent/30 font-semibold shadow-sm'
                      : 'text-text-muted hover:text-text hover:bg-surface-hover/60 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block shrink-0" />
                  )}
                  <span className={`inline-flex items-center justify-center shrink-0 ${isActive ? 'text-accent' : 'opacity-75'}`}>
                    {tab.icon}
                  </span>
                  <span className="leading-none whitespace-nowrap">{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium shrink-0 ${
                        tab.id === 'GRAPH_STUDIO'
                          ? 'bg-accent/15 text-accent border border-accent/30'
                          : 'bg-surface border border-border text-text-muted'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Intelligence Dropdown Menu */}
            <div className="relative inline-flex" ref={intelligenceRef}>
              <button
                onClick={() => {
                  setIntelligenceOpen(!intelligenceOpen);
                  setReportsOpen(false);
                }}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1.5 shrink-0 ${
                  isIntelligenceActive
                    ? 'bg-accent-subtle text-text border border-accent/30 font-semibold shadow-sm'
                    : intelligenceOpen
                    ? 'bg-surface-hover text-text border border-border'
                    : 'text-text-muted hover:text-text hover:bg-surface-hover/60 border border-transparent'
                }`}
                aria-expanded={intelligenceOpen}
              >
                {isIntelligenceActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block shrink-0" />
                )}
                <BrainCircuit className="h-4 w-4 opacity-75 shrink-0" />
                <span className="leading-none whitespace-nowrap">Intelligence</span>
                <ChevronDown
                  className={`h-3 w-3 shrink-0 opacity-70 transition-transform duration-150 ${
                    intelligenceOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {intelligenceOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 p-1.5 rounded-xl bg-surface border border-border shadow-panel-elevated z-50 animate-in fade-in-50 zoom-in-95 duration-100 flex flex-col gap-1">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-text-muted border-b border-border/60 mb-0.5">
                    Intelligence Directories
                  </div>

                  <button
                    onClick={() => {
                      onSelectTab('VASP_REGISTRY');
                      setIntelligenceOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-left text-xs font-medium transition-all inline-flex items-center gap-2.5 ${
                      activeTab === 'VASP_REGISTRY'
                        ? 'bg-surface-raised text-text font-semibold border border-border'
                        : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                    }`}
                  >
                    <Database className="h-4 w-4 text-accent shrink-0" />
                    <div>
                      <div className="leading-tight">VASP Registry</div>
                      <div className="text-[11px] text-text-muted font-normal">Curated exchange clusters</div>
                    </div>
                  </button>

                  {onOpenMLEval && (
                    <button
                      onClick={() => {
                        onOpenMLEval();
                        setIntelligenceOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-lg text-left text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-hover transition-all inline-flex items-center gap-2.5"
                    >
                      <BrainCircuit className="h-4 w-4 text-verified shrink-0" />
                      <div>
                        <div className="leading-tight">ML Benchmarks</div>
                        <div className="text-[11px] text-text-muted font-normal">Hybrid ensemble metrics</div>
                      </div>
                    </button>
                  )}

                  {onOpenDatasetStatus && (
                    <button
                      onClick={() => {
                        onOpenDatasetStatus();
                        setIntelligenceOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-lg text-left text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-hover transition-all inline-flex items-center gap-2.5"
                    >
                      <Layers className="h-4 w-4 text-info shrink-0" />
                      <div>
                        <div className="leading-tight">100K Dataset</div>
                        <div className="text-[11px] text-text-muted font-normal">Ingestion pipeline status</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Reports & Legal Dropdown Menu */}
            <div className="relative inline-flex" ref={reportsRef}>
              <button
                onClick={() => {
                  setReportsOpen(!reportsOpen);
                  setIntelligenceOpen(false);
                }}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1.5 shrink-0 ${
                  isReportsActive
                    ? 'bg-accent-subtle text-text border border-accent/30 font-semibold shadow-sm'
                    : reportsOpen
                    ? 'bg-surface-hover text-text border border-border'
                    : 'text-text-muted hover:text-text hover:bg-surface-hover/60 border border-transparent'
                }`}
                aria-expanded={reportsOpen}
              >
                {isReportsActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block shrink-0" />
                )}
                <FileText className="h-4 w-4 opacity-75 shrink-0" />
                <span className="leading-none whitespace-nowrap">Reports</span>
                <ChevronDown
                  className={`h-3 w-3 shrink-0 opacity-70 transition-transform duration-150 ${
                    reportsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {reportsOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 p-1.5 rounded-xl bg-surface border border-border shadow-panel-elevated z-50 animate-in fade-in-50 zoom-in-95 duration-100 flex flex-col gap-1">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-text-muted border-b border-border/60 mb-0.5">
                    Reporting & Statutory
                  </div>

                  <button
                    onClick={() => {
                      onSelectTab('LEGAL_STUDIO');
                      setReportsOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-left text-xs font-medium transition-all inline-flex items-center gap-2.5 ${
                      activeTab === 'LEGAL_STUDIO'
                        ? 'bg-surface-raised text-text font-semibold border border-border'
                        : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                    }`}
                  >
                    <Scale className="h-4 w-4 text-danger shrink-0" />
                    <div>
                      <div className="leading-tight">Sec 91 Freeze Order</div>
                      <div className="text-[11px] text-text-muted font-normal">CrPC requisition generator</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('METHODOLOGY');
                      setReportsOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-left text-xs font-medium transition-all inline-flex items-center gap-2.5 ${
                      activeTab === 'METHODOLOGY'
                        ? 'bg-surface-raised text-text font-semibold border border-border'
                        : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                    }`}
                  >
                    <FileCheck2 className="h-4 w-4 text-verified shrink-0" />
                    <div>
                      <div className="leading-tight">Audit Methodology</div>
                      <div className="text-[11px] text-text-muted font-normal">Heuristics & provenance</div>
                    </div>
                  </button>
                </div>
=======
          {/* Operational View Switcher Tabs */}
          <nav className="flex items-center space-x-1 font-mono text-xs">
            <button
              onClick={() => onSelectTab('WORKSPACE')}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'WORKSPACE'
                  ? 'bg-forensic-surfaceRaised text-forensic-text border border-forensic-border font-bold shadow-sm'
                  : 'text-forensic-textMuted hover:text-forensic-text hover:bg-forensic-surfaceRaised/50'
              }`}
            >
              <Search className="h-3.5 w-3.5 text-blue-500" />
              <span>Target Workspace</span>
            </button>

            <button
              onClick={() => onSelectTab('CANDIDATE_DISCOVERY')}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'CANDIDATE_DISCOVERY'
                  ? 'bg-forensic-surfaceRaised text-forensic-text border border-forensic-border font-bold shadow-sm'
                  : 'text-forensic-textMuted hover:text-forensic-text hover:bg-forensic-surfaceRaised/50'
              }`}
            >
              <Radar className="h-3.5 w-3.5 text-blue-400" />
              <span>Candidate Discovery</span>
            </button>

            <button
              onClick={() => onSelectTab('GRAPH_STUDIO')}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'GRAPH_STUDIO'
                  ? 'bg-forensic-surfaceRaised text-forensic-text border border-forensic-border font-bold shadow-sm'
                  : 'text-forensic-textMuted hover:text-forensic-text hover:bg-forensic-surfaceRaised/50'
              }`}
            >
              <Network className="h-3.5 w-3.5 text-forensic-teal" />
              <span>Graph Studio</span>
              {hasActiveTarget && (
                <span className="w-1.5 h-1.5 rounded-full bg-forensic-teal animate-pulse" />
>>>>>>> Stashed changes
              )}
            </div>
          </nav>
        </div>

<<<<<<< Updated upstream
        {/* Right: Actions, Utilities & Theme Switcher */}
        <div className="inline-flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Network Indicator */}
          <div className="hidden xl:inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-raised border border-border text-xs text-text-secondary font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse shrink-0" />
            <span className="whitespace-nowrap">EVM + TRON MAINNET</span>
          </div>

          <a
            href="/docs"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-hover text-text border border-border transition-colors text-xs font-medium"
            title="Judge Technical Documentation"
          >
            <BookOpen className="h-3.5 w-3.5 text-warning shrink-0" />
            <span>Judge Docs</span>
          </a>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-8 h-8 rounded-lg bg-surface-raised hover:bg-surface-hover border border-border text-text inline-flex items-center justify-center transition-colors shrink-0"
=======
        {/* Right: Active Network Badge & Theme Toggle */}
        <div className="flex items-center space-x-3">
          {onOpenDatasetStatus && (
            <button
              onClick={onOpenDatasetStatus}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-forensic-teal border border-teal-500/30 transition-colors font-mono text-[11px]"
              title="View 100K+ Blockchain Dataset Ingestion Intelligence"
            >
              <Database className="h-3.5 w-3.5" />
              <span>100K Dataset</span>
            </button>
          )}

          {onOpenMLEval && (
            <button
              onClick={onOpenMLEval}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-colors font-mono text-[11px]"
              title="View Offline ML Evaluation & Benchmark Diagnostics"
            >
              <BrainCircuit className="h-3.5 w-3.5" />
              <span>ML Evaluation</span>
            </button>
          )}

          <a
            href="/docs"
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors font-mono text-[11px]"
            title="Open Judge Documentation & Technical Dossier (/docs)"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Judge Docs</span>
          </a>

          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded bg-forensic-surfaceRaised border border-forensic-border text-[11px] text-forensic-textMuted font-mono">
            <Activity className="h-3 w-3 text-forensic-teal animate-pulse" />
            <span>EVM + TRON TRC-20</span>
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-forensic-surfaceRaised hover:bg-forensic-border text-forensic-text border border-forensic-border transition-colors font-sans text-xs"
>>>>>>> Stashed changes
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-warning shrink-0" />
            ) : (
              <Moon className="h-4 w-4 text-text-muted shrink-0" />
            )}
          </button>
<<<<<<< Updated upstream

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="lg:hidden w-8 h-8 rounded-lg bg-surface-raised hover:bg-surface-hover border border-border text-text inline-flex items-center justify-center transition-colors shrink-0"
          >
            {mobileMenuOpen ? <X className="h-4 w-4 shrink-0" /> : <Menu className="h-4 w-4 shrink-0" />}
          </button>
        </div>
      </div>

      {/* Tablet Sub-Navigation Bar (768px - 1023px) */}
      <div className="hidden md:flex lg:hidden border-t border-border bg-surface-raised/50">
        <div className="w-full max-w-[1700px] mx-auto px-4 py-1.5 overflow-x-auto gap-1.5 scrollbar-none flex items-center">
          {primaryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium transition-all inline-flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-accent-subtle text-text border border-accent/30 font-semibold shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-surface-hover'
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block shrink-0" />}
                <span className={`inline-flex items-center justify-center shrink-0 ${isActive ? 'text-accent' : ''}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => onSelectTab('VASP_REGISTRY')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium transition-all inline-flex items-center gap-1.5 shrink-0 ${
              activeTab === 'VASP_REGISTRY'
                ? 'bg-accent-subtle text-text border border-accent/30 font-semibold shadow-sm'
                : 'text-text-muted hover:text-text hover:bg-surface-hover'
            }`}
          >
            <Database className="h-3.5 w-3.5 shrink-0" />
            <span>VASP Registry</span>
          </button>
          <button
            onClick={() => onSelectTab('LEGAL_STUDIO')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium transition-all inline-flex items-center gap-1.5 shrink-0 ${
              activeTab === 'LEGAL_STUDIO'
                ? 'bg-accent-subtle text-text border border-accent/30 font-semibold shadow-sm'
                : 'text-text-muted hover:text-text hover:bg-surface-hover'
            }`}
          >
            <Scale className="h-3.5 w-3.5 text-danger shrink-0" />
            <span>Sec 91 Freeze</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Visible below lg when toggled) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-surface p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {primaryTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onSelectTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-lg text-left text-xs font-medium transition-all inline-flex items-center gap-2.5 border ${
                    isActive
                      ? 'bg-accent-subtle text-text border-accent/40 font-semibold'
                      : 'bg-surface-raised text-text-secondary border-border hover:border-border-hover'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                  <span className={`inline-flex items-center justify-center shrink-0 ${isActive ? 'text-accent' : ''}`}>
                    {tab.icon}
                  </span>
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                onSelectTab('VASP_REGISTRY');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-left text-xs font-medium transition-all inline-flex items-center gap-2.5 border ${
                activeTab === 'VASP_REGISTRY'
                  ? 'bg-accent-subtle text-text border-accent/40 font-semibold'
                  : 'bg-surface-raised text-text-secondary border-border hover:border-border-hover'
              }`}
            >
              <Database className="h-4 w-4 text-accent shrink-0" />
              <span>VASP Registry</span>
            </button>
            <button
              onClick={() => {
                onSelectTab('LEGAL_STUDIO');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-left text-xs font-medium transition-all inline-flex items-center gap-2.5 border ${
                activeTab === 'LEGAL_STUDIO'
                  ? 'bg-accent-subtle text-text border-accent/40 font-semibold'
                  : 'bg-surface-raised text-text-secondary border-border hover:border-border-hover'
              }`}
            >
              <Scale className="h-4 w-4 text-danger shrink-0" />
              <span>Sec 91 Freeze Order</span>
            </button>
          </div>

          <div className="pt-2 border-t border-border flex items-center gap-2 text-xs">
            {onOpenDatasetStatus && (
              <button
                onClick={() => {
                  onOpenDatasetStatus();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 p-2 rounded-lg bg-surface-raised border border-border text-center text-text inline-flex items-center justify-center gap-1.5"
              >
                <Layers className="h-3.5 w-3.5 text-info shrink-0" />
                <span>100K Dataset</span>
              </button>
            )}
            {onOpenMLEval && (
              <button
                onClick={() => {
                  onOpenMLEval();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 p-2 rounded-lg bg-surface-raised border border-border text-center text-text inline-flex items-center justify-center gap-1.5"
              >
                <BrainCircuit className="h-3.5 w-3.5 text-verified shrink-0" />
                <span>ML Eval</span>
              </button>
            )}
            <a
              href="/docs"
              className="flex-1 p-2 rounded-lg bg-surface-raised border border-border text-center text-text inline-flex items-center justify-center gap-1.5"
            >
              <BookOpen className="h-3.5 w-3.5 text-warning shrink-0" />
              <span>Docs</span>
            </a>
          </div>
        </div>
      )}
=======
        </div>
      </div>
>>>>>>> Stashed changes
    </header>
  );
};
