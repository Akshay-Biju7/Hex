'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, OllamaSettings } from '@/components/Navbar';
import { ImageDropzone } from '@/components/ImageDropzone';
import { AnalysisScanner } from '@/components/AnalysisScanner';
import { ReportView } from '@/components/ReportView';
import { LiveGuardDashboard } from '@/components/LiveGuardDashboard';
import { ForensicReport, SamplePreset, ElaReport } from '@/lib/types';
import { SAMPLE_PRESETS } from '@/lib/samples';
import { generateELA } from '@/lib/ela';
import { parseImageMetadata } from '@/lib/exif';
import { computeSha256 } from '@/lib/security';
import { TemporalConsistencyEngine } from '@/lib/temporal';
import { AlertCircle, Eye } from 'lucide-react';

import { extractVideoKeyframes } from '@/lib/video';
import { fetchMediaAsFile } from '@/lib/remote';

export default function Home() {
  const [settings, setSettings] = useState<OllamaSettings>({ host: '', model: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('sample.jpg');
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Live Stream Session State (LiveGuard)
  const [liveSession, setLiveSession] = useState<{
    streamSource: string;
    mediaStream?: MediaStream;
  } | null>(null);

  useEffect(() => {
    const host = localStorage.getItem('HEXGUARD_OLLAMA_HOST');
    const model = localStorage.getItem('HEXGUARD_OLLAMA_MODEL');
    if (host || model) setSettings({ host: host || '', model: model || '' });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sampleId = params.get('sample');
      if (sampleId) {
        const found = SAMPLE_PRESETS.find(s => s.id === sampleId);
        if (found && found.precomputedReport) {
          setReport({
            ...found.precomputedReport,
            id: found.precomputedReport.id || `preset-${found.id}`,
            timestamp: found.precomputedReport.timestamp || new Date().toISOString(),
            fileName: found.title,
            fileSize: '1.4 MB',
            mediaType: found.mediaType || 'image',
            imageUrl: found.imageUrl,
            videoUrl: found.videoUrl,
            dimensions: { width: 1200, height: 800 },
          });
          setImagePreviewUrl(found.imageUrl);
          setCurrentFileName(found.title);
        }
      } else if (params.get('view') === 'live') {
        setLiveSession({ streamSource: 'Live Stream Feed (RTMP / WebRTC)' });
      }
    }
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
    setLiveSession(null);
  };

  // Start Live Stream Analysis (LiveGuard Mode)
  const handleStartLiveStream = (options: { streamUrl?: string; mediaStream?: MediaStream }) => {
    setError(null);
    setReport(null);
    setLiveSession({
      streamSource: options.streamUrl || 'Live Feed',
      mediaStream: options.mediaStream,
    });
  };

  // Process and analyze an image or video (File or direct URL)
  const handleImageSelected = async (
    fileOrUrl: File | string,
    metadata?: { name: string; size: string; platform?: string }
  ) => {
    try {
      setError(null);
      setIsLoading(true);

      // A URL string (pasted link or sample preset) is downloaded into a real
      // File first — cross-origin sources via our /api/fetch-media proxy — so
      // ELA, EXIF, keyframe extraction and the Ollama vision call all receive
      // actual bytes instead of an unfetchable URL string.
      let mediaFile: File;
      if (typeof fileOrUrl === 'string') {
        setCurrentFileName('Fetching media from URL...');
        const remote = await fetchMediaAsFile(fileOrUrl);
        mediaFile = remote.file;
      } else {
        mediaFile = fileOrUrl;
      }

      const isVideo = mediaFile.type.startsWith('video/');

      // Compute SHA-256 fingerprint from media file bytes
      let sha256 = 'unavailable';
      try {
        const fileBuffer = await mediaFile.arrayBuffer();
        sha256 = await computeSha256(fileBuffer);
      } catch (err) {
        console.warn('SHA-256 fingerprint generation error:', err);
      }

      let dataUrl: string;
      let videoUrl: string | undefined;
      const fileName = metadata?.name || mediaFile.name;
      const fileSize = metadata?.size || `${(mediaFile.size / (1024 * 1024)).toFixed(2)} MB`;
      const mimeType = mediaFile.type || (isVideo ? 'video/mp4' : 'image/jpeg');
      let keyframesData: { timestamp: number; dataUrl: string }[] = [];
      let videoDuration = 10;
      let width = 1280;
      let height = 720;
      let temporalReport: any = undefined;

      if (isVideo) {
        videoUrl = URL.createObjectURL(mediaFile);

        // Extract keyframes client-side using Canvas + HTML5 Video with intelligent sampling
        const extraction = await extractVideoKeyframes(mediaFile, { frameCount: 6 });
        dataUrl = extraction.posterFrame;
        keyframesData = extraction.keyframes;
        videoDuration = extraction.duration;
        width = extraction.width;
        height = extraction.height;

        // Run Temporal Consistency Engine across extracted sequential frames
        try {
          temporalReport = await TemporalConsistencyEngine.analyzeFrames(keyframesData);
        } catch (err) {
          console.warn('Temporal engine warning:', err);
        }
      } else {
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Could not read the media file.'));
          reader.readAsDataURL(mediaFile);
        });

        // 1. Get image dimensions
        const img = new Image();
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
          sha256,
          sourceUrl: typeof fileOrUrl === 'string' ? fileOrUrl : undefined,
          sourcePlatform: metadata?.platform,
          temporalConsistencyReport: temporalReport,
          framesAnalyzed: isVideo ? keyframesData.length : 1,
          suspiciousFramesCount: temporalReport?.anomalyCount || 0,
          suspiciousTimestamps: temporalReport?.anomalies?.map((a: any) => ({
            timestamp: a.timestamp,
            label: a.description,
            evidence: [a.type, `Metric delta: ${a.metricDelta}`],
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: Failed to complete media analysis.`);
      }

      const generatedReport: ForensicReport = await response.json();
      
      // Attach computed ELA canvas image, video URL, sha256, and temporal report
      generatedReport.elaImageUrl = elaImageUrl;
      generatedReport.sha256 = sha256;
      if (typeof fileOrUrl === 'string') {
        generatedReport.sourceUrl = fileOrUrl;
      }
      if (metadata?.platform) {
        generatedReport.sourcePlatform = metadata.platform;
      }
      if (temporalReport) {
        generatedReport.temporalConsistencyReport = temporalReport;
      }

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
  const handleSelectSample = (sample: SamplePreset) => {
    if (sample.precomputedReport) {
      setReport({
        ...sample.precomputedReport,
        id: sample.precomputedReport.id || `preset-${sample.id}`,
        timestamp: sample.precomputedReport.timestamp || new Date().toISOString(),
        fileName: sample.title,
        fileSize: '1.4 MB',
        mediaType: sample.mediaType || 'image',
        imageUrl: sample.imageUrl,
        videoUrl: sample.videoUrl,
        dimensions: { width: 1200, height: 800 },
      });
      setImagePreviewUrl(sample.imageUrl);
      setCurrentFileName(sample.title);
      return;
    }
    const source = sample.mediaType === 'video' && sample.videoUrl ? sample.videoUrl : sample.imageUrl;
    return handleImageSelected(source, {
      name: `${sample.id}.${sample.mediaType === 'video' ? 'mp4' : 'jpg'}`,
      size: 'Sample Media',
      platform: 'Sample Preset',
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onReset={handleReset}
        hasActiveReport={Boolean(report || liveSession)}
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

        {/* View State: LiveGuard Mode */}
        {liveSession && (
          <LiveGuardDashboard
            streamSource={liveSession.streamSource}
            mediaStream={liveSession.mediaStream}
            onStop={() => setLiveSession(null)}
          />
        )}

        {/* View State 1: Loading & Scanning */}
        {!liveSession && isLoading && imagePreviewUrl && (
          <AnalysisScanner
            imagePreviewUrl={imagePreviewUrl}
            fileName={currentFileName}
          />
        )}

        {/* View State 2: Active Verification Report */}
        {!liveSession && !isLoading && report && (
          <ReportView report={report} onReset={handleReset} />
        )}

        {/* View State 3: Default Dropzone, Paste Link & Live Stream Inputs */}
        {!liveSession && !isLoading && !report && (
          <ImageDropzone
            onImageSelected={handleImageSelected}
            onSelectSample={handleSelectSample}
            onStartLiveStream={handleStartLiveStream}
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
            <span>Files • URLs • Live Streams</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Canvas ELA &amp; Temporal Engine</span>
            <span>•</span>
            <span>Local Ollama Vision</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
