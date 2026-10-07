import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

SRC_PPT = r"C:\Users\Akshay\Desktop\Hackathena PPT Template_OriginalBackup.pptx"
OUT_PPT = r"C:\Users\Akshay\Desktop\Hackathena PPT Template.pptx"
SCREENSHOTS_DIR = r"C:\Users\Akshay\Desktop\hex\screenshots"

prs = Presentation(SRC_PPT)

# Brand Theme Colors
DARK = RGBColor(0x0F, 0x17, 0x2A)     # slate-900
RED = RGBColor(0xB9, 0x1C, 0x1C)      # deep red #B91C1C
LIGHT_RED = RGBColor(0xFE, 0xF2, 0xF2)
BORDER_RED = RGBColor(0xFE, 0xCD, 0xCD)
SLATE = RGBColor(0x33, 0x41, 0x55)    # slate-700
MUTED = RGBColor(0x64, 0x74, 0x8B)    # slate-500
BG_CARD = RGBColor(0xF8, 0xFA, 0xFC)
BORDER_CARD = RGBColor(0xCB, 0xD5, 0xE1)

# Helper: normalize header text boxes across slides 2-5
def style_header(slide, title_text):
    for shape in slide.shapes:
        if shape.has_text_frame and shape.text_frame.text.strip():
            txt = shape.text_frame.text.strip()
            if any(k in txt for k in ["PROBLEM", "SOLUTION", "TECHNOLOGY", "IMPLEMENTATION"]):
                shape.text_frame.word_wrap = False
                shape.left = Emu(1300000)
                shape.top = Emu(1050000)
                shape.width = Emu(15600000)
                shape.height = Emu(850000)
                shape.text_frame.text = ""
                p = shape.text_frame.paragraphs[0]
                p.text = title_text
                p.font.name = "Hahmlet Bold"
                p.font.size = Pt(36)
                p.font.bold = True
                p.font.color.rgb = DARK
                p.alignment = PP_ALIGN.LEFT
                return

# ==========================================
# SLIDE 1: Title Slide
# ==========================================
slide1 = prs.slides[0]
for shape in slide1.shapes:
    if shape.has_text_frame:
        if "Project Name" in shape.text_frame.text:
            shape.text_frame.text = ""
            p = shape.text_frame.paragraphs[0]
            p.text = "HexGuard"
            p.font.name = "Hahmlet Bold"
            p.font.size = Pt(58)
            p.font.bold = True
            p.font.color.rgb = RED
            p.alignment = PP_ALIGN.CENTER
            
            p2 = shape.text_frame.add_paragraph()
            p2.text = "Next-Gen AI Media Verification & Deepfake Forensics"
            p2.font.name = "Arial"
            p2.font.size = Pt(21)
            p2.font.bold = True
            p2.font.color.rgb = DARK
            p2.space_before = Pt(8)
            p2.alignment = PP_ALIGN.CENTER
            
        elif "Team Name" in shape.text_frame.text:
            shape.text_frame.text = ""
            p = shape.text_frame.paragraphs[0]
            p.text = "Team HexGuard  •  HackAthena '26"
            p.font.name = "Arial"
            p.font.size = Pt(20)
            p.font.bold = True
            p.font.color.rgb = SLATE
            p.alignment = PP_ALIGN.CENTER

# Helper: Create styled container card
def add_card(slide, left, top, width, height, title, subtitle=None, bg_color=BG_CARD, border_color=BORDER_CARD):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    shape.line.color.rgb = border_color
    shape.line.width = Pt(1.5)
    
    tf = shape.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.25)
    tf.margin_right = Inches(0.25)
    tf.margin_top = Inches(0.22)
    tf.margin_bottom = Inches(0.2)
    
    p = tf.paragraphs[0]
    p.text = title
    p.font.name = "Arial"
    p.font.size = Pt(14.5)
    p.font.bold = True
    p.font.color.rgb = RED
    p.alignment = PP_ALIGN.LEFT
    
    if subtitle:
        p_sub = tf.add_paragraph()
        p_sub.text = subtitle
        p_sub.font.name = "Arial"
        p_sub.font.size = Pt(10.5)
        p_sub.font.bold = True
        p_sub.font.color.rgb = MUTED
        p_sub.space_after = Pt(8)
        
    return tf

# ==========================================
# SLIDE 2: Problem Statement
# ==========================================
slide2 = prs.slides[1]
style_header(slide2, "PROBLEM STATEMENT")

