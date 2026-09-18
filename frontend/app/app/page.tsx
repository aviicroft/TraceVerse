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
      // If no active case loaded, auto-load the latest completed analysis so graph is instantly visible
      if (recent && recent.length > 0) {
        const latestCompleted = recent.find((r) => r.status === 'COMPLETED');
        if (latestCompleted) {
          loadCase(latestCompleted.analysis_id, false);
        }
      }
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

      {/* Top Breadcrumb & Status Bar */}
      <div className="border-b border-border bg-surface-raised/50 px-3 sm:px-6 py-2 text-xs font-mono flex flex-wrap items-center justify-between gap-2 text-text-muted min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-text hover:text-accent font-medium transition-colors shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            <span>Landing Page</span>
          </Link>
          <span className="text-border shrink-0">/</span>
          <Link
            href="/docs"
            className="inline-flex items-center gap-1 text-text hover:text-accent font-medium transition-colors shrink-0"
          >
            <BookOpen className="h-3.5 w-3.5 text-warning shrink-0" />
            <span>Judge Docs</span>
          </Link>
          <span className="text-border shrink-0">/</span>
          <span className="text-text font-semibold truncate">Live Investigation Console</span>
        </div>

        <div className="inline-flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowMLEvalModal(true)}
            className="px-2.5 py-1 rounded-md bg-surface border border-border text-text hover:bg-surface-hover transition-colors inline-flex items-center gap-1.5 text-[11px] shrink-0"
          >
            <BrainCircuit className="h-3 w-3 text-verified shrink-0" />
            <span>ML Benchmarks</span>
          </button>
          <button
            onClick={() => setShowDatasetModal(true)}
            className="px-2.5 py-1 rounded-md bg-surface border border-border text-text hover:bg-surface-hover transition-colors inline-flex items-center gap-1.5 text-[11px] shrink-0"
          >
            <Database className="h-3 w-3 text-accent shrink-0" />
            <span>100K Dataset</span>
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* TAB 1: TARGET CASE WORKSPACE */}
        {activeTab === 'WORKSPACE' && (
          <>
            <WalletSearch onAnalyze={handleStartAnalysis} isLoading={isLoading} />

            {analysisStatus && <LiveProgress status={analysisStatus} />}

            {analysisStatus && (
              <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 shadow-vercel text-xs font-mono transition-colors space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-dim uppercase font-semibold">
                      <span>CASE ID: <strong className="text-text">CR-2026-{analysisStatus.analysis_id.slice(0, 8).toUpperCase()}</strong></span>
                      <span>•</span>
                      <span>STATUS: <strong className="text-verified">ACTIVE INVESTIGATION</strong></span>
                      <span>•</span>
                      <span>CHAIN: <strong className="text-accent">{analysisStatus.wallet_address.startsWith('0x') ? 'ETHEREUM MAINNET' : 'TRON NETWORK'}</strong></span>
                    </div>

                    <div className="inline-flex items-center gap-2 pt-0.5">
                      <span className="text-sm sm:text-base font-bold text-text break-all select-all font-mono">
                        {analysisStatus.wallet_address}
                      </span>
                      <button
                        onClick={() => handleCopyAddress(analysisStatus.wallet_address)}
                        title="Copy target address"
                        className="w-6 h-6 inline-flex items-center justify-center rounded hover:bg-surface-raised/80 text-text-dim hover:text-text transition-colors shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4 text-verified shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
                      </button>
                      <a
                        href={
                          analysisStatus.wallet_address.startsWith('0x')
                            ? `https://etherscan.io/address/${analysisStatus.wallet_address}`
                            : `https://tronscan.org/#/address/${analysisStatus.wallet_address}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="w-6 h-6 inline-flex items-center justify-center rounded hover:bg-surface-raised/80 text-accent transition-colors shrink-0"
                        title="Inspect on Public Explorer"
                      >
                        <ExternalLink className="h-4 w-4 shrink-0" />
                      </a>
                    </div>
                  </div>

                  {analysisStatus.status === 'COMPLETED' && (
                    <div className="inline-flex items-center gap-2 font-sans">
                      <button
                        onClick={() => setActiveTab('GRAPH_STUDIO')}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-surface-raised hover:bg-surface-hover text-text border border-border font-medium text-xs rounded-lg transition-colors shadow-sm"
                      >
                        <Network className="h-3.5 w-3.5 text-accent shrink-0" />
                        <span>Graph Studio</span>
                      </button>

                      <button
                        onClick={() => setShowFreezeModal(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-danger hover:bg-danger-hover text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
                      >
                        <Scale className="h-3.5 w-3.5 shrink-0" />
                        <span>Issue Freeze Notice</span>
                      </button>

                      <button
                        onClick={() => setShowReportModal(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-text text-bg hover:opacity-90 font-medium text-xs rounded-lg transition-opacity shadow-sm"
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span>Export Dossier</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Evidence Metrics Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1 text-[11px] text-text-dim">
                  <div className="p-2.5 rounded-lg bg-surface-raised/50 border border-border/60">
                    <span className="block uppercase text-[10px] text-text-muted font-medium mb-0.5">Transfers</span>
                    <strong className="text-text text-xs">{analysisStatus.num_transactions || 0} Tx</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-raised/50 border border-border/60">
                    <span className="block uppercase text-[10px] text-text-muted font-medium mb-0.5">Network Nodes</span>
                    <strong className="text-text text-xs">{analysisStatus.num_nodes || 1} Nodes</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-raised/50 border border-border/60">
                    <span className="block uppercase text-[10px] text-text-muted font-medium mb-0.5">Attributed VASP</span>
                    <strong className="text-accent text-xs truncate block">
                      {attributions[0]?.vasp_name || 'Evaluating...'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-raised/50 border border-border/60">
                    <span className="block uppercase text-[10px] text-text-muted font-medium mb-0.5">Confidence</span>
                    <strong className="text-verified text-xs">
                      {attributions[0] ? `${attributions[0].score.toFixed(1)}% (${attributions[0].evidence_strength})` : 'N/A'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-raised/50 border border-border/60">
                    <span className="block uppercase text-[10px] text-text-muted font-medium mb-0.5">Structural Risk</span>
                    <strong className="text-warning text-xs">
                      {analysisStatus.risk_assessment?.risk_level || 'ELEVATED'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-raised/50 border border-border/60">
                    <span className="block uppercase text-[10px] text-text-muted font-medium mb-0.5">Evidence Records</span>
                    <strong className="text-text text-xs">{evidence.length} Records</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Split Workspace View */}
            {analysisStatus && analysisStatus.status === 'COMPLETED' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 space-y-5">
                  <AttributionCard attributions={attributions} />
                  <RiskCard riskAssessment={analysisStatus.risk_assessment} />
                  <EvidenceFeed evidence={evidence} />
                </div>

                <div className="lg:col-span-7 space-y-5">
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
              <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 shadow-vercel text-xs font-mono space-y-3 transition-colors">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="inline-flex items-center gap-2 text-text">
                    <FolderOpen className="h-4 w-4 text-text-muted shrink-0" />
                    <h3 className="uppercase font-semibold text-xs tracking-wider">
                      Recent Investigation Cases ({recentAnalyses.length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-text-dim uppercase font-medium">Audit Register</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recentAnalyses.map((run, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (run.status === 'COMPLETED') {
                          loadCase(run.analysis_id, true);
                        } else {
                          handleStartAnalysis(run.wallet_address, 3);
                        }
                      }}
                      className="p-3 bg-surface-raised/40 hover:bg-surface-raised border border-border/80 hover:border-border rounded-lg text-left transition-all group space-y-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text font-bold truncate max-w-[160px]">
                          {run.wallet_address.slice(0, 8)}...{run.wallet_address.slice(-6)}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.2 rounded-full font-bold uppercase border ${
                            run.status === 'COMPLETED'
                              ? 'bg-verified-subtle text-verified border-verified-border'
                              : 'bg-surface-raised text-text-muted border-border'
                          }`}
                        >
                          {run.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-text-dim pt-0.5">
                        <span>
                          {run.num_transactions} Tx • {run.num_nodes} Nodes
                        </span>
                        <span className="text-accent group-hover:underline font-semibold font-sans">
                          Load Case →
                        </span>
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
          <div className="space-y-5">
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
