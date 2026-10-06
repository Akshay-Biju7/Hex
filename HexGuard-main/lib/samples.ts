import { SamplePreset } from './types';

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'sample-ai-portrait',
    title: 'Hyper-Realistic AI Portrait',
    category: 'AI Generated',
    description: 'Midjourney v6 generated portrait with smooth skin, fused earlobe cartilage, and mismatched eye reflections.',
    imageUrl: '/samples/hyperreal.png',
    thumbnailUrl: '/samples/hyperreal.png',
    precomputedReport: {
      authenticityScore: 14,
      verdict: 'likely_ai',
      humanVerdict: 'This image is most definitely AI-generated.',
      verdictLabel: 'Likely AI-Generated',
      verdictDescription: 'Physical optical sensor signatures absent. Bilateral corneal specular highlights contradict light source vectors, accompanied by latent diffusion texture smoothing.',
      confidenceScore: 94,
      forwardRisk: 'high',
      forwardRiskLabel: 'High Spread Risk (5/5 relatives will believe it)',
      summary: 'Analysis reveals distinct generative diffusion signatures including unnatural micro-smoothing across skin pores, earlobe cartilage fusion, and contradictory light reflections in the pupils.',
      familyMessage: 'Hey Mom! ❤️ I checked this picture on HexGuard for you — it\'s 100% made by a computer (AI), not real. Please don\'t forward it to any family WhatsApp groups! Love you!',
      messageTones: {
        mom: 'Hey Mom! ❤️ I checked this picture on HexGuard for you — it\'s 100% made by a computer (AI), not a real photo. The skin looks like plastic and the eye reflections don\'t match. Please don\'t forward it to family groups! Love you!',
        witty: 'Nice try AI, but no. 🙅‍♂️ This image is 100% computer-generated. Don\'t let Uncle forward this to 15 more family groups!',
        polite: 'Hey! Checked this on HexGuard — it\'s actually computer-made (AI), not a real photo. Just wanted to let you know before anyone forwards it! ❤️',
        direct: 'Fact-Check: HexGuard media scan confirmed this image is synthetic AI media. Trust score: 14%.'
      },
      dimensionsBreakdown: {
        biological: {
          title: 'Anatomy & Biometrics',
          score: 18,
          status: 'fail',
          findings: [
            'Light reflections in left and right eyes do not match identical light sources.',
            'Skin texture lacks real pores; artificial computer smoothing detected.',
            'Hair strands blur unnaturally into the background.'
          ]
        },
        optics: {
          title: 'Optics & Physics',
          score: 32,
          status: 'fail',
          findings: [
            'Light on the cheek contradicts the shadow under the jawline.',
            'Background blur does not match real camera lens optics.'
          ]
        },
        artifacts: {
          title: 'Generative Artifacts',
          score: 10,
          status: 'fail',
          findings: [
            'Subtle checkerboard noise pattern found in background.',
            'Typical AI diffusion smoothing detected across all fine textures.'
          ]
        },
        semantics: {
          title: 'Semantic Plausibility',
          score: 65,
          status: 'warning',
          findings: [
            'Clothing fabric weave pattern dissolves near collar edge.'
          ]
        },
        metadata: {
          title: 'Metadata & Provenance',
          score: 15,
          status: 'fail',
          findings: [
            'No real camera hardware sensor tags found.',
            'Synthetic digital canvas export signature.'
          ]
        }
      },
      anomalies: [
        {
          id: 'ano-1',
          title: 'Eyes: Light reflections don\'t match',
          technicalDetails: 'Left eye exhibits two distinct softbox reflections while right eye shows only one rectangular highlight, violating physical optics.',
          ruleOfThumb: 'AI can draw entire universes, but still gets confused by reflections in eyeballs.',
          severity: 'high',
          category: 'Anatomy',
          box: { x: 42, y: 36, width: 16, height: 8 }
        },
        {
          id: 'ano-2',
          title: 'Ear: Cartilage is fused and unnatural',
          technicalDetails: 'Tragus and antihelix cartilage blend unnaturally without standard biological separation.',
          ruleOfThumb: 'Look closely at earlobes and hairlines — AI often melts them into the neck.',
          severity: 'critical',
          category: 'Anatomy',
          box: { x: 74, y: 44, width: 12, height: 16 }
        },
        {
          id: 'ano-3',
          title: 'Skin: Unnaturally smooth like plastic',
          technicalDetails: 'Facial epidermis demonstrates mathematical Gaussian smoothing rather than natural biological pore and sebum distribution.',
          ruleOfThumb: 'If skin looks smoother than a polished marble floor, it\'s probably Midjourney.',
          severity: 'medium',
          category: 'Artifacts',
          box: { x: 44, y: 52, width: 22, height: 18 }
        }
      ],
      recommendedActions: [
        'Do not forward or treat as a real human photograph.',
        'Inform the sender that this is a synthetic AI render.'
      ]
    }
  },
  {
    id: 'sample-out-of-context-flood',
    title: 'Viral Post: Kerala Floods claimed as 2026 Mumbai News',
    category: 'Out of Context',
    description: 'Real 2023 Kerala flood photograph in a viral tweet claiming to be a live 2026 Mumbai disaster. Demonstrates OCR fact-checking.',
    imageUrl: '/samples/keralaflood.jpeg',
    thumbnailUrl: '/samples/keralaflood.jpeg',
    precomputedReport: {
      authenticityScore: 42,
      verdict: 'out_of_context',
      humanVerdict: 'Real photograph, but FAKE / OUT-OF-CONTEXT claim.',
      verdictLabel: 'Out of Context / Misattributed',
      verdictDescription: 'Underlying media is an authentic physical camera photograph, but the attached caption makes a false temporal and geographical claim.',
      confidenceScore: 96,
      forwardRisk: 'high',
      forwardRiskLabel: 'High Spread Risk (Viral Misinformation)',
      summary: 'HexGuard OCR & Context audit detected a false claim. The underlying photograph is 100% genuine, but it was originally taken during the August 2023 Kerala Floods and is being falsely recirculated as a 2026 Mumbai event.',
      familyMessage: 'Hey Mom! ❤️ I checked this on HexGuard — the photo itself is real, but the news is fake! It is actually from the 2023 Kerala floods, NOT happening today. Please don\'t forward it! Love you!',
      messageTones: {
        mom: 'Hey Mom! ❤️ I checked this on HexGuard — the photo itself is real, but the news is fake! It is actually from the 2023 Kerala floods, NOT happening today in Mumbai. Please don\'t forward it to family groups! Love you!',
        witty: 'Classic WhatsApp fake news! 🌊 The photo is real, but it\'s from Kerala in 2023, not Mumbai today. Tell the family group to put away the life jackets!',
        polite: 'Hey! Just checked this on HexGuard — this photo is authentic, but it was taken in Kerala back in 2023, not today. Just letting you know before it spreads! 👍',
        direct: 'Fact-Check: Out-of-context media misattribution. Real 2023 photograph repurposed for false 2026 breaking news.'
      },
      ocrContext: {
        hasExtractedText: true,
        extractedText: '🚨 BREAKING: Terrifying live visuals of unprecedented flooding in Mumbai today! City at complete standstill! Please stay indoors! #MumbaiFloods2026 #LiveAlert',
        claimedEvent: 'Live breaking disaster occurring in Mumbai today (2026).',
        trueOrigin: 'Authentic photojournalism photograph captured during the August 2023 Kerala Floods.',
        isMisattributed: true,
        factCheckSummary: 'The photograph is an authentic camera capture from August 2023 in Kerala. It is being falsely repurposed to create viral alarm regarding a 2026 Mumbai weather event.'
      },
      dimensionsBreakdown: {
        biological: {
          title: 'Anatomy & Biometrics',
          score: 95,
          status: 'pass',
          findings: ['Real physical water physics, natural reflections, and genuine optical lens focus.']
        },
        optics: {
          title: 'Optics & Physics',
          score: 96,
          status: 'pass',
          findings: ['Natural ambient light scattering consistent with heavy monsoon rainfall.']
        },
        artifacts: {
          title: 'Generative Artifacts',
          score: 98,
          status: 'pass',
          findings: ['Zero AI generative diffusion patterns. Genuine physical camera noise.']
        },
        semantics: {
          title: 'Semantic Plausibility',
          score: 20,
          status: 'fail',
          findings: [
            'CRITICAL MISMATCH: Post caption claims 2026 Mumbai rainfall, but visual matches 2023 Kerala flood archives.'
          ]
        },
        metadata: {
          title: 'Metadata & Provenance',
          score: 30,
          status: 'warning',
          findings: ['Image was re-saved from social media feed with stripped original camera EXIF tags.']
        }
      },
      anomalies: [
        {
          id: 'ano-ooc-1',
          title: 'Context: Old 2023 photo repurposed as new breaking news',
          technicalDetails: 'Visual reverse grounding confirms this identical photo was published by news outlets in August 2023 covering Kerala floods.',
          ruleOfThumb: 'When a dramatic disaster photo suddenly goes viral, it is almost always recycled from an older event 3-5 years ago.',
          severity: 'critical',
          category: 'Semantics',
          box: { x: 10, y: 10, width: 80, height: 80 }
        }
      ],
      recommendedActions: [
        'Do not share as current breaking news.',
        'Inform the sender that the photo is 3 years old from Kerala.'
      ]
    }
  },
  {
    id: 'sample-authentic-dslr',
    title: 'Authentic Photo (Verified Capture)',
    category: 'Authentic Photo',
    description: 'Genuine camera capture with natural optical sensor noise, organic optical depth of field, and unaltered pixel structure.',
    imageUrl: '/samples/authentic.jpg',
    thumbnailUrl: '/samples/authentic.jpg',
    precomputedReport: {
      authenticityScore: 96,
      verdict: 'authentic',
      humanVerdict: 'This is a genuine, real photograph.',
      verdictLabel: 'Authentic / Unaltered',
      verdictDescription: 'Physical optical sensor capture confirmed. Consistent camera Bayer pattern noise, genuine optical depth of field, and biological coherence.',
      confidenceScore: 98,
      forwardRisk: 'low',
      forwardRiskLabel: 'Safe to Share (Authentic Media)',
      summary: 'High-confidence authentic photograph. The image displays natural camera lens characteristics, consistent shadows, organic skin pores with natural optical aberration, and authentic camera sensor noise.',
      familyMessage: 'Hey Mom! ❤️ I checked this on HexGuard — it\'s a genuine, real photo taken with a real camera. No AI generation or editing! Safe to share! ✅',
      messageTones: {
        mom: 'Hey Mom! ❤️ I checked this on HexGuard — it\'s a genuine, real photo taken with a real camera. No AI generation or editing! Safe to share! ✅',
        witty: 'Good news! This one is 100% human and real. No AI robots involved here. Feel free to forward! 🤝',
        polite: 'Checked this photo on HexGuard — it is completely authentic and taken with a real camera. Safe to share! 📸',
        direct: 'Fact-Check: Verified as authentic photographic capture. Trust Score: 96%.'
      },
      dimensionsBreakdown: {
        biological: {
          title: 'Anatomy & Biometrics',
          score: 98,
          status: 'pass',
          findings: [
            'Natural skin texture with real pores, fine lines, and organic highlights.',
            'Eye reflections and pupil structure follow natural human anatomy.',
            'Individual hair strands show true camera lens depth of field.'
          ]
        },
        optics: {
          title: 'Optics & Physics',
          score: 95,
          status: 'pass',
          findings: [
            'Consistent directional lighting matching shadow cast angles across subject.',
            'True optical lens blur and vignetting consistent with 50mm focal length.'
          ]
        },
        artifacts: {
          title: 'Generative Artifacts',
          score: 99,
          status: 'pass',
          findings: [
            'Zero AI diffusion smoothing or computer grid artifacts found.',
            'Uniform camera sensor grain pattern intact.'
          ]
        },
        semantics: {
          title: 'Semantic Plausibility',
          score: 96,
          status: 'pass',
          findings: [
            'All background elements and lighting maintain realistic physical relationships.'
          ]
        },
        metadata: {
          title: 'Metadata & Provenance',
          score: 92,
          status: 'pass',
          findings: [
            'Contains standard camera color space profile and realistic exposure parameters.'
          ]
        }
      },
      anomalies: [],
      recommendedActions: [
        'Verified as authentic photographic capture suitable for news and archival use.'
      ]
    }
  },
  {
    id: 'sample-manipulated-spliced',
    title: 'Spliced Composite Scene',
    category: 'Manipulated / Spliced',
    description: 'Composite picture where an element was photoshopped into the scene. Triggers severe compression variance on ELA.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
    precomputedReport: {
      authenticityScore: 38,
      verdict: 'manipulated',
      humanVerdict: 'This image was digitally edited / photoshopped.',
      verdictLabel: 'Digitally Manipulated / Spliced',
      verdictDescription: 'Localized digital tampering detected. Spliced foreground elements exhibit compression quantization disparities and conflicting shadow vectors.',
      confidenceScore: 89,
      forwardRisk: 'medium',
      forwardRiskLabel: 'Moderate Risk (Partially Photoshopped)',
      summary: 'Significant digital editing detected. Spliced elements show mismatched compression edges and conflicting shadow angles compared to the background environment.',
      familyMessage: 'Hey Mom! ❤️ I checked this on HexGuard — someone edited/photoshopped this picture. Parts were pasted in from another image. It\'s not an untouched photo! ⚠️',
      messageTones: {
        mom: 'Hey Mom! ❤️ I checked this on HexGuard — someone edited/photoshopped this picture. Parts were pasted in from another image. It\'s not an untouched photo! Better not to forward! ⚠️',
        witty: 'Someone got a little too creative with Photoshop here. ✂️ Parts of this photo were pasted in. Don\'t let it fool the group chat!',
        polite: 'Hey! Just checked this on HexGuard — it looks like parts of this photo were edited using Photoshop. Just sharing so you know! ⚠️',
        direct: 'Fact-Check: Digital manipulation detected. Spliced elements present. Trust Score: 38%.'
      },
      dimensionsBreakdown: {
        biological: {
          title: 'Anatomy & Biometrics',
          score: 60,
          status: 'warning',
          findings: [
            'Rough edge outlines around subject indicate digital cutting and pasting.'
          ]
        },
        optics: {
          title: 'Optics & Physics',
          score: 28,
          status: 'fail',
          findings: [
            'Light direction on the subject does not match the background sun angle.',
            'Mismatched color temperature between foreground and background.'
          ]
        },
        artifacts: {
          title: 'Generative Artifacts',
          score: 45,
          status: 'warning',
          findings: [
            'Repeated clone stamp patterns found near edge boundaries.',
            'High Error Level Analysis (ELA) variance across subject perimeter.'
          ]
        },
        semantics: {
          title: 'Semantic Plausibility',
          score: 50,
          status: 'warning',
          findings: [
            'Scale of foreground objects does not match background perspective.'
          ]
        },
        metadata: {
          title: 'Metadata & Provenance',
          score: 30,
          status: 'fail',
          findings: [
            'Software traces indicate photo-editing software processing.'
          ]
        }
      },
      anomalies: [
        {
          id: 'ano-splice-1',
          title: 'Edges: Spliced border compression mismatch',
          technicalDetails: 'Inserted element exhibits significantly higher Error Level Analysis (ELA) variance than the surrounding background image.',
          ruleOfThumb: 'Check the edges around the subject — blurry halos usually mean someone cut and pasted them in.',
          severity: 'critical',
          category: 'Artifacts',
          box: { x: 30, y: 25, width: 40, height: 45 }
        },
        {
          id: 'ano-splice-2',
          title: 'Shadows: Contradictory light direction',
          technicalDetails: 'Shadow angle of foreground element is offset by 45 degrees from the environmental key light vector.',
          ruleOfThumb: 'Always check shadow direction — the sun can only shine from one angle at a time.',
          severity: 'high',
          category: 'Optics',
          box: { x: 28, y: 70, width: 35, height: 15 }
        }
      ],
      recommendedActions: [
        'Do not rely on this image as factual evidence of an event.'
      ]
    }
  },
  {
    id: 'sample-synthetic-art',
    title: 'Generative AI Artwork',
    category: 'Synthetic Art',
    description: 'AI-generated futuristic scene showing hallucinated gibberish text, impossible angles, and generative noise smoothing.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    precomputedReport: {
      authenticityScore: 8,
      verdict: 'likely_ai',
      humanVerdict: 'This is 100% AI-generated digital artwork.',
      verdictLabel: 'AI-Generated Artwork',
      verdictDescription: 'Synthetic algorithmic generation confirmed. Hallucinated pseudo-typography and non-Euclidean perspective vanishing vectors.',
      confidenceScore: 99,
      forwardRisk: 'high',
      forwardRiskLabel: 'High Spread Risk (Synthetic Artwork)',
      summary: 'Unequivocal generative AI creation. Features characteristic fake gibberish text, impossible geometry, and seamless computer color gradients.',
      familyMessage: 'Hey Mom! ❤️ I checked this picture on HexGuard — it\'s completely computer-generated AI artwork, not a real place! 🎨🤖',
      messageTones: {
        mom: 'Hey Mom! ❤️ I checked this picture on HexGuard — it\'s completely computer-generated AI digital artwork, not a real place. The text on the signs is fake AI gibberish! 🎨',
        witty: 'If you look at the background signs, it\'s pure alien gibberish! 👾 Definitely 100% AI art. Don\'t book plane tickets here!',
        polite: 'Hey! This image is actually a computer-generated AI digital painting, not a real place. It looks cool, but it isn\'t real! 🎨',
        direct: 'Fact-Check: Synthetic AI artwork confirmed. Hallucinated pseudo-typography. Trust score: 8%.'
      },
      dimensionsBreakdown: {
        biological: {
          title: 'Anatomy & Biometrics',
          score: 20,
          status: 'fail',
          findings: ['Non-organic geometry and computer-generated brush strokes.']
        },
        optics: {
          title: 'Optics & Physics',
          score: 15,
          status: 'fail',
          findings: [
            'Glowing light blooms without a real physical light source.',
            'Atmospheric haze lacks natural physical light scattering.'
          ]
        },
        artifacts: {
          title: 'Generative Artifacts',
          score: 5,
          status: 'fail',
          findings: [
            'Classic AI diffusion patterns across all color gradients.',
            'Complete absence of real camera sensor grain.'
          ]
        },
        semantics: {
          title: 'Semantic Plausibility',
          score: 8,
          status: 'fail',
          findings: [
            'Fake, distorted symbols pretending to be readable letters.',
            'Pillars and walls float without real-world structural support.'
          ]
        },
        metadata: {
          title: 'Metadata & Provenance',
          score: 10,
          status: 'fail',
          findings: ['Created directly in software with zero camera sensor tags.']
        }
      },
      anomalies: [
        {
          id: 'ano-art-1',
          title: 'Text: Fake AI gibberish lettering',
          technicalDetails: 'Background signage displays distorted non-alphanumeric glyphs generated by text-to-image diffusion models.',
          ruleOfThumb: 'Try reading the background words — if it looks like alien hieroglyphics, it\'s AI.',
          severity: 'critical',
          category: 'Semantics',
          box: { x: 15, y: 20, width: 25, height: 15 }
        },
        {
          id: 'ano-art-2',
          title: 'Buildings: Impossible geometry and angles',
          technicalDetails: 'Perspective vanishing lines cross in multiple incompatible dimensions violating Euclidean geometry.',
          ruleOfThumb: 'Follow the building lines — if walls float without support, it\'s a computer fantasy.',
          severity: 'high',
          category: 'Optics',
          box: { x: 50, y: 35, width: 35, height: 35 }
        }
      ],
      recommendedActions: [
        'Categorized as synthetic generative art.'
      ]
    }
  },
  {
    id: 'sample-ai-deepfake-video',
    title: 'Viral AI Deepfake Speech & Face-Swap',
    category: 'AI Deepfake Video',
    mediaType: 'video',
    description: 'Synthesized video with temporal facial warping, mismatched phoneme lip-sync, and unnatural facial boundary jitter.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    precomputedReport: {
      authenticityScore: 12,
      verdict: 'likely_ai',
      humanVerdict: 'This video is an AI-generated deepfake / face-swap.',
      verdictLabel: 'AI Deepfake Video',
      verdictDescription: 'Temporal warping detected across facial landmarks. Mouth phoneme kinematics fail audio-visual synchrony, with distinct edge blur around the jawline boundary.',
      confidenceScore: 96,
      forwardRisk: 'high',
      forwardRiskLabel: 'High Spread Risk (Viral Deepfake)',
      summary: 'HexGuard Temporal Video Forensics detected high-frequency facial jitter and unnatural mouth movements characteristic of deepfake neural face-swapping algorithms.',
      familyMessage: 'Hey Mom! ❤️ I checked this video on HexGuard — it is an AI deepfake! The person\'s face and voice were generated by a computer. Please do not forward it to family WhatsApp groups! Love you!',
      messageTones: {
        mom: 'Hey Mom! ❤️ I checked this video on HexGuard — it is an AI deepfake! The person\'s face and voice were generated by a computer. The mouth doesn\'t match the words naturally. Please do not forward it! Love you!',
        witty: 'That\'s a total deepfake! 🤖 The face looks like it was glued on with digital tape. Don\'t let the family group get scammed by this!',
        polite: 'Hey! Checked this video on HexGuard — it\'s actually an AI-generated deepfake with synthetic face swapping. Just sharing so you know before forwarding! 👍',
        direct: 'Fact-Check: AI deepfake synthesis confirmed. Temporal boundary artifacts and desynchronized lip kinematics.'
      },
      videoMetadata: {
        duration: 15.0,
        fps: 30
      },
      temporalIntegrity: {
        isRecycledFootage: false,
        explanation: 'Generative AI deepfake model synthesis detected directly in pixel stream.'
      },
      dimensionsBreakdown: {
        biological: {
          title: 'Facial Biometrics & Lip-Sync',
          score: 12,
          status: 'fail',
          findings: [
            'Phoneme shape kinematics desynchronized during rapid speech transitions.',
            'Unnatural ocular blink cadence (zero complete eyelid closures over 10s window).'
          ]
        },
        optics: {
          title: 'Temporal Lighting & Motion',
          score: 25,
          status: 'fail',
          findings: [
            'Specular highlights on forehead remain static despite head rotation.',
            'Temporal boundary flicker visible along jawline perimeter.'
          ]
        },
        artifacts: {
          title: 'Generative Video Artifacts',
          score: 15,
          status: 'fail',
          findings: [
            'Latent diffusion motion blurring observed around hair contours.',
            'Frame-to-frame pixel interpolation noise.'
          ]
        },
        semantics: {
          title: 'Physical Plausibility',
          score: 55,
          status: 'warning',
          findings: [
            'Head movement physics exhibit subtle rubbery elasticity.'
          ]
        },
        metadata: {
          title: 'Container & Codec Specs',
          score: 35,
          status: 'warning',
          findings: [
            'Video stream re-encoded through web neural pipeline without camera firmware signature.'
          ]
        }
      },
      anomalies: [
        {
          id: 'ano-vid-1',
          title: 'Mouth: Lip-sync phoneme mismatch',
          technicalDetails: 'Audio spectral formant peaks fail to align with labial visual closure timing at [00:02.4s].',
          ruleOfThumb: 'Watch the lips closely — deepfakes often struggle with words that require closed lips like "B", "M", or "P".',
          severity: 'critical',
          category: 'Anatomy',
          timestampSeconds: 2.4,
          box: { x: 42, y: 55, width: 18, height: 16 }
        },
        {
          id: 'ano-vid-2',
          title: 'Jawline: Face-swap boundary flicker',
          technicalDetails: 'Alpha-blend seam between synthetic facial mask and background neck visible during head tilt at [00:05.1s].',
          ruleOfThumb: 'Look along the jaw and neck — blurry lines or jittering skin usually reveal a swapped face.',
          severity: 'high',
          category: 'Artifacts',
          timestampSeconds: 5.1,
          box: { x: 38, y: 65, width: 26, height: 14 }
        },
        {
          id: 'ano-vid-3',
          title: 'Eyes: Unnatural absence of blinking',
          technicalDetails: 'Zero natural micro-saccades or palpebral blink reflex observed across consecutive frames at [00:08.0s].',
          ruleOfThumb: 'Humans blink every 3 to 5 seconds naturally. If they stare unblinking like a statue, it\'s an AI avatar.',
          severity: 'medium',
          category: 'Anatomy',
          timestampSeconds: 8.0,
          box: { x: 40, y: 35, width: 22, height: 12 }
        }
      ],
      recommendedActions: [
        'Do not share as factual or authentic statement footage.',
        'Flag video to platform moderators as synthetic deepfake media.'
      ]
    }
  },
  {
    id: 'sample-recycled-archive-video',
    title: 'Recycled Archive Video (2021 Crisis vs 2026 Claim)',
    category: 'Recycled Video',
    mediaType: 'video',
    description: 'Archived 2021 news footage circulating as a live 2026 breaking crisis. Demonstrates Temporal Contradiction detection.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80',
    precomputedReport: {
      authenticityScore: 35,
      verdict: 'out_of_context',
      humanVerdict: 'Real archive video, but RECYCLED with a false breaking news claim.',
      verdictLabel: 'Recycled Archive Footage',
      verdictDescription: 'Temporal Contradiction detected. Footage matches verified historical broadcast archives from 2021, but is falsely circulated with 2026 breaking news captions.',
      confidenceScore: 98,
      forwardRisk: 'high',
      forwardRiskLabel: 'High Spread Risk (Viral Misinformation)',
      summary: 'Temporal Integrity verification flagged this video. While the video itself was recorded with real cameras, it originally took place in 2021 and has been deceptively recirculated as a live 2026 disaster.',
      familyMessage: 'Hey Mom! ❤️ I checked this video on HexGuard — the video is real, but it happened back in 2021, NOT today! Please don\'t let it worry you or forward it! Love you! ⚠️',
      messageTones: {
        mom: 'Hey Mom! ❤️ I checked this video on HexGuard — the video is real, but it happened back in 2021, NOT today! Please don\'t let it worry you or forward it! Love you! ⚠️',
        witty: 'Old news alert! ⏰ This video is from 5 years ago (2021). Someone dusted off an old clip to get viral views today. Don\'t fall for it!',
        polite: 'Hey! Just checked this on HexGuard — this footage is actually from a 2021 archive, not happening today. Just sharing the fact-check before it spreads! 👍',
        direct: 'Fact-Check: Temporal integrity contradiction. 2021 archival recording falsely attributed to 2026 breaking event.'
      },
      videoMetadata: {
        duration: 12.0,
        fps: 24
      },
      temporalIntegrity: {
        isRecycledFootage: true,
        earliestFoundYear: '2021',
        originalContext: 'Archived documentary footage originally broadcast in 2021',
        explanation: 'Grounding search and perceptual hashing confirm this footage was originally recorded and published in 2021. It is being falsely circulated with 2026 breaking news captions.'
      },
      dimensionsBreakdown: {
        biological: {
          title: 'Facial Biometrics & Lip-Sync',
          score: 95,
          status: 'pass',
          findings: ['Real camera capture with organic human physics and natural motion.']
        },
        optics: {
          title: 'Temporal Lighting & Motion',
          score: 94,
          status: 'pass',
          findings: ['Authentic natural lighting and coherent camera motion.']
        },
        artifacts: {
          title: 'Generative Video Artifacts',
          score: 98,
          status: 'pass',
          findings: ['Zero AI generative diffusion signatures.']
        },
        semantics: {
          title: 'Temporal & Semantic Integrity',
          score: 15,
          status: 'fail',
          findings: [
            'TEMPORAL MISMATCH: Circulating caption claims live 2026 event, but video is from 2021 broadcast archives.'
          ]
        },
        metadata: {
          title: 'Container & Codec Specs',
          score: 30,
          status: 'warning',
          findings: ['Stripped broadcast container headers. Re-encoded for social messaging platforms.']
        }
      },
      anomalies: [
        {
          id: 'ano-temp-1',
          title: 'Temporal Contradiction: 2021 archive footage',
          technicalDetails: 'Perceptual hashing and scene matching confirm identical video stream appeared online in 2021.',
          ruleOfThumb: 'Recycled footage is the #1 type of fake news — always check if the video is from a past year.',
          severity: 'critical',
          category: 'Semantics',
          timestampSeconds: 3.0,
          box: { x: 10, y: 10, width: 80, height: 80 }
        }
      ],
      recommendedActions: [
        'Do not share as live or current breaking news.',
        'Inform the sender that this video is 5 years old.'
      ]
    }
  }
];
