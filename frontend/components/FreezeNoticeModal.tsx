'use client';

import React, { useState, useEffect } from 'react';
<<<<<<< Updated upstream
import {
  Scale,
  Copy,
  Check,
  Printer,
  X,
  Mail,
  Shield,
  FileText,
  Code,
  CheckCircle2,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  Globe,
  Lock,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
=======
import { Scale, Copy, Check, Printer, X, Mail, ShieldCheck, QrCode, FileText, Code, CheckCircle2 } from 'lucide-react';
>>>>>>> Stashed changes
import QRCode from 'qrcode';
import { api } from '../lib/api';

interface FreezeNoticeModalProps {
  analysisId: string;
  onClose?: () => void;
  isFullPageView?: boolean;
}

export const FreezeNoticeModal: React.FC<FreezeNoticeModalProps> = ({
  analysisId,
  onClose,
  isFullPageView = false,
}) => {
  const [officerName, setOfficerName] = useState('Inspector R. K. Sharma');
  const [policeStation, setPoliceStation] = useState('Cyber Crime Police Station, CID');
  const [crimeNumber, setCrimeNumber] = useState('NCRP/2026/CYBER-FIN/8842');

  const [noticeData, setNoticeData] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'visual' | 'markdown'>('visual');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchNotice = async () => {
    if (!analysisId) return;
    try {
      setLoading(true);
      const data = await api.getFreezeNotice(analysisId, officerName, policeStation, crimeNumber);
<<<<<<< Updated upstream
      if (data) {
        setNoticeData(data);
        if (data.vasp_name) setVaspName(data.vasp_name);
        if (data.compliance_email) setComplianceEmail(data.compliance_email);
        if (data.compliance_portal) setCompliancePortal(data.compliance_portal);
        if (data.target_wallet) setTargetWallet(data.target_wallet);
        generateQR(data);
      }
=======
      setNoticeData(data);

      // Generate Verification QR Code
      const verificationPayload = JSON.stringify({
        statutory_authority: 'Section 91 CrPC / Section 94 BNSS',
        ref_no: data.ref_number || `TRACEVERSE/LEA/2026/${analysisId.slice(0, 8)}`,
        target_vasp: data.vasp_name,
        compliance_email: data.compliance_email,
        crime_ack: crimeNumber,
        investigating_officer: officerName,
        police_unit: policeStation,
        verified_tx_count: data.critical_txs?.length || 1,
        timestamp: new Date().toISOString()
      });

      const qrUrl = await QRCode.toDataURL(verificationPayload, {
        width: 140,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      });
      setQrDataUrl(qrUrl);
>>>>>>> Stashed changes
    } catch (err) {
      console.error('Failed to fetch freeze notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (analysisId) {
      fetchNotice();
    }
  }, [analysisId]);

  const handleCopy = () => {
    if (noticeData?.notice_markdown) {
      navigator.clipboard.writeText(noticeData.notice_markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const content = (
<<<<<<< Updated upstream
    <div
      style={{
        background: 'linear-gradient(135deg, #0B1736 0%, #0E1E43 55%, #0B1736 100%)',
      }}
      className={`print-document-container text-[#F8FAFC] w-full flex flex-col font-sans transition-colors duration-150 ${
        isFullPageView ? 'min-h-[calc(100vh-140px)]' : 'max-w-7xl max-h-[92vh] rounded-2xl border border-[#29436B] shadow-2xl overflow-hidden'
      }`}
    >
      {/* 1. APPLICATION WORKSPACE HEADER */}
      <div className="no-print p-5 sm:p-6 border-b border-[#29436B] bg-[#102347] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[rgba(230,57,70,0.10)] border border-[rgba(230,57,70,0.25)] text-[#F04B56] inline-flex items-center justify-center shrink-0 shadow-sm">
            <Scale className="h-6 w-6 shrink-0 text-[#F04B56]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">
                Section 91 CrPC / Section 94 BNSS Statutory Freeze Requisition
              </h1>
              <div className="px-2.5 py-1 rounded-md bg-[#162D55] border border-[#29436B] text-xs font-mono text-[#FCA5A5] font-semibold">
                {refNumber}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#CBD5E1] mt-0.5">
              Official legal requisition for immediate asset freezing, KYC disclosure, and transaction preservation.
=======
    <div className={`print-document-container bg-forensic-surface border border-forensic-border rounded-lg w-full flex flex-col font-sans text-xs overflow-hidden transition-colors ${
      isFullPageView ? 'shadow-sm' : 'max-w-5xl max-h-[94vh] shadow-2xl'
    }`}>
      {/* On-Screen Header (Hidden during Print) */}
      <div className="no-print p-4 border-b border-forensic-border flex items-center justify-between bg-forensic-bg/95">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-forensic-text tracking-wide uppercase">
                Section 91 CrPC / Section 94 BNSS Statutory Freeze Requisition
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {noticeData?.ref_number || 'STATUTORY ORDER'}
              </span>
            </div>
            <p className="text-[11px] text-forensic-textDim mt-0.5">
              Official legal requisition for immediate asset freezing, KYC disclosure, and Section 65B preservation
>>>>>>> Stashed changes
            </p>
          </div>
        </div>

<<<<<<< Updated upstream
        {onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#162D55] transition-colors inline-flex items-center justify-center shrink-0 border border-transparent hover:border-[#29436B]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 shrink-0" />
          </button>
        )}
      </div>

      {/* 2. ACTION BAR */}
      <div className="no-print px-5 sm:px-6 py-3 border-b border-[#29436B] bg-[#102347]/95 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: View Tabs */}
        <div className="inline-flex items-center bg-[#0E2042] p-1 rounded-lg border border-[#29436B]">
          <button
            onClick={() => setActiveTab('form')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
              activeTab === 'form'
                ? 'bg-[#162D55] text-[#F8FAFC] shadow-sm border border-[#29436B] font-semibold'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-[#E63946]" />
            <span>Order Form</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
              activeTab === 'preview'
                ? 'bg-[#162D55] text-[#F8FAFC] shadow-sm border border-[#29436B] font-semibold'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Shield className="h-3.5 w-3.5 shrink-0 text-[#E63946]" />
            <span>Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
              activeTab === 'markdown'
                ? 'bg-[#162D55] text-[#F8FAFC] shadow-sm border border-[#29436B] font-semibold'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Code className="h-3.5 w-3.5 shrink-0 text-[#38BDF8]" />
            <span>Plain Text</span>
          </button>
        </div>

        {/* Center: Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0E2042] border border-[#29436B] text-xs">
          {isFormValid ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shrink-0" />
              <span className="text-[#22C55E] font-medium">READY</span>
              <span className="text-[#CBD5E1] hidden sm:inline">— Form valid and ready for generation</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
              <span className="text-[#F59E0B] font-medium">ACTION REQUIRED</span>
              <span className="text-[#CBD5E1] hidden sm:inline">— Complete required fields</span>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="h-9 px-3.5 rounded-lg bg-[#102347] hover:bg-[#162D55] border border-[#29436B] hover:border-[#3C5C89] text-[#CBD5E1] hover:text-[#F8FAFC] font-medium transition-colors inline-flex items-center gap-1.5 text-xs shadow-sm"
          >
            {copied ? <Check className="h-4 w-4 text-[#22C55E]" /> : <Copy className="h-4 w-4 text-[#94A3B8]" />}
=======
        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Tab switchers */}
          <div className="flex items-center bg-forensic-surfaceRaised p-0.5 rounded border border-forensic-border mr-2">
            <button
              onClick={() => setActiveTab('visual')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-[11px] font-medium transition-all ${
                activeTab === 'visual'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-forensic-textDim hover:text-forensic-text'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Official Order Form</span>
            </button>

            <button
              onClick={() => setActiveTab('markdown')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-[11px] font-medium transition-all ${
                activeTab === 'markdown'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-forensic-textDim hover:text-forensic-text'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              <span>Plain Text</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-forensic-surfaceRaised hover:bg-forensic-border border border-forensic-border text-forensic-text font-medium text-[11px]"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-forensic-textDim" />}
>>>>>>> Stashed changes
            <span>{copied ? 'Copied' : 'Copy Notice'}</span>
          </button>

          <button
<<<<<<< Updated upstream
            onClick={handleDownloadMd}
            className="h-9 px-3.5 rounded-lg bg-[#102347] hover:bg-[#162D55] border border-[#29436B] hover:border-[#3C5C89] text-[#CBD5E1] hover:text-[#F8FAFC] font-medium transition-colors inline-flex items-center gap-1.5 text-xs shadow-sm"
          >
            <Download className="h-4 w-4 text-[#94A3B8]" />
            <span>Download MD</span>
          </button>

          <button
            onClick={handlePrint}
            className="h-9 px-4 rounded-lg bg-[#E63946] hover:bg-[#F04B56] active:bg-[#B91C2B] text-white font-semibold transition-all inline-flex items-center gap-2 text-xs shadow-md active:translate-y-[1px]"
          >
            <Printer className="h-4 w-4" />
            <span>Print Official Notice</span>
          </button>
        </div>
      </div>

      {/* 3. CASE METADATA PANEL & VASP STRIP */}
      <div className="no-print p-5 sm:p-6 border-b border-[#29436B] bg-[#102347] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
          {/* Officer */}
          <div className="min-w-0">
            <label className="text-[12px] sm:text-[13px] font-medium text-[#94A3B8] flex items-center gap-1.5 mb-1.5">
              <User className="h-3.5 w-3.5 text-[#E63946] shrink-0" />
              <span>Investigating Officer Name *</span>
            </label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              placeholder="e.g. Inspector R. K. Sharma"
              className="w-full h-10 px-3.5 bg-[#0E2042] border border-[#29436B] text-[#F8FAFC] rounded-lg text-sm focus:outline-none focus:border-[#E63946] focus:ring-[3px] focus:ring-[rgba(230,57,70,0.12)] transition-all placeholder:text-[#7F93B2]"
            />
          </div>

          {/* Unit */}
          <div className="min-w-0">
            <label className="text-[12px] sm:text-[13px] font-medium text-[#94A3B8] flex items-center gap-1.5 mb-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#E63946] shrink-0" />
              <span>Police Unit / Cyber Cell *</span>
            </label>
            <input
              type="text"
              value={policeStation}
              onChange={(e) => setPoliceStation(e.target.value)}
              placeholder="e.g. Cyber Crime Police Station, CID"
              className="w-full h-10 px-3.5 bg-[#0E2042] border border-[#29436B] text-[#F8FAFC] rounded-lg text-sm focus:outline-none focus:border-[#E63946] focus:ring-[3px] focus:ring-[rgba(230,57,70,0.12)] transition-all placeholder:text-[#7F93B2]"
            />
          </div>

          {/* NCRP Ref */}
          <div className="min-w-0">
            <label className="text-[12px] sm:text-[13px] font-medium text-[#94A3B8] flex items-center gap-1.5 mb-1.5">
              <FileText className="h-3.5 w-3.5 text-[#E63946] shrink-0" />
              <span>NCRP Ack / Crime Reference Number *</span>
            </label>
            <input
              type="text"
              value={crimeNumber}
              onChange={(e) => setCrimeNumber(e.target.value)}
              placeholder="e.g. NCRP/2026/CYBER-FIN/8842"
              className="w-full h-10 px-3.5 bg-[#0E2042] border border-[#29436B] text-[#F8FAFC] rounded-lg text-sm focus:outline-none focus:border-[#E63946] focus:ring-[3px] focus:ring-[rgba(230,57,70,0.12)] font-mono transition-all placeholder:text-[#7F93B2]"
            />
=======
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] shadow-sm cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Official Notice</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded text-forensic-textDim hover:text-forensic-text hover:bg-forensic-surfaceRaised ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Input Parameters Bar (Hidden during Print) */}
      <div className="no-print p-3 bg-forensic-surfaceRaised border-b border-forensic-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="text-[10px] uppercase text-forensic-textDim font-semibold block mb-1">
            Investigating Officer Name
          </label>
          <input
            type="text"
            value={officerName}
            onChange={(e) => setOfficerName(e.target.value)}
            onBlur={fetchNotice}
            className="w-full bg-forensic-bg border border-forensic-border rounded px-2.5 py-1 text-forensic-text font-mono text-[11px]"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase text-forensic-textDim font-semibold block mb-1">
            Police Unit / Cyber Cell
          </label>
          <input
            type="text"
            value={policeStation}
            onChange={(e) => setPoliceStation(e.target.value)}
            onBlur={fetchNotice}
            className="w-full bg-forensic-bg border border-forensic-border rounded px-2.5 py-1 text-forensic-text font-mono text-[11px]"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase text-forensic-textDim font-semibold block mb-1">
            NCRP Ack / Crime Reference Number
          </label>
          <input
            type="text"
            value={crimeNumber}
            onChange={(e) => setCrimeNumber(e.target.value)}
            onBlur={fetchNotice}
            className="w-full bg-forensic-bg border border-forensic-border rounded px-2.5 py-1 text-forensic-text font-mono text-[11px]"
          />
        </div>
      </div>

      {/* Target VASP Direct Contact Bar (Hidden during Print) */}
      {noticeData && (
        <div className="no-print px-4 py-2.5 bg-forensic-bg border-b border-forensic-border flex flex-wrap items-center justify-between text-[11px] gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-forensic-textDim uppercase text-[10px]">Addressed VASP:</span>
            <strong className="text-rose-400 font-bold font-mono">{noticeData.vasp_name}</strong>
          </div>
          <div className="flex items-center space-x-3 text-forensic-textDim font-mono">
            <span className="flex items-center space-x-1">
              <Mail className="h-3 w-3 text-emerald-400" />
              <span className="text-forensic-text">{noticeData.compliance_email}</span>
            </span>
            <span>•</span>
            <span>{noticeData.ref_number}</span>
>>>>>>> Stashed changes
          </div>
        </div>
      )}

<<<<<<< Updated upstream
        {/* VASP INFORMATION STRIP */}
        <div className="p-3.5 bg-[#162D55] rounded-xl border border-[#29436B] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[#94A3B8] font-medium">ADDRESSED VASP:</span>
            <strong className="text-[#FCA5A5] text-sm font-bold truncate">{vaspName}</strong>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-[#22C55E] border border-emerald-500/20">
              Registered VASP
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[#CBD5E1] min-w-0">
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <Mail className="h-3.5 w-3.5 text-[#F59E0B] shrink-0" />
              <span className="text-[#F8FAFC] font-mono truncate">{complianceEmail}</span>
            </span>
            <span className="text-[#29436B] hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5 text-[#94A3B8]">
              <Globe className="h-3.5 w-3.5 text-[#94A3B8] shrink-0" />
              <span className="truncate">Jurisdiction: Official LEA Intercept • {refNumber}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 bg-[#0B1736]">
        {activeTab === 'markdown' ? (
          /* Plain Text View */
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center text-xs text-[#CBD5E1]">
              <span className="font-semibold uppercase tracking-wider text-[#E63946]">Markdown Plain Text Representation</span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-[#102347] hover:bg-[#162D55] border border-[#29436B] text-xs text-[#F8FAFC] inline-flex items-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5 text-[#E63946]" />
                <span>{copied ? 'Copied' : 'Copy All Text'}</span>
              </button>
            </div>
            <pre className="p-6 bg-[#102347] border border-[#29436B] rounded-xl font-mono text-xs text-[#F8FAFC] overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-lg">
              {compiledMarkdownNotice}
            </pre>
          </div>
        ) : (
          /* Order Form (Navy + Red) + Soft White Legal Document (2 Columns) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0 max-w-7xl mx-auto">
            {/* LEFT COLUMN: WORKFLOW STEPPER & FORM (30% on Desktop) */}
            {activeTab === 'form' && (
              <div className="no-print lg:col-span-4 space-y-6 min-w-0">
                {/* Workflow Stepper Panel */}
                <div className="bg-[#102347] border border-[#29436B] rounded-xl p-4 sm:p-5 shadow-md space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">
                    Workflow Progress
                  </div>
                  <div className="space-y-1">
                    {workflowSteps.map((step) => {
                      const isActive = activeStep === step.number;
                      const isCompleted = activeStep > step.number;
                      return (
                        <button
                          key={step.number}
                          onClick={() => setActiveStep(step.number)}
                          className={`w-full p-2.5 rounded-lg text-left transition-all flex items-center gap-3 ${
                            isActive
                              ? 'bg-[rgba(230,57,70,0.12)] border-l-[3px] border-l-[#E63946] text-[#F8FAFC] border-y border-r border-[#29436B]'
                              : 'hover:bg-[#162D55] text-[#CBD5E1] hover:text-[#F8FAFC]'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              isActive
                                ? 'bg-[#E63946] text-white shadow-sm'
                                : isCompleted
                                ? 'bg-[#22C55E] text-white'
                                : 'bg-[#162D55] border border-[#29436B] text-[#94A3B8]'
                            }`}
                          >
                            {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.number}
                          </div>
                          <div className="min-w-0">
                            <div className={`text-xs font-semibold truncate ${isActive ? 'text-[#F8FAFC]' : 'text-[#CBD5E1]'}`}>
                              {step.title}
                            </div>
                            <div className="text-[11px] text-[#94A3B8] truncate">{step.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Step Panel */}
                <div className="bg-[#102347] border border-[#29436B] rounded-xl p-5 sm:p-6 shadow-md space-y-5">
                  {/* Step 1: Case Information */}
                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#F8FAFC]">Case Information</h3>
                        <p className="text-[13px] text-[#94A3B8] mt-0.5">Provide the basic investigation details and target subject.</p>
                      </div>

                      <div className="space-y-3.5 text-xs">
                        <div>
                          <label className="text-[#CBD5E1] font-medium block mb-1">Target Suspect Wallet</label>
                          <input
                            type="text"
                            value={targetWallet}
                            onChange={(e) => setTargetWallet(e.target.value)}
                            className="w-full h-10 px-3 bg-[#0E2042] border border-[#29436B] text-[#F8FAFC] rounded-lg font-mono text-xs focus:border-[#E63946] focus:ring-[3px] focus:ring-[rgba(230,57,70,0.12)]"
                          />
                        </div>

                        <div>
                          <label className="text-[#CBD5E1] font-medium block mb-1">Incident / Issuance Date</label>
                          <input
                            type="date"
                            value={incidentDate}
                            onChange={(e) => setIncidentDate(e.target.value)}
                            className="w-full h-10 px-3 bg-[#0E2042] border border-[#29436B] text-[#F8FAFC] rounded-lg text-xs focus:border-[#E63946] focus:ring-[3px] focus:ring-[rgba(230,57,70,0.12)]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Legal Provisions */}
                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#F8FAFC]">Legal Provisions</h3>
                        <p className="text-[13px] text-[#94A3B8] mt-0.5">Configure statutory authority & priority classification.</p>
                      </div>

                      <div className="space-y-3.5 text-xs">
                        <div>
                          <label className="text-[#CBD5E1] font-medium block mb-1.5">Applicable Statutory Authority</label>
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              type="button"
                              onClick={() => setStatuteSelection('both')}
                              className={`p-2.5 rounded-lg border text-left transition-all ${
                                statuteSelection === 'both'
                                  ? 'bg-[rgba(230,57,70,0.12)] border-[#E63946] text-[#F8FAFC] font-semibold'
                                  : 'bg-[#162D55] border-[#29436B] text-[#CBD5E1]'
                              }`}
                            >
                              Section 91 Cr.P.C. (1973) + Section 94 B.N.S.S. (2023)
                            </button>
                            <button
                              type="button"
                              onClick={() => setStatuteSelection('crpc')}
                              className={`p-2.5 rounded-lg border text-left transition-all ${
                                statuteSelection === 'crpc'
                                  ? 'bg-[rgba(230,57,70,0.12)] border-[#E63946] text-[#F8FAFC] font-semibold'
                                  : 'bg-[#162D55] border-[#29436B] text-[#CBD5E1]'
                              }`}
                            >
                              Section 91 of Code of Criminal Procedure, 1973
                            </button>
                            <button
                              type="button"
                              onClick={() => setStatuteSelection('bnss')}
                              className={`p-2.5 rounded-lg border text-left transition-all ${
                                statuteSelection === 'bnss'
                                  ? 'bg-[rgba(230,57,70,0.12)] border-[#E63946] text-[#F8FAFC] font-semibold'
                                  : 'bg-[#162D55] border-[#29436B] text-[#CBD5E1]'
                              }`}
                            >
                              Section 94 Bharatiya Nagarik Suraksha Sanhita, 2023
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[#CBD5E1] font-medium block mb-1.5">Priority Classification</label>
                          <select
                            value={urgencyLevel}
                            onChange={(e: any) => setUrgencyLevel(e.target.value)}
                            className="w-full h-10 px-3 bg-[#0E2042] border border-[#29436B] text-[#F8FAFC] rounded-lg text-xs focus:border-[#E63946]"
                          >
                            <option value="EMERGENCY PRESERVATION">EMERGENCY PRESERVATION (24 Hours)</option>
                            <option value="CRITICAL REQUISITION">CRITICAL REQUISITION (48 Hours)</option>
                            <option value="HIGH PRIORITY">HIGH PRIORITY (72 Hours)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Requisition Details */}
                  {activeStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#F8FAFC]">Requisition Directives</h3>
                        <p className="text-[13px] text-[#94A3B8] mt-0.5">Mandatory statutory commands issued to VASP nodal officer.</p>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[#162D55] border border-[#29436B] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeGagOrder}
                            onChange={(e) => setIncludeGagOrder(e.target.checked)}
                            className="mt-0.5 rounded border-[#29436B] text-[#E63946] focus:ring-[#E63946]"
                          />
                          <div>
                            <strong className="text-[#F8FAFC] block">Statutory Gag Order (Non-Disclosure)</strong>
                            <span className="text-[#94A3B8] text-[11px]">Strict instruction not to disclose inquiry to suspect</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[#162D55] border border-[#29436B] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={include65BCertificate}
                            onChange={(e) => setInclude65BCertificate(e.target.checked)}
                            className="mt-0.5 rounded border-[#29436B] text-[#E63946] focus:ring-[#E63946]"
                          />
                          <div>
                            <strong className="text-[#F8FAFC] block">Section 65B Electronic Certificate</strong>
                            <span className="text-[#94A3B8] text-[11px]">Demand electronic evidence compliance certificate</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 4: VASP Details */}
                  {activeStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#F8FAFC]">Addressed VASP</h3>
                        <p className="text-[13px] text-[#94A3B8] mt-0.5">Destination exchange compliance contacts & legal intercept.</p>
                      </div>

                      <div className="space-y-3.5 text-xs">
                        <div>
                          <label className="text-[#CBD5E1] font-medium block mb-1">VASP Name</label>
                          <input
                            type="text"
                            value={vaspName}
                            onChange={(e) => setVaspName(e.target.value)}
                            className="w-full h-10 px-3 bg-[#0E2042] border border-[#29436B] text-[#F8FAFC] rounded-lg text-xs focus:border-[#E63946]"
                          />
                        </div>
                        <div>
                          <label className="text-[#CBD5E1] font-medium block mb-1">Designated Compliance Email</label>
                          <input
                            type="email"
                            value={complianceEmail}
                            onChange={(e) => setComplianceEmail(e.target.value)}
                            className="w-full h-10 px-3 bg-[#0E2042] border border-[#29436B] text-[#F8FAFC] rounded-lg font-mono text-xs focus:border-[#E63946]"
                          />
                        </div>
                        <div>
                          <label className="text-[#CBD5E1] font-medium block mb-1">Official LEA Portal</label>
                          <input
                            type="text"
                            value={compliancePortal}
                            onChange={(e) => setCompliancePortal(e.target.value)}
                            className="w-full h-10 px-3 bg-[#0E2042] border border-[#29436B] text-[#F8FAFC] rounded-lg text-xs focus:border-[#E63946]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Review & Generate */}
                  {activeStep === 5 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#F8FAFC]">Review & Issue</h3>
                        <p className="text-[13px] text-[#94A3B8] mt-0.5">Verify information before printing or exporting.</p>
                      </div>

                      <div className="p-3.5 bg-[#162D55] rounded-xl border border-[#29436B] space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#94A3B8]">Issuing Officer:</span>
                          <span className="text-[#F8FAFC] font-medium">{officerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#94A3B8]">Target VASP:</span>
                          <span className="text-[#FCA5A5] font-semibold">{vaspName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#94A3B8]">Statutory Seal:</span>
                          <span className="text-[#22C55E] font-semibold">QR Sealed & Verified</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePrint}
                        className="w-full h-10 px-4 rounded-lg bg-[#E63946] hover:bg-[#F04B56] active:bg-[#B91C2B] text-white font-semibold transition-all inline-flex items-center justify-center gap-2 text-xs shadow-md"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Print Official Notice</span>
                      </button>
                    </div>
                  )}

                  {/* Stepper Navigation Controls */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#29436B]">
                    <button
                      type="button"
                      disabled={activeStep === 1}
                      onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
                      className="px-3 py-1.5 rounded-lg border border-[#29436B] text-xs text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#162D55] disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center gap-1.5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      disabled={activeStep === 5}
                      onClick={() => setActiveStep((s) => Math.min(5, s + 1))}
                      className="px-3.5 py-1.5 rounded-lg bg-[#162D55] hover:bg-[#1C3763] border border-[#29436B] text-xs text-[#F8FAFC] font-medium disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
=======
      {/* Official Requisition Content */}
      <div className={`overflow-y-auto bg-forensic-bg p-6 print:bg-white print:text-black ${
        isFullPageView ? 'min-h-[500px]' : 'flex-1'
      }`}>
        {!analysisId ? (
          <div className="flex items-center justify-center py-24 text-forensic-textDim text-center">
            <span>Please execute a wallet trace in the Target Workspace first to generate a Section 91 statutory requisition.</span>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-forensic-textDim">
            <div className="h-8 w-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <span className="text-xs font-mono">Generating formal statutory order & cryptographic QR verification seal...</span>
          </div>
        ) : activeTab === 'visual' && noticeData ? (
          /* Official Legal Order Visual Form */
          <div className="max-w-4xl mx-auto space-y-6 text-forensic-text print:text-black font-serif">
            
            {/* Official Legal Order Header */}
            <div className="p-6 rounded-lg bg-forensic-surface border border-forensic-border print:border-black/40 print:bg-transparent text-center relative">
              <div className="text-[11px] font-sans font-bold tracking-widest text-forensic-textDim uppercase mb-1">
                GOVERNMENT OF INDIA // LAW ENFORCEMENT & CYBER CRIME INVESTIGATION
              </div>
              <h1 className="text-base font-bold uppercase tracking-wider text-forensic-text print:text-black">
                LEGAL NOTICE UNDER SECTION 91 Cr.P.C. / SECTION 94 BNSS
              </h1>
              <p className="text-xs font-sans text-forensic-textDim print:text-black/70 mt-1">
                REQUISITION FOR IMMEDIATE ASSET PRESERVATION, FREEZE & BENEFICIAL KYC DISCLOSURE
              </p>

              {/* QR Verification Seal Top-Right */}
              {qrDataUrl && (
                <div className="absolute right-5 top-5 hidden sm:flex flex-col items-center p-1.5 rounded bg-white border border-black/20 shadow-sm print:flex">
                  <img src={qrDataUrl} alt="Verification QR" className="h-16 w-16" />
                  <span className="text-[8px] font-mono text-black font-bold mt-0.5">SCAN TO VERIFY</span>
                </div>
              )}
            </div>

            {/* Recipient & Metadata Grid */}
            <div className="p-5 rounded-lg bg-forensic-surface border border-forensic-border print:border-black/30 font-mono text-[11px] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-forensic-textDim block uppercase">TO (COMPLIANCE OFFICER):</span>
                  <div className="font-bold text-forensic-text print:text-black text-xs">{noticeData.vasp_name} Compliance Department</div>
                  <div className="text-blue-400 print:text-blue-700">{noticeData.compliance_email}</div>
                </div>

                <div>
                  <span className="text-[10px] text-forensic-textDim block uppercase">FROM (INVESTIGATING AUTHORITY):</span>
                  <div className="font-bold text-forensic-text print:text-black text-xs">{officerName}</div>
                  <div className="text-forensic-textDim print:text-black/80">{policeStation}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-forensic-border print:border-black/20 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px]">
                <div>
                  <span className="text-forensic-textDim block">REFERENCE NUMBER:</span>
                  <span className="font-bold text-forensic-text print:text-black">{noticeData.ref_number}</span>
                </div>
                <div>
                  <span className="text-forensic-textDim block">CRIME / NCRP NUMBER:</span>
                  <span className="font-bold text-forensic-text print:text-black">{crimeNumber}</span>
                </div>
                <div>
                  <span className="text-forensic-textDim block">DATE OF ORDER:</span>
                  <span className="font-bold text-forensic-text print:text-black">{new Date().toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            </div>

            {/* Legal Requisition Mandates */}
            <div className="p-5 rounded-lg bg-forensic-surface border border-forensic-border print:border-black/30 space-y-4 font-sans text-xs leading-relaxed">
              <h3 className="font-bold uppercase tracking-wide text-rose-400 print:text-rose-700 text-xs">
                Statutory Directives to Virtual Asset Service Provider (VASP):
              </h3>
              
              <ol className="list-decimal pl-5 space-y-2 text-forensic-text print:text-black">
                <li>
                  <strong>Immediate Asset Freeze:</strong> You are directed to immediately place an administrative and transactional debit freeze on all funds, cryptocurrency tokens, fiat balances, and linked sub-accounts associated with the verified destination addresses identified below.
                </li>
                <li>
                  <strong>Complete KYC & Identity Disclosure:</strong> Furnish certified true copies of full Know-Your-Customer (KYC) dossiers, including Government ID documents, PAN/Passport, phone numbers, registered email IDs, linked bank account numbers, and IP connection audit logs for the beneficial owners of said accounts.
                </li>
                <li>
                  <strong>Historical Transaction Ledger:</strong> Provide complete chronological fiat deposit/withdrawal history, on-chain internal transfer logs, and counterparty wallet records from inception to date.
                </li>
              </ol>
            </div>

            {/* Critical On-Chain Transaction Evidence */}
            {noticeData.critical_txs && noticeData.critical_txs.length > 0 && (
              <div className="p-5 rounded-lg bg-forensic-surface border border-forensic-border print:border-black/30 space-y-3 font-mono text-[11px]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-700">
                  Verified On-Chain Transaction Evidence Schedule:
                </h3>

                <div className="overflow-x-auto border border-forensic-border print:border-black/20 rounded">
                  <table className="w-full text-left">
                    <thead className="bg-forensic-surfaceRaised print:bg-gray-100 text-forensic-textDim print:text-black border-b border-forensic-border">
                      <tr>
                        <th className="p-2.5">Tx Hash</th>
                        <th className="p-2.5">Source Address</th>
                        <th className="p-2.5">Destination VASP Address</th>
                        <th className="p-2.5">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forensic-border print:divide-gray-200">
                      {noticeData.critical_txs.map((tx: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold text-blue-400 print:text-blue-700 break-all">{tx.tx_hash}</td>
                          <td className="p-2.5 break-all">{tx.from_address}</td>
                          <td className="p-2.5 break-all text-emerald-400 print:text-emerald-700 font-bold">{tx.to_address}</td>
                          <td className="p-2.5 font-bold">{tx.amount} {tx.token_symbol || 'ETH'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
>>>>>>> Stashed changes
                </div>
              </div>
            )}

<<<<<<< Updated upstream
            {/* RIGHT COLUMN: SOFT WHITE LEGAL DOCUMENT PREVIEW (70% or 100%) */}
            <div className={`space-y-4 min-w-0 ${activeTab === 'form' ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
              {/* Document Toolbar */}
              <div className="no-print p-3 rounded-xl bg-[#102347] border border-[#29436B] flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Zoom controls */}
                <div className="inline-flex items-center gap-1 bg-[#0E2042] p-1 rounded-lg border border-[#29436B]">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.8, Number((z - 0.1).toFixed(1))))}
                    className="p-1 rounded hover:bg-[#102347] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-2 font-mono text-[11px] text-[#F8FAFC] font-medium">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(1.25, Number((z + 0.1).toFixed(1))))}
                    className="p-1 rounded hover:bg-[#102347] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1.0)}
                    className="p-1 rounded hover:bg-[#102347] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors ml-1"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                </div>

                {/* Page indicator & Print Action */}
                <div className="flex items-center gap-3">
                  <span className="text-[#94A3B8] text-xs font-mono">‹ 1 / 1 ›</span>
                  <button
                    onClick={handlePrint}
                    className="h-8 px-3.5 rounded-lg bg-[#E63946] hover:bg-[#F04B56] text-white font-medium inline-flex items-center gap-1.5 text-xs transition-colors shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Generate & Download PDF</span>
                  </button>
                </div>
              </div>

              {/* SOFT WHITE LEGAL DOCUMENT CANVAS */}
              <div
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                className="transition-transform duration-150 ease-out p-3 sm:p-5 rounded-2xl bg-[#162D55] border border-[#29436B]"
              >
                <div
                  className="print-content bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl p-7 sm:p-11 shadow-[0_12px_40px_rgba(0,0,0,0.25)] space-y-6 text-[#172033] relative overflow-hidden"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {/* Subtle emblem watermark */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.025] select-none">
                    <Scale className="w-96 h-96 text-[#172033]" />
                  </div>

                  {/* 1. Official Government Header */}
                  <div className="text-center border-b border-[#CBD5E1] pb-5 space-y-1.5 relative z-10">
                    <div className="text-xs uppercase tracking-widest font-bold text-[#475569]">
                      STATE POLICE CRIME INVESTIGATION DEPARTMENT
                    </div>
                    <div className="text-base uppercase font-bold tracking-wider text-[#0F172A]">
                      CYBER FINANCIAL CRIMES INVESTIGATION WING
                    </div>
                    <div className="text-xs text-[#64748B]">
                      {policeStation}
                    </div>
                    <div className="text-xs font-bold pt-1.5 text-[#C1121F] tracking-wider uppercase" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                      REQUISITION UNDER SECTION 91 Cr.P.C. / SECTION 94 B.N.S.S.
                    </div>
                  </div>

                  {/* 2. Reference & Priority Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-[#CBD5E1] pb-4 relative z-10" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <div>
                      <span className="text-[11px] text-[#64748B] uppercase font-semibold block mb-0.5">Ref No</span>
                      <strong className="font-mono text-[#334155]">{refNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64748B] uppercase font-semibold block mb-0.5">Crime Ack No</span>
                      <strong className="font-mono text-[#334155]">{crimeNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64748B] uppercase font-semibold block mb-0.5">Date of Issuance</span>
                      <strong className="text-[#172033]">{new Date().toLocaleDateString('en-GB')}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64748B] uppercase font-semibold block mb-0.5">Priority</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-[#C1121F] border border-rose-200">
                        {urgencyLevel}
                      </span>
                    </div>
                  </div>

                  {/* 3. To Addressee */}
                  <div className="space-y-1 text-xs relative z-10" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <div className="font-bold text-[#475569] uppercase tracking-wider text-[11px]">TO:</div>
                    <div className="font-bold text-[#0F172A] text-sm">{vaspName} (Compliance & Legal Intercept)</div>
                    <div className="text-[#475569]">
                      Designated Email: <span className="font-mono text-[#172033]">{complianceEmail}</span>
                    </div>
                    <div className="text-[#475569]">
                      Service Provider Jurisdiction: <span className="text-[#172033]">Registered VASP Cluster • International</span>
                    </div>
                  </div>

                  {/* 4. Subject Box (Subtle Red-Accented Legal Subject Box) */}
                  <div className="p-4 bg-[#FFF7F7] rounded-xl border border-[#FECACA] border-l-4 border-l-[#E63946] text-xs sm:text-sm font-semibold leading-relaxed text-[#172033] relative z-10" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    SUBJECT: STATUTORY REQUISITION FOR IMMEDIATE ASSET FREEZE, SUSPENSION OF WITHDRAWALS,
                    KYC DISCLOSURE, AND TRANSACTION LOG PRESERVATION UNDER SECTION 91 OF CODE OF CRIMINAL
                    PROCEDURE, 1973 (READ WITH SECTION 94 BNSS 2023).
                  </div>

                  {/* 5. Statutory Body Paragraphs */}
                  <div className="space-y-4 text-sm leading-relaxed text-[#172033] text-justify relative z-10">
                    <p>
                      Sir/Madam,
                    </p>
                    <p>
                      1. Whereas an active cyber financial investigation has been registered at {policeStation} under
                      Crime Reference Number <strong className="font-semibold text-[#172033]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{crimeNumber}</strong>.
                      Observable blockchain intelligence, heuristic counterparty graph analysis, and directed fund flow tracing
                      confirm that illicit proceeds of fraud traversed through the targeted address below and were directly deposited
                      into custodial infrastructure maintained by your Virtual Asset Service Provider.
                    </p>
                    <p>
                      2. You are hereby commanded under the statutory authority of{' '}
                      <strong className="font-semibold text-[#172033]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Section 91 Cr.P.C.</strong> (read with{' '}
                      <strong className="font-semibold text-[#172033]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Section 94 of Bharatiya Nagarik Suraksha Sanhita, 2023</strong>)
                      to immediately place a temporary freeze on all cryptocurrency balances, withdrawal requests, and fiat transfers
                      associated with the destination recipient account, and provide full verified subscriber KYC records within twenty-four (24) hours.
                    </p>
                  </div>

                  {/* 6. Targeted Wallet & Proofs Table */}
                  <div className="space-y-2.5 relative z-10 text-xs" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <div className="font-bold uppercase text-[11px] tracking-wider text-[#475569]">
                      Subject Cryptocurrency Addresses Identified on Public Blockchain:
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-[#CBD5E1]">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#475569]">
                            <th className="p-3 text-left font-semibold">Target Wallet Address</th>
                            <th className="p-3 text-left font-semibold">Associated VASP</th>
                            <th className="p-3 text-center font-semibold">Proximity</th>
                            <th className="p-3 text-right font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          <tr className="bg-white">
                            <td className="p-3 font-mono font-semibold text-[#172033] break-all select-all">
                              {targetWallet}
                            </td>
                            <td className="p-3 font-semibold text-[#0F172A]">{vaspName}</td>
                            <td className="p-3 text-center font-mono text-[#64748B]">1–3 Hops</td>
                            <td className="p-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#059669] border border-emerald-200">
                                VERIFIED SIGNAL
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 7. Mandatory Directives List */}
                  <div className="space-y-2 text-xs sm:text-sm text-[#172033] relative z-10 leading-relaxed">
                    <div className="font-bold text-xs uppercase tracking-wider text-[#475569] mb-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                      Directives / Statutory Demands:
                    </div>
                    <p>
                      <strong>a) Immediate Account Freeze:</strong> Place an immediate total administrative freeze on all crypto balances,
                      tokens, and withdrawal facilities linked to the destination account UID.
                    </p>
                    <p>
                      <strong>b) Beneficial KYC Disclosure:</strong> Provide certified subscriber identity records, including full legal name,
                      passport/Aadhaar/national identification, registered telephone number, email, residential address, and IP access logs with timestamps.
                    </p>
                    <p>
                      <strong>c) Complete Ledger History:</strong> Furnish a complete deposit and withdrawal history for the subject account from inception to date.
                    </p>
                    <p>
                      <strong>d) Confirmation of Service:</strong> Acknowledge receipt and confirm compliance with this freeze order via reply email within twenty-four (24) hours.
                    </p>
                  </div>

                  {/* 8. Gag Order / Non-Disclosure Directive */}
                  {includeGagOrder && (
                    <div className="p-3.5 bg-rose-50/80 rounded-xl border border-rose-200 text-xs text-[#881337] relative z-10 space-y-1">
                      <strong className="text-[#C1121F] uppercase tracking-wider text-[11px] block" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Statutory Non-Disclosure Directive (Gag Order):
                      </strong>
                      <p className="leading-relaxed">
                        In the strict interest of ongoing criminal proceedings, you are commanded NOT to disclose or communicate
                        the existence of this requisition or corresponding asset freeze to the account holder under pain of statutory penalty.
                      </p>
                    </div>
                  )}

                  {/* 9. Official Statutory Digital Seal & QR Code Block */}
                  <div className="pt-6 border-t border-[#CBD5E1] flex flex-wrap items-end justify-between gap-4 text-xs relative z-10" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <div className="space-y-1.5 max-w-md">
                      <div className="font-bold text-xs uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-[#059669]" />
                        <span>Official Statutory Digital Seal</span>
                      </div>
                      <p className="text-[#64748B] text-xs">
                        Scan QR code on official government terminal to verify cryptographic issuance authenticity and Section 65B hash.
                      </p>
                      <div className="pt-3 space-y-0.5 text-xs" style={{ fontFamily: 'Georgia, serif' }}>
                        <div className="font-bold text-[#172033]">({officerName})</div>
                        <div className="text-[#475569]">{policeStation}</div>
                        <div className="text-[11px] text-[#64748B]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Official LEA Email: cybercell@police.gov.in</div>
                      </div>
                    </div>

                    {qrDataUrl && (
                      <div className="p-2 bg-white rounded-xl border border-[#CBD5E1] shadow-sm shrink-0">
                        <img src={qrDataUrl} alt="Verification Seal QR" className="w-24 h-24 sm:w-28 sm:h-28" />
                      </div>
                    )}
                  </div>

                  {/* 10. Document Footer */}
                  <div className="pt-4 border-t border-[#CBD5E1] flex items-center justify-between text-[11px] text-[#64748B]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <span>Cyber Financial Crimes Investigation Wing • State Police CID</span>
                    <span className="font-bold tracking-wider text-[#C1121F]">CONFIDENTIAL • OFFICIAL USE ONLY</span>
                    <span>Page 1 of 1</span>
                  </div>
                </div>
              </div>
            </div>
=======
            {/* Officer Signature Block */}
            <div className="pt-8 border-t border-forensic-border print:border-black/30 flex justify-between items-end font-sans text-xs text-forensic-text print:text-black">
              <div className="space-y-1 font-mono text-[10px] text-forensic-textDim print:text-black/70">
                <div>ELECTRONIC CASE VERIFICATION STAMP</div>
                <div>SEC. 65B INDIAN EVIDENCE ACT COMPLIANT</div>
                <div>SYSTEM AUDIT REF: {noticeData.ref_number}</div>
              </div>

              <div className="text-right space-y-1">
                <div className="h-12 flex items-center justify-end">
                  <span className="font-mono text-[10px] text-rose-400 print:text-rose-700 border-b border-dashed border-rose-400 pb-1">
                    [Digitally Signed by Authorized Cyber Cell Officer]
                  </span>
                </div>
                <div className="font-bold text-xs">{officerName}</div>
                <div className="text-[11px] text-forensic-textDim print:text-black/80">{policeStation}</div>
              </div>
            </div>
          </div>
        ) : (
          /* Plain Text Markdown View */
          <div className="max-w-4xl mx-auto">
            <pre className="p-5 rounded-lg bg-forensic-surface border border-forensic-border font-mono text-[11px] text-forensic-text leading-relaxed whitespace-pre-wrap select-all">
              {noticeData?.notice_markdown}
            </pre>
>>>>>>> Stashed changes
          </div>
        )}
      </div>
    </div>
  );

  if (isFullPageView) {
    return content;
  }

  return (
<<<<<<< Updated upstream
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
=======
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
>>>>>>> Stashed changes
      {content}
    </div>
  );
};
