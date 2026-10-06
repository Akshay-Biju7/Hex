import { test, describe } from 'node:test';
import assert from 'node:assert';
import { POST } from '../app/api/platforms/validate/route';
import { NextRequest } from 'next/server';

describe('API Route /api/platforms/validate Integration Tests', () => {
  test('returns 400 when url is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/platforms/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.ok(json.error);
  });

  test('validates YouTube URL and provides compliance error message', async () => {
    const req = new NextRequest('http://localhost:3000/api/platforms/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.platform, 'YouTube');
    assert.strictEqual(json.mediaSource.accessible, false);
    assert.ok(json.mediaSource.errorMessage.includes('Media access is not available for this source'));
  });

  test('validates Instagram URL and provides compliance error message', async () => {
    const req = new NextRequest('http://localhost:3000/api/platforms/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.instagram.com/p/C_abc123/' }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.platform, 'Instagram');
    assert.strictEqual(json.mediaSource.accessible, false);
    assert.ok(json.mediaSource.errorMessage.includes('Direct media access is unavailable for this platform'));
  });

  test('validates Generic direct media URL and reports accessible', async () => {
    const req = new NextRequest('http://localhost:3000/api/platforms/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/assets/authentic_clip.mp4' }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.platform, 'Direct Media Source');
    assert.strictEqual(json.mediaSource.accessible, true);
    assert.strictEqual(json.mediaSource.mediaType, 'video');
  });

  test('blocks SSRF attempts on internal IP addresses', async () => {
    const req = new NextRequest('http://localhost:3000/api/platforms/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://169.254.169.254/latest/meta-data' }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.ok(json.error.includes('internal network'));
  });
});
