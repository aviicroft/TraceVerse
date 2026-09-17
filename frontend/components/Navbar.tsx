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
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

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
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close "More" dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Primary navigation tabs (always shown in desktop bar)
  const primaryTabs: { id: ActiveTabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'WORKSPACE',
      label: 'Target Workspace',
      icon: <Search className="h-3.5 w-3.5 shrink-0" />,
    },
    {
      id: 'CANDIDATE_DISCOVERY',
      label: 'Candidate Radar',
      icon: <Radar className="h-3.5 w-3.5 text-accent shrink-0" />,
    },
    {
      id: 'GRAPH_STUDIO',
      label: 'Graph Studio',
      icon: <Network className="h-3.5 w-3.5 shrink-0" />,
      badge: hasActiveTarget ? 'Active' : undefined,
    },
    {
      id: 'NCRP_TRIAGE',
      label: 'NCRP Queue',
      icon: <ListFilter className="h-3.5 w-3.5 shrink-0" />,
      badge: `${caseCount}`,
    },
  ];

  // Secondary navigation tabs (collapsible into More dropdown on lg/xl, direct on 2xl)
  const secondaryTabs: { id: ActiveTabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'VASP_REGISTRY',
      label: 'VASP Registry',
      icon: <Database className="h-3.5 w-3.5 shrink-0" />,
    },
    {
      id: 'LEGAL_STUDIO',
      label: 'Sec 91 Freeze Order',
      icon: <Scale className="h-3.5 w-3.5 text-danger shrink-0" />,
    },
    {
      id: 'METHODOLOGY',
      label: 'Methodology',
      icon: <FileText className="h-3.5 w-3.5 shrink-0" />,
    },
  ];

  const allTabs = [...primaryTabs, ...secondaryTabs];
  const activeSecondaryTab = secondaryTabs.find((t) => t.id === activeTab);
  const isSecondaryActive = !!activeSecondaryTab;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md text-xs select-none transition-colors">
      <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-4 lg:px-6 flex items-center justify-between h-14 gap-2 sm:gap-4 min-w-0">
        {/* Left: Brand Identity & Desktop Navigation */}
        <div className="flex items-center gap-3 xl:gap-5 min-w-0">
          <Link href="/" className="inline-flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="w-7 h-7 rounded-lg bg-text text-bg inline-flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105 shrink-0">
              <Shield className="h-4 w-4 shrink-0" />
            </div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2">
              <span className="font-semibold text-text text-sm tracking-tight">
                Trace<span className="text-text-muted font-normal">Verse</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-raised border border-border text-text-muted font-mono font-medium">
                v1.2
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Tabs (Visible on lg+) */}
          <nav className="hidden lg:inline-flex items-center gap-1 p-0.5 rounded-lg bg-surface-raised/60 border border-border/60 shrink-0">
            {/* Primary 4 Tabs */}
            {primaryTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-all inline-flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-surface text-text border border-border/80 shadow-sm font-semibold'
                      : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse shrink-0" />
                  )}
                  <span className={`inline-flex items-center justify-center shrink-0 ${isActive ? 'text-accent' : 'opacity-70'}`}>
                    {tab.icon}
                  </span>
                  <span className="leading-none whitespace-nowrap">{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-medium shrink-0 ${
                        tab.id === 'GRAPH_STUDIO'
                          ? 'bg-accent/15 text-accent border border-accent/30 animate-pulse'
                          : 'bg-surface-raised text-text-muted border border-border'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Direct Secondary Tabs on Ultra-Wide (2xl: >= 1536px) */}
            <div className="hidden 2xl:inline-flex items-center gap-1">
              {secondaryTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectTab(tab.id)}
                    className={`relative px-2.5 py-1 rounded-md text-xs font-medium transition-all inline-flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-surface text-text border border-border/80 shadow-sm font-semibold'
                        : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
                    }`}
                  >
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse shrink-0" />
                    )}
                    <span className={`inline-flex items-center justify-center shrink-0 ${isActive ? 'text-accent' : 'opacity-70'}`}>
                      {tab.icon}
                    </span>
                    <span className="leading-none whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Responsive "More" Dropdown Menu on lg and xl screens (1024px to 1535px) */}
            <div className="relative inline-flex 2xl:hidden" ref={moreMenuRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`relative px-2.5 py-1 rounded-md text-xs font-medium transition-all inline-flex items-center gap-1.5 shrink-0 ${
                  isSecondaryActive
                    ? 'bg-surface text-text border border-border/80 shadow-sm font-semibold'
                    : moreMenuOpen
                    ? 'bg-surface-hover text-text'
                    : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
                }`}
                title="Additional navigation tabs"
                aria-expanded={moreMenuOpen}
              >
                {isSecondaryActive ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse shrink-0" />
                    <span className="inline-flex items-center justify-center shrink-0 text-accent">
                      {activeSecondaryTab.icon}
                    </span>
                    <span className="leading-none whitespace-nowrap">{activeSecondaryTab.label}</span>
                  </>
                ) : (
                  <span className="leading-none whitespace-nowrap">More</span>
                )}
                <ChevronDown
                  className={`h-3 w-3 shrink-0 opacity-70 transition-transform duration-150 ${
                    moreMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Popover Menu */}
              {moreMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-52 p-1 rounded-xl bg-surface border border-border shadow-vercel-lg z-50 animate-in fade-in-50 zoom-in-95 duration-100 flex flex-col gap-0.5">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-text-dim border-b border-border/50 mb-0.5">
                    More Investigation Views
                  </div>
                  {secondaryTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          onSelectTab(tab.id);
                          setMoreMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-lg text-left text-xs font-medium transition-all inline-flex items-center gap-2 ${
                          isActive
                            ? 'bg-surface-raised text-text font-semibold border border-border/70'
                            : 'text-text-muted hover:text-text hover:bg-surface-hover/60'
                        }`}
                      >
                        {isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 shrink-0" />
                        )}
                        <span className={`inline-flex items-center justify-center shrink-0 ${isActive ? 'text-accent' : 'opacity-80'}`}>
                          {tab.icon}
                        </span>
                        <span className="leading-none whitespace-nowrap">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right: Actions, Modals & Theme Switcher */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenDatasetStatus && (
            <button
              onClick={onOpenDatasetStatus}
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-raised hover:bg-surface-hover text-text border border-border transition-colors font-mono text-[11px] shrink-0"
              title="100K+ Blockchain Dataset Ingestion Status"
            >
              <Database className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="whitespace-nowrap">100K Dataset</span>
            </button>
          )}

          {onOpenMLEval && (
            <button
              onClick={onOpenMLEval}
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-raised hover:bg-surface-hover text-text border border-border transition-colors font-mono text-[11px] shrink-0"
              title="ML Benchmark Diagnostics"
            >
              <BrainCircuit className="h-3.5 w-3.5 text-verified shrink-0" />
              <span className="whitespace-nowrap">ML Benchmarks</span>
            </button>
          )}

          <a
            href="/docs"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-raised hover:bg-surface-hover text-text border border-border transition-colors font-mono text-[11px] shrink-0"
            title="Judge Technical Documentation"
          >
            <BookOpen className="h-3.5 w-3.5 text-warning shrink-0" />
            <span className="whitespace-nowrap">Docs</span>
          </a>

          <div className="hidden 2xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-raised border border-border text-[11px] text-text-muted font-mono shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse shrink-0" />
            <span className="whitespace-nowrap">EVM + TRON</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-8 h-8 rounded-md bg-surface-raised hover:bg-surface-hover border border-border text-text inline-flex items-center justify-center transition-colors shrink-0"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-warning shrink-0" />
            ) : (
              <Moon className="h-4 w-4 text-text-muted shrink-0" />
            )}
          </button>

          {/* Mobile menu trigger (Visible below lg: < 1024px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="lg:hidden w-8 h-8 rounded-md bg-surface-raised hover:bg-surface-hover border border-border text-text inline-flex items-center justify-center transition-colors shrink-0"
          >
            {mobileMenuOpen ? <X className="h-4 w-4 shrink-0" /> : <Menu className="h-4 w-4 shrink-0" />}
          </button>
        </div>
      </div>

      {/* Sub-navigation bar for tablet screens (md to lg: 768px - 1023px) */}
      <div className="hidden md:flex lg:hidden border-t border-border bg-surface-raised/40">
        <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-4 py-1.5 overflow-x-auto gap-1 scrollbar-none flex items-center">
        {allTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium transition-all inline-flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-surface text-text border border-border shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
              }`}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse shrink-0" />
              )}
              <span className={`inline-flex items-center justify-center shrink-0 ${isActive ? 'text-accent' : 'opacity-70'}`}>
                {tab.icon}
              </span>
              <span className="leading-none">{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-raised text-text-muted border border-border font-mono shrink-0">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
        </div>
      </div>

      {/* Mobile Drawer (Visible below lg when toggled) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-surface p-3 sm:p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {allTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onSelectTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-lg text-left text-xs font-medium transition-all inline-flex items-center gap-2 border shrink-0 ${
                    isActive
                      ? 'bg-surface-raised text-text border-accent/40 font-semibold shadow-sm'
                      : 'bg-bg text-text-muted border-border/50 hover:border-border'
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block shrink-0" />
                  )}
                  <span className={`inline-flex items-center justify-center shrink-0 ${isActive ? 'text-accent' : ''}`}>
                    {tab.icon}
                  </span>
                  <span className="truncate leading-none">{tab.label}</span>
                  {tab.badge && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-surface-raised text-text-muted border border-border font-mono shrink-0">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between gap-2 text-xs font-mono">
            {onOpenDatasetStatus && (
              <button
                onClick={() => {
                  onOpenDatasetStatus();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 p-2 rounded-md bg-surface-raised border border-border text-center text-text inline-flex items-center justify-center gap-1.5 shrink-0"
              >
                <Database className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="whitespace-nowrap">100K Dataset</span>
              </button>
            )}
            {onOpenMLEval && (
              <button
                onClick={() => {
                  onOpenMLEval();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 p-2 rounded-md bg-surface-raised border border-border text-center text-text inline-flex items-center justify-center gap-1.5 shrink-0"
              >
                <BrainCircuit className="h-3.5 w-3.5 text-verified shrink-0" />
                <span className="whitespace-nowrap">ML Eval</span>
              </button>
            )}
            <a
              href="/docs"
              className="flex-1 p-2 rounded-md bg-surface-raised border border-border text-center text-text inline-flex items-center justify-center gap-1.5 shrink-0"
            >
              <BookOpen className="h-3.5 w-3.5 text-warning shrink-0" />
              <span className="whitespace-nowrap">Docs</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

