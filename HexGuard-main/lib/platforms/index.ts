import { PlatformAdapter } from './types';
import { YouTubeAdapter } from './youtubeAdapter';
import { InstagramAdapter } from './instagramAdapter';
import { GenericMediaAdapter } from './genericAdapter';

export * from './types';
export * from './youtubeAdapter';
export * from './instagramAdapter';
export * from './genericAdapter';

const youtube = new YouTubeAdapter();
const instagram = new InstagramAdapter();
const generic = new GenericMediaAdapter();

export function getAdapterForUrl(url: string): PlatformAdapter {
  if (youtube.validateUrl(url)) {
    return youtube;
  }
  if (instagram.validateUrl(url)) {
    return instagram;
  }
  return generic;
}
