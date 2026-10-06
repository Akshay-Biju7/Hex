import { test, describe } from 'node:test';
import assert from 'node:assert';

// Point the engine at a port nothing listens on so these tests exercise the
// deterministic heuristic path instead of the live local model.
// (tests/ollama_live.test.ts covers the real Ollama round-trip.)
process.env.OLLAMA_HOST = 'http://127.0.0.1:1';
delete process.env.OLLAMA_MODEL;

import {
  analyzeMediaWithOllama,
  generateFallbackForensicReport,
  normalizeHost,
  listOllamaModels,
} from '../lib/ollama';
import { ExifReport, ElaReport } from '../lib/types';

const defaultExif: ExifReport = {
  hasMetadata: true,
  humanSummary: 'Taken with Canon EOS 5D Mark IV',
  cameraMake: 'Canon',
  cameraModel: 'EOS 5D Mark IV',
  rawTags: { 'Camera Make': 'Canon' },
};

const noExif: ExifReport = {
  hasMetadata: false,
  humanSummary: 'No camera sensor data found in file.',
  rawTags: {},
};

const normalEla: ElaReport = {
  compressionVariance: 'low',
  detectedTampering: false,
  description: 'Standard baseline compression error rate.',
  highVarianceRegionsCount: 0,
};

const splicedEla: ElaReport = {
  compressionVariance: 'high',
  detectedTampering: true,
  description: 'High compression variance indicating digital splicing.',
  highVarianceRegionsCount: 4,
};

describe('Ollama connection helpers', () => {
  test('normalizeHost falls back to the default local daemon for invalid input', () => {
    // Save/restore: normalizeHost reads OLLAMA_HOST, which this file sets to a
    // dead port at import time so the heuristic fallback path stays deterministic.
    const saved = process.env.OLLAMA_HOST;
    delete process.env.OLLAMA_HOST;
    try {
      assert.strictEqual(normalizeHost('ftp://evil'), 'http://127.0.0.1:11434');
      assert.strictEqual(normalizeHost('javascript:alert(1)'), 'http://127.0.0.1:11434');
      assert.strictEqual(normalizeHost(''), 'http://127.0.0.1:11434');
    } finally {
      if (saved !== undefined) process.env.OLLAMA_HOST = saved;
    }
  });

  test('normalizeHost accepts and trims a valid http(s) URL', () => {
    assert.strictEqual(normalizeHost('http://127.0.0.1:11434/'), 'http://127.0.0.1:11434');
    assert.strictEqual(normalizeHost('https://ollama.internal:11434'), 'https://ollama.internal:11434');
  });

  test('listOllamaModels rejects an unreachable server', async () => {
    await assert.rejects(() => listOllamaModels('http://127.0.0.1:1'));
  });
});

describe('Ollama Forensics Engine & Heuristic Fallback Tests', () => {
  test('should generate authentic verdict for images with valid EXIF and normal ELA', async () => {
    const report = await analyzeMediaWithOllama({
      base64Image: 'data:image/jpeg;base64,samplebase64',
      mimeType: 'image/jpeg',
      fileName: 'authentic_test.jpg',
      fileSize: '2.5 MB',
      width: 1920,
      height: 1080,
      exifData: defaultExif,
      elaData: normalEla,
    });

    assert.ok(report.id.startsWith('rep-'));
    assert.strictEqual(typeof report.authenticityScore, 'number');
    assert.ok(report.authenticityScore >= 50);
    assert.strictEqual(report.forwardRisk, 'low');
    assert.strictEqual(report.verdict, 'authentic');
    assert.ok(report.dimensionsBreakdown.biological.score > 0);
    assert.ok(report.dimensionsBreakdown.optics.score > 0);
  });

  test('should flag manipulated verdict when high ELA compression variance is present', async () => {
    const report = await analyzeMediaWithOllama({
      base64Image: 'data:image/jpeg;base64,samplebase64',
      mimeType: 'image/jpeg',
      fileName: 'photoshopped.jpg',
      fileSize: '1.2 MB',
      width: 800,
      height: 600,
      exifData: noExif,
      elaData: splicedEla,
    });

    assert.strictEqual(report.verdict, 'manipulated');
    assert.strictEqual(report.forwardRisk, 'medium');
    assert.ok(report.authenticityScore < 50);
    assert.ok(report.anomalies.length > 0);
    assert.strictEqual(report.dimensionsBreakdown.artifacts.status, 'fail');
  });

  test('should detect AI generation patterns when metadata is stripped and dimensions match diffusion grids', async () => {
    const report = await analyzeMediaWithOllama({
      base64Image: 'data:image/jpeg;base64,samplebase64',
      mimeType: 'image/jpeg',
      fileName: 'midjourney_render.jpg',
      fileSize: '1.0 MB',
      width: 1024,
      height: 1024,
      exifData: noExif,
      elaData: normalEla,
    });

    assert.strictEqual(report.verdict, 'likely_ai');
    assert.strictEqual(report.forwardRisk, 'high');
    assert.ok(report.authenticityScore < 50);
    assert.ok(report.humanVerdict.includes('AI'));
  });

  test('should correctly populate message tones for WhatsApp debunks', async () => {
    const report = await analyzeMediaWithOllama({
      base64Image: 'data:image/jpeg;base64,samplebase64',
      mimeType: 'image/jpeg',
      fileName: 'family_forward.jpg',
      fileSize: '500 KB',
      width: 1024,
      height: 1024,
      exifData: noExif,
      elaData: normalEla,
    });

    assert.ok(report.messageTones.mom.length > 0);
    assert.ok(report.messageTones.witty.length > 0);
    assert.ok(report.messageTones.polite.length > 0);
    assert.ok(report.messageTones.direct.length > 0);
    assert.ok(report.familyMessage.length > 0);
  });

  test('should support video metadata and mediaType', async () => {
    const report = await analyzeMediaWithOllama({
      base64Image: 'data:image/jpeg;base64,sampleposter',
      mimeType: 'video/mp4',
      fileName: 'deepfake_speech.mp4',
      fileSize: '8.4 MB',
      width: 1280,
      height: 720,
      mediaType: 'video',
      videoMetadata: {
        duration: 14.5,
        fps: 30,
      },
      exifData: noExif,
      elaData: normalEla,
    });

    assert.strictEqual(report.mediaType, 'video');
    assert.ok(report.videoMetadata);
    assert.strictEqual(report.videoMetadata?.duration, 14.5);
  });

  test('should survive a malformed model response by falling back to heuristics', () => {
    const report = generateFallbackForensicReport({
      base64Image: 'data:image/jpeg;base64,abc',
      mimeType: 'image/jpeg',
      fileName: 'x.jpg',
      fileSize: '1 KB',
      width: 999,
      height: 777,
      exifData: defaultExif,
      elaData: normalEla,
    });

    assert.strictEqual(report.verdict, 'authentic');
    assert.strictEqual(report.mediaType, 'image');
    assert.strictEqual(report.exifData.cameraMake, 'Canon');
    assert.strictEqual(report.elaData.compressionVariance, 'low');
    assert.ok(report.recommendedActions.length > 0);
  });
});
