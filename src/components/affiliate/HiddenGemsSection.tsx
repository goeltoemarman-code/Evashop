import React from 'react';
import { Sparkles, Video, Eye, ArrowRight, ExternalLink } from 'lucide-react';
import { ShopeeProduct } from '../../types/affiliate';

interface HiddenGemsSectionProps {
  gems: ShopeeProduct[];
  onOpenContentModal: (product: ShopeeProduct, mode: 'standard' | 'viral') => void;
  onOpenArticleModal: (product: ShopeeProduct) => void;
  onSendToUgcStudio: (product: ShopeeProduct) => void;
}

export const HiddenGemsSection: React.FC<HiddenGemsSectionProps> = ({
  gems,
  onOpenContentModal,
  onOpenArticleModal,
  onSendToUgcStudio,
}) => {
  if (!gems || gems.length === 0) return null;

  return (
    <div id="hidden-gems-section" className="scroll-mt-24 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            🌟 PRODUK YANG BELUM TENTU NOMOR 1, TAPI SANGAT BAGUS UNTUK KONTEN
          </h2>
          <p className="text-xs text-slate-500">
            Produk tersembunyi berpotensi viral tinggi: visual estetik, harga kompetitif, mudah dibuat before/after, try-on, dan video UGC.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gems.map((gem, idx) => (
          <div
            key={gem.id || idx}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/70 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[11px]">
                  Potential Gem #{idx + 1}
                </span>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  {gem.price}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                {gem.name}
              </h3>

              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <span>⭐ {gem.rating || '4.8'}</span>
                <span>•</span>
                <span>🛒 {gem.reviewCount || 'Banyak ulasan'}</span>
                <span>•</span>
                <span className="text-rose-600 font-semibold">{gem.category}</span>
              </div>

              <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/60 text-slate-700 leading-relaxed">
                <span className="font-bold text-amber-900 block mb-0.5 text-[11px]">
                  Kenapa Cocok untuk Video UGC:
                </span>
                {gem.recommendationReason}
              </div>

              <div className="flex flex-wrap gap-1">
                {gem.signals.map((sig, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600"
                  >
                    ✓ {sig}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onOpenContentModal(gem, 'viral')}
                type="button"
                className="py-2 px-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-bold rounded-lg text-center"
              >
                🚀 Script Viral
              </button>

              <button
                onClick={() => onSendToUgcStudio(gem)}
                type="button"
                className="py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-center flex items-center justify-center gap-1"
              >
                <span>Foto UGC</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
