import { test, describe } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextRequest } from 'next/server';

// Keep the rest of the suite deterministic: this file is the only place that
// talks to the real local Ollama daemon.
delete process.env.OLLAMA_HOST;
delete process.env.OLLAMA_MODEL;

const OLLAMA_URL = 'http://127.0.0.1:11434';
const samplePath = resolve(__dirname, '../public/samples/authentic.jpg');
const dataUrl = `data:image/jpeg;base64,${readFileSync(samplePath).toString('base64')}`;

/** Memoised health probe so every test can decide independently whether to skip. */
let probe: Promise<boolean> | null = null;
function ensureOllamaOnline(): Promise<boolean> {
  if (!probe) {
    probe = (async () => {
      try {
        const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
        const data = (await res.json()) as { models?: unknown[] };
        if (!Array.isArray(data.models) || data.models.length === 0) return false;
        return true;
      } catch {
        return false;
      }
    })();
  }
  return probe;
}

/** Sentinel for the heuristic fallback's canned summary — the model never emits it. */
const HEURISTIC_SUMMARY_PREFIX = 'HexGuard Forensic Scanner evaluated';

describe('Live Ollama integration', () => {
  test('GET /api/ollama reports the daemon as online with installed models', async (t) => {
    if (!(await ensureOllamaOnline())) {
      t.skip(`Ollama is not reachable at ${OLLAMA_URL} — start it with \`ollama serve\``);
      return;
    }

    const { GET } = await import('../app/api/ollama/route');
    const res = await GET(new NextRequest('http://localhost:3000/api/ollama'));
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.online, true);
    assert.ok(Array.isArray(json.models));
    assert.ok(json.models.length > 0);
    assert.ok(
      json.models.some((m: { hasVision: boolean }) => m.hasVision),
      'expected at least one vision-capable pre-trained model to be installed'
    );
  });

  test('POST /api/analyze runs the image through the local pre-trained model end-to-end', async (t) => {
    if (!(await ensureOllamaOnline())) {
      t.skip(`Ollama is not reachable at ${OLLAMA_URL} — start it with \`ollama serve\``);
      return;
    }

    const { POST } = await import('../app/api/analyze/route');
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Image: dataUrl,
        mimeType: 'image/jpeg',
        fileName: 'authentic.jpg',
        fileSize: '200 KB',
        width: 1280,
        height: 853,
      }),
    });

    const started = Date.now();
    const response = await POST(req);
    const elapsedMs = Date.now() - started;
    const report = await response.json();

    assert.strictEqual(response.status, 200, JSON.stringify(report).slice(0, 400));
    assert.ok(report.id.startsWith('rep-'));
    assert.ok(
      ['authentic', 'likely_ai', 'manipulated', 'out_of_context', 'suspicious', 'inconclusive'].includes(report.verdict),
      `unexpected verdict: ${report.verdict}`
    );
    assert.strictEqual(typeof report.authenticityScore, 'number');
    assert.ok(report.authenticityScore >= 0 && report.authenticityScore <= 100);
    assert.ok(report.humanVerdict.length > 0);
    assert.ok(report.summary.length > 0);
    assert.ok(report.messageTones.mom.length > 0);
    assert.ok(Array.isArray(report.anomalies));
    assert.ok(report.dimensionsBreakdown.metadata.title.length > 0);
    assert.ok(report.exifData);

    // Prove the model actually answered rather than the heuristic fallback.
    assert.ok(
      !report.summary.startsWith(HEURISTIC_SUMMARY_PREFIX),
      'analysis silently fell back to the heuristic engine instead of calling Ollama'
    );

    console.log(
      `[ollama_live] verdict=${report.verdict} score=${report.authenticityScore} in ${(elapsedMs / 1000).toFixed(1)}s`
    );
  });
});
