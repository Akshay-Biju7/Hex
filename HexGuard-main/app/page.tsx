'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, OllamaSettings } from '@/components/Navbar';
import { ImageDropzone } from '@/components/ImageDropzone';
import { AnalysisScanner } from '@/components/AnalysisScanner';
import { ReportView } from '@/components/ReportView';
import { ForensicReport, SamplePreset, ElaReport } from '@/lib/types';
import { generateELA } from '@/lib/ela';
import { parseImageMetadata } from '@/lib/exif';
import { AlertCircle, Eye } from 'lucide-react';

import { extractVideoKeyframes } from '@/lib/video';

export default function Home() {
  const [settings, setSettings] = useState<OllamaSettings>({ host: '', model: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('sample.jpg');
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const host = localStorage.getItem('HEXGUARD_OLLAMA_HOST');
    const model = localStorage.getItem('HEXGUARD_OLLAMA_MODEL');
    if (host || model) setSettings({ host: host || '', model: model || '' });
  }, []);

  const handleSettingsChange = (next: OllamaSettings) => {
    setSettings(next);
    localStorage.setItem('HEXGUARD_OLLAMA_HOST', next.host);
    localStorage.setItem('HEXGUARD_OLLAMA_MODEL', next.model);
  };

  const handleReset = () => {
    setReport(null);
    setImagePreviewUrl(null);
    setError(null);
    setIsLoading(false);
  };

  // Process and analyze an image or video (File or direct URL)
  const handleImageSelected = async (
    fileOrUrl: File | string,
    metadata?: { name: string; size: string }
  ) => {
    try {
      setError(null);
      setIsLoading(true);

      const isVideoFile = typeof fileOrUrl !== 'string' && fileOrUrl.type.startsWith('video/');
      const isVideoUrl = typeof fileOrUrl === 'string' && Boolean(fileOrUrl.match(/\.(mp4|webm|mov|m4v)($|\?)/i));
      const isVideo = isVideoFile || isVideoUrl;

      let dataUrl: string;
      let videoUrl: string | undefined;
      let fileName = metadata?.name || (isVideo ? 'media_target.mp4' : 'media_target.jpg');
      let fileSize = metadata?.size || 'Unknown';
      let mimeType = isVideo ? 'video/mp4' : 'image/jpeg';
      let keyframesData: { timestamp: number; dataUrl: string }[] = [];
      let videoDuration = 10;
      let width = 1280;
      let height = 720;

      if (isVideo) {
        if (typeof fileOrUrl !== 'string') {
          videoUrl = URL.createObjectURL(fileOrUrl);
          fileName = fileOrUrl.name;
          fileSize = `${(fileOrUrl.size / (1024 * 1024)).toFixed(2)} MB`;
        } else {
          videoUrl = fileOrUrl;
        }

        // Extract keyframes client-side using Canvas + HTML5 Video
        const extraction = await extractVideoKeyframes(fileOrUrl, 5);
        dataUrl = extraction.posterFrame;
        keyframesData = extraction.keyframes;
        videoDuration = extraction.duration;
        width = extraction.width;
        height = extraction.height;
      } else {
        if (typeof fileOrUrl === 'string') {
          dataUrl = fileOrUrl;
        } else {
          fileName = fileOrUrl.name;
          fileSize = `${(fileOrUrl.size / (1024 * 1024)).toFixed(2)} MB`;
          mimeType = fileOrUrl.type || 'image/jpeg';

          dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(fileOrUrl);
          });
        }

        // 1. Get image dimensions
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          img.onload = () => resolve({ width: img.naturalWidth || 800, height: img.naturalHeight || 600 });
          img.onerror = () => resolve({ width: 800, height: 600 });
          img.src = dataUrl;
        });
        width = dimensions.width;
        height = dimensions.height;
      }

      setCurrentFileName(fileName);
      setImagePreviewUrl(dataUrl);

      // 2. Client-side Canvas Error Level Analysis (ELA) for static image / poster
      let elaImageUrl: string | undefined;
      let elaData: ElaReport = {
        compressionVariance: 'low',
        detectedTampering: false,
        description: 'Standard baseline error rate.',
        highVarianceRegionsCount: 0,
      };

      try {
        const elaResult = await generateELA(dataUrl);
        elaImageUrl = elaResult.elaImageUrl;
        elaData = elaResult.elaReport;
      } catch (err) {
        console.warn('Canvas ELA warning:', err);
      }

      // 3. Client-side EXIF Extraction (Images only)
      let exifData;
      if (!isVideo) {
        try {
          exifData = await parseImageMetadata(dataUrl);
        } catch (err) {
          console.warn('EXIF parse warning:', err);
        }
      }

      // 4. Call Backend /api/analyze route
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Image: dataUrl,
          mimeType,
          fileName,
          fileSize,
          width,
          height,
          elaData,
          exifData,
          ollamaHost: settings.host || undefined,
          ollamaModel: settings.model || undefined,
          mediaType: isVideo ? 'video' : 'image',
          videoMetadata: isVideo ? { duration: videoDuration, keyframes: keyframesData.map(k => k.dataUrl) } : undefined,
          keyframes: isVideo ? keyframesData : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: Failed to complete media analysis.`);
      }

      const generatedReport: ForensicReport = await response.json();
      
      // Attach computed ELA canvas image and video URL to the report
      generatedReport.elaImageUrl = elaImageUrl;
      if (isVideo) {
        generatedReport.videoUrl = videoUrl;
        generatedReport.mediaType = 'video';
      }
      
      setReport(generatedReport);
    } catch (err) {
      console.error('Analysis error:', err);
      setError((err instanceof Error && err.message) || 'An error occurred during forensic verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Instant or live sample analysis
  const handleSelectSample = async (sample: SamplePreset) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentFileName(`${sample.id}.${sample.mediaType === 'video' ? 'mp4' : 'jpg'}`);
      setImagePreviewUrl(sample.imageUrl);

      // Ollama is local and needs no API key, so every sample gets a real live
      // analysis. If the model server is down, lib/ollama.ts falls back to heuristics.
      await handleImageSelected(sample.videoUrl || sample.imageUrl, {
        name: `${sample.id}.${sample.mediaType === 'video' ? 'mp4' : 'jpg'}`,
        size: 'Sample Media',
      });
    } catch (err) {
      console.error('Error loading sample:', err);
      setError('Could not load preset sample. Please try again or upload media.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onReset={handleReset}
        hasActiveReport={Boolean(report)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center justify-between max-w-2xl mx-auto w-full shadow-lg">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-slate-400 hover:text-white font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* View State 1: Loading & Scanning */}
        {isLoading && imagePreviewUrl && (
          <AnalysisScanner
            imagePreviewUrl={imagePreviewUrl}
            fileName={currentFileName}
          />
        )}

        {/* View State 2: Active Verification Report */}
        {!isLoading && report && (
          <ReportView report={report} onReset={handleReset} />
        )}

        {/* View State 3: Default Dropzone & Presets */}
        {!isLoading && !report && (
          <ImageDropzone
            onImageSelected={handleImageSelected}
            onSelectSample={handleSelectSample}
            isLoading={isLoading}
          />
        )}

      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>HexGuard Media Forensics</span>
            <span>•</span>
            <span>Dual-Layer Human &amp; Forensic Analysis</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Canvas ELA Engine v2</span>
            <span>•</span>
            <span>Local Ollama Vision</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
