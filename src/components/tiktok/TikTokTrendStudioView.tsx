import React, { useState, useEffect } from 'react';
import { TikTokHeader } from './TikTokHeader';
import { TikTokFilterBar } from './TikTokFilterBar';
import { TikTokBreakoutSection } from './TikTokBreakoutSection';
import { TikTokProductCard } from './TikTokProductCard';
import { TikTokSoundRadar } from './TikTokSoundRadar';
import { TikTokComparisonTable } from './TikTokComparisonTable';
import { TikTokScriptModal } from './TikTokScriptModal';
import { 
  TikTokTrendingProduct, 
  TikTokSoundTrend, 
  TikTokHashtagTrend 
} from '../../types/tiktokTrends';
import { 
  runTikTokTrendAnalysis, 
  TikTokFilterParams 
} from '../../services/geminiTikTokTrends';
import { 
  INITIAL_TIKTOK_PRODUCTS, 
  INITIAL_TIKTOK_SOUNDS, 
  INITIAL_TIKTOK_HASHTAGS 
} from '../../data/initialTikTokTrends';
import { Flame, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface TikTokTrendStudioViewProps {
  onSwitchToUgcStudio: () => void;
  onPreFillUgcStudio: (data: { title: string; category: string; prompt?: string }) => void;
}

const STORAGE_KEY_PRODUCTS = 'evashop_tiktok_products';
const STORAGE_KEY_DATE = 'evashop_tiktok_date';

export const TikTokTrendStudioView: React.FC<TikTokTrendStudioViewProps> = ({
  onSwitchToUgcStudio,
  onPreFillUgcStudio,
}) => {
  const [products, setProducts] = useState<TikTokTrendingProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: TikTokTrendingProduct) => ({
            ...p,
            tiktokShopUrl:
              p.tiktokShopUrl || `https://www.tiktok.com/search?q=${encodeURIComponent(p.name)}`,
          }));
        }
      }
    } catch {}
    return INITIAL_TIKTOK_PRODUCTS;
  });

  const [sounds, setSounds] = useState<TikTokSoundTrend[]>(INITIAL_TIKTOK_SOUNDS);
  const [hashtags, setHashtags] = useState<TikTokHashtagTrend[]>(INITIAL_TIKTOK_HASHTAGS);

  const [analysisDate, setAnalysisDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATE);
      if (saved) return saved;
    } catch {}
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('fyp');
  const [customKeyword, setCustomKeyword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active modal
  const [activeScriptProduct, setActiveScriptProduct] = useState<TikTokTrendingProduct | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRunAnalysis = async (overrideParams?: Partial<TikTokFilterParams>) => {
    setIsLoading(true);
    setErrorNotice(null);

    const params: TikTokFilterParams = {
      category: overrideParams?.category !== undefined ? overrideParams.category : selectedCategory,
      metric: overrideParams?.metric !== undefined ? overrideParams.metric : selectedMetric,
      priceRange: 'Semua Rentang Harga',
      customKeyword: overrideParams?.customKeyword !== undefined ? overrideParams.customKeyword : customKeyword,
    };

    try {
      const result = await runTikTokTrendAnalysis(params);
      setProducts(result.products);
      if (result.sounds && result.sounds.length > 0) setSounds(result.sounds);
      if (result.hashtags && result.hashtags.length > 0) setHashtags(result.hashtags);
      setAnalysisDate(result.analysisDate);

      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(result.products));
        localStorage.setItem(STORAGE_KEY_DATE, result.analysisDate);
      } catch {}

      showToast(`Pindai Tren TikTok selesai! ${result.products.length} produk terupdate.`);
    } catch (err: any) {
      console.error('Trend analysis error:', err);
      setErrorNotice('Gagal memindai tren online. Menggunakan data tren terverifikasi hari ini.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    handleRunAnalysis({ category: cat });
  };

  const handleSelectMetric = (metric: string) => {
    setSelectedMetric(metric);
    handleRunAnalysis({ metric });
  };

  const handleSearchKeyword = (kw: string) => {
    setCustomKeyword(kw);
    handleRunAnalysis({ customKeyword: kw });
  };

  const handleSendToUgc = (product: TikTokTrendingProduct) => {
    onPreFillUgcStudio({
      title: product.name,
      category: product.category,
      prompt: `Foto produk aesthetic TikTok Shop: ${product.name}, ${product.keyAdvantages.join(', ')}`,
    });
    showToast(`Produk "${product.name.slice(0, 25)}..." dikirim ke Eva UGC Studio!`);
  };

  const breakoutProducts = products.filter((p) => p.isBreakout || p.rank <= 3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-[#fe2c55]/30">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <TikTokHeader
        onSwitchToUgcStudio={onSwitchToUgcStudio}
        onRefreshTrends={() => handleRunAnalysis()}
        isLoading={isLoading}
        analysisDate={analysisDate}
        totalProductsCount={products.length}
      />

      {/* Filter and Search Bar */}
      <TikTokFilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        selectedMetric={selectedMetric}
        onSelectMetric={handleSelectMetric}
        customKeyword={customKeyword}
        onSearchKeyword={handleSearchKeyword}
        isLoading={isLoading}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {errorNotice && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Breakout Spotlight */}
        <TikTokBreakoutSection
          breakoutProducts={breakoutProducts}
          onOpenScriptModal={(prod) => setActiveScriptProduct(prod)}
          onSendToUgc={handleSendToUgc}
        />

        {/* Section Title for 10 Trending Products */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-8 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#fe2c55]/20 text-[#fe2c55] border border-[#fe2c55]/30">
              <Flame className="w-4 h-4 fill-current" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>10 Produk Trending di TikTok Hari Ini</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                  {analysisDate}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Peringkat produk berdasarkan kombinasi FYP Velocity, interaksi video, dan tingkat konversi TikTok Shop Indonesia.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 self-start sm:self-center">
            Menampilkan <span className="font-bold text-white">{products.length} Produk</span>
          </div>
        </div>

        {/* 10 Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {products.map((product) => (
            <TikTokProductCard
              key={product.id}
              product={product}
              onOpenScriptModal={(prod) => setActiveScriptProduct(prod)}
              onSendToUgc={handleSendToUgc}
            />
          ))}
        </div>

        {/* TikTok Sound and Hashtags Radar */}
        <TikTokSoundRadar sounds={sounds} hashtags={hashtags} />

        {/* Executive Comparison Table */}
        <TikTokComparisonTable
          products={products}
          onOpenScriptModal={(prod) => setActiveScriptProduct(prod)}
          onSendToUgc={handleSendToUgc}
        />
      </main>

      {/* Script and Hook Modal */}
      <TikTokScriptModal
        product={activeScriptProduct}
        onClose={() => setActiveScriptProduct(null)}
        onSendToUgc={handleSendToUgc}
      />
    </div>
  );
};
