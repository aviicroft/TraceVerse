'use client';

import React, { useEffect } from 'react';

export const LandingPageContent: React.FC = () => {
  useEffect(() => {
    // Initialize Lucide icons
    const initIcons = () => {
      if (typeof window !== 'undefined' && (window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    };
    initIcons();
    const timer = setTimeout(initIcons, 600);

    // Smooth scroll for nav links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          const el = document.querySelector(href);
          if (el) {
            e.preventDefault();
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);

    // Intersection observer for reveal elements and progress bars
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.querySelectorAll('.bar-fill[data-w]').forEach((bar) => {
              const w = bar.getAttribute('data-w');
              if (w) (bar as HTMLElement).style.width = w + '%';
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('section').forEach((s) => {
      s.classList.add('reveal');
      observer.observe(s);
    });

    // Hero bars immediate animation
    const heroTimer = setTimeout(() => {
      document.querySelectorAll('#hero .bar-fill[data-w]').forEach((bar) => {
        const w = bar.getAttribute('data-w');
        if (w) (bar as HTMLElement).style.width = w + '%';
      });
    }, 400);

    // Global console navigation fallback
    (window as any).openConsole = () => {
      window.location.href = '/app';
    };

    return () => {
      clearTimeout(timer);
      clearTimeout(heroTimer);
      document.removeEventListener('click', handleAnchorClick);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0D11] text-[#F1F1EC] font-sans antialiased overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
            --bg: #0B0D11;
            --bg-2: #11141A;
            --surface: #11141A;
            --surface-2: #151920;
            --surface-3: #1A1E26;
            --border: rgba(255, 255, 255, 0.06);
            --border-bright: rgba(230, 199, 102, 0.25);
            --text: #F1F1EC;
            --text-secondary: #A5A8AF;
            --text-muted: #747983;
            --text-dim: #50545D;
            --accent: #E6C766;
            --accent-bright: #F1D98A;
            --accent-dim: rgba(230, 199, 102, 0.12);
            --success: #E6C766;
            --amber: #F1D98A;
            --red: #D95C63;
        }

        * {
            box-sizing: border-box;
        }

        html,
        body {
            background: var(--bg);
            color: var(--text);
            font-family: 'Inter', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .font-mono {
            font-family: 'IBM Plex Mono', monospace;
        }

        .bg-grid {
            background-image:
                linear-gradient(rgba(42, 58, 85, 0.18) 1px, transparent 1px),
                linear-gradient(90deg, rgba(42, 58, 85, 0.18) 1px, transparent 1px);
            background-size: 48px 48px;
        }

        .bg-grid-fine {
            background-image:
                linear-gradient(rgba(42, 58, 85, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(42, 58, 85, 0.1) 1px, transparent 1px);
            background-size: 24px 24px;
        }

        .glow-top {
            background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(230, 199, 102, 0.08), transparent 70%);
        }

        .panel {
            background: var(--surface);
            border: 1px solid var(--border);
        }

        .panel-2 {
            background: var(--surface-2);
            border: 1px solid var(--border-bright);
        }

        .label {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--text-muted);
            font-weight: 500;
        }

        .label-accent {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--accent);
            font-weight: 500;
        }

        .btn-primary {
            background: var(--accent);
            color: #101116;
            font-weight: 600;
            padding: 11px 20px;
            border-radius: 10px;
            font-size: 13px;
            letter-spacing: 0.01em;
            transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: 1px solid transparent;
            box-shadow: 0 10px 18px -14px rgba(230, 199, 102, 0.8);
        }

        .btn-primary:hover {
            background: var(--accent-bright);
            transform: translateY(-1px);
            box-shadow: 0 12px 22px -14px rgba(230, 199, 102, 0.75);
        }

        .btn-secondary {
            background: #151920;
            color: #E8E8E4;
            border: 1px solid rgba(230, 199, 102, 0.25);
            font-weight: 500;
            padding: 11px 20px;
            border-radius: 10px;
            font-size: 13px;
            transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-secondary:hover {
            border-color: rgba(230, 199, 102, 0.45);
            color: var(--accent-bright);
            background: #20242C;
            transform: translateY(-1px);
        }

        .tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 8px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            font-weight: 500;
            letter-spacing: 0.06em;
            border-radius: 2px;
            border: 1px solid var(--border-bright);
            color: var(--text-secondary);
            background: var(--bg-2);
        }

        .tag-accent {
            border-color: rgba(230, 199, 102, 0.35);
            color: var(--accent-bright);
            background: rgba(230, 199, 102, 0.10);
        }

        .tag-green {
            border-color: rgba(217, 130, 130, 0.35);
            color: var(--success);
            background: rgba(217, 130, 130, 0.08);
        }

        .tag-amber {
            border-color: rgba(251, 191, 36, 0.35);
            color: var(--amber);
            background: rgba(251, 191, 36, 0.06);
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
        }

        .data-table th {
            text-align: left;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            font-weight: 500;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--text-muted);
            padding: 11px 14px;
            border-bottom: 1px solid var(--border);
            background: var(--bg-2);
            white-space: nowrap;
        }

        .data-table td {
            padding: 11px 14px;
            border-bottom: 1px solid var(--border);
            font-family: 'IBM Plex Mono', monospace;
            font-size: 12px;
            color: var(--text-secondary);
            white-space: nowrap;
        }

        .data-table tr:hover td {
            background: rgba(230, 199, 102, 0.045);
            color: var(--text);
        }

        .data-table tr:last-child td {
            border-bottom: none;
        }

        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            display: inline-block;
        }

        .status-dot.live {
            background: var(--green);
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
            animation: pulse 2.4s infinite;
        }

        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.6);
            }

            70% {
                box-shadow: 0 0 0 6px rgba(74, 222, 128, 0);
            }

            100% {
                box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
            }
        }

        .flow-edge {
            stroke-dasharray: 5 5;
            animation: flow 1.6s linear infinite;
        }

        @keyframes flow {
            to {
                stroke-dashoffset: -20;
            }
        }

        .reveal {
            opacity: 0;
            transform: translateY(16px);
            transition: opacity 0.7s ease, transform 0.7s ease;
        }

        .reveal.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .bar-track {
            height: 4px;
            background: var(--surface-3);
            border-radius: 2px;
            overflow: hidden;
        }

        .bar-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--accent), var(--accent-bright));
            border-radius: 2px;
            transition: width 1.4s cubic-bezier(0.16, 1, 0.3, 1);
            width: 0;
        }

        .scroll-x::-webkit-scrollbar {
            height: 6px;
        }

        .scroll-x::-webkit-scrollbar-track {
            background: var(--bg);
        }

        .scroll-x::-webkit-scrollbar-thumb {
            background: var(--border-bright);
            border-radius: 3px;
        }

        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: var(--bg);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--border-bright);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--text-muted);
        }

        .node-pulse {
            animation: nodePulse 2.8s ease-in-out infinite;
        }

        @keyframes nodePulse {

            0%,
            100% {
                opacity: 0.9;
            }

            50% {
                opacity: 0.5;
            }
        }

        .modal-backdrop {
            background: rgba(6, 10, 18, 0.92);
            backdrop-filter: blur(8px);
        }

        .corner-tick {
            position: absolute;
            width: 10px;
            height: 10px;
            border-color: var(--accent);
        }

        .corner-tick.tl {
            top: -1px;
            left: -1px;
            border-top: 1px solid;
            border-left: 1px solid;
        }

        .corner-tick.tr {
            top: -1px;
            right: -1px;
            border-top: 1px solid;
            border-right: 1px solid;
        }

        .corner-tick.bl {
            bottom: -1px;
            left: -1px;
            border-bottom: 1px solid;
            border-left: 1px solid;
        }

        .corner-tick.br {
            bottom: -1px;
            right: -1px;
            border-bottom: 1px solid;
            border-right: 1px solid;
        }

        section {
            scroll-margin-top: 72px;
        }

        .nav-link {
            color: var(--text-secondary);
            font-size: 13px;
            font-weight: 500;
            transition: color 0.2s ease, opacity 0.2s ease;
            position: relative;
        }

        .nav-link:hover {
            color: var(--accent-bright);
        }

        .nav-link::after {
            content: '';
            position: absolute;
            bottom: -22px;
            left: 0;
            right: 0;
            height: 1px;
            background: var(--accent);
            transform: scaleX(0);
            transition: transform 0.2s ease;
        }

        .nav-link:hover::after {
            transform: scaleX(1);
        }

        .step-card {
            background: var(--surface);
            border: 1px solid var(--border);
            transition: all 0.2s ease;
        }

        .step-card:hover {
            border-color: rgba(230, 199, 102, 0.25);
            background: var(--surface-2);
        }

        .feature-card {
            background: var(--surface);
            border: 1px solid var(--border);
            transition: all 0.2s ease;
        }

        .feature-card:hover {
            border-color: rgba(230, 199, 102, 0.25);
            transform: translateY(-2px);
        }

        .console-frame {
            background: linear-gradient(180deg, var(--surface) 0%, var(--bg-2) 100%);
            border: 1px solid var(--border-bright);
            box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(230, 199, 102, 0.06);
        }

        .ledger-row:hover {
            background: rgba(230, 199, 102, 0.04);
        }

        details summary {
            list-style: none;
            cursor: pointer;
        }

        details summary::-webkit-details-marker {
            display: none;
        }

        details[open] .chevron {
            transform: rotate(180deg);
        }

        .chevron {
            transition: transform 0.2s;
        }

        .scanline {
            background: repeating-linear-gradient(0deg,
                    transparent,
                    transparent 2px,
                    rgba(230, 199, 102, 0.015) 2px,
                    rgba(230, 199, 102, 0.015) 4px);
        }

        @media (prefers-reduced-motion: reduce) {

            *,
            *::before,
            *::after {
                animation-duration: 0.01ms !important;
                transition-duration: 0.01ms !important;
            }
        }
    ` }} />
      <div dangerouslySetInnerHTML={{ __html: `

    <!-- Top status strip -->
    <div class="border-b border-[rgba(255,255,255,0.06)] bg-[#11141A] relative z-50">
        <div
            class="max-w-[1480px] mx-auto px-6 py-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <div class="flex items-center gap-5">
                <span class="flex items-center gap-2">
                    <span class="status-dot live"></span>
                    <span class="text-slate-400">SYSTEM OPERATIONAL</span>
                </span>
                <span class="hidden md:inline">REGISTRY · 1,595 RECORDS</span>
                <span class="hidden lg:inline">GRAPH ENGINE · READY</span>
                <span class="hidden lg:inline">CHAIN · TRON / ETH</span>
            </div>
            <div class="hidden md:flex items-center gap-5">
                <span>BUILD 0.4.2-LEA</span>
                <span class="text-slate-400">LEA EDITION</span>
            </div>
        </div>
    </div>

    <!-- Header -->
    <header class="sticky top-0 z-40 backdrop-blur-md bg-[#0B0D11]/88 border-b border-[rgba(255,255,255,0.06)]">
        <div class="max-w-[1480px] mx-auto px-6 h-16 flex items-center justify-between">
            <a href="#hero" class="flex items-center gap-3 group">
                <div class="relative">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <path d="M14 1L3 5.5V14C3 20.5 7.5 25.8 14 27C20.5 25.8 25 20.5 25 14V5.5L14 1Z"
                            stroke="#E6C766" stroke-width="1.2" fill="rgba(230, 199, 102, 0.08)" />
                        <path d="M14 7L9 9.2V14C9 17.5 11 20.6 14 21.5C17 20.6 19 17.5 19 14V9.2L14 7Z" stroke="#F1D98A"
                            stroke-width="1" fill="none" />
                        <circle cx="14" cy="14" r="1.5" fill="#E6C766" />
                        <path d="M14 14L17 11M14 14L11 17M14 14L17 17M14 14L11 11" stroke="#E6C766" stroke-width="0.6"
                            opacity="0.5" />
                    </svg>
                </div>
                <div class="flex flex-col leading-none">
                    <span class="font-semibold tracking-wider text-[15px]">TRACEVERSE</span>
                    <span class="font-mono text-[9px] text-slate-500 tracking-[0.18em] mt-0.5">VASP ATTRIBUTION
                        SUITE</span>
                </div>
            </a>
            <nav class="hidden lg:flex items-center gap-9">
                <a href="#platform" class="nav-link">Platform</a>
                <a href="#workflow" class="nav-link">Investigation Workflow</a>
                <a href="#evidence" class="nav-link">Evidence</a>
                <a href="#registry" class="nav-link">VASP Intelligence</a>
                <a href="#methodology" class="nav-link">Methodology</a>
            </nav>
            <div class="flex items-center gap-3">
                <span class="hidden sm:inline-flex tag tag-amber">LEA EDITION</span>
                <button onclick="window.location.href='/app'" class="btn-primary">
                    <span>Open Investigation Console</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    </header>

    <!-- HERO -->
    <section id="hero" class="relative overflow-hidden border-b border-[#1A2436]">
        <div class="absolute inset-0 bg-grid opacity-40"></div>
        <div class="absolute inset-0 glow-top"></div>
        <div class="absolute inset-0 scanline pointer-events-none"></div>
        <div class="relative max-w-[1480px] mx-auto px-6 pt-20 pb-16">
            <div class="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                <!-- Left: copy -->
                <div class="lg:col-span-5">
                    <div class="flex items-center gap-3 mb-7">
                        <span class="h-px w-8 bg-[#E6C766]"></span>
                        <span class="label-accent">Blockchain Investigation · VASP Attribution · Evidence</span>
                    </div>
                    <h1 class="text-[44px] md:text-[56px] leading-[1.04] font-bold tracking-tight text-white">
                        Trace the flow.<br>
                        Identify the endpoint.<br>
                        <span class="text-[#E6C766]">Build the evidence.</span>
                    </h1>
                    <p class="mt-7 text-[15px] text-slate-400 leading-relaxed max-w-[480px]">
                        TRACEVERSE analyzes blockchain transaction flows to identify probable Virtual Asset Service
                        Provider associations for unknown wallets, with every attribution backed by observable on-chain
                        evidence.
                    </p>
                    <div class="mt-9 flex flex-wrap gap-3">
                        <button onclick="window.location.href='/app'" class="btn-primary">
                            <span>Open Investigation Console</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2.5">
                                <path d="M5 12h14M13 5l7 7-7 7" />
                            </svg>
                        </button>
                        <a href="#methodology" class="btn-secondary">
                            <span>View Methodology</span>
                        </a>
                    </div>
                    <div class="mt-10 grid grid-cols-3 gap-4 max-w-[480px]">
                        <div class="border-l border-[#1A2436] pl-4">
                            <div class="font-mono text-2xl text-white font-medium">3</div>
                            <div class="label mt-1">Hop Depth</div>
                        </div>
                        <div class="border-l border-[#1A2436] pl-4">
                            <div class="font-mono text-2xl text-white font-medium">14</div>
                            <div class="label mt-1">VASPs Tracked</div>
                        </div>
                        <div class="border-l border-[#1A2436] pl-4">
                            <div class="font-mono text-2xl text-white font-medium">1,595</div>
                            <div class="label mt-1">Seed Addresses</div>
                        </div>
                    </div>
                </div>

                <!-- Right: Console preview -->
                <div class="lg:col-span-7">
                    <div class="console-frame relative rounded-md">
                        <span class="corner-tick tl"></span>
                        <span class="corner-tick tr"></span>
                        <span class="corner-tick bl"></span>
                        <span class="corner-tick br"></span>

                        <!-- Console header -->
                        <div
                            class="flex items-center justify-between px-4 py-2.5 border-b border-[#1A2436] bg-[#0A1020]">
                            <div class="flex items-center gap-3">
                                <div class="flex gap-1.5">
                                    <span class="w-2 h-2 rounded-full bg-[#475569]"></span>
                                    <span class="w-2 h-2 rounded-full bg-[#475569]"></span>
                                    <span class="w-2 h-2 rounded-full bg-[#55C98A]"></span>
                                </div>
                                <span class="label">Investigation Console</span>
                                <span class="tag tag-amber">LEA EDITION</span>
                            </div>
                            <div class="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                                <span class="flex items-center gap-1.5"><span class="status-dot live"></span>SESSION ·
                                    8F3A-2241</span>
                            </div>
                        </div>

                        <!-- Address input bar -->
                        <div class="px-4 py-3 border-b border-[#1A2436] bg-[#0E1626]">
                            <div class="flex items-center gap-2 mb-2.5">
                                <span class="label">Target Address</span>
                                <span class="label text-slate-600">/</span>
                                <span class="label-accent">UNKNOWN WALLET</span>
                            </div>
                            <div class="flex items-center gap-2 flex-wrap">
                                <div
                                    class="flex-1 min-w-[240px] flex items-center gap-2 bg-[#060A12] border border-[#1A2436] px-3 py-2 rounded-sm font-mono text-[12px]">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B"
                                        stroke-width="2">
                                        <circle cx="11" cy="11" r="7" />
                                        <path d="m21 21-4.3-4.3" />
                                    </svg>
                                    <span class="text-slate-300">T9xK2aF4qR8mN3vL7pH5Q2sJ9dY6bV1cWZ</span>
                                    <span class="ml-auto text-slate-600 text-[10px]">34 chars</span>
                                </div>
                                <span class="tag tag-accent">TRON</span>
                                <span class="tag">TRC-20</span>
                                <span class="tag">3-HOP</span>
                                <button class="btn-primary !py-2 !px-3 !text-[11px]">
                                    <span>INVESTIGATE</span>
                                </button>
                            </div>
                        </div>

                        <!-- Main split -->
                        <div class="grid grid-cols-12 gap-px bg-[#1A2436]">
                            <!-- Graph panel -->
                            <div class="col-span-12 md:col-span-8 bg-[#0E1626]">
                                <div class="flex items-center justify-between px-4 py-2 border-b border-[#1A2436]">
                                    <div class="flex items-center gap-2">
                                        <span class="label">Transaction Graph</span>
                                        <span class="label text-slate-600">·</span>
                                        <span class="label text-slate-500">BOUNDED · 3 HOPS</span>
                                    </div>
                                    <div class="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                                        <span class="flex items-center gap-1.5"><span
                                                class="w-2 h-2 rounded-full bg-slate-400"></span>UNKNOWN</span>
                                        <span class="flex items-center gap-1.5"><span
                                                class="w-2 h-2 rounded-full bg-[#FBBF24]"></span>INTERMEDIARY</span>
                                        <span class="flex items-center gap-1.5"><span
                                                class="w-2 h-2 rounded-full bg-[#55C98A]"></span>VASP</span>
                                    </div>
                                </div>
                                <div class="relative h-[280px] bg-[#060A12] bg-grid-fine">
                                    <svg viewBox="0 0 560 280" class="w-full h-full">
                                        <!-- Edges -->
                                        <defs>
                                            <marker id="arrow-gold" viewBox="0 0 10 10" refX="9" refY="5"
                                                markerWidth="5" markerHeight="5" orient="auto">
                                                <path d="M0,0 L10,5 L0,10 z" fill="#E6C766" opacity="0.7" />
                                            </marker>
                                            <marker id="arrow-slate" viewBox="0 0 10 10" refX="9" refY="5"
                                                markerWidth="5" markerHeight="5" orient="auto">
                                                <path d="M0,0 L10,5 L0,10 z" fill="#64748B" opacity="0.6" />
                                            </marker>
                                        </defs>
                                        <!-- input to hop1 -->
                                        <path d="M 70 140 C 130 80, 180 80, 220 100" stroke="#475569" stroke-width="1.2"
                                            fill="none" marker-end="url(#arrow-slate)" class="flow-edge" />
                                        <path d="M 70 140 C 130 200, 180 200, 220 180" stroke="#475569"
                                            stroke-width="1.2" fill="none" marker-end="url(#arrow-slate)"
                                            class="flow-edge" />
                                        <!-- hop1 to hop2 -->
                                        <path d="M 250 100 C 300 90, 320 90, 360 110" stroke="#475569"
                                            stroke-width="1.2" fill="none" marker-end="url(#arrow-slate)"
                                            class="flow-edge" />
                                        <path d="M 250 180 C 300 170, 320 130, 360 130" stroke="#475569"
                                            stroke-width="1.2" fill="none" marker-end="url(#arrow-slate)"
                                            class="flow-edge" />
                                        <path d="M 250 180 C 300 220, 320 220, 360 200" stroke="#475569"
                                            stroke-width="1" fill="none" opacity="0.4" />
                                        <!-- hop2 to vasp -->
                                        <path d="M 390 110 C 430 110, 440 130, 470 140" stroke="#E6C766"
                                            stroke-width="1.4" fill="none" marker-end="url(#arrow-gold)"
                                            class="flow-edge" />
                                        <path d="M 390 130 C 430 130, 440 140, 470 140" stroke="#E6C766"
                                            stroke-width="1.4" fill="none" marker-end="url(#arrow-gold)"
                                            class="flow-edge" />
                                        <path d="M 390 200 C 430 200, 440 160, 470 150" stroke="#E6C766"
                                            stroke-width="1" fill="none" opacity="0.5" marker-end="url(#arrow-gold)" />

                                        <!-- Input node -->
                                        <g>
                                            <circle cx="50" cy="140" r="20" fill="rgba(230,199,102,0.08)"
                                                stroke="#E6C766" stroke-width="1.4" />
                                            <circle cx="50" cy="140" r="4" fill="#E6C766" />
                                            <text x="50" y="178" text-anchor="middle" font-family="IBM Plex Mono"
                                                font-size="9" fill="#94A3B8">INPUT WALLET</text>
                                            <text x="50" y="190" text-anchor="middle" font-family="IBM Plex Mono"
                                                font-size="8" fill="#475569">T9xK...cWZ</text>
                                        </g>
                                        <!-- Hop 1 -->
                                        <g>
                                            <circle cx="235" cy="100" r="11" fill="#0E1626" stroke="#475569"
                                                stroke-width="1" />
                                            <circle cx="235" cy="100" r="3" fill="#94A3B8" />
                                            <text x="235" y="84" text-anchor="middle" font-family="IBM Plex Mono"
                                                font-size="8" fill="#64748B">HOP 1 · TX</text>
                                        </g>
                                        <g>
                                            <circle cx="235" cy="180" r="11" fill="#0E1626" stroke="#475569"
                                                stroke-width="1" />
                                            <circle cx="235" cy="180" r="3" fill="#94A3B8" />
                                            <text x="235" y="200" text-anchor="middle" font-family="IBM Plex Mono"
                                                font-size="8" fill="#64748B">HOP 1</text>
                                        </g>
                                        <!-- Hop 2 -->
                                        <g>
                                            <circle cx="375" cy="110" r="9" fill="#0E1626" stroke="#FBBF24"
                                                stroke-width="1" />
                                            <circle cx="375" cy="110" r="2.5" fill="#FBBF24" />
                                            <text x="375" y="94" text-anchor="middle" font-family="IBM Plex Mono"
                                                font-size="8" fill="#64748B">HOP 2</text>
                                        </g>
                                        <g>
                                            <circle cx="375" cy="130" r="9" fill="#0E1626" stroke="#FBBF24"
                                                stroke-width="1" />
                                            <circle cx="375" cy="130" r="2.5" fill="#FBBF24" />
                                        </g>
                                        <g>
                                            <circle cx="375" cy="200" r="9" fill="#0E1626" stroke="#FBBF24"
                                                stroke-width="1" opacity="0.6" />
                                            <circle cx="375" cy="200" r="2.5" fill="#FBBF24" opacity="0.6" />
                                        </g>
                                        <!-- VASP endpoint -->
                                        <g class="node-pulse">
                                            <circle cx="490" cy="140" r="22" fill="rgba(85,201,138,0.08)"
                                                stroke="#55C98A" stroke-width="1.4" />
                                            <circle cx="490" cy="140" r="13" fill="rgba(74,222,128,0.04)"
                                                stroke="#55C98A" stroke-width="0.6" />
                                            <circle cx="490" cy="140" r="5" fill="#55C98A" />
                                            <text x="490" y="178" text-anchor="middle" font-family="IBM Plex Mono"
                                                font-size="9" fill="#55C98A">VASP ENDPOINT</text>
                                            <text x="490" y="190" text-anchor="middle" font-family="IBM Plex Mono"
                                                font-size="8" fill="#475569">COINBASE · CLUSTER</text>
                                        </g>
                                    </svg>
                                    <!-- Mini metrics overlay -->
                                    <div class="absolute top-3 left-3 flex flex-col gap-1 text-[10px] font-mono">
                                        <div class="text-slate-500">NODES <span class="text-slate-300 ml-1">153</span>
                                        </div>
                                        <div class="text-slate-500">EDGES <span class="text-slate-300 ml-1">305</span>
                                        </div>
                                        <div class="text-slate-500">DEPTH <span class="text-slate-300 ml-1">3</span>
                                        </div>
                                    </div>
                                    <div class="absolute bottom-3 right-3 text-[10px] font-mono text-slate-600">
                                        CYCLE SUPPRESSION · ON
                                    </div>
                                </div>
                            </div>

                            <!-- Attribution panel -->
                            <div class="col-span-12 md:col-span-4 bg-[#0E1626]">
                                <div class="px-4 py-2 border-b border-[#1A2436] flex items-center justify-between">
                                    <span class="label">Attribution Ranking</span>
                                    <span class="text-[9px] font-mono text-slate-600">PROBABILISTIC</span>
                                </div>
                                <div class="p-3 space-y-2.5">
                                    <div class="panel-2 rounded-sm p-3 relative">
                                        <div class="absolute top-0 left-0 w-1 h-full bg-[#55C98A] rounded-l-sm"></div>
                                        <div class="flex items-start justify-between mb-2">
                                            <div>
                                                <div class="text-[11px] font-mono text-slate-500">01 · PRIMARY</div>
                                                <div class="text-[15px] font-semibold text-white mt-0.5">Coinbase</div>
                                            </div>
                                            <div class="text-right">
                                                <div
                                                    class="font-mono text-[18px] text-[#55C98A] font-medium leading-none">
                                                    67.5</div>
                                                <div class="text-[9px] font-mono text-slate-500 mt-1">/ 100</div>
                                            </div>
                                        </div>
                                        <div class="bar-track">
                                            <div class="bar-fill"
                                                style="--w:67.5%; background:linear-gradient(90deg,#55C98A,#72D9A0);"
                                                data-w="67.5"></div>
                                        </div>
                                        <div class="text-[10px] font-mono text-slate-500 mt-1.5">MEDIUM STRENGTH ·
                                            INVESTIGATIVE LEAD</div>
                                    </div>
                                    <div class="panel rounded-sm p-3">
                                        <div class="flex items-start justify-between">
                                            <div>
                                                <div class="text-[11px] font-mono text-slate-500">02 · SECONDARY</div>
                                                <div class="text-[14px] font-medium text-slate-300 mt-0.5">Binance</div>
                                            </div>
                                            <div class="text-right">
                                                <div class="font-mono text-[16px] text-[#FBBF24] leading-none">42.1
                                                </div>
                                                <div class="text-[9px] font-mono text-slate-500 mt-1">/ 100</div>
                                            </div>
                                        </div>
                                        <div class="bar-track mt-2">
                                            <div class="bar-fill" data-w="42.1"
                                                style="background:linear-gradient(90deg,#FBBF24,#FCD34D);"></div>
                                        </div>
                                        <div class="text-[10px] font-mono text-slate-500 mt-1.5">LOW STRENGTH</div>
                                    </div>
                                    <div class="panel rounded-sm p-3 opacity-70">
                                        <div class="flex items-start justify-between">
                                            <div>
                                                <div class="text-[11px] font-mono text-slate-500">03</div>
                                                <div class="text-[14px] font-medium text-slate-400 mt-0.5">Kraken</div>
                                            </div>
                                            <div class="text-right">
                                                <div class="font-mono text-[16px] text-slate-400 leading-none">28.3
                                                </div>
                                                <div class="text-[9px] font-mono text-slate-500 mt-1">/ 100</div>
                                            </div>
                                        </div>
                                        <div class="bar-track mt-2">
                                            <div class="bar-fill" data-w="28.3" style="background:#475569;"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Ledger -->
                        <div class="border-t border-[#1A2436]">
                            <div
                                class="flex items-center justify-between px-4 py-2 border-b border-[#1A2436] bg-[#0A1020]">
                                <span class="label">Transaction Ledger · Observable Evidence</span>
                                <span class="text-[10px] font-mono text-slate-500">3 OF 305 SHOWN</span>
                            </div>
                            <div class="scroll-x overflow-x-auto">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Hash</th>
                                            <th>From</th>
                                            <th>To</th>
                                            <th>Value</th>
                                            <th>Block</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="ledger-row">
                                            <td class="text-[#E6C766]">0x4a5b…f2a3</td>
                                            <td>T9xK…cWZ</td>
                                            <td>TX8m…k9Qp</td>
                                            <td class="text-slate-300">12,400 USDT</td>
                                            <td>48,221,093</td>
                                            <td><span class="tag tag-green">VERIFIED</span></td>
                                        </tr>
                                        <tr class="ledger-row">
                                            <td class="text-[#E6C766]">0x9d2e…7c81</td>
                                            <td>TX8m…k9Qp</td>
                                            <td>TQ3r…m4Lz</td>
                                            <td class="text-slate-300">8,950 USDT</td>
                                            <td>48,221,088</td>
                                            <td><span class="tag tag-green">VERIFIED</span></td>
                                        </tr>
                                        <tr class="ledger-row">
                                            <td class="text-[#E6C766]">0x1f8c…3b22</td>
                                            <td>TQ3r…m4Lz</td>
                                            <td class="text-[#55C98A]">TK7v…oP2x <span class="text-slate-600">·
                                                    COINBASE</span></td>
                                            <td class="text-slate-300">8,950 USDT</td>
                                            <td>48,221,071</td>
                                            <td><span class="tag tag-green">VERIFIED</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Caption -->
                    <div class="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-600">
                        <span>FIG. 01 · INVESTIGATION CONSOLE PREVIEW — DEMONSTRATION DATA</span>
                        <span>TRON / TRC-20 · 3-HOP BOUNDED GRAPH</span>
                    </div>
                </div>
            </div>

            <!-- Trust strip -->
            <div class="mt-16 pt-8 border-t border-[#1A2436]">
                <div
                    class="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1A2436] border border-[#1A2436] rounded-sm overflow-hidden">
                    <div class="bg-[#0A1020] px-5 py-4 flex items-center gap-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E6C766" stroke-width="1.5">
                            <path d="M21 12a9 9 0 11-9-9c2.5 0 4.7 1 6.4 2.6" />
                            <path d="M21 3v6h-6" />
                        </svg>
                        <div>
                            <div class="text-[11px] font-mono text-slate-500">SOURCE</div>
                            <div class="text-[12px] text-slate-200 font-medium">Real Blockchain Data</div>
                        </div>
                    </div>
                    <div class="bg-[#0A1020] px-5 py-4 flex items-center gap-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E6C766" stroke-width="1.5">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
                        </svg>
                        <div>
                            <div class="text-[11px] font-mono text-slate-500">METHOD</div>
                            <div class="text-[12px] text-slate-200 font-medium">Bounded Graph Analysis</div>
                        </div>
                    </div>
                    <div class="bg-[#0A1020] px-5 py-4 flex items-center gap-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E6C766" stroke-width="1.5">
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                        </svg>
                        <div>
                            <div class="text-[11px] font-mono text-slate-500">OUTPUT</div>
                            <div class="text-[12px] text-slate-200 font-medium">Verifiable Evidence</div>
                        </div>
                    </div>
                    <div class="bg-[#0A1020] px-5 py-4 flex items-center gap-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E6C766" stroke-width="1.5">
                            <path
                                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        <div>
                            <div class="text-[11px] font-mono text-slate-500">REASONING</div>
                            <div class="text-[12px] text-slate-200 font-medium">Explainable Attribution</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 1: Investigation Pipeline -->
    <section id="workflow" class="border-b border-[#1A2436] py-24">
        <div class="max-w-[1480px] mx-auto px-6">
            <div class="flex items-end justify-between mb-12 flex-wrap gap-4">
                <div>
                    <div class="flex items-center gap-3 mb-3">
                        <span class="label-accent">§ 01 · Pipeline</span>
                        <span class="h-px w-12 bg-[#1A2436]"></span>
                    </div>
                    <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-white max-w-2xl">From unknown wallet
                        to investigation-ready evidence.</h2>
                </div>
                <p class="text-slate-400 max-w-md text-[14px] leading-relaxed">A deterministic, auditable pipeline. Each
                    stage produces a verifiable artifact that contributes to the final investigation dossier.</p>
            </div>

            <!-- Pipeline -->
            <div
                class="grid grid-cols-1 md:grid-cols-5 gap-px bg-[#1A2436] border border-[#1A2436] rounded-sm overflow-hidden">
                <!-- 01 -->
                <div class="step-card p-6 relative">
                    <div class="flex items-center justify-between mb-5">
                        <span class="font-mono text-[11px] text-[#E6C766]">01</span>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E6C766" stroke-width="1.4">
                            <ellipse cx="12" cy="5" rx="9" ry="3" />
                            <path d="M3 5v14a9 3 0 0018 0V5" />
                            <path d="M3 12a9 3 0 0018 0" />
                        </svg>
                    </div>
                    <h3 class="text-[13px] font-semibold text-white tracking-wide mb-2">DATA ACQUISITION</h3>
                    <p class="text-[12px] text-slate-400 leading-relaxed">Fetch native and token transaction activity
                        from blockchain intelligence APIs.</p>
                    <div class="mt-4 pt-4 border-t border-[#1A2436] text-[10px] font-mono text-slate-600 space-y-1">
                        <div>SRC · TRONGRID</div>
                        <div>SRC · ETHERSCAN</div>
                        <div>OUT · TX STREAM</div>
                    </div>
                </div>
                <!-- 02 -->
                <div class="step-card p-6 relative">
                    <div class="flex items-center justify-between mb-5">
                        <span class="font-mono text-[11px] text-[#E6C766]">02</span>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E6C766" stroke-width="1.4">
                            <circle cx="6" cy="6" r="3" />
                            <circle cx="18" cy="6" r="3" />
                            <circle cx="6" cy="18" r="3" />
                            <circle cx="18" cy="18" r="3" />
                            <path d="M9 6h6M6 9v6M18 9v6M9 18h6" />
                        </svg>
                    </div>
                    <h3 class="text-[13px] font-semibold text-white tracking-wide mb-2">GRAPH CONSTRUCTION</h3>
                    <p class="text-[12px] text-slate-400 leading-relaxed">Build a bounded directed transaction graph
                        with configurable hop depth.</p>
                    <div class="mt-4 pt-4 border-t border-[#1A2436] text-[10px] font-mono text-slate-600 space-y-1">
                        <div>DEPTH · 3 HOPS</div>
                        <div>CYCLE SUPPRESSION</div>
                        <div>OUT · 153 NODES</div>
                    </div>
                </div>
                <!-- 03 -->
                <div class="step-card p-6 relative">
                    <div class="flex items-center justify-between mb-5">
                        <span class="font-mono text-[11px] text-[#E6C766]">03</span>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E6C766" stroke-width="1.4">
                            <circle cx="12" cy="12" r="9" />
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
                        </svg>
                    </div>
                    <h3 class="text-[13px] font-semibold text-white tracking-wide mb-2">VASP MATCHING</h3>
                    <p class="text-[12px] text-slate-400 leading-relaxed">Compare observed addresses against a curated
                        VASP intelligence registry.</p>
                    <div class="mt-4 pt-4 border-t border-[#1A2436] text-[10px] font-mono text-slate-600 space-y-1">
                        <div>REGISTRY · 1,595 ADDR</div>
                        <div>MATCH · 2 ENDPOINTS</div>
                        <div>OUT · CANDIDATE SET</div>
                    </div>
                </div>
                <!-- 04 -->
                <div class="step-card p-6 relative">
                    <div class="flex items-center justify-between mb-5">
                        <span class="font-mono text-[11px] text-[#E6C766]">04</span>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E6C766" stroke-width="1.4">
                            <path d="M3 3v18h18" />
                            <path d="M7 14l3-3 3 3 5-7" />
                        </svg>
                    </div>
                    <h3 class="text-[13px] font-semibold text-white tracking-wide mb-2">ATTRIBUTION & ANALYSIS</h3>
                    <p class="text-[12px] text-slate-400 leading-relaxed">Rank probable VASP associations using
                        explainable scoring signals.</p>
                    <div class="mt-4 pt-4 border-t border-[#1A2436] text-[10px] font-mono text-slate-600 space-y-1">
                        <div>SIGNALS · 5</div>
                        <div>WEIGHTED · PROBABILISTIC</div>
                        <div>OUT · SCORED RANKING</div>
                    </div>
                </div>
                <!-- 05 -->
                <div class="step-card p-6 relative">
                    <div class="flex items-center justify-between mb-5">
                        <span class="font-mono text-[11px] text-[#E6C766]">05</span>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E6C766" stroke-width="1.4">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <path d="M14 2v6h6M8 13h8M8 17h5" />
                        </svg>
                    </div>
                    <h3 class="text-[13px] font-semibold text-white tracking-wide mb-2">INVESTIGATION DOSSIER</h3>
                    <p class="text-[12px] text-slate-400 leading-relaxed">Combine transactions, graph paths, provenance
                        and findings into an exportable record.</p>
                    <div class="mt-4 pt-4 border-t border-[#1A2436] text-[10px] font-mono text-slate-600 space-y-1">
                        <div>FORMAT · JSON / PDF</div>
                        <div>SIGNED · CHAIN OF CUSTODY</div>
                        <div>OUT · DOSSIER</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 2: Transaction Graph -->
    <section id="platform" class="border-b border-[#1A2436] py-24 relative">
        <div class="absolute inset-0 bg-grid-fine opacity-30"></div>
        <div class="relative max-w-[1480px] mx-auto px-6">
            <div class="mb-12">
                <div class="flex items-center gap-3 mb-3">
                    <span class="label-accent">§ 02 · Graph</span>
                    <span class="h-px w-12 bg-[#1A2436]"></span>
                </div>
                <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-white max-w-2xl">See the relationship, not
                    just the address.</h2>
            </div>

            <div class="grid lg:grid-cols-12 gap-6">
                <!-- Graph -->
                <div class="lg:col-span-8">
                    <div class="panel rounded-sm relative">
                        <div class="flex items-center justify-between px-4 py-2.5 border-b border-[#1A2436]">
                            <div class="flex items-center gap-3">
                                <span class="label">Investigation Graph · Case 4821-A</span>
                                <span class="tag tag-accent">TRON · TRC-20</span>
                            </div>
                            <div class="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                                <span class="status-dot live"></span>LIVE TRACE
                            </div>
                        </div>
                        <div class="relative bg-[#060A12] bg-grid-fine h-[460px]">
                            <svg viewBox="0 0 800 460" class="w-full h-full">
                                <defs>
                                    <marker id="arr-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6"
                                        markerHeight="6" orient="auto">
                                        <path d="M0,0 L10,5 L0,10 z" fill="#E6C766" opacity="0.8" />
                                    </marker>
                                    <marker id="arr-s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5"
                                        markerHeight="5" orient="auto">
                                        <path d="M0,0 L10,5 L0,10 z" fill="#64748B" opacity="0.6" />
                                    </marker>
                                    <marker id="arr-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6"
                                        markerHeight="6" orient="auto">
                                        <path d="M0,0 L10,5 L0,10 z" fill="#55C98A" opacity="0.8" />
                                    </marker>
                                </defs>

                                <!-- Layer labels -->
                                <text x="80" y="35" font-family="IBM Plex Mono" font-size="10" fill="#475569"
                                    letter-spacing="1.5">INPUT WALLET</text>
                                <text x="280" y="35" font-family="IBM Plex Mono" font-size="10" fill="#475569"
                                    letter-spacing="1.5">HOP 1</text>
                                <text x="480" y="35" font-family="IBM Plex Mono" font-size="10" fill="#475569"
                                    letter-spacing="1.5">HOP 2</text>
                                <text x="680" y="35" font-family="IBM Plex Mono" font-size="10" fill="#475569"
                                    letter-spacing="1.5">VASP ENDPOINT</text>

                                <!-- vertical guides -->
                                <line x1="100" y1="50" x2="100" y2="430" stroke="#1A2436" stroke-dasharray="2 4" />
                                <line x1="320" y1="50" x2="320" y2="430" stroke="#1A2436" stroke-dasharray="2 4" />
                                <line x1="520" y1="50" x2="520" y2="430" stroke="#1A2436" stroke-dasharray="2 4" />
                                <line x1="720" y1="50" x2="720" y2="430" stroke="#1A2436" stroke-dasharray="2 4" />

                                <!-- edges -->
                                <!-- input -> hop1 -->
                                <path d="M 125 240 C 200 160, 240 160, 295 175" stroke="#64748B" stroke-width="1.2"
                                    fill="none" marker-end="url(#arr-s)" class="flow-edge" />
                                <path d="M 125 240 C 200 320, 240 320, 295 305" stroke="#64748B" stroke-width="1.2"
                                    fill="none" marker-end="url(#arr-s)" class="flow-edge" />
                                <path d="M 125 240 C 200 240, 240 240, 295 240" stroke="#64748B" stroke-width="1"
                                    fill="none" marker-end="url(#arr-s)" class="flow-edge" opacity="0.5" />

                                <!-- hop1 -> hop2 -->
                                <path d="M 345 175 C 400 140, 440 140, 495 165" stroke="#64748B" stroke-width="1.2"
                                    fill="none" marker-end="url(#arr-s)" class="flow-edge" />
                                <path d="M 345 175 C 400 220, 440 240, 495 245" stroke="#64748B" stroke-width="1"
                                    fill="none" marker-end="url(#arr-s)" class="flow-edge" opacity="0.7" />
                                <path d="M 345 240 C 400 200, 440 170, 495 170" stroke="#64748B" stroke-width="1.2"
                                    fill="none" marker-end="url(#arr-s)" class="flow-edge" />
                                <path d="M 345 305 C 400 280, 440 250, 495 250" stroke="#64748B" stroke-width="1"
                                    fill="none" marker-end="url(#arr-s)" class="flow-edge" opacity="0.6" />
                                <path d="M 345 305 C 400 340, 440 340, 495 330" stroke="#475569" stroke-width="0.8"
                                    fill="none" opacity="0.4" stroke-dasharray="3 3" />

                                <!-- hop2 -> vasp -->
                                <path d="M 545 165 C 600 165, 640 200, 695 220" stroke="#55C98A" stroke-width="1.6"
                                    fill="none" marker-end="url(#arr-g)" class="flow-edge" />
                                <path d="M 545 245 C 600 245, 640 235, 695 235" stroke="#55C98A" stroke-width="1.6"
                                    fill="none" marker-end="url(#arr-g)" class="flow-edge" />
                                <path d="M 545 330 C 600 320, 640 280, 695 260" stroke="#55C98A" stroke-width="1.2"
                                    fill="none" marker-end="url(#arr-g)" class="flow-edge" opacity="0.6" />

                                <!-- Input node -->
                                <g>
                                    <circle cx="100" cy="240" r="28" fill="rgba(230,199,102,0.10)" stroke="#E6C766"
                                        stroke-width="1.5" />
                                    <circle cx="100" cy="240" r="20" fill="none" stroke="#E6C766" stroke-width="0.5"
                                        opacity="0.5" />
                                    <circle cx="100" cy="240" r="6" fill="#E6C766" />
                                    <text x="100" y="285" text-anchor="middle" font-family="IBM Plex Mono"
                                        font-size="10" fill="#94A3B8">T9xK2aF4...</text>
                                    <text x="100" y="298" text-anchor="middle" font-family="IBM Plex Mono" font-size="8"
                                        fill="#475569">UNKNOWN</text>
                                </g>

                                <!-- Hop 1 nodes -->
                                <g>
                                    <circle cx="320" cy="175" r="13" fill="#0E1626" stroke="#FBBF24"
                                        stroke-width="1.2" />
                                    <circle cx="320" cy="175" r="4" fill="#FBBF24" />
                                    <text x="320" y="200" text-anchor="middle" font-family="IBM Plex Mono" font-size="9"
                                        fill="#64748B">TX8m9kQp</text>
                                </g>
                                <g>
                                    <circle cx="320" cy="240" r="13" fill="#0E1626" stroke="#FBBF24"
                                        stroke-width="1.2" />
                                    <circle cx="320" cy="240" r="4" fill="#FBBF24" />
                                    <text x="320" y="265" text-anchor="middle" font-family="IBM Plex Mono" font-size="9"
                                        fill="#64748B">TY2hR5nL</text>
                                </g>
                                <g>
                                    <circle cx="320" cy="305" r="13" fill="#0E1626" stroke="#FBBF24"
                                        stroke-width="1.2" />
                                    <circle cx="320" cy="305" r="4" fill="#FBBF24" />
                                    <text x="320" y="330" text-anchor="middle" font-family="IBM Plex Mono" font-size="9"
                                        fill="#64748B">TQ4rK9vM</text>
                                </g>

                                <!-- Hop 2 nodes -->
                                <g>
                                    <circle cx="520" cy="165" r="11" fill="#0E1626" stroke="#FBBF24" stroke-width="1" />
                                    <circle cx="520" cy="165" r="3" fill="#FBBF24" />
                                    <text x="520" y="148" text-anchor="middle" font-family="IBM Plex Mono" font-size="9"
                                        fill="#64748B">TZ7m2Lp</text>
                                </g>
                                <g>
                                    <circle cx="520" cy="245" r="11" fill="#0E1626" stroke="#FBBF24" stroke-width="1" />
                                    <circle cx="520" cy="245" r="3" fill="#FBBF24" />
                                    <text x="520" y="270" text-anchor="middle" font-family="IBM Plex Mono" font-size="9"
                                        fill="#64748B">TW9fN3bQ</text>
                                </g>
                                <g>
                                    <circle cx="520" cy="330" r="11" fill="#0E1626" stroke="#475569" stroke-width="1"
                                        opacity="0.6" />
                                    <circle cx="520" cy="330" r="3" fill="#475569" opacity="0.6" />
                                    <text x="520" y="350" text-anchor="middle" font-family="IBM Plex Mono" font-size="9"
                                        fill="#475569" opacity="0.6">pruned</text>
                                </g>

                                <!-- VASP endpoint -->
                                <g class="node-pulse">
                                    <circle cx="720" cy="235" r="32" fill="rgba(85,201,138,0.08)" stroke="#55C98A"
                                        stroke-width="1.6" />
                                    <circle cx="720" cy="235" r="22" fill="rgba(74,222,128,0.04)" stroke="#55C98A"
                                        stroke-width="0.6" />
                                    <circle cx="720" cy="235" r="8" fill="#55C98A" />
                                    <text x="720" y="280" text-anchor="middle" font-family="IBM Plex Mono"
                                        font-size="11" fill="#55C98A" font-weight="500">TK7v2oP2x</text>
                                    <text x="720" y="293" text-anchor="middle" font-family="IBM Plex Mono" font-size="9"
                                        fill="#475569">COINBASE · CLUSTER</text>
                                </g>

                                <!-- Annotation -->
                                <g>
                                    <rect x="540" y="55" width="200" height="34" fill="rgba(14,22,38,0.9)"
                                        stroke="#1A2436" />
                                    <text x="550" y="70" font-family="IBM Plex Mono" font-size="9" fill="#94A3B8">MATCH
                                        · COINBASE</text>
                                    <text x="550" y="82" font-family="IBM Plex Mono" font-size="9" fill="#55C98A">CONF ·
                                        67.5 / 100</text>
                                    <line x1="640" y1="89" x2="700" y2="215" stroke="#55C98A" stroke-width="0.5"
                                        stroke-dasharray="2 3" />
                                </g>
                            </svg>
                        </div>
                        <!-- Legend strip -->
                        <div
                            class="flex items-center justify-between px-4 py-2 border-t border-[#1A2436] text-[10px] font-mono text-slate-500">
                            <div class="flex items-center gap-4">
                                <span>DEPTH · 3</span>
                                <span>PRUNED · 1</span>
                                <span>CYCLES · SUPPRESSED</span>
                            </div>
                            <span>RENDERED · 18:42:09 UTC</span>
                        </div>
                    </div>
                </div>

                <!-- Side panel -->
                <div class="lg:col-span-4 space-y-4">
                    <div class="panel p-5 rounded-sm">
                        <span class="label">Graph Properties</span>
                        <div class="mt-4 space-y-3 text-[13px]">
                            <div class="flex items-center justify-between">
                                <span class="text-slate-400">Bounded graph traversal</span>
                                <span class="font-mono text-[#55C98A] text-[12px]">ENABLED</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-slate-400">Maximum depth</span>
                                <span class="font-mono text-slate-200 text-[12px]">3 HOPS</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-slate-400">Cycle suppression</span>
                                <span class="font-mono text-[#55C98A] text-[12px]">ON</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-slate-400">VASP terminal pruning</span>
                                <span class="font-mono text-[#55C98A] text-[12px]">ON</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-slate-400">Observable paths</span>
                                <span class="font-mono text-slate-200 text-[12px]">5 ROUTES</span>
                            </div>
                        </div>
                    </div>

                    <div
                        class="grid grid-cols-3 gap-px bg-[#1A2436] border border-[#1A2436] rounded-sm overflow-hidden">
                        <div class="bg-[#0E1626] p-4">
                            <div class="font-mono text-2xl text-white font-medium">153</div>
                            <div class="label mt-1">Nodes</div>
                        </div>
                        <div class="bg-[#0E1626] p-4">
                            <div class="font-mono text-2xl text-white font-medium">305</div>
                            <div class="label mt-1">Transfers</div>
                        </div>
                        <div class="bg-[#0E1626] p-4">
                            <div class="font-mono text-2xl text-[#55C98A] font-medium">2</div>
                            <div class="label mt-1">VASP Ends</div>
                        </div>
                    </div>

                    <div class="panel p-5 rounded-sm">
                        <div class="flex items-center gap-2 mb-3">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FBBF24"
                                stroke-width="1.6">
                                <path d="M12 9v4M12 17h.01" />
                                <path
                                    d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            <span class="label text-[#FBBF24]">Investigator Note</span>
                        </div>
                        <p class="text-[12px] text-slate-400 leading-relaxed">
                            Graph traversal terminates at the first observed VASP association. Subsequent hops beyond a
                            verified endpoint are pruned to preserve analytical clarity and avoid attribution drift.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 3: Attribution -->
    <section id="attribution" class="border-b border-[#1A2436] py-24">
        <div class="max-w-[1480px] mx-auto px-6">
            <div class="mb-12">
                <div class="flex items-center gap-3 mb-3">
                    <span class="label-accent">§ 03 · Attribution</span>
                    <span class="h-px w-12 bg-[#1A2436]"></span>
                </div>
                <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-white max-w-2xl">Every attribution has a
                    reason.</h2>
                <p class="mt-4 text-slate-400 max-w-xl text-[14px] leading-relaxed">Attribution scores decompose into
                    observable signal components. Each contributor can be inspected, weighted, and audited.</p>
            </div>

            <div class="grid lg:grid-cols-12 gap-6">
                <!-- Primary attribution card -->
                <div class="lg:col-span-5">
                    <div class="panel-2 rounded-sm relative overflow-hidden">
                        <div
                            class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#55C98A] to-transparent">
                        </div>
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-1">
                                <span class="label">Primary VASP Attribution</span>
                                <span class="tag tag-green">CANDIDATE 01</span>
                            </div>
                            <div class="flex items-end gap-4 mt-6">
                                <div>
                                    <div class="text-[36px] font-bold text-white tracking-tight leading-none">Coinbase
                                    </div>
                                    <div class="text-[12px] font-mono text-slate-500 mt-2">COINBASE GLOBAL, INC. ·
                                        NASDAQ:COIN</div>
                                </div>
                            </div>
                            <div class="mt-8 flex items-baseline gap-3">
                                <span class="font-mono text-[64px] text-[#55C98A] font-medium leading-none">67.5</span>
                                <span class="font-mono text-slate-500">/ 100</span>
                                <span class="ml-auto tag tag-amber">MEDIUM STRENGTH</span>
                            </div>
                            <div class="mt-3 bar-track" style="height:6px;">
                                <div class="bar-fill" data-w="67.5"
                                    style="background:linear-gradient(90deg,#55C98A,#72D9A0);"></div>
                            </div>
                            <div class="mt-6 grid grid-cols-2 gap-3 text-[11px] font-mono">
                                <div>
                                    <div class="text-slate-500">REGISTRY ADDRESS</div>
                                    <div class="text-slate-300 mt-1">TK7v2oP2x9mQ4fR8...</div>
                                </div>
                                <div>
                                    <div class="text-slate-500">PROVENANCE</div>
                                    <div class="text-slate-300 mt-1">Public PoR · Institutional</div>
                                </div>
                                <div>
                                    <div class="text-slate-500">CHAIN</div>
                                    <div class="text-slate-300 mt-1">TRON · TRC-20</div>
                                </div>
                                <div>
                                    <div class="text-slate-500">OBSERVED TRANSFERS</div>
                                    <div class="text-slate-300 mt-1">3 · 8,950 USDT</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Scoring breakdown -->
                <div class="lg:col-span-7">
                    <div class="panel rounded-sm">
                        <div class="flex items-center justify-between px-5 py-3 border-b border-[#1A2436]">
                            <span class="label">Score Decomposition · Explainable Signals</span>
                            <button class="text-[11px] font-mono text-slate-500 hover:text-[#E6C766] transition">EXPAND
                                ALL</button>
                        </div>
                        <div class="p-5 space-y-4">
                            <!-- Signal 1 -->
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <span class="font-mono text-[10px] text-slate-600 w-6">01</span>
                                        <span class="text-[13px] text-slate-200 font-medium">Graph Proximity</span>
                                        <span class="text-[11px] font-mono text-slate-500">Distance to VASP endpoint
                                            within bounded graph</span>
                                    </div>
                                    <span class="font-mono text-[14px] text-white">35%</span>
                                </div>
                                <div class="bar-track ml-9">
                                    <div class="bar-fill" data-w="35"></div>
                                </div>
                            </div>
                            <!-- Signal 2 -->
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <span class="font-mono text-[10px] text-slate-600 w-6">02</span>
                                        <span class="text-[13px] text-slate-200 font-medium">Fund Flow</span>
                                        <span class="text-[11px] font-mono text-slate-500">Net transfer volume toward
                                            VASP cluster</span>
                                    </div>
                                    <span class="font-mono text-[14px] text-white">25%</span>
                                </div>
                                <div class="bar-track ml-9">
                                    <div class="bar-fill" data-w="25"></div>
                                </div>
                            </div>
                            <!-- Signal 3 -->
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <span class="font-mono text-[10px] text-slate-600 w-6">03</span>
                                        <span class="text-[13px] text-slate-200 font-medium">Interaction
                                            Frequency</span>
                                        <span class="text-[11px] font-mono text-slate-500">Number of distinct transfer
                                            events observed</span>
                                    </div>
                                    <span class="font-mono text-[14px] text-white">20%</span>
                                </div>
                                <div class="bar-track ml-9">
                                    <div class="bar-fill" data-w="20"></div>
                                </div>
                            </div>
                            <!-- Signal 4 -->
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <span class="font-mono text-[10px] text-slate-600 w-6">04</span>
                                        <span class="text-[13px] text-slate-200 font-medium">Behavior</span>
                                        <span class="text-[11px] font-mono text-slate-500">Temporal patterns consistent
                                            with cluster activity</span>
                                    </div>
                                    <span class="font-mono text-[14px] text-white">10%</span>
                                </div>
                                <div class="bar-track ml-9">
                                    <div class="bar-fill" data-w="10"></div>
                                </div>
                            </div>
                            <!-- Signal 5 -->
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <span class="font-mono text-[10px] text-slate-600 w-6">05</span>
                                        <span class="text-[13px] text-slate-200 font-medium">Recency</span>
                                        <span class="text-[11px] font-mono text-slate-500">Time-weighted proximity of
                                            latest transfer</span>
                                    </div>
                                    <span class="font-mono text-[14px] text-white">10%</span>
                                </div>
                                <div class="bar-track ml-9">
                                    <div class="bar-fill" data-w="10"></div>
                                </div>
                            </div>
                        </div>
                        <div class="px-5 py-4 border-t border-[#1A2436] bg-[#0A1020]">
                            <div class="flex items-start gap-3">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FBBF24"
                                    stroke-width="1.8" class="mt-0.5 flex-shrink-0">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M12 8v4M12 16h.01" />
                                </svg>
                                <p class="text-[12px] text-slate-400 leading-relaxed">
                                    Attribution represents probabilistic graph proximity and observable fund-flow
                                    association. It is an investigative lead, not definitive proof of ownership or
                                    criminal activity.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 4: Evidence Chain -->
    <section id="evidence" class="border-b border-[#1A2436] py-24 relative">
        <div class="absolute inset-0 bg-grid-fine opacity-30"></div>
        <div class="relative max-w-[1480px] mx-auto px-6">
            <div class="mb-12">
                <div class="flex items-center gap-3 mb-3">
                    <span class="label-accent">§ 04 · Evidence</span>
                    <span class="h-px w-12 bg-[#1A2436]"></span>
                </div>
                <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-white max-w-2xl">Evidence that can be
                    traced back to the chain.</h2>
                <p class="mt-4 text-slate-400 max-w-xl text-[14px] leading-relaxed">Every attribution resolves to a
                    verifiable chain of observations, each link independently auditable against the source blockchain.
                </p>
            </div>

            <!-- Chain flow -->
            <div class="panel rounded-sm p-6 mb-6">
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <div class="flex items-center gap-3">
                        <div class="text-center">
                            <div
                                class="w-14 h-14 border border-[#1A2436] rounded-sm flex items-center justify-center bg-[#0A1020]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6C766"
                                    stroke-width="1.5">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
                                </svg>
                            </div>
                            <div class="label mt-2">VASP</div>
                        </div>
                        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="#E6C766" stroke-width="1.2">
                            <path d="M1 7h17M13 1l6 6-6 6" stroke-dasharray="3 2" />
                        </svg>
                        <div class="text-center">
                            <div
                                class="w-14 h-14 border border-[#1A2436] rounded-sm flex items-center justify-center bg-[#0A1020]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6C766"
                                    stroke-width="1.5">
                                    <rect x="3" y="6" width="18" height="12" rx="1" />
                                    <path d="M3 10h18M7 15h4" />
                                </svg>
                            </div>
                            <div class="label mt-2">Address</div>
                        </div>
                        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="#E6C766" stroke-width="1.2">
                            <path d="M1 7h17M13 1l6 6-6 6" stroke-dasharray="3 2" />
                        </svg>
                        <div class="text-center">
                            <div
                                class="w-14 h-14 border border-[#1A2436] rounded-sm flex items-center justify-center bg-[#0A1020]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6C766"
                                    stroke-width="1.5">
                                    <path d="M4 4l16 16M4 20L20 4" opacity="0.3" />
                                    <path d="M4 12h6M14 12h6" />
                                </svg>
                            </div>
                            <div class="label mt-2">Tx Hash</div>
                        </div>
                        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="#E6C766" stroke-width="1.2">
                            <path d="M1 7h17M13 1l6 6-6 6" stroke-dasharray="3 2" />
                        </svg>
                        <div class="text-center">
                            <div
                                class="w-14 h-14 border border-[#1A2436] rounded-sm flex items-center justify-center bg-[#0A1020]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6C766"
                                    stroke-width="1.5">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M12 7v5l3 2" />
                                </svg>
                            </div>
                            <div class="label mt-2">Block</div>
                        </div>
                        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="#E6C766" stroke-width="1.2">
                            <path d="M1 7h17M13 1l6 6-6 6" stroke-dasharray="3 2" />
                        </svg>
                        <div class="text-center">
                            <div
                                class="w-14 h-14 border border-[#1A2436] rounded-sm flex items-center justify-center bg-[#0A1020]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6C766"
                                    stroke-width="1.5">
                                    <circle cx="6" cy="6" r="3" />
                                    <circle cx="18" cy="18" r="3" />
                                    <circle cx="18" cy="6" r="3" />
                                    <path d="M9 6h6M6 9v6M18 9v6M9 18h6" />
                                </svg>
                            </div>
                            <div class="label mt-2">Path</div>
                        </div>
                        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="#E6C766" stroke-width="1.2">
                            <path d="M1 7h17M13 1l6 6-6 6" stroke-dasharray="3 2" />
                        </svg>
                        <div class="text-center">
                            <div
                                class="w-14 h-14 border border-[#55C98A] bg-[rgba(74,222,128,0.06)] rounded-sm flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#55C98A"
                                    stroke-width="1.5">
                                    <path d="M9 11l3 3L22 4" />
                                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                                </svg>
                            </div>
                            <div class="label mt-2 text-[#55C98A]">Source</div>
                        </div>
                    </div>
                    <div class="text-[11px] font-mono text-slate-500">CHAIN OF CUSTODY · 6 LINKS</div>
                </div>
            </div>

            <!-- Evidence cards -->
            <div class="grid md:grid-cols-3 gap-6">
                <!-- Card 1 -->
                <div class="panel rounded-sm overflow-hidden">
                    <div class="px-5 py-3 border-b border-[#1A2436] flex items-center justify-between">
                        <span class="label">Entity Identification</span>
                        <span class="tag tag-green">VERIFIED</span>
                    </div>
                    <div class="p-5">
                        <p class="text-[13px] text-slate-300 leading-relaxed mb-4">Target address matches a verified
                            VASP-associated address present in the curated registry.</p>
                        <div class="space-y-2.5 text-[11px] font-mono">
                            <div>
                                <div class="text-slate-600">ADDRESS</div>
                                <div class="text-slate-300 mt-0.5">TK7v2oP2x9mQ4fR8yL3nK6wJ5dB</div>
                            </div>
                            <div>
                                <div class="text-slate-600">ENTITY</div>
                                <div class="text-[#55C98A] mt-0.5">COINBASE · CLUSTER 04</div>
                            </div>
                            <div>
                                <div class="text-slate-600">PROVENANCE</div>
                                <div class="text-slate-300 mt-0.5">Public PoR Disclosure · 2024-Q3</div>
                            </div>
                        </div>
                        <a href="#"
                            class="mt-4 inline-flex items-center gap-1.5 text-[11px] font-mono text-[#E6C766] hover:text-[#F1D98A]">
                            <span>VIEW SOURCE</span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M7 17L17 7M7 7h10v10" />
                            </svg>
                        </a>
                    </div>
                </div>
                <!-- Card 2 -->
                <div class="panel rounded-sm overflow-hidden">
                    <div class="px-5 py-3 border-b border-[#1A2436] flex items-center justify-between">
                        <span class="label">Graph Proximity</span>
                        <span class="tag tag-green">OBSERVED</span>
                    </div>
                    <div class="p-5">
                        <p class="text-[13px] text-slate-300 leading-relaxed mb-4">Observable transaction connection
                            detected within the bounded investigation graph.</p>
                        <div class="space-y-2.5 text-[11px] font-mono">
                            <div>
                                <div class="text-slate-600">PATH</div>
                                <div class="text-slate-300 mt-0.5">INPUT → HOP1 → HOP2 → VASP</div>
                            </div>
                            <div>
                                <div class="text-slate-600">DISTANCE</div>
                                <div class="text-slate-300 mt-0.5">3 hops · 5 observable routes</div>
                            </div>
                            <div>
                                <div class="text-slate-600">TX HASH</div>
                                <div class="text-[#F1D98A] mt-0.5">0x1f8c3a2b9d4e7c5f8a1b2c3d4e5f6a7b</div>
                            </div>
                        </div>
                        <a href="#"
                            class="mt-4 inline-flex items-center gap-1.5 text-[11px] font-mono text-[#E6C766] hover:text-[#F1D98A]">
                            <span>VIEW ON CHAIN</span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M7 17L17 7M7 7h10v10" />
                            </svg>
                        </a>
                    </div>
                </div>
                <!-- Card 3 -->
                <div class="panel rounded-sm overflow-hidden">
                    <div class="px-5 py-3 border-b border-[#1A2436] flex items-center justify-between">
                        <span class="label">Fund Flow</span>
                        <span class="tag tag-green">OBSERVED</span>
                    </div>
                    <div class="p-5">
                        <p class="text-[13px] text-slate-300 leading-relaxed mb-4">Relevant transfer observed between
                            identified counterparties on TRON mainnet.</p>
                        <div class="space-y-2.5 text-[11px] font-mono">
                            <div>
                                <div class="text-slate-600">FROM</div>
                                <div class="text-slate-300 mt-0.5">TQ3rK9vM5nL2pR8...</div>
                            </div>
                            <div>
                                <div class="text-slate-600">TO</div>
                                <div class="text-[#55C98A] mt-0.5">TK7v2oP2x9mQ4fR8...</div>
                            </div>
                            <div>
                                <div class="text-slate-600">VALUE · BLOCK</div>
                                <div class="text-slate-300 mt-0.5">8,950 USDT · 48,221,071</div>
                            </div>
                        </div>
                        <a href="#"
                            class="mt-4 inline-flex items-center gap-1.5 text-[11px] font-mono text-[#E6C766] hover:text-[#F1D98A]">
                            <span>VIEW ON TRONSCAN</span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M7 17L17 7M7 7h10v10" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 5: VASP Registry -->
    <section id="registry" class="border-b border-[#1A2436] py-24">
        <div class="max-w-[1480px] mx-auto px-6">
            <div class="flex items-end justify-between mb-12 flex-wrap gap-4">
                <div>
                    <div class="flex items-center gap-3 mb-3">
                        <span class="label-accent">§ 05 · Registry</span>
                        <span class="h-px w-12 bg-[#1A2436]"></span>
                    </div>
                    <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-white max-w-2xl">VASP Intelligence
                        Registry</h2>
                    <p class="mt-4 text-slate-400 max-w-xl text-[14px] leading-relaxed">Curated from publicly available
                        entity labels, proof-of-reserves disclosures and institutional tagging sources.</p>
                </div>
            </div>

            <!-- Stats -->
            <div
                class="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1A2436] border border-[#1A2436] rounded-sm overflow-hidden mb-6">
                <div class="bg-[#0E1626] p-5">
                    <div class="font-mono text-3xl text-white font-medium">14</div>
                    <div class="label mt-1.5">Verified VASPs</div>
                </div>
                <div class="bg-[#0E1626] p-5">
                    <div class="font-mono text-3xl text-white font-medium">1,595</div>
                    <div class="label mt-1.5">Seed Addresses</div>
                </div>
                <div class="bg-[#0E1626] p-5">
                    <div class="font-mono text-3xl text-white font-medium">1,065</div>
                    <div class="label mt-1.5">Ethereum Addresses</div>
                </div>
                <div class="bg-[#0E1626] p-5">
                    <div class="font-mono text-3xl text-white font-medium">530</div>
                    <div class="label mt-1.5">TRON TRC-20 Addresses</div>
                </div>
            </div>

            <!-- Table -->
            <div class="panel rounded-sm overflow-hidden">
                <div class="flex items-center justify-between px-4 py-2.5 border-b border-[#1A2436] bg-[#0A1020]">
                    <div class="flex items-center gap-3">
                        <span class="label">Registry Records</span>
                        <span class="tag">CURATED · PUBLIC SOURCES</span>
                    </div>
                    <div class="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <span>SEARCH · 8 OF 14 SHOWN</span>
                    </div>
                </div>
                <div class="scroll-x overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>VASP</th>
                                <th>Blockchain Address</th>
                                <th>Chain</th>
                                <th>Cluster Type</th>
                                <th>Provenance</th>
                                <th>Confidence</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="text-white font-medium">Binance</td>
                                <td class="text-[#F1D98A]">TK5pH3nQ9vR2mK8sL4...</td>
                                <td>TRON</td>
                                <td>Hot Wallet</td>
                                <td>Public PoR · 2024-Q4</td>
                                <td><span class="text-[#55C98A]">HIGH · 92</span></td>
                                <td><span class="tag tag-green">VERIFIED</span></td>
                            </tr>
                            <tr>
                                <td class="text-white font-medium">Coinbase</td>
                                <td class="text-[#F1D98A]">TK7v2oP2x9mQ4fR8yL...</td>
                                <td>TRON</td>
                                <td>Consolidation</td>
                                <td>Public PoR · 2024-Q3</td>
                                <td><span class="text-[#55C98A]">HIGH · 89</span></td>
                                <td><span class="tag tag-green">VERIFIED</span></td>
                            </tr>
                            <tr>
                                <td class="text-white font-medium">Binance</td>
                                <td class="text-[#F1D98A]">0x28C6c06298d514Db...</td>
                                <td>ETH</td>
                                <td>Hot Wallet</td>
                                <td>Institutional Tag</td>
                                <td><span class="text-[#55C98A]">HIGH · 94</span></td>
                                <td><span class="tag tag-green">VERIFIED</span></td>
                            </tr>
                            <tr>
                                <td class="text-white font-medium">Kraken</td>
                                <td class="text-[#F1D98A]">0x267be1C1D684F78c...</td>
                                <td>ETH</td>
                                <td>Cold Storage</td>
                                <td>Public Entity Label</td>
                                <td><span class="text-[#55C98A]">HIGH · 87</span></td>
                                <td><span class="tag tag-green">VERIFIED</span></td>
                            </tr>
                            <tr>
                                <td class="text-white font-medium">OKX</td>
                                <td class="text-[#F1D98A]">0x6cC5F688a315f06d...</td>
                                <td>ETH</td>
                                <td>Hot Wallet</td>
                                <td>Public PoR · 2024-Q4</td>
                                <td><span class="text-[#55C98A]">HIGH · 88</span></td>
                                <td><span class="tag tag-green">VERIFIED</span></td>
                            </tr>
                            <tr>
                                <td class="text-white font-medium">Bitfinex</td>
                                <td class="text-[#F1D98A]">0x1151314c622CaE28...</td>
                                <td>ETH</td>
                                <td>Exchange Wallet</td>
                                <td>Institutional Tag</td>
                                <td><span class="text-[#FBBF24]">MED · 71</span></td>
                                <td><span class="tag tag-amber">VERIFIED</span></td>
                            </tr>
                            <tr>
                                <td class="text-white font-medium">Gemini</td>
                                <td class="text-[#F1D98A]">0x07364464db186FdEa...</td>
                                <td>ETH</td>
                                <td>Cold Storage</td>
                                <td>Public Entity Label</td>
                                <td><span class="text-[#55C98A]">HIGH · 85</span></td>
                                <td><span class="tag tag-green">VERIFIED</span></td>
                            </tr>
                            <tr>
                                <td class="text-white font-medium">Bybit</td>
                                <td class="text-[#F1D98A]">0xf89d7b9c864f589b...</td>
                                <td>ETH</td>
                                <td>Hot Wallet</td>
                                <td>Public PoR · 2024-Q4</td>
                                <td><span class="text-[#55C98A]">HIGH · 90</span></td>
                                <td><span class="tag tag-green">VERIFIED</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div
                    class="px-4 py-3 border-t border-[#1A2436] bg-[#0A1020] flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>REGISTRY VERSION · 2024.12.04 · CURATED · DEMONSTRATION DATA</span>
                    <span>SHOWING 8 OF 14</span>
                </div>
            </div>
            <p class="mt-4 text-[11px] font-mono text-slate-600 leading-relaxed max-w-3xl">
                Registry entries reflect tagged clusters associated with publicly disclosed VASP operations. Presence in
                the registry does not constitute a claim that every address is definitively controlled by the named
                organization — provenance metadata is recorded per entry for independent verification.
            </p>
        </div>
    </section>

    <!-- SECTION 6: Workflow cards -->
    <section id="capabilities" class="border-b border-[#1A2436] py-24">
        <div class="max-w-[1480px] mx-auto px-6">
            <div class="mb-12">
                <div class="flex items-center gap-3 mb-3">
                    <span class="label-accent">§ 06 · Capabilities</span>
                    <span class="h-px w-12 bg-[#1A2436]"></span>
                </div>
                <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-white max-w-2xl">Built for investigation
                    workflows.</h2>
            </div>

            <div
                class="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1A2436] border border-[#1A2436] rounded-sm overflow-hidden">
                <div class="feature-card p-6 group">
                    <div
                        class="w-11 h-11 border border-[#1A2436] rounded-sm flex items-center justify-center bg-[#0A1020] group-hover:border-[#E6C766] transition mb-5">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6C766" stroke-width="1.5">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m21 21-4.3-4.3" />
                            <circle cx="11" cy="11" r="2" />
                        </svg>
                    </div>
                    <h3 class="text-[14px] font-semibold text-white tracking-wide mb-2">SINGLE TARGET ANALYSIS</h3>
                    <p class="text-[12px] text-slate-400 leading-relaxed">Investigate an individual wallet and trace
                        observable counterparties through bounded graph traversal.</p>
                    <div class="mt-5 pt-4 border-t border-[#1A2436] text-[10px] font-mono text-slate-600">INPUT · 1
                        ADDRESS · OUTPUT · DOSSIER</div>
                </div>
                <div class="feature-card p-6 group">
                    <div
                        class="w-11 h-11 border border-[#1A2436] rounded-sm flex items-center justify-center bg-[#0A1020] group-hover:border-[#E6C766] transition mb-5">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6C766" stroke-width="1.5">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                        </svg>
                    </div>
                    <h3 class="text-[14px] font-semibold text-white tracking-wide mb-2">BATCH TRIAGE</h3>
                    <p class="text-[12px] text-slate-400 leading-relaxed">Process multiple reported addresses for
                        prioritization based on attribution strength.</p>
                    <div class="mt-5 pt-4 border-t border-[#1A2436] text-[10px] font-mono text-slate-600">INPUT · N
                        ADDRESSES · OUTPUT · RANKED QUEUE</div>
                </div>
                <div class="feature-card p-6 group">
                    <div
                        class="w-11 h-11 border border-[#1A2436] rounded-sm flex items-center justify-center bg-[#0A1020] group-hover:border-[#E6C766] transition mb-5">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6C766" stroke-width="1.5">
                            <ellipse cx="12" cy="5" rx="9" ry="3" />
                            <path d="M3 5v14a9 3 0 0018 0V5" />
                            <path d="M3 12a9 3 0 0018 0" />
                        </svg>
                    </div>
                    <h3 class="text-[14px] font-semibold text-white tracking-wide mb-2">VASP INTELLIGENCE</h3>
                    <p class="text-[12px] text-slate-400 leading-relaxed">Search verified entity and address records
                        with full provenance metadata.</p>
                    <div class="mt-5 pt-4 border-t border-[#1A2436] text-[10px] font-mono text-slate-600">REGISTRY ·
                        1,595 RECORDS · 14 ENTITIES</div>
                </div>
                <div class="feature-card p-6 group">
                    <div
                        class="w-11 h-11 border border-[#1A2436] rounded-sm flex items-center justify-center bg-[#0A1020] group-hover:border-[#E6C766] transition mb-5">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6C766" stroke-width="1.5">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <path d="M14 2v6h6M9 13h6M9 17h4" />
                        </svg>
                    </div>
                    <h3 class="text-[14px] font-semibold text-white tracking-wide mb-2">INVESTIGATION REPORT</h3>
                    <p class="text-[12px] text-slate-400 leading-relaxed">Generate a structured evidence dossier from
                        the investigation with chain of custody.</p>
                    <div class="mt-5 pt-4 border-t border-[#1A2436] text-[10px] font-mono text-slate-600">FORMAT · PDF /
                        JSON · SIGNED</div>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 7: Explainability -->
    <section id="methodology" class="border-b border-[#1A2436] py-24 relative">
        <div class="absolute inset-0 bg-grid-fine opacity-30"></div>
        <div class="relative max-w-[1480px] mx-auto px-6">
            <div class="mb-12">
                <div class="flex items-center gap-3 mb-3">
                    <span class="label-accent">§ 07 · Methodology</span>
                    <span class="h-px w-12 bg-[#1A2436]"></span>
                </div>
                <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-white max-w-2xl">Designed around
                    explainability.</h2>
            </div>

            <div class="grid lg:grid-cols-2 gap-6 mb-10">
                <!-- Black box -->
                <div class="panel rounded-sm p-8 relative">
                    <div class="flex items-center justify-between mb-6">
                        <span class="label text-slate-500">Conventional Approach</span>
                        <span class="tag">OPAQUE</span>
                    </div>
                    <div class="bg-[#060A12] border border-[#1A2436] rounded-sm p-6">
                        <div class="flex items-center gap-3 font-mono text-[14px]">
                            <span class="text-slate-400">Wallet</span>
                            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="#475569"
                                stroke-width="1.2">
                                <path d="M1 7h17M13 1l6 6-6 6" />
                            </svg>
                            <span class="text-[#F87171]">High Risk</span>
                        </div>
                        <div class="mt-4 text-[11px] font-mono text-slate-600">No observable path · No provenance · No
                            reviewable reasoning</div>
                    </div>
                    <div class="mt-6 space-y-2 text-[12px] text-slate-500">
                        <div class="flex items-center gap-2">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F87171"
                                stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                            <span>Single opaque verdict</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F87171"
                                stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                            <span>No reviewable reasoning chain</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F87171"
                                stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                            <span>Investigator cannot ask "why?"</span>
                        </div>
                    </div>
                </div>

                <!-- TRACEVERSE -->
                <div class="panel-2 rounded-sm p-8 relative">
                    <div
                        class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E6C766] to-transparent">
                    </div>
                    <div class="flex items-center justify-between mb-6">
                        <span class="label-accent">TRACEVERSE</span>
                        <span class="tag tag-accent">EXPLAINABLE</span>
                    </div>
                    <div class="bg-[#060A12] border border-[#243350] rounded-sm p-5">
                        <div class="space-y-2.5 font-mono text-[12px]">
                            <div class="flex items-center gap-2"><span class="text-slate-400">Wallet</span><svg
                                    width="14" height="10" viewBox="0 0 20 14" fill="none" stroke="#E6C766"
                                    stroke-width="1.4">
                                    <path d="M1 7h17M13 1l6 6-6 6" stroke-dasharray="2 2" />
                                </svg></div>
                            <div class="flex items-center gap-2 pl-4"><span
                                    class="text-slate-400">Transaction</span><svg width="14" height="10"
                                    viewBox="0 0 20 14" fill="none" stroke="#E6C766" stroke-width="1.4">
                                    <path d="M1 7h17M13 1l6 6-6 6" stroke-dasharray="2 2" />
                                </svg></div>
                            <div class="flex items-center gap-2 pl-8"><span class="text-slate-400">Graph Path</span><svg
                                    width="14" height="10" viewBox="0 0 20 14" fill="none" stroke="#E6C766"
                                    stroke-width="1.4">
                                    <path d="M1 7h17M13 1l6 6-6 6" stroke-dasharray="2 2" />
                                </svg></div>
                            <div class="flex items-center gap-2 pl-12"><span class="text-slate-400">VASP
                                    Address</span><svg width="14" height="10" viewBox="0 0 20 14" fill="none"
                                    stroke="#E6C766" stroke-width="1.4">
                                    <path d="M1 7h17M13 1l6 6-6 6" stroke-dasharray="2 2" />
                                </svg></div>
                            <div class="flex items-center gap-2 pl-16"><span class="text-slate-400">Source</span><svg
                                    width="14" height="10" viewBox="0 0 20 14" fill="none" stroke="#E6C766"
                                    stroke-width="1.4">
                                    <path d="M1 7h17M13 1l6 6-6 6" stroke-dasharray="2 2" />
                                </svg></div>
                            <div class="flex items-center gap-2 pl-20"><span class="text-slate-400">Score
                                    Contribution</span><svg width="14" height="10" viewBox="0 0 20 14" fill="none"
                                    stroke="#E6C766" stroke-width="1.4">
                                    <path d="M1 7h17M13 1l6 6-6 6" stroke-dasharray="2 2" />
                                </svg></div>
                            <div class="flex items-center gap-2 pl-24"><span class="text-[#55C98A]">Evidence</span><span
                                    class="tag tag-green ml-2">VERIFIABLE</span></div>
                        </div>
                    </div>
                    <div class="mt-6 space-y-2 text-[12px] text-slate-400">
                        <div class="flex items-center gap-2">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#55C98A"
                                stroke-width="2.5">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                            <span>Every link independently auditable</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#55C98A"
                                stroke-width="2.5">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                            <span>Facts separated from inference</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#55C98A"
                                stroke-width="2.5">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                            <span>Investigator can ask "why?" at every step</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel rounded-sm p-8 border-l-2 border-l-[#E6C766]">
                <h3 class="text-2xl font-semibold text-white mb-3">An investigator should be able to ask: Why?</h3>
                <p class="text-slate-400 text-[15px] leading-relaxed max-w-3xl">
                    TRACEVERSE separates observable blockchain facts from analytical inference, allowing investigators
                    to inspect the transactions, graph relationships and provenance supporting an attribution. Every
                    claim resolves to a transaction hash, a block number, and a verifiable source.
                </p>
            </div>
        </div>
    </section>

    <!-- SECTION 8: Multi-chain -->
    <section id="chain" class="border-b border-[#1A2436] py-24">
        <div class="max-w-[1480px] mx-auto px-6">
            <div class="mb-12">
                <div class="flex items-center gap-3 mb-3">
                    <span class="label-accent">§ 08 · Architecture</span>
                    <span class="h-px w-12 bg-[#1A2436]"></span>
                </div>
                <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-white max-w-2xl">Multi-chain by
                    architecture. Focused by investigation.</h2>
            </div>

            <div class="grid lg:grid-cols-12 gap-6">
                <!-- Chain cards -->
                <div class="lg:col-span-5 space-y-4">
                    <div class="panel-2 rounded-sm p-6 relative">
                        <div class="absolute top-0 left-0 w-1 h-full bg-[#E6C766] rounded-l-sm"></div>
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                    <path d="M14 2L4 7v7c0 6 4 11 10 12 6-1 10-6 10-12V7L14 2z" stroke="#E6C766"
                                        stroke-width="1.2" fill="rgba(230,199,102,0.08)" />
                                    <path d="M14 9L9 11.5v4c0 2.5 2 4.5 5 5 3-0.5 5-2.5 5-5v-4L14 9z" stroke="#F1D98A"
                                        stroke-width="0.8" />
                                </svg>
                                <div>
                                    <div class="text-[18px] font-semibold text-white">TRON</div>
                                    <div class="text-[11px] font-mono text-slate-500">TRC-20 · USDT</div>
                                </div>
                            </div>
                            <span class="tag tag-accent">PRIMARY PROTOTYPE</span>
                        </div>
                        <div class="mt-4 pt-4 border-t border-[#1A2436] grid grid-cols-3 gap-3 text-[11px] font-mono">
                            <div>
                                <div class="text-slate-500">SEED ADDR</div>
                                <div class="text-slate-200 mt-1">530</div>
                            </div>
                            <div>
                                <div class="text-slate-500">STATUS</div>
                                <div class="text-[#55C98A] mt-1">ACTIVE</div>
                            </div>
                            <div>
                                <div class="text-slate-500">API</div>
                                <div class="text-slate-200 mt-1">TRONGRID</div>
                            </div>
                        </div>
                    </div>
                    <div class="panel rounded-sm p-6">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                    <path d="M14 2L4 7v7c0 6 4 11 10 12 6-1 10-6 10-12V7L14 2z" stroke="#94A3B8"
                                        stroke-width="1.2" fill="rgba(148,163,184,0.05)" />
                                    <path d="M9 11h10M9 14h10M9 17h6" stroke="#94A3B8" stroke-width="0.8" />
                                </svg>
                                <div>
                                    <div class="text-[18px] font-semibold text-white">ETHEREUM</div>
                                    <div class="text-[11px] font-mono text-slate-500">ERC-20</div>
                                </div>
                            </div>
                            <span class="tag">SUPPORTED</span>
                        </div>
                        <div class="mt-4 pt-4 border-t border-[#1A2436] grid grid-cols-3 gap-3 text-[11px] font-mono">
                            <div>
                                <div class="text-slate-500">SEED ADDR</div>
                                <div class="text-slate-200 mt-1">1,065</div>
                            </div>
                            <div>
                                <div class="text-slate-500">STATUS</div>
                                <div class="text-[#FBBF24] mt-1">EXTENSIBLE</div>
                            </div>
                            <div>
                                <div class="text-slate-500">API</div>
                                <div class="text-slate-200 mt-1">ETHERSCAN</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Architecture diagram -->
                <div class="lg:col-span-7">
                    <div class="panel rounded-sm p-8 h-full">
                        <div class="flex items-center justify-between mb-6">
                            <span class="label">Processing Architecture</span>
                            <span class="text-[10px] font-mono text-slate-500">5 STAGES</span>
                        </div>
                        <div class="space-y-1">
                            <div
                                class="border border-[#1A2436] bg-[#0A1020] rounded-sm p-4 flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <span class="font-mono text-[10px] text-slate-600 w-6">01</span>
                                    <span class="text-[13px] text-white font-medium">Blockchain APIs</span>
                                </div>
                                <span class="text-[11px] font-mono text-slate-500">TRONGRID · ETHERSCAN</span>
                            </div>
                            <div class="flex justify-center"><svg width="14" height="20" viewBox="0 0 14 20" fill="none"
                                    stroke="#E6C766" stroke-width="1.2">
                                    <path d="M7 0v18M1 12l6 6 6-6" stroke-dasharray="2 2" />
                                </svg></div>
                            <div
                                class="border border-[#1A2436] bg-[#0A1020] rounded-sm p-4 flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <span class="font-mono text-[10px] text-slate-600 w-6">02</span>
                                    <span class="text-[13px] text-white font-medium">Normalized Transaction Model</span>
                                </div>
                                <span class="text-[11px] font-mono text-slate-500">CHAIN-AGNOSTIC</span>
                            </div>
                            <div class="flex justify-center"><svg width="14" height="20" viewBox="0 0 14 20" fill="none"
                                    stroke="#E6C766" stroke-width="1.2">
                                    <path d="M7 0v18M1 12l6 6 6-6" stroke-dasharray="2 2" />
                                </svg></div>
                            <div
                                class="border border-[#1A2436] bg-[#0A1020] rounded-sm p-4 flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <span class="font-mono text-[10px] text-slate-600 w-6">03</span>
                                    <span class="text-[13px] text-white font-medium">Graph Engine</span>
                                </div>
                                <span class="text-[11px] font-mono text-slate-500">BOUNDED · 3-HOP</span>
                            </div>
                            <div class="flex justify-center"><svg width="14" height="20" viewBox="0 0 14 20" fill="none"
                                    stroke="#E6C766" stroke-width="1.2">
                                    <path d="M7 0v18M1 12l6 6 6-6" stroke-dasharray="2 2" />
                                </svg></div>
                            <div
                                class="border border-[#1A2436] bg-[#0A1020] rounded-sm p-4 flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <span class="font-mono text-[10px] text-slate-600 w-6">04</span>
                                    <span class="text-[13px] text-white font-medium">Attribution Engine</span>
                                </div>
                                <span class="text-[11px] font-mono text-slate-500">5 SIGNALS · WEIGHTED</span>
                            </div>
                            <div class="flex justify-center"><svg width="14" height="20" viewBox="0 0 14 20" fill="none"
                                    stroke="#E6C766" stroke-width="1.2">
                                    <path d="M7 0v18M1 12l6 6 6-6" stroke-dasharray="2 2" />
                                </svg></div>
                            <div
                                class="border border-[#243350] bg-[rgba(56,189,248,0.04)] rounded-sm p-4 flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <span class="font-mono text-[10px] text-[#E6C766] w-6">05</span>
                                    <span class="text-[13px] text-white font-medium">Evidence Layer</span>
                                </div>
                                <span class="text-[11px] font-mono text-[#55C98A]">SIGNED · EXPORTABLE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 9: Boundaries -->
    <section id="boundaries" class="border-b border-[#1A2436] py-24 relative">
        <div class="absolute inset-0 bg-grid-fine opacity-20"></div>
        <div class="relative max-w-[1480px] mx-auto px-6">
            <div class="mb-10">
                <div class="flex items-center gap-3 mb-3">
                    <span class="label-accent">§ 09 · Boundaries</span>
                    <span class="h-px w-12 bg-[#1A2436]"></span>
                </div>
                <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-white max-w-2xl">Investigation boundaries
                    matter.</h2>
            </div>

            <div class="panel rounded-sm relative overflow-hidden">
                <div
                    class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent">
                </div>
                <div class="grid lg:grid-cols-12 gap-px bg-[#1A2436]">
                    <div class="lg:col-span-4 bg-[#0E1626] p-8">
                        <div class="flex items-center gap-3 mb-6">
                            <div
                                class="w-10 h-10 border border-[#FBBF24] bg-[rgba(251,191,36,0.08)] rounded-sm flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FBBF24"
                                    stroke-width="1.6">
                                    <path d="M12 9v4M12 17h.01" />
                                    <path
                                        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                            </div>
                            <span class="label text-[#FBBF24]">Scope of the Platform</span>
                        </div>
                        <p class="text-[14px] text-slate-300 leading-relaxed">
                            TRACEVERSE does not determine criminal guilt, legal ownership, or whether funds are
                            definitively illicit.
                        </p>
                        <p class="text-[14px] text-slate-400 leading-relaxed mt-4">
                            The platform identifies observable blockchain relationships and produces probabilistic
                            investigative leads supported by transaction and provenance evidence.
                        </p>
                    </div>
                    <div class="lg:col-span-4 bg-[#0E1626] p-8">
                        <div class="flex items-center gap-3 mb-6">
                            <div
                                class="w-10 h-10 border border-[#E6C766] bg-[rgba(230,199,102,0.08)] rounded-sm flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E6C766"
                                    stroke-width="1.6">
                                    <path d="M9 11l3 3L22 4" />
                                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                                </svg>
                            </div>
                            <span class="label-accent">What It Provides</span>
                        </div>
                        <ul class="space-y-3 text-[13px] text-slate-400">
                            <li class="flex items-start gap-2.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#55C98A"
                                    stroke-width="2.5" class="mt-0.5 flex-shrink-0">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <span>Observable transaction relationships</span>
                            </li>
                            <li class="flex items-start gap-2.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#55C98A"
                                    stroke-width="2.5" class="mt-0.5 flex-shrink-0">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <span>Probabilistic VASP attribution</span>
                            </li>
                            <li class="flex items-start gap-2.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#55C98A"
                                    stroke-width="2.5" class="mt-0.5 flex-shrink-0">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <span>Verifiable on-chain evidence</span>
                            </li>
                            <li class="flex items-start gap-2.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#55C98A"
                                    stroke-width="2.5" class="mt-0.5 flex-shrink-0">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <span>Source provenance per record</span>
                            </li>
                        </ul>
                    </div>
                    <div class="lg:col-span-4 bg-[#0E1626] p-8">
                        <div class="flex items-center gap-3 mb-6">
                            <div
                                class="w-10 h-10 border border-[#94A3B8] bg-[rgba(148,163,184,0.05)] rounded-sm flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8"
                                    stroke-width="1.6">
                                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <path d="M20 8v6M23 11h-6" />
                                </svg>
                            </div>
                            <span class="label text-slate-400">Retained By Authority</span>
                        </div>
                        <p class="text-[14px] text-slate-300 leading-relaxed">
                            Final investigative and legal determinations remain with authorized personnel.
                        </p>
                        <p class="text-[13px] text-slate-500 leading-relaxed mt-4">
                            TRACEVERSE outputs are investigative leads, not judicial findings. Investigators,
                            compliance officers and legal authorities retain responsibility for interpretation,
                            corroboration and any subsequent action.
                        </p>
                    </div>
                </div>
                <div
                    class="px-8 py-4 bg-[#0A1020] border-t border-[#1A2436] flex items-center justify-between flex-wrap gap-3">
                    <span class="text-[11px] font-mono text-slate-600">TRACEVERSE · INVESTIGATIVE LEAD · NOT JUDICIAL
                        FINDING</span>
                    <span class="text-[11px] font-mono text-slate-600">DOCUMENT · BOUNDARIES-LEA-001</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="border-b border-[#1A2436] py-28 relative overflow-hidden">
        <div class="absolute inset-0 bg-grid opacity-40"></div>
        <div class="absolute inset-0 glow-top"></div>
        <div class="relative max-w-[1480px] mx-auto px-6 text-center">
            <div class="flex items-center justify-center gap-3 mb-6">
                <span class="h-px w-8 bg-[#E6C766]"></span>
                <span class="label-accent">Begin Investigation</span>
                <span class="h-px w-8 bg-[#E6C766]"></span>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold tracking-tight text-white max-w-2xl mx-auto leading-tight">
                Start with an address.<br>
                <span class="text-[#F1D98A]">Follow the evidence.</span>
            </h2>
            <p class="mt-6 text-slate-400 max-w-xl mx-auto text-[15px] leading-relaxed">
                Investigate observable transaction relationships and identify probable VASP endpoints through a
                transparent, evidence-driven workflow.
            </p>
            <div class="mt-9 flex flex-wrap gap-3 justify-center">
                <button onclick="window.location.href='/app'" class="btn-primary">
                    <span>Open Investigation Console</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                </button>
                <a href="#methodology" class="btn-secondary">
                    <span>View Methodology</span>
                </a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 bg-[#060A12]">
        <div class="max-w-[1480px] mx-auto px-6">
            <div class="grid md:grid-cols-12 gap-8 mb-10">
                <div class="md:col-span-5">
                    <div class="flex items-center gap-3 mb-4">
                        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                            <path d="M14 1L3 5.5V14C3 20.5 7.5 25.8 14 27C20.5 25.8 25 20.5 25 14V5.5L14 1Z"
                                stroke="#E6C766" stroke-width="1.2" fill="rgba(56,189,248,0.06)" />
                            <path d="M14 7L9 9.2V14C9 17.5 11 20.6 14 21.5C17 20.6 19 17.5 19 14V9.2L14 7Z"
                                stroke="#F1D98A" stroke-width="1" fill="none" />
                            <circle cx="14" cy="14" r="1.5" fill="#E6C766" />
                        </svg>
                        <div>
                            <div class="font-semibold tracking-wider text-[14px]">TRACEVERSE</div>
                            <div class="text-[10px] font-mono text-slate-500 tracking-[0.14em]">LEA EDITION · PROTOTYPE
                            </div>
                        </div>
                    </div>
                    <p class="text-[13px] text-slate-500 leading-relaxed max-w-md">Automated Multi-Chain VASP
                        Attribution & Investigation Suite. Built for cybercrime investigators, compliance teams, and
                        regulated financial institutions.</p>
                </div>
                <div class="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                        <div class="label mb-3">Platform</div>
                        <ul class="space-y-2 text-[13px]">
                            <li><a href="#platform" class="text-slate-400 hover:text-[#F1D98A] transition">Overview</a>
                            </li>
                            <li><a href="#workflow" class="text-slate-400 hover:text-[#F1D98A] transition">Workflow</a>
                            </li>
                            <li><a href="#capabilities"
                                    class="text-slate-400 hover:text-[#F1D98A] transition">Capabilities</a></li>
                        </ul>
                    </div>
                    <div>
                        <div class="label mb-3">Resources</div>
                        <ul class="space-y-2 text-[13px]">
                            <li><a href="#methodology"
                                    class="text-slate-400 hover:text-[#F1D98A] transition">Methodology</a></li>
                            <li><a href="#registry" class="text-slate-400 hover:text-[#F1D98A] transition">VASP
                                    Registry</a></li>
                            <li><a href="#evidence" class="text-slate-400 hover:text-[#F1D98A] transition">Evidence</a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <div class="label mb-3">Console</div>
                        <ul class="space-y-2 text-[13px]">
                            <li><button onclick="window.location.href='/app'"
                                    class="text-slate-400 hover:text-[#F1D98A] transition text-left">Open
                                    Console</button></li>
                            <li><a href="#boundaries"
                                    class="text-slate-400 hover:text-[#F1D98A] transition">Boundaries</a></li>
                            <li><a href="#chain" class="text-slate-400 hover:text-[#F1D98A] transition">Architecture</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div
                class="pt-6 border-t border-[#1A2436] flex items-center justify-between flex-wrap gap-3 text-[11px] font-mono text-slate-600">
                <span>© TRACEVERSE · LEA EDITION · PROTOTYPE</span>
                <span>DEMONSTRATION DATA · NOT LEGAL EVIDENCE</span>
            </div>
        </div>
    </footer>

    <!-- Investigation Console Modal -->
    <div id="consoleModal" class="fixed inset-0 z-50 hidden modal-backdrop">
        <div class="absolute inset-0" onclick="closeConsole()"></div>
        <div class="relative h-full flex items-center justify-center p-4 md:p-8">
            <div class="console-frame relative rounded-md w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col">
                <span class="corner-tick tl"></span>
                <span class="corner-tick tr"></span>
                <span class="corner-tick bl"></span>
                <span class="corner-tick br"></span>

                <!-- Modal header -->
                <div
                    class="flex items-center justify-between px-4 py-2.5 border-b border-[#1A2436] bg-[#0A1020] flex-shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="flex gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-[#475569]"></span>
                            <span class="w-2 h-2 rounded-full bg-[#475569]"></span>
                            <span class="w-2 h-2 rounded-full bg-[#F87171] cursor-pointer"
                                onclick="closeConsole()"></span>
                        </div>
                        <span class="label">TRACEVERSE · Investigation Console</span>
                        <span class="tag tag-amber">LEA EDITION</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-[10px] font-mono text-slate-500 flex items-center gap-1.5"><span
                                class="status-dot live"></span>SECURE SESSION</span>
                        <button onclick="closeConsole()" class="text-slate-500 hover:text-white transition p-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Modal body -->
                <div class="flex-1 overflow-auto">
                    <!-- Input bar -->
                    <div class="px-4 py-3 border-b border-[#1A2436] bg-[#0E1626] sticky top-0 z-10">
                        <div class="flex items-center gap-2 mb-2.5">
                            <span class="label">Target Address</span>
                            <span class="label text-slate-600">/</span>
                            <span class="label-accent">UNKNOWN WALLET</span>
                        </div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <div
                                class="flex-1 min-w-[240px] flex items-center gap-2 bg-[#060A12] border border-[#243350] px-3 py-2 rounded-sm font-mono text-[12px]">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E6C766"
                                    stroke-width="2">
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                                <span class="text-slate-300">T9xK2aF4qR8mN3vL7pH5Q2sJ9dY6bV1cWZ</span>
                            </div>
                            <span class="tag tag-accent">TRON</span>
                            <span class="tag">TRC-20</span>
                            <span class="tag">3-HOP</span>
                            <button class="btn-primary !py-2 !px-3 !text-[11px]">
                                <span>RUN INVESTIGATION</span>
                            </button>
                        </div>
                    </div>

                    <!-- Status / progress -->
                    <div
                        class="px-4 py-3 border-b border-[#1A2436] bg-[#0A1020] flex items-center gap-4 flex-wrap text-[11px] font-mono">
                        <span class="text-[#55C98A] flex items-center gap-1.5"><span
                                class="status-dot live"></span>GRAPH CONSTRUCTED · 153 NODES</span>
                        <span class="text-slate-600">·</span>
                        <span class="text-[#55C98A]">VASP MATCH · 2 ENDPOINTS</span>
                        <span class="text-slate-600">·</span>
                        <span class="text-[#55C98A]">ATTRIBUTION COMPLETE</span>
                        <span class="ml-auto text-slate-500">CASE 4821-A · 18:42:09 UTC</span>
                    </div>

                    <!-- Main grid -->
                    <div class="grid grid-cols-12 gap-px bg-[#1A2436]">
                        <!-- Graph -->
                        <div class="col-span-12 lg:col-span-8 bg-[#0E1626]">
                            <div class="flex items-center justify-between px-4 py-2 border-b border-[#1A2436]">
                                <span class="label">Transaction Graph</span>
                                <div class="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                                    <span class="flex items-center gap-1.5"><span
                                            class="w-2 h-2 rounded-full bg-slate-400"></span>UNKNOWN</span>
                                    <span class="flex items-center gap-1.5"><span
                                            class="w-2 h-2 rounded-full bg-[#FBBF24]"></span>INTERMEDIARY</span>
                                    <span class="flex items-center gap-1.5"><span
                                            class="w-2 h-2 rounded-full bg-[#55C98A]"></span>VASP</span>
                                </div>
                            </div>
                            <div class="relative h-[360px] bg-[#060A12] bg-grid-fine">
                                <svg viewBox="0 0 700 360" class="w-full h-full">
                                    <defs>
                                        <marker id="arr-c2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5"
                                            markerHeight="5" orient="auto">
                                            <path d="M0,0 L10,5 L0,10 z" fill="#E6C766" opacity="0.8" />
                                        </marker>
                                        <marker id="arr-s2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5"
                                            markerHeight="5" orient="auto">
                                            <path d="M0,0 L10,5 L0,10 z" fill="#64748B" opacity="0.6" />
                                        </marker>
                                        <marker id="arr-g2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5"
                                            markerHeight="5" orient="auto">
                                            <path d="M0,0 L10,5 L0,10 z" fill="#55C98A" opacity="0.8" />
                                        </marker>
                                    </defs>
                                    <text x="60" y="30" font-family="IBM Plex Mono" font-size="9" fill="#475569"
                                        letter-spacing="1.5">INPUT</text>
                                    <text x="260" y="30" font-family="IBM Plex Mono" font-size="9" fill="#475569"
                                        letter-spacing="1.5">HOP 1</text>
                                    <text x="440" y="30" font-family="IBM Plex Mono" font-size="9" fill="#475569"
                                        letter-spacing="1.5">HOP 2</text>
                                    <text x="600" y="30" font-family="IBM Plex Mono" font-size="9" fill="#475569"
                                        letter-spacing="1.5">VASP</text>

                                    <path d="M 90 180 C 160 120, 200 120, 250 140" stroke="#64748B" stroke-width="1.2"
                                        fill="none" marker-end="url(#arr-s2)" class="flow-edge" />
                                    <path d="M 90 180 C 160 240, 200 240, 250 220" stroke="#64748B" stroke-width="1.2"
                                        fill="none" marker-end="url(#arr-s2)" class="flow-edge" />
                                    <path d="M 290 140 C 360 100, 400 100, 440 130" stroke="#64748B" stroke-width="1.2"
                                        fill="none" marker-end="url(#arr-s2)" class="flow-edge" />
                                    <path d="M 290 220 C 360 200, 400 170, 440 170" stroke="#64748B" stroke-width="1.2"
                                        fill="none" marker-end="url(#arr-s2)" class="flow-edge" />
                                    <path d="M 480 130 C 540 130, 580 160, 620 175" stroke="#55C98A" stroke-width="1.5"
                                        fill="none" marker-end="url(#arr-g2)" class="flow-edge" />
                                    <path d="M 480 170 C 540 170, 580 180, 620 185" stroke="#55C98A" stroke-width="1.5"
                                        fill="none" marker-end="url(#arr-g2)" class="flow-edge" />

                                    <g>
                                        <circle cx="65" cy="180" r="22" fill="rgba(230,199,102,0.08)" stroke="#E6C766"
                                            stroke-width="1.4" />
                                        <circle cx="65" cy="180" r="5" fill="#E6C766" />
                                        <text x="65" y="220" text-anchor="middle" font-family="IBM Plex Mono"
                                            font-size="10" fill="#94A3B8">T9xK...cWZ</text>
                                    </g>
                                    <g>
                                        <circle cx="270" cy="140" r="12" fill="#0E1626" stroke="#FBBF24"
                                            stroke-width="1.2" />
                                        <circle cx="270" cy="140" r="3.5" fill="#FBBF24" />
                                        <text x="270" y="125" text-anchor="middle" font-family="IBM Plex Mono"
                                            font-size="8" fill="#64748B">TX8m9kQp</text>
                                    </g>
                                    <g>
                                        <circle cx="270" cy="220" r="12" fill="#0E1626" stroke="#FBBF24"
                                            stroke-width="1.2" />
                                        <circle cx="270" cy="220" r="3.5" fill="#FBBF24" />
                                        <text x="270" y="240" text-anchor="middle" font-family="IBM Plex Mono"
                                            font-size="8" fill="#64748B">TY2hR5nL</text>
                                    </g>
                                    <g>
                                        <circle cx="460" cy="130" r="10" fill="#0E1626" stroke="#FBBF24"
                                            stroke-width="1" />
                                        <circle cx="460" cy="130" r="3" fill="#FBBF24" />
                                    </g>
                                    <g>
                                        <circle cx="460" cy="170" r="10" fill="#0E1626" stroke="#FBBF24"
                                            stroke-width="1" />
                                        <circle cx="460" cy="170" r="3" fill="#FBBF24" />
                                    </g>
                                    <g class="node-pulse">
                                        <circle cx="640" cy="180" r="26" fill="rgba(85,201,138,0.08)" stroke="#55C98A"
                                            stroke-width="1.5" />
                                        <circle cx="640" cy="180" r="16" fill="rgba(74,222,128,0.04)" stroke="#55C98A"
                                            stroke-width="0.5" />
                                        <circle cx="640" cy="180" r="6" fill="#55C98A" />
                                        <text x="640" y="225" text-anchor="middle" font-family="IBM Plex Mono"
                                            font-size="10" fill="#55C98A" font-weight="500">COINBASE</text>
                                        <text x="640" y="237" text-anchor="middle" font-family="IBM Plex Mono"
                                            font-size="8" fill="#475569">CLUSTER 04</text>
                                    </g>
                                </svg>
                            </div>
                        </div>

                        <!-- Attribution -->
                        <div class="col-span-12 lg:col-span-4 bg-[#0E1626]">
                            <div class="px-4 py-2 border-b border-[#1A2436] flex items-center justify-between">
                                <span class="label">Attribution Ranking</span>
                                <span class="text-[9px] font-mono text-slate-600">PROBABILISTIC</span>
                            </div>
                            <div class="p-3 space-y-2.5">
                                <div class="panel-2 rounded-sm p-3 relative">
                                    <div class="absolute top-0 left-0 w-1 h-full bg-[#55C98A] rounded-l-sm"></div>
                                    <div class="flex items-start justify-between mb-2">
                                        <div>
                                            <div class="text-[11px] font-mono text-slate-500">01 · PRIMARY</div>
                                            <div class="text-[15px] font-semibold text-white mt-0.5">Coinbase</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-mono text-[18px] text-[#55C98A] font-medium leading-none">
                                                67.5</div>
                                            <div class="text-[9px] font-mono text-slate-500 mt-1">/ 100</div>
                                        </div>
                                    </div>
                                    <div class="bar-track">
                                        <div class="bar-fill" data-w="67.5"
                                            style="background:linear-gradient(90deg,#55C98A,#72D9A0);"></div>
                                    </div>
                                    <div class="text-[10px] font-mono text-slate-500 mt-1.5">MEDIUM · INVESTIGATIVE LEAD
                                    </div>
                                </div>
                                <div class="panel rounded-sm p-3">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <div class="text-[11px] font-mono text-slate-500">02</div>
                                            <div class="text-[14px] font-medium text-slate-300 mt-0.5">Binance</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-mono text-[16px] text-[#FBBF24] leading-none">42.1</div>
                                            <div class="text-[9px] font-mono text-slate-500 mt-1">/ 100</div>
                                        </div>
                                    </div>
                                    <div class="bar-track mt-2">
                                        <div class="bar-fill" data-w="42.1"
                                            style="background:linear-gradient(90deg,#FBBF24,#FCD34D);"></div>
                                    </div>
                                </div>
                                <div class="panel rounded-sm p-3 opacity-70">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <div class="text-[11px] font-mono text-slate-500">03</div>
                                            <div class="text-[14px] font-medium text-slate-400 mt-0.5">Kraken</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-mono text-[16px] text-slate-400 leading-none">28.3</div>
                                        </div>
                                    </div>
                                    <div class="bar-track mt-2">
                                        <div class="bar-fill" data-w="28.3" style="background:#475569;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Ledger -->
                    <div class="border-t border-[#1A2436]">
                        <div class="flex items-center justify-between px-4 py-2 border-b border-[#1A2436] bg-[#0A1020]">
                            <span class="label">Transaction Ledger · Observable Evidence</span>
                            <span class="text-[10px] font-mono text-slate-500">5 OF 305</span>
                        </div>
                        <div class="scroll-x overflow-x-auto">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Hash</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Value</th>
                                        <th>Block</th>
                                        <th>Timestamp</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="ledger-row">
                                        <td class="text-[#F1D98A]">0x4a5b6c7d…f2a3b1c2</td>
                                        <td>T9xK…cWZ</td>
                                        <td>TX8m…k9Qp</td>
                                        <td class="text-slate-300">12,400.00 USDT</td>
                                        <td>48,221,093</td>
                                        <td>2024-12-04 18:14:22</td>
                                        <td><span class="tag tag-green">VERIFIED</span></td>
                                    </tr>
                                    <tr class="ledger-row">
                                        <td class="text-[#F1D98A]">0x9d2e8f1a…7c8123b4</td>
                                        <td>TX8m…k9Qp</td>
                                        <td>TQ3r…m4Lz</td>
                                        <td class="text-slate-300">8,950.00 USDT</td>
                                        <td>48,221,088</td>
                                        <td>2024-12-04 18:13:55</td>
                                        <td><span class="tag tag-green">VERIFIED</span></td>
                                    </tr>
                                    <tr class="ledger-row">
                                        <td class="text-[#F1D98A]">0x1f8c3a2b…3b2299d4</td>
                                        <td>TQ3r…m4Lz</td>
                                        <td class="text-[#55C98A]">TK7v…oP2x <span class="text-slate-600">·
                                                COINBASE</span></td>
                                        <td class="text-slate-300">8,950.00 USDT</td>
                                        <td>48,221,071</td>
                                        <td>2024-12-04 18:09:41</td>
                                        <td><span class="tag tag-green">VERIFIED</span></td>
                                    </tr>
                                    <tr class="ledger-row">
                                        <td class="text-[#F1D98A]">0x6e7d2c5b…8a91f0e2</td>
                                        <td>TY2h…R5nL</td>
                                        <td>TW9f…N3bQ</td>
                                        <td class="text-slate-300">3,450.00 USDT</td>
                                        <td>48,221,064</td>
                                        <td>2024-12-04 18:08:17</td>
                                        <td><span class="tag tag-green">VERIFIED</span></td>
                                    </tr>
                                    <tr class="ledger-row">
                                        <td class="text-[#F1D98A]">0xa1b2c3d4…e5f60718</td>
                                        <td>TW9f…N3bQ</td>
                                        <td class="text-[#55C98A]">TK7v…oP2x <span class="text-slate-600">·
                                                COINBASE</span></td>
                                        <td class="text-slate-300">3,450.00 USDT</td>
                                        <td>48,221,052</td>
                                        <td>2024-12-04 18:05:02</td>
                                        <td><span class="tag tag-green">VERIFIED</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Footer note -->
                    <div
                        class="px-4 py-3 bg-[#0A1020] border-t border-[#1A2436] flex items-center justify-between flex-wrap gap-3">
                        <span class="text-[10px] font-mono text-slate-600">DEMONSTRATION DATA · INVESTIGATIVE LEAD · NOT
                            LEGAL EVIDENCE</span>
                        <div class="flex items-center gap-2">
                            <button class="btn-secondary !py-2 !px-3 !text-[11px]">EXPORT DOSSIER</button>
                            <button class="btn-primary !py-2 !px-3 !text-[11px]">SAVE INVESTIGATION</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    ` }} />
    </div>
  );
};
