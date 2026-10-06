/**
 * HexGuard scan-latency benchmark.
 *
 * Times analyzeMediaWithOllama end-to-end on the bundled sample image for each
 * model passed on the command line. resolveModel() honors the explicit
 * `model` input over everything else, so each run is pinned to its candidate
 * exactly as a user-pinned scan would be.
 *
 * Usage: npx tsx bench.ts [model-tag ...]   (default: 9B baseline vs 7B)
 */
import * as fs from 'fs';
import * as path from 'path';
import { analyzeMediaWithOllama } from './lib/ollama';

const SAMPLE = path.join(__dirname, 'public', 'samples', 'authentic.jpg');
const B64 = fs.readFileSync(SAMPLE).toString('base64');

const exifData = {
  hasMetadata: true,
  humanSummary: 'EXIF present: Apple iPhone 14 Pro, software iOS 16.0, 2023-06-01 10:00:00',
  cameraMake: 'Apple',
  cameraModel: 'iPhone 14 Pro',
  software: 'iOS 16.0',
  dateTime: '2023-06-01 10:00:00',
  exposureTime: '1/120',
  fNumber: 'f/1.78',
  iso: '64',
  focalLength: '6.86mm',
  colorSpace: 'sRGB',
  rawTags: {},
};

const elaData = {
  compressionVariance: 'low' as const,
  lowVarianceRegionsCount: 2,
  highVarianceRegionsCount: 1,
  detectedTampering: false,
  description: 'Low error-level variance; compression uniform across the frame.',
};

const baseInput = {
  base64Image: B64,
  mimeType: 'image/jpeg',
  fileName: 'authentic.jpg',
  fileSize: `${fs.statSync(SAMPLE).size} bytes`,
  width: 4032,
  height: 3024,
  exifData,
  elaData,
  mediaType: 'image' as const,
};

async function main(): Promise<void> {
  const candidates = process.argv.slice(2);
  const models = candidates.length
    ? candidates
    : ['tobestyledintro/qwen3.8-9b-distill:latest', 'qwen2.5vl:7b'];

  console.log(`[bench] sample=${SAMPLE} (${(B64.length / 1024).toFixed(0)} KB b64)`);
  for (const model of models) {
    const t0 = Date.now();
    try {
      const report = await analyzeMediaWithOllama({ ...baseInput, model });
      const seconds = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(
        `[bench] model=${model} elapsed=${seconds}s verdict=${report.verdict} score=${report.authenticityScore} label="${report.verdictLabel}"`
      );
    } catch (err) {
      console.error(`[bench] model=${model} FAILED after ${((Date.now() - t0) / 1000).toFixed(1)}s:`, err);
    }
  }
}

main().catch((err) => {
  console.error('[bench] failed:', err);
  process.exit(1);
});
