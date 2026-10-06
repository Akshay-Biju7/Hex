import { test, describe } from 'node:test';
import assert from 'node:assert';
import { YouTubeAdapter } from '../lib/platforms/youtubeAdapter';
import { InstagramAdapter } from '../lib/platforms/instagramAdapter';
import { GenericMediaAdapter } from '../lib/platforms/genericAdapter';
import { getAdapterForUrl } from '../lib/platforms';
import { validateSafeUrl } from '../lib/security';

describe('Platform Ingestion Adapters', () => {
  const youtube = new YouTubeAdapter();
  const instagram = new InstagramAdapter();
  const generic = new GenericMediaAdapter();

  test('YouTubeAdapter detects standard and shortened YouTube URLs', () => {
    assert.strictEqual(youtube.validateUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), true);
    assert.strictEqual(youtube.validateUrl('https://youtu.be/dQw4w9WgXcQ'), true);
    assert.strictEqual(youtube.validateUrl('https://youtube.com/shorts/dQw4w9WgXcQ'), true);
    assert.strictEqual(youtube.validateUrl('https://youtube.com/live/dQw4w9WgXcQ'), true);
    assert.strictEqual(youtube.validateUrl('https://vimeo.com/12345'), false);
  });

  test('YouTubeAdapter extracts video ID accurately', () => {
    assert.strictEqual(youtube.extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
    assert.strictEqual(youtube.extractVideoId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  });

  test('YouTubeAdapter enforces compliance and shows authorized access required message', async () => {
    const res = await youtube.getMediaSource('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.strictEqual(res.accessible, false);
    assert.ok(
      res.errorMessage?.includes('Media access is not available for this source'),
      `unexpected error message: ${res.errorMessage}`
    );
  });

  test('InstagramAdapter detects standard Instagram URLs', () => {
    assert.strictEqual(instagram.validateUrl('https://www.instagram.com/p/C_abc123/'), true);
    assert.strictEqual(instagram.validateUrl('https://instagram.com/reel/C_abc123/'), true);
    assert.strictEqual(instagram.validateUrl('https://youtube.com/watch?v=123'), false);
  });

  test('InstagramAdapter returns authorized access requirement message gracefully without crashing', async () => {
    const res = await instagram.getMediaSource('https://www.instagram.com/p/C_abc123/');
    assert.strictEqual(res.accessible, false);
    assert.ok(
      res.errorMessage?.includes('Direct media access is unavailable for this platform'),
      `unexpected error message: ${res.errorMessage}`
    );
  });

  test('GenericMediaAdapter validates direct media URLs', () => {
    assert.strictEqual(generic.validateUrl('https://example.com/media/video.mp4'), true);
    assert.strictEqual(generic.validateUrl('https://example.com/media/photo.jpg'), true);
    assert.strictEqual(generic.validateUrl('ftp://example.com/file.mp4'), false);
  });

  test('getAdapterForUrl resolves the appropriate platform adapter', () => {
    assert.strictEqual(getAdapterForUrl('https://youtu.be/dQw4w9WgXcQ').platformName, 'YouTube');
    assert.strictEqual(getAdapterForUrl('https://instagram.com/p/123').platformName, 'Instagram');
    assert.strictEqual(getAdapterForUrl('https://example.com/video.mp4').platformName, 'Direct Media Source');
  });

  test('validateSafeUrl blocks invalid protocols and malicious schemas', () => {
    assert.strictEqual(validateSafeUrl('javascript:alert(1)').valid, false);
    assert.strictEqual(validateSafeUrl('file:///etc/passwd').valid, false);
    assert.strictEqual(validateSafeUrl('data:text/html,test').valid, false);
    assert.strictEqual(validateSafeUrl('https://example.com/image.jpg').valid, true);
  });
});
