'use client';

import React from 'react';
import { OcrContext } from '@/lib/types';
import { 
  FileText, 
  AlertTriangle, 
  History, 
  CheckCircle2, 
  Search,
  Calendar,
  MapPin,
  ArrowRight
} from 'lucide-react';

interface ContextFactCheckCardProps {
  ocrContext: OcrContext;
}

export const ContextFactCheckCard: React.FC<ContextFactCheckCardProps> = ({ ocrContext }) => {
  if (!ocrContext || !ocrContext.hasExtractedText) {
    return null;
  }

  return (
    <div className={`p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-4 backdrop-blur-xl ${
      ocrContext.isMisattributed
        ? 'bg-amber-950/20 border-amber-500/30 shadow-amber-950/20'
        : 'bg-slate-900/50 border-white/[0.08]'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${
            ocrContext.isMisattributed
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-white/[0.03] text-blue-400 border-white/[0.08]'
          }`}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Social Post Text &amp; Context Fact-Check</span>
              {ocrContext.isMisattributed && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  OUT OF CONTEXT
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Auto-extracted caption (OCR) cross-referenced against historical news origins
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-500 hidden sm:block">
          AI OCR &amp; TEMPORAL AUDIT
        </span>
      </div>

      {/* Extracted Text Box */}
      <div className="space-y-1.5">
        <span className="text-[11px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-blue-400" />
          Extracted Caption / Social Text (OCR):
        </span>
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/[0.06] text-xs font-mono text-slate-200 leading-relaxed italic">
          "{ocrContext.extractedText}"
        </div>
      </div>

      {/* Claimed vs True Origin Comparison Grid */}
      {ocrContext.isMisattributed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          
          {/* Claimed Event Card */}
          <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 font-mono">
              <AlertTriangle className="w-4 h-4" />
              <span>CLAIMED IN VIRAL POST (FALSE):</span>
            </div>
            <p className="text-xs font-mono text-slate-300 leading-relaxed">
              {ocrContext.claimedEvent || 'Claims this is a live / current breaking news event happening right now.'}
            </p>
          </div>

          {/* True Origin Card */}
          <div className="p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>ACTUAL HISTORICAL ORIGIN (VERIFIED):</span>
            </div>
            <p className="text-xs font-mono text-slate-300 leading-relaxed">
              {ocrContext.trueOrigin || 'Authentic photograph captured during an earlier historical event.'}
            </p>
          </div>

        </div>
      )}

      {/* Summary Rationale */}
      {ocrContext.factCheckSummary && (
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono text-slate-300 leading-relaxed flex items-start gap-2.5">
          <History className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white mr-1.5">Verification Analysis:</span>
            <span>{ocrContext.factCheckSummary}</span>
          </div>
        </div>
      )}

    </div>
  );
};
