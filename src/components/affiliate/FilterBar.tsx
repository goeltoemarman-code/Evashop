import React, { useState } from 'react';
import { 
  Flame, Filter, Search, ChevronDown, ChevronUp, Check, 
  Tag, DollarSign, Sparkles, RefreshCw, X 
} from 'lucide-react';

interface FilterBarProps {
  selectedCategories: string[];
  onChangeCategories: (categories: string[]) => void;
  selectedPriceRange: string;
  onChangePriceRange: (range: string) => void;
  selectedAffiliateFilters: string[];
  onChangeAffiliateFilters: (filters: string[]) => void;
  searchKeyword: string;
  onChangeSearchKeyword: (val: string) => void;
  onExecuteSearch: () => void;
  isSearching: boolean;
}

export const CATEGORIES_LIST = [
  'Dress', 'Gamis', 'Tunik', 'Blouse', 'Kemeja', 'Atasan', 
  'Kebaya', 'Batik', 'Rok', 'Celana', 'Outer', 'Setelan', 
  'Fashion Muslimah', 'Casual', 'Pesta', 'Kerja', 'Sepatu', 'Tas'
];

export const PRICE_RANGES = [
  { id: 'all', label: 'Semua Harga' },
  { id: '<50k', label: 'Di bawah Rp50.000' },
  { id: '50k-100k', label: 'Rp50.000–Rp100.000' },
  { id: '100k-200k', label: 'Rp100.000–Rp200.000' },
  { id: '200k-500k', label: 'Rp200.000–Rp500.000' },
  { id: '>500k', label: 'Di atas Rp500.000' },
];

export const AFFILIATE_FILTERS = [
  { id: 'Potensi klik tinggi', label: '🔥 Potensi klik tinggi' },
  { id: 'Harga murah', label: '💰 Harga murah' },
  { id: 'Rating tinggi', label: '⭐ Rating tinggi' },
  { id: 'Banyak ulasan', label: '🛒 Banyak ulasan' },
  { id: 'Cocok untuk video', label: '🎥 Cocok untuk video' },
  { id: 'Fashion wanita', label: '👗 Fashion wanita' },
  { id: 'Sedang tren', label: '📈 Sedang tren' },
  { id: 'Cocok untuk impulse buying', label: '🎁 Cocok untuk impulse buying' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategories,
  onChangeCategories,
  selectedPriceRange,
  onChangePriceRange,
  selectedAffiliateFilters,
  onChangeAffiliateFilters,
  searchKeyword,
  onChangeSearchKeyword,
  onExecuteSearch,
  isSearching,
}) => {
  const [showFiltersDetail, setShowFiltersDetail] = useState(false);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      onChangeCategories(selectedCategories.filter(c => c !== cat));
    } else {
      onChangeCategories([...selectedCategories, cat]);
    }
  };

  const toggleAffiliateFilter = (fId: string) => {
    if (selectedAffiliateFilters.includes(fId)) {
      onChangeAffiliateFilters(selectedAffiliateFilters.filter(item => item !== fId));
    } else {
      onChangeAffiliateFilters([...selectedAffiliateFilters, fId]);
    }
  };

  const selectAllCategories = () => {
    onChangeCategories([...CATEGORIES_LIST]);
  };

  const clearCategories = () => {
    onChangeCategories([]);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-sm space-y-4">
      {/* Search Input and Primary Trigger Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => onChangeSearchKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onExecuteSearch();
            }}
            placeholder="Ketik kata kunci pencarian (misal: Gamis Crinkle, Dress Kondangan, Blouse Korean)..."
            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-slate-800"
          />
          {searchKeyword && (
            <button
              onClick={() => onChangeSearchKeyword('')}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={onExecuteSearch}
          disabled={isSearching}
          type="button"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-md shadow-rose-200 text-sm active:scale-98 transition-all disabled:opacity-50 shrink-0"
        >
          {isSearching ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Menganalisis Shopee...</span>
            </>
          ) : (
            <>
              <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>CARI PRODUK TERLARIS HARI INI</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Category Chips Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              10. Mode Kategori Fashion Wanita:
            </span>
            <span className="text-xs text-rose-600 font-semibold">
              ({selectedCategories.length === 0 ? 'Semua Kategori' : `${selectedCategories.length} Dipilih`})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAllCategories}
              type="button"
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
            >
              Pilih Semua
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={clearCategories}
              type="button"
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
            >
              Reset
            </button>
            <button
              onClick={() => setShowFiltersDetail(!showFiltersDetail)}
              type="button"
              className="ml-2 flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-2 py-0.5 rounded-md"
            >
              <Filter className="w-3 h-3" />
              <span>{showFiltersDetail ? 'Tutup Filter' : 'Filter Lengkap'}</span>
              {showFiltersDetail ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES_LIST.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Filters: Price & Affiliate Badges */}
      {showFiltersDetail && (
        <div className="pt-3 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
          {/* 11. Filter Harga */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                11. Filter Harga:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRICE_RANGES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangePriceRange(item.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedPriceRange === item.id
                      ? 'bg-amber-500 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 12. Filter Produk untuk Affiliate */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                12. Filter Produk untuk Affiliate:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {AFFILIATE_FILTERS.map((f) => {
                const isChecked = selectedAffiliateFilters.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleAffiliateFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isChecked
                        ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 inline mr-1 text-rose-600" />}
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
