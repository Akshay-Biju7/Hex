import { NextRequest, NextResponse } from 'next/server';
import { validateSafeUrl } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const youtubeId = searchParams.get('youtubeId');
    let targetUrl = searchParams.get('url');

    if (youtubeId) {
      // Validate youtube ID format (11 alphanumeric, underscore, hyphen)
      if (!/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
        return NextResponse.json({ error: 'Invalid YouTube ID format' }, { status: 400 });
      }
      targetUrl = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
    }

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing url or youtubeId parameter' }, { status: 400 });
    }

    const safety = validateSafeUrl(targetUrl);
    if (!safety.valid) {
      return NextResponse.json({ error: safety.error || 'URL violates security policy' }, { status: 403 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(6000),
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream returned status ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to proxy frame: ' + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
