export type VerdictType = 
  | 'authentic'
  | 'likely_ai'
  | 'manipulated'
  | 'out_of_context'
  | 'suspicious'
  | 'inconclusive';

export type DimensionStatus = 'pass' | 'warning' | 'fail';

export interface ForensicDimension {
  title: string;
  score: number; // 0 - 100
  status: DimensionStatus;
  findings: string[];
}

export interface AnomalyItem {
  id: string;
  title: string; // Plain-English title
  technicalDetails: string; // Forensic justification
  ruleOfThumb?: string; // Subtle witty rule of thumb
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'Anatomy' | 'Optics' | 'Artifacts' | 'Semantics' | 'Metadata';
  timestampSeconds?: number; // For video timestamp linking (e.g. 3.4 for 00:03.4s)
  box?: {
    x: number; // 0 to 100 percentage
    y: number; // 0 to 100 percentage
    width: number;
    height: number;
  };
}

export interface ExifReport {
  hasMetadata: boolean;
  humanSummary: string;
  cameraMake?: string;
  cameraModel?: string;
  software?: string;
  dateTime?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: string;
  focalLength?: string;
  colorSpace?: string;
  warning?: string;
  rawTags?: Record<string, string>;
}

export interface ElaReport {
  compressionVariance: 'low' | 'medium' | 'high';
  detectedTampering: boolean;
  description: string;
  highVarianceRegionsCount: number;
}

export interface MessageTones {
  mom: string; // Specifically tailored for sending to Mom / Parents
  witty: string; // Playful / Family groups
  polite: string; // Polite & respectful
  direct: string; // Factual & direct
}

export interface OcrContext {
  hasExtractedText: boolean;
  extractedText: string; // The OCR text extracted from screenshot / meme / post
  claimedEvent?: string; // The event / story claimed in the post
  trueOrigin?: string; // The actual historical context / origin of the photo
  isMisattributed: boolean; // True if real photo was repurposed with false context
  factCheckSummary?: string; // Fact-checking explanation
}

export interface TemporalIntegrity {
  isRecycledFootage: boolean;
  earliestFoundYear?: string;
  originalContext?: string;
  explanation: string;
}

export interface VideoMetadata {
  duration: number; // in seconds
  fps?: number;
  keyframes?: string[]; // base64 or URL sampled keyframes
}

export interface ForensicReport {
  id: string;
  timestamp: string;
  fileName: string;
  fileSize: string;
  mediaType?: 'image' | 'video';
  videoMetadata?: VideoMetadata;
  dimensions: {
    width: number;
    height: number;
  };
  imageUrl: string; // for image, or representative poster frame / video URL
  videoUrl?: string; // direct video URL or blob URL when mediaType === 'video'
  elaImageUrl?: string;
  
  // Core Verdict & Scoring
  authenticityScore: number; // 0 to 100
  verdict: VerdictType;
  humanVerdict: string; // Plain English
  verdictLabel: string;
  verdictDescription: string; // Technical justification
  confidenceScore: number; // 0 - 100
  forwardRisk: 'low' | 'medium' | 'high';
  forwardRiskLabel: string;
  summary: string;
  
  // WhatsApp Shareable Tones
  familyMessage: string;
  messageTones: MessageTones;

  // Temporal Integrity (Recycled Footage check)
  temporalIntegrity?: TemporalIntegrity;

  // OCR & Out-of-Context Fact-Check
  ocrContext?: OcrContext;

  // 5 Dimensional Breakdown
  dimensionsBreakdown: {
    biological: ForensicDimension;
    optics: ForensicDimension;
    artifacts: ForensicDimension;
    semantics: ForensicDimension;
    metadata: ForensicDimension;
  };

  // Localized Anomalies
  anomalies: AnomalyItem[];

  // Hardware/File EXIF Data
  exifData: ExifReport;

  // Error Level Analysis Results
  elaData: ElaReport;

  recommendedActions: string[];
}

export interface SamplePreset {
  id: string;
  title: string;
  mediaType?: 'image' | 'video';
  category: 
    | 'AI Generated' 
    | 'Authentic Photo' 
    | 'Authentic DSLR' 
    | 'Manipulated / Spliced' 
    | 'Synthetic Art' 
    | 'Out of Context'
    | 'AI Deepfake Video'
    | 'Authentic Video'
    | 'Recycled Video';
  description: string;
  imageUrl: string;
  videoUrl?: string;
  thumbnailUrl: string;
  precomputedReport?: Partial<ForensicReport>;
}
