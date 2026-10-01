import React, { useState } from 'react';
import { TikTokTrendingProduct } from '../../types/tiktokTrends';
import { Flame, Eye, Music, FileText, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';

interface TikTokComparisonTableProps {
  products: TikTokTrendingProduct[];
  onOpenScriptModal: (product: TikTokTrendingProduct) => void;
  onSendToUgc: (product: TikTokTrendingProduct) => void;
}

export const TikTokComparisonTable: React.FC<TikTokComparisonTableProps> = ({
  products,
  onOpenScriptModal,
  onSendToUgc,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (item: TikTokTrendingProduct) => {
    const url = item.tiktokShopUrl || `https://www.tiktok.com/search?q=${encodeURIComponent(item.name)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl my-8 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>Matriks Perbandingan Tren Produk TikTok Hari Ini</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
              10 Produk Teratas
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluasi menyeluruh performa FYP velocity, format video terbukti, audio korelasi, dan potensi konversi.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">Rank & Produk</th>
              <th className="py-3 px-3">Kategori & Harga</th>
              <th className="py-3 px-3">FYP Score</th>
              <th className="py-3 px-3">Pertumbuhan (48 Jam)</th>
              <th className="py-3 px-3">Format Video</th>
              <th className="py-3 px-3">Sound Rekomendasi</th>
              <th className="py-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {products.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3 px-3 font-medium">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                        item.rank === 1
                          ? 'bg-amber-400 text-slate-950'
                          : item.rank <= 3
                          ? 'bg-[#fe2c55] text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{item.rank}
                    </span>
                    <span className="text-white font-bold max-w-[200px] truncate block" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="block text-slate-400 text-[11px]">{item.category}</span>
                  <span className="font-bold text-amber-300">{item.priceRange}</span>
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 font-black text-xs text-[#25f4ee] bg-[#25f4ee]/10 px-2 py-0.5 rounded border border-[#25f4ee]/20">
                    <Flame className="w-3 h-3" /> {item.fypScore}/100
                  </span>
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    {item.growthRate}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">{item.viewsCount}</span>
                </td>

                <td className="py-3 px-3 text-slate-200">
                  <span className="bg-slate-950 px-2 py-1 rounded text-[11px] font-medium border border-slate-800 inline-block max-w-[150px] truncate" title={item.viralFormat}>
                    {item.viralFormat}
                  </span>
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-[11px] text-pink-300 max-w-[140px] truncate" title={item.recommendedAudio.name}>
                    <Music className="w-3 h-3 text-pink-400 shrink-0" />
                    <span className="truncate">{item.recommendedAudio.name}</span>
                  </div>
                </td>

                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item)}
                      className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                        copiedId === item.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white'
                      }`}
                      title="Salin link pencarian TikTok"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#25f4ee]" />
                      )}
                    </button>

                    <a
                      href={item.tiktokShopUrl || `https://www.tiktok.com/search?q=${encodeURIComponent(item.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[#fe2c55] hover:bg-[#e0264b] text-white text-xs font-semibold transition"
                      title="Buka pencarian di TikTok"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onOpenScriptModal(item)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                      title="Lihat Script Video 30 Detik"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#25f4ee]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onSendToUgc(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#fe2c55] to-rose-600 hover:from-[#e0264b] hover:to-rose-700 text-white text-xs font-bold transition shadow-sm"
                      title="Kirim ke Eva UGC Studio"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>UGC</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
