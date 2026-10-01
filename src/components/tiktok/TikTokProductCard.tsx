import React, { useState } from 'react';
import { TikTokTrendingProduct } from '../../types/tiktokTrends';
import { 
  Flame, 
  Music, 
  Eye, 
  TrendingUp, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Video, 
  Users, 
  Lightbulb,
  ShoppingBag,
  Search,
  Link2
} from 'lucide-react';

interface TikTokProductCardProps {
  product: TikTokTrendingProduct;
  onOpenScriptModal: (product: TikTokTrendingProduct) => void;
  onSendToUgc: (product: TikTokTrendingProduct) => void;
}

export const TikTokProductCard: React.FC<TikTokProductCardProps> = ({
  product,
  onOpenScriptModal,
  onSendToUgc,
}) => {
  const [copiedHookIndex, setCopiedHookIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const tiktokUrl = product.tiktokShopUrl || `https://www.tiktok.com/search?q=${encodeURIComponent(product.name)}`;

  const handleCopyHook = (hookText: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hookText);
    setCopiedHookIndex(index);
    setTimeout(() => setCopiedHookIndex(null), 2000);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tiktokUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getFypColor = (score: number) => {
    if (score >= 95) return 'text-[#fe2c55] border-[#fe2c55]/40 bg-[#fe2c55]/10';
    if (score >= 90) return 'text-[#25f4ee] border-[#25f4ee]/40 bg-[#25f4ee]/10';
    return 'text-amber-400 border-amber-400/40 bg-amber-400/10';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black shrink-0 ${
                product.rank === 1
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : product.rank <= 3
                  ? 'bg-[#fe2c55] text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              #{product.rank}
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60">
              {product.category}
            </span>

            {product.isBreakout && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30 uppercase">
                <Flame className="w-2.5 h-2.5 fill-current" /> Breakout +400%
              </span>
            )}
          </div>

          {/* FYP Velocity Score Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border font-black text-xs shrink-0 ${getFypColor(
              product.fypScore
            )}`}
            title="FYP Velocity Score (Tingkat penetrasi algoritma For You Page)"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>FYP {product.fypScore}/100</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="text-base sm:text-lg font-bold text-white mt-3 group-hover:text-[#25f4ee] transition leading-snug">
          {product.name}
        </h3>

        {/* Pricing and Sales Stats */}
        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
          <span className="text-lg font-black text-amber-300 tracking-tight">
            {product.priceRange}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-slate-500 line-through">
              {product.originalPrice}
            </span>
          )}
          {product.discount && (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">
              Hemat {product.discount}
            </span>
          )}
        </div>

        {/* TikTok Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-xs">
          <div className="bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800/90 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-300 font-semibold truncate">{product.viewsCount}</span>
          </div>

          <div className="bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800/90 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="text-slate-300 font-semibold truncate">{product.salesEstimate}</span>
          </div>

          <div className="bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800/90 flex items-center gap-1.5 col-span-2 sm:col-span-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 font-bold truncate">{product.growthRate}</span>
          </div>
        </div>

        {/* Why it is viral box */}
        <div className="mt-3.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Mengapa Viral di TikTok Hari Ini:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {product.whyItIsViral}
          </p>
        </div>

        {/* Viral Format & Target Audience */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <Video className="w-3 h-3 text-[#25f4ee]" /> Format Video Laris:
            </span>
            <p className="text-white font-medium mt-0.5">{product.viralFormat}</p>
          </div>

          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <Users className="w-3 h-3 text-pink-400" /> Target Audiens:
            </span>
            <p className="text-white font-medium mt-0.5">{product.targetAudience}</p>
          </div>
        </div>

        {/* Recommended TikTok Sound */}
        <div className="mt-3 bg-gradient-to-r from-pink-950/20 to-purple-950/20 p-2.5 rounded-xl border border-pink-900/30 flex items-start gap-2 text-xs">
          <Music className="w-4 h-4 text-[#fe2c55] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-pink-200 truncate">
                Sound: {product.recommendedAudio.name}
              </span>
              <span className="text-[10px] text-pink-400 bg-pink-950/60 px-1.5 py-0.2 rounded border border-pink-800/40 shrink-0">
                {product.recommendedAudio.type}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              💡 {product.recommendedAudio.usageTip}
            </p>
          </div>
        </div>

        {/* Scroll Stopping Hooks */}
        <div className="mt-3.5">
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Flame className="w-3 h-3 text-[#fe2c55]" />
            Hook 3 Detik Pembuka (Anti-Swipe):
          </span>
          <div className="space-y-1.5">
            {product.keyHooks.slice(0, 2).map((hook, idx) => {
              const isCopied = copiedHookIndex === idx;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs text-slate-200 hover:border-slate-700 transition"
                >
                  <p className="line-clamp-1 italic text-slate-300">"{hook}"</p>
                  <button
                    type="button"
                    onClick={(e) => handleCopyHook(hook, idx, e)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
                    title="Salin kalimat hook ini"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hashtags */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          {product.topHashtags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Dedicated TikTok Search Link & Copy Box */}
        <div className="mt-3.5 bg-slate-950 p-3 rounded-xl border border-slate-800/90 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#25f4ee]" />
              Link Pencarian Produk TikTok:
            </span>
            <span className="text-[10px] text-slate-500 font-mono">TikTok Search</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800/90 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-300 hover:text-cyan-200 hover:underline font-mono truncate flex-1 min-w-0"
              title={tiktokUrl}
            >
              {tiktokUrl}
            </a>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition active:scale-95 ${
                copiedLink
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600'
              }`}
              title="Salin link pencarian TikTok produk ini"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Link Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#25f4ee]" />
                  <span>Salin Link TikTok</span>
                </>
              )}
            </button>

            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg bg-[#fe2c55] hover:bg-[#e0264b] text-white text-xs font-bold transition active:scale-95 shadow-sm"
              title="Buka langsung pencarian produk di TikTok"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Cari di TikTok</span>
            </a>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenScriptModal(product)}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold border border-slate-700 hover:border-slate-600 transition active:scale-95 shadow-sm"
        >
          <FileText className="w-4 h-4 text-[#25f4ee]" />
          <span>Buka Script & Blueprint (30s)</span>
        </button>

        <button
          type="button"
          onClick={() => onSendToUgc(product)}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#fe2c55] to-rose-600 hover:from-[#e0264b] hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-rose-900/20 transition active:scale-95"
          title="Bawa produk ini langsung ke Eva UGC Studio untuk buat gambar & deskripsi review"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>Buat UGC</span>
        </button>
      </div>
    </div>
  );
};
