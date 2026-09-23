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
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

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
        color: { dark: '#000000', light: '#ffffff' },
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
      className={`print-document-container bg-bg text-text w-full flex flex-col font-sans transition-colors duration-150 ${
        isFullPageView ? 'min-h-[calc(100vh-140px)]' : 'max-w-7xl max-h-[92vh] rounded-2xl border border-border shadow-panel overflow-hidden'
      }`}
    >
      {/* 1. PAGE HEADER */}
      <div className="no-print p-5 sm:p-6 border-b border-border bg-surface/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-accent-subtle border border-accent/20 text-accent inline-flex items-center justify-center shrink-0 shadow-sm">
            <Scale className="h-6 w-6 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                Section 91 CrPC / Section 94 BNSS Statutory Freeze Requisition
              </h1>
              <div className="px-2.5 py-1 rounded-md bg-surface-raised border border-border text-xs font-mono text-text-secondary font-semibold">
                {refNumber}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Official legal requisition for immediate asset freezing, KYC disclosure, and transaction-log preservation.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors inline-flex items-center justify-center shrink-0 border border-transparent hover:border-border"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 shrink-0" />
          </button>
        )}
      </div>

      {/* 2. TOP ACTION BAR */}
      <div className="no-print px-5 sm:px-6 py-3 border-b border-border bg-surface-raised/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: View Tabs */}
        <div className="inline-flex items-center bg-bg p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveTab('form')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
              activeTab === 'form'
                ? 'bg-surface text-text shadow-sm border border-border font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span>Order Form</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
              activeTab === 'preview'
                ? 'bg-surface text-text shadow-sm border border-border font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Shield className="h-3.5 w-3.5 shrink-0" />
            <span>Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
              activeTab === 'markdown'
                ? 'bg-surface text-text shadow-sm border border-border font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Code className="h-3.5 w-3.5 shrink-0" />
            <span>Plain Text</span>
          </button>
        </div>

        {/* Center: Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs">
          {isFormValid ? (
            <>
              <span className="w-2 h-2 rounded-full bg-verified animate-pulse shrink-0" />
              <span className="text-text font-medium">Ready</span>
              <span className="text-text-muted hidden sm:inline">— Form valid and ready for generation</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
              <span className="text-warning font-medium">Action Required</span>
              <span className="text-text-muted hidden sm:inline">— Complete required fields</span>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="h-4 w-4 text-verified" /> : <Copy className="h-4 w-4" />}
          >
            {copied ? 'Copied' : 'Copy Notice'}
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={handleDownloadMd}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Download MD
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handlePrint}
            leftIcon={<Printer className="h-4 w-4" />}
            className="shadow-sm font-semibold"
          >
            Print Official Notice
          </Button>
        </div>
      </div>

      {/* 3. CASE / OFFICER INFORMATION HEADER PANEL */}
      <div className="no-print p-5 sm:p-6 border-b border-border bg-surface space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
          {/* Officer */}
          <div className="min-w-0">
            <label className="text-xs font-medium text-text-secondary flex items-center gap-1.5 mb-1.5">
              <User className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>Investigating Officer Name *</span>
            </label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              placeholder="e.g. Inspector R. K. Sharma"
              className="w-full h-10 px-3.5 bg-[#0D0F12] border border-border text-text rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          {/* Unit */}
          <div className="min-w-0">
            <label className="text-xs font-medium text-text-secondary flex items-center gap-1.5 mb-1.5">
              <Building2 className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>Police Unit / Cyber Cell *</span>
            </label>
            <input
              type="text"
              value={policeStation}
              onChange={(e) => setPoliceStation(e.target.value)}
              placeholder="e.g. Cyber Crime Police Station, CID"
              className="w-full h-10 px-3.5 bg-[#0D0F12] border border-border text-text rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          {/* NCRP Ref */}
          <div className="min-w-0">
            <label className="text-xs font-medium text-text-secondary flex items-center gap-1.5 mb-1.5">
              <FileText className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>NCRP Ack / Crime Reference Number *</span>
            </label>
            <input
              type="text"
              value={crimeNumber}
              onChange={(e) => setCrimeNumber(e.target.value)}
              placeholder="e.g. NCRP/2026/CYBER-FIN/8842"
              className="w-full h-10 px-3.5 bg-[#0D0F12] border border-border text-text rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono transition-colors"
            />
          </div>
        </div>

        {/* 4. VASP STRIP */}
        <div className="p-3.5 bg-surface-raised rounded-xl border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-text-muted font-medium">Addressed VASP:</span>
            <strong className="text-accent text-sm font-bold truncate">{vaspName}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-text-secondary min-w-0">
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <Mail className="h-3.5 w-3.5 text-warning shrink-0" />
              <span className="text-text font-mono truncate">{complianceEmail}</span>
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5 text-text-muted">
              <Globe className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <span className="truncate">Registered VASP Cluster • {refNumber}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 5. MAIN WORKSPACE CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 bg-bg">
        {activeTab === 'markdown' ? (
          /* Plain Text View */
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center text-xs text-text-secondary">
              <span className="font-semibold uppercase tracking-wider">Markdown Plain Text Representation</span>
              <Button variant="secondary" size="sm" onClick={handleCopy} leftIcon={<Copy className="h-3.5 w-3.5" />}>
                {copied ? 'Copied' : 'Copy All Text'}
              </Button>
            </div>
            <pre className="p-6 bg-surface border border-border rounded-xl font-mono text-xs text-text overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-card">
              {compiledMarkdownNotice}
            </pre>
          </div>
        ) : (
          /* Order Form + Dark Document Preview (2 Columns) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0 max-w-7xl mx-auto">
            {/* LEFT COLUMN: WORKFLOW NAVIGATION & FORM (30-35% on Desktop, or Hidden if pure Preview tab) */}
            {activeTab === 'form' && (
              <div className="no-print lg:col-span-5 space-y-6 min-w-0">
                {/* Workflow Stepper */}
                <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 shadow-panel space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
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
                              ? 'bg-accent-subtle border border-accent/30 text-text'
                              : 'hover:bg-surface-raised text-text-secondary hover:text-text'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              isActive
                                ? 'bg-accent text-white'
                                : isCompleted
                                ? 'bg-verified text-white'
                                : 'bg-surface-raised border border-border text-text-muted'
                            }`}
                          >
                            {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.number}
                          </div>
                          <div className="min-w-0">
                            <div className={`text-xs font-semibold truncate ${isActive ? 'text-text' : 'text-text-secondary'}`}>
                              {step.title}
                            </div>
                            <div className="text-[11px] text-text-muted truncate">{step.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step Form Panel */}
                <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-panel space-y-5">
                  {/* Step 1: Case Information */}
                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-text">1. Case Information</h3>
                        <p className="text-xs text-text-muted mt-0.5">Provide the basic investigation details and target subject.</p>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-text-secondary font-medium block mb-1">Target Suspect Wallet</label>
                          <input
                            type="text"
                            value={targetWallet}
                            onChange={(e) => setTargetWallet(e.target.value)}
                            className="w-full h-10 px-3 bg-[#0D0F12] border border-border text-text rounded-lg font-mono text-xs focus:border-accent focus:ring-1 focus:ring-accent"
                          />
                        </div>

                        <div>
                          <label className="text-text-secondary font-medium block mb-1">Incident / Issuance Date</label>
                          <input
                            type="date"
                            value={incidentDate}
                            onChange={(e) => setIncidentDate(e.target.value)}
                            className="w-full h-10 px-3 bg-[#0D0F12] border border-border text-text rounded-lg text-xs focus:border-accent focus:ring-1 focus:ring-accent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Legal Provisions */}
                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-text">2. Legal Provisions</h3>
                        <p className="text-xs text-text-muted mt-0.5">Configure statutory authority & priority classification.</p>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-text-secondary font-medium block mb-1.5">Applicable Statutory Authority</label>
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              type="button"
                              onClick={() => setStatuteSelection('both')}
                              className={`p-2.5 rounded-lg border text-left transition-all ${
                                statuteSelection === 'both'
                                  ? 'bg-accent-subtle border-accent/40 text-text font-semibold'
                                  : 'bg-surface-raised border-border text-text-secondary'
                              }`}
                            >
                              Section 91 Cr.P.C. (1973) + Section 94 B.N.S.S. (2023)
                            </button>
                            <button
                              type="button"
                              onClick={() => setStatuteSelection('crpc')}
                              className={`p-2.5 rounded-lg border text-left transition-all ${
                                statuteSelection === 'crpc'
                                  ? 'bg-accent-subtle border-accent/40 text-text font-semibold'
                                  : 'bg-surface-raised border-border text-text-secondary'
                              }`}
                            >
                              Section 91 of Code of Criminal Procedure, 1973
                            </button>
                            <button
                              type="button"
                              onClick={() => setStatuteSelection('bnss')}
                              className={`p-2.5 rounded-lg border text-left transition-all ${
                                statuteSelection === 'bnss'
                                  ? 'bg-accent-subtle border-accent/40 text-text font-semibold'
                                  : 'bg-surface-raised border-border text-text-secondary'
                              }`}
                            >
                              Section 94 Bharatiya Nagarik Suraksha Sanhita, 2023
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-text-secondary font-medium block mb-1.5">Priority Classification</label>
                          <select
                            value={urgencyLevel}
                            onChange={(e: any) => setUrgencyLevel(e.target.value)}
                            className="w-full h-10 px-3 bg-[#0D0F12] border border-border text-text rounded-lg text-xs focus:border-accent"
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
                        <h3 className="text-sm font-bold text-text">3. Requisition Directives</h3>
                        <p className="text-xs text-text-muted mt-0.5">Mandatory statutory commands issued to VASP nodal officer.</p>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <label className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-raised border border-border cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeGagOrder}
                            onChange={(e) => setIncludeGagOrder(e.target.checked)}
                            className="mt-0.5 rounded border-border text-accent focus:ring-accent"
                          />
                          <div>
                            <strong className="text-text block">Statutory Gag Order (Non-Disclosure)</strong>
                            <span className="text-text-muted text-[11px]">Strict instruction not to disclose inquiry to suspect</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-raised border border-border cursor-pointer">
                          <input
                            type="checkbox"
                            checked={include65BCertificate}
                            onChange={(e) => setInclude65BCertificate(e.target.checked)}
                            className="mt-0.5 rounded border-border text-accent focus:ring-accent"
                          />
                          <div>
                            <strong className="text-text block">Section 65B Electronic Certificate</strong>
                            <span className="text-text-muted text-[11px]">Demand electronic evidence compliance certificate</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 4: VASP Details */}
                  {activeStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-text">4. Addressed VASP</h3>
                        <p className="text-xs text-text-muted mt-0.5">Destination exchange compliance contacts & legal intercept.</p>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-text-secondary font-medium block mb-1">VASP Name</label>
                          <input
                            type="text"
                            value={vaspName}
                            onChange={(e) => setVaspName(e.target.value)}
                            className="w-full h-10 px-3 bg-[#0D0F12] border border-border text-text rounded-lg text-xs focus:border-accent"
                          />
                        </div>
                        <div>
                          <label className="text-text-secondary font-medium block mb-1">Designated Compliance Email</label>
                          <input
                            type="email"
                            value={complianceEmail}
                            onChange={(e) => setComplianceEmail(e.target.value)}
                            className="w-full h-10 px-3 bg-[#0D0F12] border border-border text-text rounded-lg font-mono text-xs focus:border-accent"
                          />
                        </div>
                        <div>
                          <label className="text-text-secondary font-medium block mb-1">Official LEA Portal</label>
                          <input
                            type="text"
                            value={compliancePortal}
                            onChange={(e) => setCompliancePortal(e.target.value)}
                            className="w-full h-10 px-3 bg-[#0D0F12] border border-border text-text rounded-lg text-xs focus:border-accent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Review & Generate */}
                  {activeStep === 5 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-text">5. Review & Issue</h3>
                        <p className="text-xs text-text-muted mt-0.5">Verify information before printing or exporting.</p>
                      </div>

                      <div className="p-3.5 bg-surface-raised rounded-xl border border-border space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Issuing Officer:</span>
                          <span className="text-text font-medium">{officerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Target VASP:</span>
                          <span className="text-accent font-semibold">{vaspName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Statutory Seal:</span>
                          <span className="text-verified font-semibold">QR Sealed & Cryptographically Verified</span>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        size="md"
                        onClick={handlePrint}
                        leftIcon={<Printer className="h-4 w-4" />}
                        className="w-full font-semibold"
                      >
                        Print Official Notice (Dark PDF)
                      </Button>
                    </div>
                  )}

                  {/* Stepper Controls */}
                  <div className="pt-2 flex items-center justify-between border-t border-border">
                    <button
                      type="button"
                      disabled={activeStep === 1}
                      onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-raised disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center gap-1.5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      disabled={activeStep === 5}
                      onClick={() => setActiveStep((s) => Math.min(5, s + 1))}
                      className="px-3.5 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-elevated border border-border text-xs text-text font-medium disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* RIGHT COLUMN: DARK LEGAL DOCUMENT PREVIEW (70% or 100%) */}
            <div className={`space-y-4 min-w-0 ${activeTab === 'form' ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
              {/* Document Toolbar */}
              <div className="no-print p-3 rounded-xl bg-surface border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Zoom controls */}
                <div className="inline-flex items-center gap-1 bg-surface-raised p-1 rounded-lg border border-border">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.8, Number((z - 0.1).toFixed(1))))}
                    className="p-1 rounded hover:bg-surface text-text-muted hover:text-text transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-2 font-mono text-[11px] text-text font-medium">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(1.25, Number((z + 0.1).toFixed(1))))}
                    className="p-1 rounded hover:bg-surface text-text-muted hover:text-text transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1.0)}
                    className="p-1 rounded hover:bg-surface text-text-muted hover:text-text transition-colors ml-1"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                </div>

                {/* Page indicator & Print Button */}
                <div className="flex items-center gap-3">
                  <span className="text-text-muted text-xs font-mono">Page 1 of 1</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handlePrint}
                    leftIcon={<Printer className="h-3.5 w-3.5" />}
                  >
                    Print Notice
                  </Button>
                </div>
              </div>

              {/* DARK LEGAL DOCUMENT CANVAS */}
              <div
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                className="transition-transform duration-150 ease-out"
              >
                <div className="print-content bg-[#101216] border border-[#30343C] rounded-2xl p-7 sm:p-10 shadow-panel-elevated space-y-6 text-[#E7E9ED] border-t-4 border-t-accent relative overflow-hidden">
                  {/* Watermark subtle seal */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none">
                    <Scale className="w-96 h-96 text-text" />
                  </div>

                  {/* 1. Official Government Header */}
                  <div className="text-center border-b border-[#30343C] pb-5 space-y-1.5 relative z-10">
                    <div className="text-xs uppercase font-serif tracking-widest font-bold text-[#A8AFBA]">
                      STATE POLICE CRIME INVESTIGATION DEPARTMENT
                    </div>
                    <div className="text-base uppercase font-serif font-bold tracking-wider text-[#F5F7FA]">
                      CYBER FINANCIAL CRIMES INVESTIGATION WING
                    </div>
                    <div className="text-xs font-serif text-[#A8AFBA]">
                      {policeStation}
                    </div>
                    <div className="text-xs font-bold pt-1.5 text-accent tracking-wider font-sans uppercase">
                      REQUISITION UNDER SECTION 91 Cr.P.C. / SECTION 94 B.N.S.S.
                    </div>
                  </div>

                  {/* 2. Reference & Priority Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-[#30343C] pb-4 relative z-10 font-sans">
                    <div>
                      <span className="text-[11px] text-[#737B87] uppercase font-semibold block mb-0.5">Ref No</span>
                      <strong className="font-mono text-[#F5F7FA]">{refNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#737B87] uppercase font-semibold block mb-0.5">Crime Ack No</span>
                      <strong className="font-mono text-[#F5F7FA]">{crimeNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#737B87] uppercase font-semibold block mb-0.5">Date of Issuance</span>
                      <strong className="text-[#F5F7FA]">{new Date().toLocaleDateString('en-GB')}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#737B87] uppercase font-semibold block mb-0.5">Priority</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-danger-subtle text-danger border border-danger-border">
                        {urgencyLevel}
                      </span>
                    </div>
                  </div>

                  {/* 3. To Addressee */}
                  <div className="space-y-1 text-xs relative z-10 font-sans">
                    <div className="font-bold text-[#A8AFBA] uppercase tracking-wider text-[11px]">TO:</div>
                    <div className="font-bold text-[#F5F7FA] text-sm">{vaspName} (Compliance & Legal Intercept)</div>
                    <div className="text-[#A8AFBA]">
                      Designated Email: <span className="font-mono text-[#F5F7FA]">{complianceEmail}</span>
                    </div>
                    <div className="text-[#A8AFBA]">
                      Service Provider Jurisdiction: <span className="text-[#F5F7FA]">Registered VASP Cluster • International</span>
                    </div>
                  </div>

                  {/* 4. Legal Subject Box */}
                  <div className="p-4 bg-[#15181D] rounded-xl border border-[#30343C] border-l-4 border-l-accent text-xs sm:text-sm font-semibold leading-relaxed text-[#F5F7FA] relative z-10">
                    SUBJECT: STATUTORY REQUISITION FOR IMMEDIATE ASSET FREEZE, SUSPENSION OF WITHDRAWALS,
                    KYC DISCLOSURE, AND TRANSACTION LOG PRESERVATION UNDER SECTION 91 OF CODE OF CRIMINAL
                    PROCEDURE, 1973 (READ WITH SECTION 94 BNSS 2023).
                  </div>

                  {/* 5. Statutory Body Paragraphs */}
                  <div className="space-y-3.5 font-serif text-sm leading-relaxed text-[#E7E9ED] text-justify relative z-10">
                    <p>
                      Sir/Madam,
                    </p>
                    <p>
                      1. Whereas an active cyber financial investigation has been registered at {policeStation} under
                      Crime Reference Number <strong className="font-sans font-semibold text-[#F5F7FA]">{crimeNumber}</strong>.
                      Observable blockchain intelligence, heuristic counterparty graph analysis, and directed fund flow tracing
                      confirm that illicit proceeds of fraud traversed through the targeted address below and were directly deposited
                      into custodial infrastructure maintained by your Virtual Asset Service Provider.
                    </p>
                    <p>
                      2. You are hereby commanded under the statutory authority of{' '}
                      <strong className="font-sans font-semibold text-[#F5F7FA]">Section 91 Cr.P.C.</strong> (read with{' '}
                      <strong className="font-sans font-semibold text-[#F5F7FA]">Section 94 of Bharatiya Nagarik Suraksha Sanhita, 2023</strong>)
                      to immediately place a temporary freeze on all cryptocurrency balances, withdrawal requests, and fiat transfers
                      associated with the destination recipient account, and provide full verified subscriber KYC records within twenty-four (24) hours.
                    </p>
                  </div>

                  {/* 6. Targeted Wallet & Proofs Table */}
                  <div className="space-y-2.5 relative z-10 font-sans text-xs">
                    <div className="font-bold uppercase text-[11px] tracking-wider text-[#A8AFBA]">
                      Subject Cryptocurrency Addresses Identified on Public Blockchain:
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-[#30343C]">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#15181D] border-b border-[#30343C] text-[#A8AFBA]">
                            <th className="p-3 text-left font-semibold">Target Wallet Address</th>
                            <th className="p-3 text-left font-semibold">Associated VASP</th>
                            <th className="p-3 text-center font-semibold">Proximity</th>
                            <th className="p-3 text-right font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#272A31]">
                          <tr className="bg-[#101216]">
                            <td className="p-3 font-mono font-semibold text-[#F5F7FA] break-all select-all">
                              {targetWallet}
                            </td>
                            <td className="p-3 font-semibold text-accent">{vaspName}</td>
                            <td className="p-3 text-center font-mono text-[#A8AFBA]">1–3 Hops</td>
                            <td className="p-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-verified-subtle text-verified border border-verified-border">
                                VERIFIED SIGNAL
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 7. Mandatory Directives List */}
                  <div className="space-y-2 font-serif text-xs sm:text-sm text-[#E7E9ED] relative z-10 leading-relaxed">
                    <div className="font-sans font-bold text-xs uppercase tracking-wider text-[#A8AFBA] mb-1">
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
                    <div className="p-3.5 bg-[#15181D] rounded-xl border border-[#30343C] text-xs text-[#A8AFBA] relative z-10 space-y-1">
                      <strong className="text-danger uppercase tracking-wider text-[11px] block font-sans">
                        Statutory Non-Disclosure Directive (Gag Order):
                      </strong>
                      <p className="font-serif leading-relaxed">
                        In the strict interest of ongoing criminal proceedings, you are commanded NOT to disclose or communicate
                        the existence of this requisition or corresponding asset freeze to the account holder under pain of statutory penalty.
                      </p>
                    </div>
                  )}

                  {/* 9. Official Statutory Digital Seal & QR Code Block */}
                  <div className="pt-6 border-t border-[#30343C] flex flex-wrap items-end justify-between gap-4 text-xs relative z-10 font-sans">
                    <div className="space-y-1.5 max-w-md">
                      <div className="font-bold text-xs uppercase tracking-wider text-[#F5F7FA] flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-verified" />
                        <span>Official Statutory Digital Seal</span>
                      </div>
                      <p className="text-[#737B87] text-xs">
                        Scan QR code on official government terminal to verify cryptographic issuance authenticity and Section 65B hash.
                      </p>
                      <div className="pt-3 space-y-0.5 font-serif text-xs">
                        <div className="font-bold text-[#F5F7FA]">({officerName})</div>
                        <div className="text-[#A8AFBA]">{policeStation}</div>
                        <div className="text-[11px] text-[#737B87] font-sans">Official LEA Email: cybercell@police.gov.in</div>
                      </div>
                    </div>

                    {qrDataUrl && (
                      <div className="p-2 bg-white rounded-xl border border-[#30343C] shadow-md shrink-0">
                        <img src={qrDataUrl} alt="Verification Seal QR" className="w-24 h-24 sm:w-28 sm:h-28" />
                      </div>
                    )}
                  </div>

                  {/* 10. Document Footer */}
                  <div className="pt-4 border-t border-[#30343C] flex items-center justify-between text-[11px] text-[#737B87] font-sans">
                    <span>Cyber Financial Crimes Investigation Wing • State Police CID</span>
                    <span className="font-bold tracking-wider text-danger/80">CONFIDENTIAL • OFFICIAL USE ONLY</span>
                    <span>Page 1 of 1</span>
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
