import React, { useState } from 'react';
import { Search, Flame, TrendingUp, ShoppingBag, Sparkles, Filter, X } from 'lucide-react';

interface TikTokFilterBarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedMetric: string;
  onSelectMetric: (metric: string) => void;
  customKeyword: string;
  onSearchKeyword: (keyword: string) => void;
  isLoading: boolean;
}

const CATEGORIES = [
  { id: 'all', label: '🔥 Semua Kategori' },
  { id: 'Fashion & Hijab', label: '👗 Fashion & Hijab' },
  { id: 'Beauty & Skincare', label: '✨ Beauty & Skincare' },
  { id: 'Perlengkapan Rumah', label: '🏠 Home & Living' },
  { id: 'Tas & Sepatu', label: '👜 Tas & Sepatu' },
  { id: 'Aksesoris & Gadget', label: '⚡ Aksesoris & Gadget' },
];

const METRICS = [
  { id: 'fyp', label: '🔥 Paling Viral (FYP)', icon: Flame },
  { id: 'breakout', label: '📈 Lonjakan Tertinggi (Breakout)', icon: TrendingUp },
  { id: 'conversion', label: '🛒 Top Checkout TikTok Shop', icon: ShoppingBag },
];

export const TikTokFilterBar: React.FC<TikTokFilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedMetric,
  onSelectMetric,
  customKeyword,
  onSearchKeyword,
  isLoading,
}) => {
  const [searchInput, setSearchInput] = useState(customKeyword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchKeyword(searchInput);
  };

  const handleClear = () => {
    setSearchInput('');
    onSearchKeyword('');
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3.5">
        {/* Search input & trigger */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari tren produk TikTok (misal: kulot crinkle, clay mask, tumbler, tas puffer...)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#25f4ee] focus:ring-1 focus:ring-[#25f4ee] transition"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#25f4ee] hover:bg-[#1ee0da] text-slate-950 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-slate-900" />
            <span>{isLoading ? 'Menganalisis...' : 'Analisis Tren'}</span>
          </button>
        </form>

        {/* Category Pills & Metrics Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3 h-3 text-slate-400" /> Niche:
            </span>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Metric Sorter */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-1">
              Urutkan:
            </span>
            {METRICS.map((m) => {
              const Icon = m.icon;
              const active = selectedMetric === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMetric(m.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#fe2c55] text-white font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
