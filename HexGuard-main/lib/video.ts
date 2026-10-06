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

export async function extractVideoKeyframes(
  fileOrUrl: File | string,
  frameCount: number = 5
): Promise<VideoExtractionResult> {
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
      video.remove();
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to load video file. Please ensure it is a valid MP4, WebM, or MOV file.'));
    };

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 1;
        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;

        // Calculate sample timestamps across the duration
        const timestamps: number[] = [];
        if (duration <= 1) {
          timestamps.push(0.1);
        } else {
          for (let i = 0; i < frameCount; i++) {
            const t = Math.min(Math.max((duration / (frameCount + 1)) * (i + 1), 0.1), Math.max(duration - 0.1, 0.1));
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

        for (const timestamp of timestamps) {
          await new Promise<void>((resSeek) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              try {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                keyframes.push({
                  timestamp,
                  dataUrl,
                });
              } catch (e) {
                console.warn('Frame capture error at timestamp', timestamp, e);
              }
              resSeek();
            };

            video.addEventListener('seeked', onSeeked);
            video.currentTime = timestamp;
          });
        }

        const posterFrame = keyframes.length > 0 ? keyframes[0].dataUrl : '';

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
