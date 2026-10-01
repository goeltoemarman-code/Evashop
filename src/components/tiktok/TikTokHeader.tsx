import React from 'react';
import { Sparkles, ArrowRight, RefreshCw, Radio, Music, TrendingUp, Flame } from 'lucide-react';

interface TikTokHeaderProps {
  onSwitchToUgcStudio: () => void;
  onRefreshTrends: () => void;
  isLoading: boolean;
  analysisDate: string;
  totalProductsCount: number;
}

export const TikTokHeader: React.FC<TikTokHeaderProps> = ({
  onSwitchToUgcStudio,
  onRefreshTrends,
  isLoading,
  analysisDate,
  totalProductsCount,
}) => {
  return (
    <header className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white border-b border-slate-800 shadow-xl overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-[#fe2c55]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-[#25f4ee]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand & Title */}
          <div className="flex items-start gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl bg-black border border-slate-700 flex items-center justify-center shadow-lg shadow-black/40 shrink-0">
              {/* TikTok inspired icon */}
              <div className="relative flex items-center justify-center">
                <Music className="w-6 h-6 text-[#25f4ee] absolute -translate-x-0.5 -translate-y-0.5" />
                <Music className="w-6 h-6 text-[#fe2c55] absolute translate-x-0.5 translate-y-0.5" />
                <Music className="w-6 h-6 text-white relative z-10" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fe2c55]/20 border border-[#fe2c55]/40 text-[#fe2c55] text-[11px] font-bold tracking-wide uppercase">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Live TikTok Trend Radar
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <span>📅</span> {analysisDate}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mt-1">
                Analisis Tren Produk Hari Ini di <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#25f4ee] via-white to-[#fe2c55]">TikTok</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5 max-w-2xl leading-relaxed">
                Riset real-time produk viral, FYP velocity score, sound trending, format video paling konversi, dan blueprint hook 3 detik TikTok Shop Indonesia.
              </p>
            </div>
          </div>

          {/* Action controls */}
          <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={onRefreshTrends}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 text-xs font-semibold transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Menganalisis...' : 'Pindai Ulang'}</span>
            </button>

            <button
              type="button"
              onClick={onSwitchToUgcStudio}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#fe2c55] to-rose-600 hover:from-[#e0264b] hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-rose-900/30 active:scale-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Buka Eva UGC Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>
        </div>

        {/* Quick stat banner */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-800">
            <Flame className="w-4 h-4 text-[#fe2c55] shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400">Total Terdeteksi</span>
              <span className="font-bold text-white">{totalProductsCount} Produk Trending</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-800">
            <TrendingUp className="w-4 h-4 text-[#25f4ee] shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400">Rata-rata FYP Velocity</span>
              <span className="font-bold text-white">93.4 / 100</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-800">
            <Music className="w-4 h-4 text-pink-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400">Sound Matching</span>
              <span className="font-bold text-white">Audio Viral Terkorelasi</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-800">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400">Eksekusi Konten</span>
              <span className="font-bold text-white">Hook 3s & Script 30s Siap Pakai</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
