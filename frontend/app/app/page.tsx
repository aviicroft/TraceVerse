'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Navbar, ActiveTabType } from '../../components/Navbar';
import { WalletSearch } from '../../components/WalletSearch';
import { LiveProgress } from '../../components/LiveProgress';
import { AttributionCard } from '../../components/AttributionCard';
import { RiskCard } from '../../components/RiskCard';
import { GraphCanvas } from '../../components/GraphCanvas';
import { EvidenceFeed } from '../../components/EvidenceFeed';
import { TransactionLedger } from '../../components/TransactionLedger';
import { ReportModal } from '../../components/ReportModal';
import { FreezeNoticeModal } from '../../components/FreezeNoticeModal';
import { NCRPTriageView } from '../../components/NCRPTriageView';
import { VASPRegistryModal } from '../../components/VASPRegistryModal';
import { CandidateDiscoveryView } from '../../components/CandidateDiscoveryView';
import { ProvenanceSection } from '../../components/ProvenanceSection';
import { MLEvaluationModal } from '../../components/MLEvaluationModal';
import { DatasetStatusModal } from '../../components/DatasetStatusModal';
import { api } from '../../lib/api';
import {
  AnalysisStatus,
  GraphData,
  Attribution,
  EvidenceItem,
  NormalizedTransaction,
} from '../../lib/types';
import {
  FileText,
  ExternalLink,
  Copy,
  Check,
  Scale,
  FolderOpen,
  Network,
  ArrowLeft,
  BrainCircuit,
  Database,
  BookOpen,
} from 'lucide-react';

