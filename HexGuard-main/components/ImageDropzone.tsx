'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert,
  FileCheck,
  ClipboardCheck,
  Radio,
  Video,
  Camera,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { SampleGallery } from './SampleGallery';
import { SamplePreset } from '@/lib/types';

export type InputMode = 'upload' | 'url' | 'live';

interface ImageDropzoneProps {
  onImageSelected: (file: File | string, metadata?: { name: string; size: string; platform?: string }) => void;
  onSelectSample: (sample: SamplePreset) => void;
  isLoading: boolean;
  onStartLiveStream?: (options: { streamUrl?: string; mediaStream?: MediaStream }) => void;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageSelected,
  onSelectSample,
  isLoading,
  onStartLiveStream,
}) => {
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [streamUrlInput, setStreamUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isValidatingPlatform, setIsValidatingPlatform] = useState(false);
  const [pasteNotice, setPasteNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle global clipboard paste (Ctrl+V) when in upload mode
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (isLoading || inputMode !== 'upload') return;
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          setPasteNotice(true);
          setTimeout(() => setPasteNotice(false), 2000);
          onImageSelected(blob, {
            name: `clipboard_image_${Date.now()}.png`,
            size: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`,
          });
          break;
        }
      }
    }
  }, [isLoading, inputMode, onImageSelected]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isLoading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        onImageSelected(file, {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onImageSelected(file, {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });
    }
  };

  // Handle URL Analysis Submit
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;

    try {
      setIsValidatingPlatform(true);
      const res = await fetch('/api/platforms/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setUrlError(data.error || 'Invalid media URL provided.');
        return;
      }

      const mediaSource = data.mediaSource;
      if (!mediaSource.accessible) {
        // Show official authorized compliance error message
        setUrlError(
          mediaSource.errorMessage ||
          'Media access is not available for this source. Please provide an authorized media source or use LiveGuard with a supported stream input.'
        );
        return;
      }

      // If directly accessible, proceed through HexGuard forensic pipeline
      const targetUrl = mediaSource.directMediaUrl || trimmed;
      onImageSelected(targetUrl, {
        name: mediaSource.metadata?.title || 'platform_media',
        size: 'Platform Stream',
        platform: data.platform,
      });
    } catch {
      setUrlError('Network error while validating platform URL. Please check connection.');
    } finally {
      setIsValidatingPlatform(false);
    }
  };

  // Handle Live Stream Analysis Start
  const handleLiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    const trimmed = streamUrlInput.trim();
    if (!trimmed) {
      setUrlError('Please enter a stream URL (e.g., HLS .m3u8, RTMP/HTTP stream) or start camera capture.');
      return;
    }

    if (onStartLiveStream) {
      onStartLiveStream({ streamUrl: trimmed });
    }
  };

  // Handle Live Camera / Screen Capture trigger for instant dev & browser demo
  const handleStartCameraStream = async () => {
    setUrlError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setUrlError('Browser media stream capture is not supported on this device/browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: false,
      });

      if (onStartLiveStream) {
        onStartLiveStream({
          streamUrl: 'Local WebRTC Camera Feed',
          mediaStream: stream,
        });
      }
    } catch (err) {
      setUrlError('Could not access camera feed: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Hero Headline */}
      <div className="text-center space-y-3 pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 mb-2 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Multimodal Image, Video &amp; Live Stream Forensics Suite</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
          Detect AI Generation &amp; <br />
          <span className="bg-gradient-to-r from-slate-100 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
            Digital Manipulation in Seconds
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
          Verify uploaded media, analyze supported media links, and monitor live streams for persistent forensic anomalies using Canvas ELA, temporal consistency inspection, EXIF provenance, and local AI reasoning.
        </p>
      </div>

      {/* Input Mode Selector Bar: [ Upload File ] [ Paste Link ] [ Live Stream ] */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-2xl">
          <button
            type="button"
            onClick={() => { setInputMode('upload'); setUrlError(null); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              inputMode === 'upload'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => { setInputMode('url'); setUrlError(null); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              inputMode === 'url'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Paste Link</span>
          </button>

          <button
            type="button"
            onClick={() => { setInputMode('live'); setUrlError(null); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              inputMode === 'live'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>Live Stream</span>
          </button>
        </div>
      </div>

      {/* Paste Notification Banner */}
      {pasteNotice && (
        <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono animate-bounce">
          <ClipboardCheck className="w-4 h-4 text-cyan-400" />
          <span>Media detected from clipboard! Loading forensic scanner...</span>
        </div>
      )}

      {/* MODE 1: UPLOAD FILE (Exact existing workflow preserved) */}
      {inputMode === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`relative group cursor-pointer rounded-3xl p-8 sm:p-12 transition-all duration-300 text-center border ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01] shadow-2xl shadow-cyan-500/10'
              : 'border-white/[0.08] hover:border-cyan-500/30 bg-slate-900/40 hover:bg-slate-900/60 shadow-2xl shadow-black/60 backdrop-blur-xl'
          }`}
        >
          <div className="absolute inset-0 cyber-grid opacity-30 rounded-3xl pointer-events-none" />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp, image/avif, image/tiff, video/mp4, video/webm, video/quicktime, video/x-m4v"
            className="hidden"
            disabled={isLoading}
          />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
            
            <div className="relative">
              <div className="w-18 h-18 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-105 group-hover:border-cyan-500/40 transition-all duration-300 shadow-xl shadow-black/40">
                <UploadCloud className="w-9 h-9 text-slate-300 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-slate-950 border border-white/10 text-slate-400">
                <ImageIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                {isDragging ? 'Drop Media Here to Verify' : 'Drag & Drop Media, Browse, or Paste (Ctrl+V)'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Supports JPG, PNG, WEBP, MP4, MOV, WEBM up to 50MB with full temporal consistency inspection.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <FileCheck className="w-3 h-3 text-cyan-400" />
                Canvas ELA &amp; Video Keyframes
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3 text-cyan-400" />
                EXIF / Temporal Integrity
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Local Vision Model
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: PASTE LINK */}
      {inputMode === 'url' && (
        <div className="p-8 sm:p-12 rounded-3xl border border-white/[0.08] bg-slate-900/40 backdrop-blur-xl shadow-2xl space-y-6 text-center">
          <div className="space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <LinkIcon className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Analyze Media Link
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Ingest and inspect media from YouTube, Instagram, or direct video/image URLs through platform-aware forensic adapters.
            </p>
          </div>

          <form onSubmit={handleUrlSubmit} className="max-w-2xl mx-auto space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Paste YouTube / Instagram / Supported Media URL"
                disabled={isLoading || isValidatingPlatform}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950/80 border border-white/[0.1] rounded-2xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all shadow-inner"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">YouTube</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">Instagram</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">Direct MP4 / JPG</span>
              </div>

              <button
                type="submit"
                disabled={isLoading || isValidatingPlatform || !imageUrlInput.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
              >
                {isValidatingPlatform ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Validating Platform...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Compliance & Platform Policy Notice */}
          <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-slate-400 text-left flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-300 font-semibold">Authorized Media Access:</span> HexGuard strictly adheres to platform terms of service and access controls. If direct media extraction is restricted for a platform, metadata is retrieved and alternative forensic inputs are recommended.
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: LIVE STREAM (LiveGuard) */}
      {inputMode === 'live' && (
        <div className="p-8 sm:p-12 rounded-3xl border border-white/[0.08] bg-slate-900/40 backdrop-blur-xl shadow-2xl space-y-6 text-center">
          <div className="space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-400">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-2">
              Live Media Forensics
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                LIVEGUARD
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Real-time forensic stream ingestion, rolling trust score calculation, and persistent anomaly detection.
            </p>
          </div>

          <form onSubmit={handleLiveSubmit} className="max-w-2xl mx-auto space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Video className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={streamUrlInput}
                onChange={(e) => setStreamUrlInput(e.target.value)}
                placeholder="Stream URL (e.g. YouTube Live, HLS .m3u8, or MP4 stream)"
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950/80 border border-white/[0.1] rounded-2xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/40 transition-all shadow-inner"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Quick Browser Camera Capture Trigger */}
                <button
                  type="button"
                  onClick={handleStartCameraStream}
                  className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-cyan-300 rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Use Webcam Feed</span>
                </button>

                {/* Quick Sample Live Stream Feed */}
                <button
                  type="button"
                  onClick={() => {
                    setStreamUrlInput('https://youtu.be/zjy0QEJQorg');
                    if (onStartLiveStream) {
                      onStartLiveStream({ streamUrl: 'https://youtu.be/zjy0QEJQorg' });
                    }
                  }}
                  className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-rose-300 rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>Load Live Sample</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || !streamUrlInput.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-rose-500 hover:bg-rose-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Start Live Analysis</span>
              </button>
            </div>
          </form>

          {/* Status Indicator Preview */}
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono text-slate-400 space-y-2 text-left">
            <span className="text-slate-300 font-semibold block">LiveGuard Continuous Engine:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <span className="px-2 py-1 rounded bg-black/40 border border-white/[0.06] text-cyan-300">Connecting</span>
              <span className="px-2 py-1 rounded bg-black/40 border border-white/[0.06] text-amber-300">Buffering</span>
              <span className="px-2 py-1 rounded bg-black/40 border border-white/[0.06] text-emerald-300">Analyzing</span>
              <span className="px-2 py-1 rounded bg-black/40 border border-white/[0.06] text-rose-300">Anomaly Check</span>
            </div>
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {urlError && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center justify-between max-w-2xl mx-auto w-full shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{urlError}</span>
          </div>
          <button
            onClick={() => setUrlError(null)}
            className="text-slate-400 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Preset Gallery Section */}
      <div className="pt-4 border-t border-slate-800/80">
        <SampleGallery onSelectSample={onSelectSample} isLoading={isLoading} />
      </div>

    </div>
  );
};
