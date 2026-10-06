import { NextRequest, NextResponse } from 'next/server';
import { validateSafeUrl } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const youtubeId = searchParams.get('youtubeId');
    let targetUrl = searchParams.get('url');

    const candidateUrls: string[] = [];
    if (youtubeId) {
      if (!/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
        return NextResponse.json({ error: 'Invalid YouTube ID format' }, { status: 400 });
      }
      candidateUrls.push(
        `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
        `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
        `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`,
        `https://i.ytimg.com/vi/${youtubeId}/default.jpg`
      );
    } else if (targetUrl) {
      candidateUrls.push(targetUrl);
    }

    if (candidateUrls.length === 0) {
      return NextResponse.json({ error: 'Missing url or youtubeId parameter' }, { status: 400 });
    }

    let response: Response | null = null;
    for (const url of candidateUrls) {
      const safety = validateSafeUrl(url);
      if (!safety.valid) continue;

      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          },
          signal: AbortSignal.timeout(4000),
          cache: 'no-store',
        });
        if (res.ok) {
          response = res;
          break;
        }
      } catch {
        // Continue to next candidate thumbnail
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        { error: 'Upstream video frame thumbnail not accessible' },
        { status: 404 }
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
