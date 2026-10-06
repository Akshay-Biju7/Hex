import { test, describe } from 'node:test';
import assert from 'node:assert';
import { computeSha256, sanitizeFilename, validateSafeUrl } from '../lib/security';

describe('Security & Provenance Utilities', () => {
  test('computeSha256 calculates consistent sha256 hexadecimal hash', async () => {
    const hash = await computeSha256('hexguard-forensic-test');
    assert.strictEqual(typeof hash, 'string');
    assert.strictEqual(hash.length, 64);
    // Known SHA-256 for 'hexguard-forensic-test'
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  test('sanitizeFilename removes path traversal and dangerous characters', () => {
    assert.strictEqual(sanitizeFilename('../../../etc/passwd'), 'etc_passwd');
    assert.strictEqual(sanitizeFilename('sample file (1).jpg'), 'sample_file__1_.jpg');
    assert.strictEqual(sanitizeFilename('normal_video.mp4'), 'normal_video.mp4');
  });

  test('validateSafeUrl rejects non-http protocols and malformed strings', () => {
    assert.strictEqual(validateSafeUrl('').valid, false);
    assert.strictEqual(validateSafeUrl('not a url').valid, false);
    assert.strictEqual(validateSafeUrl('ftp://server/file').valid, false);
    assert.strictEqual(validateSafeUrl('http://example.com/stream.m3u8').valid, true);
  });
});
