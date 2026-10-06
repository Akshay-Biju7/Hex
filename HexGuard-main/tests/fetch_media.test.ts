import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { GET } from '../app/api/fetch-media/route';

// Minimal request builder: the route only reads req.url.
function makeRequest(url: string) {
  return new NextRequest(url);
}

// Start a tiny HTTP server that emulates remote media hosts so the route's
// upstream fetch has something real to talk to.
import http from 'node:http';

const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

describe('API Route /api/fetch-media', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeEach(async () => {
    server = http.createServer((req, res) => {
      if (req.url === '/image.png') {
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(PNG_1PX);
      } else if (req.url === '/video.mp4') {
        res.writeHead(200, { 'Content-Type': 'video/mp4' });
        res.end(Buffer.from('fake-video-bytes'));
      } else if (req.url === '/html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html></html>');
      } else if (req.url === '/notfound') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('nope');
      } else {
        res.writeHead(500);
        res.end();
      }
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const addr = server.address() as { port: number };
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  test('returns 400 when the url parameter is missing', async () => {
    const res = await GET(makeRequest('http://localhost:3000/api/fetch-media'));
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.ok(json.error.includes('Missing'));
  });

  test('returns 400 for an invalid URL', async () => {
    const res = await GET(makeRequest('http://localhost:3000/api/fetch-media?url=not-a-url'));
    assert.strictEqual(res.status, 400);
  });

  test('returns 400 for non-http protocols', async () => {
    const res = await GET(
      makeRequest(`http://localhost:3000/api/fetch-media?url=${encodeURIComponent('file:///etc/passwd')}`)
    );
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.ok(json.error.includes('HTTP and HTTPS'));
  });

  test('proxies a remote image with correct content type and bytes', async () => {
    const target = encodeURIComponent(`${baseUrl}/image.png`);
    const res = await GET(makeRequest(`http://localhost:3000/api/fetch-media?url=${target}`));
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'image/png');
    const body = Buffer.from(await res.arrayBuffer());
    assert.ok(body.length > 0);
    assert.ok(body.equals(PNG_1PX));
  });

  test('proxies a remote video with correct content type', async () => {
    const target = encodeURIComponent(`${baseUrl}/video.mp4`);
    const res = await GET(makeRequest(`http://localhost:3000/api/fetch-media?url=${target}`));
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'video/mp4');
  });

  test('returns 415 for unsupported content types', async () => {
    const target = encodeURIComponent(`${baseUrl}/html`);
    const res = await GET(makeRequest(`http://localhost:3000/api/fetch-media?url=${target}`));
    assert.strictEqual(res.status, 415);
  });

  test('returns 502 when the remote host responds with an error', async () => {
    const target = encodeURIComponent(`${baseUrl}/notfound`);
    const res = await GET(makeRequest(`http://localhost:3000/api/fetch-media?url=${target}`));
    assert.strictEqual(res.status, 502);
  });

  test('returns 502 when the remote host is unreachable', async () => {
    // Port 1 on loopback: nothing listens there (same trick as api_analyze.test.ts).
    const target = encodeURIComponent('http://127.0.0.1:1/image.png');
    const res = await GET(makeRequest(`http://localhost:3000/api/fetch-media?url=${target}`));
    assert.strictEqual(res.status, 502);
  });
});