col_w = Emu(4900000)
col_h = Emu(7700000)
top_pos = Emu(2050000)
spacing = Emu(350000)
start_x = Emu(1300000)

p1_tf = add_card(slide2, start_x, top_pos, col_w, col_h, 
                 "1. Hyper-Realistic Synthetic Media", 
                 "SURGE IN GENERATIVE DEEPFAKES")
bullet_items_1 = [
    ("Explosive GenAI Proliferation:", "Modern diffusion and video synthesis models (Midjourney, Sora, FLUX) produce photorealistic humans, synthetic voice tracks, and fake video broadcasts with near-zero technical barrier."),
    ("Severe Threat Vectors:", "Deepfakes are weaponized at scale for financial CEO-fraud, political impersonation, identity theft, and viral defamation campaigns."),
    ("Human Inability to Detect:", "The naked eye cannot reliably perceive micro-level generative flaws like corneal reflection contradictions, synthetic blur, or earlobe cartilage fusion."),
    ("Scale of Disinformation:", "Over 500,000 synthetic media clips circulate monthly across mainstream platforms without automated warnings.")
]
for title, desc in bullet_items_1:
    p = p1_tf.add_paragraph()
    p.space_before = Pt(10)
    run1 = p.add_run()
    run1.text = "• " + title + "\n  "
    run1.font.bold = True
    run1.font.size = Pt(12)
    run1.font.color.rgb = DARK
    run2 = p.add_run()
    run2.text = desc
    run2.font.size = Pt(11)
    run2.font.color.rgb = SLATE

p2_tf = add_card(slide2, start_x + col_w + spacing, top_pos, col_w, col_h, 
                 "2. Out-of-Context Misinformation", 
                 "RECYCLED DISASTERS & HOAXES")
bullet_items_2 = [
    ("Deceptive Recirculation:", "Old crisis footage (e.g., 2023 Kerala Floods) is reposted with sensational breaking news captions (e.g., 'Live Mumbai Floods 2026'), generating viral civic panic."),
    ("Bypasses Pure AI Detectors:", "Because the underlying photograph was captured by a genuine camera, conventional AI classifiers mark it as '100% authentic', completely missing the contextual lie."),
    ("Virality on Messaging Apps:", "Recycled crisis clips spread through closed WhatsApp family groups in minutes, where external fact-check links are rarely clicked."),
    ("Absence of OCR Cross-Checking:", "Most tools check pixels only, failing to correlate embedded text captions with historical archive timestamps.")
]
for title, desc in bullet_items_2:
    p = p2_tf.add_paragraph()
    p.space_before = Pt(10)
    run1 = p.add_run()
    run1.text = "• " + title + "\n  "
    run1.font.bold = True
    run1.font.size = Pt(12)
    run1.font.color.rgb = DARK
    run2 = p.add_run()
    run2.text = desc
    run2.font.size = Pt(11)
    run2.font.color.rgb = SLATE

p3_tf = add_card(slide2, start_x + (col_w + spacing) * 2, top_pos, col_w, col_h, 
                 "3. Existing Verification Deficits", 
                 "WHY EXISTING TOOLS FAIL USERS")
bullet_items_3 = [
    ("Costly & Cloud Dependent:", "Commercial forensic suites charge per scan and upload sensitive personal media to cloud servers, introducing severe privacy and compliance risks."),
    ("Single-Signal Blindspots:", "Detectors rely either solely on EXIF headers (which WhatsApp strips) or on fragile neural classifiers that fail against modern compression artifacts."),
    ("Zero Actionable Civilian Defense:", "Technical forensic reports output complex charts that non-technical citizens cannot comprehend or use to convince their families."),
    ("No Live Stream Auditing:", "Existing solutions only analyze static uploaded files, leaving live broadcasts and real-time streaming video completely unmonitored.")
]
for title, desc in bullet_items_3:
    p = p3_tf.add_paragraph()
    p.space_before = Pt(10)
    run1 = p.add_run()
    run1.text = "• " + title + "\n  "
    run1.font.bold = True
    run1.font.size = Pt(12)
    run1.font.color.rgb = DARK
    run2 = p.add_run()
    run2.text = desc
    run2.font.size = Pt(11)
    run2.font.color.rgb = SLATE

# ==========================================
# SLIDE 3: Proposed Solution & Key Features
# ==========================================
slide3 = prs.slides[2]
style_header(slide3, "PROPOSED SOLUTION & KEY FEATURES")

