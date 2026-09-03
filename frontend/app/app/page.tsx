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

  const loadRecentCases = async () => {
    try {
      const recent = await api.getRecentAnalyses();
      setRecentAnalyses(recent || []);
    } catch (e) {
      console.warn('Could not load recent analyses:', e);
    }
  };

  const handleStartAnalysis = async (walletAddress: string, maxHops: number) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    setActiveTab('WORKSPACE');
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
    <div className="min-h-screen bg-forensic-bg text-forensic-text flex flex-col font-sans transition-colors">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasActiveTarget={!!analysisStatus}
      />

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
            <span>ML Benchmarks</span>
          </button>
          <button
            onClick={() => setShowDatasetModal(true)}
            className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-colors flex items-center space-x-1"
          >
            <Database className="h-3 w-3" />
            <span>Data Ingestion</span>
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* TAB 1: TARGET CASE WORKSPACE */}
        {activeTab === 'WORKSPACE' && (
          <>
            <WalletSearch onAnalyze={handleStartAnalysis} isLoading={isLoading} />

            {analysisStatus && <LiveProgress status={analysisStatus} />}

            {analysisStatus && (
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
                        {analysisStatus.wallet_address}
                      </span>
                      <button
                        onClick={() => handleCopyAddress(analysisStatus.wallet_address)}
                        title="Copy address"
                        className="p-1 hover:text-forensic-text text-forensic-textDim"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-forensic-teal" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <a
                        href={
                          analysisStatus.wallet_address.startsWith('0x')
                            ? `https://etherscan.io/address/${analysisStatus.wallet_address}`
                            : `https://tronscan.org/#/address/${analysisStatus.wallet_address}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-blue-500 hover:underline"
                        title="Inspect on Public Explorer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  {analysisStatus.status === 'COMPLETED' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setActiveTab('GRAPH_STUDIO')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-forensic-surfaceRaised hover:bg-forensic-border text-forensic-text border border-forensic-border font-medium text-[11px] rounded transition-colors shadow-sm"
                      >
                        <Network className="h-3.5 w-3.5 text-forensic-teal" />
                        <span>Full-Screen Graph</span>
                      </button>

                      <button
                        onClick={() => setShowFreezeModal(true)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white font-medium text-[11px] rounded transition-colors shadow-sm"
                      >
                        <Scale className="h-3.5 w-3.5" />
                        <span>Issue Freeze Notice</span>
                      </button>

                      <button
                        onClick={() => setShowReportModal(true)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-medium text-[11px] rounded transition-colors shadow-sm"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Export Dossier</span>
                      </button>
                    </div>
                  )}
                </div>

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
                  </div>
                </div>
              </div>
            )}

            {/* Split Workspace View */}
            {analysisStatus && analysisStatus.status === 'COMPLETED' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 space-y-4">
                  <AttributionCard attributions={attributions} />
                  <RiskCard riskAssessment={analysisStatus.risk_assessment} />
                  <EvidenceFeed evidence={evidence} />
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <GraphCanvas
                    graphData={graphData}
                    transactions={transactions}
                    onPivotTarget={(addr) => handleStartAnalysis(addr, 3)}
                  />
                  <TransactionLedger transactions={transactions} />
                </div>
              </div>
            )}

            {/* Recent Cases Forensic Register */}
            {recentAnalyses.length > 0 && !isLoading && (
              <div className="bg-forensic-surface border border-forensic-border rounded p-3.5 shadow-sm text-xs font-mono space-y-2.5 transition-colors">
                <div className="flex items-center justify-between border-b border-forensic-border pb-2">
                  <div className="flex items-center space-x-2 text-forensic-text">
                    <FolderOpen className="h-4 w-4 text-forensic-textDim" />
                    <h3 className="uppercase font-bold text-xs tracking-wider">
                      Recent Investigation Cases ({recentAnalyses.length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-forensic-textDim uppercase">Audit Register</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {recentAnalyses.map((run, idx) => (
                    <button
                      key={idx}
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
                          {run.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-forensic-textDim pt-0.5">
                        <span>{run.num_transactions} Transfers • {run.num_nodes} Nodes</span>
                        <span className="text-blue-500 group-hover:underline font-semibold">Load Case →</span>
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
          <div className="space-y-4">
            <GraphCanvas
              graphData={graphData}
              isFullScreenView={true}
              transactions={transactions}
              onPivotTarget={(addr) => handleStartAnalysis(addr, 3)}
            />
            <TransactionLedger transactions={transactions} />
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

      {/* Pop-up Modals */}
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
