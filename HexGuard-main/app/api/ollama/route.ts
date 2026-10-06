import { NextRequest, NextResponse } from 'next/server';
import { listOllamaModels, normalizeHost } from '@/lib/ollama';

/**
 * GET /api/ollama — reports which Ollama server + pre-trained models are reachable.
 * Powers the "Local Model" indicator and model picker in the navbar.
 */
export async function GET(req: NextRequest) {
  const host = normalizeHost(req.nextUrl.searchParams.get('host') || undefined);

  try {
    const models = await listOllamaModels(host);
    return NextResponse.json({
      host,
      online: true,
      models,
      visionModels: models.filter((m) => m.hasVision).length,
    });
  } catch (error) {
    return NextResponse.json({
      host,
      online: false,
      models: [],
      visionModels: 0,
      error: error instanceof Error ? error.message : 'Ollama is not reachable.',
    });
  }
}
