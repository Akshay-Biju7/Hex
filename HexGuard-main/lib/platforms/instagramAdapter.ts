import { PlatformAdapter, PlatformMetadata, MediaSourceResult } from './types';
import { validateSafeUrl } from '../security';

const INSTAGRAM_REGEX =
  /^(https?:\/\/)?(www\.)?(instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)|instagr\.am\/p\/([a-zA-Z0-9_-]+))/i;

export class InstagramAdapter implements PlatformAdapter {
  platformName = 'Instagram';

  validateUrl(url: string): boolean {
    const safety = validateSafeUrl(url);
    if (!safety.valid) return false;
    return INSTAGRAM_REGEX.test(url.trim());
  }

  extractPostId(url: string): string | null {
    const match = url.trim().match(INSTAGRAM_REGEX);
    return match ? match[5] || match[6] || null : null;
  }

  async getMetadata(url: string): Promise<PlatformMetadata> {
    const postId = this.extractPostId(url);
    if (!postId) {
      return {
        platform: 'instagram',
        accessible: false,
        reason: 'Invalid Instagram URL or post identifier.',
      };
    }

    // Instagram strictly gates media access behind Meta Graph API with User Access Tokens.
    // If no Meta token is configured in the environment, report structured metadata.
    return {
      platform: 'instagram',
      id: postId,
      title: `Instagram Post [${postId}]`,
      accessible: true,
      rawType: url.includes('/reel/') ? 'video' : 'image',
    };
  }

  async getMediaSource(url: string): Promise<MediaSourceResult> {
    const metadata = await this.getMetadata(url);

    // Instagram content requires authenticated API tokens or authorized business integration.
    // Under HexGuard compliance rules, we do not scrape or bypass access controls.
    return {
      accessible: false,
      mediaType: metadata.rawType === 'video' ? 'video' : 'image',
      metadata,
      errorMessage:
        'Direct media access is unavailable for this platform. Please provide an authorized media source.',
    };
  }
}
