import { PlatformAdapter, PlatformMetadata, MediaSourceResult } from './types';
import { validateSafeUrl } from '../security';

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)($|\?|#)/i;
const IMAGE_EXT = /\.(png|jpe?g|webp|avif|gif|bmp|tiff?)($|\?|#)/i;
const STREAM_EXT = /\.(m3u8|mpd)($|\?|#)/i;

export class GenericMediaAdapter implements PlatformAdapter {
  platformName = 'Direct Media Source';

  validateUrl(url: string): boolean {
    const safety = validateSafeUrl(url);
    if (!safety.valid) return false;
    return true;
  }

  async getMetadata(url: string): Promise<PlatformMetadata> {
    const safety = validateSafeUrl(url);
    if (!safety.valid || !safety.url) {
      return {
        platform: 'generic',
        accessible: false,
        reason: safety.error || 'Invalid URL.',
      };
    }

    const pathname = safety.url.pathname.toLowerCase();
    const isVideo = VIDEO_EXT.test(pathname);
    const isImage = IMAGE_EXT.test(pathname);
    const isStream = STREAM_EXT.test(pathname);

    const filename = pathname.split('/').filter(Boolean).pop() || 'media_source';

    return {
      platform: 'generic',
      title: decodeURIComponent(filename),
      accessible: true,
      rawType: isStream ? 'stream' : isVideo ? 'video' : isImage ? 'image' : 'video',
      directMediaUrl: url,
    };
  }

  async getMediaSource(url: string): Promise<MediaSourceResult> {
    const metadata = await this.getMetadata(url);
    if (!metadata.accessible) {
      return {
        accessible: false,
        mediaType: 'image',
        metadata,
        errorMessage: metadata.reason,
      };
    }

    return {
      accessible: true,
      directMediaUrl: url,
      mediaType: metadata.rawType || 'image',
      metadata,
    };
  }
}
