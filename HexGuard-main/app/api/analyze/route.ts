import { NextRequest, NextResponse } from 'next/server';
import { analyzeMediaWithOllama } from '@/lib/ollama';
import { parseImageMetadata } from '@/lib/exif';
import { ElaReport, ExifReport } from '@/lib/types';

export const maxDuration = 300; // Local LLM vision inference can take a while on CPU-only rigs

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      base64Image,
      mimeType,
      fileName = 'uploaded_image.jpg',
      fileSize = 'Unknown',
      width = 800,
      height = 600,
      elaData,
      exifData: clientExif,
      ollamaHost,
      ollamaModel,
      mediaType = 'image',
      videoMetadata,
      keyframes,
      sha256,
      sourceUrl,
      sourcePlatform,
      temporalConsistencyReport,
      framesAnalyzed,
      suspiciousFramesCount,
      suspiciousTimestamps,
    } = body;

    if (!base64Image && (!keyframes || keyframes.length === 0)) {
      return NextResponse.json(
        { error: 'Missing media payload in request.' },
        { status: 400 }
      );
    }

    // Extract EXIF data server-side if not already provided by client (images only)
    let exifData: ExifReport = clientExif;
    if (!exifData && mediaType !== 'video' && base64Image) {
      exifData = await parseImageMetadata(base64Image);
    } else if (!exifData) {
      exifData = {
        hasMetadata: false,
        humanSummary: mediaType === 'video' ? 'Video stream metadata parsed.' : 'No EXIF metadata tags found.',
        rawTags: {},
      };
    }

    // Default ELA data if missing
    const finalElaData: ElaReport = elaData || {
      compressionVariance: 'low',
      detectedTampering: false,
      description: 'Standard baseline compression profile.',
      highVarianceRegionsCount: 0,
    };

    // Run multimodal AI verification against a locally hosted pre-trained model
    const report = await analyzeMediaWithOllama({
      base64Image: base64Image || (keyframes && keyframes[0]?.dataUrl) || '',
      mimeType: mimeType || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
      fileName,
      fileSize,
      width,
      height,
      exifData,
      elaData: finalElaData,
      host: ollamaHost,
      model: ollamaModel,
      mediaType,
      videoMetadata,
      keyframes,
    });

    // Attach security fingerprint, platform provenance, and temporal evidence
    if (sha256) report.sha256 = sha256;
    if (sourceUrl) report.sourceUrl = sourceUrl;
    if (sourcePlatform) report.sourcePlatform = sourcePlatform;
    if (framesAnalyzed !== undefined) report.framesAnalyzed = framesAnalyzed;
    if (suspiciousFramesCount !== undefined) report.suspiciousFramesCount = suspiciousFramesCount;
    if (suspiciousTimestamps) report.suspiciousTimestamps = suspiciousTimestamps;

    if (temporalConsistencyReport) {
      report.temporalConsistencyReport = temporalConsistencyReport;
      // Evidence fusion: integrate temporal findings if anomalies detected
      if (!temporalConsistencyReport.isConsistent) {
        if (report.dimensionsBreakdown?.optics) {
          report.dimensionsBreakdown.optics.findings.push(
            ...temporalConsistencyReport.findings
          );
          if (temporalConsistencyReport.score < 50) {
            report.dimensionsBreakdown.optics.status = 'fail';
            report.dimensionsBreakdown.optics.score = Math.min(
              report.dimensionsBreakdown.optics.score,
              temporalConsistencyReport.score
            );
          }
        }
      }
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error in /api/analyze route:', error);
    return NextResponse.json(
      { error: 'Internal server error while processing forensic analysis.' },
      { status: 500 }
    );
  }
}
