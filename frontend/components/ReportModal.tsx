'use client';

import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, Printer, X, ShieldCheck, FileText, Code, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import { InvestigationReport } from '../lib/types';

interface ReportModalProps {
  analysisId: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ analysisId, onClose }) => {
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [reportJson, setReportJson] = useState<InvestigationReport | null>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'markdown' | 'json'>('visual');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const [mdData, jsonData] = await Promise.all([
          api.getAnalysisReport(analysisId, 'markdown'),
          api.getAnalysisReport(analysisId, 'json'),
        ]);

        if ('report_markdown' in mdData) {
          setReportMarkdown(mdData.report_markdown);
        }
        if ('case_id' in jsonData) {
          setReportJson(jsonData as InvestigationReport);
        }
      } catch (err) {
        console.error('Failed to load dossier:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [analysisId]);

  const handleCopy = () => {
    const textToCopy = activeTab === 'json' ? JSON.stringify(reportJson, null, 2) : reportMarkdown;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = (format: 'md' | 'json') => {
    const content = format === 'md' ? reportMarkdown : JSON.stringify(reportJson, null, 2);
    const mime = format === 'md' ? 'text/markdown;charset=utf-8;' : 'application/json;charset=utf-8;';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `case_dossier_${analysisId.slice(0, 8)}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const refNumber = `TRACEVERSE/LEA/${new Date().getFullYear()}/${analysisId.slice(0, 8).toUpperCase()}`;

  return (
<<<<<<< Updated upstream
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-panel overflow-hidden font-sans text-text transition-colors">
        {/* Header Bar */}
        <div className="no-print p-5 border-b border-border flex flex-wrap items-center justify-between bg-surface-raised/60 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-subtle border border-accent/20 text-accent inline-flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-semibold text-text tracking-tight">
                  Forensic Investigation Dossier & Audit Report
                </h2>
                <Badge variant="accent">
=======
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-forensic-surface border border-forensic-border rounded-lg w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden font-sans text-xs transition-colors">
        
        {/* Header Bar */}
        <div className="no-print p-4 border-b border-forensic-border flex items-center justify-between bg-forensic-bg/95">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-forensic-text tracking-wide uppercase">
                  Forensic Investigation Dossier & Audit Report
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
>>>>>>> Stashed changes
                  {refNumber}
                </span>
              </div>
<<<<<<< Updated upstream
              <p className="text-xs text-text-muted mt-0.5">
=======
              <p className="text-[11px] text-forensic-textDim mt-0.5">
>>>>>>> Stashed changes
                Standardized multi-chain intelligence summary for judicial proceedings & VASP freeze requisitions
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
<<<<<<< Updated upstream
            <div className="inline-flex items-center bg-bg p-1 rounded-lg border border-border mr-1 text-xs">
              <button
                onClick={() => setActiveTab('visual')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
                  activeTab === 'visual'
                    ? 'bg-surface text-text shadow-sm border border-border'
                    : 'text-text-muted hover:text-text'
=======
            <div className="flex items-center bg-forensic-surfaceRaised p-0.5 rounded border border-forensic-border mr-2">
              <button
                onClick={() => setActiveTab('visual')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded text-[11px] font-medium transition-all ${
                  activeTab === 'visual'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-forensic-textDim hover:text-forensic-text'
>>>>>>> Stashed changes
                }`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span>Executive</span>
              </button>

              <button
                onClick={() => setActiveTab('markdown')}
<<<<<<< Updated upstream
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
                  activeTab === 'markdown'
                    ? 'bg-surface text-text shadow-sm border border-border'
                    : 'text-text-muted hover:text-text'
=======
                className={`flex items-center space-x-1.5 px-3 py-1 rounded text-[11px] font-medium transition-all ${
                  activeTab === 'markdown'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-forensic-textDim hover:text-forensic-text'
>>>>>>> Stashed changes
                }`}
              >
                <Code className="h-3.5 w-3.5 shrink-0" />
                <span>Markdown</span>
              </button>

              <button
                onClick={() => setActiveTab('json')}
<<<<<<< Updated upstream
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
                  activeTab === 'json'
                    ? 'bg-surface text-text shadow-sm border border-border'
                    : 'text-text-muted hover:text-text'
=======
                className={`flex items-center space-x-1.5 px-3 py-1 rounded text-[11px] font-medium transition-all ${
                  activeTab === 'json'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-forensic-textDim hover:text-forensic-text'
>>>>>>> Stashed changes
                }`}
              >
                <span className="font-mono">{'{ }'}</span>
                <span>JSON</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
<<<<<<< Updated upstream
              leftIcon={copied ? <Check className="h-3.5 w-3.5 text-verified" /> : <Copy className="h-3.5 w-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
=======
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-forensic-surfaceRaised hover:bg-forensic-border border border-forensic-border text-forensic-text font-medium text-[11px] transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-forensic-textDim" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
>>>>>>> Stashed changes

            <button
              onClick={() => handleDownload(activeTab === 'json' ? 'json' : 'md')}
<<<<<<< Updated upstream
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              {activeTab === 'json' ? 'Download JSON' : 'Download MD'}
            </Button>
=======
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-forensic-surfaceRaised hover:bg-forensic-border border border-forensic-border text-forensic-text font-medium text-[11px] transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-forensic-textDim" />
              <span>Download {activeTab === 'json' ? 'JSON' : 'MD'}</span>
            </button>
>>>>>>> Stashed changes

            <button
              onClick={handlePrint}
<<<<<<< Updated upstream
              leftIcon={<Printer className="h-3.5 w-3.5" />}
            >
              Print / PDF
            </Button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors inline-flex items-center justify-center shrink-0 border border-transparent hover:border-border"
              aria-label="Close modal"
=======
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow-sm transition-all cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Export PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded text-forensic-textDim hover:text-forensic-text hover:bg-forensic-surfaceRaised ml-2"
>>>>>>> Stashed changes
            >
              <X className="h-4 w-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Content Body */}
<<<<<<< Updated upstream
        <div className="overflow-y-auto flex-1 bg-bg p-6 lg:p-8 print:bg-white print:text-black">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-text-muted">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3"></div>
              <span className="text-xs">Compiling multi-chain case dossier & audit evidence...</span>
=======
        <div className="overflow-y-auto flex-1 bg-forensic-bg p-6 print:bg-white print:text-black">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-forensic-textDim">
              <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <span className="text-xs font-mono">Compiling multi-chain case dossier & audit evidence...</span>
>>>>>>> Stashed changes
            </div>
          ) : activeTab === 'visual' && reportJson ? (
            /* Visual Executive Dossier View */
            <div className="max-w-4xl mx-auto space-y-6 text-text print:text-black">
              {/* Document Header Banner */}
<<<<<<< Updated upstream
              <div className="p-6 rounded-xl bg-surface border border-border print:border-black/30 print:bg-transparent shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-1">
                      Financial Intelligence Unit • Forensic Report
                    </div>
                    <h1 className="text-xl font-bold text-text print:text-black">
                      Cryptocurrency Asset Investigation Dossier
                    </h1>
                    <p className="text-xs text-text-muted print:text-black/70 mt-1">
                      Case ID: <span className="font-mono">{reportJson.case_id}</span> • Ref: <span className="font-mono">{refNumber}</span>
                    </p>
                  </div>
                  <div className="text-right text-xs space-y-1">
                    <Badge variant="success" dot pulse>
                      VERIFIED ON-CHAIN PROOF
                    </Badge>
                    <div className="text-text-muted print:text-black/70 text-[11px]">
=======
              <div className="p-5 rounded-lg bg-forensic-surface border border-forensic-border print:border-black/30 print:bg-transparent">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-mono tracking-widest text-blue-400 uppercase font-bold mb-1">
                      FINANCIAL INTELLIGENCE UNIT // FORENSIC REPORT
                    </div>
                    <h1 className="text-lg font-bold text-forensic-text print:text-black">
                      Cryptocurrency Asset Investigation Dossier
                    </h1>
                    <p className="text-xs text-forensic-textDim print:text-black/70 font-mono mt-0.5">
                      Case ID: {reportJson.case_id} • Ref: {refNumber}
                    </p>
                  </div>
                  <div className="text-right font-mono text-[11px] space-y-1">
                    <div className="inline-block px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      VERIFIED ON-CHAIN PROOF
                    </div>
                    <div className="text-forensic-textDim print:text-black/70">
>>>>>>> Stashed changes
                      {new Date(reportJson.analysis_timestamp).toUTCString()}
                    </div>
                  </div>
                </div>

<<<<<<< Updated upstream
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-border print:border-black/20 text-xs">
                  <div>
                    <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider block mb-1">Subject Wallet</span>
                    <TechnicalValue
                      value={reportJson.input_wallet}
                      copyable
                      className="font-semibold text-text print:text-black"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider block mb-1">Blockchain Network</span>
                    <strong className="text-accent uppercase font-semibold block text-sm">
                      {reportJson.chain || 'Ethereum Mainnet'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider block mb-1">Observed Transfers</span>
                    <strong className="text-text print:text-black font-semibold block text-sm">
                      {reportJson.summary_metrics?.total_transactions || 0} Transfers
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider block mb-1">Total Volume</span>
                    <strong className="text-verified font-semibold block text-sm">
                      ${Number(reportJson.summary_metrics?.total_volume_usd || 0).toLocaleString()} USD
                    </strong>
=======
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-forensic-border print:border-black/20 font-mono text-[11px]">
                  <div>
                    <span className="text-forensic-textDim block text-[10px]">TARGET WALLET</span>
                    <span className="font-bold text-forensic-text print:text-black break-all">{reportJson.input_wallet}</span>
                  </div>
                  <div>
                    <span className="text-forensic-textDim block text-[10px]">NETWORK</span>
                    <span className="font-bold text-forensic-text print:text-black">{reportJson.chain}</span>
                  </div>
                  <div>
                    <span className="text-forensic-textDim block text-[10px]">TOTAL EDGES</span>
                    <span className="font-bold text-forensic-text print:text-black">{reportJson.summary_metrics?.total_edges || 0} Transactions</span>
                  </div>
                  <div>
                    <span className="text-forensic-textDim block text-[10px]">MAX DEPTH</span>
                    <span className="font-bold text-forensic-text print:text-black">{reportJson.summary_metrics?.max_hop_reached || 3} Hops (Bounded)</span>
>>>>>>> Stashed changes
                  </div>
                </div>
              </div>

<<<<<<< Updated upstream
              {/* Attribution Finding */}
              {reportJson.top_attribution && (
                <div className="p-6 rounded-xl bg-surface border border-border print:border-black/30 shadow-card space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-verified shrink-0" />
                      <h3 className="text-sm font-semibold text-text">
                        Primary VASP Attribution Finding
                      </h3>
                    </div>
                    <Badge variant="success">
                      Score: {reportJson.top_attribution.score.toFixed(1)} / 100 ({reportJson.top_attribution.evidence_strength} Confidence)
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-surface-raised rounded-xl border border-border/70">
                      <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider block mb-1">Attributed Exchange / VASP:</span>
                      <div className="text-lg font-bold text-accent">
                        {reportJson.top_attribution.vasp_name}
                      </div>
                      <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                        {reportJson.top_attribution.summary}
                      </p>
                    </div>

                    <div className="p-4 bg-surface-raised rounded-xl border border-border/70 space-y-2.5">
                      <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider block mb-1">Composite Scoring Signals:</span>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Proximity Hop Factor:</span>
                          <span className="text-text font-medium">35.0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Observed Fund Flow Factor:</span>
                          <span className="text-text font-medium">25.0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Interaction Frequency Factor:</span>
                          <span className="text-text font-medium">20.0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Behavioral Consistency Factor:</span>
                          <span className="text-text font-medium">10.0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Temporal Recency Factor:</span>
                          <span className="text-text font-medium">10.0%</span>
                        </div>
                      </div>
                    </div>
                  </div>
=======
              {/* Section 1: Executive Summary & VASP Attribution */}
              <div className="p-5 rounded-lg bg-forensic-surface border border-forensic-border print:border-black/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    <span>1. Executive Summary & VASP Attribution</span>
                  </h3>
                  {reportJson.top_attribution && (
                    <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold font-mono">
                      Top Match: {reportJson.top_attribution.vasp_name} ({reportJson.top_attribution.score.toFixed(1)}/100)
                    </span>
                  )}
>>>>>>> Stashed changes
                </div>
              )}

<<<<<<< Updated upstream
              {/* Risk Assessment */}
              {reportJson.risk_assessment && (
                <div className="p-6 rounded-xl bg-surface border border-border print:border-black/30 shadow-card space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="inline-flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                      <h3 className="text-sm font-semibold text-text">
                        Structural Risk Evaluation
                      </h3>
                    </div>
                    <Badge variant="warning">
                      {reportJson.risk_assessment.risk_level} RISK (Index: {reportJson.risk_assessment.score.toFixed(1)})
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
=======
                {reportJson.top_attribution ? (
                  <div className="p-4 rounded bg-forensic-bg/60 border border-forensic-border print:bg-gray-50 print:border-black/20">
                    <div className="text-sm font-bold text-forensic-text print:text-black flex items-center space-x-2">
                      <span className="text-emerald-400 font-mono">✓</span>
                      <span>Primary Attribution: {reportJson.top_attribution.vasp_name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {reportJson.top_attribution.evidence_strength} Strength
                      </span>
                    </div>
                    <p className="text-xs text-forensic-textDim print:text-black/80 mt-1 leading-relaxed">
                      {reportJson.top_attribution.summary}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-forensic-textDim">No known VASP terminal identified within 3 hops.</p>
                )}

                {/* Ranked Attribution Hierarchy Table */}
                {reportJson.all_attributions && reportJson.all_attributions.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-forensic-text print:text-black mb-2 uppercase tracking-wide">
                      Ranked VASP Association Hierarchy
                    </h4>
                    <div className="overflow-x-auto border border-forensic-border print:border-black/20 rounded">
                      <table className="w-full text-left font-mono text-[11px]">
                        <thead className="bg-forensic-surfaceRaised print:bg-gray-100 text-forensic-textDim print:text-black border-b border-forensic-border">
                          <tr>
                            <th className="p-2.5">Rank</th>
                            <th className="p-2.5">VASP Cluster</th>
                            <th className="p-2.5">Attribution Score</th>
                            <th className="p-2.5">Strength</th>
                            <th className="p-2.5">Summary</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-forensic-border print:divide-gray-200">
                          {reportJson.all_attributions.map((attr, idx) => (
                            <tr key={idx} className="hover:bg-forensic-surfaceRaised/50">
                              <td className="p-2.5 font-bold">#{attr.rank}</td>
                              <td className="p-2.5 font-bold text-blue-400 print:text-blue-700">{attr.vasp_name}</td>
                              <td className="p-2.5">{attr.score.toFixed(1)} / 100</td>
                              <td className="p-2.5">
                                <span className="px-1.5 py-0.5 rounded bg-forensic-surfaceRaised border border-forensic-border">
                                  {attr.evidence_strength}
                                </span>
                              </td>
                              <td className="p-2.5 font-sans text-forensic-textDim print:text-black/80 text-[10px] max-w-xs truncate">
                                {attr.summary}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Risk Classification */}
              {reportJson.risk_assessment && (
                <div className="p-5 rounded-lg bg-forensic-surface border border-forensic-border print:border-black/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      <span>2. On-Chain Risk Classification & Indicators</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold font-mono">
                      Risk Level: {reportJson.risk_assessment.risk_level} ({reportJson.risk_assessment.score}/100)
                    </span>
                  </div>

                  <p className="text-xs text-forensic-textDim print:text-black/80 leading-relaxed">
>>>>>>> Stashed changes
                    {reportJson.risk_assessment.explanation}
                  </p>
                </div>
              )}

              {/* Critical Evidence Findings Table */}
              {reportJson.key_evidence && reportJson.key_evidence.length > 0 && (
<<<<<<< Updated upstream
                <div className="p-6 rounded-xl bg-surface border border-border print:border-black/30 shadow-card space-y-4">
                  <h3 className="text-sm font-semibold text-text border-b border-border pb-3">
                    Key Evidentiary Findings & Audit Trails
                  </h3>
                  <div className="divide-y divide-border text-xs">
                    {reportJson.key_evidence.map((ev, i) => (
                      <div key={i} className="py-3 space-y-1.5">
                        <div className="flex justify-between items-center font-medium">
                          <span className="text-text font-semibold">{ev.evidence_type}</span>
                          <Badge variant="neutral" size="sm">
                            {ev.strength} STRENGTH
                          </Badge>
                        </div>
                        <p className="text-text-secondary text-xs">{ev.explanation}</p>
                        {ev.tx_hash && (
                          <div className="text-xs text-text-muted flex items-center gap-1.5">
                            <span>Transaction:</span>
                            <TechnicalValue value={ev.tx_hash} copyable />
                          </div>
                        )}
                      </div>
                    ))}
=======
                <div className="p-5 rounded-lg bg-forensic-surface border border-forensic-border print:border-black/30 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>3. Tamper-Evident Forensic Audit Trail</span>
                  </h3>
                  <div className="overflow-x-auto border border-forensic-border print:border-black/20 rounded">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="bg-forensic-surfaceRaised print:bg-gray-100 text-forensic-textDim print:text-black border-b border-forensic-border">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5">Strength</th>
                          <th className="p-2.5">Hop</th>
                          <th className="p-2.5">Transaction Hash / Proof</th>
                          <th className="p-2.5">Explanation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-forensic-border print:divide-gray-200">
                        {reportJson.key_evidence.slice(0, 10).map((ev, i) => (
                          <tr key={i} className="hover:bg-forensic-surfaceRaised/50">
                            <td className="p-2.5 font-bold">{i + 1}</td>
                            <td className="p-2.5 text-blue-400">{ev.evidence_type}</td>
                            <td className="p-2.5">{ev.strength}</td>
                            <td className="p-2.5">{ev.hop_distance}</td>
                            <td className="p-2.5 text-[10px] break-all">
                              {ev.tx_hash ? (
                                <span className="text-emerald-400 font-bold">{ev.tx_hash.slice(0, 14)}...</span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="p-2.5 font-sans text-forensic-textDim print:text-black/80 text-[10px]">
                              {ev.explanation}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
>>>>>>> Stashed changes
                  </div>
                </div>
              )}

<<<<<<< Updated upstream
              {/* Legal Disclaimer */}
              <div className="p-4 bg-surface-raised rounded-xl border border-border text-xs text-text-muted space-y-1">
                <strong className="text-text-secondary uppercase tracking-wider text-[11px] block">Statutory & Judicial Advisory:</strong>
                <p className="leading-relaxed">
                  {reportJson.legal_disclaimer ||
                    'This document is generated by automated on-chain attribution algorithms for intelligence and investigation purposes. It constitutes actionable evidence for issuing statutory orders under Section 91 CrPC / Section 94 BNSS.'}
                </p>
=======
              {/* Section 4: Section 65B Indian Evidence Act Certificate */}
              <div className="p-5 rounded-lg bg-forensic-surface border border-forensic-border print:border-black/30 space-y-2 font-mono">
                <h3 className="text-xs font-bold uppercase tracking-wider text-forensic-text print:text-black">
                  4. Section 65B Indian Evidence Act Certificate
                </h3>
                <div className="p-4 rounded bg-forensic-bg/90 border border-forensic-border text-[10px] text-forensic-textDim print:text-black/80 leading-relaxed">
                  <p className="font-bold text-forensic-text print:text-black mb-1">
                    CERTIFICATE UNDER SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872 / SECTION 63 BNSS
                  </p>
                  <p>
                    1. This electronic investigation dossier (Ref: {refNumber}) was generated by the TRACEVERSE Forensic Intelligence Engine under automated electronic parameters.
                  </p>
                  <p className="mt-1">
                    2. The cryptographic transaction hashes, address metadata, and network paths were acquired directly from publicly indexed blockchain networks ({reportJson.chain}) without manual modification.
                  </p>
                  <p className="mt-1">
                    3. SHA-256 System Audit Hash: Verified at {new Date(reportJson.analysis_timestamp).toISOString()}.
                  </p>
                </div>
              </div>

              {/* Document Sign-off Footer */}
              <div className="pt-4 border-t border-forensic-border print:border-black/30 flex justify-between items-center text-[10px] text-forensic-textDim print:text-black font-mono">
                <span>TRACEVERSE FORENSIC INTELLIGENCE ENGINE v2.4</span>
                <span>VERIFICATION REF: {refNumber}</span>
>>>>>>> Stashed changes
              </div>
            </div>
          ) : activeTab === 'markdown' ? (
            <div className="max-w-4xl mx-auto">
<<<<<<< Updated upstream
              <pre className="p-6 bg-surface border border-border rounded-xl font-mono text-xs text-text overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-card">
                {reportMarkdown || 'No markdown report generated.'}
=======
              <pre className="p-5 rounded-lg bg-forensic-surface border border-forensic-border font-mono text-[11px] text-forensic-text leading-relaxed whitespace-pre-wrap select-all">
                {reportMarkdown}
>>>>>>> Stashed changes
              </pre>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
<<<<<<< Updated upstream
              <pre className="p-6 bg-surface border border-border rounded-xl font-mono text-xs text-text overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-card">
=======
              <pre className="p-5 rounded-lg bg-forensic-surface border border-forensic-border font-mono text-[11px] text-emerald-400 leading-relaxed whitespace-pre-wrap select-all overflow-x-auto">
>>>>>>> Stashed changes
                {JSON.stringify(reportJson, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
