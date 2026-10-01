import React, { useState } from 'react';
import { TikTokTrendingProduct } from '../../types/tiktokTrends';
import { 
  X, 
  Copy, 
  Check, 
  Flame, 
  Sparkles, 
  Video, 
  Music, 
  Camera, 
  Clock, 
  Hash, 
  ExternalLink 
} from 'lucide-react';

interface TikTokScriptModalProps {
  product: TikTokTrendingProduct | null;
  onClose: () => void;
  onSendToUgc: (product: TikTokTrendingProduct) => void;
}

export const TikTokScriptModal: React.FC<TikTokScriptModalProps> = ({
  product,
  onClose,
  onSendToUgc,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!product) return null;

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const benefitsList = product.script30s.threeBenefits && product.script30s.threeBenefits.length > 0
    ? product.script30s.threeBenefits
    : product.keyAdvantages && product.keyAdvantages.length > 0
      ? product.keyAdvantages.slice(0, 3)
      : ['Kualitas material premium & tahan lama', 'Kenyamanan maksimal untuk pemakaian harian', 'Desain berkelas yang bikin penampilan naik level'];

  const solutionText = product.script30s.solution || product.script30s.demonstration;
  const ctaText = product.script30s.cta || 'buruan ambil dikeranjang video ini ya tepatnya Evashop!';

  const fullScriptFormatted = `🔥 SELLING NARRATIVE SCRIPT (30-40s)
Pola: HOOK → MASALAH → SOLUSI → 3 MANFAAT → CTA
Produk: ${product.name}
Kategori: ${product.category}
Sound Rekomendasi: ${product.recommendedAudio.name} (${product.recommendedAudio.author})

[DETIK 00 - 03 | THE HOOK]
"${product.script30s.hook}"

[DETIK 03 - 10 | MASALAH & KERESAHAN]
"${product.script30s.problem}"

[DETIK 10 - 18 | SOLUSI PRODUK]
"${solutionText}"

[DETIK 18 - 28 | 3 MANFAAT UTAMA]
${benefitsList.map((b, i) => `• Manfaat ${i + 1}: ${b}`).join('\n')}

[DETIK 28 - 35/40 | CALL TO ACTION]
"${ctaText}"

ARAHAN KAMERA & TRANSISI:
${product.script30s.cameraDirections}

HASHTAG REKOMENDASI:
${product.topHashtags.join(' ')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-950/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#fe2c55] text-white text-xs font-black">
                #{product.rank} TRENDING
              </span>
              <span className="text-xs text-slate-400">{product.category}</span>
              <span className="text-xs font-bold text-amber-300">{product.priceRange}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1 leading-snug">
              {product.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-slate-200">
          {/* TikTok Search Link Box */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-300 block">
                Link Pencarian TikTok Shop / Web:
              </span>
              <a
                href={product.tiktokShopUrl || `https://www.tiktok.com/search?q=${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-300 hover:text-cyan-200 hover:underline font-mono truncate block mt-0.5"
                title={product.tiktokShopUrl || `https://www.tiktok.com/search?q=${encodeURIComponent(product.name)}`}
              >
                {product.tiktokShopUrl || `https://www.tiktok.com/search?q=${encodeURIComponent(product.name)}`}
              </a>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    product.tiktokShopUrl || `https://www.tiktok.com/search?q=${encodeURIComponent(product.name)}`,
                    'tiktok_url'
                  )
                }
                className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition active:scale-95 ${
                  copiedSection === 'tiktok_url'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title="Salin link pencarian TikTok"
              >
                {copiedSection === 'tiktok_url' ? (
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
                href={product.tiktokShopUrl || `https://www.tiktok.com/search?q=${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg bg-[#fe2c55] hover:bg-[#e0264b] text-white text-xs font-bold transition active:scale-95 shadow-sm"
                title="Buka langsung pencarian di TikTok"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka TikTok</span>
              </a>
            </div>
          </div>

          {/* Quick Sound banner */}
          <div className="bg-pink-950/20 border border-pink-900/40 rounded-xl p-3 flex items-start gap-2.5">
            <Music className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-pink-200">Audio Cocok: {product.recommendedAudio.name}</span>
              <p className="text-slate-300 mt-0.5">{product.recommendedAudio.usageTip}</p>
            </div>
          </div>

          {/* 3-Detik Hooks List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#fe2c55]" />
                3 Opsi Hook Pembuka 3 Detik (Scroll Stopper):
              </h3>
              <span className="text-[11px] text-slate-400">Pilih 1 untuk pembuka video</span>
            </div>

            <div className="space-y-2">
              {product.keyHooks.map((hook, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-black text-[#25f4ee] shrink-0 mt-0.5">
                      0{idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                      "{hook}"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(hook, `hook_${idx}`)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
                    title="Salin hook ini"
                  >
                    {copiedSection === `hook_${idx}` ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 30-40s Script Breakdown */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#25f4ee]" />
                  Selling Narrative Video (30-40 Detik)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pola: <span className="text-[#25f4ee] font-semibold">HOOK</span> → <span className="text-amber-400 font-semibold">MASALAH</span> → <span className="text-sky-400 font-semibold">SOLUSI</span> → <span className="text-purple-400 font-semibold">3 MANFAAT</span> → <span className="text-emerald-400 font-semibold">CTA Evashop</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(fullScriptFormatted, 'full_script')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition active:scale-95 self-start sm:self-auto"
              >
                {copiedSection === 'full_script' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Naskah Utuh</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2.5">
              {/* 1. Hook */}
              <div className="bg-slate-950 p-3 rounded-xl border-l-4 border-l-[#fe2c55] border-y border-r border-slate-800">
                <span className="text-[11px] font-bold text-[#fe2c55] uppercase block mb-1">
                  Detik 00 - 03 : HOOK (Scroll-Stopper Pembuka)
                </span>
                <p className="text-xs sm:text-sm text-slate-200">
                  {product.script30s.hook}
                </p>
              </div>

              {/* 2. Problem */}
              <div className="bg-slate-950 p-3 rounded-xl border-l-4 border-l-amber-400 border-y border-r border-slate-800">
                <span className="text-[11px] font-bold text-amber-400 uppercase block mb-1">
                  Detik 03 - 10 : MASALAH (Keresahan & Pain Point Audiens)
                </span>
                <p className="text-xs sm:text-sm text-slate-200">
                  {product.script30s.problem}
                </p>
              </div>

              {/* 3. Solusi */}
              <div className="bg-slate-950 p-3 rounded-xl border-l-4 border-l-sky-400 border-y border-r border-slate-800">
                <span className="text-[11px] font-bold text-sky-400 uppercase block mb-1">
                  Detik 10 - 18 : SOLUSI (Hadirkan Produk Sebagai Jawaban Tuntas)
                </span>
                <p className="text-xs sm:text-sm text-slate-200">
                  {solutionText}
                </p>
              </div>

              {/* 4. 3 Manfaat */}
              <div className="bg-slate-950 p-3 rounded-xl border-l-4 border-l-purple-400 border-y border-r border-slate-800">
                <span className="text-[11px] font-bold text-purple-400 uppercase block mb-1">
                  Detik 18 - 28 : 3 MANFAAT UTAMA (Keunggulan Nyata)
                </span>
                <div className="space-y-1.5 mt-1">
                  {benefitsList.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. CTA */}
              <div className="bg-slate-950 p-3 rounded-xl border-l-4 border-l-emerald-400 border-y border-r border-slate-800">
                <span className="text-[11px] font-bold text-emerald-400 uppercase block mb-1">
                  Detik 28 - 35/40 : CALL TO ACTION (CTA Evashop)
                </span>
                <p className="text-xs sm:text-sm font-semibold text-emerald-300">
                  "{ctaText}"
                </p>
              </div>
            </div>
          </div>

          {/* Camera directions */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
              <Camera className="w-3.5 h-3.5" />
              Arahan Kamera & Transisi TikTok:
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {product.script30s.cameraDirections}
            </p>
          </div>

          {/* Hashtags */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                Hashtag Rekomendasi:
              </h4>
              <button
                type="button"
                onClick={() => handleCopy(product.topHashtags.join(' '), 'hashtags')}
                className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"
              >
                {copiedSection === 'hashtags' ? 'Hashtag Tersalin!' : 'Salin Semua'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.topHashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={() => {
              onSendToUgc(product);
              onClose();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#fe2c55] to-rose-600 hover:from-[#e0264b] hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-rose-900/30 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Kirim Produk ke Eva UGC Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
