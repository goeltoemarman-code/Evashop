/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { VideoScenePrompt } from "../types/videoScenes";

export type ProductCategory = 'pakaian' | 'tas' | 'sepatu' | 'aksesoris';
export type ModelMarket = 'indonesia' | 'amazon';
export type ModelType = 'wanita' | 'pria' | 'couple' | 'grup';
export type LocationType = 'lapangan' | 'studio' | 'hotel' | 'gereja' | 'teras' | 'mall';

/**
 * Extracts 5 sequential direct-to-camera dialogue lines from the selling narrative,
 * or provides curated high-converting fallback lines.
 */
export function extractFiveDialogueLines(narrative: string | undefined, category: ProductCategory, isAmazon: boolean): string[] {
  if (narrative && narrative.trim()) {
    const cleanText = narrative
      .replace(/^#+\s+/gm, '')
      .replace(/^\d+[\.\)]\s+/gm, '')
      .replace(/^[-\*]\s+/gm, '')
      .trim();
    const sentences = cleanText
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim().replace(/^["']|["']$/g, ''))
      .filter(s => s.length > 5);

    if (sentences.length >= 5) {
      return [
        sentences[0],
        sentences[1],
        sentences[Math.floor(sentences.length * 0.45)],
        sentences[Math.floor(sentences.length * 0.7)],
        sentences[sentences.length - 1]
      ];
    } else if (sentences.length > 0) {
      const lines: string[] = [];
      for (let i = 0; i < 5; i++) {
        lines.push(sentences[i % sentences.length]);
      }
      return lines;
    }
  }

  // Fallback curated direct-to-camera dialogue lines matching the 30-second formula
  if (isAmazon) {
    return [
      `Stop scrolling! If you want a luxury-feel ${category} without the crazy price tag, look at this!`,
      `Tired of cheap materials that wear out fast? This is crafted with reinforced stitching and premium hand-feel.`,
      `The comfort is unreal—lightweight, breathable, and designed to move with you effortlessly all day.`,
      `It gives an instant confidence boost and looks three times more expensive than it actually is.`,
      `Promo stock is moving fast—tap the link below right now to grab yours and checkout before it sells out!`
    ];
  } else {
    return [
      `Stop scrolling! Kalau kamu lagi nyari ${category} yang look-nya semewah jutaan tapi harganya ramah, ini dia!`,
      `Capek beli yang gampang rusak atau bahannya tipis? Produk ini hadir dengan material premium tebal dan jahitan butik kokoh.`,
      `Dipakai seharian super empuk dan nyaman, teksturnya adem dan bikin penampilan langsung kelihatan rapi berkelas.`,
      `Beneran bikin percaya diri, potongannya estetik dan gampang dipadukan ke berbagai acara.`,
      `Mumpung lagi harga promo dan gratis ongkir, langsung checkout sekarang dan buruan ambil dikeranjang video ini ya tepatnya Evashop!`
    ];
  }
}

/**
 * Intelligent procedural generator for 5 professional Television Commercial (TVC) scenes.
 * Directs the on-camera model to speak the selling narrative directly to the lens,
 * providing both 9:16 vertical and 16:9 widescreen AI video prompts.
 */
export function createProceduralTvcScenes(params: {
  category: ProductCategory;
  description: string;
  market: ModelMarket;
  modelType: ModelType;
  location: LocationType;
  productTitle?: string;
  narrative?: string;
}): VideoScenePrompt[] {
  const { category, description, market, modelType, location, productTitle, narrative } = params;
  const isAmazon = market === 'amazon';
  const dialogueLines = extractFiveDialogueLines(narrative, category, isAmazon);

  const subjectEn = isAmazon ? {
    wanita: "stylish young American female model with natural glowing skin and authentic charisma",
    pria: "handsome young American male model with confident posture and warm engaging presence",
    couple: "charming young American couple with natural chemistry and contemporary lifestyle appeal",
    grup: "diverse trendy group of young American creators with authentic candid enthusiasm"
  }[modelType] : {
    wanita: "graceful young Indonesian female model with natural radiant beauty and warm engaging smile",
    pria: "charismatic young Indonesian male model with polished grooming and confident modern aura",
    couple: "stylish young Indonesian couple with effortless chemistry and coordinated lifestyle fashion",
    grup: "trendy diverse group of young Indonesian creators showcasing authentic lifestyle vibe"
  }[modelType];

  const locationEn = {
    lapangan: "lush sun-drenched outdoor park with golden sunlight filtering through leafy trees",
    studio: "high-end luxury fashion studio with sleek architectural curves and diffused softbox lighting",
    hotel: "luxurious 5-star hotel terrace with dramatic skyline backdrop and creamy ambient bokeh",
    gereja: "majestic classical stone courtyard with historic archways and soft natural morning glow",
    teras: "chic modern Scandinavian outdoor cafe terrace with warm wooden textures and lush greenery",
    mall: "prestigious modern shopping atrium with polished reflective marble floors and bright glass ceiling"
  }[location];

  // Specific visual focal points based on category
  const categoryFocal = {
    pakaian: {
      action1: isAmazon 
        ? `Direct-to-camera hook: Model walks forward, looks straight into the camera lens with articulate lip-sync delivering: "${dialogueLines[0]}", while the fabric drapes and sways gracefully.`
        : `Model melangkah ke arah kamera, menatap langsung ke lensa dengan artikulasi bibir alami (lip-sync) berbicara: "${dialogueLines[0]}", memperlihatkan siluet busana yang jatuh mewah.`,
      action2: isAmazon
        ? `Close-up demonstration: Model speaks directly into camera saying: "${dialogueLines[1]}", gently touching the breathable textile weave and reinforced boutique seams.`
        : `Model berbicara langsung ke arah kamera mengucapkan: "${dialogueLines[1]}", jari-jemari meraba serat kain yang padat, halus, dan jahitannya rapi standar butik.`,
      action3: isAmazon
        ? `Dynamic lifestyle motion: Model speaks with candid enthusiasm: "${dialogueLines[2]}", spinning playfully to demonstrate total freedom of movement and comfort.`
        : `Model bergerak aktif dan berputar anggun, menatap kamera dengan senyum riang sambil berbicara: "${dialogueLines[2]}", memperlihatkan kenyamanan dan keleluasaan bergerak.`,
      action4: isAmazon
        ? `Confidence check: Model glances at camera with beaming self-assurance, speaking: "${dialogueLines[3]}", displaying the flattering fit that elevates the whole posture.`
        : `Model tersenyum percaya diri menghadap kamera, berbicara meyakinkan: "${dialogueLines[3]}", memperlihatkan potongan proporsional yang membuat tubuh lebih jenjang.`,
      action5: isAmazon
        ? `Hero packshot & checkout CTA: Model holds the outfit in full-body center framing, speaking with high urgency: "${dialogueLines[4]}", gesturing invitingly toward the link.`
        : `Hero Packshot penutup: Model berpose elegan di tengah frame, menatap kamera dengan antusias berbicara: "${dialogueLines[4]}", sambil menunjuk ke keranjang belanja.`,
      itemPromptTerm: "fashion outfit"
    },
    tas: {
      action1: isAmazon
        ? `Direct-to-camera hook: Model strides forward holding the bag, looking straight into the lens speaking: "${dialogueLines[0]}", metallic hardware gleaming in sun flare.`
        : `Model melangkah percaya diri menenteng tas, menatap langsung ke kamera dengan artikulasi bibir alami berbicara: "${dialogueLines[0]}", aksen logam tas memantulkan kilau elegan.`,
      action2: isAmazon
        ? `Craftsmanship showcase: Model presents the structured bag close to camera, speaking: "${dialogueLines[1]}", sliding fingers over the supple grain and smooth zipper.`
        : `Model menyorotkan tas ke kamera sambil berbicara: "${dialogueLines[1]}", memperlihatkan tekstur tebal anti-gores, resleting halus, dan jahitan sudut kokoh.`,
      action3: isAmazon
        ? `Utility demonstration: Model unclasps the bag while speaking naturally: "${dialogueLines[2]}", displaying spacious compartments that fit daily essentials effortlessly.`
        : `Model membuka tas sambil berbicara ramah ke arah kamera: "${dialogueLines[2]}", memperlihatkan kompartemen lega dan teratur yang muat banyak barang.`,
      action4: isAmazon
        ? `Style elevation: Model slings the bag over shoulder, turning to camera with a radiant smile speaking: "${dialogueLines[3]}", proving its versatile luxury appeal.`
        : `Model menyampirkan tas di bahu, menatap kamera dengan senyum bangga berbicara: "${dialogueLines[3]}", look-nya instan meng-upgrade gaya harian jadi berkelas.`,
      action5: isAmazon
        ? `Checkout CTA finale: Model holds the bag proudly in center framing, looking into lens speaking: "${dialogueLines[4]}", urging an immediate checkout.`
        : `Hero Packshot penutup: Model memegang tas di tengah frame, berbicara antusias ke kamera: "${dialogueLines[4]}", mengajak penonton checkout sekarang.`,
      itemPromptTerm: "luxury structured handbag"
    },
    sepatu: {
      action1: isAmazon
        ? `Direct-to-camera hook: Model steps into frame wearing the footwear, looking right into camera speaking: "${dialogueLines[0]}", showcasing aesthetic silhouette.`
        : `Model melangkah mantap, menatap langsung ke lensa kamera dengan artikulasi bibir alami berbicara: "${dialogueLines[0]}", memperlihatkan siluet sepatu yang estetik.`,
      action2: isAmazon
        ? `Ergonomic close-up: Model presses the cushioned insole while speaking on camera: "${dialogueLines[1]}", demonstrating plush memory-foam flexibility.`
        : `Model menekan insole empuk di depan kamera sambil berbicara: "${dialogueLines[1]}", menunjukkan busa ergonomis anti-pegal dan anti-lecet.`,
      action3: isAmazon
        ? `Dynamic stride: Model walks briskly with bouncy strides, smiling into camera speaking: "${dialogueLines[2]}", proving featherlight anti-slip traction.`
        : `Model melangkah lincah dan berbelok anggun, berbicara ke kamera dengan riang: "${dialogueLines[2]}", membuktikan sol luar anti-slip yang sangat ringan.`,
      action4: isAmazon
        ? `Leg-lengthening posture: Model stands tall admiring the footwear, speaking to camera: "${dialogueLines[3]}", showing how it elongates the silhouette.`
        : `Model berdiri tegap dengan postur percaya diri, menatap kamera berbicara: "${dialogueLines[3]}", potongan sepatunya membuat kaki terlihat lebih jenjang.`,
      action5: isAmazon
        ? `Checkout CTA finale: Model poses with footwear front and center, speaking eagerly: "${dialogueLines[4]}", directing audience to check out immediately.`
        : `Hero Packshot penutup: Model berpose memamerkan sepatu, menatap kamera dengan antusias berbicara: "${dialogueLines[4]}", mengajak checkout sebelum kehabisan.`,
      itemPromptTerm: "premium footwear sneakers/shoes"
    },
    aksesoris: {
      action1: isAmazon
        ? `Direct-to-camera hook: Model tilts head gently, sparkling jewelry catching camera light, speaking on camera: "${dialogueLines[0]}", radiating magnetic charm.`
        : `Model memiringkan kepala dengan kilau perhiasan memikat, menatap langsung ke kamera berbicara: "${dialogueLines[0]}", memancarkan pesona glamor.`,
      action2: isAmazon
        ? `Macro luxury detail: Model holds accessory close to lens, speaking: "${dialogueLines[1]}", highlighting tarnish-free, hypoallergenic polished finish.`
        : `Model memegang aksesoris dekat lensa kamera sambil berbicara: "${dialogueLines[1]}", menonjolkan bahan anti-karat, anti-pudar, dan aman di kulit sensitif.`,
      action3: isAmazon
        ? `Versatile styling: Model turns gracefully in daylight, speaking to camera: "${dialogueLines[2]}", showing how it instantly glams up casual wear.`
        : `Model bergerak anggun memamerkan pantulan kilau, berbicara ke kamera: "${dialogueLines[2]}", membuktikan kemampuannya menyulap outfit biasa jadi mewah.`,
      action4: isAmazon
        ? `Admiration moment: Model smiles with authentic confidence, speaking: "${dialogueLines[3]}", displaying an unmistakable quiet luxury aesthetic.`
        : `Model tersenyum puas menatap kamera, berbicara meyakinkan: "${dialogueLines[3]}", memancarkan aura 'old-money' yang anggun dan berkelas.`,
      action5: isAmazon
        ? `Checkout CTA finale: Model frames the accessory beautifully, speaking with high energy: "${dialogueLines[4]}", pointing viewers to the link to buy.`
        : `Hero Packshot penutup: Model menatap tajam dan ramah ke kamera, berbicara antusias: "${dialogueLines[4]}", mendorong penonton segera checkout.`,
      itemPromptTerm: "luxury shining jewelry accessory"
    }
  }[category];

  const cleanDescription = (description || productTitle || category).replace(/[\n\r]+/g, ' ').slice(0, 140);

  const scenesData = [
    {
      sceneNumber: 1,
      sceneTitle: isAmazon 
        ? "Scene 1: Direct-to-Camera Hook & Dynamic Arrival (0-6s)" 
        : "Adegan 1: Hook Pembuka & Model Berbicara Langsung (00:00 - 00:06)",
      duration: "00:00 - 00:06 (6 Detik)",
      cameraAngle: isAmazon 
        ? "Medium Close-Up Direct-to-Camera Hero Shot, 35mm Anamorphic Prime f/1.8" 
        : "Medium Close-Up Direct-to-Camera Hero Shot, Lensa Anamorphic 35mm f/1.8",
      cameraMotion: isAmazon 
        ? "Smooth Forward Tracking Dolly with Steady Push-in, 60fps" 
        : "Forward Tracking Dolly Halus dengan Push-in Sinematik, 60fps",
      lightingMood: isAmazon 
        ? "Warm Golden Hour Cinematic Sun Flare, Luminous Volumetric Rim Lighting, 8K Color Grade" 
        : "Golden Hour Sunlight Hangat, Volumetric Rim Light Memikat, Color Grade Iklan TV 8K",
      visualAction: categoryFocal.action1,
      spokenDialogue: dialogueLines[0],
      audioCues: "Bass drop halus menghentak (deep cinematic whoosh) diikuti dentingan melodi komersial modern yang memicu rasa penasaran.",
      basePrompt: `Direct-to-camera speaking shot. The ${subjectEn} walks forward in ${locationEn}, looks directly into the camera lens with articulate, natural lip-synchronization speaking on camera saying: "${dialogueLines[0]}". The ${categoryFocal.itemPromptTerm} (${cleanDescription}) is prominently featured with graceful natural motion, catching warm golden-hour rim lighting. Shot on 35mm anamorphic prime lens, shallow depth of field, fluid camera movement, photorealistic 8K TV commercial advertising cinematography, realistic mouth articulation and facial expression.`
    },
    {
      sceneNumber: 2,
      sceneTitle: isAmazon 
        ? "Scene 2: Craftsmanship Detail & Problem-Solution Speech (6-12s)" 
        : "Adegan 2: Detail Craftsmanship & Solusi Berbicara ke Kamera (00:06 - 00:12)",
      duration: "00:06 - 00:12 (6 Detik)",
      cameraAngle: isAmazon 
        ? "Close-Up Speaking with Product Showcase, 50mm Prime f/1.8 Lens" 
        : "Close-Up Model & Produk, Lensa 50mm f/1.8 Prime",
      cameraMotion: isAmazon 
        ? "Tactile Slow Orbital Slider Glide across Subject and Fine Details" 
        : "Slow Tactile Slider Glide Menelusuri Permukaan Produk dan Wajah Model",
      lightingMood: isAmazon 
        ? "Soft Diffused Commercial Studio Light with Crisp Specular Highlights" 
        : "Pencahayaan Studio Komersial Lembut dengan Kilau Refleksi Specular Bersih",
      visualAction: categoryFocal.action2,
      spokenDialogue: dialogueLines[1],
      audioCues: "Efek suara gesekan bahan halus yang jernih (subtle tactile ASMR swoosh) dipadu alunan beat instrumen yang semakin mengalir.",
      basePrompt: `Direct-to-camera demonstration shot. The ${subjectEn} presents the ${categoryFocal.itemPromptTerm} (${cleanDescription}) close to camera, maintaining eye contact and speaking with natural lip movement delivering: "${dialogueLines[1]}". Camera reveals exquisite texture, premium weave, and reinforced stitching. Soft diffused commercial key lighting, velvety soft bokeh in background, photorealistic 8K broadcast television commercial quality.`
    },
    {
      sceneNumber: 3,
      sceneTitle: isAmazon 
        ? "Scene 3: Dynamic Lifestyle Flow & Comfort Presentation (12-18s)" 
        : "Adegan 3: Lifestyle Dinamis & Model Bicara Kenyamanan (00:12 - 00:18)",
      duration: "00:12 - 00:18 (6 Detik)",
      cameraAngle: isAmazon 
        ? "Eye-Level Medium Tracking Shot, 50mm Prime Lens f/1.4" 
        : "Eye-Level Medium Tracking Shot, Lensa 50mm Prime f/1.4",
      cameraMotion: isAmazon 
        ? "Steadicam Tracking Orbit moving alongside the speaking subject" 
        : "Fluid Steadicam Orbit Mengitari Model yang Berbicara Sambil Bergerak",
      lightingMood: isAmazon 
        ? "Natural Ambient Daylight, Vibrant Balanced Dynamic Range, Crisp Contemporary Mood" 
        : "Cahaya Alami Siang Hari yang Cerah, Kontras Tajam Berwarna Hidup, Nuansa Segar",
      visualAction: categoryFocal.action3,
      spokenDialogue: dialogueLines[2],
      audioCues: "Irama drum upbeat enerjik bersemangat merefleksikan rasa percaya diri dan gaya hidup modern yang aktif.",
      basePrompt: `Dynamic lifestyle speaking shot. Fluid tracking shot alongside ${subjectEn} moving naturally through ${locationEn}, looking at camera with a warm engaging smile while speaking on camera: "${dialogueLines[2]}". Showcasing the effortless comfort, breathability, and flattering motion of the ${categoryFocal.itemPromptTerm} (${cleanDescription}). 50mm lens f/1.4, natural cinematic lighting, energetic commercial pacing, vivid crisp colors, authentic lip-sync.`
    },
    {
      sceneNumber: 4,
      sceneTitle: isAmazon 
        ? "Scene 4: Confidence Drape & Sincere Recommendation (18-24s)" 
        : "Adegan 4: Siluet Percaya Diri & Rekomendasi Tulus ke Kamera (00:18 - 00:24)",
      duration: "00:18 - 00:24 (6 Detik)",
      cameraAngle: isAmazon 
        ? "Medium Close-Up Portrait Shot, 85mm Portrait Telephoto f/1.8" 
        : "Medium Close-Up Portrait, Lensa Portrait 85mm f/1.8",
      cameraMotion: isAmazon 
        ? "Gentle Pedestal Rise framing the expressive face and silhouette" 
        : "Pedestal Crane Naik Perlahan Membingkai Senyum Puas & Postur Model",
      lightingMood: isAmazon 
        ? "High-Key Commercial Glamour Lighting, Luminous Skin Tones & Warm Glow" 
        : "Glamour Key Lighting Berstandar Iklan Kosmetik/Fashion, Cahaya Wajah Berpendar Sehat",
      visualAction: categoryFocal.action4,
      spokenDialogue: dialogueLines[3],
      audioCues: "Harmoni vokal manis atau melodi piano lembut berpadu senar string yang menaikkan emosi kepuasan penonton.",
      basePrompt: `Glamorous medium close-up portrait speaking shot on 85mm portrait telephoto lens. The ${subjectEn} beams with radiant satisfaction, looking directly into the camera lens with convincing natural mouth movements saying: "${dialogueLines[3]}". Wearing the ${categoryFocal.itemPromptTerm} (${cleanDescription}). Creamy circular bokeh in background, luminous softbox beauty lighting, high-fashion television commercial color grading, 8K ultra detail.`
    },
    {
      sceneNumber: 5,
      sceneTitle: isAmazon 
        ? "Scene 5: Hero Packshot & Immediate Checkout Call-to-Action (24-30s)" 
        : "Adegan 5: Grand Finale Hero Packshot & Ajakan Checkout Langsung (00:24 - 00:30)",
      duration: "00:24 - 00:30 (6 Detik)",
      cameraAngle: isAmazon 
        ? "Symmetrical Center-Framed Commercial Hero Shot, 70mm Commercial Prime" 
        : "Symmetrical Center-Framed Hero Packshot, Lensa Komersial 70mm",
      cameraMotion: isAmazon 
        ? "Controlled Slow Tracking Pullback with Product Gesture" 
        : "Slow Tracking Pullback Terkontrol dengan Model Menunjuk ke Tombol Belanja",
      lightingMood: isAmazon 
        ? "High-Impact Commercial Spotlight with Radiant Halo Edge Glow, Clean Luxury Backdrop" 
        : "Pencahayaan Spotlight Komersial Mewah, Efek Halo Lembut Mengelilingi Produk",
      visualAction: categoryFocal.action5,
      spokenDialogue: dialogueLines[4],
      audioCues: "Klimaks musik jingle ceria penutup diakhiri denting lonceng 'ding' yang ramah saat model mengarahkan ke tombol checkout.",
      basePrompt: `Grand finale center-framed hero commercial packshot with direct-to-camera checkout call-to-action. The ${subjectEn} gracefully presents the ${categoryFocal.itemPromptTerm} (${cleanDescription}) in pristine focus, looking warmly into the camera lens with clear lip-sync speaking urgently: "${dialogueLines[4]}", gesturing invitingly toward the call-to-action button. Controlled cinematic pullback dolly movement, clean minimalist luxury commercial set, broadcast-ready 8K masterpiece.`
    }
  ];

  return scenesData.map(scene => {
    const aiPrompt916 = `Cinematic 4K vertical TV commercial video (9:16 aspect ratio). Scene ${scene.sceneNumber} (${scene.duration}): ${scene.basePrompt} Aspect Ratio: 9:16 vertical framing, mobile video composition, TikTok, Instagram Reels, and YouTube Shorts format, full vertical screen framing, photorealistic 8K, --ar 9:16`;
    const aiPrompt169 = `Cinematic 4K widescreen TV commercial video (16:9 aspect ratio). Scene ${scene.sceneNumber} (${scene.duration}): ${scene.basePrompt} Aspect Ratio: 16:9 widescreen cinematic framing, broadcast television commercial landscape composition, horizontal studio framing, photorealistic 8K, --ar 16:9`;

    return {
      sceneNumber: scene.sceneNumber,
      sceneTitle: scene.sceneTitle,
      duration: scene.duration,
      cameraAngle: scene.cameraAngle,
      cameraMotion: scene.cameraMotion,
      lightingMood: scene.lightingMood,
      visualAction: scene.visualAction,
      spokenDialogue: scene.spokenDialogue,
      aiPrompt: aiPrompt916,
      aiPrompt916,
      aiPrompt169,
      audioCues: scene.audioCues
    };
  });
}

/**
 * Generates custom 5-scene TVC prompts using Gemini API, with automatic graceful fallback.
 * Ensures the on-screen model speaks the selling narrative directly into the camera lens
 * and provides dual aspect ratio prompts (9:16 and 16:9).
 */
export async function generateTvcVideoScenesWithAi(params: {
  category: ProductCategory;
  description: string;
  market: ModelMarket;
  modelType: ModelType;
  location: LocationType;
  productTitle?: string;
  narrative?: string;
}): Promise<VideoScenePrompt[]> {
  const proceduralScenes = createProceduralTvcScenes(params);

  if (!process.env.GEMINI_API_KEY) {
    return proceduralScenes;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const isAmazon = params.market === 'amazon';
    const dialogueLines = extractFiveDialogueLines(params.narrative, params.category, isAmazon);

    const prompt = `You are an elite, award-winning Television Commercial (TVC) Film Director and Commercial Cinematographer (expert in luxury 30-second fashion & lifestyle TV ads, Shopee Video, TikTok Ads, and Global Shoppable Videos).

Create exactly 5 PRO-GRADE TELEVISION COMMERCIAL SCENE PROMPTS (30-second TVC storyboard) where THE ON-SCREEN MODEL SPEAKS DIRECTLY INTO THE CAMERA LENS DELIVERING THE SELLING NARRATIVE DIALOGUE IN EACH SCENE (Direct-to-Camera Lip-Sync Dialogue).
Also provide dual AI video prompts for BOTH 9:16 (Vertical TikTok/Reels) and 16:9 (Widescreen TV/YouTube) aspect ratios.

PRODUCT CATEGORY: ${params.category}
TARGET MARKET: ${params.market === 'amazon' ? 'USA / Global International Market (Universal American/Global Models)' : 'Indonesia (Shopee & TikTok Creators)'}
MODEL TYPE: ${params.modelType}
LOCATION/SETTING: ${params.location}
PRODUCT DETAILS:
"""
${params.description || params.productTitle || params.category}
"""
SELLING NARRATIVE REFERENCE (5 Key Lines to be spoken on-camera across scenes 1 to 5):
Scene 1 Hook: "${dialogueLines[0]}"
Scene 2 Problem/Solution: "${dialogueLines[1]}"
Scene 3 Sensory/Comfort: "${dialogueLines[2]}"
Scene 4 Confidence/Style: "${dialogueLines[3]}"
Scene 5 Checkout CTA: "${dialogueLines[4]}"

CRITICAL CINEMATOGRAPHY & DIRECTING RULES FOR EVERY SCENE:
- UNIVERSAL PRODUCTION: Do not mention specific brand names like "Amazon" or "(Amazon)" anywhere in titles, actions, or AI prompts. Keep all scenes 100% universal.
- DIRECT-TO-CAMERA MODEL SPEAKING (MANDATORY): In every scene, the model looks directly into the camera lens with articulate lip movements and convincing facial expressions, speaking on-camera delivering the specific dialogue line for that scene.
- DUAL ASPECT RATIO PROMPTS:
  * "aiPrompt916": English prompt specifically crafted for 9:16 vertical video (Runway Gen-3, Kling AI, Sora, Luma Dream Machine) with vertical framing commands and "--ar 9:16".
  * "aiPrompt169": English prompt specifically crafted for 16:9 widescreen video (Runway Gen-3, Kling AI, Sora, Luma Dream Machine) with landscape television framing commands and "--ar 16:9".
1. Exactly 5 sequential scenes spanning 30 seconds total:
   - Scene 1 (00:00 - 00:06): Direct-to-Camera Hook & Dynamic Arrival
   - Scene 2 (00:06 - 00:12): Craftsmanship Detail & Problem-Solution Speech
   - Scene 3 (00:12 - 00:18): Dynamic Lifestyle Motion & Comfort Presentation
   - Scene 4 (00:18 - 00:24): Silhouette Drape & Sincere Social Recommendation
   - Scene 5 (00:24 - 00:30): Iconic Hero Packshot & Immediate Checkout Call-to-Action

2. For each scene, specify:
   - "sceneNumber": 1, 2, 3, 4, or 5
   - "sceneTitle": Punchy professional scene title (in ${isAmazon ? 'English' : 'Indonesian'})
   - "duration": Timing string e.g. "00:00 - 00:06 (6 Detik)"
   - "spokenDialogue": The exact sentence spoken on-camera by the model in this scene
   - "cameraAngle": Professional lens and shot type (e.g., "Medium Close-Up Direct-to-Camera Hero Shot, 35mm Anamorphic Prime f/1.8")
   - "cameraMotion": Exact gimbal/dolly/crane movement (e.g., "Smooth forward tracking dolly with steady push-in, 60fps")
   - "lightingMood": Atmospheric lighting setup (e.g., "Warm golden hour volumetric sun flare, soft diffused rim light, commercial 8K color grade")
   - "visualAction": Specific actor blocking, facial lip-sync articulation, and product demonstration in ${isAmazon ? 'English' : 'Indonesian'}
   - "aiPrompt916": English master prompt tailored for 9:16 vertical video with direct-to-camera dialogue instruction and "--ar 9:16"
   - "aiPrompt169": English master prompt tailored for 16:9 widescreen video with direct-to-camera dialogue instruction and "--ar 16:9"
   - "aiPrompt": Default master prompt (9:16)
   - "audioCues": Commercial SFX and musical beat suggestion.

Respond ONLY with valid JSON array of 5 objects matching this schema:
[
  {
    "sceneNumber": 1,
    "sceneTitle": "...",
    "duration": "00:00 - 00:06",
    "spokenDialogue": "...",
    "cameraAngle": "...",
    "cameraMotion": "...",
    "lightingMood": "...",
    "visualAction": "...",
    "aiPrompt916": "...",
    "aiPrompt169": "...",
    "aiPrompt": "...",
    "audioCues": "..."
  },
  ...
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json"
      }
    });

    let text = response.text || "[]";
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed) && parsed.length === 5) {
      return parsed.map((item, idx) => {
        const fallback = proceduralScenes[idx];
        const prompt916 = item.aiPrompt916 || item.aiPrompt || fallback.aiPrompt916 || fallback.aiPrompt;
        const prompt169 = item.aiPrompt169 || fallback.aiPrompt169 || prompt916;

        return {
          sceneNumber: item.sceneNumber || idx + 1,
          sceneTitle: item.sceneTitle || fallback.sceneTitle,
          duration: item.duration || fallback.duration,
          spokenDialogue: item.spokenDialogue || fallback.spokenDialogue || dialogueLines[idx],
          cameraAngle: item.cameraAngle || fallback.cameraAngle,
          cameraMotion: item.cameraMotion || fallback.cameraMotion,
          lightingMood: item.lightingMood || fallback.lightingMood,
          visualAction: item.visualAction || fallback.visualAction,
          aiPrompt: prompt916,
          aiPrompt916: prompt916,
          aiPrompt169: prompt169,
          audioCues: item.audioCues || fallback.audioCues
        };
      });
    }

    return proceduralScenes;
  } catch (err) {
    console.warn("AI TVC generation fallback to procedural:", err);
    return proceduralScenes;
  }
}
