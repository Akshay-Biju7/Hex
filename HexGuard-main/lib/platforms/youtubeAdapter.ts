import { PlatformAdapter, PlatformMetadata, MediaSourceResult } from './types';
import { validateSafeUrl } from '../security';

const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

export class YouTubeAdapter implements PlatformAdapter {
  platformName = 'YouTube';

  validateUrl(url: string): boolean {
    const safety = validateSafeUrl(url);
    if (!safety.valid) return false;
    return YOUTUBE_REGEX.test(url.trim());
  }

  extractVideoId(url: string): string | null {
    const match = url.trim().match(YOUTUBE_REGEX);
    return match ? match[5] : null;
  }

  async getMetadata(url: string): Promise<PlatformMetadata> {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      return {
        platform: 'youtube',
        accessible: false,
        reason: 'Invalid YouTube video URL or ID.',
      };
    }

    try {
      // 1. Fetch authorized metadata via YouTube oEmbed (official, rate-limit friendly, authorized)
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const res = await fetch(oembedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HexGuardForensics/1.0)' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        if (res.status === 404 || res.status === 401) {
          return {
            platform: 'youtube',
            id: videoId,
            accessible: false,
            reason: 'This YouTube video is private, deleted, or region-restricted.',
          };
        }
        return {
          platform: 'youtube',
          id: videoId,
          accessible: false,
          reason: 'Unable to reach YouTube authorized oEmbed API.',
        };
      }

      const oembed = (await res.json()) as {
        title?: string;
        author_name?: string;
        thumbnail_url?: string;
      };

      // Check if URL indicates a live stream
      const isLiveUrl = url.includes('/live/') || url.includes('live=1');

      return {
        platform: 'youtube',
        id: videoId,
        title: oembed.title || `YouTube Video [${videoId}]`,
        author: oembed.author_name || 'YouTube Creator',
        thumbnailUrl: oembed.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        isLive: isLiveUrl,
        isUpcoming: false,
        isCompletedLive: false,
        accessible: true,
        rawType: isLiveUrl ? 'stream' : 'video',
      };
    } catch (err) {
      return {
        platform: 'youtube',
        id: videoId,
        accessible: false,
        reason: 'Error retrieving YouTube authorized metadata: ' + (err instanceof Error ? err.message : String(err)),
      };
    }
  }

  async getMediaSource(url: string): Promise<MediaSourceResult> {
    const metadata = await this.getMetadata(url);

    if (!metadata.accessible) {
      return {
        accessible: false,
        mediaType: 'video',
        metadata,
        errorMessage: metadata.reason || 'This content cannot be accessed. Please provide an authorized media source.',
      };
    }

    // Official Policy Compliance:
    // YouTube terms of service forbid unauthorized extraction/scraping of raw video streams.
    // If the caller has a direct licensed stream or if raw media access is not available via configured API:
    // Display the strict required message per HexGuard specifications.
    return {
      accessible: false,
      mediaType: metadata.isLive ? 'stream' : 'video',
      metadata,
      errorMessage:
        'Media access is not available for this source. Please provide an authorized media source or use LiveGuard with a supported stream input.',
    };
  }
}
