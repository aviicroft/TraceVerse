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
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const LandingPageContent: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [activeSimulationTab, setActiveSimulationTab] = useState<'graph' | 'attribution' | 'legal'>('graph');

  return (
    <div className="min-h-screen bg-bg text-text font-sans antialiased selection:bg-accent selection:text-white transition-colors duration-150">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center space-x-4 sm:space-x-6 min-w-0">
            <Link href="/" className="inline-flex items-center gap-2 sm:gap-2.5 group shrink-0">
              <div className="w-7 h-7 rounded-lg bg-text text-bg inline-flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105 shrink-0">
                <Shield className="h-4 w-4 shrink-0" />
              </div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-sm tracking-tight text-text">
                  Trace<span className="text-text-muted font-normal">Verse</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-surface-raised border border-border text-text-muted">
                  v1.2
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-5 text-xs text-text-muted">
              <a href="#architecture" className="hover:text-text transition-colors">Architecture</a>
              <a href="#features" className="hover:text-text transition-colors">Forensic Engine</a>
              <a href="#heuristics" className="hover:text-text transition-colors">Attribution Model</a>
              <Link href="/docs" className="hover:text-text transition-colors">Judge Docs</Link>
            </nav>
          </div>

          <div className="inline-flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="w-8 h-8 rounded-lg bg-surface-raised hover:bg-surface-hover border border-border text-text inline-flex items-center justify-center transition-colors shrink-0"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-warning shrink-0" />
              ) : (
                <Moon className="h-4 w-4 text-text-muted shrink-0" />
              )}
            </button>

            <Link
              href="/app"
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-text text-bg hover:opacity-90 font-medium text-xs transition-opacity shadow-sm inline-flex items-center justify-center gap-1.5 shrink-0"
            >
              <span className="hidden sm:inline whitespace-nowrap">Launch Console</span>
              <span className="sm:hidden whitespace-nowrap">Launch</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-border">
        {/* Subtle background radial aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-raised border border-border text-xs text-text-muted font-mono shadow-sm">
            <span className="w-2 h-2 rounded-full bg-verified animate-pulse shrink-0" />
            <span>Autonomous Blockchain Intelligence & VASP Attribution</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text leading-[1.1]">
            Trace illicit crypto flows to <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-text via-text to-text-muted bg-clip-text text-transparent">
              Virtual Asset Service Providers.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-text-muted font-normal leading-relaxed">
            TraceVerse reconstructs multi-hop cryptocurrency laundering paths, models counterparty graph proximity,
            and synthesizes court-admissible Section 91 CrPC statutory freeze notices in real time.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 font-sans">
            <Link
              href="/app"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-text text-bg hover:opacity-90 font-semibold text-sm transition-opacity shadow-vercel inline-flex items-center justify-center gap-2"
            >
              <span>Open Investigation Workstation</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>

            <Link
              href="/docs"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-surface hover:bg-surface-raised border border-border text-text font-medium text-sm transition-colors inline-flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4 text-accent shrink-0" />
              <span>Judge Documentation (/docs)</span>
            </Link>
          </div>

          {/* Key Trust Signals */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-text-dim">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-verified shrink-0" />
              <span>100K+ Real On-Chain Transactions</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-verified shrink-0" />
              <span>Ethereum & Tron TRC-20 Support</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-verified shrink-0" />
              <span>Section 91 CrPC / 94 BNSS Order Generator</span>
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Forensic Product Showcase */}
      <section className="py-16 md:py-20 bg-bg-subtle border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold">
              Live Interactive Interface
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Precision Intelligence Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Explore how TraceVerse correlates on-chain counterparties with verified custodial exchange clusters.
            </p>
          </div>

          {/* Interactive Preview Container */}
          <div className="bg-surface border border-border rounded-xl shadow-vercel-lg overflow-hidden font-mono text-xs">
            {/* Top Window Chrome */}
            <div className="p-3 border-b border-border bg-surface-raised/40 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                </div>
                <span className="text-[11px] text-text-dim ml-2 font-mono">
                  traceverse://target/0x3f8702cfb1...e3 [CR-2026-ACTIVE]
                </span>
              </div>

              <div className="flex items-center space-x-1 bg-bg p-0.5 rounded-lg border border-border text-[11px]">
                <button
                  onClick={() => setActiveSimulationTab('graph')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeSimulationTab === 'graph' ? 'bg-surface text-text font-bold shadow-sm' : 'text-text-dim hover:text-text'
                  }`}
                >
                  Directed Graph
                </button>
                <button
                  onClick={() => setActiveSimulationTab('attribution')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeSimulationTab === 'attribution' ? 'bg-surface text-text font-bold shadow-sm' : 'text-text-dim hover:text-text'
                  }`}
                >
                  Attribution Rubric
                </button>
                <button
                  onClick={() => setActiveSimulationTab('legal')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeSimulationTab === 'legal' ? 'bg-surface text-text font-bold shadow-sm' : 'text-text-dim hover:text-text'
                  }`}
                >
                  Statutory Freeze
                </button>
              </div>
            </div>

            {/* Showcase Viewport */}
            <div className="p-6 bg-bg min-h-[360px] flex items-center justify-center">
              {activeSimulationTab === 'graph' && (
                <div className="w-full max-w-3xl space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-accent" />
                      <span className="text-text font-semibold">0x3f8702cfb1662195fcc98593789682da91dfaae3</span>
                    </div>
                    <span className="text-verified font-bold text-[11px]">Hop Depth: 3 Hops Traversed</span>
                  </div>

                  {/* Flow Simulation Blocks */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-surface border border-danger/40 space-y-1 shadow-sm">
                      <span className="text-[10px] text-danger uppercase font-bold">Input Suspect</span>
                      <div className="text-xs font-bold text-text truncate">0x3f87...aae3</div>
                      <span className="text-[10px] text-text-dim block">40 Transfers • $92.4M</span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface border border-border space-y-1 shadow-sm relative">
                      <span className="text-[10px] text-text-dim uppercase font-bold">Hop 1 Intermediary</span>
                      <div className="text-xs font-bold text-text truncate">0x0051...6cea</div>
                      <span className="text-[10px] text-text-dim block">Layering Cluster</span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface border border-verified/40 space-y-1 shadow-sm">
                      <span className="text-[10px] text-verified uppercase font-bold">Target VASP Endpoint</span>
                      <div className="text-xs font-bold text-accent">BINANCE CUSTODIAL</div>
                      <span className="text-[10px] text-verified font-bold block">82.1% Confidence</span>
                    </div>
                  </div>

                  <div className="p-3 bg-surface rounded-lg border border-border text-[11px] text-text-muted flex items-center justify-between">
                    <span>Identified 8 paths connecting suspect wallet to Binance hot reserves within 1 hop.</span>
                    <Link href="/app" className="text-accent hover:underline font-semibold font-sans">
                      Open Full Graph Canvas →
                    </Link>
                  </div>
                </div>
              )}

              {activeSimulationTab === 'attribution' && (
                <div className="w-full max-w-2xl space-y-3">
                  <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span className="font-bold text-text uppercase">Primary Attribution Finding</span>
                      <span className="text-verified font-bold text-sm">Score: 82.1 / 100</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-text-muted">Graph Proximity (35%)</span>
                        <span className="text-text font-bold">85.0%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-raised rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: '85%' }} />
                      </div>

                      <div className="flex justify-between text-[11px]">
                        <span className="text-text-muted">Observable Volume (25%)</span>
                        <span className="text-text font-bold">92.0%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-raised rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: '92%' }} />
                      </div>

                      <div className="flex justify-between text-[11px]">
                        <span className="text-text-muted">Interaction Frequency (20%)</span>
                        <span className="text-text font-bold">78.0%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-raised rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: '78%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSimulationTab === 'legal' && (
                <div className="w-full max-w-2xl p-5 rounded-xl bg-surface border border-border space-y-3">
                  <div className="flex items-center space-x-2 text-danger font-bold text-xs uppercase">
                    <Scale className="h-4 w-4" />
                    <span>Statutory Requisition Under Section 91 CrPC / 94 BNSS</span>
                  </div>
                  <p className="text-text-muted text-xs font-serif leading-relaxed">
                    Formal legal mandate addressed to Binance Legal Compliance requesting immediate temporary freeze on custodial deposits,
                    KYC disclosure, and preservation of access logs under Section 65B of the Indian Evidence Act.
                  </p>
                  <div className="pt-2 flex justify-between items-center text-[10px] text-text-dim border-t border-border">
                    <span>Ref: TRACEVERSE/LEA/2026/CR-3F8702</span>
                    <span className="text-verified font-bold">QR Verification Sealed</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Features */}
      <section id="features" className="py-20 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Engineered for Cyber Forensics & Law Enforcement
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Built to replace slow, manual blockchain lookups with deterministic graph intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-vercel space-y-3 hover:border-border-hover transition-colors">
              <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 inline-flex items-center justify-center text-accent shrink-0">
                <Network className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-semibold text-base text-text tracking-tight">
                3-Hop Multi-Chain Graph Traversal
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Asynchronously reconstructs directed counterparty flows across Ethereum and Tron networks using Cytoscape and Dagre layout algorithms.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-vercel space-y-3 hover:border-border-hover transition-colors">
              <div className="w-9 h-9 rounded-lg bg-verified/10 border border-verified/20 inline-flex items-center justify-center text-verified shrink-0">
                <BrainCircuit className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-semibold text-base text-text tracking-tight">
                Deterministic Attribution Rubric
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Mathematically weighs proximity (35%), volume (25%), frequency (20%), behavior (10%), and recency (10%) with configurable decay coefficients.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-vercel space-y-3 hover:border-border-hover transition-colors">
              <div className="w-9 h-9 rounded-lg bg-danger/10 border border-danger/20 inline-flex items-center justify-center text-danger shrink-0">
                <Scale className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-semibold text-base text-text tracking-tight">
                Section 91 Statutory Freeze Orders
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Generates court-admissible legal notices with dynamic QR verification codes, compliance contacts, and Section 65B certificates for instant VASP service.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-vercel space-y-3 hover:border-border-hover transition-colors">
              <div className="w-9 h-9 rounded-lg bg-warning/10 border border-warning/20 inline-flex items-center justify-center text-warning shrink-0">
                <Radar className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-semibold text-base text-text tracking-tight">
                Autonomous Candidate Mining
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Automatically discovers unlabelled suspect leads from VASP counterparty interaction history, scoring them on a 5-factor quality matrix.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-vercel space-y-3 hover:border-border-hover transition-colors">
              <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 inline-flex items-center justify-center text-accent shrink-0">
                <Database className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-semibold text-base text-text tracking-tight">
                Curated VASP Cluster Registry
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Integrates thousands of verified Proof-of-Reserves, hot wallets, and deposit addresses for Binance, OKX, Huobi, KuCoin, and regional exchanges.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-vercel space-y-3 hover:border-border-hover transition-colors">
              <div className="w-9 h-9 rounded-lg bg-verified/10 border border-verified/20 inline-flex items-center justify-center text-verified shrink-0">
                <FileText className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-semibold text-base text-text tracking-tight">
                NCRP Incident Triage Pipeline
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Prioritizes National Cybercrime Reporting Portal complaints by financial loss, scam typology, and detected VASP proximity for rapid asset recovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Overview Section */}
      <section id="architecture" className="py-20 bg-bg-subtle border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold">
              System Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Zero Synthetic Data. 100% Deterministic Provenance.
            </h2>
          </div>

          <div className="p-6 sm:p-8 rounded-xl bg-surface border border-border shadow-vercel font-mono text-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-lg bg-bg border border-border space-y-1">
                <span className="text-[10px] text-accent uppercase font-bold">1. Ingestion Layer</span>
                <div className="font-bold text-text">Etherscan & TronGrid</div>
                <p className="text-[10px] text-text-dim font-sans">Live RPC APIs query native & token transfers</p>
              </div>

              <div className="p-4 rounded-lg bg-bg border border-border space-y-1">
                <span className="text-[10px] text-warning uppercase font-bold">2. Graph Synthesis</span>
                <div className="font-bold text-text">Directed Topology</div>
                <p className="text-[10px] text-text-dim font-sans">1–3 hop counterparty multi-digraph with Dagre layout</p>
              </div>

              <div className="p-4 rounded-lg bg-bg border border-border space-y-1">
                <span className="text-[10px] text-verified uppercase font-bold">3. Heuristic Engine</span>
                <div className="font-bold text-text">VASP Matcher</div>
                <p className="text-[10px] text-text-dim font-sans">Evaluates 5 decay-adjusted topological factors</p>
              </div>

              <div className="p-4 rounded-lg bg-bg border border-border space-y-1">
                <span className="text-[10px] text-danger uppercase font-bold">4. Judicial Output</span>
                <div className="font-bold text-text">Sec 91 Freeze Order</div>
                <p className="text-[10px] text-text-dim font-sans">Automated legal notice with QR digital verification</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
            Start an Investigation in the TraceVerse Console
          </h2>
          <p className="text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
            Access the live investigation console, explore discovered candidate wallets, or review technical judge documentation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/app"
              className="px-6 py-3 rounded-lg bg-text text-bg hover:opacity-90 font-semibold text-sm transition-opacity shadow-vercel inline-flex items-center justify-center gap-2"
            >
              <span>Launch Console</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            <Link
              href="/docs"
              className="px-6 py-3 rounded-lg bg-surface hover:bg-surface-raised border border-border text-text font-medium text-sm transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Read Judge Documentation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-bg text-text-dim text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2">
            <Shield className="h-4 w-4 text-text shrink-0" />
            <span className="font-semibold text-text">TraceVerse</span>
            <span>— Real-Time Cryptocurrency Fraud Attribution Platform</span>
          </div>

          <div className="inline-flex items-center gap-4">
            <Link href="/app" className="hover:text-text transition-colors">Workspace</Link>
            <Link href="/docs" className="hover:text-text transition-colors">Docs</Link>
            <span>v1.2 Production</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
