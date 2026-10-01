import React from 'react';
import { TikTokSoundTrend, TikTokHashtagTrend } from '../../types/tiktokTrends';
import { Music, Hash, TrendingUp, Sparkles, Volume2 } from 'lucide-react';

interface TikTokSoundRadarProps {
  sounds: TikTokSoundTrend[];
  hashtags: TikTokHashtagTrend[];
}

export const TikTokSoundRadar: React.FC<TikTokSoundRadarProps> = ({ sounds, hashtags }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
      {/* Sound Trends */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Music className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Sound & Audio TikTok Trending</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold border border-pink-500/30">
                  Audio Radar
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Lagu & sound effect dengan korelasi penjualan produk tertinggi hari ini.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {sounds.map((snd) => (
            <div
              key={snd.id}
              className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Volume2 className="w-4 h-4 text-[#fe2c55] shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{snd.title}</h4>
                    <p className="text-xs text-slate-400">{snd.creator}</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded shrink-0">
                  {snd.growth}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-1">
                <span className="text-[11px] text-pink-300 font-medium bg-pink-950/40 px-2 py-0.5 rounded border border-pink-900/30">
                  Vibe: {snd.vibe}
                </span>
                <span className="text-[11px] text-slate-300">{snd.totalVideos}</span>
              </div>

              <div className="mt-2 text-xs text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[#25f4ee] font-semibold">Produk Pas: </span>
                {snd.bestProductFit}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hashtag Trends */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/20 text-[#25f4ee] border border-cyan-500/30">
              <Hash className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Top Rising Hashtags TikTok</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#25f4ee] text-[10px] font-bold border border-cyan-500/30">
                  Algoritma FYP
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Hashtag dengan distribusi penonton baru paling luas untuk video produk.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {hashtags.map((h, idx) => (
            <div
              key={idx}
              className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-[#25f4ee] tracking-tight">
                    {h.tag}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">({h.views})</span>
                </div>
                <span className="text-[11px] font-bold text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                  {h.growth}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {h.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
