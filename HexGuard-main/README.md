# 🔍 HexGuard — AI Media Verification Platform

> **HexGuard** is an advanced, GenAI-powered media verification platform engineered for hackathon speed and forensic depth. It allows users to drag & drop any image to receive a comprehensive, structured forensic report detailing whether the media is **AI-generated**, **digitally manipulated/spliced**, or an **authentic photograph**.

---

## 🎯 Core Objectives & Fast 3-Hour Scope

1. **Instant Drag-and-Drop & Sample Testing**:
   - Seamless upload via drag & drop, file picker, clipboard paste (`Ctrl+V`), or **1-click Judge Presets** (AI portraits, real DSLR captures, photoshopped news, synthetic art).
2. **Private Multi-Modal AI Reasoning (100% Local)**:
   - Powered by a **pre-trained vision model served by [Ollama](https://ollama.com)** with JSON-constrained output. Nothing ever leaves your machine — no API key, no cloud calls, no per-scan cost.
3. **5-Dimension Forensic Inspection Engine**:
   - **Biological / Anatomy**: Skin pores, cornea reflections, earlobe structure, hair consistency, teeth geometry.
   - **Optics & Physics**: Shadow angles, light source consistency, specular reflections, perspective vanishing points.
   - **Diffusion & Generative Artifacts**: Checkerboard noise, frequency smoothing, synthetic blur, edge haloing.
   - **Semantic & Textual Integrity**: Background gibberish, impossible geometry, non-existent logos.
   - **Metadata & Provenance**: EXIF inspection, camera/lens tags, editing software fingerprints.
4. **Interactive Forensics Visualizer**:
   - **Error Level Analysis (ELA)** viewer on HTML5 Canvas (detects compression variance & splicing).
   - **Split Slider & Loupe Inspector** (Original vs ELA vs Anomaly map).
5. **Verdict Scorecard & Export**:
   - **Authenticity Score (0–100%)** with confidence meter and clear verdict badge (`Authentic`, `Likely AI-Generated`, `Digitally Manipulated`, `Suspicious / Misattributed`).
   - Printable / Exportable Verification Certificate.

---

## 🏗️ Architecture & Technology Stack

```
HexGuard (Next.js 15 Full-Stack App)
│
├── 🎨 Frontend (UI / UX)
│   ├── Next.js 15 App Router + TypeScript + Tailwind CSS
│   ├── Lucide Icons + Cyber-Forensic Dark Mode Theme
│   ├── HTML5 Canvas Error Level Analysis (ELA) Engine (Client-side, 0 latency)
│   └── Split-view image comparison & Interactive Loupe
│
└── ⚡ Backend & Forensic Engine
    ├── Next.js Route Handlers (/api/analyze, /api/ollama)
    ├── Ollama REST API (/api/chat, format:"json") calling a local pre-trained vision model
    ├── Deterministic response normalizers + smart heuristic fallback when Ollama is offline
    └── EXIF / C2PA Metadata Extraction (exifreader)
```

---

## 🚀 Step-by-Step Implementation Roadmap

- [x] **Phase 1: Architecture & Planning**: Formulate lean, zero-slop architecture plan.
- [x] **Phase 2: Project Scaffolding**: Setup Next.js App Router, Tailwind CSS, TypeScript, and install dependencies (`@google/genai`, `lucide-react`, `exifreader`, `canvas-confetti`).
- [x] **Phase 3: Core Forensic Engines**:
  - `lib/types.ts` (Comprehensive forensic report typing for images & videos).
  - `lib/video.ts` (Client-side keyframe extractor & temporal analyzer).
  - `lib/ela.ts` (Canvas-based Error Level Analysis).
  - `lib/exif.ts` (Instant camera hardware tag & provenance parsing).
  - `lib/ollama.ts` & `app/api/analyze/route.ts` (Local Ollama Vision & Video AI Reasoning with heuristic fallback) + `app/api/ollama/route.ts` (model/server discovery).
  - Benchmarks in `lib/samples.ts`.
- [x] **Phase 4: UI / UX Build**:
  - `components/Navbar.tsx` with live status indicator & API key configuration modal.
  - `components/ImageDropzone.tsx` with multi-media drag & drop (photos & videos) and URL intake.
  - `components/AnalysisScanner.tsx` with radar scanning animation & real-time telemetry steps.
  - `components/ReportView.tsx` with Authenticity Score radial meter, Verdict badge, and Temporal Contradiction alerts.
  - `components/ForensicInspector.tsx` with interactive video scrubber timeline & split-screen ELA comparison.
  - `components/EvidenceBreakdown.tsx` & `components/AnomalyCards.tsx` detailing flagged evidence with severity ratings & video timestamps.
  - `components/ExportReport.tsx` for printable verification certificate and 1-click WhatsApp message debunks.
- [x] **Phase 5: Automated Test Suite & Production Build**:
  - 17 unit & integration tests covering EXIF parsing, Ollama connection helpers, heuristic fallbacks, `/api/analyze` routes, and a **live** end-to-end scan against the local model.

---

## 🧪 Running Automated Tests

Run the full backend test suite (the live Ollama tests skip automatically when the daemon is offline):
```bash
npm test
```

---

## 🦙 Local Model Setup (Ollama)

1. Install [Ollama](https://ollama.com/download) and pull a **vision-capable** pre-trained model:
   ```bash
   ollama pull tobestyledintro/qwen3.8-9b-distill:latest   # default — stronger reasoning (9B)
   # or, for faster scans on laptops:
   ollama pull qwen2.5vl:7b
   ```
2. Start the daemon (`ollama serve` — it usually auto-starts on Windows/macOS).
3. Launch HexGuard — the navbar status pill shows the detected model. Click **Local Model** to pick a
   specific one or point at a remote Ollama host (e.g. `http://192.168.1.10:11434`).

HexGuard auto-selects the first installed model advertising the `vision` capability. Optional env overrides
in `.env.local`:

```env
OLLAMA_HOST=http://127.0.0.1:11434   # default daemon address
OLLAMA_MODEL=tobestyledintro/qwen3.8-9b-distill:latest   # pin a specific model
OLLAMA_TIMEOUT_MS=240000             # hard client timeout per scan
OLLAMA_NUM_PREDICT=1200              # max tokens the model may generate
```

> ⏱️ **Latency note:** on a 6 GB laptop GPU (RTX 4050), the default 9B `qwen3.8-9b-distill` scans the bundled sample in
> ~189 s; the lighter `qwen2.5vl:7b` alternative takes ~90–100 s warm (~146 s on the very first cold load). Smaller
> quantizations trade accuracy for speed. The UI keeps the radar animation running for the whole inference. If Ollama
> is unreachable, HexGuard transparently falls back to its deterministic EXIF + ELA heuristic engine so the demo never dies.

---

## 🛰️ Extended Media Ingestion & LiveGuard Architecture

HexGuard provides a tri-modal ingestion pipeline:

```
                    HEXGUARD
                        │
          ┌─────────────┼─────────────┐
          │             │             │
      FILE MODE      URL MODE      LIVEGUARD
          │             │             │
          │       Platform Adapter    │
          │             │             │
          │       Media Ingestion     │
          │             │             │
          └─────────────┼─────────────┘
                        ↓
                 MEDIA PROCESSING
                        ↓
                 FRAME EXTRACTION
                        ↓
              ┌─────────────────────┐
              │ HEXGUARD FORENSICS  │
              ├─────────────────────┤
              │ ELA                 │
              │ Compression         │
              │ Biometrics          │
              │ Optics & Physics    │
              │ Generative Artifacts│
              │ Semantic Analysis   │
              │ Metadata            │
              │ Provenance          │
              │ SHA-256             │
              └─────────────────────┘
                        ↓
              TEMPORAL ANALYSIS
                 (video/live)
                        ↓
                 EVIDENCE FUSION
                        ↓
                  RISK ENGINE
                        ↓
             TRUST + CONFIDENCE
                        ↓
              HEXGUARD DASHBOARD
                        ↓
             REPORT / CERTIFICATE
```

### 1. Ingestion Modes
- **Upload File**: Local drag-and-drop, clipboard paste (`Ctrl+V`), and preset sample library.
- **Paste Link**: URL validation via `/api/platforms/validate` supporting:
  - **YouTube Adapter**: Retrieves authorized oEmbed/API metadata; determines live/recorded state. Strictly respects platform terms of service and informs users if direct raw media extraction is restricted.
  - **Instagram Adapter**: Validates post/reel structure and safely handles access policies without crashing.
  - **Direct Media Source**: Safely proxies direct MP4, WebM, MOV, JPG, and PNG sources.
- **LiveGuard (Live Stream Forensics)**: Continuous stream monitoring via stream URL (HLS / MP4 stream) or local WebRTC camera / screen capture for live testing. Features:
  - Rolling risk and trust score engine.
  - Multi-signal persistence (never flags high risk from a single anomalous frame).
  - Live Forensic Timeline Feed with clickable timestamp frame inspection.

### 2. Video Temporal Consistency Engine
- Checks consecutive frame transitions for:
  - Lighting and color temperature jumps ($\Delta L$).
  - High-frequency edge jitter and boundary morphing (typical of diffusion video models).
  - Sudden quantization variance shifts across cut boundaries.
  - Motion continuity.

### 3. Security & SSRF Protection
- Server-side validation restricts fetches to HTTP/HTTPS.
- Complete private and internal IP blocking (loopback `127.0.0.1`, `::1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, link-local `169.254.169.254`).
- Strict 50 MB media payload ceiling and cryptographic SHA-256 fingerprinting on ingestion.

