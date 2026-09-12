'use client';

import React, { useEffect, useState } from 'react';
import {
  Shield,
  Database,
  FileText,
  Activity,
  Search,
  ListFilter,
  Sun,
  Moon,
  Scale,
  Network,
  BrainCircuit,
  Radar,
  BookOpen,
} from 'lucide-react';

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
            <div className="h-7 w-7 rounded bg-forensic-accent/15 border border-forensic-accent/30 flex items-center justify-center text-forensic-accent">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 leading-none">
                <span className="font-bold text-forensic-text tracking-wider text-sm">
                  TRACE<span className="text-forensic-accent">VERSE</span>
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-forensic-surfaceRaised border border-forensic-border text-forensic-textMuted font-mono uppercase">
                  v1.2
                </span>
              </div>
              <span className="text-[10px] text-forensic-textDim tracking-tight block mt-0.5">
                Financial Intelligence Workstation
              </span>
            </div>
          </div>

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
              <Search className="h-3.5 w-3.5 text-forensic-accent" />
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
              <Radar className="h-3.5 w-3.5 text-forensic-accent" />
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
              )}
            </button>

            <button
              onClick={() => onSelectTab('NCRP_TRIAGE')}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'NCRP_TRIAGE'
                  ? 'bg-forensic-surfaceRaised text-forensic-text border border-forensic-border font-bold shadow-sm'
                  : 'text-forensic-textMuted hover:text-forensic-text hover:bg-forensic-surfaceRaised/50'
              }`}
            >
              <ListFilter className="h-3.5 w-3.5 text-forensic-amber" />
              <span>NCRP Queue</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-forensic-accent/15 text-forensic-accent border border-forensic-accent/30">
                {caseCount} Active
              </span>
            </button>

            <button
              onClick={() => onSelectTab('VASP_REGISTRY')}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'VASP_REGISTRY'
                  ? 'bg-forensic-surfaceRaised text-forensic-text border border-forensic-border font-bold shadow-sm'
                  : 'text-forensic-textMuted hover:text-forensic-text hover:bg-forensic-surfaceRaised/50'
              }`}
            >
              <Database className="h-3.5 w-3.5 text-forensic-accent" />
              <span>VASP Registry</span>
            </button>

            <button
              onClick={() => onSelectTab('LEGAL_STUDIO')}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'LEGAL_STUDIO'
                  ? 'bg-forensic-surfaceRaised text-forensic-text border border-forensic-border font-bold shadow-sm'
                  : 'text-forensic-textMuted hover:text-forensic-text hover:bg-forensic-surfaceRaised/50'
              }`}
            >
              <Scale className="h-3.5 w-3.5 text-forensic-rose" />
              <span>Sec 91 Freeze Order</span>
            </button>

            <button
              onClick={() => onSelectTab('METHODOLOGY')}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'METHODOLOGY'
                  ? 'bg-forensic-surfaceRaised text-forensic-text border border-forensic-border font-bold shadow-sm'
                  : 'text-forensic-textMuted hover:text-forensic-text hover:bg-forensic-surfaceRaised/50'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-forensic-textDim" />
              <span>Audit Methodology</span>
            </button>
          </nav>
        </div>

        {/* Right: Active Network Badge & Theme Toggle */}
        <div className="flex items-center space-x-3">
          {onOpenDatasetStatus && (
            <button
              onClick={onOpenDatasetStatus}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-forensic-accent/10 hover:bg-forensic-accent/20 text-forensic-accent border border-forensic-accent/30 transition-colors font-mono text-[11px]"
              title="View 100K+ Blockchain Dataset Ingestion Intelligence"
            >
              <Database className="h-3.5 w-3.5" />
              <span>100K Dataset</span>
            </button>
          )}

          {onOpenMLEval && (
            <button
              onClick={onOpenMLEval}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors font-mono text-[11px]"
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
            <Activity className="h-3 w-3 text-[#D98282] animate-pulse" />
            <span>EVM + TRON TRC-20</span>
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-forensic-surfaceRaised hover:bg-forensic-border text-forensic-text border border-forensic-border transition-colors font-sans text-xs"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-forensic-accent" />
                <span className="font-medium">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
