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
  Menu,
  X,
  ChevronDown,
  Activity,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Badge } from './ui/Badge';

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
            </div>
          </Link>

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
              )}
            </div>
          </nav>
        </div>

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
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-surface-raised hover:bg-surface-hover border border-border text-text inline-flex items-center justify-center transition-colors shrink-0"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-warning shrink-0" />
            ) : (
              <Moon className="h-4 w-4 text-text-muted shrink-0" />
            )}
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="lg:hidden w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-surface-raised hover:bg-surface-hover border border-border text-text inline-flex items-center justify-center transition-colors shrink-0"
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

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-150"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer (Visible below lg when toggled) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface p-4 pb-safe space-y-3 rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              <span className="font-bold text-text text-sm">Navigation Menu</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

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
                  className={`p-3 rounded-xl text-left text-xs font-medium transition-all inline-flex items-center gap-3 border min-h-[48px] ${
                    isActive
                      ? 'bg-accent-subtle text-text border-accent/40 font-semibold shadow-sm'
                      : 'bg-surface-raised text-text-secondary border-border hover:border-border-hover'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                  <span className={`inline-flex items-center justify-center shrink-0 ${isActive ? 'text-accent' : ''}`}>
                    {tab.icon}
                  </span>
                  <span className="truncate flex-1">{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border font-mono text-accent">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => {
                onSelectTab('VASP_REGISTRY');
                setMobileMenuOpen(false);
              }}
              className={`p-3 rounded-xl text-left text-xs font-medium transition-all inline-flex items-center gap-3 border min-h-[48px] ${
                activeTab === 'VASP_REGISTRY'
                  ? 'bg-accent-subtle text-text border-accent/40 font-semibold shadow-sm'
                  : 'bg-surface-raised text-text-secondary border-border hover:border-border-hover'
              }`}
            >
              <Database className="h-4 w-4 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="truncate font-semibold">VASP Registry</div>
                <div className="text-[11px] text-text-muted truncate">Verified exchange clusters</div>
              </div>
            </button>
            <button
              onClick={() => {
                onSelectTab('LEGAL_STUDIO');
                setMobileMenuOpen(false);
              }}
              className={`p-3 rounded-xl text-left text-xs font-medium transition-all inline-flex items-center gap-3 border min-h-[48px] ${
                activeTab === 'LEGAL_STUDIO'
                  ? 'bg-accent-subtle text-text border-accent/40 font-semibold shadow-sm'
                  : 'bg-surface-raised text-text-secondary border-border hover:border-border-hover'
              }`}
            >
              <Scale className="h-4 w-4 text-danger shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="truncate font-semibold">Sec 91 Freeze Order</div>
                <div className="text-[11px] text-text-muted truncate">CrPC requisition generator</div>
              </div>
            </button>
            <button
              onClick={() => {
                onSelectTab('METHODOLOGY');
                setMobileMenuOpen(false);
              }}
              className={`p-3 rounded-xl text-left text-xs font-medium transition-all inline-flex items-center gap-3 border min-h-[48px] ${
                activeTab === 'METHODOLOGY'
                  ? 'bg-accent-subtle text-text border-accent/40 font-semibold shadow-sm'
                  : 'bg-surface-raised text-text-secondary border-border hover:border-border-hover'
              }`}
            >
              <FileCheck2 className="h-4 w-4 text-verified shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="truncate font-semibold">Audit Methodology</div>
                <div className="text-[11px] text-text-muted truncate">Heuristics & data provenance</div>
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-border grid grid-cols-3 gap-2 text-xs">
            {onOpenDatasetStatus && (
              <button
                onClick={() => {
                  onOpenDatasetStatus();
                  setMobileMenuOpen(false);
                }}
                className="min-h-[44px] p-2.5 rounded-xl bg-surface-raised border border-border text-center text-text inline-flex items-center justify-center gap-1.5"
              >
                <Layers className="h-4 w-4 text-info shrink-0" />
                <span className="truncate">100K Data</span>
              </button>
            )}
            {onOpenMLEval && (
              <button
                onClick={() => {
                  onOpenMLEval();
                  setMobileMenuOpen(false);
                }}
                className="min-h-[44px] p-2.5 rounded-xl bg-surface-raised border border-border text-center text-text inline-flex items-center justify-center gap-1.5"
              >
                <BrainCircuit className="h-4 w-4 text-verified shrink-0" />
                <span className="truncate">ML Eval</span>
              </button>
            )}
            <a
              href="/docs"
              className="min-h-[44px] p-2.5 rounded-xl bg-surface-raised border border-border text-center text-text inline-flex items-center justify-center gap-1.5"
            >
              <BookOpen className="h-4 w-4 text-warning shrink-0" />
              <span className="truncate">Docs</span>
            </a>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar (< 768px) */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 border-t border-border backdrop-blur-lg pb-safe shadow-2xl">
        <div className="grid grid-cols-5 h-14 items-center">
          <button
            onClick={() => onSelectTab('WORKSPACE')}
            className={`flex flex-col items-center justify-center h-full gap-1 transition-colors ${
              activeTab === 'WORKSPACE' ? 'text-accent font-semibold' : 'text-text-muted hover:text-text'
            }`}
          >
            <Search className="h-4 w-4" />
            <span className="text-[10px] leading-none">Target</span>
          </button>

          <button
            onClick={() => onSelectTab('GRAPH_STUDIO')}
            className={`flex flex-col items-center justify-center h-full gap-1 relative transition-colors ${
              activeTab === 'GRAPH_STUDIO' ? 'text-accent font-semibold' : 'text-text-muted hover:text-text'
            }`}
          >
            <Network className="h-4 w-4" />
            <span className="text-[10px] leading-none">Graph</span>
            {hasActiveTarget && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent absolute top-2 right-4" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('CANDIDATE_DISCOVERY')}
            className={`flex flex-col items-center justify-center h-full gap-1 transition-colors ${
              activeTab === 'CANDIDATE_DISCOVERY' ? 'text-accent font-semibold' : 'text-text-muted hover:text-text'
            }`}
          >
            <Radar className="h-4 w-4" />
            <span className="text-[10px] leading-none">Radar</span>
          </button>

          <button
            onClick={() => onSelectTab('NCRP_TRIAGE')}
            className={`flex flex-col items-center justify-center h-full gap-1 relative transition-colors ${
              activeTab === 'NCRP_TRIAGE' ? 'text-accent font-semibold' : 'text-text-muted hover:text-text'
            }`}
          >
            <ListFilter className="h-4 w-4" />
            <span className="text-[10px] leading-none">NCRP</span>
            {caseCount > 0 && (
              <span className="text-[9px] px-1 bg-warning/20 text-warning border border-warning/30 rounded-full absolute top-1.5 right-3 font-mono">
                {caseCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center h-full gap-1 transition-colors ${
              mobileMenuOpen || isIntelligenceActive || isReportsActive ? 'text-accent font-semibold' : 'text-text-muted hover:text-text'
            }`}
          >
            <Menu className="h-4 w-4" />
            <span className="text-[10px] leading-none">More</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