# Overview banner
banner = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Emu(1300000), Emu(2000000), Emu(15500000), Emu(1150000))
banner.fill.solid()
banner.fill.fore_color.rgb = LIGHT_RED
banner.line.color.rgb = BORDER_RED
banner.line.width = Pt(1.5)
btf = banner.text_frame
btf.word_wrap = True
btf.margin_left = Inches(0.25)
btf.margin_top = Inches(0.15)
bp = btf.paragraphs[0]
bp.text = "HexGuard: 100% Local Multi-Modal Media Forensics Platform"
bp.font.name = "Arial"
bp.font.size = Pt(14)
bp.font.bold = True
bp.font.color.rgb = RED
bp_sub = btf.add_paragraph()
bp_sub.text = "An all-in-one verification suite combining deterministic physics/optical signal analysis (Canvas ELA, EXIF, Video Temporal Deltas) with private, offline vision AI reasoning to verify images, videos, and live streams at zero cloud cost."
bp_sub.font.name = "Arial"
bp_sub.font.size = Pt(10.5)
bp_sub.font.color.rgb = DARK

# 4 Key Feature Cards
card_w = Emu(7550000)
card_h = Emu(3050000)
row1_top = Emu(3300000)
row2_top = Emu(6550000)
col1_x = Emu(1300000)
col2_x = Emu(9250000)

f1_tf = add_card(slide3, col1_x, row1_top, card_w, card_h, "100% Local & Private Multi-Modal Vision", "Zero API Cost  •  Complete Data Sovereignty  •  Ollama Native")
p = f1_tf.add_paragraph()
p.text = "• Local Reasoning: Runs multimodal vision models locally via Ollama; no data leaves the user machine.\n• JSON Schema Enforced: Contractual format:'json' guarantees deterministic, structured evidence output.\n• Heuristic Fallback Engine: Instant zero-downtime forensic analysis even if the local daemon is paused."
p.font.size = Pt(11)
p.font.color.rgb = SLATE

f2_tf = add_card(slide3, col2_x, row1_top, card_w, card_h, "5-Dimension Forensic Inspection Engine", "Comprehensive Multi-Vector Signal Evaluation")
p = f2_tf.add_paragraph()
p.text = "• Biometrics & Anatomy: Pupil specular reflections, skin pore distribution, earlobe & teeth geometry.\n• Optics & Physical Laws: Lighting source consistency, perspective vanishing lines, shadow vectors.\n• Generative Artifacts: High-frequency checkerboard noise, diffusion smoothing, edge haloing.\n• Provenance & Metadata: Camera Bayer patterns, EXIF hardware specs, C2PA, and SHA-256 fingerprinting."
p.font.size = Pt(11)
p.font.color.rgb = SLATE

f3_tf = add_card(slide3, col1_x, row2_top, card_w, card_h, "Interactive In-Browser Canvas Forensics", "0-Latency Error Level Analysis (ELA) & Video Temporal Engine")
p = f3_tf.add_paragraph()
p.text = "• Real-Time Canvas ELA: Computes compression quantization variances in the browser to expose spliced areas.\n• Interactive Loupe Inspector: Split-slider inspection lets users compare original vs ELA vs anomaly boxes.\n• Temporal Consistency Engine: Analyzes sequential video frames for lighting shifts (ΔL) and boundary morphing."
p.font.size = Pt(11)
p.font.color.rgb = SLATE

f4_tf = add_card(slide3, col2_x, row2_top, card_w, card_h, "LiveGuard Forensics & 1-Click WhatsApp Debunk", "Real-Time Stream Monitoring  •  Actionable Family Defense")
p = f4_tf.add_paragraph()
p.text = "• LiveGuard Stream Forensics: Continuous monitoring of WebRTC/HLS feeds with rolling trust scores.\n• Actionable Trust Score (0-100%): Plain-English verdict badges with confidence metrics and evidence breakdown.\n• 1-Click WhatsApp Debunks: Generates friendly, respectful fact-check messages tailored for family group chats."
p.font.size = Pt(11)
p.font.color.rgb = SLATE

# ==========================================
# SLIDE 4: Technology Stack / Tools Used
# (Left: Tech Architecture, Right: UI Dashboard Screenshot)
# ==========================================
slide4 = prs.slides[3]
style_header(slide4, "TECHNOLOGY STACK / TOOLS USED")

left_w = Emu(7650000)
left_x = Emu(1300000)
top_s4 = Emu(2000000)
s4_h = Emu(7700000)

