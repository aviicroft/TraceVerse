'use client';

import React, { useState, useEffect } from 'react';
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
  // Form State
  const [officerName, setOfficerName] = useState('Inspector R. K. Sharma');
  const [policeStation, setPoliceStation] = useState('Cyber Crime Police Station, CID');
  const [crimeNumber, setCrimeNumber] = useState('NCRP/2026/CYBER-FIN/8842');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Legal parameters
  const [statuteSelection, setStatuteSelection] = useState<'both' | 'crpc' | 'bnss'>('both');
  const [urgencyLevel, setUrgencyLevel] = useState<'EMERGENCY PRESERVATION' | 'CRITICAL REQUISITION' | 'HIGH PRIORITY'>('EMERGENCY PRESERVATION');
  const [includeGagOrder, setIncludeGagOrder] = useState(true);
  const [include65BCertificate, setInclude65BCertificate] = useState(true);

  // VASP parameters
  const [vaspName, setVaspName] = useState('Binance');
  const [complianceEmail, setComplianceEmail] = useState('case-management@binance.com');
  const [compliancePortal, setCompliancePortal] = useState('https://www.binance.com/en/legal-enquiry');
  const [targetWallet, setTargetWallet] = useState('0x28C6c06298d514Db089934071355E5743bf21d60');

  // View & UI State
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'markdown'>('form');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [noticeData, setNoticeData] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Validation
  const isFormValid = officerName.trim().length > 0 && policeStation.trim().length > 0 && crimeNumber.trim().length > 0;

  // Case Reference ID
  const refNumber = noticeData?.ref_number || `LEA/CYBER/${new Date().getFullYear()}/${analysisId ? analysisId.slice(0, 8).toUpperCase() : '776B7AD3'}`;

  // Fetch or generate notice
  const fetchNotice = async () => {
    if (!analysisId) {
      // Create local fallback payload for standalone studio / demo exploration
      const sampleNotice = {
        vasp_name: vaspName,
        compliance_email: complianceEmail,
        compliance_portal: compliancePortal,
        ref_number: refNumber,
        crime_number: crimeNumber,
        target_wallet: targetWallet,
        chain: 'Ethereum',
        victim_loss: '₹ 24,50,000 (INR Equivalent)',
        critical_txs: [
          {
            tx_hash: '0x9a8f3b14e5d87a2c091e4b6c8a2f3d5e7b1a9c3d5e7f1a3b5c7d9e1f3a5b7c9d',
            timestamp: `${incidentDate} 09:42:15 UTC`,
            amount: '45,200.00',
            token_symbol: 'USDT',
            from_address: targetWallet,
            to_address: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
          },
          {
            tx_hash: '0x1c3e5a7b9d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c',
            timestamp: `${incidentDate} 10:15:30 UTC`,
            amount: '18.50',
            token_symbol: 'ETH',
            from_address: targetWallet,
            to_address: '0xdfd5293d8e347dfee59e53b24f2956fe95088d1',
          },
        ],
      };
      setNoticeData(sampleNotice);
      generateQR(sampleNotice);
      return;
    }

    try {
      setLoading(true);
      const data = await api.getFreezeNotice(analysisId, officerName, policeStation, crimeNumber);
      if (data) {
        setNoticeData(data);
        if (data.vasp_name) setVaspName(data.vasp_name);
        if (data.compliance_email) setComplianceEmail(data.compliance_email);
        if (data.compliance_portal) setCompliancePortal(data.compliance_portal);
        if (data.target_wallet) setTargetWallet(data.target_wallet);
        generateQR(data);
      }
    } catch (err) {
      console.error('Failed to fetch freeze notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async (data: any) => {
    try {
      const verificationPayload = JSON.stringify({
        statutory_authority: 'Section 91 CrPC / Section 94 BNSS',
        ref_no: data.ref_number || refNumber,
        target_vasp: data.vasp_name || vaspName,
        compliance_email: data.compliance_email || complianceEmail,
        crime_ack: crimeNumber,
        investigating_officer: officerName,
        police_unit: policeStation,
        timestamp: new Date().toISOString(),
        verified_status: 'AUTHENTIC_JUDICIAL_SEAL',
      });

      const qrUrl = await QRCode.toDataURL(verificationPayload, {
        width: 160,
        margin: 1,
        color: { dark: '#172033', light: '#FFFFFF' },
      });
      setQrDataUrl(qrUrl);
    } catch (qrErr) {
      console.error('QR generation failed:', qrErr);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [analysisId]);

  // Construct printable/copyable markdown
  const compiledMarkdownNotice = `================================================================================
OFFICIAL STATUTORY NOTICE FOR PRESERVATION & FREEZING OF CRYPTO ASSETS
UNDER SECTION 91 CODE OF CRIMINAL PROCEDURE, 1973 / SECTION 94 BNSS, 2023
================================================================================

REF NO: ${refNumber}
DATE OF ISSUANCE: ${new Date().toLocaleDateString('en-GB')}
CRIME REFERENCE / NCRP ACK: ${crimeNumber}
PRIORITY: ${urgencyLevel}

TO:
The Nodal Officer / Compliance Department,
${vaspName} Legal & Compliance Operations
Designated Email: ${complianceEmail}
Official Portal: ${compliancePortal}

FROM:
${officerName},
${policeStation},
Law Enforcement Agency, Republic of India.

SUBJECT: STATUTORY REQUISITION FOR IMMEDIATE ASSET FREEZE, SUSPENSION OF WITHDRAWALS,
KYC DISCLOSURE, AND TRANSACTION LOG PRESERVATION UNDER SECTION 91 Cr.P.C. / SECTION 94 BNSS 2023.

1. Whereas an active criminal investigation is underway at ${policeStation} under Crime Reference ${crimeNumber}. Observable on-chain intelligence confirms illicit funds originating from suspect wallet ${targetWallet} were directly deposited into custodial accounts managed by your platform.

2. TARGET SUBJECT IDENTIFIER:
   - Wallet Address: ${targetWallet}
   - Destination VASP: ${vaspName}
   - Applicable Statute: Section 91 Cr.P.C. / Section 94 B.N.S.S. 2023

3. MANDATORY STATUTORY DIRECTIVES:
   a) IMMEDIATELY FREEZE all account balances, crypto deposits, and fiat withdrawal facilities linked to the destination recipient UID / deposit address.
   b) PRESERVE and provide complete subscriber KYC (Passport/Aadhaar/National ID, registered phone, email, and IP login access logs).
   c) TRANSMIT complete transaction ledger from inception to current date.
   d) CONFIRM compliance with this statutory order within TWENTY-FOUR (24) HOURS.

4. NON-DISCLOSURE DIRECTIVE (GAG ORDER):
   You are strictly instructed NOT to disclose the existence of this statutory requisition to the account holder.

Issued under the seal and signature of the Investigating Authority.

(${officerName})
${policeStation}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledMarkdownNotice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMd = () => {
    const blob = new Blob([compiledMarkdownNotice], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Section91_Freeze_Requisition_${refNumber.replace(/\//g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const workflowSteps = [
    { number: 1, title: 'Case Information', desc: 'Officer, unit & reference' },
    { number: 2, title: 'Legal Provisions', desc: 'Section 91 / Section 94' },
    { number: 3, title: 'Requisition Details', desc: 'Freeze, KYC, Logs' },
    { number: 4, title: 'VASP Details', desc: 'Service provider info' },
    { number: 5, title: 'Review & Generate', desc: 'Verify and create notice' },
  ];

  const content = (
    <div
      style={{
        background: 'linear-gradient(135deg, #0B1736 0%, #0E1E43 55%, #0B1736 100%)',
      }}
      className={`print-document-container text-[#F8FAFC] w-full flex flex-col font-sans transition-colors duration-150 ${
        isFullPageView ? 'min-h-[calc(100vh-140px)]' : 'w-[calc(100%-16px)] sm:w-full max-w-7xl max-h-[92vh] rounded-2xl border border-[#29436B] shadow-2xl overflow-hidden'
      }`}
    >
      {/* 1. APPLICATION WORKSPACE HEADER */}
      <div className="no-print p-4 sm:p-6 border-b border-[#29436B] bg-[#102347] flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[rgba(230,57,70,0.10)] border border-[rgba(230,57,70,0.25)] text-[#F04B56] inline-flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
            <Scale className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-[#F04B56]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <h1 className="text-base sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">
                Section 91 CrPC / Section 94 BNSS Statutory Freeze Requisition
              </h1>
              <div className="px-2 py-0.5 sm:py-1 rounded-md bg-[#162D55] border border-[#29436B] text-[11px] sm:text-xs font-mono text-[#FCA5A5] font-semibold">
                {refNumber}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#CBD5E1] mt-0.5 line-clamp-1 sm:line-clamp-none">
              Official legal requisition for immediate asset freezing, KYC disclosure, and transaction preservation.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#162D55] transition-colors inline-flex items-center justify-center shrink-0 border border-transparent hover:border-[#29436B]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 shrink-0" />
          </button>
        )}
      </div>

      {/* 2. ACTION BAR */}
      <div className="no-print px-4 sm:px-6 py-3 border-b border-[#29436B] bg-[#102347]/95 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Left: View Tabs */}
        <div className="flex items-center bg-[#0E2042] p-1 rounded-lg border border-[#29436B] w-full md:w-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-md transition-all font-medium min-h-[40px] sm:min-h-0 ${
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
            className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-md transition-all font-medium min-h-[40px] sm:min-h-0 ${
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
            className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-md transition-all font-medium min-h-[40px] sm:min-h-0 ${
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0E2042] border border-[#29436B] text-xs self-start md:self-auto">
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
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-none min-h-[44px] px-3.5 rounded-lg bg-[#102347] hover:bg-[#162D55] border border-[#29436B] hover:border-[#3C5C89] text-[#CBD5E1] hover:text-[#F8FAFC] font-medium transition-colors inline-flex items-center justify-center gap-1.5 text-xs shadow-sm"
          >
            {copied ? <Check className="h-4 w-4 text-[#22C55E]" /> : <Copy className="h-4 w-4 text-[#94A3B8]" />}
            <span>{copied ? 'Copied' : 'Copy Notice'}</span>
          </button>

          <button
            onClick={handleDownloadMd}
            className="flex-1 sm:flex-none min-h-[44px] px-3.5 rounded-lg bg-[#102347] hover:bg-[#162D55] border border-[#29436B] hover:border-[#3C5C89] text-[#CBD5E1] hover:text-[#F8FAFC] font-medium transition-colors inline-flex items-center justify-center gap-1.5 text-xs shadow-sm"
          >
            <Download className="h-4 w-4 text-[#94A3B8]" />
            <span>Download MD</span>
          </button>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto min-h-[44px] px-4 rounded-lg bg-[#E63946] hover:bg-[#F04B56] active:bg-[#B91C2B] text-white font-semibold transition-all inline-flex items-center justify-center gap-2 text-xs shadow-md active:translate-y-[1px]"
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
          </div>
        </div>

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
              <div className="no-print lg:col-span-4 space-y-4 sm:space-y-6 min-w-0">
                {/* Mobile Workflow Stepper (Horizontal Scroll) */}
                <div className="lg:hidden flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                  {workflowSteps.map((step) => {
                    const isActive = activeStep === step.number;
                    const isCompleted = activeStep > step.number;
                    return (
                      <button
                        key={step.number}
                        onClick={() => setActiveStep(step.number)}
                        className={`min-h-[44px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 border ${
                          isActive
                            ? 'bg-[#E63946] text-white border-[#E63946] shadow-sm'
                            : isCompleted
                            ? 'bg-[#162D55] text-[#22C55E] border-[#29436B]'
                            : 'bg-[#102347] text-[#94A3B8] border-[#29436B]'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-black/20 inline-flex items-center justify-center font-bold text-[10px]">
                          {isCompleted ? <Check className="h-3 w-3" /> : step.number}
                        </span>
                        <span>{step.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Desktop Workflow Stepper Panel */}
                <div className="hidden lg:block bg-[#102347] border border-[#29436B] rounded-xl p-4 sm:p-5 shadow-md space-y-3">
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
                <div className="bg-[#102347] border border-[#29436B] rounded-xl p-4 sm:p-6 shadow-md space-y-5">
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
                </div>
              </div>
            )}

            {/* RIGHT COLUMN: SOFT WHITE LEGAL DOCUMENT PREVIEW (70% or 100%) */}
            <div className={`space-y-4 min-w-0 ${activeTab === 'form' ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
              {/* Document Toolbar */}
              <div className="no-print p-3 rounded-xl bg-[#102347] border border-[#29436B] flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Zoom controls */}
                <div className="inline-flex items-center gap-1 bg-[#0E2042] p-1 rounded-lg border border-[#29436B]">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.7, Number((z - 0.1).toFixed(1))))}
                    className="min-h-[38px] min-w-[38px] rounded-md hover:bg-[#102347] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors inline-flex items-center justify-center"
                    title="Zoom Out"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="px-2 font-mono text-xs text-[#F8FAFC] font-semibold">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(1.25, Number((z + 0.1).toFixed(1))))}
                    className="min-h-[38px] min-w-[38px] rounded-md hover:bg-[#102347] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors inline-flex items-center justify-center"
                    title="Zoom In"
                    aria-label="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1.0)}
                    className="min-h-[38px] px-2 rounded-md hover:bg-[#102347] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors ml-1 inline-flex items-center gap-1 font-mono text-[11px]"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </div>

                {/* Page indicator & Print Action */}
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-[#94A3B8] text-xs font-mono">‹ 1 / 1 ›</span>
                  <button
                    onClick={handlePrint}
                    className="min-h-[44px] px-3.5 rounded-lg bg-[#E63946] hover:bg-[#F04B56] text-white font-semibold inline-flex items-center justify-center gap-1.5 text-xs transition-colors shadow-sm flex-1 sm:flex-none"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Generate & Download PDF</span>
                  </button>
                </div>
              </div>

              {/* SOFT WHITE LEGAL DOCUMENT CANVAS */}
              <div className="overflow-x-auto max-w-full pb-2">
                <div
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                  className="transition-transform duration-150 ease-out p-3 sm:p-5 rounded-2xl bg-[#162D55] border border-[#29436B] min-w-[320px]"
                >
                  <div
                    className="print-content bg-[#FFFFFF] border border-[#CBD5E1] rounded-xl p-4 sm:p-11 shadow-[0_12px_40px_rgba(0,0,0,0.25)] space-y-6 text-[#172033] relative overflow-hidden"
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
          </div>
        </div>
        )}
      </div>
    </div>
  );

  if (isFullPageView) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      {content}
    </div>
  );
};
