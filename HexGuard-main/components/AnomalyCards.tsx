'use client';

import React from 'react';
import { AnomalyItem } from '@/lib/types';
import { 
  AlertOctagon, 
  Crosshair, 
  CheckCircle,
  Tag,
  Lightbulb
} from 'lucide-react';

interface AnomalyCardsProps {
  anomalies: AnomalyItem[];
  selectedAnomalyId?: string | null;
  onSelectAnomaly?: (id: string | null) => void;
}

export const AnomalyCards: React.FC<AnomalyCardsProps> = ({
  anomalies,
  selectedAnomalyId,
  onSelectAnomaly,
}) => {
  const getSeverityBadge = (sev: AnomalyItem['severity']) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            MEDIUM
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 glass-panel border border-slate-800/80 rounded-3xl p-6 shadow-2xl">
      
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Flagged Forensic Anomalies ({anomalies.length})
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Pinpointed visual &amp; temporal inconsistencies with plain-English summaries and forensic evidence
            </p>
          </div>
        </div>
      </div>

      {anomalies.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-950/60 border border-white/[0.06] text-center space-y-2">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">No Critical Visual Anomalies Flagged</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto font-mono">
            Biological symmetry, corneal specular reflections, and lighting coherence all passed verification checks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {anomalies.map((ano) => {
            const isSelected = selectedAnomalyId === ano.id;

            return (
              <div
                key={ano.id}
                onClick={() => onSelectAnomaly?.(isSelected ? null : ano.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 space-y-2.5 relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900 border-blue-400/80 shadow-lg shadow-blue-950/40 scale-[1.01]'
                    : 'bg-slate-950/60 border-white/[0.06] hover:border-white/15 hover:bg-slate-950/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {ano.category}
                    </span>
                    {ano.timestampSeconds !== undefined && (
                      <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">
                        ⏱️ {Math.floor(ano.timestampSeconds / 60).toString().padStart(2, '0')}:{(ano.timestampSeconds % 60).toFixed(1)}s
                      </span>
                    )}
                  </div>
                  {getSeverityBadge(ano.severity)}
                </div>

                {/* Plain English Title */}
                <h4 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>{ano.title}</span>
                  {ano.box && (
                    <span className="text-[10px] font-mono text-blue-400 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      <Crosshair className="w-3 h-3" />
                      Pinpoint
                    </span>
                  )}
                </h4>

                {/* Technical Forensic Subtext */}
                <div className="pt-0.5">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5 font-semibold">
                    Technical Evidence:
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    {ano.technicalDetails}
                  </p>
                </div>

                {/* Subtle Practical Tip / Rule of Thumb */}
                {ano.ruleOfThumb && (
                  <div className="pt-1.5 border-t border-white/[0.06] flex items-start gap-1.5 text-[11px] font-mono text-amber-400/90">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span>{ano.ruleOfThumb}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
