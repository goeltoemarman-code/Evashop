export interface TikTokTrendingProduct {
  id: string;
  rank: number;
  name: string;
  category: string;
  priceRange: string;
  originalPrice?: string;
  discount?: string;
  salesEstimate: string; // e.g. "15.8k+ terjual di TikTok Shop" or "Data tidak tersedia"
  viewsCount: string; // e.g. "24.5M Views"
  growthRate: string; // e.g. "+420% dlm 48 jam"
  fypScore: number; // 0 - 100
  viralityScore: number; // 0 - 100
  conversionPotential: number; // 0 - 100
  recommendedAudio: {
    name: string;
    author: string;
    type: 'Trending Sound' | 'Viral Remake' | 'Aesthetic Lo-fi' | 'Sped Up Beat' | 'Voiceover Sound';
    usageTip: string;
  };
  viralFormat: string; // e.g. "POV Racun TikTok", "Before-After Try On", "Aesthetic Day In My Life"
  targetAudience: string; // e.g. "Gen Z & Mahasiswi", "Ibu Muda & Hijabers"
  whyItIsViral: string; // Analisis psikologi audiens & pemicu algoritma FYP
  signals: string[]; // e.g. ['FYP Velocity Tinggi', 'Sound Matching', 'Impulse Buy', 'Banyak Stitch/Duet']
  keyHooks: string[]; // 3-5 hook kalimat pembuka 3 detik
  script30s: {
    hook: string; // 0-3s Hook pembuka scroll-stopper
    problem: string; // 3-10s Masalah & pain point audiens
    solution?: string; // 10-18s Solusi produk nyata
    threeBenefits?: string[]; // 18-28s 3 Manfaat utama produk
    demonstration: string; // 10-22s Solusi & demonstrasi (kompatibel)
    cta: string; // 28-35/40s: "buruan ambil dikeranjang video ini ya tepatnya Evashop!"
    cameraDirections: string; // Arahan kamera & transisi video
  };
  topHashtags: string[];
  isBreakout?: boolean;
  isTop1?: boolean;
  tiktokShopUrl?: string;
  keyAdvantages: string[];
}

export interface TikTokSoundTrend {
  id: string;
  title: string;
  creator: string;
  tag: string;
  totalVideos: string;
  growth: string;
  vibe: string;
  bestProductFit: string;
}

export interface TikTokHashtagTrend {
  tag: string;
  views: string;
  growth: string;
  description: string;
}

export interface TikTokTrendResearchResult {
  products: TikTokTrendingProduct[];
  topBreakout: TikTokTrendingProduct[];
  sounds: TikTokSoundTrend[];
  hashtags: TikTokHashtagTrend[];
  analysisDate: string;
  analysisTime: string;
  totalAnalyzedVideos: string;
  isLive: boolean;
}
