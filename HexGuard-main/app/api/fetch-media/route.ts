import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side media proxy.
 *
 * Browsers cannot read pixels/frames from cross-origin media without CORS
 * headers (canvases get tainted, <video> fails to load), which breaks the
 * "Scan URL" flow and every remote sample preset. The proxy downloads the
 * media server-side — where CORS does not apply — and re-serves the raw
 * bytes from our own origin so client-side ELA, EXIF parsing, keyframe
 * extraction, and Ollama vision all receive real bytes.
 *
 * Users frequently paste a *page* link (Twitter post, news article, YouTube
 * watch page) instead of the direct media file. When the proxy receives
 * HTML, it extracts the page's embedded preview image (og:image /
 * twitter:image / <link rel="image_src">) and serves that instead. Media
 * served with a wrong content-type is recovered by magic-byte sniffing.
 */

const MAX_BYTES = 50 * 1024 * 1024; // keep in sync with the 50MB UI limit
const FETCH_TIMEOUT_MS = 30_000;
const HTML_SNIFF_LIMIT = 512 * 1024; // og:image lives in <head>; no need for the whole page

const ALLOWED_IMAGE_TYPES = /^image\/(png|jpe?g|webp|avif|gif|bmp|tiff?)$/i;
const ALLOWED_VIDEO_TYPES = /^video\/(mp4|webm|quicktime|x-m4v|ogg)$/i;
const STREAM_PLAYLIST_TYPES = /(mpegurl|dash\+xml|ms-sstr|f4m)/i;

const PAGE_HINT =
  'This link is a web page, not a direct image or video. ' +
  'Right-click the picture and choose "Copy image address", then paste that URL instead.';

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

/** Detects media type from magic bytes when the host sends a useless content-type. */
function sniffMediaType(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  // GIF87a/GIF89a
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'image/gif';
  // RIFF....WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp';
  // MP4/MOV ISO-BMFF: bytes 4-7 == "ftyp"
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return 'video/mp4';
  // Matroska/WebM EBML header
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return 'video/webm';
  return null;
}

/** Pulls og:image / twitter:image / image_src out of an HTML page. */
function extractEmbeddedImage(html: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if (!/(?:property|name)\s*=\s*["'](og:image(?:Secure)?|twitter:image(?:src)?)["']/i.test(tag)) continue;
    const content = tag.match(/content\s*=\s*["']([^"']+)["']/i);
    if (content?.[1]) return content[1].replace(/&amp;/g, '&').trim();
  }
  const link = (html.match(/<link\b[^>]*rel\s*=\s*["']image_src["'][^>]*>/i) || [''])[0];
  const href = link.match(/href\s*=\s*["']([^"']+)["']/i);
  return href ? href[1].replace(/&amp;/g, '&').trim() : null;
}

async function downloadMedia(parsed: URL, depth: number): Promise<NextResponse> {
  let upstream: Response;
  try {
    upstream = await fetch(parsed.toString(), {
      headers: {
        // Some CDNs (and Unsplash hotlinks) reject requests without a UA.
        'User-Agent': 'Mozilla/5.0 (compatible; HexGuardForensics/1.0)',
        Accept: 'image/*,video/*,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'TimeoutError';
    console.error('Error in /api/fetch-media route:', err);
    return jsonError(
      timedOut ? 'Timed out downloading the remote media.' : 'Failed to download the remote media.',
      502
    );
  }

  if (!upstream.ok) {
    return jsonError(`Remote host responded with HTTP ${upstream.status}.`, 502);
  }

  const rawType = (upstream.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();

  // A web page: dig out the preview image the page embeds for social shares.
  if (rawType === 'text/html' || rawType === 'application/xhtml+xml') {
    if (depth >= 1) return jsonError(PAGE_HINT, 415);

    const html = (await upstream.text()).slice(0, HTML_SNIFF_LIMIT);
    const embedded = extractEmbeddedImage(html);
    if (!embedded) return jsonError(PAGE_HINT, 415);

    let embeddedUrl: URL;
    try {
      embeddedUrl = new URL(embedded, parsed); // resolves relative og:image paths
    } catch {
      return jsonError(PAGE_HINT, 415);
    }
    if (!['http:', 'https:'].includes(embeddedUrl.protocol)) return jsonError(PAGE_HINT, 415);

    return downloadMedia(embeddedUrl, depth + 1); // one hop only
  }

  if (STREAM_PLAYLIST_TYPES.test(rawType)) {
    return jsonError(
      'This is a live-stream playlist (.m3u8/DASH). Save or record the clip as an MP4 file and upload it instead.',
      415
    );
  }

  const buffer = await upstream.arrayBuffer();
  if (buffer.byteLength === 0) {
    return jsonError('Remote host returned an empty file.', 502);
  }
  if (buffer.byteLength > MAX_BYTES) {
    return jsonError('Remote media exceeds the 50MB scan limit.', 413);
  }

  // Trust a proper content-type; otherwise recover via magic bytes.
  let mediaType = rawType;
  if (!ALLOWED_IMAGE_TYPES.test(mediaType) && !ALLOWED_VIDEO_TYPES.test(mediaType)) {
    const sniffed = sniffMediaType(new Uint8Array(buffer, 0, Math.min(64, buffer.byteLength)));
    if (sniffed) {
      mediaType = sniffed;
    } else {
      return jsonError(
        `Remote URL does not point to a supported image or video (got "${rawType || 'unknown'}").`,
        415
      );
    }
  }

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': mediaType,
      'Content-Length': String(buffer.byteLength),
      'Cache-Control': 'private, max-age=300',
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get('url');

  if (!target) {
    return jsonError('Missing "url" query parameter.', 400);
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return jsonError('Invalid URL format.', 400);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return jsonError('Only HTTP and HTTPS URLs are supported.', 400);
  }

  return downloadMedia(parsed, 0);
}
