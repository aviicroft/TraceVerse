'use client';

import React, { useState, useEffect } from 'react';
import { Scale, Copy, Check, Printer, X, Mail, ShieldCheck, QrCode, FileText, Code } from 'lucide-react';
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
      setNoticeData(data);

      const verificationPayload = JSON.stringify({
        statutory_authority: 'Section 91 CrPC / Section 94 BNSS',
        ref_no: data.ref_number || `TRACEVERSE/LEA/2026/${analysisId.slice(0, 8)}`,
        target_vasp: data.vasp_name,
        compliance_email: data.compliance_email,
        crime_ack: crimeNumber,
        investigating_officer: officerName,
        police_unit: policeStation,
        verified_tx_count: data.critical_txs?.length || 1,
        timestamp: new Date().toISOString(),
      });

      const qrUrl = await QRCode.toDataURL(verificationPayload, {
        width: 140,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setQrDataUrl(qrUrl);
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
    <div
      className={`print-document-container bg-surface border border-border rounded-xl w-full flex flex-col font-sans text-xs overflow-hidden transition-colors ${
        isFullPageView ? 'shadow-vercel' : 'max-w-5xl max-h-[94vh] shadow-vercel-lg'
      }`}
    >
      {/* On-Screen Header (Hidden during Print) */}
      <div className="no-print p-4 sm:p-5 border-b border-border flex flex-wrap items-center justify-between bg-surface-raised/50 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-danger/10 border border-danger/20 text-danger inline-flex items-center justify-center shrink-0">
            <Scale className="h-5 w-5 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text tracking-wide uppercase font-mono">
                Section 91 CrPC / Section 94 BNSS Statutory Freeze Requisition
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-danger-subtle text-danger border border-danger-border font-semibold">
                {noticeData?.ref_number || 'STATUTORY ORDER'}
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5 font-sans">
              Official legal requisition for immediate asset freezing, KYC disclosure, and Section 65B preservation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Tab Switchers */}
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
              <span>Order Form</span>
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
              <span>Plain Text</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-hover border border-border text-text font-medium text-[11px] transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-verified shrink-0" /> : <Copy className="h-3.5 w-3.5 text-text-dim shrink-0" />}
            <span>{copied ? 'Copied' : 'Copy Notice'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger hover:bg-danger-hover text-white font-medium text-[11px] shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 shrink-0" />
            <span>Print Official Notice</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-text-dim hover:text-text hover:bg-surface-hover transition-colors inline-flex items-center justify-center shrink-0"
              aria-label="Close modal"
            >
              <X className="h-4 w-4 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Input Parameters Bar (Hidden during Print) */}
      <div className="no-print p-3.5 bg-surface-raised/60 border-b border-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div>
          <label className="text-[10px] uppercase text-text-dim font-medium block mb-1">
            Investigating Officer Name
          </label>
          <input
            type="text"
            value={officerName}
            onChange={(e) => setOfficerName(e.target.value)}
            onBlur={fetchNotice}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-text font-mono text-[11px] focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase text-text-dim font-medium block mb-1">
            Police Unit / Cyber Cell
          </label>
          <input
            type="text"
            value={policeStation}
            onChange={(e) => setPoliceStation(e.target.value)}
            onBlur={fetchNotice}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-text font-mono text-[11px] focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase text-text-dim font-medium block mb-1">
            NCRP Ack / Crime Reference Number
          </label>
          <input
            type="text"
            value={crimeNumber}
            onChange={(e) => setCrimeNumber(e.target.value)}
            onBlur={fetchNotice}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-text font-mono text-[11px] focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Target VASP Direct Contact Bar (Hidden during Print) */}
      {noticeData && (
        <div className="no-print px-4 py-2.5 bg-bg border-b border-border flex flex-wrap items-center justify-between text-[11px] gap-2 font-mono">
          <div className="inline-flex items-center gap-2">
            <span className="text-text-dim uppercase text-[10px]">Addressed VASP:</span>
            <strong className="text-accent font-bold">{noticeData.vasp_name}</strong>
          </div>
          <div className="inline-flex items-center gap-3 text-text-dim">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-warning shrink-0" />
              <span className="text-text">{noticeData.compliance_email}</span>
            </span>
            <span>•</span>
            <span>{noticeData.ref_number}</span>
          </div>
        </div>
      )}

      {/* Official Requisition Content */}
      <div
        className={`overflow-y-auto bg-bg p-6 print:bg-white print:text-black ${
          isFullPageView ? 'flex-1' : 'max-h-[70vh]'
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-dim font-mono">
            <div className="w-8 h-8 border-2 border-danger border-t-transparent rounded-full animate-spin mb-3" />
            <span>Compiling statutory freeze order & legal certificate...</span>
          </div>
        ) : activeTab === 'visual' && noticeData ? (
          <div className="print-content max-w-3xl mx-auto p-8 bg-surface print:bg-white print:border-none border border-border rounded-xl shadow-vercel space-y-6 text-text print:text-black">
            {/* Judicial Letterhead */}
            <div className="text-center border-b-2 border-border print:border-black pb-5 space-y-1">
              <div className="text-xs uppercase font-serif tracking-widest font-bold">
                STATE POLICE CRIME INVESTIGATION DEPARTMENT
              </div>
              <div className="text-sm uppercase font-serif font-bold tracking-wider">
                CYBER FINANCIAL CRIMES INVESTIGATION WING
              </div>
              <div className="text-xs font-serif text-text-muted print:text-black/70">
                {policeStation}
              </div>
              <div className="text-xs font-mono font-bold pt-2 text-danger">
                REQUISITION UNDER SECTION 91 Cr.P.C. / SECTION 94 B.N.S.S.
              </div>
            </div>

            {/* Reference Header */}
            <div className="flex justify-between items-start font-mono text-xs border-b border-border pb-3">
              <div>
                <div>Ref No: <strong>{noticeData.ref_number}</strong></div>
                <div>Crime Ack No: <strong>{crimeNumber}</strong></div>
              </div>
              <div className="text-right">
                <div>Date: {new Date().toLocaleDateString('en-GB')}</div>
                <div>Priority: <span className="text-danger font-bold">EMERGENCY PRESERVATION</span></div>
              </div>
            </div>

            {/* To Addressee */}
            <div className="space-y-1 font-sans text-xs">
              <div className="font-bold">TO:</div>
              <div className="font-semibold text-accent">{noticeData.vasp_name} (Compliance & Legal Intercept)</div>
              <div>Designated Email: {noticeData.compliance_email}</div>
              <div>Service Provider Jurisdiction: Registered VASP Cluster</div>
            </div>

            {/* Subject */}
            <div className="p-3 bg-surface-raised rounded-lg border border-border text-xs font-semibold leading-relaxed">
              SUBJECT: STATUTORY REQUISITION FOR IMMEDIATE ASSET FREEZE, SUSPENSION OF WITHDRAWALS,
              KYC DISCLOSURE, AND TRANSACTION LOG PRESERVATION UNDER SECTION 91 OF CODE OF CRIMINAL
              PROCEDURE, 1973 (READ WITH SECTION 94 BNSS 2023).
            </div>

            {/* Statutory Body */}
            <div className="space-y-3 font-serif text-xs leading-relaxed text-justify">
              <p>
                Whereas an active cyber financial investigation has been registered at {policeStation} under Crime Reference Number {crimeNumber}.
                On-chain intelligence and multi-hop forensic tracing reveal that proceeds of crime have transited to custodial addresses
                associated with your Virtual Asset Service Provider.
              </p>
              <p>
                You are hereby commanded under authority of Section 91 Cr.P.C. to immediately place a temporary freeze on all withdrawals, transfers,
                and conversions relating to the identified custodial counterparty accounts, and provide full subscriber KYC details within 24 hours.
              </p>
            </div>

            {/* Targeted Wallet Table */}
            <div className="font-mono text-xs space-y-2">
              <div className="font-bold uppercase text-[10px] text-text-dim">
                Subject Cryptocurrency Addresses Identified on Public Blockchain:
              </div>
              <table className="w-full border-collapse border border-border text-[11px]">
                <thead>
                  <tr className="bg-surface-raised border-b border-border">
                    <th className="p-2 text-left">Target Wallet Address</th>
                    <th className="p-2 text-left">Associated VASP Cluster</th>
                    <th className="p-2 text-center">Hop Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-2 font-bold break-all">{noticeData.target_wallet}</td>
                    <td className="p-2 text-accent font-semibold">{noticeData.vasp_name}</td>
                    <td className="p-2 text-center">1–3 Hops</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* QR Verification Block */}
            <div className="pt-4 border-t border-border flex items-center justify-between font-mono text-[11px]">
              <div className="space-y-1">
                <div className="font-bold text-xs uppercase">Official Statutory Digital Seal</div>
                <div className="text-[10px] text-text-dim">
                  Scan QR code on official government terminal to verify cryptographic issuance authenticity.
                </div>
                <div className="text-[10px] text-text-muted">
                  Issuing Officer: {officerName}
                </div>
              </div>

              {qrDataUrl && (
                <div className="p-2 bg-white rounded border border-border shadow-sm">
                  <img src={qrDataUrl} alt="Verification QR" className="w-24 h-24" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <pre className="p-5 bg-surface border border-border rounded-xl font-mono text-xs text-text overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-vercel">
              {noticeData?.notice_markdown || 'No notice generated.'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );

  if (isFullPageView) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      {content}
    </div>
  );
};
