'use client';

import React from 'react';
import { ForensicReport, DimensionStatus } from '@/lib/types';
import { 
  Dna, 
  SunMedium, 
  Cpu, 
  Layers, 
  Fingerprint, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  TrendingUp
} from 'lucide-react';

interface EvidenceBreakdownProps {
  breakdown: ForensicReport['dimensionsBreakdown'];
}

export const EvidenceBreakdown: React.FC<EvidenceBreakdownProps> = ({ breakdown }) => {
  const getDimensionIcon = (key: string) => {
    switch (key) {
      case 'biological':
        return Dna;
      case 'optics':
        return SunMedium;
      case 'artifacts':
        return Cpu;
      case 'semantics':
        return Layers;
      case 'metadata':
        return Fingerprint;
      default:
        return TrendingUp;
    }
  };

  const getStatusBadge = (status: DimensionStatus, score: number) => {
    switch (status) {
      case 'pass':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            PASS ({score}/100)
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" />
            ANOMALIES ({score}/100)
          </span>
        );
      case 'fail':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            SYNTHETIC ({score}/100)
          </span>
        );
    }
  };

  const dimensionsList = [
    { key: 'biological', data: breakdown.biological },
    { key: 'optics', data: breakdown.optics },
    { key: 'artifacts', data: breakdown.artifacts },
    { key: 'semantics', data: breakdown.semantics },
    { key: 'metadata', data: breakdown.metadata },
  ];

  return (
    <div className="space-y-4 bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
      
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-sm font-bold text-white">5-Dimension Forensic Vector Breakdown</h3>
          <p className="text-[11px] font-mono text-slate-400">
            Biological integrity, optical physics, latent artifacts, and provenance audit
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 hidden sm:block">
          MULTI-MODAL EVALUATION
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dimensionsList.map(({ key, data }) => {
          if (!data) return null;
          const Icon = getDimensionIcon(key);

          const progressColor =
            data.status === 'pass'
              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
              : data.status === 'warning'
              ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
              : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';

          return (
            <div
              key={key}
              className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06] hover:border-white/15 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/[0.03] text-blue-400 border border-white/[0.08]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {data.title}
                    </h4>
                  </div>
                  {getStatusBadge(data.status, data.score)}
                </div>

                {/* Score Track */}
                <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${progressColor} transition-all duration-700 rounded-full`}
                    style={{ width: `${Math.max(5, data.score)}%` }}
                  />
                </div>
              </div>

              {/* Findings List */}
              <ul className="space-y-1.5 text-[11px] text-slate-300 font-mono">
                {data.findings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span className="text-slate-300">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

    </div>
  );
};
