import { test, describe } from 'node:test';
import assert from 'node:assert';
import { parseImageMetadata } from '../lib/exif';

describe('EXIF & Camera Provenance Parser Tests', () => {
  test('should return default fallback when given empty or invalid data URL', async () => {
    const result = await parseImageMetadata('');
    assert.strictEqual(result.hasMetadata, false);
    assert.ok(result.humanSummary.length > 0);
  });

  test('should gracefully handle invalid base64 image data without throwing', async () => {
    const invalidBase64 = 'data:image/jpeg;base64,invalid_base64_data_string';
    const result = await parseImageMetadata(invalidBase64);
    assert.strictEqual(result.hasMetadata, false);
    assert.strictEqual(typeof result.humanSummary, 'string');
  });

  test('should return structured ExifReport shape with all expected fields', async () => {
    const dummyDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    const result = await parseImageMetadata(dummyDataUrl);
    
    assert.ok('hasMetadata' in result);
    assert.ok('humanSummary' in result);
    assert.ok('rawTags' in result);
    assert.strictEqual(typeof result.hasMetadata, 'boolean');
    assert.strictEqual(typeof result.rawTags, 'object');
  });
});
