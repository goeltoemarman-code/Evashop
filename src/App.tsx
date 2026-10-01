/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { 
  Upload, Image as ImageIcon, User, Users, UserPlus, Sparkles, Loader2, Download, 
  RefreshCw, AlertCircle, Check, Copy, Volume2, Mic, Map, Camera, Bed, Building, 
  Home, ShoppingBag, Pencil, Shirt, Footprints, Briefcase, Gem, FileText, Search, 
  CheckCircle2, HelpCircle, ThumbsUp, ThumbsDown, Target, Lightbulb, AlertTriangle,
  ChevronDown, ChevronUp, Share2, BookOpen, ShieldCheck, RotateCcw, Save, Zap,
  FileUp, AlignLeft, Trash2, Info, Paperclip, Globe, Languages, Code, Eye, Link as LinkIcon, PlayCircle,
  Clapperboard, Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoScenePrompt } from './types/videoScenes';
import { TvcVideoScenesSection } from './components/video/TvcVideoScenesSection';
import { createProceduralTvcScenes } from './services/videoScenesGenerator';

// --- Types ---
type ProductCategory = 'pakaian' | 'tas' | 'sepatu' | 'aksesoris';
type ModelType = 'wanita' | 'pria' | 'couple' | 'grup';
type ModelMarket = 'indonesia' | 'amazon';
type LocationType = 'lapangan' | 'studio' | 'hotel' | 'gereja' | 'teras' | 'mall';

interface SeoFaqItem {
  question: string;
  answer: string;
}

interface SeoArticle {
  title: string; // H1: Judul Artikel (Otomatis)
  mainKeyword?: string;
  introParagraphs?: string[]; // Minimal 4 Paragraf Pembuka Lengkap
  problem?: string; // Paragraf 1: Masalah & Keresahan Konsumen
  solution?: string; // Paragraf 2: Solusi & Jawaban Tuntas
  proof?: string; // Paragraf 3: Bukti Kualitas & Realita Pemakaian
  advantages?: string; // Paragraf 4: Kelebihan & Daya Tarik Utama
  limitations?: string; // Paragraf 5: Catatan Realistis & Rekomendasi
  conclusionAndCta?: string; // Paragraf 6: Kesimpulan & Rekomendasi / CTA
  introduction?: string;
  specifications?: string; // H2: Spesifikasi Lengkap & Pilihan Warna
  stylingTips?: string; // H2: Tips Padu Padan dengan Outfit Harian
  price?: string; // Kotak Harga Promo
  pros?: string[];
  cons?: string[];
  faq?: SeoFaqItem[];
  cta?: string;
  fullArticle?: string;
  htmlTemplate?: string;
}

interface MarketingContent {
  title: string;
  titleAmazon?: string;
  narrative: string;
  narrativeAmazon?: string;
  keywords: string;
  keywordsAmazon?: string;
  tags: string[];
  tagsAmazon?: string[];
  videoScenes?: VideoScenePrompt[];
  videoScenesAmazon?: VideoScenePrompt[];
  amazon?: {
    title?: string;
    narrative?: string;
    keywords?: string;
    tags?: string[];
    videoScenes?: VideoScenePrompt[];
  };
  seoArticle?: SeoArticle;
  seoArticleEn?: SeoArticle;
}

interface GeneratedImage {
  url: string;
  id: string;
  marketing?: MarketingContent;
  audioUrl?: string;
  audioUrlAmazon?: string;
  isGeneratingAudio?: boolean;
  isGeneratingAudioAmazon?: boolean;
}

