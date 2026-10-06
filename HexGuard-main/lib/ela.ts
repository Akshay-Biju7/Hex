import { ElaReport } from './types';

/**
 * Computes Error Level Analysis (ELA) on an image using HTML5 Canvas.
 * ELA highlights differences in compression levels across an image.
 * Resaved/spliced areas will show higher error rates and glow differently from the background.
 */
export async function generateELA(
  imageSource: string | HTMLImageElement,
  scale: number = 20,
  quality: number = 0.90
): Promise<{ elaImageUrl: string; elaReport: ElaReport }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        // Canvas 1: Original Image
        const origCanvas = document.createElement('canvas');
        origCanvas.width = width;
        origCanvas.height = height;
        const origCtx = origCanvas.getContext('2d');
        if (!origCtx) throw new Error('Could not get 2D context for original canvas');

        origCtx.drawImage(img, 0, 0, width, height);
        const origData = origCtx.getImageData(0, 0, width, height);

        // Convert original to JPEG at given compression quality
        const compressedDataUrl = origCanvas.toDataURL('image/jpeg', quality);

        // Canvas 2: Compressed Image
        const compImg = new Image();
        compImg.onload = () => {
          try {
            const compCanvas = document.createElement('canvas');
            compCanvas.width = width;
            compCanvas.height = height;
            const compCtx = compCanvas.getContext('2d');
            if (!compCtx) throw new Error('Could not get 2D context for compressed canvas');

            compCtx.drawImage(compImg, 0, 0, width, height);
            const compData = compCtx.getImageData(0, 0, width, height);

            // Canvas 3: ELA Difference Canvas
            const diffCanvas = document.createElement('canvas');
            diffCanvas.width = width;
            diffCanvas.height = height;
            const diffCtx = diffCanvas.getContext('2d');
            if (!diffCtx) throw new Error('Could not get 2D context for diff canvas');

            const diffData = diffCtx.createImageData(width, height);

            let totalDiff = 0;
            let maxDiff = 0;
            let highVarianceCount = 0;
            const pixelCount = width * height;

            for (let i = 0; i < origData.data.length; i += 4) {
              const rDiff = Math.abs(origData.data[i] - compData.data[i]) * scale;
              const gDiff = Math.abs(origData.data[i + 1] - compData.data[i + 1]) * scale;
              const bDiff = Math.abs(origData.data[i + 2] - compData.data[i + 2]) * scale;

              const avgPixelDiff = (rDiff + gDiff + bDiff) / 3;
              totalDiff += avgPixelDiff;
              if (avgPixelDiff > maxDiff) maxDiff = avgPixelDiff;
              if (avgPixelDiff > 80) highVarianceCount++;

              // Output amplified difference with cyber-forensic high-contrast styling
              diffData.data[i] = Math.min(255, rDiff);
              diffData.data[i + 1] = Math.min(255, gDiff);
              diffData.data[i + 2] = Math.min(255, bDiff);
              diffData.data[i + 3] = 255; // Alpha
            }

            diffCtx.putImageData(diffData, 0, 0);
            const elaImageUrl = diffCanvas.toDataURL('image/png');

            const avgError = totalDiff / pixelCount;
            const varianceRatio = highVarianceCount / pixelCount;

            let compressionVariance: 'low' | 'medium' | 'high' = 'low';
            let detectedTampering = false;
            let description = 'Error levels are uniformly distributed, typical of an uncompressed original or uniformly generated render.';

            if (varianceRatio > 0.15 || maxDiff > 220) {
              compressionVariance = 'high';
              detectedTampering = true;
              description = 'Significant localized compression variance detected. Highlighted high-frequency regions suggest digital splicing, inpainting, or composite elements.';
            } else if (varianceRatio > 0.05 || avgError > 25) {
              compressionVariance = 'medium';
              description = 'Moderate error level fluctuations observed across edges and textures. Consistent with multi-generation recompression or subtle sharpening.';
            }

            const elaReport: ElaReport = {
              compressionVariance,
              detectedTampering,
              description,
              highVarianceRegionsCount: highVarianceCount,
            };

            resolve({ elaImageUrl, elaReport });
          } catch (err) {
            reject(err);
          }
        };

        compImg.onerror = (e) => reject(e);
        compImg.src = compressedDataUrl;
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => reject(e);

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      img.src = imageSource.src;
    }
  });
}
