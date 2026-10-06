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
import { Clock, FileCheck2 } from 'lucide-react';

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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fadeIn pb-16">
      
      {/* Report Header Metadata Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800/80 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                {report.fileName}
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                AUDIT_ID: {report.id.slice(0, 10)}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>{report.dimensions.width}×{report.dimensions.height} px</span>
              <span>•</span>
              <span>{report.fileSize}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {formattedDate}
              </span>
            </p>
          </div>
        </div>

        {/* Executive Summary Pill */}
        <div className="text-left md:text-right max-w-md">
          <p className="text-xs text-slate-300 italic leading-relaxed">
            "{report.summary}"
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
