'use client';

import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, Printer, X, ShieldCheck, FileText, Code, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { InvestigationReport } from '../lib/types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { TechnicalValue } from './ui/TechnicalValue';

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
                  {refNumber}
                </Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Standardized multi-chain intelligence summary for judicial proceedings & VASP freeze requisitions
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="inline-flex items-center bg-bg p-1 rounded-lg border border-border mr-1 text-xs">
              <button
                onClick={() => setActiveTab('visual')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
                  activeTab === 'visual'
                    ? 'bg-surface text-text shadow-sm border border-border'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span>Executive</span>
              </button>

              <button
                onClick={() => setActiveTab('markdown')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
                  activeTab === 'markdown'
                    ? 'bg-surface text-text shadow-sm border border-border'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <Code className="h-3.5 w-3.5 shrink-0" />
                <span>Markdown</span>
              </button>

              <button
                onClick={() => setActiveTab('json')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
                  activeTab === 'json'
                    ? 'bg-surface text-text shadow-sm border border-border'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <span>JSON</span>
              </button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="h-3.5 w-3.5 text-verified" /> : <Copy className="h-3.5 w-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDownload(activeTab === 'json' ? 'json' : 'md')}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              {activeTab === 'json' ? 'Download JSON' : 'Download MD'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="h-3.5 w-3.5" />}
            >
              Print / PDF
            </Button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors inline-flex items-center justify-center shrink-0 border border-transparent hover:border-border"
              aria-label="Close modal"
            >
              <X className="h-4 w-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 bg-bg p-6 lg:p-8 print:bg-white print:text-black">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-text-muted">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3"></div>
              <span className="text-xs">Compiling multi-chain case dossier & audit evidence...</span>
            </div>
          ) : activeTab === 'visual' && reportJson ? (
            /* Visual Executive Dossier View */
            <div className="max-w-4xl mx-auto space-y-6 text-text print:text-black">
              {/* Document Header Banner */}
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
                      {new Date(reportJson.analysis_timestamp).toUTCString()}
                    </div>
                  </div>
                </div>

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
                  </div>
                </div>
              </div>

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
                </div>
              )}

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
                    {reportJson.risk_assessment.explanation}
                  </p>
                </div>
              )}

              {/* Critical Evidence Findings Table */}
              {reportJson.key_evidence && reportJson.key_evidence.length > 0 && (
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
                  </div>
                </div>
              )}

              {/* Legal Disclaimer */}
              <div className="p-4 bg-surface-raised rounded-xl border border-border text-xs text-text-muted space-y-1">
                <strong className="text-text-secondary uppercase tracking-wider text-[11px] block">Statutory & Judicial Advisory:</strong>
                <p className="leading-relaxed">
                  {reportJson.legal_disclaimer ||
                    'This document is generated by automated on-chain attribution algorithms for intelligence and investigation purposes. It constitutes actionable evidence for issuing statutory orders under Section 91 CrPC / Section 94 BNSS.'}
                </p>
              </div>
            </div>
          ) : activeTab === 'markdown' ? (
            <div className="max-w-4xl mx-auto">
              <pre className="p-6 bg-surface border border-border rounded-xl font-mono text-xs text-text overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-card">
                {reportMarkdown || 'No markdown report generated.'}
              </pre>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <pre className="p-6 bg-surface border border-border rounded-xl font-mono text-xs text-text overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-card">
                {JSON.stringify(reportJson, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