tech_tf = add_card(slide4, left_x, top_s4, left_w, s4_h, 
                   "Full-Stack Architecture & Forensic Tooling", 
                   "ENGINEERED FOR LOCAL PERFORMANCE & ZERO-CLOUD RELIANCE")

tech_sections = [
    ("Frontend & Interactive Forensics", [
        ("Next.js 16 (App Router) & React 19:", "High-performance full-stack web architecture with Turbopack."),
        ("HTML5 Canvas ELA Engine:", "Client-side Error Level Analysis with zero server round-trip latency."),
        ("Tailwind CSS v4 & Lucide Icons:", "Responsive cyber-forensic UI with real-time telemetry indicators.")
    ]),
    ("Local AI Reasoning & Normalization", [
        ("Ollama Vision Engine:", "Pre-trained vision models (Qwen2.5-VL / Distill Vision) running locally."),
        ("Strict JSON Schema Enforcement:", "format:'json' contract ensures deterministic structured outputs."),
        ("Deterministic Heuristic Engine:", "Zero-downtime offline fallback based on optical & ELA heuristics.")
    ]),
    ("Video & Live Stream Pipeline", [
        ("Client-Side Keyframe Extraction:", "HTML5 Video + Canvas multi-frame sampler."),
        ("Temporal Consistency Engine:", "Measures frame-to-frame ΔL, edge jitter, and boundary warping."),
        ("LiveGuard WebRTC / HLS Ingest:", "Rolling trust score buffer across continuous frame streams.")
    ]),
    ("Security & Provenance Infrastructure", [
        ("ExifReader & C2PA Headers:", "Parses hardware camera tags, lens profiles, and digital signatures."),
        ("Web Crypto SHA-256:", "Immutable media fingerprinting for forensic chain-of-custody."),
        ("SSRF Network Guard:", "Restricts fetches to HTTP/S; blocks private subnets and localhost.")
    ])
]

for section_title, items in tech_sections:
    p_sec = tech_tf.add_paragraph()
    p_sec.space_before = Pt(8)
    r_sec = p_sec.add_run()
    r_sec.text = "▸ " + section_title
    r_sec.font.bold = True
    r_sec.font.size = Pt(11.5)
    r_sec.font.color.rgb = RED
    
    for iname, idesc in items:
        p_item = tech_tf.add_paragraph()
        p_item.space_before = Pt(2.5)
        r1 = p_item.add_run()
        r1.text = "  • " + iname + " "
        r1.font.bold = True
        r1.font.size = Pt(10.2)
        r1.font.color.rgb = DARK
        r2 = p_item.add_run()
        r2.text = idesc
        r2.font.size = Pt(9.6)
        r2.font.color.rgb = SLATE

# Right side: Screenshot (ui_dashboard.png)
img_x = Emu(9250000)
img_y = Emu(2000000)
img_w = Emu(7550000)
img_h = Emu(4954000)

slide4.shapes.add_picture(os.path.join(SCREENSHOTS_DIR, "ui_dashboard.png"), img_x, img_y, width=img_w, height=img_h)

# Caption card below screenshot
cap_card = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, img_x, Emu(7150000), img_w, Emu(2550000))
cap_card.fill.solid()
cap_card.fill.fore_color.rgb = LIGHT_RED
cap_card.line.color.rgb = BORDER_RED
cap_card.line.width = Pt(1.5)
ctf = cap_card.text_frame
ctf.word_wrap = True
ctf.margin_left = Inches(0.2)
ctf.margin_top = Inches(0.18)
cp = ctf.paragraphs[0]
cp.text = "HexGuard Tri-Modal Ingestion Suite (Live UI Prototype)"
cp.font.name = "Arial"
cp.font.size = Pt(11)
cp.font.bold = True
cp.font.color.rgb = RED

cp2 = ctf.add_paragraph()
cp2.space_before = Pt(4)
cp2.text = "• Tri-Modal Intake: Local file upload (drag-and-drop / Ctrl+V), social media link parsing (YouTube / Instagram with SSRF guard), and real-time live stream forensics (LiveGuard).\n• 1-Click Benchmark Datasets: Pre-packaged benchmark test cases (AI Portraits, Recycled Floods, Spliced Scenes, Authentic Photos) for instant judge testing and verification."
cp2.font.size = Pt(9.5)
cp2.font.color.rgb = DARK

