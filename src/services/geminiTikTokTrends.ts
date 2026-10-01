import { GoogleGenAI } from '@google/genai';
import { 
  TikTokTrendingProduct, 
  TikTokSoundTrend, 
  TikTokHashtagTrend, 
  TikTokTrendResearchResult 
} from '../types/tiktokTrends';
import { 
  INITIAL_TIKTOK_PRODUCTS, 
  INITIAL_TIKTOK_SOUNDS, 
  INITIAL_TIKTOK_HASHTAGS 
} from '../data/initialTikTokTrends';

export interface TikTokFilterParams {
  category: string;
  metric: string;
  priceRange: string;
  customKeyword?: string;
}

export async function runTikTokTrendAnalysis(
  params: TikTokFilterParams
): Promise<TikTokTrendResearchResult> {
  const now = new Date();
  const analysisDate = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const analysisTime = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const apiKey = process.env.GEMINI_API_KEY;

  // If no API key, filter from our rich dataset
  if (!apiKey) {
    return filterLocalTikTokTrends(params, analysisDate, analysisTime);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Anda adalah spesialis analisis tren algoritma TikTok & TikTok Shop Creative Center Indonesia.
Analisis dan kurasi tren produk fisik yang sedang meledak / FYP viral di TikTok Indonesia HARI INI (${analysisDate}).

Parameter Pengguna:
- Kategori Target: ${params.category || 'Semua Kategori (Fashion, Skincare, Home Living, Aksesoris)'}
- Metrik Filter: ${params.metric || 'Paling Viral & FYP Velocity Tinggi'}
- Rentang Harga: ${params.priceRange || 'Semua Harga'}
${params.customKeyword ? `- Niche / Kata Kunci Khusus: "${params.customKeyword}"` : ''}

INSTRUKSI PENTING:
1. Kurasi 8-10 produk nyata yang saat ini ramai di FYP TikTok Indonesia dengan engagement tinggi.
2. Setiap produk harus memiliki:
   - FYP Velocity Score (0-100)
   - Judul lagu / sound viral TikTok yang paling pas untuk produk tersebut (dengan tips pemakaian sound)
   - Format video paling laris (contoh: "POV Racun TikTok", "Before-After Try On", "ASMR Test", "1 Item 4 Style", "What Fits in My Bag")
   - Target audiens spesifik (contoh: Gen Z, Cewek Kue, Mahasiswi, Ibu Muda)
   - Mengapa produk ini viral (psikologi audiens & pemicu algoritma TikTok)
   - 3 hook pembuka 3 detik (scroll-stopper verbal & visual)
   - Script selling narrative video TikTok Shop (durasi maksimal 30-40 detik) dengan POLA MUTLAK:
     * HOOK (0-3s): Kalimat pembuka menghentak & scroll-stopping
     * MASALAH (3-10s): Masalah & keresahan nyata audiens
     * SOLUSI (10-18s): Solusi produk nyata menjawab masalah tersebut
     * 3 MANFAAT (18-28s): 3 manfaat utama produk yang konkret
     * CTA (28-35/40s): WAJIB persis kalimat ini: "buruan ambil dikeranjang video ini ya tepatnya Evashop!"
     * Arahan kamera & transisi TikTok
   - 4-5 hashtag trending TikTok
   - Estimasi harga & perkiraan penjualan TikTok Shop
3. Sertakan juga 3-4 sound musik TikTok yang sedang naik daun dan 4-5 hashtag trending.

Keluarkan hasil HANYA dalam bentuk JSON murni (valid JSON, tanpa bungkus markdown \`\`\`json) dengan format:
{
  "products": [
    {
      "id": "tt_custom_1",
      "rank": 1,
      "name": "Nama Produk Lengkap",
      "category": "Kategori Produk",
      "priceRange": "Rp...",
      "originalPrice": "Rp...",
      "discount": "30%",
      "salesEstimate": "10k+ terjual di TikTok Shop",
      "viewsCount": "20.5M Views",
      "growthRate": "+450% dlm 48 jam",
      "fypScore": 96,
      "viralityScore": 95,
      "conversionPotential": 92,
      "isBreakout": true,
      "recommendedAudio": {
        "name": "Nama Sound Viral TikTok",
        "author": "Nama Kreator / Artis",
        "type": "Sped Up Beat",
        "usageTip": "Cara pakai sound di transisi video"
      },
      "viralFormat": "Format video paling efektif di TikTok",
      "targetAudience": "Target audiens",
      "whyItIsViral": "Alasan psikologis & algoritma kenapa produk ini viral",
      "signals": ["FYP Velocity Tinggi", "Sound Matching", "Impulse Buy"],
      "keyHooks": [
        "Hook pembuka 1",
        "Hook pembuka 2",
        "Hook pembuka 3"
      ],
      "script30s": {
        "hook": "0-3s kalimat pembuka scroll stopper",
        "problem": "3-10s masalah nyata audiens",
        "solution": "10-18s solusi produk mengatasi masalah",
        "threeBenefits": [
          "Manfaat 1: ...",
          "Manfaat 2: ...",
          "Manfaat 3: ..."
        ],
        "demonstration": "10-22s solusi dan 3 manfaat utama",
        "cta": "buruan ambil dikeranjang video ini ya tepatnya Evashop!",
        "cameraDirections": "Arahan kamera dan transisi"
      },
      "topHashtags": ["#racuntiktok", "#tiktokshop", "#fyp"],
      "keyAdvantages": [
        "Keunggulan 1",
        "Keunggulan 2",
        "Keunggulan 3"
      ],
      "tiktokShopUrl": "https://www.tiktok.com/search?q=kata+kunci+produk"
    }
  ],
  "sounds": [
    {
      "id": "snd_1",
      "title": "Nama Sound",
      "creator": "Kreator",
      "tag": "Trending TikTok",
      "totalVideos": "1.5M Video",
      "growth": "+320% Hari Ini",
      "vibe": "Energetic",
      "bestProductFit": "Tipe produk yang cocok"
    }
  ],
  "hashtags": [
    {
      "tag": "#namatag",
      "views": "15B Views",
      "growth": "+12% minggu ini",
      "description": "Deskripsi singkat"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '';
    const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    if (parsed.products && Array.isArray(parsed.products) && parsed.products.length > 0) {
      const sanitizedProducts = parsed.products.map((p: any, idx: number) => {
        const threeBenefits = Array.isArray(p.script30s?.threeBenefits) && p.script30s.threeBenefits.length > 0
          ? p.script30s.threeBenefits
          : (Array.isArray(p.keyAdvantages) && p.keyAdvantages.length > 0
              ? p.keyAdvantages.slice(0, 3)
              : ['Kualitas bahan premium dan awet', 'Sangat nyaman & fungsional untuk pemakaian harian', 'Desain modern yang bikin penampilan langsung naik kelas']);

        return {
          ...p,
          rank: p.rank || idx + 1,
          script30s: {
            hook: p.script30s?.hook || `Stop scrolling! Kalau kamu nyari ${p.name || 'produk ini'} yang lagi viral dengan kualitas bintang lima, ini jawabannya!`,
            problem: p.script30s?.problem || 'Pasti sebel kan kalau beli barang murah tapi baru dipakai sebentar udah rusak, gak nyaman, dan bikin kecewa?',
            solution: p.script30s?.solution || `Nah ${p.name || 'produk ini'} hadir jadi solusi tuntas yang mengatasi semua masalah itu.`,
            threeBenefits,
            demonstration: p.script30s?.demonstration || `${p.script30s?.solution || ''} ${threeBenefits.join('. ')}`.trim(),
            cta: 'buruan ambil dikeranjang video ini ya tepatnya Evashop!',
            cameraDirections: p.script30s?.cameraDirections || '0-3s: Close up ekspresi kagum. 3-10s: Tunjukkan keresahan. 10-18s: Tunjukkan fisik produk solusi. 18-28s: Uji 3 manfaat nyata. 28-35s: Arahkan jari ke keranjang video Evashop.',
          },
          tiktokShopUrl:
            p.tiktokShopUrl && typeof p.tiktokShopUrl === 'string' && p.tiktokShopUrl.startsWith('http')
              ? p.tiktokShopUrl
              : `https://www.tiktok.com/search?q=${encodeURIComponent(p.name || 'produk viral')}`,
        };
      });
      const topBreakout = sanitizedProducts.filter((p: any) => p.isBreakout || p.rank <= 3);
      return {
        products: sanitizedProducts,
        topBreakout: topBreakout.length > 0 ? topBreakout : sanitizedProducts.slice(0, 3),
        sounds: parsed.sounds && parsed.sounds.length > 0 ? parsed.sounds : INITIAL_TIKTOK_SOUNDS,
        hashtags: parsed.hashtags && parsed.hashtags.length > 0 ? parsed.hashtags : INITIAL_TIKTOK_HASHTAGS,
        analysisDate,
        analysisTime,
        totalAnalyzedVideos: '14.2M Video & Live Stream TikTok',
        isLive: true,
      };
    }

    return filterLocalTikTokTrends(params, analysisDate, analysisTime);
  } catch (error) {
    console.warn('Gemini TikTok research fallback to curated trends:', error);
    return filterLocalTikTokTrends(params, analysisDate, analysisTime);
  }
}

