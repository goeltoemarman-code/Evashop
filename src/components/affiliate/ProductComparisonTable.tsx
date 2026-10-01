import React from 'react';
import { Table, Award, DollarSign, Star, Flame, Sparkles } from 'lucide-react';
import { ShopeeProduct } from '../../types/affiliate';

interface ProductComparisonTableProps {
  products: ShopeeProduct[];
  onSelectProduct: (product: ShopeeProduct) => void;
}

export const ProductComparisonTable: React.FC<ProductComparisonTableProps> = ({
  products,
  onSelectProduct,
}) => {
  if (!products || products.length === 0) return null;

  // Find Best in each category
  const bestForContent = [...products].sort((a, b) => b.scores.content - a.scores.content)[0];
  const bestRating = [...products].sort((a, b) => {
    const rA = parseFloat(a.rating || '0') || 0;
    const rB = parseFloat(b.rating || '0') || 0;
    return rB - rA;
  })[0];
  const bestTrend = [...products].sort((a, b) => b.scores.trendPotential - a.scores.trendPotential)[0];
  const bestValue = [...products].sort((a, b) => b.scores.priceAppeal - a.scores.priceAppeal)[0];

  return (
    <div id="comparison-section" className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
          📊 PERBANDINGAN 10 PRODUK FASHION TERBAIK
        </h2>
        <p className="text-xs text-slate-500">
          Matriks perbandingan metrik kunci untuk menentukan produk terbaik sesuai fokus kampanye affiliate Anda hari ini.
        </p>
      </div>

      {/* 4 Badges Showcase */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
          <div className="flex items-center gap-1.5 text-purple-800 font-bold text-[11px] mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>🏆 BEST FOR CONTENT</span>
          </div>
          <div className="font-bold text-slate-900 line-clamp-1">{bestForContent?.name}</div>
          <div className="text-[11px] text-purple-700 mt-0.5">Content Score: {bestForContent?.scores.content}/100</div>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>💰 BEST VALUE</span>
          </div>
          <div className="font-bold text-slate-900 line-clamp-1">{bestValue?.name}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">{bestValue?.price} ({bestValue?.discount || 'Promo'})</div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px] mb-1">
            <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            <span>⭐ BEST RATING</span>
          </div>
          <div className="font-bold text-slate-900 line-clamp-1">{bestRating?.name}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">Rating: ⭐ {bestRating?.rating || '4.8'}</div>
        </div>

        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
          <div className="flex items-center gap-1.5 text-rose-800 font-bold text-[11px] mb-1">
            <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
            <span>🔥 BEST TREND POTENTIAL</span>
          </div>
          <div className="font-bold text-slate-900 line-clamp-1">{bestTrend?.name}</div>
          <div className="text-[11px] text-rose-700 mt-0.5">Trend Score: {bestTrend?.scores.trendPotential}/100</div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4 min-w-[220px]">Produk</th>
                <th className="py-3 px-3">Harga</th>
                <th className="py-3 px-3">Diskon</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3">Ulasan</th>
                <th className="py-3 px-3 text-center">Content Score</th>
                <th className="py-3 px-3 text-center">Conversion Score</th>
                <th className="py-3 px-4 text-center">Eva Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const isTopContent = p.id === bestForContent?.id;
                const isTopRate = p.id === bestRating?.id;
                const isTopTrend = p.id === bestTrend?.id;
                const isTopVal = p.id === bestValue?.id;

                return (
                  <tr 
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="hover:bg-rose-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-700">#{p.rank}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <span className="text-rose-600 font-semibold">{p.category}</span>
                        {isTopContent && <span className="text-[10px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">Best Content</span>}
                        {isTopVal && <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">Best Value</span>}
                        {isTopRate && <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">Best Rating</span>}
                        {isTopTrend && <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">Best Trend</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-rose-600 whitespace-nowrap">{p.price}</td>
                    <td className="py-3 px-3 text-slate-600">{p.discount || '-'}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                      ⭐ {p.rating || '4.8'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{p.reviewCount || '-'}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700">
                        {p.scores.content}/100
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700">
                        {p.scores.conversion}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full font-black text-rose-700 bg-rose-100">
                        {p.scores.evaScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
