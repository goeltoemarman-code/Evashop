import React, { useState } from 'react';
import { TikTokTrendingProduct } from '../../types/tiktokTrends';
import { Flame, Zap, Music, ArrowUpRight, FileText, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';

interface TikTokBreakoutSectionProps {
  breakoutProducts: TikTokTrendingProduct[];
  onOpenScriptModal: (product: TikTokTrendingProduct) => void;
  onSendToUgc: (product: TikTokTrendingProduct) => void;
}

export const TikTokBreakoutSection: React.FC<TikTokBreakoutSectionProps> = ({
  breakoutProducts,
  onOpenScriptModal,
  onSendToUgc,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!breakoutProducts || breakoutProducts.length === 0) return null;

  const handleCopyLink = (item: TikTokTrendingProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = item.tiktokShopUrl || `https://www.tiktok.com/search?q=${encodeURIComponent(item.name)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="my-6">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Zap className="w-4 h-4 fill-current" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Top 3 Breakout Products Hari Ini</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold tracking-wider uppercase border border-rose-500/30">
                FYP Spike +400%
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Produk dengan lonjakan pencarian dan interaksi video tertinggi dalam 48 jam terakhir di TikTok.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {breakoutProducts.slice(0, 3).map((item, idx) => {
          return (
            <div
              key={item.id}
              className="relative group bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-4 hover:border-slate-700 transition shadow-lg flex flex-col justify-between"
            >
              {/* Top tag & badge */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[11px] font-black uppercase">
                    <Flame className="w-3 h-3 fill-current" /> #{idx + 1} BREAKOUT
                  </span>
                  <span className="text-emerald-400 font-bold text-xs bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                    {item.growthRate}
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-white line-clamp-2 leading-snug group-hover:text-[#25f4ee] transition">
                  {item.name}
                </h3>

                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="text-slate-400">{item.category}</span>
                  <span className="text-slate-600">•</span>
                  <span className="font-bold text-amber-300">{item.priceRange}</span>
                </div>

                {/* Viral why snippet */}
                <p className="text-slate-300 text-xs mt-2 line-clamp-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-[#25f4ee] font-semibold">Pemicu FYP: </span>
                  {item.whyItIsViral}
                </p>

                {/* Sound pill */}
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-pink-300 bg-pink-950/30 border border-pink-900/40 px-2.5 py-1.5 rounded-lg">
                  <Music className="w-3 h-3 text-pink-400 shrink-0" />
                  <span className="truncate font-medium">Sound: {item.recommendedAudio.name}</span>
                </div>

                {/* TikTok Search Link & Copy Row */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(item, e)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition active:scale-95 ${
                      copiedId === item.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                    title="Salin link pencarian TikTok untuk produk ini"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Link Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#25f4ee]" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={item.tiktokShopUrl || `https://www.tiktok.com/search?q=${encodeURIComponent(item.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-[#fe2c55] hover:bg-[#e0264b] text-white text-xs font-bold transition active:scale-95 shadow-sm"
                    title="Cari produk langsung di TikTok"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Cari</span>
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenScriptModal(item)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 text-[#25f4ee]" />
                  <span>Hook & Script 30s</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSendToUgc(item)}
                  title="Bawa ke Eva UGC Studio untuk buat materi review & visual"
                  className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#fe2c55] to-rose-600 hover:from-[#e0264b] hover:to-rose-700 text-white text-xs font-bold transition active:scale-95 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Buat UGC</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
