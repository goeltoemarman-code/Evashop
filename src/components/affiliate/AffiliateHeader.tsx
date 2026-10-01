import React from 'react';
import { 
  Sparkles, Flame, TrendingUp, Video, FileText, Link as LinkIcon, 
  Clock, Calendar, CheckCircle2, ShieldAlert, Globe, ArrowRight, RefreshCw, Key
} from 'lucide-react';
import { BloggerAuth } from '../../types/affiliate';

interface AffiliateHeaderProps {
  onSearchTerlaris: () => void;
  onFilterTrending: () => void;
  onOpenBloggerModal: () => void;
  onScrollToSection: (sectionId: string) => void;
  onSwitchToUgcStudio: () => void;
  lastCheckedTime: string;
  lastCheckedDate: string;
  isLiveAvailable: boolean;
  isSearching: boolean;
  bloggerAuth: BloggerAuth;
}

export const AffiliateHeader: React.FC<AffiliateHeaderProps> = ({
  onSearchTerlaris,
  onFilterTrending,
  onOpenBloggerModal,
  onScrollToSection,
  onSwitchToUgcStudio,
  lastCheckedTime,
  lastCheckedDate,
  isLiveAvailable,
  isSearching,
  bloggerAuth,
}) => {
  return (
    <header className="bg-white border-b border-rose-100 shadow-xs sticky top-0 z-40">
      {/* Top Banner: Brand & Tagline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">EVASHOP AI</span>
                <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  Affiliate Studio
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 tracking-tight">
                Temukan Produk. Buat Konten. Simpan Draft. Ulangi Setiap Hari.
              </p>
            </div>
          </div>

          {/* Quick Switch to UGC Studio on Mobile */}
          <button
            onClick={onSwitchToUgcStudio}
            type="button"
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
          >
            <span>UGC Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live sync & Blogger Connection Status */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end text-xs">
          {/* Timestamp Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{lastCheckedDate || 'Hari ini'}</span>
            <span className="text-slate-300">|</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{lastCheckedTime || 'Baru saja'}</span>
          </div>

          {/* Live Shopee Signal Status */}
          {isLiveAvailable ? (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Sinyal Shopee Aktif</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>⚠️ Data Live Shopee Terbatas</span>
            </div>
          )}

          {/* Blogger Connect Button / Status */}
          <button
            onClick={onOpenBloggerModal}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-semibold transition-all ${
              bloggerAuth.isConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
          >
            {bloggerAuth.isConnected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[130px]">
                  🟢 {bloggerAuth.selectedBlog?.name || 'Blogger Terhubung'}
                </span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>🔐 Hubungkan Blogger</span>
              </>
            )}
          </button>

          {/* Switch to UGC Photo Studio (Desktop) */}
          <button
            onClick={onSwitchToUgcStudio}
            type="button"
            className="hidden md:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <span>🎨 Buka UGC Photo Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Action Buttons Bar */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onSearchTerlaris}
              disabled={isSearching}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-lg shadow-sm hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 text-xs transition-transform active:scale-95"
            >
              {isSearching ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              )}
              <span>PRODUK TERLARIS HARI INI</span>
            </button>

            <button
              onClick={onFilterTrending}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 text-xs transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
              <span>PRODUK SEDANG TREND</span>
            </button>

            <button
              onClick={() => onScrollToSection('top-video-section')}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 text-xs transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-purple-600" />
              <span>TOP 3 VIDEO</span>
            </button>

            <button
              onClick={() => onScrollToSection('hidden-gems-section')}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 text-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>POTENSI KONTEN TINGGI</span>
            </button>

            <button
              onClick={() => onScrollToSection('comparison-section')}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 text-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>PERBANDINGAN</span>
            </button>
          </div>

          <div className="shrink-0 text-slate-400 text-xs hidden lg:block">
            <span className="font-semibold text-slate-600">Alur:</span> Riset Shopee → Analisis → 10 Produk → Konten/Artikel → Simpan Draft Blogger
          </div>
        </div>
      </div>
    </header>
  );
};
