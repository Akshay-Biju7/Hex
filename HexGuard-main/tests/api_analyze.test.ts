import { test, describe } from 'node:test';
import assert from 'node:assert';
import { POST } from '../app/api/analyze/route';
import { NextRequest } from 'next/server';

// Keep this suite deterministic and fast: point the analyzer at a port nothing
// listens on so the heuristic fallback answers instead of the live model.
// (tests/ollama_live.test.ts covers the real Ollama round-trip.)
process.env.OLLAMA_HOST = 'http://127.0.0.1:1';
delete process.env.OLLAMA_MODEL;

describe('API Route /api/analyze Integration Tests', () => {
  test('should return 400 when media payload is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    assert.strictEqual(response.status, 400);

    const json = await response.json();
    assert.ok(json.error);
    assert.ok(json.error.includes('Missing media payload'));
  });

  test('should process valid image payload and return a complete ForensicReport', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
        fileName: 'test_photo.jpg',
        fileSize: '1.2 MB',
        width: 1024,
        height: 768,
        mimeType: 'image/jpeg',
      }),
    });

    const response = await POST(req);
    assert.strictEqual(response.status, 200);

    const report = await response.json();
    assert.ok(report.id);
    assert.strictEqual(typeof report.authenticityScore, 'number');
    assert.ok(report.verdict);
    assert.ok(report.humanVerdict);
    assert.ok(report.summary);
    assert.ok(report.dimensionsBreakdown);
    assert.ok(report.dimensionsBreakdown.biological);
    assert.ok(report.dimensionsBreakdown.optics);
    assert.ok(report.dimensionsBreakdown.artifacts);
    assert.ok(report.dimensionsBreakdown.semantics);
    assert.ok(report.dimensionsBreakdown.metadata);
    assert.ok(Array.isArray(report.anomalies));
    assert.ok(report.messageTones);
  });

  test('should process video keyframe payload and return a video ForensicReport', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaType: 'video',
        fileName: 'viral_clip.mp4',
        fileSize: '4.5 MB',
        width: 1280,
        height: 720,
        mimeType: 'video/mp4',
        videoMetadata: {
          duration: 12.0,
          fps: 30,
        },
        keyframes: [
          { timestamp: 0.1, dataUrl: 'data:image/jpeg;base64,frame1' },
          { timestamp: 3.0, dataUrl: 'data:image/jpeg;base64,frame2' },
          { timestamp: 6.0, dataUrl: 'data:image/jpeg;base64,frame3' },
        ],
      }),
    });

    const response = await POST(req);
    assert.strictEqual(response.status, 200);

    const report = await response.json();
    assert.ok(report.id);
    assert.strictEqual(report.mediaType, 'video');
    assert.ok(report.videoMetadata);
    assert.strictEqual(report.videoMetadata.duration, 12.0);
    assert.strictEqual(typeof report.authenticityScore, 'number');
  });
});
