'use client';

import React, { useState } from 'react';
import { ForensicReport } from '@/lib/types';
import { AuthenticityMeter } from './AuthenticityMeter';
import { ContextFactCheckCard } from './ContextFactCheckCard';
import { ForensicInspector } from './ForensicInspector';
import { EvidenceBreakdown } from './EvidenceBreakdown';
import { AnomalyCards } from './AnomalyCards';
import { ExifPanel } from './ExifPanel';
import { ExportReport } from './ExportReport';
import { Clock, FileCheck2, Fingerprint, Globe, Film, Activity } from 'lucide-react';

interface ReportViewProps {
  report: ForensicReport;
  onReset: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, onReset }) => {
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);

  const formattedDate = new Date(report.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formatTimestamp = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fadeIn pb-16">
      
      {/* Report Header Metadata Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800/80 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                {report.fileName}
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                AUDIT_ID: {report.id.slice(0, 10)}
              </span>
              {report.sourcePlatform && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  {report.sourcePlatform}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-2 mt-1">
              <span>{report.dimensions.width}×{report.dimensions.height} px</span>
              <span>•</span>
              <span>{report.fileSize}</span>
              {report.mediaType === 'video' && report.videoMetadata && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Film className="w-3 h-3 text-cyan-400" />
                    {formatTimestamp(report.videoMetadata.duration)}
                  </span>
                </>
              )}
              {report.framesAnalyzed && (
                <>
                  <span>•</span>
                  <span>{report.framesAnalyzed} Frames Sampled</span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {formattedDate}
              </span>
            </p>

            {/* SHA-256 Fingerprint */}
            {report.sha256 && (
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-mono text-slate-400">
                <Fingerprint className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="text-slate-500">SHA-256:</span>
                <span className="text-cyan-300/80 truncate max-w-xs sm:max-w-md font-mono select-all">
                  {report.sha256}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Executive Summary Pill */}
        <div className="text-left md:text-right max-w-md">
          <p className="text-xs text-slate-300 italic leading-relaxed">
            &quot;{report.summary}&quot;
          </p>
        </div>
      </div>

      {/* 1. Dual-Layer Authenticity Score & Verdict Gauge with Tone Selector */}
      <AuthenticityMeter
        score={report.authenticityScore}
        verdict={report.verdict}
        humanVerdict={report.humanVerdict}
        verdictLabel={report.verdictLabel}
        verdictDescription={report.verdictDescription}
        confidenceScore={report.confidenceScore}
        forwardRisk={report.forwardRisk}
        forwardRiskLabel={report.forwardRiskLabel}
        familyMessage={report.familyMessage}
        messageTones={report.messageTones}
      />

      {/* 1.2 Video Temporal Consistency Forensics Card */}
      {report.temporalConsistencyReport && (
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 bg-slate-900/60 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Video Temporal Consistency Forensics
              </h4>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                report.temporalConsistencyReport.isConsistent
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
              }`}
            >
              {report.temporalConsistencyReport.isConsistent ? 'Temporal Continuity Verified' : 'Temporal Inconsistencies Detected'}
            </span>
          </div>

          {/* Temporal Metrics Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <span className="text-[11px] text-slate-400 block">Lighting Stability</span>
              <span className="text-base font-bold text-cyan-300">
                {report.temporalConsistencyReport.metrics.lightingStability}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <span className="text-[11px] text-slate-400 block">Boundary Jitter</span>
              <span className="text-base font-bold text-cyan-300">
                {report.temporalConsistencyReport.metrics.boundaryStability}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <span className="text-[11px] text-slate-400 block">Compression Flow</span>
              <span className="text-base font-bold text-cyan-300">
                {report.temporalConsistencyReport.metrics.compressionContinuity}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
              <span className="text-[11px] text-slate-400 block">Motion Vectors</span>
              <span className="text-base font-bold text-cyan-300">
                {report.temporalConsistencyReport.metrics.motionSmoothness}%
              </span>
            </div>
          </div>

          {/* Findings List */}
          <div className="space-y-1.5 pt-1 text-xs font-mono text-slate-300">
            {report.temporalConsistencyReport.findings.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Suspicious Timestamps */}
          {report.suspiciousTimestamps && report.suspiciousTimestamps.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-400 block mb-1.5">
                Suspicious Timestamps Flagged for Investigation:
              </span>
              <div className="flex flex-wrap gap-2">
                {report.suspiciousTimestamps.map((st, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-1.5"
                  >
                    <Clock className="w-3 h-3 text-rose-400" />
                    <span>{formatTimestamp(st.timestamp)}</span>
                    <span className="text-[10px] text-slate-400">({st.label})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1.5 Temporal Integrity Contradiction Alert (Lumen Signal #5) */}
      {report.temporalIntegrity && report.temporalIntegrity.isRecycledFootage && (
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-amber-500/40 bg-amber-950/20 text-amber-200 shadow-xl flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                Temporal Contradiction Detected
              </span>
              {report.temporalIntegrity.earliestFoundYear && (
                <span className="text-xs font-mono text-slate-400">
                  Earliest Seen: {report.temporalIntegrity.earliestFoundYear}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white">
              {report.temporalIntegrity.originalContext || 'Recycled Historical Footage Circulated as Breaking News'}
            </h4>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {report.temporalIntegrity.explanation}
            </p>
          </div>
        </div>
      )}

      {/* 1.6 OCR & Context Fact-Check Card (Displayed if social text/claim detected) */}
      {report.ocrContext && report.ocrContext.hasExtractedText && (
        <ContextFactCheckCard ocrContext={report.ocrContext} />
      )}

      {/* 2. Interactive Forensic Inspector (Split ELA & Anomaly Overlays or Video Timeline) */}
      <ForensicInspector
        originalUrl={report.imageUrl}
        videoUrl={report.videoUrl}
        mediaType={report.mediaType}
        videoMetadata={report.videoMetadata}
        elaUrl={report.elaImageUrl}
        anomalies={report.anomalies}
        selectedAnomalyId={selectedAnomalyId}
        onSelectAnomaly={setSelectedAnomalyId}
      />

      {/* 3. 5-Dimension Vector Breakdown */}
      <EvidenceBreakdown breakdown={report.dimensionsBreakdown} />

      {/* 4. Flagged Anomalies with Dual-Layer Details */}
      <AnomalyCards
        anomalies={report.anomalies}
        selectedAnomalyId={selectedAnomalyId}
        onSelectAnomaly={setSelectedAnomalyId}
      />

      {/* 5. Hardware EXIF & Camera Provenance Panel */}
      <ExifPanel exifData={report.exifData} />

      {/* 6. Export & Certificate Section */}
      <ExportReport report={report} onReset={onReset} />

    </div>
  );
};
