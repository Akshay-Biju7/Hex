'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  Sparkles, 
  X, 
  Check, 
  Layers, 
  Activity, 
  Eye, 
  Cpu,
  RefreshCw
} from 'lucide-react';

export interface OllamaSettings {
  host: string;
  model: string;
}

interface OllamaModel {
  name: string;
  parameterSize?: string;
  quantizationLevel?: string;
  hasVision: boolean;
}

interface NavbarProps {
  settings: OllamaSettings;
  onSettingsChange: (settings: OllamaSettings) => void;
  onReset: () => void;
  hasActiveReport: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onSettingsChange,
  onReset,
  hasActiveReport,
}) => {
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState<OllamaSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  const [online, setOnline] = useState<boolean | null>(null);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [checking, setChecking] = useState(false);

  /** Pure probe: no setState before the first await, so effects may call it safely. */
  const probe = useCallback(async (host: string) => {
    try {
      const res = await fetch(`/api/ollama?host=${encodeURIComponent(host)}`);
      const data = (await res.json()) as { online?: boolean; models?: OllamaModel[] };
      return {
        online: Boolean(data.online),
        models: Array.isArray(data.models) ? data.models : [],
      };
    } catch {
      return { online: false, models: [] as OllamaModel[] };
    }
  }, []);

  /** User-triggered refresh: flips the spinner, then re-probes. */
  const refresh = useCallback(
    async (host: string) => {
      setChecking(true);
      const result = await probe(host);
      setOnline(result.online);
      setModels(result.models);
      setChecking(false);
    },
    [probe]
  );

  useEffect(() => {
    let cancelled = false;
    probe(settings.host).then((result) => {
      if (cancelled) return;
      setOnline(result.online);
      setModels(result.models);
    });
    return () => {
      cancelled = true;
    };
  }, [settings.host, probe]);

  const handleSaveSettings = () => {
    onSettingsChange({
      host: tempSettings.host.trim(),
      model: tempSettings.model.trim(),
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsModelModalOpen(false);
    }, 1200);
  };

  const activeModel = models.find((m) => m.name === settings.model);
  const statusLabel = online === null
    ? 'Checking Ollama…'
    : online
      ? (settings.model || activeModel?.name || 'Ollama online')
      : 'Ollama offline';

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div 
            onClick={onReset}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-b from-blue-500/20 to-transparent p-[1px] border border-white/10 shadow-lg shadow-black/40 group-hover:border-blue-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-900/90 rounded-xl flex items-center justify-center">
                <Eye className="w-4.5 h-4.5 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  HexGuard
                </span>
                <span className="text-[10px] uppercase tracking-widest font-mono font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.08]">
                  v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                AI Media &amp; Fake News Checker
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* Live Local Model Status Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-slate-300">
              <span className="relative flex h-2 w-2">
                {online && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 transition-colors ${
                    online === null ? 'bg-amber-400' : online ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <span className="max-w-[190px] truncate">{statusLabel}</span>
            </div>

            {/* How it Works Button */}
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-xl border border-white/[0.08] transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">How It Works</span>
            </button>

            {/* Local Model Settings Button */}
            <button
              onClick={() => {
                setTempSettings(settings);
                setIsModelModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-xl border border-white/[0.08] transition-all"
            >
              <Cpu className={`w-3.5 h-3.5 ${online ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Local Model</span>
              {online && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
            </button>

            {/* Reset / New Scan Button */}
            {hasActiveReport && (
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-950/40 border border-blue-400/20 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Scan</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Local Model Settings Modal */}
      {isModelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl shadow-cyan-950/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Local Ollama Model</h3>
                  <p className="text-xs text-slate-400 font-mono">Runs on your machine — no API key, no cloud</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModelModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              HexGuard sends each image to a pre-trained vision model served by{' '}
              <span className="text-cyan-400 font-medium">Ollama</span> for multimodal forensic reasoning.
              If the server is unreachable, HexGuard falls back to its built-in heuristic engine.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Ollama Server URL
                </label>
                <input
                  type="text"
                  value={tempSettings.host}
                  onChange={(e) => setTempSettings({ ...tempSettings, host: e.target.value })}
                  placeholder="http://127.0.0.1:11434"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Pre-trained Model</span>
                  <button
                    type="button"
                    onClick={() => refresh(tempSettings.host)}
                    className="flex items-center gap-1 text-cyan-500 hover:text-cyan-300 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </label>

                {models.length > 0 ? (
                  <select
                    value={tempSettings.model}
                    onChange={(e) => setTempSettings({ ...tempSettings, model: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  >
                    <option value="">Auto (first vision-capable model)</option>
                    {models.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}{m.hasVision ? ' · vision' : ''}{m.parameterSize ? ` · ${m.parameterSize}` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={tempSettings.model}
                    onChange={(e) => setTempSettings({ ...tempSettings, model: e.target.value })}
                    placeholder="tobestyledintro/qwen3.8-9b-distill:latest"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                )}

                <p className="mt-1.5 text-[11px] text-slate-500 font-mono">
                  {online === null
                    ? 'Checking connection…'
                    : online
                      ? `${models.length} model${models.length === 1 ? '' : 's'} installed · ${models.filter((m) => m.hasVision).length} support vision`
                      : 'Offline — start it with `ollama serve`, then Refresh.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a 
                  href="https://ollama.com/library" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline font-mono"
                >
                  Browse models ↗
                </a>

                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Model</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Modal */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl shadow-cyan-950/50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">HexGuard Verification Engine</h3>
                  <p className="text-xs text-slate-400 font-mono">Dual-Layer Human Clarity + Forensic Depth</p>
                </div>
              </div>
              <button 
                onClick={() => setIsInfoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3">
                <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 shrink-0 h-fit">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">1. Error Level Analysis (ELA)</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Runs client-side compression variance tests on HTML5 Canvas. Spliced or in-painted elements compress at different error rates than the original background, glowing brightly under high-contrast inspection.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3">
                <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 shrink-0 h-fit">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">2. Multi-Modal Vision Reasoning</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Sends the image to a pre-trained vision model hosted locally through Ollama, which inspects biological traits (corneal specular highlights, teeth mesh, earlobe cartilage, hair overlapping) and optical physics (directional shadow angles and depth-of-field). Nothing leaves your machine.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3">
                <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 shrink-0 h-fit">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">3. EXIF &amp; Provenance Audit</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Scans raw container headers for hardware camera tags (Canon, Sony, Nikon shutter/aperture) vs AI generator markers (Stable Diffusion parameters, Adobe Photoshop history, stripped containers).
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
