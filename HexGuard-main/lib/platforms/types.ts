export interface PlatformMetadata {
  platform: 'youtube' | 'instagram' | 'generic' | 'unknown';
  id?: string;
  title?: string;
  author?: string;
  thumbnailUrl?: string;
  duration?: number;
  isLive?: boolean;
  isUpcoming?: boolean;
  isCompletedLive?: boolean;
  accessible: boolean;
  reason?: string;
  directMediaUrl?: string;
  rawType?: 'video' | 'image' | 'stream';
}

export interface MediaSourceResult {
  accessible: boolean;
  directMediaUrl?: string;
  mediaType: 'video' | 'image' | 'stream';
  mimeType?: string;
  metadata: PlatformMetadata;
  errorMessage?: string;
}

export interface FrameSampleOptions {
  maxFrames?: number;
  sampleFps?: number; // e.g. 1 or 2
  deepenAroundSuspicious?: boolean;
}

export interface ExtractedFrame {
  timestamp: number;
  dataUrl: string;
  isSuspicious?: boolean;
  score?: number;
  findings?: string[];
}

export interface PlatformAdapter {
  platformName: string;
  validateUrl(url: string): boolean;
  getMetadata(url: string): Promise<PlatformMetadata>;
  getMediaSource(url: string): Promise<MediaSourceResult>;
}
