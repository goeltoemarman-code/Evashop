import React, { useState } from 'react';
import { 
  Flame, Star, ShoppingBag, Video, Sparkles, FileText, 
  Link as LinkIcon, Copy, Check, ExternalLink, Edit3, 
  ChevronDown, ChevronUp, Tag, ShieldCheck, Image as ImageIcon,
  ArrowRight, Info
} from 'lucide-react';
import { ShopeeProduct } from '../../types/affiliate';

interface ProductCardProps {
  product: ShopeeProduct;
  onOpenContentModal: (product: ShopeeProduct, mode: 'standard' | 'viral') => void;
  onOpenArticleModal: (product: ShopeeProduct) => void;
  onOpenPromptsModal: (product: ShopeeProduct, type: 'image' | 'video') => void;
  onSendToUgcStudio: (product: ShopeeProduct) => void;
  onUpdateAffiliateUrl: (productId: string, newUrl: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenContentModal,
  onOpenArticleModal,
  onOpenPromptsModal,
  onSendToUgcStudio,
  onUpdateAffiliateUrl,
}) => {
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [isEditingAffiliateLink, setIsEditingAffiliateLink] = useState(false);
  const [affiliateInput, setAffiliateInput] = useState(product.affiliateUrl || '');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    const targetLink = product.affiliateUrl || product.shopeeUrl;
    if (!targetLink) return;
    navigator.clipboard.writeText(targetLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveAffiliateLink = () => {
    onUpdateAffiliateUrl(product.id, affiliateInput.trim());
    setIsEditingAffiliateLink(false);
  };

  // Render Flames for Potential
  const renderFlames = (count: number) => {
    return (
      <div className="flex items-center gap-0.5" title={`${count}/5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Flame
            key={i}
            className={`w-3.5 h-3.5 ${
              i < count 
                ? 'text-rose-500 fill-rose-500 animate-pulse' 
                : 'text-slate-200 fill-slate-100'
            }`}
          />
        ))}
      </div>
    );
  };

  const statusColorMap: Record<string, string> = {
    'Sangat tinggi': 'bg-rose-100 text-rose-800 border-rose-200',
    'Tinggi': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Sedang': 'bg-amber-100 text-amber-800 border-amber-200',
    'Tidak dapat diverifikasi': 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div 
      className={`rounded-2xl bg-white border transition-all duration-200 shadow-sm hover:shadow-md ${
        product.isTopChoice 
          ? 'border-2 border-rose-500 ring-4 ring-rose-100' 
          : 'border-slate-200/90'
      }`}
    >
      {/* Top Header Badge */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
            product.rank === 1 
              ? 'bg-amber-400 text-amber-950 shadow-sm' 
              : product.rank <= 3
                ? 'bg-rose-600 text-white'
                : 'bg-slate-200 text-slate-800'
          }`}>
            #{product.rank}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                {product.category}
              </span>
              {product.isTopChoice && (
                <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                  🏆 PRODUK TERBAIK HARI INI
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Eva Shop Score Meter */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Eva Shop Score</div>
            <div className="text-lg font-black text-rose-600 leading-none">
              {product.scores.evaScore}<span className="text-xs text-slate-400 font-semibold">/100</span>
            </div>
          </div>

          <button
            onClick={() => setShowScoreDetails(!showScoreDetails)}
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            title="Lihat Rincian Skor"
          >
            {showScoreDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Score Breakdown */}
      {showScoreDetails && (
        <div className="px-4 sm:px-5 py-3 bg-slate-50/80 border-b border-slate-100 text-xs text-slate-600 space-y-2">
          <div className="font-bold text-slate-700 flex items-center justify-between">
            <span>Rincian Bobot Formula Skor:</span>
            <span className="text-rose-600 font-bold">{product.scores.evaScore}/100</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-1.5 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-400">Popularitas (25%)</div>
              <div className="font-bold text-slate-800">{product.scores.popularity}/100</div>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-400">Conversion (20%)</div>
              <div className="font-bold text-slate-800">{product.scores.conversion}/100</div>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-400">Content (20%)</div>
              <div className="font-bold text-slate-800">{product.scores.content}/100</div>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-400">Visual Appeal (15%)</div>
              <div className="font-bold text-slate-800">{product.scores.visualAppeal}/100</div>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-400">Harga Menarik (10%)</div>
              <div className="font-bold text-slate-800">{product.scores.priceAppeal}/100</div>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-400">Review Strength (5%)</div>
              <div className="font-bold text-slate-800">{product.scores.reviewStrength}/100</div>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-400">Trend Potential (5%)</div>
              <div className="font-bold text-slate-800">{product.scores.trendPotential}/100</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Title */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {product.name}
          </h3>
          {product.fabricOrMaterial && (
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">Bahan:</span> {product.fabricOrMaterial}
            </p>
          )}
        </div>

        {/* Pricing, Discount, Rating, Reviews */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100/80">
          <div>
            <span className="text-xs text-slate-500 block">Harga Saat Riset:</span>
            <span className="text-lg font-black text-rose-600">{product.price}</span>
          </div>

          {product.originalPrice && (
            <div>
              <span className="text-xs text-slate-400 line-through block">
                {product.originalPrice}
              </span>
              {product.discount && (
                <span className="inline-block px-1.5 py-0.2 text-[10px] font-black rounded bg-rose-600 text-white">
                  -{product.discount}
                </span>
              )}
            </div>
          )}

          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* Rating */}
          <div>
            <span className="text-xs text-slate-500 block">Rating:</span>
            <div className="flex items-center gap-1 font-bold text-sm text-slate-800">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{product.rating || 'Data tidak tersedia'}</span>
            </div>
          </div>

          {/* Review Count */}
          <div>
            <span className="text-xs text-slate-500 block">Ulasan:</span>
            <span className="font-semibold text-xs text-slate-700">
              {product.reviewCount || 'Data tidak tersedia'}
            </span>
          </div>

          {/* Popularity Status */}
          <div>
            <span className="text-xs text-slate-500 block">Status Popularitas:</span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${statusColorMap[product.popularityStatus] || statusColorMap['Sedang']}`}>
              {product.popularityStatus}
            </span>
          </div>
        </div>

        {/* Product Signals Chips */}
        <div>
          <div className="text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>Sinyal Produk:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {product.signals.map((sig, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
              >
                ✓ {sig}
              </span>
            ))}
          </div>
        </div>

        {/* Content Potential & Conversion Potential Flames */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">Potensi Konten Video:</span>
            {renderFlames(product.contentPotentialFlame)}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">Potensi Konversi Klik:</span>
            {renderFlames(product.conversionPotentialFlame)}
          </div>
        </div>

        {/* Alasan Produk Direkomendasikan */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs leading-relaxed text-slate-700">
          <span className="font-bold text-amber-900 block mb-1">
            💡 Alasan Produk Direkomendasikan untuk Eva Shop:
          </span>
          <p>{product.recommendationReason}</p>
        </div>

        {/* 5. LINK PRODUK SHOPEE & AFFILIATE */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <LinkIcon className="w-3.5 h-3.5 text-rose-600" />
              <span>LINK PRODUK SHOPEE:</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyLink}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-700 transition-colors"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Tersalin!' : '📋 Salin Link'}</span>
              </button>

              <button
                onClick={() => setIsEditingAffiliateLink(!isEditingAffiliateLink)}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 font-semibold text-rose-700 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>🔗 Masukkan Link Affiliate</span>
              </button>
            </div>
          </div>

          {/* Display Link */}
          {product.affiliateUrl ? (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between gap-2">
              <div className="truncate text-emerald-800 font-medium">
                <span className="font-bold text-emerald-900 mr-1">Affiliate Eva Shop:</span>
                {product.affiliateUrl}
              </div>
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:text-emerald-900 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : product.shopeeUrl ? (
            <div className="truncate text-slate-500 font-mono text-[11px]">
              {product.shopeeUrl}
            </div>
          ) : (
            <p className="text-slate-500 italic">
              Link produk belum tersedia — buka produk tersebut di Shopee untuk mendapatkan link affiliate.
            </p>
          )}

          {/* Edit Affiliate Link Input Box */}
          {isEditingAffiliateLink && (
            <div className="pt-2 flex gap-2">
              <input
                type="url"
                value={affiliateInput}
                onChange={(e) => setAffiliateInput(e.target.value)}
                placeholder="Tempel tautan Shopee Affiliate Eva Shop kamu di sini..."
                className="flex-1 px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <button
                onClick={handleSaveAffiliateLink}
                type="button"
                className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 shrink-0"
              >
                Simpan Link
              </button>
            </div>
          )}
        </div>

        {/* Primary Action Buttons (Grid / Responsive Mobile First) */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          {/* Main 2 Buttons: Buat Konten & Buat Konten Viral */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => onOpenContentModal(product, 'standard')}
              type="button"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs active:scale-98 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>✨ BUAT KONTEN</span>
            </button>

            <button
              onClick={() => onOpenContentModal(product, 'viral')}
              type="button"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs active:scale-98 transition-all"
            >
              <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>🚀 BUAT KONTEN VIRAL</span>
            </button>
          </div>

          {/* Secondary Buttons: Buat Artikel & Prompts & Kirim ke UGC */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              onClick={() => onOpenArticleModal(product)}
              type="button"
              className="flex items-center justify-center gap-1 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-lg"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>📝 Buat Artikel</span>
            </button>

            <button
              onClick={() => onOpenPromptsModal(product, 'image')}
              type="button"
              className="flex items-center justify-center gap-1 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-lg"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>🖼️ Prompt Gambar</span>
            </button>

            <button
              onClick={() => onOpenPromptsModal(product, 'video')}
              type="button"
              className="flex items-center justify-center gap-1 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-lg"
            >
              <Video className="w-3.5 h-3.5 text-purple-600" />
              <span>🎬 Prompt Video</span>
            </button>

            <button
              onClick={() => onSendToUgcStudio(product)}
              type="button"
              className="flex items-center justify-center gap-1 px-3 py-2 bg-pink-50 border border-pink-200 hover:bg-pink-100 text-pink-700 font-semibold rounded-lg"
              title="Kirim detail produk ke Generator Foto & Suara UGC"
            >
              <span>📤 UGC Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
