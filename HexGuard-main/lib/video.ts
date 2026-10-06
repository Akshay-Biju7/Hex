/**
 * HexGuard Client-Side Video Processing & Keyframe Extractor
 * Extracts evenly-spaced high-resolution keyframes from any HTML5 compatible video.
 */

export interface VideoExtractionResult {
  duration: number; // Duration in seconds
  width: number;
  height: number;
  keyframes: {
    timestamp: number; // Time in seconds
    dataUrl: string; // JPEG Base64
  }[];
  posterFrame: string;
}

/** How long to wait for metadata / a single seek before giving up (ms). */
const LOAD_TIMEOUT_MS = 20_000;
const SEEK_TIMEOUT_MS = 10_000;

/**
 * Resolves when the video seek to `time` completes, or rejects on stall/error.
 * Some browsers never fire `seeked` for unbuffered/broken ranges — without
 * this timeout the whole analysis pipeline would hang forever.
 */
function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const done = (fn: () => void) => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      clearTimeout(timer);
      fn();
    };
    const onSeeked = () => done(resolve);
    const onError = () => done(() => reject(new Error('Video seek failed — the media may be corrupt or unsupported.')));
    const timer = setTimeout(() => done(() => reject(new Error('Timed out while seeking the video.'))), SEEK_TIMEOUT_MS);

    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });
    video.currentTime = time;
  });
}

export interface VideoExtractionOptions {
  frameCount?: number;
  sampleFps?: number;
  onProgress?: (info: { currentTime: number; duration: number; framesExtracted: number }) => void;
}

export async function extractVideoKeyframes(
  fileOrUrl: File | string,
  optionsOrFrameCount: number | VideoExtractionOptions = 6
): Promise<VideoExtractionResult> {
  const options: VideoExtractionOptions =
    typeof optionsOrFrameCount === 'number'
      ? { frameCount: optionsOrFrameCount }
      : optionsOrFrameCount;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    let objectUrl: string | null = null;
    if (typeof fileOrUrl === 'string') {
      video.src = fileOrUrl;
    } else {
      objectUrl = URL.createObjectURL(fileOrUrl);
      video.src = objectUrl;
    }

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      video.removeAttribute('src');
      video.load();
    };

    const loadTimer = setTimeout(() => {
      cleanup();
      reject(new Error('Timed out loading the video. Please ensure it is a valid MP4, WebM, or MOV file.'));
    }, LOAD_TIMEOUT_MS);

    video.onerror = () => {
      clearTimeout(loadTimer);
      cleanup();
      reject(new Error('Failed to load video file. Please ensure it is a valid MP4, WebM, or MOV file.'));
    };

    video.onloadedmetadata = async () => {
      try {
        clearTimeout(loadTimer);

        // Live streams / some WebM files report Infinity until the first seek.
        if (!Number.isFinite(video.duration)) {
          await new Promise<void>((res) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              res();
            };
            video.addEventListener('seeked', onSeeked, { once: true });
            video.currentTime = 1e101; // forces the browser to resolve real duration
            setTimeout(res, 3_000); // never block longer than this
          });
        }

        const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 10;
        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;

        // Calculate sample timestamps across the duration
        const timestamps: number[] = [];
        let requestedCount = options.frameCount || 6;
        if (options.sampleFps && options.sampleFps > 0) {
          // If sampleFps requested: sample up to max 16 frames for web performance
          requestedCount = Math.max(3, Math.min(16, Math.round(duration * options.sampleFps)));
        }

        if (duration <= 1) {
          timestamps.push(0.1);
        } else {
          for (let i = 0; i < requestedCount; i++) {
            const t = Math.min(Math.max((duration / (requestedCount + 1)) * (i + 1), 0.1), Math.max(duration - 0.1, 0.1));
            timestamps.push(Number(t.toFixed(2)));
          }
        }

        const canvas = document.createElement('canvas');
        // Cap canvas dimensions for rapid extraction & efficient bandwidth
        const maxDim = 1024;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas 2D context not supported.');
        }

        const keyframes: { timestamp: number; dataUrl: string }[] = [];

        for (let i = 0; i < timestamps.length; i++) {
          const timestamp = timestamps[i];
          try {
            await seekTo(video, timestamp);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            keyframes.push({ timestamp, dataUrl });

            if (options.onProgress) {
              options.onProgress({
                currentTime: timestamp,
                duration,
                framesExtracted: keyframes.length,
              });
            }
          } catch (e) {
            console.warn('Frame capture error at timestamp', timestamp, e);
          }
        }

        if (keyframes.length === 0) {
          throw new Error('Could not extract any frames from this video. The file may be corrupt or use an unsupported codec.');
        }

        const posterFrame = keyframes[0].dataUrl;

        cleanup();
        resolve({
          duration: Number(duration.toFixed(2)),
          width,
          height,
          keyframes,
          posterFrame,
        });
      } catch (err) {
        cleanup();
        reject(err);
      }
    };
  });
}

/**
 * Extracts a single high-resolution frame at an exact timestamp for deep forensic inspection.
 */
export async function extractFrameAtTimestamp(
  videoSrc: string,
  timestamp: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.src = videoSrc;

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
    };

    video.onloadedmetadata = async () => {
      try {
        await seekTo(video, Math.max(0.05, timestamp));
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('2D context unavailable');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
        cleanup();
        resolve(dataUrl);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to load video for frame extraction.'));
    };
  });
}

