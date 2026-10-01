import React, { useState, useEffect } from 'react';
import { 
  Flame, TrendingUp, Sparkles, Video, FileText, CheckCircle2, 
  RefreshCw, AlertCircle, ShoppingBag, ArrowRight, ShieldAlert
} from 'lucide-react';
import { 
  ShopeeProduct, VideoHookConcept, BloggerAuth 
} from '../../types/affiliate';
import { 
  INITIAL_SHOPEE_PRODUCTS, 
  INITIAL_VIDEO_CONCEPTS, 
  INITIAL_HIDDEN_GEMS 
} from '../../data/initialShopeeProducts';
import { runShopeeFashionResearch } from '../../services/geminiResearch';
import { AffiliateHeader } from './AffiliateHeader';
import { FilterBar } from './FilterBar';
import { ProductCard } from './ProductCard';
import { TopVideoSection } from './TopVideoSection';
import { HiddenGemsSection } from './HiddenGemsSection';
import { ProductComparisonTable } from './ProductComparisonTable';
import { ContentModal } from './ContentModal';
import { ArticleModal } from './ArticleModal';
import { PromptsModal } from './PromptsModal';
import { BloggerConnectModal } from './BloggerConnectModal';

interface AffiliateStudioViewProps {
  onSwitchToUgcStudio: () => void;
  onPreFillUgcStudio: (data: { title: string; category: string; prompt?: string }) => void;
}

