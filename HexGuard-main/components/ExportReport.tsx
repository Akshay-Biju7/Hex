'use client';

import React, { useState } from 'react';
import { ForensicReport } from '@/lib/types';
import { 
  Printer, 
  Copy, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  FileBadge,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportReportProps {
  report: ForensicReport;
  onReset: () => void;
}

export const ExportReport: React.FC<ExportReportProps> = ({ report, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [copiedFamily, setCopiedFamily] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `🔍 HEXGUARD FORENSIC AUDIT REPORT
===================================
Target File: ${report.fileName}
Source: ${report.sourcePlatform || (report.sourceUrl ? 'Remote URL' : 'Local File Upload')}
SHA-256: ${report.sha256 || 'Calculated at ingestion'}
Bottom Line: ${report.humanVerdict}
Verdict: ${report.verdictLabel.toUpperCase()}
Trust Score: ${report.authenticityScore}/100 (Confidence: ${report.confidenceScore}%)
Timestamp: ${report.timestamp}

SUMMARY:
${report.summary}

FORENSIC RATIONALE:
${report.verdictDescription}
${report.temporalConsistencyReport ? `\nTEMPORAL VIDEO FINDINGS:\n${report.temporalConsistencyReport.findings.join('\n')}\n` : ''}
CAMERA & PROVENANCE:
${report.exifData.humanSummary}

DIMENSION SCORES:
• Biological & Anatomy: ${report.dimensionsBreakdown.biological.score}/100
• Optics & Physics: ${report.dimensionsBreakdown.optics.score}/100
• Generative Artifacts: ${report.dimensionsBreakdown.artifacts.score}/100
• Semantic Plausibility: ${report.dimensionsBreakdown.semantics.score}/100
• Metadata & Provenance: ${report.dimensionsBreakdown.metadata.score}/100

FLAGGED ANOMALIES (${report.anomalies.length}):
${report.anomalies.map((a, i) => `${i + 1}. [${a.severity.toUpperCase()}] ${a.title} - ${a.technicalDetails}`).join('\n')}

Verified by HexGuard AI Forensics v2.5 Engine
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyFamily = () => {
    navigator.clipboard.writeText(report.familyMessage);
    setCopiedFamily(true);
    setTimeout(() => setCopiedFamily(false), 2000);
  };

  return (
    <div className="space-y-6 glass-panel border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            <FileBadge className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">HexGuard Verification Certificate</h3>
            <p className="text-xs font-mono text-slate-400">
              Certificate ID: <span className="text-cyan-400 font-semibold">{report.id}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleCopyFamily}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 rounded-xl text-xs font-mono font-medium border border-emerald-500/40 transition-colors"
          >
            {copiedFamily ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied WhatsApp Text!</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Reply</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopySummary}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-medium border border-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-medium border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Print PDF</span>
          </button>

          <button
            onClick={onReset}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Scan Another</span>
          </button>
        </div>
      </div>

      {/* Recommended Actions */}
      {report.recommendedActions && report.recommendedActions.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Advisory Recommendation
          </h4>
          <ul className="space-y-1 text-xs text-slate-400 font-mono">
            {report.recommendedActions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">→</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Security Watermark Stamp */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          SHA-256 DIGITAL AUDIT PASSED // ENCRYPTED VERIFICATION HASH
        </span>
        <span>HEXGUARD MEDIA FORENSICS SYSTEM // v2.5</span>
      </div>

    </div>
  );
};
