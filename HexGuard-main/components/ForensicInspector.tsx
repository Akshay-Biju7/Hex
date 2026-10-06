'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AnomalyItem, VideoMetadata } from '@/lib/types';
import { 
  Sliders, 
  Eye, 
  Crosshair, 
  Info,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Film
} from 'lucide-react';

interface ForensicInspectorProps {
  originalUrl: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  videoMetadata?: VideoMetadata;
  elaUrl?: string;
  anomalies: AnomalyItem[];
  selectedAnomalyId?: string | null;
  onSelectAnomaly?: (id: string | null) => void;
}

export const ForensicInspector: React.FC<ForensicInspectorProps> = ({
  originalUrl,
  videoUrl,
  mediaType = 'image',
  videoMetadata,
  elaUrl,
  anomalies,
  selectedAnomalyId,
  onSelectAnomaly,
}) => {
  const isVideo = mediaType === 'video' || Boolean(videoUrl);

  // Image mode state
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'split' | 'normal' | 'ela'>('split');
  const [showAnomalyBoxes, setShowAnomalyBoxes] = useState(true);

  // Video mode state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(videoMetadata?.duration || 10);
  const [playbackRate, setPlaybackRate] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-seek video when an anomaly is selected
  useEffect(() => {
    if (isVideo && selectedAnomalyId && videoRef.current) {
      const selected = anomalies.find((a) => a.id === selectedAnomalyId);
      if (selected && selected.timestampSeconds !== undefined) {
        videoRef.current.currentTime = selected.timestampSeconds;
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [selectedAnomalyId, isVideo, anomalies]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isDraggingSlider) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const relX = (x / rect.width) * 100;
    setSliderPos(relX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isDraggingSlider) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const relX = (x / rect.width) * 100;
    setSliderPos(relX);
  };

  // Video Controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 10);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const stepFrame = (secondsDelta: number) => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + secondsDelta));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTimestamp = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}s`;
  };

  return (
    <div className="space-y-4 glass-panel border border-slate-800/80 rounded-3xl p-6 shadow-2xl">
      
      {/* Inspector Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
            {isVideo ? <Film className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {isVideo ? 'Forensic Video Timeline Inspector' : 'Interactive Forensic Inspector'}
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              {isVideo 
                ? 'Timeline scrubber with temporal keyframe markers & micro-second frame stepping'
                : 'Drag slider to compare original photo vs Error Level Analysis (ELA) compression map'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher (Image mode only) */}
          {!isVideo && (
            <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
              <button
                onClick={() => setActiveFilter('split')}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                  activeFilter === 'split'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setActiveFilter('normal')}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                  activeFilter === 'normal'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setActiveFilter('ela')}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                  activeFilter === 'ela'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ELA Filter
              </button>
            </div>
          )}

          {/* Anomaly Toggle */}
          <button
            onClick={() => setShowAnomalyBoxes(!showAnomalyBoxes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xl border transition-all ${
              showAnomalyBoxes
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                : 'bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-slate-300'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Anomalies ({anomalies.length})</span>
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={() => !isVideo && activeFilter === 'split' && setIsDraggingSlider(true)}
        onMouseUp={() => setIsDraggingSlider(false)}
        onMouseLeave={() => setIsDraggingSlider(false)}
        onTouchMove={handleTouchMove}
        onTouchStart={() => !isVideo && activeFilter === 'split' && setIsDraggingSlider(true)}
        onTouchEnd={() => setIsDraggingSlider(false)}
        className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center select-none min-h-[380px] max-h-[560px]"
      >
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

        <div className="relative inline-block max-w-full max-h-[540px] shadow-2xl rounded-xl overflow-hidden">
          
          {/* Video Player Display */}
          {isVideo ? (
            <video
              ref={videoRef}
              src={videoUrl || originalUrl}
              poster={originalUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              playsInline
              loop
              className="max-w-full max-h-[540px] w-auto h-auto object-contain block rounded-xl cursor-pointer"
            />
          ) : (
            /* Base Layer: Original Image */
            <img
              src={originalUrl}
              alt="Forensic Target"
              className="max-w-full max-h-[540px] w-auto h-auto object-contain block rounded-xl"
            />
          )}

          {/* ELA Overlay Layer for Split View (Images only) */}
          {!isVideo && activeFilter === 'split' && elaUrl && (
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img
                src={elaUrl}
                alt="Error Level Analysis"
                className="w-full h-full object-contain block rounded-xl"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-cyan-950/90 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 shadow-lg">
                COMPRESSION ERROR MAP (ELA)
              </div>
            </div>
          )}

          {/* Full ELA View (Images only) */}
          {!isVideo && activeFilter === 'ela' && elaUrl && (
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <img
                src={elaUrl}
                alt="Full Error Level Analysis"
                className="w-full h-full object-contain block rounded-xl"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-cyan-950/90 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 shadow-lg">
                ERROR LEVEL ANALYSIS (ELA)
              </div>
            </div>
          )}

          {/* Split Divider Bar (Images only) */}
          {!isVideo && activeFilter === 'split' && elaUrl && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 cursor-ew-resize shadow-[0_0_12px_#06b6d4] flex items-center justify-center pointer-events-none z-20"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-lg -translate-x-1/2 pointer-events-auto cursor-grab active:cursor-grabbing">
                <Sliders className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Anomaly Bounding Boxes */}
          {showAnomalyBoxes && anomalies.map((ano) => {
            if (!ano.box) return null;
            // In video mode, show bounding box if near timestamp or if selected
            if (isVideo && ano.timestampSeconds !== undefined) {
              const isNearTime = Math.abs(currentTime - ano.timestampSeconds) < 1.5;
              if (!isNearTime && selectedAnomalyId !== ano.id) return null;
            }

            const isSelected = selectedAnomalyId === ano.id;

            return (
              <div
                key={ano.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAnomaly?.(isSelected ? null : ano.id);
                  if (isVideo && ano.timestampSeconds !== undefined && videoRef.current) {
                    videoRef.current.currentTime = ano.timestampSeconds;
                    videoRef.current.pause();
                    setIsPlaying(false);
                  }
                }}
                className={`absolute rounded-lg border-2 cursor-pointer transition-all duration-300 z-10 ${
                  ano.severity === 'critical'
                    ? 'border-rose-500 bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : ano.severity === 'high'
                    ? 'border-amber-500 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                } ${isSelected ? 'scale-105 ring-2 ring-white ring-offset-2 ring-offset-slate-950 z-30' : ''}`}
                style={{
                  left: `${ano.box.x}%`,
                  top: `${ano.box.y}%`,
                  width: `${ano.box.width}%`,
                  height: `${ano.box.height}%`,
                }}
              >
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
                <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />

                {/* Smart Badge Positioning */}
                <div 
                  className={`absolute px-2 py-0.5 rounded bg-slate-950/95 border border-slate-700 text-[10px] font-mono text-white whitespace-nowrap shadow-xl flex items-center gap-1 z-30 pointer-events-none ${
                    ano.box.y < 12 ? 'top-full mt-1.5' : '-top-6'
                  } ${
                    ano.box.x > 55 ? 'right-0' : 'left-0'
                  }`}
                >
                  <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>{ano.title}</span>
                  {ano.timestampSeconds !== undefined && (
                    <span className="text-cyan-300">[{formatTimestamp(ano.timestampSeconds)}]</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Video Center Play Button Overlay when Paused */}
        {isVideo && !isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-slate-950/80 border border-white/20 text-white flex items-center justify-center hover:scale-110 hover:border-blue-400 transition-all shadow-2xl shadow-black/80 z-20"
          >
            <Play className="w-6 h-6 ml-0.5 text-blue-400" />
          </button>
        )}

        {/* Bottom Telemetry Bar */}
        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-3 pointer-events-none z-20">
          {isVideo ? (
            <>
              <span>FPS: 30</span>
              <span className="text-cyan-300">{formatTimestamp(currentTime)} / {formatTimestamp(duration)}</span>
            </>
          ) : (
            <>
              <span>MODE: {activeFilter.toUpperCase()}</span>
              {activeFilter === 'split' && <span>SPLIT: {Math.round(sliderPos)}%</span>}
            </>
          )}
        </div>
      </div>

      {/* Video Interactive Timeline Scrubber & Frame Stepper */}
      {isVideo && (
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
          
          {/* Progress Timeline Track with Anomaly Markers */}
          <div className="relative w-full pt-1 pb-2">
            <input
              type="range"
              min="0"
              max={duration || 10}
              step="0.05"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
            />

            {/* Anomaly Timestamp Markers on Timeline */}
            <div className="absolute inset-x-0 top-1 h-2 pointer-events-none">
              {anomalies.map((ano) => {
                if (ano.timestampSeconds === undefined) return null;
                const posPercent = Math.min(100, Math.max(0, (ano.timestampSeconds / (duration || 10)) * 100));
                const isSelected = selectedAnomalyId === ano.id;

                return (
                  <button
                    key={ano.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAnomaly?.(ano.id);
                      if (videoRef.current && ano.timestampSeconds !== undefined) {
                        videoRef.current.currentTime = ano.timestampSeconds;
                        videoRef.current.pause();
                        setIsPlaying(false);
                      }
                    }}
                    title={`${ano.title} (${formatTimestamp(ano.timestampSeconds)})`}
                    className={`absolute top-0 -translate-x-1/2 w-3 h-3 rounded-full pointer-events-auto transition-transform hover:scale-150 ${
                      ano.severity === 'critical'
                        ? 'bg-rose-500 ring-2 ring-rose-300 shadow-[0_0_8px_#f43f5e]'
                        : 'bg-amber-400 ring-2 ring-amber-200 shadow-[0_0_8px_#f59e0b]'
                    } ${isSelected ? 'scale-125 ring-white' : ''}`}
                    style={{ left: `${posPercent}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Video Control Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={() => stepFrame(-0.1)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                title="Step Back 0.1s"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span>-0.1s</span>
              </button>

              <button
                onClick={() => stepFrame(0.1)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                title="Step Forward 0.1s"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>+0.1s</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span>Timestamp:</span>
              <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {formatTimestamp(currentTime)}
              </span>
              <span className="text-slate-600">/</span>
              <span>{formatTimestamp(duration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Legend */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          {isVideo 
            ? 'Click pins on the timeline or step frame-by-frame (±0.1s) to inspect temporal warping and deepfake anomalies.'
            : 'Drag the center slider left/right to compare original photography with compression error rates.'
          }
        </span>
        <span>HEXGUARD {isVideo ? 'VIDEO FORENSICS' : 'CANVAS FORENSICS'}</span>
      </div>

    </div>
  );
};

