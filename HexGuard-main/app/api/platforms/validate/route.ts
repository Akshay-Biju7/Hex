import { NextRequest, NextResponse } from 'next/server';
import { validateSafeUrl } from '@/lib/security';
import { getAdapterForUrl } from '@/lib/platforms';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "url" field.' }, { status: 400 });
    }

    const safe = validateSafeUrl(url);
    if (!safe.valid) {
      return NextResponse.json({ error: safe.error || 'Invalid URL' }, { status: 400 });
    }

    const adapter = getAdapterForUrl(url);
    const mediaSource = await adapter.getMediaSource(url);

    return NextResponse.json({
      platform: adapter.platformName,
      mediaSource,
    });
  } catch (err) {
    console.error('Error in /api/platforms/validate:', err);
    return NextResponse.json(
      { error: 'An error occurred while validating the platform URL.' },
      { status: 500 }
    );
  }
}
