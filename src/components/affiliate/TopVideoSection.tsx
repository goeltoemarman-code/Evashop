import React, { useState } from 'react';
import { Video, Copy, Check, Sparkles, ChevronRight } from 'lucide-react';
import { VideoHookConcept, ShopeeProduct } from '../../types/affiliate';

interface TopVideoSectionProps {
  concepts: VideoHookConcept[];
  products: ShopeeProduct[];
  onOpenContentModal: (product: ShopeeProduct, mode: 'standard' | 'viral') => void;
}

export const TopVideoSection: React.FC<TopVideoSectionProps> = ({
  concepts,
  products,
  onOpenContentModal,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!concepts || concepts.length === 0) return null;

  const handleCopyConcept = (c: VideoHookConcept, id: string) => {
    const text = `🎬 FORMULA VIDEO TIKTOK/REELS - EVASHOP
Produk: ${c.productName}
Alasan: ${c.reason}

HOOK:
"${c.hook}"

MASALAH:
"${c.problem}"

SOLUSI:
"${c.solution}"

KELEBIHAN:
${c.advantages.map(a => `- ${a}`).join('\n')}

CTA:
"${c.cta}"`;

    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="top-video-section" className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              🎬 TOP 3 PRODUK UNTUK DIBUAT VIDEO HARI INI
            </h2>
            <p className="text-xs text-slate-500">
              Formula hook 3 detik, masalah konsumen, solusi, dan CTA teruji siap rekam untuk TikTok & Reels.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {concepts.map((concept, idx) => {
          const matchedProd = products.find(p => p.id === concept.productId) || products[idx];
          const cardId = `concept_${idx}`;
          const isCopied = copiedId === cardId;

          return (
            <div
              key={cardId}
              className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm flex flex-col justify-between hover:border-purple-300 transition-all"
            >
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px]">
                    Video Pilihan #{idx + 1}
                  </span>
                  <button
                    onClick={() => handleCopyConcept(concept, cardId)}
                    type="button"
                    className="flex items-center gap-1 text-slate-500 hover:text-purple-700 font-medium bg-slate-50 hover:bg-purple-50 px-2 py-1 rounded-md transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tersalin' : 'Salin Naskah'}</span>
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                    {concept.productName}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 italic">
                    {concept.reason}
                  </p>
                </div>

                {/* HOOK */}
                <div className="p-2.5 bg-rose-50 border border-rose-200/80 rounded-xl">
                  <span className="font-bold text-rose-900 block mb-0.5 text-[11px] uppercase tracking-wide">
                    HOOK (3 Detik Pertama):
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    "{concept.hook}"
                  </p>
                </div>

                {/* MASALAH & SOLUSI */}
                <div className="space-y-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-600 block text-[10px] uppercase">
                      MASALAH:
                    </span>
                    <p className="text-slate-700">{concept.problem}</p>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200">
                    <span className="font-bold text-slate-600 block text-[10px] uppercase">
                      SOLUSI:
                    </span>
                    <p className="text-slate-700">{concept.solution}</p>
                  </div>
                </div>

                {/* KELEBIHAN */}
                <div>
                  <span className="font-bold text-slate-700 block mb-1 text-[11px] uppercase">
                    KELEBIHAN UNTUK SOROTAN KAMERA:
                  </span>
                  <ul className="space-y-1 text-slate-600">
                    {concept.advantages.map((adv, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-1">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-semibold">
                  <span className="block text-[10px] uppercase text-emerald-700 font-bold">CTA:</span>
                  "{concept.cta}"
                </div>
              </div>

              {matchedProd && (
                <div className="pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => onOpenContentModal(matchedProd, 'standard')}
                    type="button"
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-xl text-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Buat Script Lengkap 15s/30s/60s</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
