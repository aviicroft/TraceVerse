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
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
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
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Activity,
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
            <span>ML Benchmarks</span>
          </button>
          <button
            onClick={() => setShowDatasetModal(true)}
            className="px-2.5 py-1 rounded-lg bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-hover transition-colors inline-flex items-center gap-1.5 text-xs"
          >
            <Database className="h-3.5 w-3.5 text-accent" />
            <span>100K Dataset</span>
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TAB 1: TARGET CASE WORKSPACE */}
        {activeTab === 'WORKSPACE' && (
          <>
            <WalletSearch onAnalyze={handleStartAnalysis} isLoading={isLoading} />

            {analysisStatus && <LiveProgress status={analysisStatus} />}

            {/* Case Header & Key Findings Summary */}
            {analysisStatus && (
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
                        {analysisStatus.wallet_address}
                      </span>
                      <button
                        onClick={() => handleCopyAddress(analysisStatus.wallet_address)}
                        title="Copy target address"
                        className="p-1.5 rounded-lg hover:bg-surface-raised text-text-muted hover:text-text transition-colors shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4 text-verified" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <a
                        href={
                          analysisStatus.wallet_address.startsWith('0x')
                            ? `https://etherscan.io/address/${analysisStatus.wallet_address}`
                            : `https://tronscan.org/#/address/${analysisStatus.wallet_address}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg hover:bg-surface-raised text-text-muted hover:text-accent transition-colors shrink-0"
                        title="Inspect on Public Explorer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  {analysisStatus.status === 'COMPLETED' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => setActiveTab('GRAPH_STUDIO')}
                        icon={<Network className="h-4 w-4 text-accent" />}
                      >
                        Graph Studio
                      </Button>

                      <Button
                        variant="danger"
                        size="md"
                        onClick={() => setShowFreezeModal(true)}
                        icon={<Scale className="h-4 w-4" />}
                      >
                        Issue Freeze Notice
                      </Button>

                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => setShowReportModal(true)}
                        icon={<FileText className="h-4 w-4" />}
                      >
                        Export Dossier
                      </Button>
                    </div>
                  )}
                </div>

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
                  </div>
                </div>
              </div>
            )}

            {/* Split Workspace View */}
            {analysisStatus && analysisStatus.status === 'COMPLETED' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-6">
                  <AttributionCard attributions={attributions} />
                  <RiskCard riskAssessment={analysisStatus.risk_assessment} />
                  <EvidenceFeed evidence={evidence} />
                </div>

                <div className="lg:col-span-7 space-y-6">
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
              <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-panel space-y-4 transition-colors">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="inline-flex items-center gap-2 text-text">
                    <FolderOpen className="h-4 w-4 text-accent shrink-0" />
                    <h3 className="font-semibold text-sm tracking-wide">
                      Recent Forensic Investigations ({recentAnalyses.length})
                    </h3>
                  </div>
                  <span className="text-xs text-text-muted">Audit Register</span>
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
                          {run.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-text-muted pt-1 border-t border-border/40">
                        <span>
                          {run.num_transactions} Transfers • {run.num_nodes} Nodes
                        </span>
                        <span className="text-accent group-hover:translate-x-0.5 transition-transform font-medium inline-flex items-center gap-1">
                          <span>Load</span>
                          <ArrowRight className="h-3 w-3" />
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
          <div className="space-y-6">
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
