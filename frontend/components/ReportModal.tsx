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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-vercel-lg overflow-hidden font-sans text-xs transition-colors">
        {/* Header Bar */}
        <div className="no-print p-4 sm:p-5 border-b border-border flex flex-wrap items-center justify-between bg-surface-raised/50 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 text-accent inline-flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-text tracking-wide uppercase font-mono">
                  Forensic Investigation Dossier & Audit Report
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent/10 text-accent border border-accent/25 font-semibold">
                  {refNumber}
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5 font-sans">
                Standardized multi-chain intelligence summary for judicial proceedings & VASP freeze requisitions
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="inline-flex items-center bg-bg p-0.5 rounded-lg border border-border mr-1 font-mono text-[11px]">
              <button
                onClick={() => setActiveTab('visual')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                  activeTab === 'visual'
                    ? 'bg-surface text-text shadow-sm border border-border font-semibold'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span>Executive</span>
              </button>

              <button
                onClick={() => setActiveTab('markdown')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                  activeTab === 'markdown'
                    ? 'bg-surface text-text shadow-sm border border-border font-semibold'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <Code className="h-3.5 w-3.5 shrink-0" />
                <span>Markdown</span>
              </button>

              <button
                onClick={() => setActiveTab('json')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                  activeTab === 'json'
                    ? 'bg-surface text-text shadow-sm border border-border font-semibold'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <span className="font-mono">{'{ }'}</span>
                <span>JSON</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-hover border border-border text-text font-medium text-[11px] transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-verified shrink-0" /> : <Copy className="h-3.5 w-3.5 text-text-dim shrink-0" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => handleDownload(activeTab === 'json' ? 'json' : 'md')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-hover border border-border text-text font-medium text-[11px] transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-text-dim shrink-0" />
              <span>Download {activeTab === 'json' ? 'JSON' : 'MD'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-text text-bg hover:opacity-90 font-medium text-[11px] shadow-sm transition-opacity cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 shrink-0" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-text-dim hover:text-text hover:bg-surface-hover transition-colors inline-flex items-center justify-center shrink-0"
              aria-label="Close modal"
            >
              <X className="h-4 w-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 bg-bg p-6 print:bg-white print:text-black">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-text-muted">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3"></div>
              <span className="text-xs font-mono">Compiling multi-chain case dossier & audit evidence...</span>
            </div>
          ) : activeTab === 'visual' && reportJson ? (
            /* Visual Executive Dossier View */
            <div className="max-w-4xl mx-auto space-y-6 text-text print:text-black">
              {/* Document Header Banner */}
              <div className="p-5 rounded-xl bg-surface border border-border print:border-black/30 print:bg-transparent shadow-vercel">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-mono tracking-widest text-accent uppercase font-semibold mb-1">
                      FINANCIAL INTELLIGENCE UNIT // FORENSIC REPORT
                    </div>
                    <h1 className="text-lg font-bold text-text print:text-black">
                      Cryptocurrency Asset Investigation Dossier
                    </h1>
                    <p className="text-xs text-text-muted print:text-black/70 font-mono mt-0.5">
                      Case ID: {reportJson.case_id} • Ref: {refNumber}
                    </p>
                  </div>
                  <div className="text-right font-mono text-[11px] space-y-1">
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-verified-subtle text-verified border border-verified-border font-semibold">
                      VERIFIED ON-CHAIN PROOF
                    </div>
                    <div className="text-text-muted print:text-black/70">
                      {new Date(reportJson.analysis_timestamp).toUTCString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border print:border-black/20 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-text-dim uppercase block">Subject Wallet</span>
                    <strong className="text-text print:text-black break-all select-all font-semibold">
                      {reportJson.input_wallet}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-dim uppercase block">Blockchain Network</span>
                    <strong className="text-accent uppercase font-semibold">
                      {reportJson.chain || 'Ethereum Mainnet'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-dim uppercase block">Observed Transfers</span>
                    <strong className="text-text print:text-black font-semibold">
                      {reportJson.summary_metrics?.total_transactions || 0} Transfers
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-dim uppercase block">Total Volume</span>
                    <strong className="text-verified font-semibold">
                      ${Number(reportJson.summary_metrics?.total_volume_usd || 0).toLocaleString()} USD
                    </strong>
                  </div>
                </div>
              </div>

              {/* Attribution Finding */}
              {reportJson.top_attribution && (
                <div className="p-5 rounded-xl bg-surface border border-border print:border-black/30 shadow-vercel space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-verified shrink-0" />
                      <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-text">
                        Primary VASP Attribution Finding
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-verified">
                      Score: {reportJson.top_attribution.score.toFixed(1)} / 100 ({reportJson.top_attribution.evidence_strength} Confidence)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3 bg-bg rounded-lg border border-border">
                      <span className="text-[10px] text-text-dim uppercase block mb-1">Attributed Exchange / VASP:</span>
                      <div className="text-base font-bold text-accent">
                        {reportJson.top_attribution.vasp_name}
                      </div>
                      <p className="text-[11px] text-text-muted font-sans mt-2 leading-relaxed">
                        {reportJson.top_attribution.summary}
                      </p>
                    </div>

                    <div className="p-3 bg-bg rounded-lg border border-border space-y-2">
                      <span className="text-[10px] text-text-dim uppercase block">Composite Scoring Signals:</span>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Proximity Hop Factor:</span>
                          <span className="text-text font-bold">35.0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Observed Fund Flow Factor:</span>
                          <span className="text-text font-bold">25.0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Interaction Frequency Factor:</span>
                          <span className="text-text font-bold">20.0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Behavioral Consistency Factor:</span>
                          <span className="text-text font-bold">10.0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Temporal Recency Factor:</span>
                          <span className="text-text font-bold">10.0%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Assessment */}
              {reportJson.risk_assessment && (
                <div className="p-5 rounded-xl bg-surface border border-border print:border-black/30 shadow-vercel space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="inline-flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                      <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-text">
                        Structural Risk Evaluation
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-warning uppercase">
                      {reportJson.risk_assessment.risk_level} RISK (Index: {reportJson.risk_assessment.score.toFixed(1)})
                    </span>
                  </div>
                  <p className="text-xs text-text-muted font-sans leading-relaxed">
                    {reportJson.risk_assessment.explanation}
                  </p>
                </div>
              )}

              {/* Critical Evidence Findings Table */}
              {reportJson.key_evidence && reportJson.key_evidence.length > 0 && (
                <div className="p-5 rounded-xl bg-surface border border-border print:border-black/30 shadow-vercel space-y-3 font-mono">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text border-b border-border pb-2">
                    Key Evidentiary Findings & Audit Trails
                  </h3>
                  <div className="divide-y divide-border text-[11px]">
                    {reportJson.key_evidence.map((ev, i) => (
                      <div key={i} className="py-2.5 space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-accent">{ev.evidence_type}</span>
                          <span className="text-[10px] text-verified font-bold">{ev.strength} STRENGTH</span>
                        </div>
                        <p className="text-text-muted font-sans text-xs">{ev.explanation}</p>
                        {ev.tx_hash && (
                          <div className="text-[10px] text-text-dim truncate">Tx: {ev.tx_hash}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legal Disclaimer */}
              <div className="p-4 bg-surface-raised/40 rounded-lg border border-border text-[10px] text-text-dim space-y-1 font-mono">
                <strong className="text-text-muted uppercase block">Statutory & Judicial Advisory:</strong>
                <p className="font-sans leading-relaxed">
                  {reportJson.legal_disclaimer ||
                    'This document is generated by automated on-chain attribution algorithms for intelligence and investigation purposes. It constitutes actionable evidence for issuing statutory orders under Section 91 CrPC / Section 94 BNSS.'}
                </p>
              </div>
            </div>
          ) : activeTab === 'markdown' ? (
            <div className="max-w-4xl mx-auto">
              <pre className="p-5 bg-surface border border-border rounded-xl font-mono text-xs text-text overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-vercel">
                {reportMarkdown || 'No markdown report generated.'}
              </pre>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <pre className="p-5 bg-surface border border-border rounded-xl font-mono text-xs text-text overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-vercel">
                {JSON.stringify(reportJson, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
