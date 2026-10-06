import ExifReader from 'exifreader';
import { ExifReport } from './types';

/**
 * Extracts EXIF, XMP, and IPTC metadata from an image buffer or base64 string.
 */
export async function parseImageMetadata(
  imageBufferOrBase64: ArrayBuffer | string
): Promise<ExifReport> {
  try {
    let dataToParse: ArrayBuffer | Uint8Array;

    if (typeof imageBufferOrBase64 === 'string') {
      const base64Clean = imageBufferOrBase64.replace(/^data:image\/\w+;base64,/, '');
      const binaryString = atob(base64Clean);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      dataToParse = bytes;
    } else {
      dataToParse = imageBufferOrBase64;
    }

    const tags = ExifReader.load(dataToParse as any, { expanded: true }) as any;

    const rawTags: Record<string, string> = {};
    const exifGroup = tags.exif || {};
    const fileGroup = tags.file || {};
    const xmpGroup = tags.xmp || {};

    // Helper to get formatted value
    const getTag = (name: string): string | undefined => {
      if (tags[name]?.description) return String(tags[name].description);
      if (exifGroup[name]?.description) return String(exifGroup[name].description);
      if (xmpGroup[name]?.description) return String(xmpGroup[name].description);
      if (fileGroup[name]?.description) return String(fileGroup[name].description);
      return undefined;
    };

    const cameraMake = getTag('Make');
    const cameraModel = getTag('Model');
    const software = getTag('Software') || getTag('ProcessingSoftware') || getTag('CreatorTool');
    const dateTime = getTag('DateTimeOriginal') || getTag('DateTime') || getTag('CreateDate');
    const exposureTime = getTag('ExposureTime');
    const fNumber = getTag('FNumber');
    const iso = getTag('ISOSpeedRatings') || getTag('PhotographicSensitivity');
    const focalLength = getTag('FocalLength');
    const colorSpace = getTag('ColorSpace');

    const hasCameraData = Boolean(cameraMake || cameraModel || exposureTime || fNumber || iso || focalLength);
    const hasAnyMetadata = Boolean(hasCameraData || software || dateTime);

    let warning: string | undefined;
    let humanSummary = '⚠️ No camera sensor data found (typical of AI generators or images saved from social media).';

    // Check for AI software indicators
    const fullText = JSON.stringify(tags).toLowerCase();
    if (
      fullText.includes('stable diffusion') ||
      fullText.includes('midjourney') ||
      fullText.includes('comfyui') ||
      fullText.includes('automatic1111') ||
      fullText.includes('dall-e') ||
      fullText.includes('flux') ||
      fullText.includes('novelai')
    ) {
      warning = 'AI generative software signature discovered directly within embedded file metadata!';
      humanSummary = '🤖 AI Generator Signature Detected in File Metadata.';
    } else if (software && (software.toLowerCase().includes('photoshop') || software.toLowerCase().includes('gimp'))) {
      warning = `Edited using digital imaging software: ${software}`;
      humanSummary = `🎨 Image was modified in photo-editing software (${software}).`;
    } else if (hasCameraData) {
      humanSummary = `📸 Taken with a physical camera: ${cameraMake || ''} ${cameraModel || ''} ${dateTime ? `on ${dateTime}` : ''}`.trim();
    } else if (!hasAnyMetadata) {
      warning = 'Zero EXIF / Camera metadata found. Metadata was stripped or generated without camera sensor hardware tags.';
    }

    // Populate key display raw tags
    if (cameraMake) rawTags['Camera Make'] = cameraMake;
    if (cameraModel) rawTags['Camera Model'] = cameraModel;
    if (software) rawTags['Software'] = software;
    if (dateTime) rawTags['Timestamp'] = dateTime;
    if (exposureTime) rawTags['Shutter Speed'] = exposureTime;
    if (fNumber) rawTags['Aperture'] = `f/${fNumber}`;
    if (iso) rawTags['ISO'] = iso;
    if (focalLength) rawTags['Focal Length'] = focalLength;

    return {
      hasMetadata: hasAnyMetadata,
      humanSummary,
      cameraMake,
      cameraModel,
      software,
      dateTime,
      exposureTime,
      fNumber,
      iso,
      focalLength,
      colorSpace,
      warning,
      rawTags,
    };
  } catch {
    return {
      hasMetadata: false,
      humanSummary: '⚠️ Metadata unreadable or stripped from image file.',
      warning: 'Metadata unreadable or completely stripped from image container.',
      rawTags: {},
    };
  }
}
