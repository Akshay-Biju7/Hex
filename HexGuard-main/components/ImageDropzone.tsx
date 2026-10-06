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
  ClipboardCheck
} from 'lucide-react';
import { SampleGallery } from './SampleGallery';
import { SamplePreset } from '@/lib/types';

interface ImageDropzoneProps {
  onImageSelected: (file: File | string, metadata?: { name: string; size: string }) => void;
  onSelectSample: (sample: SamplePreset) => void;
  isLoading: boolean;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageSelected,
  onSelectSample,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [pasteNotice, setPasteNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle global clipboard paste (Ctrl+V)
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (isLoading) return;
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
  }, [isLoading, onImageSelected]);

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

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    if (!imageUrlInput.trim()) return;

    try {
      const parsed = new URL(imageUrlInput);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setUrlError('Please enter a valid HTTP or HTTPS media URL.');
        return;
      }
      const isVid = imageUrlInput.match(/\.(mp4|webm|mov|m4v)($|\?)/i);
      onImageSelected(imageUrlInput.trim(), {
        name: isVid ? 'web_video_source.mp4' : 'web_image_source.jpg',
        size: 'Remote URL',
      });
    } catch {
      setUrlError('Invalid URL format.');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Hero Headline */}
      <div className="text-center space-y-3 pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 mb-2 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Multimodal Image &amp; Video Forensics Suite</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
          Detect AI Generation &amp; <br />
          <span className="bg-gradient-to-r from-slate-100 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
            Digital Manipulation in Seconds
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
          Upload any photo or video clip to run instantaneous Canvas Error Level Analysis (ELA), video temporal consistency inspection, EXIF provenance auditing, and deep visual reasoning by a pre-trained vision model hosted locally via Ollama.
        </p>
      </div>

      {/* Paste Notification Banner */}
      {pasteNotice && (
        <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-950/80 border border-blue-500/50 text-blue-300 text-xs font-mono animate-bounce">
          <ClipboardCheck className="w-4 h-4 text-blue-400" />
          <span>Media detected from clipboard! Loading forensic scanner...</span>
        </div>
      )}

      {/* Main Drag & Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-3xl p-8 sm:p-12 transition-all duration-300 text-center border ${
          isDragging
            ? 'border-blue-400 bg-blue-950/30 scale-[1.01] shadow-2xl shadow-blue-500/10'
            : 'border-white/[0.08] hover:border-blue-500/30 bg-slate-900/40 hover:bg-slate-900/60 shadow-2xl shadow-black/60 backdrop-blur-xl'
        }`}
      >
        {/* Subtle dot grid background */}
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
          
          {/* Central Pulsing Icon */}
          <div className="relative">
            <div className="w-18 h-18 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-105 group-hover:border-blue-500/40 transition-all duration-300 shadow-xl shadow-black/40">
              <UploadCloud className="w-9 h-9 text-slate-300 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-slate-950 border border-white/10 text-slate-400">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
              {isDragging ? 'Drop Media Here to Verify' : 'Drag & Drop Media, Browse, or Paste (Ctrl+V)'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Supports JPG, PNG, WEBP, MP4, MOV, WEBM up to 50MB with full temporal consistency inspection.
            </p>
          </div>

          {/* Quick specs chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <FileCheck className="w-3 h-3 text-blue-400" />
              Canvas ELA &amp; Video Keyframes
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-blue-400" />
              EXIF / Temporal Integrity
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-400" />
              Local Vision Model
            </span>
          </div>
        </div>
      </div>

      {/* URL Input Bar */}
      <div className="max-w-xl mx-auto">
        <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <LinkIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Or paste direct image URL (https://...)"
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-white/[0.08] rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !imageUrlInput.trim()}
            className="w-full sm:w-auto px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-40 disabled:cursor-not-allowed border border-white/[0.08] text-white rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>Scan URL</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
          </button>
        </form>
        {urlError && (
          <p className="mt-2 text-center text-xs font-mono text-rose-400 animate-fadeIn">
            {urlError}
          </p>
        )}
      </div>

      {/* Preset Gallery Section */}
      <div className="pt-4 border-t border-slate-800/80">
        <SampleGallery onSelectSample={onSelectSample} isLoading={isLoading} />
      </div>

    </div>
  );
};