const createWavFile = (base64Pcm: string, volumeBoostMultiplier: number = 1.35): string => {
  const binaryString = window.atob(base64Pcm);
  const len = binaryString.length;
  const rawBytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    rawBytes[i] = binaryString.charCodeAt(i);
  }
  
  // 16-bit PCM Audio Processing: Dynamic Loudness Normalization & Volume Boost
  const numSamples = Math.floor(len / 2);
  const pcmView = new DataView(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);
  
  let maxAbs = 0;
  for (let i = 0; i < numSamples; i++) {
    const val = Math.abs(pcmView.getInt16(i * 2, true));
    if (val > maxAbs) maxAbs = val;
  }

  // Calculate energetic gain multiplier to maximize loudness while preventing clipping
  let gain = volumeBoostMultiplier;
  if (maxAbs > 0) {
    const normalizedGain = 31500 / maxAbs; // Target 96% peak loudness
    gain = Math.max(gain, normalizedGain);
    gain = Math.min(gain, 2.8); // Cap gain to prevent extreme noise floor boost
  }

  const processedBytes = new Uint8Array(len);
  const outView = new DataView(processedBytes.buffer);
  for (let i = 0; i < numSamples; i++) {
    const sample = pcmView.getInt16(i * 2, true);
    let boosted = sample * gain;
    // Soft limiting to prevent harsh audio distortion/clipping
    if (boosted > 32760) boosted = 32760;
    else if (boosted < -32760) boosted = -32760;
    outView.setInt16(i * 2, Math.round(boosted), true);
  }
  
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  
  const writeString = (v: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      v.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + processedBytes.length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, processedBytes.length, true);
  
  const wavBytes = new Uint8Array(44 + processedBytes.length);
  wavBytes.set(new Uint8Array(wavHeader), 0);
  wavBytes.set(processedBytes, 44);
  
  const blob = new Blob([wavBytes], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

// --- Constants ---
const CATEGORY_LABELS: Record<ProductCategory, string> = {
  pakaian: 'Pakaian',
  tas: 'Tas',
  sepatu: 'Sepatu',
  aksesoris: 'Aksesoris',
};

const CATEGORY_ICONS: Record<ProductCategory, React.ReactNode> = {
  pakaian: <Shirt className="w-4 h-4" />,
  tas: <Briefcase className="w-4 h-4" />,
  sepatu: <Footprints className="w-4 h-4" />,
  aksesoris: <Gem className="w-4 h-4" />,
};

const MODEL_LABELS: Record<ModelType, string> = {
  wanita: 'Wanita',
  pria: 'Pria',
  couple: 'Couple',
  grup: 'Grup',
};

const MODEL_ICONS: Record<ModelType, React.ReactNode> = {
  wanita: <User className="w-4 h-4" />,
  pria: <User className="w-4 h-4" />,
  couple: <UserPlus className="w-4 h-4" />,
  grup: <Users className="w-4 h-4" />,
};

const LOCATION_LABELS: Record<LocationType, string> = {
  lapangan: 'Di Taman Kota',
  studio: 'Studio Eva Shop',
  hotel: 'Kamar Hotel',
  gereja: 'Gereja',
  teras: 'Teras Rumah',
  mall: 'Di Dalam Mall',
};

const LOCATION_ICONS: Record<LocationType, React.ReactNode> = {
  lapangan: <Map className="w-4 h-4" />,
  studio: <Camera className="w-4 h-4" />,
  hotel: <Bed className="w-4 h-4" />,
  gereja: <Building className="w-4 h-4" />,
  teras: <Home className="w-4 h-4" />,
  mall: <ShoppingBag className="w-4 h-4" />,
};

const LOCATION_PROMPTS: Record<LocationType, string> = {
  lapangan: 'a beautiful city park under clear daylight',
  studio: 'an international fashion studio, with a studio background logo that reads “evashop”',
  hotel: 'a luxurious and elegant hotel room',
  gereja: 'a beautiful and grand church interior',
  teras: 'a cozy and aesthetic house terrace',
  mall: 'a high-end and modern shopping mall interior with glossy floors, soft ambient luxury boutique lighting, and blurred high-fashion stores in the background',
};

const STORAGE_KEY_PREVIEW = 'evashop_studio_preview_image';
const STORAGE_KEY_DESCRIPTION = 'evashop_studio_product_description';
const STORAGE_KEY_CATEGORY = 'evashop_studio_category';
const STORAGE_KEY_MODEL = 'evashop_studio_model';
const STORAGE_KEY_MODEL_MARKET = 'evashop_studio_model_market';
const STORAGE_KEY_LOCATION = 'evashop_studio_location';
const STORAGE_KEY_VOICE = 'evashop_studio_voice';
const STORAGE_KEY_RESULTS = 'evashop_studio_results';
const STORAGE_KEY_SEO_TAB = 'evashop_studio_seo_tab';
const STORAGE_KEY_AFFILIATE_LINK = 'evashop_studio_affiliate_link';
const STORAGE_KEY_VIDEO_LINK = 'evashop_studio_video_link';
const STORAGE_KEY_PROMO_PRICE = 'evashop_studio_promo_price';

export default function App() {
  useEffect(() => {
    try {
      localStorage.removeItem('evashop_active_app_mode');
    } catch {}
  }, []);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_PREVIEW) || null;
    } catch {
      return null;
    }
  });
  const [productDescription, setProductDescription] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_DESCRIPTION) || '';
    } catch {
      return '';
    }
  });
  const [productCategory, setProductCategory] = useState<ProductCategory>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY_CATEGORY) as ProductCategory) || 'pakaian';
    } catch {
      return 'pakaian';
    }
  });
  const [modelType, setModelType] = useState<ModelType>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY_MODEL) as ModelType) || 'wanita';
    } catch {
      return 'wanita';
    }
  });
  const [modelMarket, setModelMarket] = useState<ModelMarket>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY_MODEL_MARKET) as ModelMarket) || 'indonesia';
    } catch {
      return 'indonesia';
    }
  });
  const [activePromptTab, setActivePromptTab] = useState<ModelMarket>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY_MODEL_MARKET) as ModelMarket) || 'indonesia';
    } catch {
      return 'indonesia';
    }
  });
  const [locationType, setLocationType] = useState<LocationType>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY_LOCATION) as LocationType) || 'studio';
    } catch {
      return 'studio';
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RESULTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved results:', e);
    }
    return [];
  });
  const [error, setError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [voiceGender, setVoiceGender] = useState<'wanita' | 'pria'>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY_VOICE) as 'wanita' | 'pria') || 'wanita';
    } catch {
      return 'wanita';
    }
  });
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState<string>('');
  const [editingNarrativeText, setEditingNarrativeText] = useState<string>('');
  const [editingNarrativePlatform, setEditingNarrativePlatform] = useState<'shopee' | 'amazon'>('shopee');
  const [selectedNarrativePlatform, setSelectedNarrativePlatform] = useState<Record<string, 'shopee' | 'amazon'>>({});
  const [generatingAmazonNarrativeMap, setGeneratingAmazonNarrativeMap] = useState<Record<string, boolean>>({});
  const [activeSeoTab, setActiveSeoTab] = useState<'html' | 'full' | 'structured'>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY_SEO_TAB) as any) || 'html';
    } catch {
      return 'html';
    }
  });
  const [affiliateLink, setAffiliateLink] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_AFFILIATE_LINK) || '';
    } catch {
      return '';
    }
  });
  const [videoLink, setVideoLink] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_VIDEO_LINK) || '';
    } catch {
      return '';
    }
  });
  const [promoPrice, setPromoPrice] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_PROMO_PRICE) || '';
    } catch {
      return '';
    }
  });
  const [htmlPreviewMode, setHtmlPreviewMode] = useState<'code' | 'preview'>('code');
  const [selectedArticleLang, setSelectedArticleLang] = useState<Record<string, 'id' | 'en'>>({});
  const [selectedTemplateType, setSelectedTemplateType] = useState<Record<string, 'shopee' | 'amazon'>>({});
  const [generatingEnMap, setGeneratingEnMap] = useState<Record<string, boolean>>({});
  const [autoGenerateEn, setAutoGenerateEn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('evashop_studio_auto_en') === 'true';
    } catch {
      return false;
    }
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Otomatis');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textFileInputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      if (previewUrl) {
        localStorage.setItem(STORAGE_KEY_PREVIEW, previewUrl);
      } else {
        localStorage.removeItem(STORAGE_KEY_PREVIEW);
      }
      if (productDescription) {
        localStorage.setItem(STORAGE_KEY_DESCRIPTION, productDescription);
      } else {
        localStorage.removeItem(STORAGE_KEY_DESCRIPTION);
      }
      localStorage.setItem(STORAGE_KEY_CATEGORY, productCategory);
      localStorage.setItem(STORAGE_KEY_MODEL, modelType);
      localStorage.setItem(STORAGE_KEY_MODEL_MARKET, modelMarket);
      localStorage.setItem(STORAGE_KEY_LOCATION, locationType);
      localStorage.setItem(STORAGE_KEY_VOICE, voiceGender);
      localStorage.setItem(STORAGE_KEY_SEO_TAB, activeSeoTab);
      localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(generatedImages));
      if (affiliateLink) {
        localStorage.setItem(STORAGE_KEY_AFFILIATE_LINK, affiliateLink);
      } else {
        localStorage.removeItem(STORAGE_KEY_AFFILIATE_LINK);
      }
      if (videoLink) {
        localStorage.setItem(STORAGE_KEY_VIDEO_LINK, videoLink);
      } else {
        localStorage.removeItem(STORAGE_KEY_VIDEO_LINK);
      }
      if (promoPrice) {
        localStorage.setItem(STORAGE_KEY_PROMO_PRICE, promoPrice);
      } else {
        localStorage.removeItem(STORAGE_KEY_PROMO_PRICE);
      }
      
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.warn("Storage save error (possibly quota):", e);
    }
  }, [previewUrl, productDescription, productCategory, modelType, modelMarket, locationType, voiceGender, activeSeoTab, affiliateLink, videoLink, promoPrice, generatedImages]);

  // Protect against accidental refresh / page close when work exists
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isGenerating || generatedImages.length > 0 || previewUrl) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGenerating, generatedImages, previewUrl]);

  useEffect(() => {
    if (modelType === 'pria' || modelType === 'wanita') {
      setVoiceGender(modelType);
    }
  }, [modelType]);

  // --- Helpers ---
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const formatGeminiErrorMessage = (err: any): string => {
    const rawMsg = err?.message || String(err);
    if (rawMsg.includes("429") || rawMsg.includes("RESOURCE_EXHAUSTED") || rawMsg.includes("quota")) {
      return "Batas penggunaan API gratis tercapai sementara. Silakan tunggu beberapa saat atau periksa kembali API key Anda.";
    }
    if (rawMsg.includes("403") || rawMsg.includes("PERMISSION_DENIED")) {
      return "Akses API ditolak. Pastikan API key yang Anda gunakan sudah benar dan aktif.";
    }
    try {
      const jsonStart = rawMsg.indexOf('{');
      if (jsonStart !== -1) {
        const parsed = JSON.parse(rawMsg.slice(jsonStart));
        if (parsed.error?.message) {
          return parsed.error.message;
        }
      }
    } catch {}
    return rawMsg || "Terjadi kesalahan saat memproses permintaan.";
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPreviewUrl(base64);
      };
      reader.readAsDataURL(file);
      setGeneratedImages([]);
      setError(null);
    }
  };

  const handleTextFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setProductDescription(prev => prev.trim() ? `${prev}\n\n${text}` : text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const hasProductImage = Boolean(selectedImage || previewUrl);

  const handleGenerateClick = () => {
    if (!hasProductImage) {
      fileInputRef.current?.click();
      setError("Silakan upload foto produk terlebih dahulu sebelum melakukan generate.");
      return;
    }
    generateUGC();
  };

  const handleResetAll = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setProductDescription('');
    setAffiliateLink('');
    setVideoLink('');
    setPromoPrice('');
    setGeneratedImages([]);
    setError(null);
    setProductCategory('pakaian');
    setModelType('wanita');
    setModelMarket('indonesia');
    setActivePromptTab('indonesia');
    setLocationType('studio');
    try {
      localStorage.removeItem(STORAGE_KEY_PREVIEW);
      localStorage.removeItem(STORAGE_KEY_DESCRIPTION);
      localStorage.removeItem(STORAGE_KEY_RESULTS);
      localStorage.removeItem(STORAGE_KEY_CATEGORY);
      localStorage.removeItem(STORAGE_KEY_MODEL);
      localStorage.removeItem(STORAGE_KEY_MODEL_MARKET);
      localStorage.removeItem(STORAGE_KEY_LOCATION);
      localStorage.removeItem(STORAGE_KEY_VOICE);
      localStorage.removeItem(STORAGE_KEY_SEO_TAB);
      localStorage.removeItem(STORAGE_KEY_AFFILIATE_LINK);
      localStorage.removeItem(STORAGE_KEY_VIDEO_LINK);
      localStorage.removeItem(STORAGE_KEY_PROMO_PRICE);
    } catch (e) {
      console.error(e);
    }
    setShowResetConfirm(false);
  };

  const buildImagePrompt = (
    category: ProductCategory, 
    type: ModelType, 
    location: LocationType, 
    market: ModelMarket = 'indonesia'
  ) => {
    const isAmazon = market === 'amazon';

    const subject = isAmazon ? {
      wanita: "a stylish young American woman with natural Caucasian American facial features, radiant skin, authentic expressions, and modern lifestyle aesthetic",
      pria: "a charismatic young American man with natural Caucasian American facial features, well-groomed look, friendly smile, and modern lifestyle aesthetic",
      couple: "an attractive young American couple (man and woman) with natural American features, radiant smiles, and modern lifestyle styling",
      grup: "a trendy diverse group of young American models with natural American features, modern street/casual fashion, and lively candid energy"
    }[type] : {
      wanita: "a young Indonesian woman with natural Indonesian facial features",
      pria: "a young Indonesian man with natural Indonesian facial features",
      couple: "a young Indonesian couple (man and woman)",
      grup: "a group of young Indonesian models"
    }[type];

    const background = LOCATION_PROMPTS[location];

    const deviceContext = isAmazon
      ? "captured with a flagship smartphone camera (iPhone / modern mobile camera), shot on mobile phone"
      : "captured with an Android smartphone camera, shot on an Android mobile phone";

    const styleContext = isAmazon
      ? "Authentic Amazon Influencer UGC lifestyle creator aesthetic, natural mobile phone camera lens perspective, clean ambient lighting, genuine candid lifestyle UGC feel, sharp and clear details with natural skin texture and authentic mobile depth of field"
      : "Authentic mobile photography aesthetic, natural Android phone camera lens perspective, realistic ambient lighting, genuine candid lifestyle UGC feel, sharp and clear details with natural skin texture and authentic smartphone camera depth of field";

    if (category === 'tas') {
      return `Realistic full-body ${isAmazon ? 'Amazon Influencer lifestyle ' : ''}UGC photograph ${deviceContext}.
The model (${subject}) is naturally holding and showcasing the bag from the reference image in a chic and stylish lifestyle pose (all design details, hardware, leather/fabric texture, straps, zippers, and exact motifs of the bag must be precisely matched 1:1 from the reference image).
The setting is ${background}.
Style & Photography: ${styleContext}, highlighting the bag in hand while maintaining a full-body composition from head to toe.
Clean composition without any text, logos, timestamps, or watermarks.`;
    }

    if (category === 'sepatu') {
      return `Realistic full-body ${isAmazon ? 'Amazon Influencer lifestyle ' : ''}UGC photograph ${deviceContext}.
The model (${subject}) is wearing and modeling the footwear/shoes from the reference image in a stylish fashion pose (all silhouettes, soles, laces/straps, materials, and exact textures of the shoes must be precisely matched 1:1 from the reference image).
The setting is ${background}.
Style & Photography: ${styleContext}, clearly showcasing the shoes on feet in a full-body shot from head to toe.
Clean composition without any text, logos, timestamps, or watermarks.`;
    }

    if (category === 'aksesoris') {
      return `Realistic full-body ${isAmazon ? 'Amazon Influencer lifestyle ' : ''}UGC photograph ${deviceContext}.
The model (${subject}) is holding, wearing, and elegantly showcasing the accessory from the reference image in hand in a stylish lifestyle pose, gracefully presenting its exquisite design, materials, metallic luster, fine craftsmanship, and textures precisely matched 1:1 from the reference image.
The setting is ${background}.
Style & Photography: ${styleContext}, highlighting the accessory held gracefully in hand while maintaining a full-body composition from head to toe.
Clean composition without any text, logos, timestamps, or watermarks.`;
    }

    // Pakaian (default)
    return `Realistic full-body ${isAmazon ? 'Amazon Influencer lifestyle ' : ''}UGC photograph ${deviceContext}.
The outfit from the reference image is worn by ${subject} (all motifs, patterns, colors, fabrics, and visual textures of the outfit must be precisely matched 1:1 from the reference image).
The setting is ${background}.
Style & Photography: ${styleContext}, no artificial oversaturation or synthetic airbrushed CGI look.
The model is posing naturally and stylishly, full-body shot from head to toe.
Clean composition without any text, logos, timestamps, or watermarks.`;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const getIntroParagraphs = (seo: SeoArticle, isEn: boolean): string[] => {
    if (seo.introParagraphs && Array.isArray(seo.introParagraphs) && seo.introParagraphs.length >= 4) {
      return seo.introParagraphs.slice(0, 4);
    }
    if (seo.introduction && seo.introduction.includes('\n\n')) {
      const split = seo.introduction.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 20);
      if (split.length >= 4) {
        return split.slice(0, 4);
      }
    }

    const p1 = (seo.introParagraphs && seo.introParagraphs[0] && seo.introParagraphs[0].length > 25)
      ? seo.introParagraphs[0]
      : (seo.problem || (isEn
        ? "Finding authentic quality products online can be an exhausting gamble. Before discovering this item, I constantly struggled with poor fabrics, deceptive photos, and flimsy stitching. Naturally, I spent weeks hesitating before taking the leap."
        : "Menemukan produk berkualitas yang benar-benar sesuai ekspektasi di tengah maraknya barang pasaran sering kali menjadi pengalaman yang melelahkan. Sebelum menemukan produk ini, saya berulang kali merasa kecewa saat membeli barang yang sekadar tampak bagus di foto katalog atau iklan promosi, namun saat tiba ternyata berbahan kaku, gerah, dan jahitannya rapuh. Keraguan semacam itu sempat membuat saya menimbang cukup lama sebelum akhirnya memutuskan untuk mencoba produk ini."));

    const p2 = (seo.introParagraphs && seo.introParagraphs[1] && seo.introParagraphs[1].length > 25)
      ? seo.introParagraphs[1]
      : (seo.solution || (isEn
        ? "After seeing countless positive discussions and detailed buyer pictures, my curiosity finally won over my skepticism. What caught my attention was the consistent praise regarding its fabric feel, true-to-size tailoring, and surprising durability relative to its price point."
        : "Setelah membaca puluhan ulasan positif dan melihat foto langsung dari para pembeli sebelumnya di marketplace, rasa penasaran saya akhirnya mengalahkan rasa ragu. Daya tarik utama yang membuat saya yakin untuk mencoba adalah testimoni konsisten mengenai kelembutan bahannya, kerapian potongan jahitannya, serta nilai kepuasan yang dinilai jauh melampaui harga yang ditawarkan oleh toko resminya."));

    const p3 = (seo.introParagraphs && seo.introParagraphs[2] && seo.introParagraphs[2].length > 25)
      ? seo.introParagraphs[2]
      : (seo.proof || (isEn
        ? "The moment the package arrived and I tore open the packaging, my initial doubts immediately evaporated. The fabric felt instantly soft against the skin with a satisfying weight and drape, and inspecting the inner seams revealed clean, reinforced stitching without a single loose thread."
        : "Saat paket tiba di rumah dan saya buka kemasannya, seluruh kekhawatiran yang sempat ada seketika hilang. Kesan pertama ketika meraba langsung tekstur materialnya sangat memuaskan; serat kainnya terasa begitu halus, adem saat menyentuh kulit, dan memiliki gramasi yang pas tanpa menerawang. Setiap sudut jahitan dan keliman diperiksa dengan teliti dan terbukti rapi berstandar butik profesional."));

    const p4 = (seo.introParagraphs && seo.introParagraphs[3] && seo.introParagraphs[3].length > 25)
      ? seo.introParagraphs[3]
      : (isEn
        ? "To provide genuine value to fellow shoppers researching before buying, I conducted a thorough personal wear test across diverse daily routines. Below, you will find high-resolution photo angles, detailed material breakdown, styling recommendations, and direct purchase information to ensure you get authentic quality at the best available price."
        : "Untuk memberikan gambaran yang transparan dan bermanfaat bagi Anda yang sedang menimbang sebelum membeli, ulasan ini saya tulis murni berdasarkan pengalaman pemakaian langsung dalam berbagai rutinitas harian. Di bawah ini, saya sajikan galeri foto detail produk asli, rincian keunggulan material, tips padu padan outfit, hingga jawaban atas pertanyaan umum (FAQ) untuk membantu Anda belanja dengan mantap dan percaya diri.");

    return [p1, p2, p3, p4];
  };

  const getSeoArticleText = (seo: SeoArticle): string => {
    if (seo.fullArticle && seo.fullArticle.trim().length > 100) {
      return seo.fullArticle;
    }
    const h1 = `# ${seo.title || 'Review Jujur Pengalaman Pribadi: Ulasan Lengkap Pemakaian Harian'}`;
    const kw = seo.mainKeyword ? `**Target Kata Kunci SEO:** ${seo.mainKeyword}\n\n` : '';
    const intro = getIntroParagraphs(seo, false);
    
    const p1 = `### 1. Keresahan & Dilema Pribadi Sebelum Membeli (Problem)\n${intro[0]}\n\n`;
    const p2 = `### 2. Momen Solusi & Ekspektasi Menemukan Produk (Solution)\n${intro[1]}\n\n`;
    const p3 = `### 3. Impresi Pertama Unboxing & Kualitas Bahan (Unboxing)\n${intro[2]}\n\n`;
    const p4 = `### 4. Transparansi Ulasan & Komitmen Uji Pakai Harian (Overview)\n${intro[3]}\n\n`;
    const p5 = `### 5. Bukti Kualitas & Pengalaman Nyata Setelah Pemakaian (Proof)\n${seo.proof || 'Saya sudah menguji dan memakai produk ini berulang kali untuk berbagai aktivitas dari pagi hingga malam hari. Hasilnya sangat memuaskan: tidak menimbulkan rasa gerah meski dipakai di cuaca panas, tidak mudah kusut saat saya banyak bergerak aktif, serta ketahanan warnanya tetap terjaga prima setelah beberapa kali proses pencucian.'}\n\n`;
    const p6 = `### 6. Keunggulan Utama yang Benar-Benar Saya Rasakan (Advantages)\n${seo.advantages || 'Poin keunggulan yang paling saya rasakan adalah tingkat kenyamanan maksimal sepanjang hari dan siluet potongannya yang membuat penampilan saya terlihat lebih proporsional serta percaya diri. Banyak teman dan rekan yang spontan memuji tampilannya dan menanyakan langsung di mana saya membelinya.'}\n\n`;
    const p7 = `### 7. Catatan Jujur, Kelemahan Realistis & Tips Perawatan (Limitations)\n${seo.limitations || (seo.cons && seo.cons.length > 0 ? seo.cons.join('. ') : 'Agar ulasan ini tetap berimbang dan objektif, catatan penting dari pengalaman pribadi saya adalah pastikan kalian memeriksa tabel panduan ukuran (size chart) dengan cermat sebelum membeli. Selain itu, disarankan mencuci dengan putaran lembut agar serat kain dan detail jahitan tetap awet sempurna.')}\n\n`;
    const p8 = `### 8. Kesimpulan Jujur & Rekomendasi Akhir (Conclusion)\n${seo.conclusionAndCta || seo.cta || 'Berdasarkan pengalaman pemakaian pribadi saya, produk ini sangat layak dan worth-it untuk dimiliki. Buat teman-teman yang ingin mendapatkan produk original dengan promo harga spesial dan voucher gratis ongkir, saya sarankan langsung checkout melalui toko resminya sekarang juga!'}\n\n`;

    const specs = `## Spesifikasi Rinci & Detail Material Versi Pengguna\n${seo.specifications || 'Berdasarkan pengamatan fisik langsung saya, material yang digunakan memiliki gramasi yang pas, tidak menerawang, serat kain rapat, serta dilengkapi detail pengerjaan finishing yang sangat presisi.'}\n\n`;
    const styling = `## Inspirasi & Tips Padu Padan Outfit Harian Saya\n${seo.stylingTips || 'Dari pengalaman padu padan saya, produk ini sangat fleksibel dipadukan dengan berbagai gaya outfit: mulai dari kasual santai untuk hangout, tampilan smart-casual untuk kuliah atau kerja, hingga gaya semi-formal yang elegan.'}`;
    const faq = seo.faq && seo.faq.length > 0
      ? `\n\n## Pertanyaan yang Sering Diajukan (FAQ)\n` + seo.faq.map((f, i) => `**Q${i + 1}: ${f.question}**\nA: ${f.answer}`).join('\n\n')
      : '';

    return `${h1}\n\n${kw}${p1}${p2}${p3}${p4}${p5}${p6}${p7}${p8}${specs}${styling}${faq}`;
  };

  const getSeoArticleTextEn = (seo: SeoArticle): string => {
    if (seo.fullArticle && seo.fullArticle.trim().length > 100) {
      return seo.fullArticle;
    }
    const h1 = `# ${seo.title || 'Honest Personal Review: My In-Depth Experience Testing This Product'}`;
    const kw = seo.mainKeyword ? `**Target SEO Keyword:** ${seo.mainKeyword}\n\n` : '';
    const intro = getIntroParagraphs(seo, true);
    
    const p1 = `### 1. My Initial Hesitations & Pre-Purchase Dilemma (Problem)\n${intro[0]}\n\n`;
    const p2 = `### 2. The Turning Point: Discovering This Item & Expectations (Solution)\n${intro[1]}\n\n`;
    const p3 = `### 3. Delivery Unboxing & Tactile First Impressions (Unboxing)\n${intro[2]}\n\n`;
    const p4 = `### 4. Reviewer Transparency Pledge & Wear-Test Setup (Overview)\n${intro[3]}\n\n`;
    const p5 = `### 5. Real-World Wear Test & Proof of Durability (Proof)\n${seo.proof || "I put this through weeks of everyday wear, from busy morning commutes to extended weekend outings. It held its shape impeccably, breathed easily in warm weather, and survived repeated washes without fading, pilling, or fraying at the seams."}\n\n`;
    const p6 = `### 6. What Truly Won Me Over (Advantages)\n${seo.advantages || "Beyond sheer comfort, the silhouette cut gives an effortless boost in confidence. The drape is flattering without feeling constricting, and colleagues and friends have repeatedly stopped me to ask where I got it."}\n\n`;
    const p7 = `### 7. Honest Considerations & Practical Care Tips (Limitations)\n${seo.limitations || (seo.cons && seo.cons.length > 0 ? seo.cons.join('. ') : "To keep this review balanced, double-check the sizing chart before ordering as the fit is tailored. Use a gentle cold wash cycle and avoid harsh detergents to preserve the fabric texture for years.")}\n\n`;
    const p8 = `### 8. Final Verdict & Amazon Buyer's Guide (CTA)\n${seo.conclusionAndCta || seo.cta || "In my honest opinion, it is undeniably worth every penny and an absolute staple in my rotation. If you want authentic stock with fast Prime shipping, hassle-free returns, and verified customer reviews, check the current pricing and availability on Amazon right here!"}\n\n*Affiliate Disclosure: As an Amazon Associate, I earn from qualifying purchases at no additional cost to you.*\n\n`;

    const specs = `## Hands-On Specifications & User Breakdown\n${seo.specifications || "Carefully inspected fabric grammage, opaque weave, reinforced stitching, and durable hardware."}\n\n`;
    const styling = `## How I Style It: Daily Outfit Inspirations\n${seo.stylingTips || "Effortlessly transitions between casual weekend coffee runs, polished workdays, and evening dinners."}`;
    const faq = seo.faq && seo.faq.length > 0
      ? `\n\n## Frequently Asked Questions (FAQ)\n` + seo.faq.map((f, i) => `**Q${i + 1}: ${f.question}**\nA: ${f.answer}`).join('\n\n')
      : '';

    return `${h1}\n\n${kw}${p1}${p2}${p3}${p4}${p5}${p6}${p7}${p8}${specs}${styling}${faq}`;
  };

  const getAmazonTemplateHtml = (
    seo: SeoArticle,
    options?: {
      affiliateUrl?: string;
      videoUrl?: string;
      price?: string;
    }
  ): string => {
    const affUrl = (options?.affiliateUrl && options.affiliateUrl.trim())
      ? options.affiliateUrl.trim()
      : 'ISI_LINK_AFFILIATE_SHOPEE_DISINI';

    const amazonAffUrl = (options?.affiliateUrl && options.affiliateUrl.trim())
      ? options.affiliateUrl.trim()
      : 'ISI_LINK_AFFILIATE_Amazon_DISINI';

    const amazonVidUrl = (options?.videoUrl && options.videoUrl.trim())
      ? options.videoUrl.trim()
      : 'ISI_LINK_VIDEO_SHOPEE_DISINI';

    const promoPriceVal = (options?.price && options.price.trim())
      ? options.price.trim()
      : (seo.price && seo.price.trim() ? seo.price.trim() : '$ 10.69');

    const introParas = getIntroParagraphs(seo, true);
    const introP1 = introParas[0] || 'Tuliskan paragraf pembuka ulasan di sini. Jelaskan daya tarik umum produk, alasan produk ini diminati banyak pembeli, atau solusi gaya yang ditawarkan untuk kebutuhan penampilan sehari-hari.';
    const introP2 = introParas[1] || 'Berikut adalah detail ulasan, foto variasi produk lengkap, serta tautan belanja resmi untuk mendapatkan penawaran harga terbaik:';
    const extraIntroParas = introParas.slice(2).map(p => `  <p>\n    ${p}\n  </p>`).join('\n\n');

    const h2Sec1 = seo.advantages || 'Tulis ulasan mendalam mengenai kualitas, kenyamanan pakai, ketahanan material, serta keunikan desain yang menjadi nilai jual utama produk ini dibandingkan produk lain.';
    const h2Sec2 = seo.stylingTips || 'Berikan tips padu padan (mix &amp; match) gaya busana yang cocok untuk memadukan produk ini dengan kategori <strong>Pakaian Wanita</strong>, <strong>Pakaian Pria</strong>, <strong>Tas &amp; Sepatu</strong>, maupun <strong>Aksesoris</strong> agar pembaca mendapat inspirasi gaya untuk acara formal, kantor, maupun santai.';
    const h2Sec3 = seo.conclusionAndCta || seo.cta || 'Produk ini merupakan pilihan tepat bagi Anda yang menginginkan perpaduan kualitas, kenyamanan, dan tampilan stylish dengan harga yang ramah di kantong. Seluruh transaksi dapat dilakukan langsung melalui toko resmi di aplikasi Shopee untuk menikmati voucher diskon toko, cashback koin, dan promo Gratis Ongkir.';

    return `<!--=================================================================-->
<!--=== [1. TULIS ARTIKEL PEMBUKA & ULASAN PRODUK] ===================-->
<!--=================================================================-->
<div class="product-article-intro" style="color: #1e293b; font-size: 1rem; line-height: 1.8; margin-bottom: 25px;">

  <p>
    ${introP1}
  </p>

  <p>
    ${introP2}
  </p>${extraIntroParas ? '\n\n' + extraIntroParas : ''}

</div>



<!--=================================================================-->
<!--=== [2. TEMPAT UPLOAD FOTO PRODUK (SLIDER OTOMATIS)] =============-->
<!--=================================================================-->
<div class="product-gallery-slider">
  <div class="main-slide-container" id="mainSlideBox">
    <button class="slide-nav-btn prev-btn" onclick="moveGallerySlide(-1)" type="button">&#10094;</button>
    
    <div class="slides-wrapper" id="customSlidesWrapper">
      <!--------------------------------------------------------------->
      <!--TEMPEL / SISIPKAN FOTO-FOTO PRODUK DI BAWAH INI-->
      <!--------------------------------------------------------------->

      <div class="separator" style="clear: both; text-align: center;">
        <p><em>

(Upload atau sisipkan semua foto produk di baris ini)
</em></p>
      </div>

      <!--------------------------------------------------------------->
      <!--BATAS AREA UPLOAD FOTO PRODUK-->
      <!--------------------------------------------------------------->
    </div>

    <button class="slide-nav-btn next-btn" onclick="moveGallerySlide(1)" type="button">&#10095;</button>
  </div>

  <!--Thumbnail Otomatis Dibuat Sistem-->
  <div class="thumbnail-strip" id="customThumbStrip"></div>

  <!--Tombol Zoom & Teks Sumber Shopee yang Bisa Diklik-->
  <div style="align-items: center; display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between; margin-top: 14px; padding: 0px 4px;">
    
    <!--Tombol Zoom Foto-->
    <a class="btn-single-zoom" href="#" id="customZoomBtn" target="_blank">
      🔍 View Full / High-Res Photo
    </a>

    <!--Teks Sumber Melayang yang Mengarah ke Shopee-->
    <a href="


${affUrl}


" rel="nofollow sponsored" style="background: rgb(241, 245, 249); border-radius: 6px; border: 1px solid rgb(203, 213, 225); color: #64748b; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; text-decoration: none;" target="_blank" title="Buka produk di Shopee">
      Source:amazon.com ➚
    </a>

  </div>
</div>



<!--=================================================================-->
<!--=== [3. KOTAK HARGA PRODUK] =====================================-->
<!--=================================================================-->
<div style="background: #fff8e1; border-radius: 8px; border: 1px solid #ffe0b2; margin: 20px 0px; padding: 14px; text-align: center;">
  <span style="color: #718096; display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 4px;"> Special Promo Price :</span>
  <span style="color: #e65100; font-size: 1.45rem; font-weight: 800; letter-spacing: 0.5px;">


 ${promoPriceVal}


  </span>
</div>



<!--=================================================================-->
<!--=== [4. TAUTAN PEMBELIAN RESMI SHOPEE] ===========================-->
<!--=================================================================-->
<div style="background: #fff3e0; border-radius: 8px; border: 1.5px dashed #ff9800; margin: 20px 0px; padding: 15px; text-align: center;">
  <p style="color: #0f172a; font-size: 0.95rem; font-weight: 700; margin-bottom: 10px;"> Official Buying Link :</p>
  <a class="link-Amazon" href="


${amazonAffUrl}


" rel="nofollow sponsored" style="background: #ff9800; border-radius: 6px; box-shadow: rgba(255, 152, 0, 0.3) 0px 4px 10px; color: white; display: inline-block; font-size: 0.92rem; font-weight: 800; padding: 11px 24px; text-decoration: none;" target="_blank">
    👉 Click Here to Buy on Amazon
  </a>
</div>



<!--=================================================================-->
<!--=== [5. TAUTAN VIDEO PRODUK SHOPEE] =============================-->
<!--=================================================================-->
<div style="background: rgb(240, 247, 255); border-radius: 8px; border: 1.5px dashed rgb(2, 132, 199); margin: 20px 0px; padding: 15px; text-align: center;">
  <p style="color: #0f172a; font-size: 0.95rem; font-weight: 700; margin-bottom: 10px;"> "Watch Review &amp; Unboxing Video:" :</p>
  <a href="


${amazonVidUrl}


" rel="nofollow sponsored" style="background: rgb(2, 132, 199); border-radius: 6px; box-shadow: rgba(2, 132, 199, 0.25) 0px 4px 10px; color: white; display: inline-block; font-size: 0.92rem; font-weight: 800; padding: 11px 24px; text-decoration: none;" target="_blank">
    🎬  Watch Product Video on Amazon
  </a>
</div>



<!--=================================================================-->
<!--=== [6. STRUKTUR ARTIKEL SESUAI HIRARKI H2 STANDAR SEO] =========-->
<!--=================================================================-->
<div class="product-full-details" style="line-height: 1.8; margin-top: 35px;">

  <span style="color: #1e293b;"><!--[H2 BAGIAN 1: KEUNGGULAN & DAYA TARIK]--></span>
  <h2 style="border-left: 4px solid #ff9800; margin: 25px 0px 12px; padding-left: 10px;"><span style="color: #0f172a;"><span style="font-size: 20.8px;">Product Highlights &amp; Key Advantages</span></span></h2>
  
  <p style="color: #1e293b; font-size: 1rem;">
    ${h2Sec1}
  </p>


  <span style="color: #1e293b;"><!--[H2 BAGIAN 2: TIPS PADU PADAN OUTFIT]--></span>
  <h2 style="border-left: 4px solid #ff9800; margin: 30px 0px 12px; padding-left: 10px;"><span style="color: #0f172a;"><span style="font-size: 20.8px;">Tips for Styling with Everyday Outfits</span></span></h2>
  
  <p style="color: #1e293b; font-size: 1rem;">
    ${h2Sec2}
  </p>


  <span style="color: #1e293b;"><!--[H2 BAGIAN 3: KESIMPULAN & CARA BELI DI SHOPEE]--></span>
  <h2 style="border-left: 4px solid #ff9800; margin: 30px 0px 12px; padding-left: 10px;"><span style="color: #0f172a;"><span style="font-size: 20.8px;">Conclusion &amp; How to Buy on Amazon</span></span></h2>
  
  <p style="color: #1e293b; font-size: 1rem;">
    ${h2Sec3}
  </p>

</div>



<!--=================================================================-->
<!--=== [7. CSS SLIDER & ENGINE SKRIP OTOMATIS] ======================-->
<!--=================================================================-->
<style>
  .product-gallery-slider { max-width: 480px; margin: 0 auto 25px auto; width: 100%; box-sizing: border-box; }
  .main-slide-container { position: relative; width: 100%; aspect-ratio: 3/4; overflow: hidden; border-radius: 12px; border: 3px solid #ff9800; background: #ffffff; box-shadow: 0 4px 14px rgba(255,152,0,0.2); }
  .slides-wrapper { position: relative; width: 100%; height: 100%; overflow: hidden; }
  
  .slides-wrapper .slide-single-box { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; visibility: hidden; transition: opacity 0.25s ease-in-out; z-index: 1; }
  .slides-wrapper .slide-single-box.active-slide { opacity: 1; visibility: visible; z-index: 2; }
  .slides-wrapper img { width: 100% !important; height: 100% !important; object-fit: cover !important; display: block; border: none !important; border-radius: 0 !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; }
  
  .slide-nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: #fff; border: none; font-size: 1.1rem; padding: 10px 14px; cursor: pointer; border-radius: 4px; z-index: 10; transition: background 0.2s; }
  .slide-nav-btn:hover { background: #ff9800; }
  .prev-btn { left: 8px; }
  .next-btn { right: 8px; }
  
  .thumbnail-strip { display: flex; gap: 8px; justify-content: center; margin-top: 12px; overflow-x: auto; padding: 4px 0; }
  .thumbnail-strip img { width: 60px; height: 75px; object-fit: cover; border-radius: 6px; border: 2px solid #cbd5e1; cursor: pointer; transition: all 0.2s; padding: 0 !important; margin: 0 !important; box-shadow: none !important; flex-shrink: 0; }
  .thumbnail-strip img.active-thumb { border-color: #ff9800; transform: scale(1.05); box-shadow: 0 2px 8px rgba(255,152,0,0.35); }
  
  .btn-single-zoom { display: inline-flex; align-items: center; gap: 6px; background: #fff8e1; color: #e65100 !important; border: 1px solid #ffe0b2; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; text-decoration: none; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .btn-single-zoom:hover { background: #ff9800; color: #ffffff !important; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(255,152,0,0.25); }
</style>

<script>
  var currentGalIdx = 0;
  var galleryImgSources = [];

  function updateGalleryUI() {
    var slides = document.querySelectorAll('#customSlidesWrapper .slide-single-box');
    var thumbs = document.querySelectorAll('#customThumbStrip img');
    var zoomBtn = document.getElementById('customZoomBtn');

    slides.forEach(function(s, i) {
      if (i === currentGalIdx) {
        s.classList.add('active-slide');
      } else {
        s.classList.remove('active-slide');
      }
    });

    thumbs.forEach(function(t, i) {
      if (i === currentGalIdx) {
        t.classList.add('active-thumb');
      } else {
        t.classList.remove('active-thumb');
      }
    });

    if (zoomBtn && galleryImgSources[currentGalIdx]) {
      zoomBtn.href = galleryImgSources[currentGalIdx];
    }
  }

  function moveGallerySlide(step) {
    if (galleryImgSources.length === 0) return;
    currentGalIdx = (currentGalIdx + step + galleryImgSources.length) % galleryImgSources.length;
    updateGalleryUI();
  }

  function setGallerySlide(idx) {
    currentGalIdx = idx;
    updateGalleryUI();
  }

  document.addEventListener('DOMContentLoaded', function() {
    var wrapper = document.getElementById('customSlidesWrapper');
    var thumbStrip = document.getElementById('customThumbStrip');
    if (wrapper) {
      var allImgs = wrapper.querySelectorAll('img');
      galleryImgSources = [];
      allImgs.forEach(function(img) {
        var rawSrc = img.src.replace(/\\/s[0-9]+(-[a-z0-9]+)?\\//, '/s0/');
        galleryImgSources.push(rawSrc);
      });

      if (galleryImgSources.length > 0) {
        wrapper.innerHTML = '';
        if (thumbStrip) thumbStrip.innerHTML = '';

        galleryImgSources.forEach(function(src, i) {
          var slideBox = document.createElement('div');
          slideBox.className = 'slide-single-box' + (i === 0 ? ' active-slide' : '');
          slideBox.innerHTML = '<img src="' + src + '" alt="Foto ' + (i+1) + '"/>';
          wrapper.appendChild(slideBox);

          if (thumbStrip && galleryImgSources.length > 1) {
            var thumbImg = document.createElement('img');
            thumbImg.src = src;
            thumbImg.className = (i === 0) ? 'active-thumb' : '';
            thumbImg.onclick = function() { setGallerySlide(i); };
            thumbStrip.appendChild(thumbImg);
          }
        });

        if (galleryImgSources.length <= 1) {
          var prevB = document.querySelector('.prev-btn');
          var nextB = document.querySelector('.next-btn');
          if (prevB) prevB.style.display = 'none';
          if (nextB) nextB.style.display = 'none';
        }

        updateGalleryUI();
      }
    }

    var sliderContainer = document.getElementById('mainSlideBox');
    if (sliderContainer) {
      var tStartX = 0;
      sliderContainer.addEventListener('touchstart', function(e) {
        tStartX = e.changedTouches[0].screenX;
      }, {passive: true});
      sliderContainer.addEventListener('touchend', function(e) {
        var tEndX = e.changedTouches[0].screenX;
        if (tStartX - tEndX > 35) moveGallerySlide(1);
        if (tEndX - tStartX > 35) moveGallerySlide(-1);
      }, {passive: true});
    }
  });
</script>`;
  };

  const getTemplateHtml = (
    seo: SeoArticle,
    options?: {
      affiliateUrl?: string;
      videoUrl?: string;
      price?: string;
      isEnglish?: boolean;
      isAmazon?: boolean;
    }
  ): string => {
    const isEn = Boolean(options?.isEnglish);
    const isAmazon = Boolean(options?.isAmazon || isEn);

    if (isAmazon) {
      return getAmazonTemplateHtml(seo, options);
    }
    
    // Links resolution
    const affUrl = (options?.affiliateUrl && options.affiliateUrl.trim())
      ? options.affiliateUrl.trim()
      : (isEn ? 'https://www.amazon.com/dp/ISI_ASIN_DISINI?tag=YOUR_AMAZON_TAG' : 'ISI_LINK_AFFILIATE_SHOPEE_DISINI');

    const vidUrl = (options?.videoUrl && options.videoUrl.trim())
      ? options.videoUrl.trim()
      : (isEn ? 'https://www.amazon.com/live' : 'ISI_LINK_VIDEO_SHOPEE_DISINI');

    // Price resolution
    const promoPriceVal = (options?.price && options.price.trim())
      ? options.price.trim()
      : (seo.price || (isEn ? '$29.99' : 'Rp 149.000'));

    // 4 Opening Paragraphs (Minimal 4 Paragraf Pembuka)
    const introParas = getIntroParagraphs(seo, isEn);

    // Section 1: Keunggulan & Daya Tarik
    const h2Sec1Title = isEn ? "Key Advantages & Standout Appeal" : "Keunggulan &amp; Daya Tarik Produk";
    const h2Sec1Content = seo.advantages || (isEn
      ? "From the very first tactile encounter, the craftsmanship is unmistakably premium. The fabric weave is tight, resilient, and remarkably breathable, providing all-day ease without losing its silhouette structure. It delivers a flattering drape that effortlessly earns compliments while withstanding repeated everyday wear and washing without compromise."
      : "Dari pengalaman pemakaian langsung, keunggulan utama produk ini terletak pada kualitas materialnya yang terasa begitu premium dan ramah di kulit. Jahitan rapi berstandar butik, sirkulasi udara yang sejuk sehingga tidak gerah dipakai seharian, serta potongan siluet yang proporsional mampu mendongkrak rasa percaya diri Anda di setiap kesempatan.");

    // Section 2: Tips Padu Padan
    const h2Sec2Title = isEn ? "How to Style with Daily Outfits" : "Tips Padu Padan dengan Outfit Harian";
    const h2Sec2Content = seo.stylingTips || (isEn
      ? "This piece provides versatile styling flexibility across diverse settings. For relaxed casual outings, pair it with minimalist denim or comfortable sneakers. To transition into an office or smart-casual atmosphere, layer it with tailored outerwear, structured trousers, or subtle leather accessories for an instantly elevated look."
      : "Produk ini menawarkan fleksibilitas padu padan (mix &amp; match) yang sangat luwes untuk berbagai gaya busana. Sangat cocok dipadukan dengan celana kulot atau denim kasual untuk gaya santai akhir pekan, maupun dikombinasikan dengan blazer atau outer formal dan sepatu senada untuk kebutuhan kerja di kantor.");

    // Section 3: Kesimpulan & Rekomendasi
    const h2Sec3Title = isEn ? "Final Verdict & Recommendation" : "Kesimpulan &amp; Rekomendasi Akhir";
    const h2Sec3ContentP1 = seo.conclusionAndCta || seo.cta || (isEn
      ? "In conclusion, this product represents a truly worthwhile investment for anyone who prioritizes comfort, durability, and contemporary styling without breaking the bank."
      : "Dari pengalaman pemakaian langsung, produk ini merupakan pilihan tepat dan sangat layak (worth it) bagi Anda yang menginginkan perpaduan kualitas bahan yang nyaman, tampilan stylish, serta daya tahan pemakaian jangka panjang.");

    // Section 4: Pertanyaan & Jawaban (FAQ)
    const faqSectionTitle = isEn ? "Frequently Asked Questions (FAQ)" : "Pertanyaan &amp; Jawaban (FAQ)";
    const rawFaqList = (seo.faq && seo.faq.length > 0) ? seo.faq : (isEn ? [
      {
        question: "Is this product true to size or should I size up?",
        answer: "Based on real-world fitting tests, it fits true to size. If you prefer a more relaxed or oversized silhouette, opting for one size up is recommended."
      },
      {
        question: "How breathable and comfortable is the fabric for all-day wear?",
        answer: "The material offers excellent air permeability, feeling soft on the skin and remaining comfortable throughout long active days."
      },
      {
        question: "What are the best washing and care practices to keep it lasting?",
        answer: "We recommend washing with cold water on a gentle cycle, avoiding harsh bleach, and hang drying in a shaded area to maintain color vibrancy and fiber strength."
      }
    ] : [
      {
        question: "Apakah bahan produk ini nyaman dan tidak panas saat dipakai seharian?",
        answer: "Berdasarkan pengujian dan pengalaman pemakaian langsung, sirkulasi udara bahannya sangat baik, terasa adem dan lembut di kulit, serta tidak gerah meski digunakan seharian."
      },
      {
        question: "Bagaimana cara memilih ukuran yang pas agar tidak salah beli?",
        answer: "Disarankan untuk mencocokkan lingkar dada dan panjang badan dengan tabel ukuran (size chart) toko. Ukurannya cenderung standar (true to size)."
      },
      {
        question: "Bagaimana tips mencuci dan merawat produk agar tetap awet?",
        answer: "Sebaiknya cuci menggunakan air dingin dengan putaran lembut pada mesin cuci, hindari penggunaan pemutih keras, dan jemur di area teduh agar serat kain serta warnanya tidak cepat pudar."
      }
    ]);

    const faqItemsHtml = rawFaqList.map((item, idx) => {
      const qNum = idx + 1;
      return `  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px;">
    <p style="font-weight: 700; color: #0f172a; margin: 0 0 6px 0; font-size: 0.95rem;">
      <strong>Q${qNum}:</strong> ${item.question}
    </p>
    <p style="color: #475569; margin: 0; font-size: 0.92rem; line-height: 1.6;">
      <strong>A:</strong> ${item.answer}
    </p>
  </div>`;
    }).join('\n');

    const sourceLabel = isEn ? "Source: amazon.com &#10138;" : "Sumber: shopee.co.id &#10138;";
    const sourceTitle = isEn ? "View product on Amazon" : "Buka produk di Shopee";
    const zoomLabel = isEn ? "🔍 View Full High-Res Photo" : "🔍 Lihat Foto Full / Jelas";
    const priceBoxTitle = isEn ? "Special Promo Price:" : "Harga Spesial Promo:";
    const buyBoxTitle = isEn ? "Official Purchase Link:" : "Tautan Pembelian Resmi:";
    const buyBtnLabel = isEn ? "👉 Click Here to Buy on Amazon" : "👉 Klik Disini Beli Produk di Shopee";
    const videoBoxTitle = isEn ? "Watch Video Review & Live Spill:" : "Tonton Video Review &amp; Spill Produk:";
    const videoBtnLabel = isEn ? "🎬 Watch Product Video on Shopee Video" : "🎬 Tonton Video Produk di Shopee Video";

    return `<!-- ================================================================= -->
<!-- === [1. TULIS ARTIKEL PEMBUKA & ULASAN PRODUK] =================== -->
<!-- ================================================================= -->
<div class="product-article-intro" style="font-size: 1rem; line-height: 1.8; color: #1e293b; margin-bottom: 28px;">

  <p style="margin-bottom: 16px;">
    ${introParas[0]}
  </p>

  <p style="margin-bottom: 16px;">
    ${introParas[1]}
  </p>

  <p style="margin-bottom: 16px;">
    ${introParas[2]}
  </p>

  <p style="margin-bottom: 16px;">
    ${introParas[3]}
  </p>

</div>



<!-- ================================================================= -->
<!-- === [2. TEMPAT UPLOAD FOTO PRODUK (SLIDER OTOMATIS)] ============= -->
<!-- ================================================================= -->
<div class="product-gallery-slider">
  <div class="main-slide-container" id="mainSlideBox">
    <button class="slide-nav-btn prev-btn" onclick="moveGallerySlide(-1)" type="button">&#10094;</button>
    
    <div class="slides-wrapper" id="customSlidesWrapper">
      <!-- ----------------------------------------------------------- -->
      <!-- TEMPEL / SISIPKAN FOTO-FOTO PRODUK DI BAWAH INI             -->
      <!-- ----------------------------------------------------------- -->

      <div class="separator" style="clear: both; text-align: center;">
        <p><em>

(Upload atau sisipkan semua foto produk di baris ini)

</em></p>
      </div>

      <!-- ----------------------------------------------------------- -->
      <!-- BATAS AREA UPLOAD FOTO PRODUK                               -->
      <!-- ----------------------------------------------------------- -->
    </div>

    <button class="slide-nav-btn next-btn" onclick="moveGallerySlide(1)" type="button">&#10095;</button>
  </div>

  <!-- Thumbnail Otomatis Dibuat Sistem -->
  <div class="thumbnail-strip" id="customThumbStrip"></div>

  <!-- Tombol Zoom & Teks Sumber Shopee yang Bisa Diklik -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding: 0 4px; flex-wrap: wrap; gap: 8px;">
    
    <!-- Tombol Zoom Foto -->
    <a class="btn-single-zoom" id="customZoomBtn" href="#" target="_blank">
      ${zoomLabel}
    </a>

    <!-- Teks Sumber Melayang yang Mengarah ke Shopee -->
    <a href="


${affUrl}


" rel="nofollow sponsored" target="_blank" title="${sourceTitle}" style="background: #f1f5f9; color: #64748b !important; padding: 4px 10px; font-size: 0.75rem; text-decoration: none; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 600;">
      ${sourceLabel}
    </a>

  </div>
</div>



<!-- ================================================================= -->
<!-- === [3. KOTAK HARGA PRODUK] ===================================== -->
<!-- ================================================================= -->
<div style="background: #fff8f5; border: 1px solid #ffd8cc; border-radius: 8px; padding: 14px; text-align: center; margin: 20px 0;">
  <span style="font-size: 0.9rem; color: #718096; font-weight: 600; display: block; margin-bottom: 4px;">${priceBoxTitle}</span>
  <span style="font-size: 1.45rem; color: #c23110; font-weight: 800; letter-spacing: 0.5px;">


${promoPriceVal}


  </span>
</div>



<!-- ================================================================= -->
<!-- === [4. TAUTAN PEMBELIAN RESMI SHOPEE] =========================== -->
<!-- ================================================================= -->
<div style="background: #fdf2f0; border: 1.5px dashed #c23110; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
  <p style="margin-bottom: 10px; font-weight: 700; color: #0f172a; font-size: 0.95rem;">${buyBoxTitle}</p>
  <a class="link-shopee" href="


${affUrl}


" rel="nofollow sponsored" target="_blank" style="background: #c23110; color: #ffffff !important; padding: 11px 24px; text-decoration: none; border-radius: 6px; font-weight: 800; font-size: 0.92rem; display: inline-block; box-shadow: 0 4px 10px rgba(194,49,16,0.25);">
    ${buyBtnLabel}
  </a>
</div>



<!-- ================================================================= -->
<!-- === [5. TAUTAN VIDEO PRODUK SHOPEE] ============================= -->
<!-- ================================================================= -->
<div style="background: #f0f7ff; border: 1.5px dashed #0284c7; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
  <p style="margin-bottom: 10px; font-weight: 700; color: #0f172a; font-size: 0.95rem;">${videoBoxTitle}</p>
  <a href="


${vidUrl}


" rel="nofollow sponsored" target="_blank" style="background: #0284c7; color: #ffffff !important; padding: 11px 24px; text-decoration: none; border-radius: 6px; font-weight: 800; font-size: 0.92rem; display: inline-block; box-shadow: 0 4px 10px rgba(2,132,199,0.25);">
    ${videoBtnLabel}
  </a>
</div>



<!-- ================================================================= -->
<!-- === [6. STRUKTUR ARTIKEL SESUAI HIRARKI H2 STANDAR SEO] ========= -->
<!-- ================================================================= -->
<div class="product-full-details" style="font-size: 1rem; line-height: 1.8; color: #1e293b; margin-top: 35px;">

  <!-- [H2 BAGIAN 1: KEUNGGULAN & DAYA TARIK] -->
  <h2 style="font-size: 1.3rem; font-weight: 800; color: #0f172a; margin: 25px 0 12px 0; border-left: 4px solid #c23110; padding-left: 10px;">
    ${h2Sec1Title}
  </h2>
  
  <p>
    ${h2Sec1Content}
  </p>


  <!-- [H2 BAGIAN 2: TIPS PADU PADAN OUTFIT] -->
  <h2 style="font-size: 1.3rem; font-weight: 800; color: #0f172a; margin: 30px 0 12px 0; border-left: 4px solid #c23110; padding-left: 10px;">
    ${h2Sec2Title}
  </h2>
  
  <p>
    ${h2Sec2Content}
  </p>


  <!-- [H2 BAGIAN 3: KESIMPULAN & REKOMENDASI] -->
  <h2 style="font-size: 1.3rem; font-weight: 800; color: #0f172a; margin: 30px 0 12px 0; border-left: 4px solid #c23110; padding-left: 10px;">
    ${h2Sec3Title}
  </h2>
  
  <p>
    ${h2Sec3ContentP1}
  </p>


  <!-- [H2 BAGIAN 4: PERTANYAAN & JAWABAN (FAQ)] -->
  <h2 style="font-size: 1.3rem; font-weight: 800; color: #0f172a; margin: 35px 0 14px 0; border-left: 4px solid #c23110; padding-left: 10px;">
    ${faqSectionTitle}
  </h2>

  <div class="product-faq-list" style="margin-top: 14px;">
${faqItemsHtml}
  </div>

</div>



<!-- ================================================================= -->
<!-- === [7. CSS SLIDER & ENGINE SKRIP OTOMATIS] ====================== -->
<!-- ================================================================= -->
<style>
  .product-gallery-slider {
    max-width: 100%;
    margin: 25px auto;
    font-family: inherit;
    box-sizing: border-box;
  }
  .product-gallery-slider * {
    box-sizing: border-box;
  }
  .main-slide-container {
    position: relative;
    width: 100%;
    height: 480px;
    background-color: #f8fafc;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e2e8f0;
  }
  @media (max-width: 640px) {
    .main-slide-container {
      height: 350px;
    }
  }
  .slides-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .slide-single-box {
    display: none;
    width: 100%;
    height: 100%;
    text-align: center;
  }
  .slide-single-box.active-slide {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .slide-single-box img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
    display: block;
    margin: auto;
  }
  .slide-nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(15, 23, 42, 0.45);
    color: #ffffff;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 10;
  }
  .slide-nav-btn:hover {
    background-color: rgba(15, 23, 42, 0.85);
  }
  .prev-btn { left: 12px; }
  .next-btn { right: 12px; }
  .thumbnail-strip {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    overflow-x: auto;
    padding: 6px 2px;
    scrollbar-width: thin;
  }
  .thumbnail-strip::-webkit-scrollbar {
    height: 5px;
  }
  .thumbnail-strip::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  .thumbnail-strip img {
    width: 68px;
    height: 68px;
    object-fit: cover;
    border-radius: 6px;
    cursor: pointer;
    border: 2px solid transparent;
    opacity: 0.6;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  .thumbnail-strip img.active-thumb {
    border-color: #c23110;
    opacity: 1;
    transform: scale(0.96);
  }
  .btn-single-zoom {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #f1f5f9;
    color: #334155 !important;
    padding: 6px 14px;
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    transition: 0.2s;
  }
  .btn-single-zoom:hover {
    background: #e2e8f0;
    color: #0f172a !important;
  }
  .link-shopee:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }
</style>

<script>
  var currentSlideIdx = 0;
  var galleryImgSources = [];

  function initGallery() {
    var wrapper = document.getElementById('customSlidesWrapper');
    var thumbStrip = document.getElementById('customThumbStrip');
    if (wrapper) {
      var allImgs = wrapper.querySelectorAll('img');
      galleryImgSources = [];
      allImgs.forEach(function(img) {
        var rawSrc = img.src.replace(/\\/s[0-9]+(-[a-z0-9]+)?\\//, '/s0/');
        galleryImgSources.push(rawSrc);
      });

      if (galleryImgSources.length > 0) {
        wrapper.innerHTML = '';
        if (thumbStrip) thumbStrip.innerHTML = '';

        galleryImgSources.forEach(function(src, i) {
          var slideBox = document.createElement('div');
          slideBox.className = 'slide-single-box' + (i === 0 ? ' active-slide' : '');
          slideBox.innerHTML = '<img src="' + src + '" alt="Foto ' + (i+1) + '"/>';
          wrapper.appendChild(slideBox);

          if (thumbStrip && galleryImgSources.length > 1) {
            var thumbImg = document.createElement('img');
            thumbImg.src = src;
            thumbImg.className = (i === 0) ? 'active-thumb' : '';
            thumbImg.onclick = function() { setGallerySlide(i); };
            thumbStrip.appendChild(thumbImg);
          }
        });

        if (galleryImgSources.length <= 1) {
          var prevB = document.querySelector('.prev-btn');
          var nextB = document.querySelector('.next-btn');
          if (prevB) prevB.style.display = 'none';
          if (nextB) nextB.style.display = 'none';
        }

        updateGalleryUI();
      } else {
        var prevB = document.querySelector('.prev-btn');
        var nextB = document.querySelector('.next-btn');
        if (prevB) prevB.style.display = 'none';
        if (nextB) nextB.style.display = 'none';
        var zoomB = document.getElementById('customZoomBtn');
        if (zoomB) zoomB.style.display = 'none';
      }
    }

    var sliderContainer = document.getElementById('mainSlideBox');
    if (sliderContainer) {
      var tStartX = 0;
      sliderContainer.addEventListener('touchstart', function(e) {
        tStartX = e.changedTouches[0].screenX;
      }, {passive: true});
      sliderContainer.addEventListener('touchend', function(e) {
        var tEndX = e.changedTouches[0].screenX;
        if (tStartX - tEndX > 35) moveGallerySlide(1);
        if (tEndX - tStartX > 35) moveGallerySlide(-1);
      }, {passive: true});
    }
  }

  function moveGallerySlide(n) {
    if (galleryImgSources.length === 0) return;
    currentSlideIdx += n;
    if (currentSlideIdx >= galleryImgSources.length) currentSlideIdx = 0;
    if (currentSlideIdx < 0) currentSlideIdx = galleryImgSources.length - 1;
    updateGalleryUI();
  }

  function setGallerySlide(n) {
    currentSlideIdx = n;
    updateGalleryUI();
  }

  function updateGalleryUI() {
    var slides = document.querySelectorAll('.slide-single-box');
    var thumbs = document.querySelectorAll('#customThumbStrip img');
    var zoomBtn = document.getElementById('customZoomBtn');

    slides.forEach(function(slide, i) {
      slide.classList.toggle('active-slide', i === currentSlideIdx);
    });

    thumbs.forEach(function(thumb, i) {
      thumb.classList.toggle('active-thumb', i === currentSlideIdx);
      if (i === currentSlideIdx) {
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });

    if (zoomBtn && galleryImgSources[currentSlideIdx]) {
      zoomBtn.href = galleryImgSources[currentSlideIdx];
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initGallery, 50);
  } else {
    document.addEventListener('DOMContentLoaded', initGallery);
  }
</script>`;
  };

  const generateEnglishSeoArticle = async (
    category: ProductCategory,
    description: string,
    baseTitle?: string
  ): Promise<SeoArticle> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const prompt = `You are an authentic, independent lifestyle & product reviewer writing an in-depth, 100% unique, human-written first-person personal experience review article in English (~900 words) tailored specifically for an Amazon Affiliate (Amazon Associates) niche website or product review blog.
Target Audience: Discerning global shoppers researching on Google before purchasing on Amazon (seeking honest, unfiltered user feedback, sizing precision, material durability, Prime shipping perks, and genuine purchase guidance).

=== STRICT 100% UNIQUENESS MANDATE (ZERO AI CLICHÉS, 100% ORIGINAL HUMAN VOICE) ===
1. ABSOLUTE 100% ORIGINALITY (HIGH BURSTINESS & PERPLEXITY):
   - Every single paragraph must possess a 100% uniqueness pattern. Never copy repetitive formulaic phrasing or boilerplate structures.
   - Drastically vary sentence cadence: blend punchy, short 3-8 word visceral observations with rich, detailed multi-clause reflections.
   - BANNED CLICHÉS: Strictly DO NOT use:
     * "In a world where..."
     * "A testament to..."
     * "Game-changer"
     * "Look no further"
     * "Without further ado"
     * "Delve into" / "Dive into"
     * "Tapestry" / "Plethora"
     * "Seamlessly blends"
     * "Elevate your wardrobe / style"
     * "Whether you're dressing up or dressing down"
     * "All in all, it is the ultimate choice"
   - Use candid, genuine human conversational vocabulary: "to be brutally honest", "my skepticism was through the roof", "I had my doubts before checkout", "after hauling this around for weeks", "the weave feels substantial in hand", "I caught my reflection and smiled", "here is the unfiltered truth".

2. FIRST-PERSON USER PERSPECTIVE (AUTHENTIC UGC STORYTELLING):
   - Write from the perspective of an authentic customer who bought this item with their own money ("I", "my daily routine", "in my personal test").
   - Ground every section in tangible sensory details: the crisp tactile feel of the fabric, the heft of the zipper/hardware, breathability on hot humid afternoons, comfort on long commutes, and unsolicited compliments from colleagues.

3. HIGH SEARCH INTENT & REAL SEARCH VOLUME OPTIMIZATION (HIGHLY SEARCHED BY HUMANS ON GOOGLE & AMAZON):
   - Focus on queries real humans type when researching before buying:
     * "Honest review after real wear test"
     * "Is [product] actually worth it?"
     * "True to size and fit test"
     * "Material durability and wash test"
     * "Pros and cons breakdown"
   - Seamlessly embed natural long-tail search keywords and Latent Semantic Indexing (LSI) terms without keyword stuffing.
   - Headings H1, H2, and FAQ must directly answer high-volume search intents.

4. MANDATORY AMAZON AFFILIATE FOCUS:
   - This article is strictly created for an Amazon Affiliate / Amazon Associates publication.
   - STRICTLY FORBIDDEN: Do NOT mention Shopee, Tokopedia, Lazada, or local Indonesian platforms in the English version.
   - Paragraph 6 and the markdown conclusion MUST feature a dedicated Amazon Buyer's Recommendation:
     * Encourage readers to check current pricing, live coupons, and stock availability on Amazon.
     * Highlight Amazon Prime benefits where applicable (speedy 1-2 day shipping, easy 30-day returns, authentic customer reviews).
     * Provide a clear call-to-action anchor (e.g., "[Check Today's Price & Availability on Amazon]").
     * Include an organic, compliant FTC affiliate disclosure at the end (e.g., "*Affiliate Disclosure: As an Amazon Associate, I earn from qualifying purchases at no additional cost to you.*").

5. MANDATORY ARTICLE LENGTH: APPROXIMATELY 900 WORDS
   - Target exactly around 900 words in the "fullArticle" property. Deliver concise, vivid, high-value storytelling without fluff or repetition.

6. MANDATORY 4-PARAGRAPH OPENING SECTION (MINIMAL 4 PARAGRAPH INTRO):
   The opening section of the article MUST consist of at least 4 full, rich paragraphs (~90-110 words each) providing deep context and authentic buildup before diving into specific tests:
   - Opening Paragraph 1: Initial Problem & Skepticism (~90-110 words) - Personal reason for searching for this item, frustration with past inferior purchases, and hesitation before ordering.
   - Opening Paragraph 2: Discovery & Expectations (~100-115 words) - How I found this item, what stood out from user feedback, and specific design expectations.
   - Opening Paragraph 3: Unboxing & Tactile First Impressions (~100-115 words) - Amazon unboxing moment, immediate tactile feel of materials/finish, neatness of stitching, and first-look verification.
   - Opening Paragraph 4: Reviewer Transparency & Wear-Test Setup (~85-105 words) - My commitment to an unbiased test across my real daily routines, guiding readers through the breakdown below.

7. BODY & CONCLUSION STRUCTURE:
   - Day-to-Day Wear Test & Durability (~105-120 words) - Real-world wear test through busy routines, breathability, movement flexibility, and laundry resilience.
   - Real Standout Advantages & Compliments (~105-120 words) - Comfort highlights, flattering silhouette drape, and unexpected compliments from peers.
   - Honest Caveats, Sizing & Care Tips (~90-100 words) - Candid critique, sizing accuracy (true-to-size or runs small), and care recommendations.
   - Final Verdict & Amazon Buyer's Guide (~80-95 words) - Direct verdict on value-for-money, Prime reassurance, and affiliate call-to-action.
   - H2: Hands-On Specifications & Material Breakdown (~75-90 words) - Breakdown of materials, stitching, hardware, and physical build.
   - H2: How I Style It: My Daily Outfit Combinations (~75-90 words) - Versatile outfit combinations for work, casual errands, and weekend outings.
   - FAQ: 3 High-Search-Demand Questions with direct, helpful answers (~70-85 words).
   - fullArticle: Complete Markdown article with # (H1), ## (H2), bold text, bullet points, totaling ~900 words, ending with the Amazon Affiliate CTA and FTC disclaimer.

=== PRODUCT CONTEXT ===
Category: ${category}
Seller Description:
"""
${description.trim() || 'Premium fashion item with high quality materials and modern craftsmanship.'}
"""
Base Context/Title: ${baseTitle || ''}

Respond in valid JSON with this schema:
{
  "title": "...",
  "mainKeyword": "...",
  "introParagraphs": [
    "Opening Paragraph 1: Problem & Dilemma...",
    "Opening Paragraph 2: Discovery & Expectations...",
    "Opening Paragraph 3: Unboxing & First Impressions...",
    "Opening Paragraph 4: Transparency & Wear-Test Setup..."
  ],
  "introduction": "Full 4-paragraph opening combined...",
  "price": "$29.99",
  "problem": "...",
  "solution": "...",
  "proof": "...",
  "advantages": "...",
  "limitations": "...",
  "conclusionAndCta": "...",
  "specifications": "...",
  "stylingTips": "...",
  "faq": [
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ],
  "fullArticle": "..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json"
      }
    });

    let text = response.text || "{}";
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text) as SeoArticle;
  };

  const handleGenerateEnglishArticle = async (imageId: string) => {
    const targetImg = generatedImages.find(img => img.id === imageId);
    if (!targetImg || !targetImg.marketing) return;
    
    setGeneratingEnMap(prev => ({ ...prev, [imageId]: true }));
    try {
      const seoArticleEn = await generateEnglishSeoArticle(
        productCategory,
        productDescription,
        targetImg.marketing.title || targetImg.marketing.seoArticle?.title
      );
      
      setGeneratedImages(prev => prev.map(img => {
        if (img.id === imageId && img.marketing) {
          return {
            ...img,
            marketing: {
              ...img.marketing,
              seoArticleEn
            }
          };
        }
        return img;
      }));
      setSelectedArticleLang(prev => ({ ...prev, [imageId]: 'en' }));
    } catch (err: any) {
      console.error("Error generating English article:", err);
      setError(`Gagal membuat artikel Bahasa Inggris: ${formatGeminiErrorMessage(err)}`);
    } finally {
      setGeneratingEnMap(prev => ({ ...prev, [imageId]: false }));
    }
  };

  interface AmazonMarketingData {
    title: string;
    narrative: string;
    keywords: string;
    tags: string[];
  }

  // Sanitizer to guarantee narrative, title, keywords, and tags are 100% universal without any mention of "(Amazon)" or "Amazon"
  const sanitizeUniversalText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/\s*\([Aa]mazon\)/gi, '')
      .replace(/\[[Aa]mazon\]/gi, '')
      .replace(/\b[Aa]mazon\s+[Pp]rime\b/gi, 'fast shipping')
      .replace(/\b[Aa]mazon\s+[Ff]inds?\b/gi, 'trending finds')
      .replace(/\b[Aa]mazon\s+[Ss]torefront\b/gi, 'storefront')
      .replace(/\b[Aa]mazon\s+[Aa]ssociates?\b/gi, 'affiliate')
      .replace(/\b[Aa]mazon\s+[Ll]isting\b/gi, 'product listing')
      .replace(/\b[Aa]mazon\s+[Pp]roduct\b/gi, 'product')
      .replace(/\bon\s+[Aa]mazon\b/gi, 'online')
      .replace(/\bfrom\s+[Aa]mazon\b/gi, 'right here')
      .replace(/\bto\s+[Aa]mazon\b/gi, 'to the store')
      .replace(/\bvia\s+[Aa]mazon\b/gi, 'via the link')
      .replace(/\b[Aa]mazon\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  const sanitizeUniversalTags = (tags: string[]): string[] => {
    if (!Array.isArray(tags)) return ["#ViralFinds", "#TrendingNow", "#MustHaves", "#ProductReview", "#DailyEssentials"];
    const sanitized = tags
      .map(t => {
        let clean = t
          .replace(/\(Amazon\)/gi, '')
          .replace(/\[Amazon\]/gi, '')
          .replace(/amazon/gi, 'viral')
          .replace(/#/g, '')
          .trim();
        return clean ? `#${clean}` : '';
      })
      .filter(Boolean);
    return sanitized.length > 0 ? sanitized : ["#ViralFinds", "#TrendingNow", "#MustHaves", "#ProductReview", "#DailyEssentials"];
  };

  const generateAmazonSellingNarrative = async (
    category: ProductCategory,
    description: string,
    baseTitle?: string
  ): Promise<AmazonMarketingData> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const prompt = `You are a top-tier viral short-form video creator and global e-commerce affiliate influencer (Shoppable Videos, Social Storefronts, TikTok Shop, Instagram Reels, YouTube Shorts).
Write a high-converting, punchy universal selling narrative script (STRICT MAXIMUM 25-30 SECONDS, ~50-65 WORDS) in English for this product:

PRODUCT CATEGORY: ${category}
PRODUCT DETAILS:
"""
${description.trim() || 'Premium fashion lifestyle item with exceptional durability, comfort, and modern aesthetic.'}
"""
BASE TITLE/CONTEXT: ${baseTitle || ''}

CRITICAL UNIVERSAL SELLING GUIDELINES (STRICT NEGATIVE CONSTRAINT):
1. ABSOLUTELY NEVER MENTION OR SAY THE WORD "Amazon", "(Amazon)", "Prime", OR ANY SPECIFIC PLATFORM/BRAND NAME ANYWHERE!
   - Keep the script 100% UNIVERSAL so it converts seamlessly on any international marketplace, storefront, bio link, or video platform.
   - Do NOT say "on Amazon", "Amazon find", "Amazon store", "(Amazon)", or "Amazon Prime".
2. DURATION & WORD COUNT: STRICT MAXIMUM 25-30 SECONDS (EXACTLY 50-65 WORDS).
   - Fast-paced, punchy, crisp, and to the point.
   - Zero fluff, zero filler words. Every word must command attention and drive conversions.
3. HIGH-CONVERTING 30-SECOND STRUCTURE:
   - HOOK (0-3s / ~10 words): Irresistible, scroll-stopping attention grabber (e.g. "Stop scrolling! If you want a luxury-feel ${category} without the crazy price tag, look at this...").
   - PROBLEM & SOLUTION (3-10s / ~15 words): Address the frustration with cheap, low-durability items and present this as the ultimate answer.
   - VALUE & SENSORY PROOF (10-20s / ~20 words): Vivid tangible highlights (soft premium touch, ultra-solid stitching, and looks 3x more expensive).
   - CHECKOUT CALL TO ACTION (20-28/30s / ~15 words): High-urgency push to checkout right away (e.g. "Stock is moving fast—tap the link below right now to grab yours and checkout before the promo ends!").
4. ZERO AI CLICHÉS: Do not use "game-changer", "seamlessly blends", "look no further", "in today's modern world". Speak like a real charismatic creator showing a viral must-have to a friend.
5. ALSO PROVIDE:
   - "title": A high-converting Universal Product Title (e.g., "Premium Modern ${category} - Lightweight, Breathable & Durable") — STRICTLY NO "Amazon" or "(Amazon)".
   - "keywords": High-search volume e-commerce keywords separated by commas (e.g., "viral finds, trending style, everyday essentials, premium quality, best fashion deals") — STRICTLY NO "Amazon".
   - "tags": 5 popular hashtag tags without platform names (e.g., ["#ViralFinds", "#TrendingNow", "#MustHaves", "#ProductReview", "#DailyEssentials"]) — STRICTLY NO "Amazon".

Respond ONLY with valid JSON in this structure:
{
  "title": "...",
  "narrative": "...",
  "keywords": "...",
  "tags": ["#ViralFinds", "#TrendingNow", "#MustHaves", "#ProductReview", "#DailyEssentials"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json"
      }
    });

    let text = response.text || "{}";
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
      const parsed = JSON.parse(text) as AmazonMarketingData;
      return {
        title: sanitizeUniversalText(parsed.title || `Premium Modern ${category}`),
        narrative: sanitizeUniversalText(parsed.narrative || ''),
        keywords: sanitizeUniversalText(parsed.keywords || 'viral finds, trending style, everyday essentials, premium quality'),
        tags: sanitizeUniversalTags(parsed.tags)
      };
    } catch (e) {
      console.error("Failed to parse universal marketing data", e);
      return {
        title: `Premium Modern ${category} - Versatile & Stylish`,
        narrative: `Stop scrolling! If you want a luxury-feel ${category} without the crazy price tag, this is your sign. The material feels incredible, the stitching is ultra-durable, and it instantly elevates any outfit from day to night. Promo stock is running low—tap the link below right now to grab yours and checkout before it sells out!`,
        keywords: 'viral finds, trending style, everyday essentials, premium quality, best fashion deals',
        tags: ["#ViralFinds", "#TrendingNow", "#MustHaves", "#ProductReview", "#DailyEssentials"]
      };
    }
  };

  const handleGenerateAmazonNarrative = async (imageId: string) => {
    const targetImg = generatedImages.find(img => img.id === imageId);
    if (!targetImg || !targetImg.marketing) return;
    
    setGeneratingAmazonNarrativeMap(prev => ({ ...prev, [imageId]: true }));
    try {
      const amazonData = await generateAmazonSellingNarrative(
        productCategory,
        productDescription,
        targetImg.marketing.titleAmazon || targetImg.marketing.title || targetImg.marketing.seoArticle?.title
      );
      
      setGeneratedImages(prev => prev.map(img => {
        if (img.id === imageId && img.marketing) {
          return {
            ...img,
            marketing: {
              ...img.marketing,
              titleAmazon: amazonData.title,
              narrativeAmazon: amazonData.narrative,
              keywordsAmazon: amazonData.keywords,
              tagsAmazon: amazonData.tags,
              amazon: amazonData
            }
          };
        }
        return img;
      }));
      setSelectedNarrativePlatform(prev => ({ ...prev, [imageId]: 'amazon' }));
    } catch (err: any) {
      console.error("Error generating Universal narrative:", err);
      setError(`Gagal membuat Selling Narrative Universal: ${formatGeminiErrorMessage(err)}`);
    } finally {
      setGeneratingAmazonNarrativeMap(prev => ({ ...prev, [imageId]: false }));
    }
  };

  const handleDownloadImage = async (url: string, id: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `evashop-studio-${id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const generateAudio = async (
    id: string, 
    narrative: string, 
    gender: 'wanita' | 'pria' = 'wanita',
    platform: 'shopee' | 'amazon' = 'shopee'
  ) => {
    const isAmazon = platform === 'amazon';
    setGeneratedImages(prev => prev.map(img => img.id === id ? { 
      ...img, 
      ...(isAmazon ? { isGeneratingAudioAmazon: true } : { isGeneratingAudio: true }) 
    } : img));
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = isAmazon
        ? `Narrator Persona: Charismatic, high-energy Amazon Influencer and Lifestyle Product Reviewer.
Vocal Characteristics & Delivery:
- Dynamic, enthusiastic, confident modern conversational American English accent.
- Upbeat rhythm, high vocal clarity, natural warmth, and authentic conversational cadence.
- Engaging emphasis on the opening hook and a clear, persuasive call-to-action directing listeners to check the Amazon listing/storefront.
- Express genuine enthusiasm without sounding artificial or robotic.

Read this Amazon shoppable video script with energy and passion:
${narrative}`
        : `Gaya Narator: Host Shopee Live & Shopee Video Viral No. 1 Indonesia.
Karakteristik Vokal & Emosi:
- SANGAT ENERGIK, BERVOLUME KERAS DAN LANTANG, PENUH SEMANGAT MEMBARA, antusiasme tinggi, ceria, dan sangat percaya diri.
- Intonasi cepat, dinamis, hidup, dan bertenaga di setiap kalimat tanpa jeda yang lesu.
- Artikulasi tajam, tegas, dan sangat jelas dengan nada bicara meyakinkan yang menghipnotis penonton untuk segera checkout.
- Berikan penekanan emosional yang kuat dan bersemangat pada kalimat hook pembuka serta ajakan klik keranjang video di penutup!

Bacakan teks narasi penjualan berikut dengan gaya tersebut secara total:
${narrative}`;
      
      const voiceName = gender === 'pria' ? 'Puck' : 'Aoede';
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });
      
      const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!inlineData?.data) throw new Error("No audio data returned");
      
      const rawVoicePcm = inlineData.data;
      const audioUrl = createWavFile(rawVoicePcm, 1.45);
      
      setGeneratedImages(prev => prev.map(img => img.id === id ? { 
        ...img, 
        ...(isAmazon ? { audioUrlAmazon: audioUrl, isGeneratingAudioAmazon: false } : { audioUrl, isGeneratingAudio: false })
      } : img));
    } catch (error: any) {
      console.error("Audio generation error:", error);
      setError(formatGeminiErrorMessage(error));
      setGeneratedImages(prev => prev.map(img => img.id === id ? { 
        ...img, 
        ...(isAmazon ? { isGeneratingAudioAmazon: false } : { isGeneratingAudio: false }) 
      } : img));
    }
  };

  const generateUGC = async () => {
    if (!selectedImage && !previewUrl) {
      setError("Silakan upload foto produk terlebih dahulu.");
      fileInputRef.current?.click();
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      setError("API Key Gemini belum terkonfigurasi. Pastikan API key sudah ditambahkan pada konfigurasi aplikasi.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let base64Image = "";
      let mimeType = "image/jpeg";

      if (selectedImage) {
        base64Image = await fileToBase64(selectedImage);
        mimeType = selectedImage.type || "image/jpeg";
      } else if (previewUrl) {
        if (previewUrl.startsWith('data:')) {
          const parts = previewUrl.split(',');
          const header = parts[0];
          base64Image = parts[1] || '';
          const mimeMatch = header.match(/:(.*?);/);
          if (mimeMatch) {
            mimeType = mimeMatch[1];
          }
        } else {
          base64Image = previewUrl;
        }
      }

      if (!base64Image) {
        throw new Error("Foto produk belum siap atau gagal dimuat. Silakan upload ulang foto produk.");
      }

      const imageId = `gen-${Date.now()}`;

      // 2. Generate Marketing Content
      const trendPerspectives = [
        "tren fashion minimalis yang menonjolkan 'quiet luxury' dan keanggunan berkelas tanpa usaha",
        "tren fashion 'clean aesthetic' yang mengutamakan kerapian, kesederhanaan, namun menyiratkan kemewahan",
        "tren gaya smart-casual modern, sangat cocok untuk keseimbangan antara kenyamanan aktivitas harian dan suasana semi-formal",
        "tren fashion 'timeless elegance' yang membuktikan bahwa gaya klasik yang rapi selalu dinamis dan tak lekang oleh waktu",
        "tren gaya 'effortless chic' perkotaan yang praktis, trendi, sekaligus memikat",
        "tren street-style berkelas yang memadukan kebebasan bergaya kontemporer dengan kenyamanan gerak ekstra",
        "tren modern romantis Prancis (parisian chic) yang mementingkan siluet anggun, modern, dan percaya diri tinggi"
      ];
      const selectedTrendRule = trendPerspectives[Math.floor(Math.random() * trendPerspectives.length)];

      let marketingInstruction = "";
      if (productCategory === 'tas') {
        marketingInstruction = `Berdasarkan gambar produk tas ini dan deskripsi produk yang dilampirkan, buatkan naskah selling narrative video penjualan dalam Bahasa Indonesia dengan gaya top TikTok & Shopee video creator (karismatik, persuasif tingkat tinggi, sangat padat & jelas, memikat perhatian sejak detik pertama, dan memicu penonton langsung checkout sekarang juga). Aturan SANGAT PENTING:
- JANGAN PERNAH menyebutkan warna tas sama sekali dalam judul maupun narasi.
- DURASI WAJIB SANGAT PADAT & MAKSIMAL 25-30 DETIK (TARGET 50-65 KATA SAJA, DILARANG MELEBIHI 30 DETIK SAAT DIBACA/VOICEOVER).
- Setiap kalimat harus bernilai konversi tinggi, langsung to the point tanpa basa-basi bertele-tele.
- Struktur selling narrative WAJIB MENGIKUTI POLA HYPER-CONVERTING INI SECARA BERURUTAN:
  1. HOOK KONTAN (0-3 detik / ~10 kata): Kalimat pembuka menghentak dan scroll-stopping, langsung menyita atensi audiens terkait tren: ${selectedTrendRule} (contoh: "Stop scrolling! Kalau kamu cari tas yang look-nya semewah jutaan tapi harganya ramah, ini jawabannya!").
  2. MASALAH & SOLUSI CEPAT (3-10 detik / ~15 kata): Tembak masalah tas murah yang cepat rusak dan resleting macet, lalu langsung hadirkan tas ini dengan material kulit tebal anti-gores dan jahitan butik kokoh.
  3. KEUNGGULAN SENSORIS & VALUE (10-20 detik / ~20 kata): Tunjukkan kompartemennya yang super lega, feel bahan lembut berkelas, dan look timeless yang bikin OOTD langsung naik level.
  4. CTA CHECKOUT INSTAN (20-28/30 detik / ~15-18 kata): WAJIB DITUTUP DENGAN DORONGAN CEK OUT SEGERA DENGAN KALIMAT PERSIS INI:
     "Mumpung lagi harga promo dan gratis ongkir, langsung checkout sekarang dan buruan ambil dikeranjang video ini ya tepatnya Evashop!"`;
      } else if (productCategory === 'sepatu') {
        marketingInstruction = `Berdasarkan gambar produk sepatu ini dan deskripsi produk yang dilampirkan, buatkan naskah selling narrative video penjualan dalam Bahasa Indonesia dengan gaya top TikTok & Shopee video creator (karismatik, persuasif tingkat tinggi, sangat padat & jelas, memikat perhatian sejak detik pertama, dan memicu penonton langsung checkout sekarang juga). Aturan SANGAT PENTING:
- JANGAN PERNAH menyebutkan warna sepatu sama sekali dalam judul maupun narasi.
- DURASI WAJIB SANGAT PADAT & MAKSIMAL 25-30 DETIK (TARGET 50-65 KATA SAJA, DILARANG MELEBIHI 30 DETIK SAAT DIBACA/VOICEOVER).
- Setiap kalimat harus bernilai konversi tinggi, langsung to the point tanpa basa-basi bertele-tele.
- Struktur selling narrative WAJIB MENGIKUTI POLA HYPER-CONVERTING INI SECARA BERURUTAN:
  1. HOOK KONTAN (0-3 detik / ~10 kata): Kalimat pembuka menghentak dan scroll-stopping terkait tren: ${selectedTrendRule} (contoh: "Stop scrolling! Akhirnya nemu sepatu yang cantiknya kebangetan tapi empuknya beneran kayak nginjak awan!").
  2. MASALAH & SOLUSI CEPAT (3-10 detik / ~15 kata): Tembak keresahan kaki lecet dan tumit pegal, lalu hadirkan insole empuk berkontur ergonomis ini yang siap menemani langkah seharian tanpa capek.
  3. KEUNGGULAN SENSORIS & VALUE (10-20 detik / ~20 kata): Sol anti-slip super ringan, siluet estetik bikin kaki terlihat jenjang, dan sangat fleksibel buat aktivitas kerja maupun daily.
  4. CTA CHECKOUT INSTAN (20-28/30 detik / ~15-18 kata): WAJIB DITUTUP DENGAN DORONGAN CEK OUT SEGERA DENGAN KALIMAT PERSIS INI:
     "Mumpung lagi harga promo dan gratis ongkir, langsung checkout sekarang dan buruan ambil dikeranjang video ini ya tepatnya Evashop!"`;
      } else if (productCategory === 'aksesoris') {
        marketingInstruction = `Berdasarkan gambar produk aksesoris ini dan deskripsi produk yang dilampirkan, buatkan naskah selling narrative video penjualan dalam Bahasa Indonesia dengan gaya top TikTok & Shopee video creator (karismatik, persuasif tingkat tinggi, sangat padat & jelas, memikat perhatian sejak detik pertama, dan memicu penonton langsung checkout sekarang juga). Aturan SANGAT PENTING:
- JANGAN PERNAH menyebutkan warna aksesoris sama sekali dalam judul maupun narasi.
- DURASI WAJIB SANGAT PADAT & MAKSIMAL 25-30 DETIK (TARGET 50-65 KATA SAJA, DILARANG MELEBIHI 30 DETIK SAAT DIBACA/VOICEOVER).
- Setiap kalimat harus bernilai konversi tinggi, langsung to the point tanpa basa-basi bertele-tele.
- Struktur selling narrative WAJIB MENGIKUTI POLA HYPER-CONVERTING INI SECARA BERURUTAN:
  1. HOOK KONTAN (0-3 detik / ~10 kata): Kalimat pembuka menghentak dan scroll-stopping saat menunjukkan kilau aksesoris terkait tren: ${selectedTrendRule} (contoh: "Racun banget! Kilau aksesoris semewah jutaan ini harganya beneran ramah di kantong!").
  2. MASALAH & SOLUSI CEPAT (3-10 detik / ~15 kata): Sentuh keresahan aksesoris cepat berkarat atau bikin gatal, lalu hadirkan material premium anti-karat, anti-kusam, dan aman untuk kulit sensitif.
  3. KEUNGGULAN SENSORIS & VALUE (10-20 detik / ~20 kata): Finishing super halus berkilau mewah ala butik mahal, instan meng-upgrade outfit sederhana jadi kelihatan glamor dan berkelas.
  4. CTA CHECKOUT INSTAN (20-28/30 detik / ~15-18 kata): WAJIB DITUTUP DENGAN DORONGAN CEK OUT SEGERA DENGAN KALIMAT PERSIS INI:
     "Stok promonya terbatas banget, langsung checkout sekarang dan buruan ambil dikeranjang video ini ya tepatnya Evashop!"`;
      } else {
        marketingInstruction = `Berdasarkan gambar pakaian ini dan deskripsi produk yang dilampirkan, buatkan naskah selling narrative video penjualan dalam Bahasa Indonesia dengan gaya top TikTok & Shopee video creator (karismatik, persuasif tingkat tinggi, sangat padat & jelas, memikat perhatian sejak detik pertama, dan memicu penonton langsung checkout sekarang juga). Aturan SANGAT PENTING:
- JANGAN PERNAH menyebutkan warna pakaian sama sekali dalam judul maupun narasi.
- DURASI WAJIB SANGAT PADAT & MAKSIMAL 25-30 DETIK (TARGET 50-65 KATA SAJA, DILARANG MELEBIHI 30 DETIK SAAT DIBACA/VOICEOVER).
- Setiap kalimat harus bernilai konversi tinggi, langsung to the point tanpa basa-basi bertele-tele.
- Struktur selling narrative WAJIB MENGIKUTI POLA HYPER-CONVERTING INI SECARA BERURUTAN:
  1. HOOK KONTAN (0-3 detik / ~10 kata): Kalimat pembuka menghentak dan scroll-stopping terkait tren: ${selectedTrendRule} (contoh: "Stop scrolling! Ini rahasia outfit yang bikin badan keliatan ramping dan langsung rapi tanpa ribet!").
  2. MASALAH & SOLUSI CEPAT (3-10 detik / ~15 kata): Singkirkan drama baju gerah, nerawang, atau gampang kusut; material premium ini super adem, jatuh elegan, dan bebas kusut seharian.
  3. KEUNGGULAN SENSORIS & VALUE (10-20 detik / ~20 kata): Cuttingan presisi menyamarkan lekuk tubuh, jahitan kuat standar butik, dan sangat fleksibel dipadu-padankan ke mana saja.
  4. CTA CHECKOUT INSTAN (20-28/30 detik / ~15-18 kata): WAJIB DITUTUP DENGAN DORONGAN CEK OUT SEGERA DENGAN KALIMAT PERSIS INI:
     "Mumpung voucher diskon aktif, langsung checkout sekarang dan buruan ambil dikeranjang video ini ya tepatnya Evashop!"`;
      }

      const sellerDescriptionPrompt = productDescription.trim()
        ? `
=== DESKRIPSI & INFORMASI PRODUK DARI PENJUAL ===
"""
${productDescription.trim()}
"""

=== INSTRUKSI WAJIB MEMBACA & MEMAHAMI DESKRIPSI PRODUK ===
1. Baca dan pahami seluruh informasi di atas: nama produk/brand, bahan/material spesifik, cuttingan/fitur, ukuran/dimensi, keunggulan khusus, hingga promo yang disebutkan penjual.
2. Manfaatkan informasi nyata dan bahan dari deskripsi produk ini sebagai SUBSTANSI UTAMA dalam naskah video penjualan Shopee agar naskah terdengar sangat detail, meyakinkan, dan autentik.
3. Integrasikan detail bahan, spesifikasi, dan keunggulan dari deskripsi ini ke dalam 6 Paragraf Artikel Review SEO (terutama Paragraf 2 Solusi, Paragraf 3 Bukti Kualitas, Paragraf 4 Kelebihan, Paragraf 5 Catatan/Sizing/Perawatan, dan H2 Spesifikasi Lengkap).
`
        : `
=== ANALISIS VISUAL PRODUK ===
Pelajari foto produk yang diunggah secara visual dengan cermat (tipe produk, detail jahitan, potongan siluet, tekstur bahan, dan estetika pemakaian).
`;

      const contentsParts: any[] = [];
      if (base64Image) {
        contentsParts.push({
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        });
      }
      contentsParts.push({
        text: `${sellerDescriptionPrompt}

${marketingInstruction}

Selain konten video penjualan di atas, buatkan juga ARTIKEL REVIEW PRODUK & SEO LENGKAP DALAM BAHASA INDONESIA YANG WAJIB MEMILIKI PANJANG SEKITAR 900 KATA DENGAN SYARAT MUTLAK: WAJIB UNIK 100%, MEMILIKI ARTIKEL PEMBUKA MINIMAL 4 PARAGRAF UTUH, DAN MENGANDUNG KATA KUNCI YANG BANYAK DICARI MANUSIA DI MESIN PENCARIAN (GOOGLE & MARKETPLACE), DITULIS DARI SUDUT PANDANG PENGALAMAN PRIBADI PENGGUNA NYATA (FIRST-PERSON UGC).

=== STANDAR MUTLAK 1: POLA KEUNIKAN 100% (100% UNIQUE HUMAN VOICE & ZERO AI CLICHÉ) ===
1. KEUNIKAN 100% TANPA PLAGIASI: Wajib memiliki pola keunikan 100% di setiap kalimat dan paragraf. DILARANG KERAS menjiplak template umum atau menggunakan formula generik yang kaku.
2. DILARANG KERAS MENGGUNAKAN FRASA KLISE AI: Jangan gunakan frasa membosankan seperti "tidak dapat dipungkiri", "perpaduan sempurna antara", "dalam era modern saat ini", "hadir sebagai solusi terbaik", "apakah Anda sedang mencari...", "tak perlu ragu lagi", "pilihan tepat untuk berbagai kesempatan".
3. TINGKAT PERPLEXITY & BURSTINESS TINGGI (RITME MANUSIAWI ALAMI): Gunakan kombinasi ritme kalimat pendek yang lugas dan kalimat observasi panjang yang hidup. Masukkan detail sensorik nyata (suara tarikan resleting yang mantap, rasa dingin dan lembutnya serat kain saat menyentuh kulit, kelegaan saat dipakai seharian di cuaca terik tanpa terasa pengap, hingga celetukan kagum rekan kerja).

=== STANDAR MUTLAK 2: BANYAK DICARI MANUSIA DI MESIN PENCARIAN (HIGH SEARCH VOLUME & INTENT OPTIMIZATION) ===
1. SEARCH INTENT TINGGI (COMMERCIAL & TRANSACTIONAL INTENT): Targetkan kata kunci dan frasa penelusuran yang benar-benar diketik manusia di Google dan Shopee saat mencari review sebelum checkout:
   - "review jujur pemakaian [nama produk]"
   - "[nama produk] apakah bagus dan awet"
   - "kelebihan dan kekurangan [nama produk]"
   - "tips memilih ukuran [nama produk] agar pas"
   - "rekomendasi [kategori] berkualitas harga terjangkau"
   - "apakah worth it untuk dibeli"
2. LSI & NATURAL KEYWORDS: Sisipkan kata kunci semantik LSI secara mengalir alami dalam narasi tanpa kesan keyword-stuffing.
3. FAQ GOOGLE PEOPLE ALSO ASK: Bagian FAQ wajib menjawab 3 pertanyaan yang paling banyak dicari manusia di mesin pencarian seputar produk ini (bahan, ketahanan cuci, keaslian, atau panduan ukuran).

=== STANDAR MUTLAK 3: GAYA PENULISAN PENGALAMAN PRIBADI PENGGUNA (FIRST-PERSON UGC) ===
1. SUDUT PANDANG ORANG PERTAMA: Seluruh artikel WAJIB ditulis dari sudut pandang pembeli/pemakai asli ("saya", "pengalaman pribadi saya", "jujur awalnya saya sempat ragu", "setelah saya pakai seharian", "menurut pengalaman saya selama memakai produk ini").
2. NADA BICARA TULUS, HANGAT & OTENTIK: Gaya bercerita (storytelling) yang jujur dan mengalir layaknya reviewer independen yang membeli produk dengan uangnya sendiri. JANGAN seperti brosur promosi kaku, JANGAN gunakan bahasa robotik korporat.
3. KAYA AKAN PENGALAMAN KONKRET:
   - Ceritakan alasan kenapa saya butuh produk ini dan rasa frustrasi/kecewa dengan produk lain di pasaran sebelum menemukan produk ini.
   - Ceritakan momen unboxing dan impresi pertama saat paket tiba di tangan saya (tekstur bahan saat diraba, kerapian jahitan, packaging).
   - Ceritakan pengalaman pemakaian nyata di berbagai aktivitas (saat dipakai seharian penuh untuk kerja/kuliah/jalan, saat cuaca panas, daya tahan bahan, kenyamanan gerak).
   - Berikan catatan jujur & kelemahan kecil/tips perawatan dari saya (misal tips memilih ukuran atau cara mencuci) agar review terasa sangat objektif dan terpercaya.
   - Rekomendasi tulus kepada pembaca/calon pembeli apakah produk ini benar-benar layak dibeli (worth it), serta cara mendapatkan promo diskon dan voucher gratis ongkir lewat keranjang video di Shopee.

=== STANDAR MUTLAK 4: ARTIKEL PEMBUKA MINIMAL 4 PARAGRAF & TOTAL PANJANG ~900 KATA ===
Artikel ini WAJIB berbobot pas, padat, dan bernilai tinggi dengan total panjang SEKITAR 900 KATA pada properti "fullArticle". Hindari tulisan bertele-tele atau pengulangan kata! Setiap kalimat harus padat informasi berharga yang dicari calon pembeli.

STRUKTUR WAJIB DAN RINCIAN TIAP BAGIAN (TARGET TOTAL ~900 KATA):
1. H1: Judul Artikel Review Pengalaman Pribadi (Sangat menarik, mengundang klik, memuat kata kunci penelusuran populer manusia: contoh "Review Jujur [Produk] Setelah Pemakaian Rutin: Apakah Bagus & Worth It?").

BAGIAN PEMBUKA: MINIMAL 4 PARAGRAF UTUH & MENDALAM:
2. PARAGRAF PEMBUKA 1 (Problem & Keresahan Pribadi Saya - target ~90-110 kata): Ceritakan latar belakang pribadi mengapa saya mencari produk ini, kekecewaan saya pada barang murah atau produk sejenis sebelumnya yang gampang rusak/gerah/tidak sesuai foto, dan keraguan saya sebelum memutuskan checkout.
3. PARAGRAF PEMBUKA 2 (Momen Menemukan & Ekspektasi - target ~100-115 kata): Momen menemukan produk ini, ulasan pembeli lain yang menarik perhatian, harapan spesifik sebelum membeli, dan alasan mantap mencoba.
4. PARAGRAF PEMBUKA 3 (Kesan Pertama Unboxing & Kualitas Bahan - target ~100-115 kata): Kesan saat paket tiba di rumah, sensasi rabaan fisik pertama kali pada bahan dan teksturnya, kelegaan melihat fisik asli sesuai deskripsi, kerapian jahitan keliman dan packaging.
5. PARAGRAF PEMBUKA 4 (Transparansi Ulasan & Ajakan Menyimak Uji Pakai - target ~85-105 kata): Pernyataan transparan bahwa ulasan ini ditulis jujur setelah pengujian pakai harian secara langsung, serta ajakan kepada pembaca untuk menyimak detail ulasan, foto asli, spesifikasi, tips styling, dan FAQ di bawah ini.

BAGIAN PEMBAHASAN MENDALAM:
6. BUKTI KUALITAS SETELAH PEMAKAIAN (Paragraf 5 - target ~105-120 kata): Pembuktian nyata setelah saya pakai berulang kali dalam kehidupan sehari-hari (uji pemakaian seharian, ketahanan bahan, sirkulasi udara/kenyamanan, jahitan yang kuat, reaksi positif dari teman/rekan).
7. KELEBIHAN UTAMA YANG SAYA RASAKAN (Paragraf 6 - target ~105-120 kata): Bedah kelebihan spesifik yang membuat saya jatuh cinta pada produk ini (fitur unggulan, kenyamanan luar biasa, siluet potongan yang membuat penampilan saya makin percaya diri, efisiensi harga dibanding kualitas yang didapat).
8. CATATAN JUJUR & TIPS PERAWATAN (Paragraf 7 - target ~90-100 kata): Ulasan objektif dan jujur dari kacamata saya mengenai hal-hal yang perlu diperhatikan (misalnya tips panduan memilih ukuran/size chart agar tidak salah ukuran, tips mencuci dan merawat produk agar awet).
9. KESIMPULAN JUJUR & AJAKAN BELANJA DI SHOPEE (Paragraf 8 - target ~80-95 kata): Rangkuman akhir penilaian saya apakah produk ini layak dibeli (worth it) dan sangat direkomendasikan, serta tips belanja hemat menggunakan diskon promo dan gratis ongkir di Shopee melalui keranjang video.
10. H2: Spesifikasi Rinci & Varian Warna Versi Pengguna (target ~75-90 kata): Ulasan detail spesifikasi fisik, tekstur kain/material, detail fitting, dan panduan pilihan warna yang saya amati langsung dari produk aslinya.
11. H2: Tips Padu Padan & Inspirasi Outfit Pribadi Saya (target ~75-90 kata): Berbagi inspirasi mix and match outfit harian berdasarkan gaya berpakaian saya pribadi untuk berbagai occasion (kasual, kuliah/kantor, hangout akhir pekan).
12. FAQ: 3 pertanyaan yang paling sering dicari orang di Google Search seputar produk ini beserta jawaban tulus, detail, dan solutif (target ~70-85 kata).
13. fullArticle: SUSUN KESELURUHAN ULASAN DI ATAS MENJADI SATU ARTIKEL UTUH BERFORMAT MARKDOWN DENGAN PANJANG SEKITAR 900 KATA, menggunakan heading # (H1), sub-heading ## (H2), format tebal, daftar poin, dan narasi cerita pengalaman pribadi yang mengalir nikmat dari awal hingga akhir.

=== SELLING NARRATIVE KHUSUS GLOBAL / UNIVERSAL AFFILIATE & SHOPPABLE VIDEO (ENGLISH) ===
Selain konten Shopee di atas, sertakan juga naskah penjualan video pendek dalam Bahasa Inggris (DURASI MAKSIMAL 25-30 DETIK, SEKITAR 50-65 KATA, SANGAT PADAT, JELAS, SCROLL-STOPPING, & MEMICU CHECKOUT INSTAN) untuk Global Affiliate, Shoppable Videos, & Social Storefronts (TikTok/Reels/Shorts/Global Marketplace):
- ATURAN MUTLAK UNIVERSAL: JANGAN PERNAH menyebutkan kata "Amazon", "(Amazon)", "Prime", atau nama brand platform tertentu di dalam naskah narasi, judul, keyword, maupun tag. Buat 100% universal dan luwes untuk penjualan produk secara global di link storefront mana pun.
- Gaya bicara: Modern American/Global lifestyle creator, enerjik, percaya diri, antusias, natural tanpa klise AI.
- Durasi: STRICT MAKSIMAL 25-30 DETIK (50-65 KATA SAJA). Pacing cepat, padat, dan to the point tanpa kata berulang.
- Struktur: Hook menghentak (0-3s), problem-solution & sensoric proof (3-20s), Call-to-Action checkout instan via link (20-30s).
- Sediakan juga Universal Product Title ("title"), Universal Search Keywords ("keywords"), dan 5 tags ("tags") tanpa kata Amazon.

=== 5 PROMPT ADEGAN VIDEO IKLAN TELEVISI PROFESIONAL (TVC 30 DETIK - MODEL BERBICARA LANGSUNG KE KAMERA) ===
Buatkan 5 adegan video iklan televisi profesional (TV Commercial 30 detik) di mana MODEL BERBICARA LANGSUNG MENGHADAP LENSA KAMERA MENGUCAPKAN NASKAH SELLING NARRATIVE DI SETIAP ADEGAN dengan artikulasi bibir alami (Direct-to-Camera Lip-Sync Dialogue).
Sediakan juga master prompt AI Video Generator untuk DUA PILIHAN RASIO BINGKAI: Rasio Vertikal 9:16 (TikTok, Reels, Shorts, Shopee Video) dan Rasio Horizontal 16:9 (Iklan TV & YouTube Widescreen).

Setiap adegan wajib memiliki:
- nomor adegan ("sceneNumber": 1-5)
- judul adegan ("sceneTitle")
- durasi adegan ("duration": "00:00 - 00:06 (6 Detik)", dst)
- kalimat dialog yang diucapkan model ke arah kamera ("spokenDialogue": ambil kalimat selling narrative terkait adegan ini)
- sisi kamera & lensa ("cameraAngle")
- gerakan kamera ("cameraMotion")
- pencahayaan & suasana ("lightingMood")
- aksi model, ekspresi wajah, interaksi produk, dan artikulasi bibir berbicara ke kamera ("visualAction")
- master prompt AI video untuk rasio vertikal 9:16 ("aiPrompt916": dalam bahasa Inggris siap pakai untuk Runway Gen-3/Sora/Kling/Luma lengkap dengan instruksi direct-to-camera dialogue speaking dan framing 9:16)
- master prompt AI video untuk rasio horizontal 16:9 ("aiPrompt169": dalam bahasa Inggris siap pakai untuk Runway Gen-3/Sora/Kling/Luma lengkap dengan instruksi direct-to-camera dialogue speaking dan framing 16:9)
- master prompt AI video default ("aiPrompt": samakan dengan aiPrompt916)
- petunjuk audio SFX & musik ("audioCues").
Sediakan dalam format array "videoScenes" untuk versi Indonesia dan "videoScenesAmazon" untuk versi global Amerika (keduanya 100% universal tanpa kata Amazon).

Berikan output dalam format JSON dengan struktur:
{
  "title": "...",
  "narrative": "...",
  "keywords": "...",
  "tags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "videoScenes": [
    {
      "sceneNumber": 1,
      "sceneTitle": "Adegan 1: Hook Pembuka & Model Berbicara Langsung (00:00 - 00:06)",
      "duration": "00:00 - 00:06 (6 Detik)",
      "spokenDialogue": "Stop scrolling! Kalau kamu lagi nyari...",
      "cameraAngle": "Medium Close-Up Direct-to-Camera Hero Shot, 35mm Anamorphic f/1.8",
      "cameraMotion": "Forward Tracking Dolly Halus dengan Push-in Sinematik, 60fps",
      "lightingMood": "Golden Hour Sunlight Hangat, Volumetric Rim Light Memikat",
      "visualAction": "Model melangkah ke arah kamera, menatap langsung ke lensa dengan artikulasi bibir alami (lip-sync) berbicara: \"...\" sambil memperlihatkan produk...",
      "aiPrompt916": "Cinematic 4K vertical TV commercial video (9:16 aspect ratio). Scene 1 (0-6s): Direct-to-camera speaking shot. The model looks directly into the camera lens with articulate lip-sync speaking: \"...\". Aspect Ratio: 9:16 vertical framing, TikTok and Reels format, photorealistic 8K, --ar 9:16",
      "aiPrompt169": "Cinematic 4K widescreen TV commercial video (16:9 aspect ratio). Scene 1 (0-6s): Direct-to-camera speaking shot. The model looks directly into the camera lens with articulate lip-sync speaking: \"...\". Aspect Ratio: 16:9 widescreen cinematic framing, TV commercial format, photorealistic 8K, --ar 16:9",
      "aiPrompt": "Cinematic 4K vertical TV commercial video (9:16 aspect ratio)...",
      "audioCues": "..."
    }
  ],
  "videoScenesAmazon": [
    {
      "sceneNumber": 1,
      "sceneTitle": "Scene 1: Direct-to-Camera Hook & Dynamic Arrival (0-6s)",
      "duration": "00:00 - 00:06 (6 Detik)",
      "spokenDialogue": "Stop scrolling! If you want a luxury-feel...",
      "cameraAngle": "Medium Close-Up Direct-to-Camera Hero Shot, 35mm Anamorphic f/1.8",
      "cameraMotion": "Smooth Forward Tracking Dolly with Dynamic Push-in, 60fps",
      "lightingMood": "Warm Golden Hour Cinematic Sun Flare, Luminous Volumetric Rim Lighting",
      "visualAction": "Model walks forward, looking straight into the camera lens with articulate lip-sync speaking: \"...\" while gracefully presenting the product...",
      "aiPrompt916": "Cinematic 4K vertical TV commercial video (9:16 aspect ratio). Scene 1 (0-6s): Direct-to-camera speaking shot. The model looks directly into the camera lens with articulate lip-sync speaking: \"...\". Aspect Ratio: 9:16 vertical framing, TikTok and Reels format, photorealistic 8K, --ar 9:16",
      "aiPrompt169": "Cinematic 4K widescreen TV commercial video (16:9 aspect ratio). Scene 1 (0-6s): Direct-to-camera speaking shot. The model looks directly into the camera lens with articulate lip-sync speaking: \"...\". Aspect Ratio: 16:9 widescreen cinematic framing, TV commercial format, photorealistic 8K, --ar 16:9",
      "aiPrompt": "Cinematic 4K vertical TV commercial video (9:16 aspect ratio)...",
      "audioCues": "..."
    }
  ],
  "amazon": {
    "title": "...",
    "narrative": "...",
    "keywords": "...",
    "tags": ["#ViralFinds", "#TrendingNow", "#MustHaves", "#ProductReview", "#DailyEssentials"]
  },
  "seoArticle": {
    "title": "...",
    "mainKeyword": "...",
    "introParagraphs": [
      "Paragraf Pembuka 1: Keresahan awal...",
      "Paragraf Pembuka 2: Menemukan solusi...",
      "Paragraf Pembuka 3: Kesan unboxing...",
      "Paragraf Pembuka 4: Transparansi uji pakai..."
    ],
    "introduction": "Seluruh 4 paragraf pembuka digabung...",
    "price": "Rp 149.000",
    "problem": "...",
    "solution": "...",
    "proof": "...",
    "advantages": "...",
    "limitations": "...",
    "conclusionAndCta": "...",
    "specifications": "...",
    "stylingTips": "...",
    "faq": [
      { "question": "...", "answer": "..." },
      { "question": "...", "answer": "..." },
      { "question": "...", "answer": "..." }
    ],
    "fullArticle": "..."
  }
}`
      });

      const marketingResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contentsParts,
        config: {
          responseMimeType: "application/json"
        }
      });

      let marketing: MarketingContent | undefined;
      try {
        let text = marketingResponse.text || "{}";
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        marketing = JSON.parse(text);
        if (marketing && (marketing as any).amazon) {
          const amz = (marketing as any).amazon;
          marketing.titleAmazon = sanitizeUniversalText(amz.title);
          marketing.narrativeAmazon = sanitizeUniversalText(amz.narrative);
          marketing.keywordsAmazon = sanitizeUniversalText(amz.keywords);
          marketing.tagsAmazon = sanitizeUniversalTags(amz.tags);
          if (amz.videoScenes) {
            marketing.videoScenesAmazon = amz.videoScenes;
          }
        }
      } catch (e) {
        console.error("Failed to parse marketing content", e);
      }

      // Ensure 5 Professional TV Commercial scenes are always populated
      if (marketing) {
        if (!marketing.videoScenes || !Array.isArray(marketing.videoScenes) || marketing.videoScenes.length !== 5) {
          marketing.videoScenes = createProceduralTvcScenes({
            category: productCategory,
            description: productDescription,
            market: 'indonesia',
            modelType,
            location: locationType,
            productTitle: marketing.title,
            narrative: marketing.narrative
          });
        }
        if (!marketing.videoScenesAmazon || !Array.isArray(marketing.videoScenesAmazon) || marketing.videoScenesAmazon.length !== 5) {
          marketing.videoScenesAmazon = createProceduralTvcScenes({
            category: productCategory,
            description: productDescription,
            market: 'amazon',
            modelType,
            location: locationType,
            productTitle: marketing.titleAmazon || marketing.title,
            narrative: marketing.narrativeAmazon || marketing.narrative
          });
        }
      }

      // Ensure Amazon selling narrative is populated
      if (marketing && !marketing.narrativeAmazon) {
        try {
          const amazonData = await generateAmazonSellingNarrative(
            productCategory,
            productDescription,
            marketing.title || marketing.seoArticle?.title
          );
          marketing.titleAmazon = amazonData.title;
          marketing.narrativeAmazon = amazonData.narrative;
          marketing.keywordsAmazon = amazonData.keywords;
          marketing.tagsAmazon = amazonData.tags;
          marketing.amazon = amazonData;
        } catch (e) {
          console.warn("Auto generation of Amazon narrative encountered an issue:", e);
        }
      }

      if (marketing && autoGenerateEn) {
        try {
          const seoArticleEn = await generateEnglishSeoArticle(
            productCategory,
            productDescription,
            marketing.titleAmazon || marketing.title || marketing.seoArticle?.title
          );
          marketing.seoArticleEn = seoArticleEn;
        } catch (e) {
          console.warn("Auto generation of English article encountered an issue:", e);
        }
      }

      setGeneratedImages([{
        url: "",
        id: imageId,
        marketing
      }]);
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(formatGeminiErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-emerald-100 overflow-x-hidden w-full max-w-full">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50 w-full max-w-full">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-xl tracking-tight leading-none truncate">
                EvaShop <span className="text-emerald-600">Studio</span>
              </h1>
              <p className="text-[10px] text-black/40 font-medium hidden sm:block">AI Shopee Marketing & Review Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Auto-Save & Tab Safe Status Badge */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-emerald-50/80 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200/70 shadow-xs min-h-[36px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden md:inline">Anti-Reset Aktif</span>
              <span className="text-[11px] text-emerald-600/75 font-medium hidden lg:inline">• Tersimpan ({lastSavedTime})</span>
            </div>

            {/* Manual Reset Button */}
            {(previewUrl || generatedImages.length > 0) && (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-bold text-black/60 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-black/10 active:scale-95 min-h-[36px]"
                title="Reset dan mulai sesi baru"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Reset Confirmation Dialog Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-black/10 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-black/90">Mulai Sesi Baru / Reset Halaman?</h3>
                  <p className="text-xs text-black/50">Tindakan ini akan mengosongkan gambar dan seluruh artikel review yang sudah dibuat.</p>
                </div>
              </div>
              <p className="text-xs text-black/70 bg-black/5 p-3 rounded-xl leading-relaxed">
                Selama Anda tidak menekan <strong>Ya, Reset Semua</strong>, seluruh naskah dan artikel Anda akan tetap tersimpan aman saat meninggalkan atau berpindah tab halaman.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-black/70 hover:bg-black/5 border border-black/10 transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all active:scale-95"
                >
                  Ya, Reset Semua
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 py-4 sm:py-8 lg:py-12 w-full min-w-0 max-w-full overflow-x-hidden">
        {/* Mobile Quick Navigation Ribbon when generated content exists */}
        {generatedImages.length > 0 && (
          <div className="lg:hidden mb-4 p-2 bg-white rounded-2xl border border-black/5 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs w-full min-w-0 max-w-full">
            <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider px-1.5 shrink-0">Lompat:</span>
            <a href="#ugc-sidebar-controls" className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold whitespace-nowrap active:scale-95 transition-all shrink-0">
              ⚙️ Kontrol Form
            </a>
            <a href="#ugc-generated-results" className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold whitespace-nowrap active:scale-95 transition-all shrink-0">
              🎙️ Naskah & Audio
            </a>
            <a href="#tvc-video-scenes-container" className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold whitespace-nowrap active:scale-95 transition-all shrink-0">
              🎬 5 Adegan TVC
            </a>
            <a href="#ugc-seo-article-container" className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 font-bold whitespace-nowrap active:scale-95 transition-all shrink-0">
              📄 Review & HTML
            </a>
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-[380px_1fr] xl:grid-cols-[400px_1fr] gap-6 lg:gap-8 xl:gap-12 w-full min-w-0 max-w-full">
          
          {/* Sidebar Controls */}
          <div id="ugc-sidebar-controls" className="w-full min-w-0 max-w-full space-y-4 sm:space-y-6 scroll-mt-20">
            <section className="bg-white p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-black/5 shadow-sm w-full min-w-0 max-w-full">
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-black/40 mb-3 sm:mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                1. Upload Product
              </h2>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative aspect-[4/3] sm:aspect-[9/16] max-h-72 sm:max-h-none rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden w-full
                  ${previewUrl ? 'border-emerald-500/50 bg-[#F8F9FA]' : 'border-black/10 hover:border-black/20 bg-[#F8F9FA]'}
                `}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <Upload className="w-10 h-10 text-black/20 mb-4" />
                    <p className="font-medium text-xs sm:text-base">
                      Upload {productCategory === 'pakaian' ? 'Outfit / Pakaian' : productCategory === 'tas' ? 'Tas' : productCategory === 'sepatu' ? 'Sepatu' : 'Aksesoris'}
                    </p>
                    <p className="text-[11px] sm:text-xs text-black/40 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </section>

            {/* 2. Product Description & Information */}
            <section className="bg-white p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-black/5 shadow-sm space-y-3 sm:space-y-4 w-full min-w-0 max-w-full">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-black/40 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-emerald-600" />
                  2. Deskripsi & Detail Produk
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  AI Context
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-black/60 leading-relaxed">
                Tulis, tempel (paste), atau unggah file deskripsi produk agar AI memahami bahan, fitur, ukuran, dan promo saat membuat naskah & artikel review.
              </p>

              <div className="space-y-2 w-full min-w-0">
                <div className="relative w-full">
                  <textarea
                    id="product-description-input"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder={`Contoh:\n- Nama Produk / Brand: ...\n- Bahan & Kualitas: Airflow Crinkle Premium (adem, jatuh, tidak menerawang)\n- Ukuran / Dimensi: LD 105cm, Panjang 68cm\n- Fitur Unggulan: Busui friendly, jahitan butik, anti-kusut\n- Promo: Diskon 30% + Gratis Ongkir Shopee`}
                    rows={5}
                    className="w-full p-3 sm:p-3.5 text-xs rounded-xl sm:rounded-2xl bg-[#F8F9FA] border border-black/10 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all placeholder:text-black/30 resize-y leading-relaxed text-black/80 font-normal"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 w-full min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => textFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-black/10 bg-[#F8F9FA] hover:bg-black/5 text-[11px] font-semibold text-black/70 transition-all cursor-pointer min-h-[36px]"
                      title="Upload file teks deskripsi (.txt, .md, .text)"
                    >
                      <FileUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Upload File Teks</span>
                    </button>
                    <input
                      type="file"
                      ref={textFileInputRef}
                      onChange={handleTextFileUpload}
                      accept=".txt,.md,.text,.csv"
                      className="hidden"
                    />

                    {productDescription.trim() && (
                      <button
                        type="button"
                        onClick={() => setProductDescription('')}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-medium text-rose-600 hover:bg-rose-50 transition-all cursor-pointer min-h-[36px]"
                        title="Kosongkan deskripsi"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  <span className="text-[10px] text-black/40 font-mono shrink-0">
                    {productDescription.length} karakter
                  </span>
                </div>

                {/* Quick Helper Chips */}
                {!productDescription.trim() && (
                  <div className="pt-2 w-full min-w-0">
                    <p className="text-[10px] uppercase font-bold text-black/40 tracking-wider mb-1.5">Template Cepat:</p>
                    <div className="flex flex-wrap gap-1.5 w-full min-w-0">
                      <button
                        type="button"
                        onClick={() => setProductDescription(
                          productCategory === 'pakaian' 
                            ? "- Nama: Blouse / Dress Premium\n- Bahan: Katun Linen Soft Touch (super adem, lembut, tidak menerawang)\n- Ukuran: All Size fit to XL (LD 110cm, Panjang 70cm)\n- Keunggulan: Jahitan rapi double stik, busui & wudhu friendly\n- Promo: Diskon launching 35% + Gratis Ongkir Shopee"
                            : productCategory === 'tas'
                            ? "- Nama: Shoulder Bag Leather Classic\n- Bahan: Kulit Sintetis Grade A (tebal, lentur, anti-gores & waterproof)\n- Dimensi: 26cm x 15cm x 8cm, tali strap adjustable\n- Fitur: Kompartemen luas muat HP & kosmetik, resleting emas anti-karat\n- Promo: Diskon spesial Shopee Video + Voucher Gratis Ongkir"
                            : productCategory === 'sepatu'
                            ? "- Nama: Comfort Walking Sneakers\n- Bahan: Breathable Knit Upper & Memory Foam Insole\n- Sol: Karet anti-slip elastis, ringan & empuk tanpa bikin lecet\n- Ukuran: 36 - 41 (True to size)\n- Promo: Promo hemat Shopee Video + Gratis Ongkir"
                            : "- Nama: Aksesoris Kalung / Gelang Titanium\n- Bahan: Titanium 316L lapis emas 18K (anti-karat, anti-hitam, aman untuk kulit sensitif)\n- Panjang: 40cm + 5cm rantai extender\n- Promo: Beli 1 diskon 30% + Gratis Ongkir"
                        )}
                        className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-all text-left font-medium max-w-full truncate min-h-[34px]"
                      >
                        + Pasang Template {productCategory === 'pakaian' ? 'Pakaian' : productCategory === 'tas' ? 'Tas' : productCategory === 'sepatu' ? 'Sepatu' : 'Aksesoris'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Image Prompt Generator */}
            <section className="bg-white p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-black/5 shadow-sm space-y-3.5 sm:space-y-4 w-full min-w-0 max-w-full">
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-black/40 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                3. Image Prompt Generator
              </h2>
              <div className="space-y-3.5 sm:space-y-4 w-full min-w-0">
                {/* Kategori Produk */}
                <div className="space-y-2 w-full min-w-0">
                  <label className="text-xs font-bold text-black/60 uppercase tracking-wider">Kategori Produk</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full min-w-0">
                    {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setProductCategory(cat)}
                        className={`
                          flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border transition-all text-xs font-bold w-full min-w-0 min-h-[42px] active:scale-[0.98]
                          ${productCategory === cat 
                            ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                            : 'bg-[#F8F9FA] text-black/60 border-black/5 hover:border-black/20'}
                        `}
                      >
                        <span className="shrink-0">{CATEGORY_ICONS[cat]}</span>
                        <span className="truncate">{CATEGORY_LABELS[cat]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model & Karakter Wajah */}
                <div className="space-y-2 w-full min-w-0">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-black/60 uppercase tracking-wider">Model & Karakter Wajah</label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/5 text-black/60 shrink-0">
                      {modelMarket === 'amazon' ? 'Wajah Amerika 🇺🇸' : 'Wajah Indonesia 🇮🇩'}
                    </span>
                  </div>

                  {/* Pilihan Karakter Wajah / Target Pasar */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/5 rounded-xl sm:rounded-2xl w-full min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setModelMarket('indonesia');
                        setActivePromptTab('indonesia');
                      }}
                      className={`flex items-center justify-center gap-1 py-2 px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all min-w-0 min-h-[38px] active:scale-[0.98] ${
                        modelMarket === 'indonesia'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-black/60 hover:text-black hover:bg-black/5'
                      }`}
                    >
                      <span className="shrink-0">🇮🇩</span>
                      <span className="truncate">Indonesia</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModelMarket('amazon');
                        setActivePromptTab('amazon');
                      }}
                      className={`flex items-center justify-center gap-1 py-2 px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all min-w-0 min-h-[38px] active:scale-[0.98] ${
                        modelMarket === 'amazon'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-black/60 hover:text-black hover:bg-black/5'
                      }`}
                    >
                      <span className="shrink-0">🇺🇸</span>
                      <span className="truncate">Amazon (US)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full min-w-0">
                    {(Object.keys(MODEL_LABELS) as ModelType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setModelType(type)}
                        className={`
                          flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-2.5 rounded-xl border transition-all text-xs font-bold w-full min-w-0 min-h-[40px] active:scale-[0.98]
                          ${modelType === type 
                            ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                            : 'bg-[#F8F9FA] text-black/60 border-black/5 hover:border-black/20'}
                        `}
                      >
                        <span className="shrink-0">{MODEL_ICONS[type]}</span>
                        <span className="truncate">{MODEL_LABELS[type]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Latar / Lokasi */}
                <div className="space-y-2 w-full min-w-0">
                  <label className="text-xs font-bold text-black/60 uppercase tracking-wider">Latar / Lokasi</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 w-full min-w-0">
                    {(Object.keys(LOCATION_LABELS) as LocationType[]).map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocationType(loc)}
                        className={`
                          flex items-center gap-1.5 px-2.5 py-2.5 rounded-xl border transition-all text-xs font-bold w-full min-w-0 min-h-[40px] active:scale-[0.98]
                          ${locationType === loc 
                            ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                            : 'bg-[#F8F9FA] text-black/60 border-black/5 hover:border-black/20'}
                        `}
                      >
                        <span className="shrink-0">{LOCATION_ICONS[loc]}</span>
                        <span className="truncate text-left">{LOCATION_LABELS[loc]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Prompt Box */}
                <div className="p-3 sm:p-4 bg-[#F8F9FA] rounded-2xl border border-black/5 space-y-2.5 relative group w-full min-w-0 max-w-full">
                  {/* Tab Switcher: Shopee (Indonesia) vs Amazon (Wajah Amerika) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-2 w-full min-w-0">
                    <div className="grid grid-cols-2 gap-1 p-0.5 bg-black/5 rounded-xl w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setActivePromptTab('indonesia')}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 min-w-0 min-h-[34px] ${
                          activePromptTab === 'indonesia'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-black/60 hover:text-black'
                        }`}
                      >
                        <span className="shrink-0">🇮🇩</span> <span className="truncate">Shopee (ID)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePromptTab('amazon')}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 min-w-0 min-h-[34px] ${
                          activePromptTab === 'amazon'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-black/60 hover:text-black'
                        }`}
                      >
                        <span className="shrink-0">🇺🇸</span> <span className="truncate">Amazon (US)</span>
                      </button>
                    </div>

                    <button 
                      type="button"
                      onClick={() => copyToClipboard(buildImagePrompt(productCategory, modelType, locationType, activePromptTab), 'image-sidebar')}
                      className={`w-full sm:w-auto px-3 py-1.5 rounded-lg shadow-xs transition-all flex items-center justify-center gap-1 text-[11px] font-bold border active:scale-95 min-h-[36px] ${
                        copiedType === 'image-sidebar'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : (activePromptTab === 'amazon' 
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200' 
                              : 'bg-white hover:bg-emerald-50 text-black/70 border-black/10')
                      }`}
                      title="Copy Prompt"
                    >
                      {copiedType === 'image-sidebar' ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                      <span>{copiedType === 'image-sidebar' ? 'Tersalin' : 'Copy Prompt'}</span>
                    </button>
                  </div>

                  <p className={`text-[11px] leading-relaxed italic break-words ${activePromptTab === 'amazon' ? 'text-amber-950/80 font-sans' : 'text-black/60'}`}>
                    {buildImagePrompt(productCategory, modelType, locationType, activePromptTab)}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-1 pt-1 text-[10px] text-black/40">
                    <span className="truncate">{activePromptTab === 'amazon' ? '🇺🇸 Model UGC Wajah Amerika' : '🇮🇩 Model UGC Wajah Indonesia'}</span>
                    <span className="text-[9px] font-mono shrink-0">Midjourney / Flux / SD</span>
                  </div>
                </div>

                {/* Opsi Artikel Bahasa Inggris (Amazon Affiliate • 100% Unique) */}
                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-2.5 w-full min-w-0">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-2.5 min-w-0">
                    <Globe className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-amber-950 truncate">Paket Amazon Affiliate</p>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-200/80 text-amber-900 shrink-0">100% Unique</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-amber-800/90 leading-tight">Selling Narrative & Review Amazon (~800 kata)</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={autoGenerateEn}
                      onChange={(e) => {
                        setAutoGenerateEn(e.target.checked);
                        try {
                          localStorage.setItem('evashop_studio_auto_en', String(e.target.checked));
                        } catch {}
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                <button
                  id="generate-selling-btn"
                  type="button"
                  onClick={handleGenerateClick}
                  disabled={isGenerating}
                  className={`
                    w-full py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base lg:text-lg flex items-center justify-center gap-2.5 sm:gap-3 transition-all cursor-pointer select-none min-h-[48px]
                    ${isGenerating 
                      ? 'bg-emerald-700 text-white cursor-wait opacity-90' 
                      : hasProductImage 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-600/25 active:scale-[0.98]' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-[0.98]'}
                  `}
                >
                  {isGenerating ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-amber-300 fill-amber-300" />
                  )}
                  {isGenerating ? 'Membuat Naskah & Review SEO...' : hasProductImage ? 'Generate Selling Narrative & Audio' : 'Upload Foto & Mulai Generate'}
                </button>
              </div>
            </section>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div id="ugc-generated-results" className="w-full min-w-0 max-w-full space-y-6 sm:space-y-12 scroll-mt-20">
            {/* Generated Section */}
            <section className="space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-black/90 min-w-0">
                  Generated Selling Narrative & Audio
                </h2>
                {generatedImages.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => {
                      setGeneratedImages([]);
                    }}
                    className="self-start sm:self-auto text-xs sm:text-sm font-medium text-black/50 hover:text-black flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-black/5 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6 w-full min-w-0 max-w-full">
                <AnimatePresence mode="popLayout">
                  {isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-3xl border border-black/5 flex flex-col items-center justify-center p-8 sm:p-12 text-center min-h-[260px] sm:min-h-[300px] w-full min-w-0 max-w-full"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                        <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 animate-spin" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg mb-1.5">AI is working...</h3>
                      <p className="text-xs sm:text-sm text-black/50 max-w-md">Crafting your high-converting selling narrative and AI voiceover.</p>
                    </motion.div>
                  ) : generatedImages.length > 0 ? (
                    generatedImages.flatMap((img) => {
                      const elements = [];

                      if (img.marketing) {
                        const narrativePlatform = selectedNarrativePlatform[img.id] || 'shopee';
                        const isNarrativeAmazon = narrativePlatform === 'amazon';
                        const hasAmazonNarrative = !!img.marketing.narrativeAmazon;
                        const isGeneratingAmazonNarrative = !!generatingAmazonNarrativeMap[img.id];

                        const activeTitle = (isNarrativeAmazon && img.marketing.titleAmazon) 
                          ? img.marketing.titleAmazon 
                          : img.marketing.title;
                        const activeNarrative = isNarrativeAmazon 
                          ? (img.marketing.narrativeAmazon || '') 
                          : img.marketing.narrative;
                        const activeKeywords = (isNarrativeAmazon && img.marketing.keywordsAmazon) 
                          ? img.marketing.keywordsAmazon 
                          : img.marketing.keywords;
                        const activeTags = (isNarrativeAmazon && img.marketing.tagsAmazon && img.marketing.tagsAmazon.length > 0) 
                          ? img.marketing.tagsAmazon 
                          : img.marketing.tags;

                        const activeAudioUrl = isNarrativeAmazon ? img.audioUrlAmazon : img.audioUrl;
                        const activeIsGeneratingAudio = isNarrativeAmazon ? img.isGeneratingAudioAmazon : img.isGeneratingAudio;

                        elements.push(
                          <motion.div
                            key={`mkt-${img.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-2xl sm:rounded-3xl border border-black/5 p-3.5 sm:p-6 lg:p-8 shadow-sm space-y-4 sm:space-y-6 w-full min-w-0 max-w-full overflow-hidden"
                          >
                            {/* Platform Switcher Header (Shopee Video vs Amazon Showcase) */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-black/5 pb-3 sm:pb-4 w-full min-w-0">
                              <div className="grid grid-cols-2 sm:flex items-center gap-1 sm:gap-1.5 p-1 bg-black/5 rounded-xl sm:rounded-2xl w-full sm:w-auto min-w-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedNarrativePlatform(prev => ({ ...prev, [img.id]: 'shopee' }));
                                    if (editingImageId === img.id) setEditingImageId(null);
                                    if (editingTitleId === img.id) setEditingTitleId(null);
                                  }}
                                  className={`px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 min-h-[38px] sm:min-h-0 min-w-0 ${
                                    !isNarrativeAmazon 
                                      ? 'bg-emerald-600 text-white shadow-xs' 
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  <span className="shrink-0">🇮🇩</span>
                                  <span className="truncate">Shopee Video</span>
                                  <span className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded font-extrabold shrink-0 ${
                                    !isNarrativeAmazon ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                                  }`}>Viral</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedNarrativePlatform(prev => ({ ...prev, [img.id]: 'amazon' }));
                                    if (editingImageId === img.id) setEditingImageId(null);
                                    if (editingTitleId === img.id) setEditingTitleId(null);
                                  }}
                                  className={`px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 min-h-[38px] sm:min-h-0 min-w-0 ${
                                    isNarrativeAmazon 
                                      ? 'bg-amber-600 text-white shadow-xs' 
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  <span className="shrink-0">🌐</span>
                                  <span className="truncate">Universal (US)</span>
                                  <span className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded font-extrabold shrink-0 ${
                                    isNarrativeAmazon ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                                  }`}>Affiliate</span>
                                </button>
                              </div>

                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                {isNarrativeAmazon && (
                                  <button
                                    type="button"
                                    onClick={() => handleGenerateAmazonNarrative(img.id)}
                                    disabled={isGeneratingAmazonNarrative}
                                    className="w-full sm:w-auto justify-center px-3 py-2 sm:py-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 active:scale-95 min-h-[38px] sm:min-h-0"
                                  >
                                    {isGeneratingAmazonNarrative ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                    <span>{isGeneratingAmazonNarrative ? 'Membuat Script Universal...' : (hasAmazonNarrative ? 'Regenerate Universal Script' : 'Generate Universal Script')}</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="w-full min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between gap-2 w-full min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                  <h3 className={`text-xs font-bold uppercase tracking-widest truncate min-w-0 ${isNarrativeAmazon ? 'text-amber-700' : 'text-emerald-600'}`}>
                                    {isNarrativeAmazon ? 'Universal Product Title' : 'Product Title'}
                                  </h3>
                                  {isNarrativeAmazon && (
                                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
                                      Global Universal
                                    </span>
                                  )}
                                </div>

                                {editingTitleId === img.id ? (
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setGeneratedImages(prev => prev.map(item => item.id === img.id ? {
                                          ...item,
                                          marketing: item.marketing ? {
                                            ...item.marketing,
                                            ...(isNarrativeAmazon 
                                              ? { titleAmazon: editingTitleText }
                                              : { title: editingTitleText })
                                          } : {
                                            title: editingTitleText,
                                            narrative: '',
                                            keywords: '',
                                            tags: []
                                          }
                                        } : item));
                                        setEditingTitleId(null);
                                      }}
                                      className={`px-2.5 py-1 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs active:scale-95 ${
                                        isNarrativeAmazon ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                                      }`}
                                    >
                                      <Check className="w-3.5 h-3.5" /> <span>Simpan</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingTitleId(null)}
                                      className="px-2.5 py-1 bg-black/5 text-black/70 hover:bg-black/10 rounded-lg text-xs font-bold transition-colors active:scale-95"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTitleId(img.id);
                                      setEditingTitleText(activeTitle);
                                    }}
                                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 shadow-xs border active:scale-95 shrink-0 ${
                                      isNarrativeAmazon 
                                        ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' 
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                    }`}
                                    title="Edit Judul Produk"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Edit Judul</span>
                                  </button>
                                )}
                              </div>

                              {editingTitleId === img.id ? (
                                <input
                                  type="text"
                                  value={editingTitleText}
                                  onChange={(e) => setEditingTitleText(e.target.value)}
                                  className={`w-full p-2.5 text-sm font-bold text-black/90 bg-black/5 border rounded-xl focus:outline-none ${
                                    isNarrativeAmazon ? 'border-amber-300 focus:border-amber-500' : 'border-emerald-300 focus:border-emerald-500'
                                  }`}
                                  placeholder={isNarrativeAmazon ? "Tulis judul produk universal..." : "Tulis judul produk..."}
                                />
                              ) : (
                                <p className="text-sm sm:text-lg lg:text-xl font-bold leading-snug sm:leading-tight break-words text-black/90 w-full min-w-0">{activeTitle}</p>
                              )}
                            </div>

                            <div className="w-full min-w-0 space-y-2">
                              {/* Row 1: Section Heading on left, Pencil Edit Button on right */}
                              <div className="flex items-center justify-between gap-2 w-full min-w-0">
                                <h3 className={`text-xs font-bold uppercase tracking-widest truncate min-w-0 ${isNarrativeAmazon ? 'text-amber-700' : 'text-emerald-600'}`}>
                                  <span className="hidden sm:inline">{isNarrativeAmazon ? 'Selling Narrative (Universal / English)' : 'Selling Narrative (EvaShop Video)'}</span>
                                  <span className="sm:hidden">{isNarrativeAmazon ? 'Narasi Universal' : 'Selling Narrative'}</span>
                                </h3>

                                {editingImageId === img.id ? (
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setGeneratedImages(prev => prev.map(item => item.id === img.id ? {
                                          ...item,
                                          marketing: item.marketing ? {
                                            ...item.marketing,
                                            ...(editingNarrativePlatform === 'amazon' 
                                              ? { narrativeAmazon: editingNarrativeText }
                                              : { narrative: editingNarrativeText })
                                          } : undefined
                                        } : item));
                                        setEditingImageId(null);
                                      }}
                                      className={`px-2.5 py-1 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs active:scale-95 ${
                                        isNarrativeAmazon ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                                      }`}
                                    >
                                      <Check className="w-3.5 h-3.5" /> <span>Simpan</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingImageId(null)}
                                      className="px-2.5 py-1 bg-black/5 text-black/70 hover:bg-black/10 rounded-lg text-xs font-bold transition-colors active:scale-95"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  (activeNarrative || !isNarrativeAmazon) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingImageId(img.id);
                                        setEditingNarrativePlatform(isNarrativeAmazon ? 'amazon' : 'shopee');
                                        setEditingNarrativeText(activeNarrative);
                                      }}
                                      className={`px-2 sm:px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 shadow-xs border active:scale-95 shrink-0 ${
                                        isNarrativeAmazon 
                                          ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' 
                                          : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                      }`}
                                      title="Edit Naskah Narasi"
                                    >
                                      <Pencil className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>Edit Narasi</span>
                                    </button>
                                  )
                                )}
                              </div>

                              {/* Row 2: Duration / Formula Badge */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  isNarrativeAmazon ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}>
                                  {isNarrativeAmazon 
                                    ? 'Max 30s (50-65 kata) • Hook Menghentak → Value → Checkout Segera' 
                                    : <>
                                        <span className="hidden sm:inline">Max 30s (50-65 kata) • HOOK MEMIKAT → MASALAH & SOLUSI → SENSORIK VALUE → CHECKOUT SEKARANG</span>
                                        <span className="sm:hidden">Max 30s • Padat, Jelas & Checkout</span>
                                      </>}
                                </span>
                              </div>
                              {editingImageId === img.id ? (
                                <textarea
                                  value={editingNarrativeText}
                                  onChange={(e) => setEditingNarrativeText(e.target.value)}
                                  className={`w-full h-44 p-3 text-xs sm:text-sm text-black/80 bg-black/5 border rounded-xl focus:outline-none font-sans resize-y leading-relaxed ${
                                    isNarrativeAmazon ? 'border-amber-200 focus:border-amber-500' : 'border-black/10 focus:border-emerald-500'
                                  }`}
                                  placeholder={isNarrativeAmazon ? "Tulis naskah video universal (English) di sini..." : "Tulis narasi di sini..."}
                                />
                              ) : isNarrativeAmazon && !hasAmazonNarrative ? (
                                <div className="p-4 sm:p-6 bg-amber-50/60 rounded-2xl border border-amber-200 text-center space-y-3">
                                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                                    <Sparkles className="w-5 h-5 text-amber-600" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-amber-950">Selling Narrative Universal Belum Dibuat</h4>
                                    <p className="text-xs text-amber-800 max-w-md mx-auto mt-1 leading-relaxed">
                                      Buat naskah video pendek 30-45 detik berbahasa Inggris dengan hook viral & CTA universal untuk affiliate, reels, & storefront global tanpa penyebutan brand tertentu.
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleGenerateAmazonNarrative(img.id)}
                                    disabled={isGeneratingAmazonNarrative}
                                    className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all inline-flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 min-h-[40px]"
                                  >
                                    {isGeneratingAmazonNarrative ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    <span>{isGeneratingAmazonNarrative ? 'Membuat Script Universal...' : 'Generate Selling Narrative Universal'}</span>
                                  </button>
                                </div>
                              ) : (
                                <p className="text-xs sm:text-sm text-black/80 leading-relaxed whitespace-pre-wrap break-words w-full min-w-0">{activeNarrative}</p>
                              )}
                            </div>

                            <div className="w-full min-w-0">
                              <h3 className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${isNarrativeAmazon ? 'text-amber-700' : 'text-emerald-600'}`}>
                                {isNarrativeAmazon ? 'Universal SEO Keywords' : 'Keywords'}
                              </h3>
                              <p className="text-xs text-black/60 bg-black/5 p-3 rounded-xl break-words leading-relaxed w-full min-w-0">{activeKeywords}</p>
                            </div>

                            <div className="w-full min-w-0">
                              <h3 className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${isNarrativeAmazon ? 'text-amber-700' : 'text-emerald-600'}`}>
                                {isNarrativeAmazon ? 'Universal & Social Tags' : 'Social Tags'}
                              </h3>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full min-w-0">
                                {activeTags.map((tag, idx) => (
                                  <span key={idx} className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold break-all ${
                                    isNarrativeAmazon ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-700'
                                  }`}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-3.5 sm:pt-4 border-t border-black/5 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full min-w-0">
                              <button 
                                onClick={() => copyToClipboard(`${activeTitle}\n\n${activeNarrative}\n\nKeywords: ${activeKeywords}\n\nTags: ${activeTags.join(' ')}`, `mkt-${img.id}`)}
                                className={`w-full sm:flex-1 py-3 px-3 sm:px-4 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors min-h-[44px] active:scale-[0.98] min-w-0 ${
                                  isNarrativeAmazon ? 'bg-amber-600 hover:bg-amber-700' : 'bg-black hover:bg-black/80'
                                }`}
                              >
                                {copiedType === `mkt-${img.id}` ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                                <span className="truncate">{isNarrativeAmazon ? 'Copy Universal Content (Title, Script & Tags)' : 'Copy All Content (Shopee)'}</span>
                              </button>
                              <a
                                href="#tvc-video-scenes-container"
                                className="w-full sm:w-auto py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 min-h-[44px] active:scale-[0.98] min-w-0"
                              >
                                <Clapperboard className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>🎬 5 Adegan Video TVC</span>
                              </a>
                            </div>

                            <div className="pt-3.5 sm:pt-4 border-t border-black/5 space-y-3 w-full min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                                <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                                  isNarrativeAmazon ? 'text-amber-800' : 'text-emerald-600'
                                }`}>
                                  <Volume2 className="w-3.5 h-3.5 shrink-0" /> 
                                  <span className="truncate">{isNarrativeAmazon ? 'AI Voiceover Universal (English)' : 'AI Voiceover Shopee (Bahasa Indonesia)'}</span>
                                </h3>
                                <span className={`self-start sm:self-auto inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border shrink-0 ${
                                  isNarrativeAmazon ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-50 text-amber-700 border-amber-200/80'
                                }`}>
                                  <Zap className="w-3 h-3 text-amber-600 fill-amber-500 shrink-0" />
                                  <span>{isNarrativeAmazon ? 'American / Global English' : 'Energik & Volume Keras'}</span>
                                </span>
                              </div>

                              {activeAudioUrl ? (
                                <div className={`flex flex-col gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl border w-full min-w-0 ${
                                  isNarrativeAmazon ? 'bg-amber-50/40 border-amber-200' : 'bg-emerald-50/40 border-emerald-100'
                                }`}>
                                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                                    <span className={`text-[11px] font-bold flex items-center gap-1.5 ${
                                      isNarrativeAmazon ? 'text-amber-900' : 'text-emerald-800'
                                    }`}>
                                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Audio Narator Siap ({isNarrativeAmazon ? 'Universal EN' : 'Shopee ID'})
                                    </span>
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                                      isNarrativeAmazon ? 'text-amber-800 bg-white border-amber-200' : 'text-emerald-700 bg-white border-emerald-200'
                                    }`}>
                                      {voiceGender === 'pria' ? 'Puck (Male)' : 'Aoede (Female)'}
                                    </span>
                                  </div>
                                  <audio controls src={activeAudioUrl} className="w-full h-10 rounded-lg max-w-full" style={{ maxWidth: '100%' }} />
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 w-full min-w-0">
                                    <button
                                      onClick={() => {
                                        const a = document.createElement('a');
                                        a.href = activeAudioUrl!;
                                        a.download = isNarrativeAmazon 
                                          ? `voiceover-universal-en-${img.id}.wav`
                                          : `voiceover-shopee-energik-${img.id}.wav`;
                                        a.click();
                                      }}
                                      className={`w-full py-2.5 px-3 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 min-h-[40px] ${
                                        isNarrativeAmazon ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                      }`}
                                    >
                                      <Download className="w-4 h-4 shrink-0" />
                                      <span>Download Audio (.WAV)</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        const nextGender = voiceGender === 'wanita' ? 'pria' : 'wanita';
                                        setVoiceGender(nextGender);
                                        generateAudio(img.id, activeNarrative, nextGender, isNarrativeAmazon ? 'amazon' : 'shopee');
                                      }}
                                      disabled={activeIsGeneratingAudio}
                                      className={`w-full px-3 py-2.5 bg-white border rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 min-h-[40px] ${
                                        isNarrativeAmazon ? 'hover:bg-amber-50 text-amber-900 border-amber-200' : 'hover:bg-emerald-50 text-emerald-800 border-emerald-200'
                                      }`}
                                      title="Generate ulang dengan gender suara lain"
                                    >
                                      {activeIsGeneratingAudio ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : <RefreshCw className="w-3.5 h-3.5 shrink-0" />}
                                      <span>Ganti Suara ({voiceGender === 'wanita' ? 'Pria' : 'Wanita'})</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2.5 sm:space-y-3 w-full min-w-0">
                                  {/* Pilihan Gender AI Voiceover */}
                                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => setVoiceGender('wanita')}
                                      className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1 sm:gap-1.5 min-h-[40px] min-w-0 ${
                                        voiceGender === 'wanita'
                                          ? (isNarrativeAmazon ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs' : 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs')
                                          : 'border-black/5 hover:bg-black/5 text-black/60'
                                      }`}
                                    >
                                      <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span className="truncate">Wanita (Aoede)</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setVoiceGender('pria')}
                                      className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1 sm:gap-1.5 min-h-[40px] min-w-0 ${
                                        voiceGender === 'pria'
                                          ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-xs'
                                          : 'border-black/5 hover:bg-black/5 text-black/60'
                                      }`}
                                    >
                                      <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                      <span className="truncate">Pria (Puck)</span>
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => generateAudio(img.id, activeNarrative, voiceGender, isNarrativeAmazon ? 'amazon' : 'shopee')}
                                    disabled={activeIsGeneratingAudio || !activeNarrative}
                                    className={`w-full py-3.5 px-3 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 min-h-[44px] ${
                                      isNarrativeAmazon 
                                        ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' 
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                    }`}
                                  >
                                    {activeIsGeneratingAudio ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Zap className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />}
                                    <span className="truncate">
                                      {activeIsGeneratingAudio 
                                        ? `Membuat Audio ${isNarrativeAmazon ? 'Universal (English)' : 'Shopee'}...` 
                                        : `Generate Voiceover ${isNarrativeAmazon ? 'Universal' : (voiceGender === 'pria' ? 'Pria' : 'Wanita')} • ${voiceGender === 'pria' ? 'Puck' : 'Aoede'}`}
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Prompt Foto Model AI (Khusus Global Model Wajah Amerika atau Shopee Wajah Indonesia) */}
                            <div className={`p-3.5 sm:p-4 rounded-2xl border space-y-2.5 w-full min-w-0 ${
                              isNarrativeAmazon 
                                ? 'bg-amber-50/60 border-amber-200/80' 
                                : 'bg-slate-50 border-black/5'
                            }`}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full min-w-0">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                  <Sparkles className={`w-4 h-4 shrink-0 ${isNarrativeAmazon ? 'text-amber-600' : 'text-emerald-600'}`} />
                                  <span className={`text-xs font-bold uppercase tracking-wider ${isNarrativeAmazon ? 'text-amber-950' : 'text-slate-800'}`}>
                                    {isNarrativeAmazon ? 'Prompt Foto: Model Global / American (Universal)' : 'Prompt Foto: Wajah Indonesia (Shopee)'}
                                  </span>
                                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded shrink-0 ${
                                    isNarrativeAmazon ? 'bg-amber-200/80 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {isNarrativeAmazon ? 'Global UGC' : 'Shopee Video'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(
                                    buildImagePrompt(productCategory, modelType, locationType, isNarrativeAmazon ? 'amazon' : 'indonesia'), 
                                    `card-prompt-${img.id}`
                                  )}
                                  className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs border active:scale-95 min-h-[34px] ${
                                    copiedType === `card-prompt-${img.id}`
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : (isNarrativeAmazon 
                                          ? 'bg-white hover:bg-amber-100 text-amber-900 border-amber-300' 
                                          : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200')
                                  }`}
                                >
                                  {copiedType === `card-prompt-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                                  <span>{copiedType === `card-prompt-${img.id}` ? 'Tersalin!' : (isNarrativeAmazon ? 'Copy Prompt Amerika' : 'Copy Prompt Shopee')}</span>
                                </button>
                              </div>

                              <p className={`text-[11px] leading-relaxed italic font-mono p-3 rounded-xl border select-all max-h-24 overflow-y-auto break-words ${
                                isNarrativeAmazon 
                                  ? 'bg-white/90 text-amber-950/90 border-amber-200/70' 
                                  : 'bg-white text-slate-600 border-black/5'
                              }`}>
                                {buildImagePrompt(productCategory, modelType, locationType, isNarrativeAmazon ? 'amazon' : 'indonesia')}
                              </p>

                              <p className={`text-[10px] leading-relaxed ${isNarrativeAmazon ? 'text-amber-800/80' : 'text-slate-500'}`}>
                                {isNarrativeAmazon 
                                  ? '💡 Prompt ini menggunakan karakteristik model berwajah Amerika (Caucasian US influencer) dengan style kamera smartphone modern, siap pakai di Midjourney, Google Imagen, Flux, atau Stable Diffusion.'
                                  : '💡 Prompt ini menggunakan karakteristik model berwajah Indonesia khas kreator Shopee Video dengan style kamera smartphone UGC.'}
                              </p>
                            </div>
                          </motion.div>
                        );

                        // 3. Prompt 5 Adegan Video Iklan Televisi Profesional (TVC 30 Detik)
                        elements.push(
                          <motion.div
                            key={`tvc-${img.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <TvcVideoScenesSection
                              scenes={isNarrativeAmazon ? (img.marketing.videoScenesAmazon || img.marketing.videoScenes || []) : (img.marketing.videoScenes || [])}
                              category={productCategory}
                              description={productDescription}
                              market={isNarrativeAmazon ? 'amazon' : 'indonesia'}
                              modelType={modelType}
                              location={locationType}
                              productTitle={activeTitle}
                              narrative={activeNarrative}
                              onUpdateScenes={(newScenes) => {
                                setGeneratedImages(prev => prev.map(item => {
                                  if (item.id === img.id && item.marketing) {
                                    return {
                                      ...item,
                                      marketing: {
                                        ...item.marketing,
                                        videoScenes: !isNarrativeAmazon ? newScenes : item.marketing.videoScenes,
                                        videoScenesAmazon: isNarrativeAmazon ? newScenes : item.marketing.videoScenesAmazon
                                      }
                                    };
                                  }
                                  return item;
                                }));
                              }}
                            />
                          </motion.div>
                        );

                        if (img.marketing.seoArticle || img.marketing.seoArticleEn) {
                          const currentLang = selectedArticleLang[img.id] || (img.marketing.seoArticle ? 'id' : 'en');
                          const isEn = currentLang === 'en';
                          const hasEn = !!img.marketing.seoArticleEn;
                          const isGeneratingEn = !!generatingEnMap[img.id];

                          const seo = (isEn && img.marketing.seoArticleEn) 
                            ? img.marketing.seoArticleEn 
                            : (img.marketing.seoArticle || img.marketing.seoArticleEn!);
                          
                          const fullSeoText = isEn ? getSeoArticleTextEn(seo) : getSeoArticleText(seo);
                          const wordCount = fullSeoText.trim().split(/\s+/).filter(Boolean).length;
                          const introParas = getIntroParagraphs(seo, isEn);
                          const activeTemplateType = selectedTemplateType[img.id] || (isEn ? 'amazon' : 'shopee');
                          const isAmazonTemplate = activeTemplateType === 'amazon';
                          const fullTemplateHtml = getTemplateHtml(seo, {
                            affiliateUrl: affiliateLink,
                            videoUrl: videoLink,
                            price: promoPrice || seo.price,
                            isEnglish: isEn,
                            isAmazon: isAmazonTemplate
                          });
                          
                          elements.push(
                            <motion.div
                              key={`seo-${img.id}`}
                              id="ugc-seo-article-container"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="bg-white rounded-2xl sm:rounded-3xl border border-black/5 p-3.5 sm:p-6 lg:p-8 shadow-sm space-y-4 sm:space-y-6 scroll-mt-20 w-full min-w-0 max-w-full overflow-hidden"
                            >
                              {/* Language Selector & Generator Bar */}
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl w-full min-w-0">
                                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto min-w-0">
                                  <Languages className="w-4 h-4 text-slate-700 shrink-0" />
                                  <span className="text-xs font-bold text-slate-700">Bahasa:</span>
                                  <div className="grid grid-cols-2 sm:flex p-1 bg-slate-200/70 rounded-xl gap-1 w-full sm:w-auto min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedArticleLang(prev => ({ ...prev, [img.id]: 'id' }))}
                                      className={`px-3 py-2 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[36px] sm:min-h-0 ${
                                        !isEn ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      <span>🇮🇩</span> Indonesia
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedArticleLang(prev => ({ ...prev, [img.id]: 'en' }));
                                        if (!hasEn) {
                                          handleGenerateEnglishArticle(img.id);
                                        }
                                      }}
                                      className={`px-3 py-2 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[36px] sm:min-h-0 ${
                                        isEn ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      <span>🇬🇧</span> English
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                                        isEn ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                                      }`}>Amazon</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  {isEn ? (
                                    <button
                                      type="button"
                                      onClick={() => handleGenerateEnglishArticle(img.id)}
                                      disabled={isGeneratingEn}
                                      className="w-full sm:w-auto justify-center px-3 py-2 sm:py-1.5 bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 min-h-[36px] sm:min-h-0"
                                      title="Generate variasi baru artikel Bahasa Inggris Amazon Affiliate dengan pola keunikan 100%"
                                    >
                                      {isGeneratingEn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                      <span>{isGeneratingEn ? 'Membuat Review Amazon...' : (hasEn ? 'Regenerate English (Amazon)' : 'Generate English (Amazon)')}</span>
                                    </button>
                                  ) : !hasEn ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedArticleLang(prev => ({ ...prev, [img.id]: 'en' }));
                                        handleGenerateEnglishArticle(img.id);
                                      }}
                                      disabled={isGeneratingEn}
                                      className="w-full sm:w-auto justify-center px-3 py-2 sm:py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 min-h-[36px] sm:min-h-0"
                                    >
                                      {isGeneratingEn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                                      <span>Buat Versi Amazon Affiliate</span>
                                    </button>
                                  ) : null}
                                </div>
                              </div>

                              {/* Loading indicator for English Generation */}
                              {isEn && !hasEn && isGeneratingEn && (
                                <div className="p-6 sm:p-8 text-center bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3 w-full min-w-0">
                                  <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                                  <h4 className="text-sm font-bold text-amber-950">Sedang Menulis Review Amazon Affiliate (100% Unik)...</h4>
                                  <p className="text-xs text-amber-800 max-w-md mx-auto leading-relaxed">
                                    Menyusun naskah review first-person UGC mendalam (~900 kata) khusus Amazon Affiliate dengan pembuka minimal 4 paragraf, pola keunikan 100%, variasi burstiness tinggi, bebas klise AI, dan optimasi kata kunci pencarian manusia.
                                  </p>
                                </div>
                              )}

                              {/* Header with Title & Top Copy Button */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/5 w-full min-w-0">
                                <div className="w-full min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                                      isEn ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                      <Search className="w-3 h-3" />
                                      {isEn ? 'Personal Experience Review (Amazon Affiliate SEO)' : 'Artikel Review Pengalaman Pribadi & SEO'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <FileText className="w-3 h-3" />
                                      {isEn ? `${wordCount} Words • ~900 Words Target` : `${wordCount} Kata • Standar ±900 Kata`}
                                    </span>
                                    <span className="text-[11px] text-black/50 font-medium">
                                      {isEn ? 'Authentic First-Person UGC (Amazon Associates • 100% Unique)' : 'Sudut Pandang Pengguna Asli (First-Person • 100% Unik)'}
                                    </span>
                                  </div>
                                  <h3 className="text-base sm:text-xl font-bold text-black/90 break-words">
                                    {seo.title || (isEn ? 'Honest Personal Review: My In-Depth Experience' : 'Review Pengalaman Pemakaian Produk Pilihan')}
                                  </h3>
                                </div>

                                {/* Copy Buttons & Tab Switcher */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-wrap w-full sm:w-auto min-w-0">
                                  <div className="grid grid-cols-3 sm:flex bg-black/5 p-1 rounded-xl gap-1 w-full sm:w-auto min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => setActiveSeoTab('structured')}
                                      className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center min-h-[38px] sm:min-h-0 ${
                                        activeSeoTab === 'structured' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black'
                                      }`}
                                    >
                                      <span className="sm:hidden">Struktur</span>
                                      <span className="hidden sm:inline">{isEn ? 'Structured Breakdown' : 'Susunan Paragraf Pengalaman Pribadi'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setActiveSeoTab('full')}
                                      className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center min-h-[38px] sm:min-h-0 ${
                                        activeSeoTab === 'full' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black'
                                      }`}
                                    >
                                      <span className="sm:hidden">Teks Penuh</span>
                                      <span className="hidden sm:inline">{isEn ? 'Full Article (~900 Words)' : 'Artikel Lengkap ±900 Kata'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setActiveSeoTab('html')}
                                      className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 text-center min-h-[38px] sm:min-h-0 ${
                                        activeSeoTab === 'html' ? 'bg-orange-600 text-white shadow-sm' : 'text-black/60 hover:text-black'
                                      }`}
                                    >
                                      <Code className="w-3.5 h-3.5 shrink-0" />
                                      <span className="sm:hidden">HTML</span>
                                      <span className="hidden sm:inline">{isEn ? 'HTML Template' : 'Template HTML Blog'}</span>
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-2 sm:flex gap-1.5 sm:gap-2 w-full sm:w-auto min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(fullTemplateHtml, `seo-html-top-${img.id}`)}
                                      className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/15 active:scale-95 transition-all min-h-[38px]"
                                      title={isEn ? 'Copy generated HTML version of the article' : 'Salin kode HTML artikel yang siap pakai untuk blog/website'}
                                    >
                                      {copiedType === `seo-html-top-${img.id}` ? <Check className="w-3.5 h-3.5 text-white" /> : <Code className="w-3.5 h-3.5 text-white" />}
                                      <span>{copiedType === `seo-html-top-${img.id}` ? (isEn ? 'HTML Copied!' : 'HTML Tersalin!') : (isEn ? 'Copy HTML' : 'Salin HTML')}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(fullSeoText, `seo-${img.id}`)}
                                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95 transition-all min-h-[38px]"
                                    >
                                      {copiedType === `seo-${img.id}` ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                                      <span>{copiedType === `seo-${img.id}` ? (isEn ? 'Copied All!' : 'Tersalin!') : (isEn ? 'Copy Text' : 'Salin Teks')}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* SEO Visual Heading Pipeline */}
                              <div className="p-4 bg-gradient-to-r from-rose-50/80 via-blue-50/80 via-emerald-50/80 via-amber-50/80 via-purple-50/80 to-rose-50/80 rounded-2xl border border-black/5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
                                  <p className="text-[11px] font-bold text-black/60 uppercase tracking-wider">
                                    {isEn ? '4-Paragraph Intro + UGC Review Flow (~900 Words):' : 'Alur Pembuka 4 Paragraf + UGC Review (Target ±900 Kata):'}
                                  </p>
                                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md self-start sm:self-auto">
                                    {isEn ? '100% Unique Human Voice (UGC)' : 'Tulisan Pengguna Nyata (First-Person UGC)'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-black/70 overflow-x-auto pb-1 scrollbar-none">
                                  <span className="bg-white px-2 py-0.5 rounded-md border border-purple-200 text-purple-700 font-bold">
                                    {isEn ? 'H1: Title' : 'H1: Judul'}
                                  </span>
                                  <span className="text-black/30">→</span>
                                  <span className="bg-white px-2 py-0.5 rounded-md border border-rose-200 text-rose-700 font-bold">
                                    {isEn ? '1. Dilemma' : '1. Keresahan'}
                                  </span>
                                  <span className="text-black/30">→</span>
                                  <span className="bg-white px-2 py-0.5 rounded-md border border-sky-200 text-sky-700 font-bold">
                                    {isEn ? '2. Expectations' : '2. Ekspektasi'}
                                  </span>
                                  <span className="text-black/30">→</span>
                                  <span className="bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-700 font-bold">
                                    {isEn ? '3. Unboxing' : '3. Unboxing'}
                                  </span>
                                  <span className="text-black/30">→</span>
                                  <span className="bg-white px-2 py-0.5 rounded-md border border-teal-200 text-teal-700 font-bold">
                                    {isEn ? '4. Overview' : '4. Komitmen'}
                                  </span>
                                  <span className="text-black/30">→</span>
                                  <span className="bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-700 font-bold">
                                    {isEn ? '5. Wear Test' : '5. Uji Pakai'}
                                  </span>
                                  <span className="text-black/30">→</span>
                                  <span className="bg-white px-2 py-0.5 rounded-md border border-amber-200 text-amber-700 font-bold">
                                    {isEn ? '6. Advantages' : '6. Keunggulan'}
                                  </span>
                                  <span className="text-black/30">→</span>
                                  <span className="bg-white px-2 py-0.5 rounded-md border border-purple-200 text-purple-700 font-bold">
                                    {isEn ? '7. Honest Notes' : '7. Catatan Jujur'}
                                  </span>
                                  <span className="text-black/30">→</span>
                                  <span className={`px-2 py-0.5 rounded-md border font-bold ${
                                    isEn ? 'bg-white border-amber-300 text-amber-900' : 'bg-white border-rose-300 text-rose-800'
                                  }`}>
                                    {isEn ? '8. Buyer CTA' : '8. Rekomendasi/CTA'}
                                  </span>
                                </div>
                              </div>

                              {activeSeoTab === 'structured' ? (
                                <div className="space-y-4">
                                  {/* Keyword Badge if present */}
                                  {seo.mainKeyword && (
                                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <Search className="w-4 h-4 text-slate-600 shrink-0" />
                                        <div>
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                            {isEn ? 'Primary Google Search Target Keyword' : 'Target Kata Kunci Utama Google Search'}
                                          </span>
                                          <span className="text-xs font-bold text-slate-800">{seo.mainKeyword}</span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(seo.mainKeyword || '', `seo-kw-${img.id}`)}
                                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-200 flex items-center gap-1 shrink-0 transition-all active:scale-95"
                                      >
                                        {copiedType === `seo-kw-${img.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                        {copiedType === `seo-kw-${img.id}` ? (isEn ? 'Copied' : 'Tersalin') : (isEn ? 'Copy Keyword' : 'Salin Keyword')}
                                      </button>
                                    </div>
                                  )}

                                  {/* H1: Judul Artikel (Otomatis) */}
                                  <div className="p-4 sm:p-5 bg-purple-50/50 rounded-xl sm:rounded-2xl border border-purple-100/90 space-y-2.5 sm:space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black tracking-wider uppercase shrink-0">
                                          H1
                                        </span>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 leading-tight">
                                          {isEn ? 'First-Person Experience Review Title' : 'Judul Artikel Review Pengalaman Pribadi'}
                                        </h4>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(`# ${seo.title || ''}`, `seo-h1-${img.id}`)}
                                        className="w-full sm:w-auto px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 min-h-[36px]"
                                      >
                                        {copiedType === `seo-h1-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedType === `seo-h1-${img.id}` ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy H1' : 'Salin H1')}</span>
                                      </button>
                                    </div>
                                    <p className="text-sm sm:text-base lg:text-lg font-extrabold text-purple-950 leading-snug break-words">
                                      {seo.title || (isEn ? 'Honest Personal Review: My In-Depth Experience Testing This Product' : 'Review Jujur Pengalaman Pribadi: Ulasan Lengkap Pemakaian Harian')}
                                    </p>
                                  </div>

                                  {/* SECTION 1: 4-PARAGRAPH OPENING */}
                                  <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-rose-50 via-sky-50 to-indigo-50 rounded-2xl border border-rose-200/70">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                                        {isEn ? 'Section 1' : 'Bagian 1'}
                                      </span>
                                      <span className="text-xs font-bold text-rose-950">
                                        {isEn ? '4-Paragraph Opening Introduction (Target ~400 Words)' : 'Artikel Pembuka (Minimal 4 Paragraf Utuh • Target ~400 Kata)'}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                                      4 Paragraf
                                    </span>
                                  </div>

                                  {/* PARAGRAF PEMBUKA 1: MASALAH / KERESAHAN AWAL */}
                                  <div className="p-4 sm:p-5 bg-rose-50/40 rounded-xl sm:rounded-2xl border border-rose-200/80 space-y-2.5 sm:space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black tracking-wider uppercase shrink-0">
                                          {isEn ? 'Opening 1 • Dilemma' : 'Pembuka 1 • Keresahan'}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 leading-tight">
                                            {isEn ? 'Pre-Purchase Dilemma & Hesitations' : 'Keresahan & Dilema Pribadi Sebelum Membeli (Problem)'}
                                          </h4>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(introParas[0], `seo-p1-${img.id}`)}
                                        className="w-full sm:w-auto px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-800 rounded-xl text-xs font-bold border border-rose-200 shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 min-h-[36px]"
                                      >
                                        {copiedType === `seo-p1-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedType === `seo-p1-${img.id}` ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy Intro 1' : 'Salin Pembuka 1')}</span>
                                      </button>
                                    </div>
                                    <p className="text-xs sm:text-sm text-rose-950/90 leading-relaxed whitespace-pre-wrap break-words">
                                      {introParas[0]}
                                    </p>
                                  </div>

                                  {/* PARAGRAF PEMBUKA 2: MOMEN SOLUSI & EKSPEKTASI */}
                                  <div className="p-4 sm:p-5 bg-sky-50/40 rounded-xl sm:rounded-2xl border border-sky-200/80 space-y-2.5 sm:space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-md bg-sky-600 text-white text-[10px] font-black tracking-wider uppercase shrink-0">
                                          {isEn ? 'Opening 2 • Discovery' : 'Pembuka 2 • Solusi'}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <Lightbulb className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 leading-tight">
                                            {isEn ? 'The Turning Point: Discovering This Product' : 'Momen Solusi & Ekspektasi Menemukan Produk (Solution)'}
                                          </h4>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(introParas[1], `seo-p2-${img.id}`)}
                                        className="w-full sm:w-auto px-3 py-1.5 bg-white hover:bg-sky-50 text-sky-800 rounded-xl text-xs font-bold border border-sky-200 shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 min-h-[36px]"
                                      >
                                        {copiedType === `seo-p2-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedType === `seo-p2-${img.id}` ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy Intro 2' : 'Salin Pembuka 2')}</span>
                                      </button>
                                    </div>
                                    <p className="text-xs sm:text-sm text-sky-950/90 leading-relaxed whitespace-pre-wrap break-words">
                                      {introParas[1]}
                                    </p>
                                  </div>

                                  {/* PARAGRAF PEMBUKA 3: IMPRESI AWAL & UNBOXING */}
                                  <div className="p-4 sm:p-5 bg-indigo-50/40 rounded-xl sm:rounded-2xl border border-indigo-200/80 space-y-2.5 sm:space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase shrink-0">
                                          {isEn ? 'Opening 3 • Unboxing' : 'Pembuka 3 • Unboxing'}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 leading-tight">
                                            {isEn ? 'Unboxing Experience & First Tactile Impressions' : 'Impresi Pertama Unboxing & Kualitas Bahan (Unboxing)'}
                                          </h4>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(introParas[2], `seo-p3-${img.id}`)}
                                        className="w-full sm:w-auto px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-800 rounded-xl text-xs font-bold border border-indigo-200 shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 min-h-[36px]"
                                      >
                                        {copiedType === `seo-p3-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedType === `seo-p3-${img.id}` ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy Intro 3' : 'Salin Pembuka 3')}</span>
                                      </button>
                                    </div>
                                    <p className="text-xs sm:text-sm text-indigo-950/90 leading-relaxed whitespace-pre-wrap break-words">
                                      {introParas[2]}
                                    </p>
                                  </div>

                                  {/* PARAGRAF PEMBUKA 4: TRANSPARANSI & KOMITMEN UJI PAKAI */}
                                  <div className="p-4 sm:p-5 bg-teal-50/40 rounded-xl sm:rounded-2xl border border-teal-200/80 space-y-2.5 sm:space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-md bg-teal-600 text-white text-[10px] font-black tracking-wider uppercase shrink-0">
                                          {isEn ? 'Opening 4 • Overview' : 'Pembuka 4 • Transparansi'}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 leading-tight">
                                            {isEn ? 'Reviewer Transparency Pledge & Wear-Test Setup' : 'Transparansi Ulasan & Komitmen Uji Pakai Harian (Overview)'}
                                          </h4>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(introParas[3], `seo-p4-${img.id}`)}
                                        className="w-full sm:w-auto px-3 py-1.5 bg-white hover:bg-teal-50 text-teal-800 rounded-xl text-xs font-bold border border-teal-200 shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 min-h-[36px]"
                                      >
                                        {copiedType === `seo-p4-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedType === `seo-p4-${img.id}` ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy Intro 4' : 'Salin Pembuka 4')}</span>
                                      </button>
                                    </div>
                                    <p className="text-xs sm:text-sm text-teal-950/90 leading-relaxed whitespace-pre-wrap break-words">
                                      {introParas[3]}
                                    </p>
                                  </div>

                                  {/* SECTION 2: DEEP DIVE REVIEW */}
                                  <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-2xl border border-emerald-200/70">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                                        {isEn ? 'Section 2' : 'Bagian 2'}
                                      </span>
                                      <span className="text-xs font-bold text-emerald-950">
                                        {isEn ? 'Hands-On Wear Test, Pros & Cons, and Verdict' : 'Pembahasan Mendalam & Uji Pemakaian Harian Langsung'}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                                      Uji Nyata
                                    </span>
                                  </div>

                                  {/* PARAGRAF 5: BUKTI UJI PAKAI (Proof) */}
                                  <div className="p-4 sm:p-5 bg-emerald-50/50 rounded-xl sm:rounded-2xl border border-emerald-200/80 space-y-2.5 sm:space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black tracking-wider uppercase shrink-0">
                                          {isEn ? 'Paragraph 5 • Wear Test' : 'Paragraf 5 • Uji Pakai Nyata'}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 leading-tight">
                                            {isEn ? 'Real-World Wear Test & Daily Durability' : 'Bukti Kualitas & Pengalaman Nyata Setelah Pemakaian (Proof)'}
                                          </h4>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(
                                          seo.proof || (isEn ? 'I put this product through rigorous daily tests over several weeks...' : 'Saya sudah menguji dan memakai produk ini berulang kali...'),
                                          `seo-p5-${img.id}`
                                        )}
                                        className="w-full sm:w-auto px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 min-h-[36px]"
                                      >
                                        {copiedType === `seo-p5-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedType === `seo-p5-${img.id}` ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy Paragraph 5' : 'Salin Paragraf 5')}</span>
                                      </button>
                                    </div>
                                    <p className="text-xs sm:text-sm text-emerald-950/90 leading-relaxed whitespace-pre-wrap">
                                      {seo.proof || (isEn
                                        ? 'I put this product through rigorous daily tests over several busy weeks—from early morning commutes to late-night outings. It maintained its shape, stayed comfortably breathable in humid heat, and suffered zero fading after multiple laundry cycles.'
                                        : 'Saya sudah menguji dan memakai produk ini berulang kali untuk berbagai aktivitas dari pagi hingga malam hari. Hasilnya sangat memuaskan: tidak menimbulkan rasa gerah meski dipakai di cuaca panas, tidak mudah kusut saat saya banyak bergerak aktif, serta ketahanan warnanya tetap terjaga prima setelah beberapa kali proses pencucian.')}
                                    </p>
                                  </div>

                                  {/* PARAGRAF 6: KELEBIHAN (Advantages) */}
                                  <div className="p-4 sm:p-5 bg-amber-50/50 rounded-xl sm:rounded-2xl border border-amber-200/80 space-y-2.5 sm:space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-black tracking-wider uppercase shrink-0">
                                          {isEn ? 'Paragraph 6 • Standout Advantages' : 'Paragraf 6 • Keunggulan Nyata'}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <ThumbsUp className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 leading-tight">
                                            {isEn ? 'The Key Advantages That Genuinely Won Me Over' : 'Keunggulan Utama yang Benar-Benar Saya Rasakan (Advantages)'}
                                          </h4>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(
                                          seo.advantages || (isEn ? 'What impressed me most was the tailored silhouette and effortless versatility...' : 'Poin keunggulan yang paling saya rasakan adalah tingkat kenyamanan maksimal...'),
                                          `seo-p6-${img.id}`
                                        )}
                                        className="w-full sm:w-auto px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 min-h-[36px]"
                                      >
                                        {copiedType === `seo-p6-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedType === `seo-p6-${img.id}` ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy Paragraph 6' : 'Salin Paragraf 6')}</span>
                                      </button>
                                    </div>
                                    <p className="text-xs sm:text-sm text-amber-950/90 leading-relaxed whitespace-pre-wrap">
                                      {seo.advantages || (isEn
                                        ? 'What impressed me most was the tailored silhouette that naturally elevated my posture and appearance. Colleagues and friends frequently asked where I bought it, validating that it looks even better in real life than on screen.'
                                        : 'Poin keunggulan yang paling saya rasakan adalah tingkat kenyamanan maksimal sepanjang hari dan siluet potongannya yang membuat penampilan saya terlihat lebih proporsional serta percaya diri. Banyak teman dan rekan yang spontan memuji tampilannya dan menanyakan langsung di mana saya membelinya.')}
                                    </p>
                                  </div>

                                  {/* PARAGRAF 7: KEKURANGAN & CATATAN JUJUR (Limitations) */}
                                  <div className="p-4 sm:p-5 bg-purple-50/40 rounded-xl sm:rounded-2xl border border-purple-200/80 space-y-2.5 sm:space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black tracking-wider uppercase shrink-0">
                                          {isEn ? 'Paragraph 7 • Honest Notes & Care' : 'Paragraf 7 • Catatan Jujur & Tips'}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <AlertTriangle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 leading-tight">
                                            {isEn ? 'Honest Caveats & Care Advice' : 'Catatan Transparan, Kelemahan Realistis & Tips Perawatan (Limitations)'}
                                          </h4>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(
                                          seo.limitations || (seo.cons && seo.cons.length > 0 ? seo.cons.join('. ') : (isEn ? 'To keep this review balanced, always check the exact size chart before purchasing.' : 'Agar ulasan ini tetap berimbang dan objektif...')),
                                          `seo-p7-${img.id}`
                                        )}
                                        className="w-full sm:w-auto px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-800 rounded-xl text-xs font-bold border border-purple-200 shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 min-h-[36px]"
                                      >
                                        {copiedType === `seo-p7-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedType === `seo-p7-${img.id}` ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy Paragraph 7' : 'Salin Paragraf 7')}</span>
                                      </button>
                                    </div>
                                    <p className="text-xs sm:text-sm text-purple-950/90 leading-relaxed whitespace-pre-wrap">
                                      {seo.limitations || (seo.cons && seo.cons.length > 0 ? seo.cons.join('. ') : (isEn
                                        ? 'To keep this review completely balanced: do pay close attention to the sizing dimensions before checking out. For long-lasting preservation, wash inside-out on a delicate cycle and air dry.'
                                        : 'Agar ulasan ini tetap berimbang dan objektif, catatan penting dari pengalaman pribadi saya adalah pastikan kalian memeriksa tabel panduan ukuran (size chart) dengan cermat sebelum membeli. Selain itu, disarankan mencuci dengan putaran lembut agar serat kain dan detail jahitan tetap awet sempurna.'))}
                                    </p>
                                  </div>

                                  {/* PARAGRAF 8: CTA & KESIMPULAN BELI (Shopee ID / Amazon Affiliate EN) */}
                                  <div className={`p-5 rounded-2xl border space-y-3 ${
                                    isEn ? 'bg-amber-50/60 border-amber-300/90' : 'bg-rose-50/60 border-rose-300/90'
                                  }`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-md text-white text-[10px] font-black tracking-wider uppercase shrink-0 ${
                                          isEn ? 'bg-amber-600' : 'bg-rose-600'
                                        }`}>
                                          {isEn ? 'Paragraph 8 • Amazon Verdict & CTA' : 'Paragraf 8 • Rekomendasi & CTA Shopee'}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <ShoppingBag className={`w-3.5 h-3.5 shrink-0 ${isEn ? 'text-amber-700' : 'text-rose-600'}`} />
                                          <h4 className={`text-xs font-bold uppercase tracking-wider leading-tight ${isEn ? 'text-amber-950' : 'text-rose-900'}`}>
                                            {isEn ? "My Final Verdict & Amazon Buyer's Recommendation (Affiliate)" : 'Kesimpulan Akhir Saya & Rekomendasi Belanja di Shopee'}
                                          </h4>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(
                                          seo.conclusionAndCta || seo.cta || (isEn ? 'In conclusion, this item offers tremendous value and genuine quality.' : 'Berdasarkan pengalaman pemakaian pribadi saya...'),
                                          `seo-p8-${img.id}`
                                        )}
                                        className={`w-full sm:w-auto px-3 py-1.5 bg-white rounded-xl text-xs font-bold border shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 min-h-[36px] ${
                                          isEn ? 'hover:bg-amber-50 text-amber-900 border-amber-200' : 'hover:bg-rose-50 text-rose-800 border-rose-200'
                                        }`}
                                      >
                                        {copiedType === `seo-p8-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedType === `seo-p8-${img.id}` ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy Paragraph 8' : 'Salin Paragraf 8')}</span>
                                      </button>
                                    </div>
                                    <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium ${
                                      isEn ? 'text-amber-950' : 'text-rose-950/90'
                                    }`}>
                                      {seo.conclusionAndCta || seo.cta || (isEn
                                        ? 'In my honest verdict, this item delivers exceptional return on investment and holds up beautifully to real-world use. If you are ready to upgrade, check current pricing, real customer reviews, and fast Prime delivery options on Amazon right now!'
                                        : 'Berdasarkan pengalaman pemakaian pribadi saya, produk ini sangat layak dan worth-it untuk dimiliki. Buat teman-teman yang ingin mendapatkan produk original dengan promo harga spesial dan voucher gratis ongkir, saya sarankan langsung checkout melalui keranjang video di Shopee sekarang juga!')}
                                    </p>
                                    {isEn && (
                                      <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2 text-[10px] text-amber-800">
                                        <span className="font-semibold italic">FTC Notice: As an Amazon Associate, I earn from qualifying purchases.</span>
                                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px]">Amazon Associates Ready</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* BAGIAN PENDUKUNG: H2 Spesifikasi Lengkap / Poin Pembahasan */}
                                  <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-700 text-white text-[10px] font-black tracking-wider uppercase">
                                          H2
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <FileText className="w-3.5 h-3.5 text-slate-700" />
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                            {isEn ? 'Hands-On Specifications & Material Breakdown' : 'Spesifikasi Rinci & Detail Material Versi Pengguna'}
                                          </h4>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(
                                          `## ${isEn ? 'Hands-On Specifications & Material Breakdown' : 'Spesifikasi Rinci & Detail Material Versi Pengguna'}\n\n${seo.specifications || ''}`,
                                          `seo-h2-specs-${img.id}`
                                        )}
                                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-sm flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                                      >
                                        {copiedType === `seo-h2-specs-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copiedType === `seo-h2-specs-${img.id}` ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy H2' : 'Salin H2')}
                                      </button>
                                    </div>
                                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                                      {seo.specifications || (isEn 
                                        ? 'From direct hands-on inspection, the fabric density is ideal, non-transparent, and reinforced with double-stitched stress points for longevity.' 
                                        : 'Berdasarkan pengamatan fisik langsung saya, material yang digunakan memiliki gramasi yang pas, tidak menerawang, serat kain rapat, serta dilengkapi detail pengerjaan finishing yang sangat presisi.')}
                                    </div>
                                  </div>

                                  {/* BAGIAN PENDUKUNG: H2 Tips Padu Padan / Tips Ekstra */}
                                  <div className="p-5 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md bg-teal-700 text-white text-[10px] font-black tracking-wider uppercase">
                                          H2
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <Shirt className="w-3.5 h-3.5 text-teal-700" />
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-950">
                                            {isEn ? 'How I Style It: Daily Outfit Inspirations' : 'Inspirasi & Tips Padu Padan Outfit Harian Saya'}
                                          </h4>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(
                                          `## ${isEn ? 'How I Style It: Daily Outfit Inspirations' : 'Inspirasi & Tips Padu Padan Outfit Harian Saya'}\n\n${seo.stylingTips || ''}`,
                                          `seo-h2-styling-${img.id}`
                                        )}
                                        className="px-3 py-1.5 bg-white hover:bg-teal-50 text-teal-800 rounded-xl text-xs font-bold border border-teal-200 shadow-sm flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                                      >
                                        {copiedType === `seo-h2-styling-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copiedType === `seo-h2-styling-${img.id}` ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy Tips' : 'Salin Tips')}
                                      </button>
                                    </div>
                                    <div className="text-xs sm:text-sm text-teal-950/90 leading-relaxed whitespace-pre-wrap">
                                      {seo.stylingTips || (isEn 
                                        ? 'In my styling experiments, this piece pairs effortlessly across multiple looks—from minimalist casual sneakers to sharp smart-casual layering.' 
                                        : 'Dari pengalaman padu padan saya, produk ini sangat fleksibel dipadukan dengan berbagai gaya outfit: mulai dari kasual santai untuk hangout, tampilan smart-casual untuk kuliah atau kerja, hingga gaya semi-formal yang elegan.')}
                                    </div>
                                  </div>

                                  {/* Optional FAQ Section */}
                                  {seo.faq && seo.faq.length > 0 && (
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          <HelpCircle className="w-4 h-4 text-slate-700" />
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                            {isEn ? 'Frequently Asked Questions (FAQ)' : 'Pertanyaan Populer yang Sering Ditanyakan ke Saya (FAQ)'}
                                          </h4>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => copyToClipboard(
                                            `## ${isEn ? 'Frequently Asked Questions (FAQ)' : 'Pertanyaan yang Sering Diajukan (FAQ)'}\n\n` + seo.faq!.map((f, idx) => `**Q${idx + 1}: ${f.question}**\nA: ${f.answer}`).join('\n\n'),
                                            `seo-faq-${img.id}`
                                          )}
                                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-sm flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                                        >
                                          {copiedType === `seo-faq-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                          {copiedType === `seo-faq-${img.id}` ? (isEn ? 'Copied!' : 'Tersalin!') : (isEn ? 'Copy FAQ' : 'Salin FAQ')}
                                        </button>
                                      </div>
                                      <div className="space-y-2.5">
                                        {seo.faq.map((item, idx) => (
                                          <div key={idx} className="bg-white p-3.5 rounded-xl border border-black/5 space-y-1">
                                            <p className="text-xs font-bold text-slate-900">Q{idx + 1}: {item.question}</p>
                                            <p className="text-xs text-slate-600 leading-relaxed">A: {item.answer}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : activeSeoTab === 'full' ? (
                                /* Full Article Text in Markdown */
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between text-xs px-1 text-black/60 flex-wrap gap-2">
                                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                      {isEn 
                                        ? <>Article Length: <strong>{wordCount} words</strong> • ~800 Words Target</>
                                        : <>Total Panjang: <strong>{wordCount} kata</strong> • Standar Panjang ±800 Kata</>}
                                    </span>
                                    <span className="text-[11px] text-black/50 italic">
                                      {isEn 
                                        ? 'Copy-ready Markdown format for Amazon Affiliate Blog, WordPress, or Medium'
                                        : 'Format Markdown siap salin ke Blog, WordPress, Medium, atau Website Toko'}
                                    </span>
                                  </div>
                                  <div className="relative">
                                    <textarea
                                      readOnly
                                      value={fullSeoText}
                                      className="w-full h-[450px] p-4 text-xs font-mono text-black/80 bg-black/5 border border-black/10 rounded-2xl focus:outline-none resize-y leading-relaxed"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(fullSeoText, `seo-box-${img.id}`)}
                                      className="absolute top-3 right-3 px-3 py-1.5 bg-white text-black/70 hover:text-black rounded-lg text-xs font-bold border border-black/10 shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                                    >
                                      {copiedType === `seo-box-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                      {copiedType === `seo-box-${img.id}` ? (isEn ? 'Copied' : 'Tersalin') : (isEn ? 'Copy Full Markdown (Amazon Affiliate ~800 Words)' : 'Salin Teks Lengkap (±800 Kata)')}
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-black/40 italic text-center">
                                    {isEn
                                      ? 'Full ~800-word authentic first-person UGC review article tailored for Amazon Affiliate blogs, featuring 100% uniqueness pattern, high human search intent, H1, H2, and Amazon CTA.'
                                      : 'Format artikel review lengkap berbobot 800 kata dengan gaya tulisan pengalaman pribadi pengguna nyata (first-person), 100% unik, optimasi kata kunci pencarian populer, lengkap dengan heading H1 dan H2.'}
                                  </p>
                                </div>
                              ) : (
                                /* HTML Template View with Interactive Slider, Zoom & CTA */
                                <div className="space-y-4">
                                  {/* Customization bar for affiliate link, video link, promo price */}
                                  <div className="p-4 bg-orange-50/70 border border-orange-200/90 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <div className="flex items-center gap-2">
                                        <Code className="w-4 h-4 text-orange-600" />
                                        <span className="text-xs font-bold text-orange-950 uppercase tracking-wider">
                                          {isAmazonTemplate ? 'Template Khusus Amazon (HTML Post Framework)' : 'Konfigurasi Template HTML Blog / Website'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[11px] text-orange-800/80 font-medium hidden sm:inline">Pilihan Template:</span>
                                        <div className="inline-flex p-1 bg-white rounded-xl border border-orange-200/80 shadow-2xs">
                                          <button
                                            type="button"
                                            onClick={() => setSelectedTemplateType(prev => ({ ...prev, [img.id]: 'shopee' }))}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                              activeTemplateType === 'shopee'
                                                ? 'bg-orange-600 text-white shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                          >
                                            🇮🇩 Shopee
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setSelectedTemplateType(prev => ({ ...prev, [img.id]: 'amazon' }))}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                              activeTemplateType === 'amazon'
                                                ? 'bg-amber-600 text-white shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                          >
                                            🇺🇸 Amazon
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                                          <LinkIcon className="w-3 h-3 text-orange-600" />
                                          {isAmazonTemplate ? 'Amazon Affiliate URL' : 'Tautan Affiliate Shopee'}
                                        </label>
                                        <input
                                          type="text"
                                          value={affiliateLink}
                                          onChange={(e) => setAffiliateLink(e.target.value)}
                                          placeholder={isAmazonTemplate ? "https://www.amazon.com/dp/..." : "https://shopee.co.id/product/..."}
                                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                                          <PlayCircle className="w-3 h-3 text-blue-600" />
                                          {isAmazonTemplate ? 'Amazon Video / Live URL' : 'Tautan Shopee Video Review'}
                                        </label>
                                        <input
                                          type="text"
                                          value={videoLink}
                                          onChange={(e) => setVideoLink(e.target.value)}
                                          placeholder={isAmazonTemplate ? "https://www.amazon.com/live/..." : "https://id.shp.ee/v/..."}
                                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                          {isAmazonTemplate ? 'Special Promo Price' : 'Harga Spesial Promo'}
                                        </label>
                                        <input
                                          type="text"
                                          value={promoPrice}
                                          onChange={(e) => setPromoPrice(e.target.value)}
                                          placeholder={isAmazonTemplate ? "$ 10.69" : "Rp 149.000"}
                                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Top toolbar for HTML tab: Mode switch (Code vs Live Preview) + Copy button */}
                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                                    <div className="grid grid-cols-2 sm:flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                                      <button
                                        type="button"
                                        onClick={() => setHtmlPreviewMode('code')}
                                        className={`px-3 py-2 sm:py-1 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[36px] sm:min-h-0 ${
                                          htmlPreviewMode === 'code' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                      >
                                        <Code className="w-3.5 h-3.5" />
                                        <span>{isEn ? 'Source Code' : 'Kode HTML'}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setHtmlPreviewMode('preview')}
                                        className={`px-3 py-2 sm:py-1 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[36px] sm:min-h-0 ${
                                          htmlPreviewMode === 'preview' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>{isEn ? 'Live Preview' : 'Preview Blog'}</span>
                                      </button>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(fullTemplateHtml, `seo-html-main-${img.id}`)}
                                      className="px-4 py-2 sm:py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all min-h-[36px]"
                                    >
                                      {copiedType === `seo-html-main-${img.id}` ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                                      <span>{copiedType === `seo-html-main-${img.id}` ? (isEn ? 'HTML Copied!' : 'Kode HTML Tersalin!') : (isEn ? 'Salin Versi HTML' : 'Salin Versi HTML')}</span>
                                    </button>
                                  </div>

                                  {/* Display Code or Preview */}
                                  {htmlPreviewMode === 'code' ? (
                                    <div className="relative w-full min-w-0 max-w-full">
                                      <textarea
                                        readOnly
                                        value={fullTemplateHtml}
                                        className="w-full h-[320px] sm:h-[520px] p-3 sm:p-4 text-xs font-mono text-slate-900 bg-slate-900/5 border border-slate-300 rounded-2xl focus:outline-none resize-y leading-relaxed selection:bg-orange-200 break-words"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(fullTemplateHtml, `seo-html-box-${img.id}`)}
                                        className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2.5 sm:px-3 py-1.5 bg-white text-slate-800 hover:text-black rounded-lg text-[11px] sm:text-xs font-bold border border-slate-300 shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                                      >
                                        {copiedType === `seo-html-box-${img.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedType === `seo-html-box-${img.id}` ? 'Tersalin' : 'Salin HTML'}</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-xs w-full min-w-0 max-w-full">
                                      <div className="p-2.5 sm:p-3 bg-slate-50 border-b border-slate-200 text-[11px] font-medium text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <span>Pratinjau visual artikel dengan slider foto dan tombol tautan resmi:</span>
                                        <span className="text-[10px] text-slate-400">Responsif Slider & Zoom Engine Aktif</span>
                                      </div>
                                      <div className="p-2 sm:p-6 max-w-4xl mx-auto w-full min-w-0">
                                        <iframe
                                          title="HTML Article Preview"
                                          srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 12px; background: #ffffff; color: #1e293b; }</style></head><body>${fullTemplateHtml}</body></html>`}
                                          className="w-full h-[420px] sm:h-[650px] border border-slate-200 rounded-xl max-w-full"
                                          sandbox="allow-scripts allow-popups allow-same-origin"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  <p className="text-[11px] text-black/50 italic text-center px-1">
                                    {isAmazonTemplate
                                      ? 'Template Khusus Amazon: Paragraf pembuka ulasan, slider galeri foto otomatis 3:4 dengan thumbnail strip & tombol zoom, kotak promo price, official buying link Amazon, tautan video unboxing, serta 3 seksi H2 (Product Highlights & Key Advantages, Tips for Styling, dan Conclusion & How to Buy).'
                                      : 'Template HTML lengkap Shopee: Paragraf pembuka, slider foto otomatis, kotak harga promo, tombol beli resmi Shopee, video review, heading H2, dan Pertanyaan & Jawaban (FAQ).'}
                                  </p>
                                </div>
                              )}

                              {/* Bottom copy action */}
                              <div className="pt-4 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
                                <span className="text-xs text-black/50">
                                  {isEn 
                                    ? 'Optimized for Google Indexing, Authentic UGC Experience & Amazon Affiliate Conversions (100% Unique)'
                                    : 'Dioptimalkan untuk Google Indexing, Pengalaman Pengguna (UGC) & Konversi Shopee'}
                                </span>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(fullTemplateHtml, `seo-bottom-html-${img.id}`)}
                                    className="w-full sm:w-auto px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-orange-600/15 min-h-[40px]"
                                  >
                                    {copiedType === `seo-bottom-html-${img.id}` ? <Check className="w-4 h-4 text-white" /> : <Code className="w-4 h-4" />}
                                    <span>{copiedType === `seo-bottom-html-${img.id}` ? (isEn ? 'HTML Version Copied!' : 'Versi HTML Tersalin!') : (isEn ? 'Salin Versi HTML' : 'Salin Versi HTML')}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(fullSeoText, `seo-bottom-${img.id}`)}
                                    className="w-full sm:w-auto px-4 py-2.5 bg-black text-white hover:bg-black/80 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-black/10 min-h-[40px]"
                                  >
                                    {copiedType === `seo-bottom-${img.id}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    <span>{copiedType === `seo-bottom-${img.id}` ? (isEn ? 'All Content Copied!' : 'Semua Heading Berhasil Disalin!') : (isEn ? 'Copy Full Article (~800 Words)' : 'Salin Seluruh Artikel (±800 Kata)')}</span>
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        }
                      }
                      return elements;
                    })
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="col-span-full flex flex-col items-center justify-center text-center p-6 sm:p-12 border-2 border-dashed border-black/5 rounded-2xl sm:rounded-3xl bg-white/30 min-h-[300px] sm:min-h-[400px] w-full min-w-0 max-w-full"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl sm:rounded-3xl shadow-sm flex items-center justify-center mb-4 sm:mb-6">
                        <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-black/10" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2">Belum ada konten yang dibuat</h3>
                      <p className="text-xs sm:text-sm text-black/40 max-w-xs mx-auto leading-relaxed">
                        Unggah produk Anda (pakaian, tas, sepatu, atau aksesoris) dan pilih model serta latar untuk mulai membuat narasi penjualan dan voiceover AI berkarisma.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-white py-8 sm:py-12 mt-16 sm:mt-24 w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-bold">EvaShop Studio</span>
          </div>
          <p className="text-sm text-black/40">© 2026 EvaShop AI. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm font-medium text-black/40">
            <a href="#" className="hover:text-black">Privacy</a>
            <a href="#" className="hover:text-black">Terms</a>
            <a href="#" className="hover:text-black">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
