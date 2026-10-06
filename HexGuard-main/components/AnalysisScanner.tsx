'use client';

import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  CheckCircle2, 
  Loader2, 
  Cpu, 
  Layers, 
  Activity, 
  Sparkles, 
  Fingerprint
} from 'lucide-react';

interface AnalysisScannerProps {
  imagePreviewUrl: string;
  fileName: string;
}

const SCAN_STEPS = [
  { label: 'Reading EXIF tags & camera sensor metadata', icon: Fingerprint },
  { label: 'Computing Canvas Error Level Analysis (ELA)', icon: Layers },
  { label: 'Inspecting Corneal Reflections & Facial Biometrics', icon: Scan },
  { label: 'Evaluating Directional Light & Shadow Physics', icon: Activity },
  { label: 'Scanning Latent Diffusion & Frequency Artifacts', icon: Cpu },
  { label: 'Synthesizing 5-Dimension HexGuard Report', icon: Sparkles },
];

export const AnalysisScanner: React.FC<AnalysisScannerProps> = ({
  imagePreviewUrl,
  fileName,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < SCAN_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) {
          return prev + Math.floor(Math.random() * 8 + 3);
        }
        return prev;
      });
    }, 200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn py-8">
      
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Forensic Deep Scan in Progress</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Analyzing Media Authenticity
        </h2>
        <p className="text-xs sm:text-sm font-mono text-slate-400">
          Inspecting target: <span className="text-cyan-300 font-medium">{fileName}</span>
        </p>
      </div>

      {/* Main Scanner Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* Image with Radar Scanline */}
        <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-2xl shadow-cyan-950/40 aspect-square max-h-[380px] mx-auto w-full flex items-center justify-center">
          
          <img
            src={imagePreviewUrl}
            alt="Scanning Media"
            className="w-full h-full object-contain filter contrast-105"
          />

          {/* Cyber Overlay Grid */}
          <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />

          {/* Animated Radar Scanning Line */}
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] animate-radar-sweep pointer-events-none" />

          {/* High-tech Corner Reticles */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

          {/* Live Scanner Telemetry Stamp */}
          <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 flex items-center justify-between text-[10px] font-mono text-cyan-300">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              MATRIX_SCAN // ACTIVE
            </span>
            <span>FREQ_ACCURACY: 99.4%</span>
          </div>
        </div>

        {/* Step-by-Step Progress Checklist */}
        <div className="space-y-4 glass-panel border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Verification Pipeline
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {Math.min(progress, 99)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_10px_#06b6d4]"
              style={{ width: `${Math.min(progress, 99)}%` }}
            />
          </div>

          {/* Pipeline Steps List */}
          <div className="space-y-2.5 pt-2">
            {SCAN_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300 ${
                    isCurrent
                      ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10'
                      : isCompleted
                      ? 'bg-slate-950/50 border-slate-850 text-slate-400'
                      : 'bg-slate-950/20 border-transparent text-slate-600 opacity-60'
                  }`}
                >
                  <div className="shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  <span className={`text-xs font-mono ${isCurrent ? 'font-semibold text-white' : ''}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 font-mono text-center pt-2">
            Running Local Ollama Multimodal Vision Reasoning
          </p>
        </div>

      </div>

    </div>
  );
};
