'use client';

import React from 'react';
import { SAMPLE_PRESETS } from '@/lib/samples';
import { SamplePreset } from '@/lib/types';
import { Sparkles, ShieldCheck, AlertTriangle, Image as ImageIcon, Zap, History, Film } from 'lucide-react';

interface SampleGalleryProps {
  onSelectSample: (sample: SamplePreset) => void;
  isLoading: boolean;
}

export const SampleGallery: React.FC<SampleGalleryProps> = ({
  onSelectSample,
  isLoading,
}) => {
  const getCategoryBadge = (category: SamplePreset['category']) => {
    switch (category) {
      case 'AI Generated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm">
            <AlertTriangle className="w-2.5 h-2.5" />
            AI Generated
          </span>
        );
      case 'Out of Context':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm">
            <History className="w-2.5 h-2.5" />
            Out of Context
          </span>
        );
      case 'Authentic Photo':
      case 'Authentic DSLR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
            <ShieldCheck className="w-2.5 h-2.5" />
            Authentic Photo
          </span>
        );
      case 'Manipulated / Spliced':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
            <AlertTriangle className="w-2.5 h-2.5" />
            Spliced Composite
          </span>
        );
      case 'Synthetic Art':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm">
            <Sparkles className="w-2.5 h-2.5" />
            Generative Art
          </span>
        );
      case 'AI Deepfake Video':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm">
            <Film className="w-2.5 h-2.5" />
            AI Deepfake Video
          </span>
        );
      case 'Recycled Video':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
            <History className="w-2.5 h-2.5" />
            Recycled Video
          </span>
        );
      case 'Authentic Video':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
            <Film className="w-2.5 h-2.5" />
            Authentic Video
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <h3 className="text-xs uppercase tracking-wider font-mono font-medium text-slate-400">
            1-Click Benchmark Test Cases
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Click any preset to test instantly
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {SAMPLE_PRESETS.map((sample) => (
          <button
            key={sample.id}
            disabled={isLoading}
            onClick={() => onSelectSample(sample)}
            className="group text-left p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 border border-white/[0.07] hover:border-white/20 transition-all duration-300 flex flex-col justify-between overflow-hidden relative shadow-xl shadow-black/40 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 backdrop-blur-md"
          >
            <div className="relative w-full h-28 rounded-xl overflow-hidden mb-3 bg-slate-950/80 border border-white/[0.05]">
              <img
                src={sample.thumbnailUrl}
                alt={sample.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2">
                {getCategoryBadge(sample.category)}
              </div>
            </div>

            <div className="relative z-10 space-y-1">
              <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                {sample.title}
              </h4>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400 group-hover:text-blue-300 transition-colors">
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" />
                Analyze
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