# ==========================================
# SLIDE 5: Implementation / Prototype Demo
# (Left: End-to-End Workflow, Right: UI Report Screenshot)
# ==========================================
slide5 = prs.slides[4]
style_header(slide5, "IMPLEMENTATION / PROTOTYPE DEMO")

wf_w = Emu(7650000)
wf_x = Emu(1300000)
wf_y = Emu(2000000)
wf_h = Emu(7700000)

wf_tf = add_card(slide5, wf_x, wf_y, wf_w, wf_h, 
                 "HexGuard End-to-End Forensic Workflow", 
                 "EXECUTION PIPELINE: INGESTION ➔ MULTI-MODAL REASONING ➔ ACTIONABLE VERDICT")

workflow_steps = [
    ("Stage 1: Multi-Modal Ingestion & Security Guard", 
     "• Ingests media via File Upload, URL (YouTube/Instagram), or Live Stream (WebRTC/HLS).\n• Computes immutable SHA-256 cryptographic fingerprint for forensic provenance.\n• Applies strict SSRF filter to block loopback and private internal network addresses."),
     
    ("Stage 2: Client Preprocessing & Keyframe Sampling", 
     "• Canvas normalizes image dimensions, color spaces, and aspect ratios.\n• For video, client-side extractor samples sequential keyframes across the timeline."),
     
    ("Stage 3: Parallel Dual-Track Forensic Inspection", 
     "• Deterministic Engine: Canvas Error Level Analysis (ELA) detects compression anomalies; ExifReader parses camera hardware tags; Temporal Engine checks ΔL & boundary jitter.\n• Cognitive AI Engine: 100% Local Ollama Vision Model reasons across 5 dimensions (Biometrics, Optics/Physics, Artifacts, Semantics, Metadata) with JSON constraints."),
     
    ("Stage 4: Evidence Fusion & Risk Scoring Engine", 
     "• Fuses optical sensor signatures with generative AI confidence metrics.\n• Computes unified Authenticity Score (0–100%) and categorizes forward spread risk."),
     
    ("Stage 5: Forensic Dashboard & Actionable Debunks", 
     "• Interactive Forensic Inspector renders zoom loupe and anomaly bounding boxes.\n• One-click export produces tailored WhatsApp messages to halt viral misinformation.")
]

for stitle, sdesc in workflow_steps:
    p_step = wf_tf.add_paragraph()
    p_step.space_before = Pt(7)
    r_step = p_step.add_run()
    r_step.text = "▸ " + stitle
    r_step.font.bold = True
    r_step.font.size = Pt(11)
    r_step.font.color.rgb = RED
    
    p_desc = wf_tf.add_paragraph()
    p_desc.space_before = Pt(1.5)
    r_desc = p_desc.add_run()
    r_desc.text = sdesc
    r_desc.font.size = Pt(9.5)
    r_desc.font.color.rgb = SLATE

# Right side: Screenshot (ui_report.png)
slide5.shapes.add_picture(os.path.join(SCREENSHOTS_DIR, "ui_report.png"), img_x, img_y, width=img_w, height=img_h)

# Caption card below screenshot
cap5_card = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, img_x, Emu(7150000), img_w, Emu(2550000))
cap5_card.fill.solid()
cap5_card.fill.fore_color.rgb = LIGHT_RED
cap5_card.line.color.rgb = BORDER_RED
cap5_card.line.width = Pt(1.5)
c5tf = cap5_card.text_frame
c5tf.word_wrap = True
c5tf.margin_left = Inches(0.2)
c5tf.margin_top = Inches(0.18)
c5p = c5tf.paragraphs[0]
c5p.text = "Live Prototype Demo: Forensic Report & Anomaly Localization"
c5p.font.name = "Arial"
c5p.font.size = Pt(11)
c5p.font.bold = True
c5p.font.color.rgb = RED

c5p2 = c5tf.add_paragraph()
c5p2.space_before = Pt(4)
c5p2.text = "• AI Portrait Scan: Flags 14% Trust Score, 'Likely AI-Generated' verdict, and High Spread Risk alert.\n• Interactive Forensic Inspector: Localizes anomalies with bounding boxes (pupil specular mismatch, plastic skin smoothing, fused ear cartilage) and provides ELA split-screen analysis.\n• Family Debunk Generator: Generates 1-click WhatsApp fact-checks tailored for family groups."
c5p2.font.size = Pt(9.5)
c5p2.font.color.rgb = DARK

prs.save(OUT_PPT)
print(f"Presentation successfully polished and saved to {OUT_PPT}!")
