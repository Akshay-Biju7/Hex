/**
 * Client-side helper that turns any media URL (remote or same-origin) into a
 * real File so every downstream engine — Canvas ELA, EXIF parsing, video
 * keyframe extraction, and the Ollama vision call — operates on actual bytes
 * instead of a URL string.
 *
 * Same-origin and blob: URLs are fetched directly; cross-origin URLs go
 * through our /api/fetch-media proxy because remote hosts rarely send the
 * CORS headers the browser would require.
 */

const PROXY_BASE = '/api/fetch-media?url=';

export interface RemoteMedia {
  file: File;
  /** True when the source was a video (by extension or served content type). */
  isVideo: boolean;
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)($|\?|#)/i;
const IMAGE_EXT = /\.(png|jpe?g|webp|avif|gif|bmp|tiff?)($|\?|#)/i;

function isVideoUrl(url: string): boolean {
  try {
    return VIDEO_EXT.test(new URL(url, window.location.href).pathname) || VIDEO_EXT.test(url);
  } catch {
    return VIDEO_EXT.test(url);
  }
}

function guessName(url: string, isVideo: boolean): string {
  try {
    const parsed = new URL(url, window.location.href);
    const last = parsed.pathname.split('/').filter(Boolean).pop();
    if (last && (IMAGE_EXT.test(last) || VIDEO_EXT.test(last))) return decodeURIComponent(last);
  } catch {
    // fall through to the generic name
  }
  return isVideo ? 'remote_video.mp4' : 'remote_image.jpg';
}

function mediaTypeFromResponse(contentType: string | null, fallbackUrl: string): string {
  if (contentType && contentType !== 'application/octet-stream' && contentType !== 'binary/octet-stream') {
    return contentType.split(';')[0].trim();
  }
  if (isVideoUrl(fallbackUrl)) return 'video/mp4';
  return 'image/jpeg';
}

/**
 * Fetches the media behind `url` and wraps it in a File.
 * Cross-origin sources are proxied server-side to avoid CORS/tainted-canvas
 * failures; same-origin (e.g. /samples/...) is fetched directly.
 */
export async function fetchMediaAsFile(url: string): Promise<RemoteMedia> {
  const trimmed = url.trim();
  const parsed = new URL(trimmed, window.location.href);
  const sameOrigin = parsed.origin === window.location.origin;
  const fetchUrl = sameOrigin
    ? parsed.toString()
    : `${PROXY_BASE}${encodeURIComponent(parsed.toString())}`;

  const res = await fetch(fetchUrl);
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) detail = body.error;
    } catch {
      // non-JSON error body — keep the HTTP status detail
    }
    throw new Error(`Could not load media from URL: ${detail}`);
  }

  const blob = await res.blob();
  if (blob.size === 0) {
    throw new Error('Could not load media from URL: the file is empty.');
  }

  const contentType = mediaTypeFromResponse(res.headers.get('content-type'), parsed.toString());
  const isVideo = contentType.startsWith('video/') || isVideoUrl(parsed.toString());
  const name = guessName(parsed.toString(), isVideo);

  return {
    file: new File([blob], name, { type: contentType }),
    isVideo,
  };
}