export default function InvestigationAppPage() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('WORKSPACE');
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [attributions, setAttributions] = useState<Attribution[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisStatus[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showFreezeModal, setShowFreezeModal] = useState<boolean>(false);
  const [showRegistryModal, setShowRegistryModal] = useState<boolean>(false);
  const [showMLEvalModal, setShowMLEvalModal] = useState<boolean>(false);
  const [showDatasetModal, setShowDatasetModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadRecentCases();
  }, []);

  const loadCase = async (analysisId: string, switchTab = true) => {
    setIsLoading(true);
    try {
      const [status, gData, attrs, evs, txs] = await Promise.all([
        api.getAnalysisStatus(analysisId).catch(() => null),
        api.getAnalysisGraph(analysisId).catch(() => null),
        api.getAnalysisAttributions(analysisId).catch(() => []),
        api.getAnalysisEvidence(analysisId).catch(() => []),
        api.getAnalysisTransactions(analysisId).catch(() => []),
      ]);
      if (status) setAnalysisStatus(status);
      if (gData) setGraphData(gData);
      setAttributions(attrs);
      setEvidence(evs);
      setTransactions(txs);
      if (switchTab && activeTab !== 'GRAPH_STUDIO') {
        setActiveTab('WORKSPACE');
      }
    } catch (err) {
      console.error('Failed to load case:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentCases = async () => {
    try {
      const recent = await api.getRecentAnalyses();
      setRecentAnalyses(recent || []);
<<<<<<< Updated upstream
      if (recent && recent.length > 0) {
        const latestCompleted = recent.find((r) => r.status === 'COMPLETED');
        if (latestCompleted) {
          loadCase(latestCompleted.analysis_id, false);
        }
      }
=======
>>>>>>> Stashed changes
    } catch (e) {
      console.warn('Could not load recent analyses:', e);
    }
  };

  const handleStartAnalysis = async (walletAddress: string, maxHops: number) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    setActiveTab((prev) => (prev === 'GRAPH_STUDIO' ? 'GRAPH_STUDIO' : 'WORKSPACE'));
    setIsLoading(true);
    setGraphData(null);
    setAttributions([]);
    setEvidence([]);
    setTransactions([]);

    try {
      const initialStatus = await api.startAnalysis(walletAddress, maxHops);
      setAnalysisStatus(initialStatus);

      const analysisId = initialStatus.analysis_id;
      pollingTimerRef.current = setInterval(async () => {
        try {
          const current = await api.getAnalysisStatus(analysisId);
          setAnalysisStatus(current);

          if (current.status === 'COMPLETED') {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            setIsLoading(false);

            const [gData, attrs, evs, txs] = await Promise.all([
              api.getAnalysisGraph(analysisId).catch(() => null),
              api.getAnalysisAttributions(analysisId).catch(() => []),
              api.getAnalysisEvidence(analysisId).catch(() => []),
              api.getAnalysisTransactions(analysisId).catch(() => []),
            ]);

            setGraphData(gData);
            setAttributions(attrs);
            setEvidence(evs);
            setTransactions(txs);
            loadRecentCases();
          } else if (current.status === 'FAILED') {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            setIsLoading(false);
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      alert(`Analysis initialization failed: ${err.message}`);
    }
  };

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans transition-colors duration-150">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMLEval={() => setShowMLEvalModal(true)}
        onOpenDatasetStatus={() => setShowDatasetModal(true)}
        hasActiveTarget={!!analysisStatus}
      />

<<<<<<< Updated upstream
      {/* Top Breadcrumb & Status Bar */}
      <div className="border-b border-border bg-surface-raised/40 px-4 sm:px-6 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 text-text-muted">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-text-secondary hover:text-accent font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Platform Overview</span>
          </Link>
          <span className="text-border">/</span>
          <Link
            href="/docs"
            className="inline-flex items-center gap-1 text-text-secondary hover:text-accent font-medium transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5 text-warning" />
            <span>Judge Docs</span>
          </Link>
          <span className="text-border">/</span>
          <span className="text-text font-semibold">Forensic Investigation Console</span>
        </div>

        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => setShowMLEvalModal(true)}
            className="px-2.5 py-1 rounded-lg bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-hover transition-colors inline-flex items-center gap-1.5 text-xs"
          >
            <BrainCircuit className="h-3.5 w-3.5 text-verified" />
=======
      {/* Top Banner with link back to landing page */}
      <div className="bg-forensic-surfaceRaised border-b border-forensic-border px-4 py-1.5 text-xs font-mono flex items-center justify-between text-forensic-textDim">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-1 text-blue-500 hover:underline font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Landing Page</span>
          </Link>
          <span>•</span>
          <Link
            href="/docs"
            className="flex items-center space-x-1 text-amber-400 hover:underline font-semibold"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Judge Docs (/docs)</span>
          </Link>
          <span>•</span>
          <span>Live Investigation Console</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowMLEvalModal(true)}
            className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors flex items-center space-x-1"
          >
            <BrainCircuit className="h-3 w-3" />
>>>>>>> Stashed changes
            <span>ML Benchmarks</span>
          </button>
          <button
            onClick={() => setShowDatasetModal(true)}
<<<<<<< Updated upstream
            className="px-2.5 py-1 rounded-lg bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-hover transition-colors inline-flex items-center gap-1.5 text-xs"
          >
            <Database className="h-3.5 w-3.5 text-accent" />
            <span>100K Dataset</span>
=======
            className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-colors flex items-center space-x-1"
          >
            <Database className="h-3 w-3" />
            <span>Data Ingestion</span>
>>>>>>> Stashed changes
          </button>
        </div>
      </div>

<<<<<<< Updated upstream
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
=======
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
>>>>>>> Stashed changes
        {/* TAB 1: TARGET CASE WORKSPACE */}
        {activeTab === 'WORKSPACE' && (
          <>
            <WalletSearch onAnalyze={handleStartAnalysis} isLoading={isLoading} />

            {analysisStatus && <LiveProgress status={analysisStatus} />}

            {analysisStatus && (
<<<<<<< Updated upstream
              <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-panel space-y-5 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-text-muted">Case ID:</span>
                      <strong className="text-text font-mono">
                        CR-2026-{analysisStatus.analysis_id.slice(0, 8).toUpperCase()}
                      </strong>
                      <span className="text-border">•</span>
                      <Badge variant="success" dot={true}>
                        ACTIVE INVESTIGATION
                      </Badge>
                      <span className="text-border">•</span>
                      <span className="text-text-secondary font-medium">
                        {analysisStatus.wallet_address.startsWith('0x') ? 'Ethereum Mainnet' : 'Tron Network'}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-3 pt-1">
                      <span className="text-base sm:text-lg font-bold text-text font-mono break-all select-all">
=======
              <div className="bg-forensic-surface border border-forensic-border rounded p-3.5 shadow-sm text-xs font-mono transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forensic-border pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3 text-[10px] text-forensic-textDim uppercase">
                      <span>CASE ID: <strong className="text-forensic-text">CR-2026-{analysisStatus.analysis_id.slice(0, 8).toUpperCase()}</strong></span>
                      <span>•</span>
                      <span>STATUS: <strong className="text-forensic-teal">ACTIVE INVESTIGATION</strong></span>
                      <span>•</span>
                      <span>CHAIN: <strong className="text-blue-500">{analysisStatus.wallet_address.startsWith('0x') ? 'ETHEREUM MAINNET' : 'TRON NETWORK'}</strong></span>
                    </div>

                    <div className="flex items-center space-x-2 pt-0.5">
                      <span className="text-sm font-bold text-forensic-text break-all select-all">
>>>>>>> Stashed changes
                        {analysisStatus.wallet_address}
                      </span>
                      <button
                        onClick={() => handleCopyAddress(analysisStatus.wallet_address)}
<<<<<<< Updated upstream
                        title="Copy target address"
                        className="p-1.5 rounded-lg hover:bg-surface-raised text-text-muted hover:text-text transition-colors shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4 text-verified" /> : <Copy className="h-4 w-4" />}
=======
                        title="Copy address"
                        className="p-1 hover:text-forensic-text text-forensic-textDim"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-forensic-teal" /> : <Copy className="h-3.5 w-3.5" />}
>>>>>>> Stashed changes
                      </button>
                      <a
                        href={
                          analysisStatus.wallet_address.startsWith('0x')
                            ? `https://etherscan.io/address/${analysisStatus.wallet_address}`
                            : `https://tronscan.org/#/address/${analysisStatus.wallet_address}`
                        }
                        target="_blank"
                        rel="noreferrer"
<<<<<<< Updated upstream
                        className="p-1.5 rounded-lg hover:bg-surface-raised text-text-muted hover:text-accent transition-colors shrink-0"
                        title="Inspect on Public Explorer"
                      >
                        <ExternalLink className="h-4 w-4" />
=======
                        className="p-1 text-blue-500 hover:underline"
                        title="Inspect on Public Explorer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
>>>>>>> Stashed changes
                      </a>
                    </div>
                  </div>

                  {analysisStatus.status === 'COMPLETED' && (
<<<<<<< Updated upstream
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => setActiveTab('GRAPH_STUDIO')}
                        icon={<Network className="h-4 w-4 text-accent" />}
                      >
                        Graph Studio
                      </Button>
=======
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setActiveTab('GRAPH_STUDIO')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-forensic-surfaceRaised hover:bg-forensic-border text-forensic-text border border-forensic-border font-medium text-[11px] rounded transition-colors shadow-sm"
                      >
                        <Network className="h-3.5 w-3.5 text-forensic-teal" />
                        <span>Full-Screen Graph</span>
                      </button>
>>>>>>> Stashed changes

                      <button
                        onClick={() => setShowFreezeModal(true)}
<<<<<<< Updated upstream
                        icon={<Scale className="h-4 w-4" />}
                      >
                        Issue Freeze Notice
                      </Button>
=======
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white font-medium text-[11px] rounded transition-colors shadow-sm"
                      >
                        <Scale className="h-3.5 w-3.5" />
                        <span>Issue Freeze Notice</span>
                      </button>
>>>>>>> Stashed changes

                      <button
                        onClick={() => setShowReportModal(true)}
<<<<<<< Updated upstream
                        icon={<FileText className="h-4 w-4" />}
                      >
                        Export Dossier
                      </Button>
=======
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-medium text-[11px] rounded transition-colors shadow-sm"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Export Dossier</span>
                      </button>
>>>>>>> Stashed changes
                    </div>
                  )}
                </div>

<<<<<<< Updated upstream
                {/* Key Findings Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-surface-raised/50 border border-border">
                    <span className="block text-xs text-text-muted font-medium mb-1">Transfers</span>
                    <strong className="text-text font-mono text-base font-bold">
                      {analysisStatus.num_transactions || 0} Tx
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-raised/50 border border-border">
                    <span className="block text-xs text-text-muted font-medium mb-1">Network Nodes</span>
                    <strong className="text-text font-mono text-base font-bold">
                      {analysisStatus.num_nodes || 1} Nodes
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-raised/50 border border-border">
                    <span className="block text-xs text-text-muted font-medium mb-1">Attributed VASP</span>
                    <strong className="text-accent text-sm font-bold truncate block">
                      {attributions[0]?.vasp_name || 'Evaluating...'}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-raised/50 border border-border">
                    <span className="block text-xs text-text-muted font-medium mb-1">Confidence</span>
                    <strong className="text-verified font-mono text-sm font-bold">
                      {attributions[0] ? `${attributions[0].score.toFixed(1)}%` : 'N/A'}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-raised/50 border border-border">
                    <span className="block text-xs text-text-muted font-medium mb-1">Structural Risk</span>
                    <strong className="text-warning text-sm font-bold">
                      {analysisStatus.risk_assessment?.risk_level || 'ELEVATED'}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-raised/50 border border-border">
                    <span className="block text-xs text-text-muted font-medium mb-1">Evidence Records</span>
                    <strong className="text-text font-mono text-base font-bold">
                      {evidence.length} Records
                    </strong>
=======
                {/* Evidence Metrics Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 pt-2.5 text-[10px] text-forensic-textDim">
                  <div>
                    <span className="block uppercase text-forensic-textDim">Observed Transfers</span>
                    <strong className="text-forensic-text text-xs">{analysisStatus.num_transactions || 0} Tx</strong>
                  </div>
                  <div>
                    <span className="block uppercase text-forensic-textDim">Network Graph Nodes</span>
                    <strong className="text-forensic-text text-xs">{analysisStatus.num_nodes || 1} Nodes</strong>
                  </div>
                  <div>
                    <span className="block uppercase text-forensic-textDim">Attributed VASP</span>
                    <strong className="text-blue-500 text-xs">
                      {attributions[0]?.vasp_name || 'Evaluating...'}
                    </strong>
                  </div>
                  <div>
                    <span className="block uppercase text-forensic-textDim">Attribution Confidence</span>
                    <strong className="text-forensic-teal text-xs">
                      {attributions[0] ? `${attributions[0].score.toFixed(1)}% (${attributions[0].evidence_strength})` : 'N/A'}
                    </strong>
                  </div>
                  <div>
                    <span className="block uppercase text-forensic-textDim">Structural Risk</span>
                    <strong className="text-forensic-amber text-xs">
                      {analysisStatus.risk_assessment?.risk_level || 'ELEVATED'}
                    </strong>
                  </div>
                  <div>
                    <span className="block uppercase text-forensic-textDim">Evidence Findings</span>
                    <strong className="text-forensic-text text-xs">{evidence.length} Records</strong>
>>>>>>> Stashed changes
                  </div>
                </div>
              </div>
            )}

            {/* Split Workspace View */}
            {analysisStatus && analysisStatus.status === 'COMPLETED' && (
<<<<<<< Updated upstream
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-6">
=======
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 space-y-4">
>>>>>>> Stashed changes
                  <AttributionCard attributions={attributions} />
                  <RiskCard riskAssessment={analysisStatus.risk_assessment} />
                  <EvidenceFeed evidence={evidence} />
                </div>

<<<<<<< Updated upstream
                <div className="lg:col-span-7 space-y-6">
=======
                <div className="lg:col-span-7 space-y-4">
>>>>>>> Stashed changes
                  <GraphCanvas
                    graphData={graphData}
                    transactions={transactions}
                    onPivotTarget={(addr) => handleStartAnalysis(addr, 3)}
                    onLoadCase={(id) => loadCase(id, false)}
                  />
                  <TransactionLedger transactions={transactions} />
                </div>
              </div>
            )}

            {/* Recent Cases Forensic Register */}
            {recentAnalyses.length > 0 && !isLoading && (
<<<<<<< Updated upstream
              <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-panel space-y-4 transition-colors">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="inline-flex items-center gap-2 text-text">
                    <FolderOpen className="h-4 w-4 text-accent shrink-0" />
                    <h3 className="font-semibold text-sm tracking-wide">
                      Recent Forensic Investigations ({recentAnalyses.length})
                    </h3>
                  </div>
                  <span className="text-xs text-text-muted">Audit Register</span>
=======
              <div className="bg-forensic-surface border border-forensic-border rounded p-3.5 shadow-sm text-xs font-mono space-y-2.5 transition-colors">
                <div className="flex items-center justify-between border-b border-forensic-border pb-2">
                  <div className="flex items-center space-x-2 text-forensic-text">
                    <FolderOpen className="h-4 w-4 text-forensic-textDim" />
                    <h3 className="uppercase font-bold text-xs tracking-wider">
                      Recent Investigation Cases ({recentAnalyses.length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-forensic-textDim uppercase">Audit Register</span>
>>>>>>> Stashed changes
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recentAnalyses.map((run, idx) => (
                    <button
                      key={idx}
<<<<<<< Updated upstream
                      onClick={() => {
                        if (run.status === 'COMPLETED') {
                          loadCase(run.analysis_id, true);
                        } else {
                          handleStartAnalysis(run.wallet_address, 3);
                        }
                      }}
                      className="p-4 bg-surface-raised/40 hover:bg-surface-raised border border-border hover:border-border-hover rounded-xl text-left transition-all group space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text font-mono font-bold truncate max-w-[180px]">
                          {run.wallet_address.slice(0, 8)}...{run.wallet_address.slice(-6)}
                        </span>
                        <Badge
                          variant={run.status === 'COMPLETED' ? 'success' : 'neutral'}
                          size="sm"
                        >
=======
                      onClick={() => handleStartAnalysis(run.wallet_address, 3)}
                      className="p-2.5 bg-forensic-bg hover:bg-forensic-surfaceRaised border border-forensic-border rounded text-left transition-colors group space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-forensic-text font-bold truncate max-w-[170px]">
                          {run.wallet_address.slice(0, 8)}...{run.wallet_address.slice(-6)}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          run.status === 'COMPLETED' ? 'bg-teal-500/15 text-forensic-teal border border-teal-500/30' : 'bg-forensic-surfaceRaised text-forensic-textMuted border border-forensic-border'
                        }`}>
>>>>>>> Stashed changes
                          {run.status}
                        </span>
                      </div>
<<<<<<< Updated upstream
                      <div className="flex items-center justify-between text-xs text-text-muted pt-1 border-t border-border/40">
                        <span>
                          {run.num_transactions} Transfers • {run.num_nodes} Nodes
                        </span>
                        <span className="text-accent group-hover:translate-x-0.5 transition-transform font-medium inline-flex items-center gap-1">
                          <span>Load</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
=======
                      <div className="flex items-center justify-between text-[10px] text-forensic-textDim pt-0.5">
                        <span>{run.num_transactions} Transfers • {run.num_nodes} Nodes</span>
                        <span className="text-blue-500 group-hover:underline font-semibold">Load Case →</span>
>>>>>>> Stashed changes
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB: CANDIDATE DISCOVERY */}
        {activeTab === 'CANDIDATE_DISCOVERY' && (
          <CandidateDiscoveryView onSelectCandidate={(addr) => handleStartAnalysis(addr, 3)} />
        )}

        {/* TAB 2: FULL-SCREEN GRAPH STUDIO */}
        {activeTab === 'GRAPH_STUDIO' && (
<<<<<<< Updated upstream
          <div className="space-y-6">
=======
          <div className="space-y-4">
>>>>>>> Stashed changes
            <GraphCanvas
              graphData={graphData}
              isFullScreenView={true}
              transactions={transactions}
              onPivotTarget={(addr) => handleStartAnalysis(addr, 3)}
              recentAnalyses={recentAnalyses}
              isLoading={isLoading}
              onStartAnalysis={handleStartAnalysis}
              onLoadCase={(id) => loadCase(id, false)}
            />
            {transactions && transactions.length > 0 && (
              <TransactionLedger transactions={transactions} />
            )}
          </div>
        )}

        {/* TAB 3: NCRP INCIDENT QUEUE */}
        {activeTab === 'NCRP_TRIAGE' && (
          <NCRPTriageView onSelectCase={handleStartAnalysis} />
        )}

        {/* TAB 4: VASP & ENTITY REGISTRY */}
        {activeTab === 'VASP_REGISTRY' && (
          <VASPRegistryModal isFullPageView={true} />
        )}

        {/* TAB 5: LEGAL FREEZE STUDIO */}
        {activeTab === 'LEGAL_STUDIO' && (
          <FreezeNoticeModal
            analysisId={analysisStatus?.analysis_id || ''}
            isFullPageView={true}
          />
        )}

        {/* TAB 6: AUDIT METHODOLOGY */}
        {activeTab === 'METHODOLOGY' && (
          <ProvenanceSection />
        )}
      </main>

      {/* Modals */}
      {showReportModal && analysisStatus && (
        <ReportModal
          analysisId={analysisStatus.analysis_id}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showFreezeModal && analysisStatus && (
        <FreezeNoticeModal
          analysisId={analysisStatus.analysis_id}
          onClose={() => setShowFreezeModal(false)}
        />
      )}

      {showRegistryModal && (
        <VASPRegistryModal onClose={() => setShowRegistryModal(false)} />
      )}

      {showMLEvalModal && (
        <MLEvaluationModal isOpen={showMLEvalModal} onClose={() => setShowMLEvalModal(false)} />
      )}

      {showDatasetModal && (
        <DatasetStatusModal isOpen={showDatasetModal} onClose={() => setShowDatasetModal(false)} />
      )}
    </div>
  );
}
