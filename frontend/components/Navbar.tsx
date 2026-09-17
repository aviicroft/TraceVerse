'use client';

import React, { useState } from 'react';
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
  Activity,
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

  const navTabs: { id: ActiveTabType; label: string; icon: React.ReactNode; badge?: string }[] = [
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md text-xs select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-13">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-7 w-7 rounded-lg bg-text text-bg inline-flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105 shrink-0">
              <Shield className="h-4 w-4 shrink-0" />
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="font-semibold text-text text-sm tracking-tight">
                Trace<span className="text-text-muted font-normal">Verse</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-raised border border-border text-text-muted font-mono font-medium">
                v1.2
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Tabs */}
          <nav className="hidden xl:inline-flex items-center gap-1 p-0.5 rounded-lg bg-surface-raised/60 border border-border/60">
            {navTabs.map((tab) => {
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
                  <span className={`inline-flex items-center justify-center shrink-0 ${isActive ? 'text-accent' : 'opacity-70'}`}>{tab.icon}</span>
                  <span className="leading-none">{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-medium shrink-0 ${
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
          </nav>
        </div>

        {/* Right: Actions, Modals & Theme Switcher */}
        <div className="inline-flex items-center gap-2">
          {onOpenDatasetStatus && (
            <button
              onClick={onOpenDatasetStatus}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-raised hover:bg-surface-hover text-text border border-border transition-colors font-mono text-[11px] shrink-0"
              title="100K+ Blockchain Dataset Ingestion Status"
            >
              <Database className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>100K Dataset</span>
            </button>
          )}

          {onOpenMLEval && (
            <button
              onClick={onOpenMLEval}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-raised hover:bg-surface-hover text-text border border-border transition-colors font-mono text-[11px] shrink-0"
              title="ML Benchmark Diagnostics"
            >
              <BrainCircuit className="h-3.5 w-3.5 text-verified shrink-0" />
              <span>ML Benchmarks</span>
            </button>
          )}

          <a
            href="/docs"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-raised hover:bg-surface-hover text-text border border-border transition-colors font-mono text-[11px] shrink-0"
            title="Judge Technical Documentation"
          >
            <BookOpen className="h-3.5 w-3.5 text-warning shrink-0" />
            <span>Docs</span>
          </a>

          <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-raised border border-border text-[11px] text-text-muted font-mono shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse shrink-0" />
            <span>EVM + TRON</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="h-8 w-8 rounded-md bg-surface-raised hover:bg-surface-hover border border-border text-text inline-flex items-center justify-center transition-colors shrink-0"
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
            className="xl:hidden h-8 w-8 rounded-md bg-surface-raised hover:bg-surface-hover border border-border text-text inline-flex items-center justify-center transition-colors shrink-0"
          >
            {mobileMenuOpen ? <X className="h-4 w-4 shrink-0" /> : <Menu className="h-4 w-4 shrink-0" />}
          </button>
        </div>
      </div>

      {/* Sub-navigation bar for medium screens (lg/md) */}
      <div className="hidden md:flex xl:hidden border-t border-border bg-surface-raised/40 px-4 py-1.5 overflow-x-auto space-x-1 scrollbar-none">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium transition-all inline-flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-surface text-text border border-border shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse shrink-0" />
              )}
              <span className={`inline-flex items-center justify-center shrink-0 ${isActive ? 'text-accent' : 'opacity-70'}`}>{tab.icon}</span>
              <span className="leading-none">{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-surface-raised text-text-muted border border-border font-mono shrink-0">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-border bg-surface p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-1.5">
            {navTabs.map((tab) => {
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
                  <span className={`inline-flex items-center justify-center shrink-0 ${isActive ? 'text-accent' : ''}`}>{tab.icon}</span>
                  <span className="truncate leading-none">{tab.label}</span>
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
                <span>Dataset</span>
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
                <span>ML Eval</span>
              </button>
            )}
            <a
              href="/docs"
              className="flex-1 p-2 rounded-md bg-surface-raised border border-border text-center text-text inline-flex items-center justify-center gap-1.5 shrink-0"
            >
              <BookOpen className="h-3.5 w-3.5 text-warning shrink-0" />
              <span>Docs</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