function filterLocalTikTokTrends(
  params: TikTokFilterParams,
  analysisDate: string,
  analysisTime: string
): TikTokTrendResearchResult {
  let filtered = [...INITIAL_TIKTOK_PRODUCTS];

  // Category filter
  if (params.category && params.category !== 'all' && params.category !== 'Semua Kategori') {
    filtered = filtered.filter((p) =>
      p.category.toLowerCase().includes(params.category.toLowerCase())
    );
  }

  // Keyword filter
  if (params.customKeyword && params.customKeyword.trim()) {
    const kw = params.customKeyword.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        p.category.toLowerCase().includes(kw) ||
        p.targetAudience.toLowerCase().includes(kw) ||
        p.whyItIsViral.toLowerCase().includes(kw) ||
        p.topHashtags.some((h) => h.toLowerCase().includes(kw))
    );
    if (filtered.length === 0) {
      // If none matches, return all but rank relevant first
      filtered = [...INITIAL_TIKTOK_PRODUCTS];
    }
  }

  // Metric sorting
  if (params.metric === 'breakout') {
    filtered.sort((a, b) => (b.isBreakout ? 1 : 0) - (a.isBreakout ? 1 : 0));
  } else if (params.metric === 'virality') {
    filtered.sort((a, b) => b.viralityScore - a.viralityScore);
  } else if (params.metric === 'conversion') {
    filtered.sort((a, b) => b.conversionPotential - a.conversionPotential);
  } else {
    // Default FYP score
    filtered.sort((a, b) => b.fypScore - a.fypScore);
  }

  // Re-rank and ensure valid tiktokShopUrl
  filtered = filtered.map((p, idx) => ({
    ...p,
    rank: idx + 1,
    isTop1: idx === 0,
    tiktokShopUrl: p.tiktokShopUrl || `https://www.tiktok.com/search?q=${encodeURIComponent(p.name)}`,
  }));

  const topBreakout = filtered.filter((p) => p.isBreakout).slice(0, 3);

  return {
    products: filtered,
    topBreakout: topBreakout.length > 0 ? topBreakout : filtered.slice(0, 3),
    sounds: INITIAL_TIKTOK_SOUNDS,
    hashtags: INITIAL_TIKTOK_HASHTAGS,
    analysisDate,
    analysisTime,
    totalAnalyzedVideos: '14.2M Video & Live Stream TikTok',
    isLive: false,
  };
}
