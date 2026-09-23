'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowRight,
  Database,
  Network,
  Scale,
  BrainCircuit,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
  FileText,
  Sun,
  Moon,
  Radar,
  Lock,
  Zap,
  Share2,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export const LandingPageContent: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [activeSimulationTab, setActiveSimulationTab] = useState<'graph' | 'attribution' | 'legal'>('graph');

  return (
    <div className="min-h-screen bg-bg text-text font-sans antialiased selection:bg-accent-subtle selection:text-text transition-colors duration-150">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-6 sm:space-x-8">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-accent-subtle border border-accent/20 text-accent inline-flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-text">
                  Trace<span className="text-text-muted font-normal">Verse</span>
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-raised border border-border text-text-muted">
                  Forensic v2.0
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-6 text-sm text-text-secondary font-medium">
              <a href="#overview" className="hover:text-text transition-colors">Overview</a>
              <a href="#capabilities" className="hover:text-text transition-colors">Capabilities</a>
              <a href="#architecture" className="hover:text-text transition-colors">Architecture</a>
              <Link href="/docs" className="hover:text-text transition-colors">Documentation</Link>
            </nav>
          </div>

          <div className="inline-flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="w-9 h-9 rounded-lg bg-surface-raised hover:bg-surface-elevated border border-border text-text-secondary hover:text-text inline-flex items-center justify-center transition-colors"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-warning" />
              ) : (
                <Moon className="h-4 w-4 text-text-muted" />
              )}
            </button>

            <Link href="/app">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                Launch Console
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-28 border-b border-border">
        {/* Subtle Graph Nodes Visual in Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.12] dark:opacity-[0.18]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.75" className="text-border" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Ambient nodes */}
            <circle cx="20%" cy="30%" r="4" fill="#E63946" />
            <circle cx="28%" cy="45%" r="3" fill="#94A3B8" />
            <circle cx="45%" cy="25%" r="4" fill="#22C55E" />
            <circle cx="75%" cy="35%" r="3" fill="#94A3B8" />
            <circle cx="85%" cy="60%" r="5" fill="#22C55E" />
            <line x1="20%" y1="30%" x2="28%" y2="45%" stroke="#29436B" strokeWidth="1.5" />
            <line x1="28%" y1="45%" x2="45%" y2="25%" stroke="#29436B" strokeWidth="1.5" />
            <line x1="45%" y1="25%" x2="75%" y2="35%" stroke="#29436B" strokeWidth="1.5" />
            <line x1="75%" y1="35%" x2="85%" y2="60%" stroke="#29436B" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center">
            <Badge variant="accent" dot>
              Autonomous Blockchain Forensic Intelligence
            </Badge>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <div className="text-xs sm:text-sm font-semibold tracking-widest text-text-muted uppercase">
              TRACEVERSE
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-text leading-[1.1]">
              Blockchain Forensic Intelligence
            </h1>
          </div>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-text-secondary leading-relaxed font-normal">
            Trace digital asset flows. Discover attribution. Build evidence-backed investigations.
          </p>

          {/* CTAs */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/app">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Start Investigation
              </Button>
            </Link>

            <a href="#capabilities">
              <Button variant="secondary" size="lg">
                Explore Platform
              </Button>
            </a>
          </div>

          {/* Trust Signals */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-verified shrink-0" />
              <span>100K+ Live On-Chain Transfers</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-verified shrink-0" />
              <span>Multi-Hop Directed Graph Traversal</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-verified shrink-0" />
              <span>Section 91 CrPC / Section 94 BNSS Legal Requisitions</span>
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Forensic Intelligence Visualizer */}
      <section className="py-16 md:py-20 bg-surface-raised/40 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Forensic Intelligence Studio
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Precision Multi-Chain Correlation
            </h2>
            <p className="text-sm text-text-secondary">
              Correlate unlabelled illicit wallets with verified custodial exchange clusters through deterministic graph algorithms.
            </p>
          </div>

          {/* Interactive Workspace Container */}
          <div className="bg-surface border border-border rounded-2xl shadow-panel overflow-hidden">
            {/* Top Workspace Bar */}
            <div className="p-4 border-b border-border bg-surface-raised/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
                <span className="text-xs text-text-muted font-mono">
                  case://ETH-MAINNET/0x3f8702cfb1...e3 [STATUS: ACTIVE]
                </span>
              </div>

              <div className="flex items-center space-x-1 bg-bg p-1 rounded-lg border border-border text-xs font-medium">
                <button
                  onClick={() => setActiveSimulationTab('graph')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeSimulationTab === 'graph' ? 'bg-surface text-text shadow-sm border border-border' : 'text-text-muted hover:text-text'
                  }`}
                >
                  Network Graph
                </button>
                <button
                  onClick={() => setActiveSimulationTab('attribution')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeSimulationTab === 'attribution' ? 'bg-surface text-text shadow-sm border border-border' : 'text-text-muted hover:text-text'
                  }`}
                >
                  Attribution Model
                </button>
                <button
                  onClick={() => setActiveSimulationTab('legal')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeSimulationTab === 'legal' ? 'bg-surface text-text shadow-sm border border-border' : 'text-text-muted hover:text-text'
                  }`}
                >
                  Statutory Requisition
                </button>
              </div>
            </div>

            {/* Showcase Viewport */}
            <div className="p-6 sm:p-8 bg-bg min-h-[360px] flex items-center justify-center">
              {activeSimulationTab === 'graph' && (
                <div className="w-full max-w-3xl space-y-5">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-border">
                    <div className="flex items-center space-x-2.5">
                      <Search className="h-4 w-4 text-accent" />
                      <span className="text-xs font-mono text-text">0x3f8702cfb1662195fcc98593789682da91dfaae3</span>
                    </div>
                    <Badge variant="success">Hop Depth: 3 Hops Traversed</Badge>
                  </div>

                  {/* Flow Simulation Blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-surface border border-accent/30 space-y-1.5 shadow-card text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-accent uppercase font-semibold">Target Wallet</span>
                        <span className="w-2 h-2 rounded-full bg-accent" />
                      </div>
                      <div className="text-xs font-mono font-bold text-text truncate">0x3f87...aae3</div>
                      <span className="text-xs text-text-muted block">40 Transfers • $92.4M Volume</span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface border border-border space-y-1.5 shadow-card text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-text-muted uppercase font-semibold">Hop 1 Intermediary</span>
                        <span className="w-2 h-2 rounded-full bg-text-muted" />
                      </div>
                      <div className="text-xs font-mono font-bold text-text truncate">0x0051...6cea</div>
                      <span className="text-xs text-text-muted block">High Fan-Out Layering Cluster</span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface border border-verified/30 space-y-1.5 shadow-card text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-verified uppercase font-semibold">Attributed VASP</span>
                        <span className="w-2 h-2 rounded-full bg-verified" />
                      </div>
                      <div className="text-sm font-bold text-verified">BINANCE HOT RESIDENT</div>
                      <span className="text-xs text-verified font-medium block">82.1% Composite Confidence</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-surface rounded-xl border border-border text-xs text-text-secondary flex items-center justify-between">
                    <span>Direct graph trajectory correlates suspect fund distribution with verified Binance hot wallet cluster.</span>
                    <Link href="/app" className="text-accent hover:underline font-medium inline-flex items-center gap-1">
                      <span>Open in Graph Studio</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {activeSimulationTab === 'attribution' && (
                <div className="w-full max-w-2xl space-y-4">
                  <div className="p-6 rounded-xl bg-surface border border-border space-y-4 shadow-card">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-text">Primary Attribution Finding</h4>
                        <p className="text-xs text-text-muted">Binance Custodial Cluster</p>
                      </div>
                      <Badge variant="success">Confidence: 82.1 / 100</Badge>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-text-secondary">Graph Proximity Factor (Weight: 35%)</span>
                          <span className="text-text font-semibold">85.0%</span>
                        </div>
                        <div className="h-2 w-full bg-surface-raised rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-text-secondary">Observable Transfer Volume (Weight: 25%)</span>
                          <span className="text-text font-semibold">92.0%</span>
                        </div>
                        <div className="h-2 w-full bg-surface-raised rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: '92%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-text-secondary">Interaction Frequency (Weight: 20%)</span>
                          <span className="text-text font-semibold">78.0%</span>
                        </div>
                        <div className="h-2 w-full bg-surface-raised rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: '78%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSimulationTab === 'legal' && (
                <div className="w-full max-w-2xl p-6 rounded-xl bg-surface border border-border space-y-4 shadow-card">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center space-x-2 text-text font-semibold text-sm">
                      <Scale className="h-4 w-4 text-accent" />
                      <span>Statutory Requisition Under Section 91 CrPC / Section 94 BNSS</span>
                    </div>
                    <Badge variant="neutral">Formal Judicial Order</Badge>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Formal legal requisition served to VASP compliance division demanding immediate account preservation,
                    deposit freeze, and KYC records identification in accordance with Section 65B Indian Evidence Act certification.
                  </p>
                  <div className="pt-2 flex justify-between items-center text-xs text-text-muted border-t border-border">
                    <span className="font-mono">Ref: TRACEVERSE/LEA/2026/CR-3F8702</span>
                    <span className="text-verified font-medium">Digital Verification Sealed</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Capabilities */}
      <section id="capabilities" className="py-20 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Investigation Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Engineered for Cyber Forensics & Law Enforcement
            </h2>
            <p className="text-sm text-text-secondary">
              Replacing manual blockchain lookups with deterministic graph intelligence and automated legal documentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-card space-y-3 hover:border-border-hover transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle border border-accent/20 inline-flex items-center justify-center text-accent shrink-0">
                <Network className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-semibold text-base text-text">
                Multi-Hop Graph Traversal
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Asynchronously reconstructs directed counterparty flows across Ethereum and Tron networks using Cytoscape and Dagre layout algorithms.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-card space-y-3 hover:border-border-hover transition-colors">
              <div className="w-10 h-10 rounded-xl bg-verified-subtle border border-verified/20 inline-flex items-center justify-center text-verified shrink-0">
                <BrainCircuit className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-semibold text-base text-text">
                Deterministic Attribution Rubric
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Mathematically weighs proximity (35%), volume (25%), frequency (20%), behavior (10%), and recency (10%) with configurable decay coefficients.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-card space-y-3 hover:border-border-hover transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle border border-accent/20 inline-flex items-center justify-center text-accent shrink-0">
                <Scale className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-semibold text-base text-text">
                Statutory Freeze Orders
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Generates court-admissible legal notices with dynamic QR verification codes, compliance contacts, and Section 65B certificates for instant VASP service.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-card space-y-3 hover:border-border-hover transition-colors">
              <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border inline-flex items-center justify-center text-warning shrink-0">
                <Radar className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-semibold text-base text-text">
                Autonomous Candidate Mining
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Automatically discovers unlabelled suspect leads from VASP counterparty interaction history, scoring them on a 5-factor quality matrix.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-card space-y-3 hover:border-border-hover transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle border border-accent/20 inline-flex items-center justify-center text-accent shrink-0">
                <Database className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-semibold text-base text-text">
                Verified VASP Cluster Registry
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Integrates thousands of verified Proof-of-Reserves, hot wallets, and deposit clusters for Binance, OKX, Huobi, KuCoin, and regional exchanges.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-card space-y-3 hover:border-border-hover transition-colors">
              <div className="w-10 h-10 rounded-xl bg-verified-subtle border border-verified/20 inline-flex items-center justify-center text-verified shrink-0">
                <FileText className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-semibold text-base text-text">
                NCRP Incident Triage Pipeline
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Prioritizes National Cybercrime Reporting Portal complaints by financial loss, scam typology, and detected VASP proximity for rapid asset recovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Pipeline Section */}
      <section id="architecture" className="py-20 bg-surface-raised/40 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Deterministic Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Zero Synthetic Data. 100% Provenance.
            </h2>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-5 rounded-xl bg-surface-raised border border-border space-y-2">
                <span className="text-[11px] text-accent uppercase font-semibold">1. Ingestion Layer</span>
                <div className="font-bold text-text text-sm">Etherscan & TronGrid</div>
                <p className="text-xs text-text-muted">Live RPC APIs querying native & token transfers</p>
              </div>

              <div className="p-5 rounded-xl bg-surface-raised border border-border space-y-2">
                <span className="text-[11px] text-warning uppercase font-semibold">2. Graph Synthesis</span>
                <div className="font-bold text-text text-sm">Directed Topology</div>
                <p className="text-xs text-text-muted">1–3 hop counterparty multi-digraph with Dagre layout</p>
              </div>

              <div className="p-5 rounded-xl bg-surface-raised border border-border space-y-2">
                <span className="text-[11px] text-verified uppercase font-semibold">3. Heuristic Engine</span>
                <div className="font-bold text-text text-sm">VASP Matcher</div>
                <p className="text-xs text-text-muted">Evaluates 5 decay-adjusted topological factors</p>
              </div>

              <div className="p-5 rounded-xl bg-surface-raised border border-border space-y-2">
                <span className="text-[11px] text-accent uppercase font-semibold">4. Judicial Output</span>
                <div className="font-bold text-text text-sm">Sec 91 Freeze Order</div>
                <p className="text-xs text-text-muted">Automated legal requisition with digital QR verification</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
            Start an Investigation in TraceVerse
          </h2>
          <p className="text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
            Access the live investigation console, explore discovered candidate wallets, or review technical documentation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/app">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Launch Console
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary" size="lg">
                Read Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-bg text-text-muted text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent shrink-0" />
            <span className="font-semibold text-text">TraceVerse</span>
            <span>— Real-Time Cryptocurrency Fraud Attribution Platform</span>
          </div>

          <div className="inline-flex items-center gap-5">
            <Link href="/app" className="hover:text-text transition-colors">Workspace</Link>
            <Link href="/docs" className="hover:text-text transition-colors">Docs</Link>
            <span>v2.0 Production</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
