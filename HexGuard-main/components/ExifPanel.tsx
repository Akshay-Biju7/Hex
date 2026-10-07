'use client';

import React, { useState } from 'react';
import { ExifReport } from '@/lib/types';
import { 
  Camera, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  FileCode,
  CheckCircle2
} from 'lucide-react';

interface ExifPanelProps {
  exifData?: ExifReport;
}

export const ExifPanel: React.FC<ExifPanelProps> = ({ exifData }) => {
  const [showRawTags, setShowRawTags] = useState(false);

  const safeExif: ExifReport = exifData || {
    hasMetadata: false,
    humanSummary: 'No EXIF metadata tags found.',
    rawTags: {},
  };

  const rawKeys = Object.keys(safeExif.rawTags || {});

  return (
    <div className="space-y-4 glass-panel border border-slate-800/80 rounded-3xl p-6 shadow-2xl">
      
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Hardware EXIF &amp; Camera Provenance</h3>
            <p className="text-[11px] font-mono text-slate-400">
              Camera sensor signatures, shutter/aperture specs, and software tags
            </p>
          </div>
        </div>

        {safeExif.hasMetadata ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Camera Tags Present
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-950/80 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            No Sensor Tags
          </span>
        )}
      </div>

      {/* Primary Plain-English Human Summary Banner */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
        safeExif.hasMetadata
          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
          : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
      }`}>
        {safeExif.hasMetadata ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <h4 className="text-sm font-bold">
            {safeExif.humanSummary}
          </h4>
          {safeExif.warning && (
            <p className="text-xs text-slate-400 font-mono">
              <span className="text-slate-500 font-semibold uppercase">Forensic Note: </span>
              {safeExif.warning}
            </p>
          )}
        </div>
      </div>

      {/* Grid of Camera Tags */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Camera Device</span>
          <p className="text-xs font-mono font-semibold text-white truncate">
            {safeExif.cameraMake ? `${safeExif.cameraMake} ${safeExif.cameraModel || ''}` : 'No Sensor Tag'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Processing Software</span>
          <p className="text-xs font-mono font-semibold text-white truncate">
            {safeExif.software || 'Raw Stream / Synthetic'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Capture Timestamp</span>
          <p className="text-xs font-mono font-semibold text-white truncate">
            {safeExif.dateTime || 'Missing Header'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Shutter Speed</span>
          <p className="text-xs font-mono font-semibold text-white truncate">
            {safeExif.exposureTime ? `${safeExif.exposureTime}s` : 'N/A'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Aperture</span>
          <p className="text-xs font-mono font-semibold text-white truncate">
            {safeExif.fNumber ? `f/${safeExif.fNumber}` : 'N/A'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">ISO Sensitivity</span>
          <p className="text-xs font-mono font-semibold text-white truncate">
            {safeExif.iso ? `ISO ${safeExif.iso}` : 'N/A'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Focal Length</span>
          <p className="text-xs font-mono font-semibold text-white truncate">
            {safeExif.focalLength ? `${safeExif.focalLength}mm` : 'N/A'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Color Profile</span>
          <p className="text-xs font-mono font-semibold text-white truncate">
            {safeExif.colorSpace || 'sRGB / Standard'}
          </p>
        </div>
      </div>

      {/* Raw Tags Toggle */}
      {rawKeys.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowRawTags(!showRawTags)}
            className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{showRawTags ? 'Hide Raw Tags' : `View All Raw EXIF Tags (${rawKeys.length})`}</span>
            {showRawTags ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRawTags && (
            <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 max-h-48 overflow-y-auto space-y-1.5 text-xs font-mono text-slate-400">
              {rawKeys.map((key) => (
                <div key={key} className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-500">{key}:</span>
                  <span className="text-slate-200 truncate max-w-xs">{safeExif.rawTags?.[key]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
