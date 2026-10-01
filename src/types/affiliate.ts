export interface ProductScores {
  popularity: number; // 0-100 (25%)
  conversion: number; // 0-100 (20%)
  content: number; // 0-100 (20%)
  visualAppeal: number; // 0-100 (15%)
  priceAppeal: number; // 0-100 (10%)
  reviewStrength: number; // 0-100 (5%)
  trendPotential: number; // 0-100 (5%)
  evaScore: number; // calculated weighted 0-100
}

export type PopularityStatus = 'Sangat tinggi' | 'Tinggi' | 'Sedang' | 'Tidak dapat diverifikasi';

export interface ShopeeProduct {
  id: string;
  rank: number;
  name: string;
  category: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating?: string; // e.g. "4.8" or "Data tidak tersedia"
  reviewCount?: string; // e.g. "1.2k" or "Data tidak tersedia"
  soldCount?: string; // "Data tidak tersedia" if not strictly verifiable
  popularityStatus: PopularityStatus;
  signals: string[]; // e.g. ["rating tinggi", "banyak ulasan", "harga promo", "sedang populer", "visual menarik", "cocok untuk video"]
  scores: ProductScores;
  contentPotentialFlame: number; // 1 to 5
  conversionPotentialFlame: number; // 1 to 5
  recommendationReason: string; // 2-4 sentences
  shopeeUrl: string; // Actual Shopee URL or fallback text
  affiliateUrl?: string; // Custom Eva Shop affiliate link
  isTopChoice?: boolean; // 🏆 Produk Terbaik Hari Ini
  isTopVideo?: boolean; // 🎬 Top 3 Video
  isHiddenGem?: boolean; // 🌟 Produk Belum Tentu #1 Tapi Bagus untuk Konten
  keyAdvantages?: string[];
  fabricOrMaterial?: string;
  colorOptions?: string[];
}

export interface VideoHookConcept {
  productId: string;
  productName: string;
  reason: string;
  hook: string;
  problem: string;
  solution: string;
  advantages: string[];
  cta: string;
}

export interface ContentGeneration {
  videoTitle: string;
  hook3s: string;
  script15s: string;
  script30s: string;
  script60s: string;
  captionTikTok: string;
  captionFacebook: string;
  captionInstagram: string;
  shortsDescription: string;
  hashtags: string[];
  keywords: string[];
  ctaAffiliate: string;
}

export interface ViralContent {
  hook: string;
  problem: string;
  solution: string;
  proof: string;
  benefit: string;
  cta: string;
}

export interface EvaArticleFaq {
  question: string;
  answer: string;
}

export interface EvaArticleSeo {
  seoTitle: string;
  metaDescription: string; // max ~155 chars
  primaryKeyword: string;
  secondaryKeywords: string[];
  longTailKeywords: string[];
  slug: string;
  hashtags: string[]; // 5 hashtags
  imageAltText: string;
  searchIntent: string;
}

export interface EvaArticle {
  title: string;
  intro: string;
  whyPopular: string;
  advantages: string;
  productDetails: string;
  targetAudience: string;
  importantNotes: string;
  conclusion: string;
  faq: EvaArticleFaq[];
  ctaText: string;
  seo: EvaArticleSeo;
  fullMarkdown: string;
  fullHtml: string;
  wordCount: number;
}

export interface FashionImagePrompt {
  prompt: string;
  aspectRatio: string;
  lighting: string;
  modelStyle: string;
}

export interface FashionVideoPrompt {
  duration5s: string;
  duration10s: string;
  duration15s: string;
  cameraMovement: string;
}

export interface BloggerBlog {
  id: string;
  name: string;
  url: string;
  postsCount?: number;
}

export interface BloggerAuth {
  isConnected: boolean;
  accessToken: string | null;
  selectedBlog: BloggerBlog | null;
  blogs: BloggerBlog[];
  error: string | null;
  clientId?: string;
}