export const AffiliateStudioView: React.FC<AffiliateStudioViewProps> = ({
  onSwitchToUgcStudio,
  onPreFillUgcStudio,
}) => {
  // Product Research States
  const [products, setProducts] = useState<ShopeeProduct[]>(() => {
    const saved = localStorage.getItem('evashop_affiliate_products');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_SHOPEE_PRODUCTS;
  });

  const [topVideoConcepts, setTopVideoConcepts] = useState<VideoHookConcept[]>(() => {
    const saved = localStorage.getItem('evashop_video_concepts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_VIDEO_CONCEPTS;
  });

  const [hiddenGems, setHiddenGems] = useState<ShopeeProduct[]>(() => {
    const saved = localStorage.getItem('evashop_hidden_gems');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_HIDDEN_GEMS;
  });

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedAffiliateFilters, setSelectedAffiliateFilters] = useState<string[]>([
    'Potensi klik tinggi', 'Fashion wanita', 'Rating tinggi'
  ]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Status indicators
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [lastCheckedDate, setLastCheckedDate] = useState<string>(() => {
    return localStorage.getItem('evashop_last_date') || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  });
  const [lastCheckedTime, setLastCheckedTime] = useState<string>(() => {
    return localStorage.getItem('evashop_last_time') || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  });
  const [isLiveAvailable, setIsLiveAvailable] = useState<boolean>(true);

  // Blogger Connection State
  const [bloggerAuth, setBloggerAuth] = useState<BloggerAuth>(() => {
    const saved = localStorage.getItem('evashop_blogger_auth');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      isConnected: false,
      accessToken: null,
      selectedBlog: null,
      blogs: [],
      error: null,
    };
  });

  // Modals
  const [activeContentProduct, setActiveContentProduct] = useState<{
    product: ShopeeProduct;
    mode: 'standard' | 'viral';
  } | null>(null);

  const [activeArticleProduct, setActiveArticleProduct] = useState<ShopeeProduct | null>(null);

  const [activePromptsProduct, setActivePromptsProduct] = useState<{
    product: ShopeeProduct;
    type: 'image' | 'video';
  } | null>(null);

  const [showBloggerModal, setShowBloggerModal] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('evashop_affiliate_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('evashop_video_concepts', JSON.stringify(topVideoConcepts));
  }, [topVideoConcepts]);

  useEffect(() => {
    localStorage.setItem('evashop_hidden_gems', JSON.stringify(hiddenGems));
  }, [hiddenGems]);

  useEffect(() => {
    localStorage.setItem('evashop_blogger_auth', JSON.stringify(bloggerAuth));
  }, [bloggerAuth]);

  // Execute Real-time Shopee Fashion Research
  const handleExecuteResearch = async (overrideKeyword?: string) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const kw = overrideKeyword !== undefined ? overrideKeyword : searchKeyword;
      const result = await runShopeeFashionResearch({
        categories: selectedCategories,
        priceRange: selectedPriceRange,
        affiliateFilters: selectedAffiliateFilters,
        customKeyword: kw,
      });

      setProducts(result.products);
      if (result.topVideoConcepts && result.topVideoConcepts.length > 0) {
        setTopVideoConcepts(result.topVideoConcepts);
      }
      if (result.hiddenGems && result.hiddenGems.length > 0) {
        setHiddenGems(result.hiddenGems);
      }

      setLastCheckedDate(result.searchDate);
      setLastCheckedTime(result.searchTimestamp);
      setIsLiveAvailable(result.isLiveAvailable);

      localStorage.setItem('evashop_last_date', result.searchDate);
      localStorage.setItem('evashop_last_time', result.searchTimestamp);
    } catch (err: any) {
      console.error(err);
      setSearchError(err.message || 'Gagal mencari produk Shopee. Menampilkan data tersimpan.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterTrending = () => {
    setSelectedAffiliateFilters(['Sedang tren', 'Potensi klik tinggi', 'Cocok untuk video']);
    handleExecuteResearch('fashion tren viral shopee hari ini');
  };

  const handleUpdateAffiliateUrl = (productId: string, newUrl: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, affiliateUrl: newUrl } : p));
  };

  const handleSendToUgcStudio = (prod: ShopeeProduct, promptOverride?: string) => {
    onPreFillUgcStudio({
      title: prod.name,
      category: prod.category,
      prompt: promptOverride,
    });
    onSwitchToUgcStudio();
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* 24. Master Dashboard Header */}
      <AffiliateHeader
        onSearchTerlaris={() => handleExecuteResearch()}
        onFilterTrending={handleFilterTrending}
        onOpenBloggerModal={() => setShowBloggerModal(true)}
        onScrollToSection={scrollToSection}
        onSwitchToUgcStudio={onSwitchToUgcStudio}
        lastCheckedTime={lastCheckedTime}
        lastCheckedDate={lastCheckedDate}
        isLiveAvailable={isLiveAvailable}
        isSearching={isSearching}
        bloggerAuth={bloggerAuth}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Error banner if search failed */}
        {searchError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Catatan Riset Shopee:</strong>
                <p>{searchError}</p>
              </div>
            </div>
            <button
              onClick={() => setSearchError(null)}
              type="button"
              className="text-amber-700 hover:text-amber-900 font-bold"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Filter Bar Component */}
        <FilterBar
          selectedCategories={selectedCategories}
          onChangeCategories={setSelectedCategories}
          selectedPriceRange={selectedPriceRange}
          onChangePriceRange={setSelectedPriceRange}
          selectedAffiliateFilters={selectedAffiliateFilters}
          onChangeAffiliateFilters={setSelectedAffiliateFilters}
          searchKeyword={searchKeyword}
          onChangeSearchKeyword={setSearchKeyword}
          onExecuteSearch={() => handleExecuteResearch()}
          isSearching={isSearching}
        />

        {/* 4. OUTPUT 10 PRODUK FASHION TERLARIS HARI INI */}
        <section id="products-list-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>🔥 10 PRODUK FASHION SHOPEE TERBAIK UNTUK EVASHOP HARI INI</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Riset real-time per {lastCheckedDate} pukul {lastCheckedTime}. Disusun berdasarkan bobot Eva Shop Score (Popularitas 25%, Conversion 20%, Content 20%, Visual 15%, Harga 10%, Review 5%, Trend 5%).
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                {products.length} Produk Ditemukan
              </span>
            </div>
          </div>

          {/* Grid of 10 Products (Mobile First: 1 col on mobile, 2 cols on lg) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenContentModal={(prod, mode) => setActiveContentProduct({ product: prod, mode })}
                onOpenArticleModal={(prod) => setActiveArticleProduct(prod)}
                onOpenPromptsModal={(prod, type) => setActivePromptsProduct({ product: prod, type })}
                onSendToUgcStudio={handleSendToUgcStudio}
                onUpdateAffiliateUrl={handleUpdateAffiliateUrl}
              />
            ))}
          </div>
        </section>

        {/* 7. PRODUK TERBAIK UNTUK VIDEO: 🎬 TOP 3 PRODUK */}
        <TopVideoSection
          concepts={topVideoConcepts}
          products={products}
          onOpenContentModal={(prod, mode) => setActiveContentProduct({ product: prod, mode })}
        />

        {/* 14. DETEKSI PRODUK YANG LAYAK DIBUAT KONTEN: HIDDEN GEMS */}
        <HiddenGemsSection
          gems={hiddenGems}
          onOpenContentModal={(prod, mode) => setActiveContentProduct({ product: prod, mode })}
          onOpenArticleModal={(prod) => setActiveArticleProduct(prod)}
          onSendToUgcStudio={handleSendToUgcStudio}
        />

        {/* 15. PERBANDINGAN 10 PRODUK */}
        <ProductComparisonTable
          products={products}
          onSelectProduct={(prod) => setActiveArticleProduct(prod)}
        />
      </main>

      {/* MODALS */}
      {/* 8 & 9. Content & Viral Modal */}
      {activeContentProduct && (
        <ContentModal
          product={activeContentProduct.product}
          initialMode={activeContentProduct.mode}
          onClose={() => setActiveContentProduct(null)}
        />
      )}

      {/* 16, 17, 21. Article Generator & Blogger Draft Modal */}
      {activeArticleProduct && (
        <ArticleModal
          product={activeArticleProduct}
          bloggerAuth={bloggerAuth}
          onOpenBloggerModal={() => setShowBloggerModal(true)}
          onOpenPromptsModal={(prod, type) => setActivePromptsProduct({ product: prod, type })}
          onClose={() => setActiveArticleProduct(null)}
        />
      )}

      {/* 19 & 20. Prompts Image & Video Modal */}
      {activePromptsProduct && (
        <PromptsModal
          product={activePromptsProduct.product}
          initialType={activePromptsProduct.type}
          onSendToUgcStudio={handleSendToUgcStudio}
          onClose={() => setActivePromptsProduct(null)}
        />
      )}

      {/* 22 & 23. Google Blogger Connect Modal */}
      {showBloggerModal && (
        <BloggerConnectModal
          bloggerAuth={bloggerAuth}
          onUpdateBloggerAuth={(newAuth) => setBloggerAuth(newAuth)}
          onClose={() => setShowBloggerModal(false)}
        />
      )}
    </div>
  );
};
