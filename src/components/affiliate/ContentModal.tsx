import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Flame, Copy, Check, RefreshCw, Edit3, Eye, 
  Share2, Hash, Video, MessageSquare, Send, CheckCircle2 
} from 'lucide-react';
import { ShopeeProduct, ContentGeneration, ViralContent } from '../../types/affiliate';
import { generateContentPackage, generateViralContent } from '../../services/geminiResearch';

interface ContentModalProps {
  product: ShopeeProduct | null;
  initialMode: 'standard' | 'viral';
  onClose: () => void;
}

export const ContentModal: React.FC<ContentModalProps> = ({
  product,
  initialMode,
  onClose,
}) => {
  if (!product) return null;

  const [activeTab, setActiveTab] = useState<'standard' | 'viral'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Standard Content State
  const [content, setContent] = useState<ContentGeneration | null>(null);
  // Viral Content State
  const [viralContent, setViralContent] = useState<ViralContent | null>(null);

  // Editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Load content when modal opens or tab changes
  useEffect(() => {
    if (activeTab === 'standard' && !content) {
      loadStandardContent();
    } else if (activeTab === 'viral' && !viralContent) {
      loadViralContent();
    }
  }, [activeTab]);

  const loadStandardContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await generateContentPackage(product);
      setContent(res);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat paket konten.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadViralContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await generateViralContent(product);
      setViralContent(res);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat konten viral.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const copyAllContent = () => {
    if (activeTab === 'standard' && content) {
      const text = `🎬 PAKET KONTEN AFFILIATE EVASHOP
Produk: ${product.name}
Kategori: ${product.category}
Link: ${product.affiliateUrl || product.shopeeUrl}

📌 JUDUL VIDEO:
${content.videoTitle}

⚡ HOOK 3 DETIK:
${content.hook3s}

⏱️ SCRIPT 15 DETIK:
${content.script15s}

⏱️ SCRIPT 30 DETIK:
${content.script30s}

⏱️ SCRIPT 60 DETIK:
${content.script60s}

📱 CAPTION TIKTOK:
${content.captionTikTok}

📸 CAPTION INSTAGRAM:
${content.captionInstagram}

👥 CAPTION FACEBOOK:
${content.captionFacebook}

▶️ YOUTUBE SHORTS:
${content.shortsDescription}

#️⃣ HASHTAG:
${content.hashtags.join(' ')}

🎯 KEYWORDS:
${content.keywords.join(', ')}

🛒 CTA:
${content.ctaAffiliate}`;

      copyToClipboard(text, 'all_standard');
    } else if (activeTab === 'viral' && viralContent) {
      const text = `🚀 FORMULA KONTEN VIRAL EVASHOP
Produk: ${product.name}

1. HOOK:
${viralContent.hook}

2. PROBLEM:
${viralContent.problem}

3. SOLUTION:
${viralContent.solution}

4. PROOF:
${viralContent.proof}

5. BENEFIT:
${viralContent.benefit}

6. CTA:
${viralContent.cta}

Link Affiliate: ${product.affiliateUrl || product.shopeeUrl}`;

      copyToClipboard(text, 'all_viral');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-rose-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50 via-pink-50 to-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                {product.category}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-bold text-slate-700">{product.price}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1 mt-0.5">
              {product.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Controls Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('standard')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'standard'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>✨ Paket Konten Otomatis</span>
            </button>

            <button
              onClick={() => setActiveTab('viral')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'viral'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>🚀 Formula Viral</span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              type="button"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-semibold ${
                isEditing ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Selesai Edit' : '✏️ Edit'}</span>
            </button>

            <button
              onClick={activeTab === 'standard' ? loadStandardContent : loadViralContent}
              disabled={isLoading}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>🔄 Generate Ulang</span>
            </button>

            <button
              onClick={copyAllContent}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-bold shadow-xs"
            >
              {copiedItem?.startsWith('all') ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedItem?.startsWith('all') ? 'Semua Tersalin!' : '📋 Salin Semua'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {isLoading && (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                AI sedang meracik naskah &amp; caption terbaik untuk {product.name}...
              </p>
              <p className="text-xs text-slate-400">
                Fokus manfaat, bahasa natural rekomendasi teman, tanpa klaim palsu.
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
              <p className="font-bold">Terjadi Kendala:</p>
              <p>{error}</p>
              <button
                onClick={activeTab === 'standard' ? loadStandardContent : loadViralContent}
                type="button"
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-semibold"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* TAB 1: STANDARD CONTENT PACKAGE */}
          {activeTab === 'standard' && content && !isLoading && (
            <div className="space-y-4 text-xs">
              {/* 1. Judul Video */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-wide">
                    1. Judul Video:
                  </span>
                  <button
                    onClick={() => copyToClipboard(content.videoTitle, 'title')}
                    type="button"
                    className="flex items-center gap-1 text-slate-500 hover:text-rose-600 font-semibold"
                  >
                    {copiedItem === 'title' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedItem === 'title' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={content.videoTitle}
                    onChange={(e) => setContent({ ...content, videoTitle: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-900">{content.videoTitle}</p>
                )}
              </div>

              {/* 2. Hook 3 Detik */}
              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900 uppercase tracking-wide">
                    2. Hook 3 Detik (Hentikan Scrolling):
                  </span>
                  <button
                    onClick={() => copyToClipboard(content.hook3s, 'hook')}
                    type="button"
                    className="flex items-center gap-1 text-rose-700 hover:text-rose-900 font-semibold"
                  >
                    {copiedItem === 'hook' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedItem === 'hook' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={content.hook3s}
                    onChange={(e) => setContent({ ...content, hook3s: e.target.value })}
                    className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-800 italic">"{content.hook3s}"</p>
                )}
              </div>

              {/* 3, 4, 5. Scripts (15s, 30s, 60s) */}
              <div className="space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider block">
                  3. Naskah Voiceover (Pilihan Durasi):
                </span>

                {/* 15s */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">⏱️ Script 15 Detik (Singkat &amp; Padat):</span>
                    <button
                      onClick={() => copyToClipboard(content.script15s, 'script15')}
                      type="button"
                      className="text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                    >
                      {copiedItem === 'script15' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Salin</span>
                    </button>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={content.script15s}
                      onChange={(e) => setContent({ ...content, script15s: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  ) : (
                    <p className="text-slate-700 leading-relaxed">{content.script15s}</p>
                  )}
                </div>

                {/* 30s */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">⏱️ Script 30 Detik (Standar Rekomendasi):</span>
                    <button
                      onClick={() => copyToClipboard(content.script30s, 'script30')}
                      type="button"
                      className="text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                    >
                      {copiedItem === 'script30' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Salin</span>
                    </button>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={content.script30s}
                      onChange={(e) => setContent({ ...content, script30s: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  ) : (
                    <p className="text-slate-700 leading-relaxed">{content.script30s}</p>
                  )}
                </div>

                {/* 60s */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">⏱️ Script 60 Detik (Storytelling &amp; Uji Bahan):</span>
                    <button
                      onClick={() => copyToClipboard(content.script60s, 'script60')}
                      type="button"
                      className="text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                    >
                      {copiedItem === 'script60' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Salin</span>
                    </button>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={6}
                      value={content.script60s}
                      onChange={(e) => setContent({ ...content, script60s: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  ) : (
                    <p className="text-slate-700 leading-relaxed">{content.script60s}</p>
                  )}
                </div>
              </div>

              {/* 6, 7, 8, 9. Captions Multi-Platform */}
              <div className="space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider block">
                  Captions Multi-Platform:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* TikTok */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">📱 TikTok Caption:</span>
                      <button
                        onClick={() => copyToClipboard(content.captionTikTok, 'tiktok')}
                        type="button"
                        className="text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                      >
                        {copiedItem === 'tiktok' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </button>
                    </div>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={content.captionTikTok}
                        onChange={(e) => setContent({ ...content, captionTikTok: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    ) : (
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{content.captionTikTok}</p>
                    )}
                  </div>

                  {/* Instagram */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">📸 Instagram Caption:</span>
                      <button
                        onClick={() => copyToClipboard(content.captionInstagram, 'ig')}
                        type="button"
                        className="text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                      >
                        {copiedItem === 'ig' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </button>
                    </div>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={content.captionInstagram}
                        onChange={(e) => setContent({ ...content, captionInstagram: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    ) : (
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{content.captionInstagram}</p>
                    )}
                  </div>

                  {/* Facebook */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">👥 Facebook Caption:</span>
                      <button
                        onClick={() => copyToClipboard(content.captionFacebook, 'fb')}
                        type="button"
                        className="text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                      >
                        {copiedItem === 'fb' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </button>
                    </div>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={content.captionFacebook}
                        onChange={(e) => setContent({ ...content, captionFacebook: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    ) : (
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{content.captionFacebook}</p>
                    )}
                  </div>

                  {/* YouTube Shorts */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">▶️ YouTube Shorts Description:</span>
                      <button
                        onClick={() => copyToClipboard(content.shortsDescription, 'shorts')}
                        type="button"
                        className="text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                      >
                        {copiedItem === 'shorts' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </button>
                    </div>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={content.shortsDescription}
                        onChange={(e) => setContent({ ...content, shortsDescription: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    ) : (
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{content.shortsDescription}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Hashtags & Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">#️⃣ Hashtags:</span>
                    <button
                      onClick={() => copyToClipboard(content.hashtags.join(' '), 'hash')}
                      type="button"
                      className="text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                    >
                      {copiedItem === 'hash' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Salin</span>
                    </button>
                  </div>
                  <p className="text-rose-700 font-medium">{content.hashtags.join(' ')}</p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">🎯 Keywords:</span>
                    <button
                      onClick={() => copyToClipboard(content.keywords.join(', '), 'kw')}
                      type="button"
                      className="text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                    >
                      {copiedItem === 'kw' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Salin</span>
                    </button>
                  </div>
                  <p className="text-slate-700 font-medium">{content.keywords.join(', ')}</p>
                </div>
              </div>

              {/* CTA Affiliate */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                    12. CTA Affiliate Eva Shop:
                  </span>
                  <p className="text-emerald-950 font-bold text-sm">"{content.ctaAffiliate}"</p>
                </div>
                <button
                  onClick={() => copyToClipboard(content.ctaAffiliate, 'cta')}
                  type="button"
                  className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                >
                  {copiedItem === 'cta' ? 'Tersalin' : 'Salin CTA'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VIRAL FORMULA */}
          {activeTab === 'viral' && viralContent && !isLoading && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <span className="font-bold text-purple-900 block mb-0.5">
                  🚀 Struktur Formula Konten Viral Eva Shop:
                </span>
                <p className="text-slate-600">
                  Hook tajam stop scroll → Problem nyata keresahan berpakaian → Solusi produk → Bukti listing Shopee → Manfaat nyata → CTA natural.
                </p>
              </div>

              {/* HOOK */}
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900 uppercase">1. HOOK:</span>
                  <button
                    onClick={() => copyToClipboard(viralContent.hook, 'v_hook')}
                    type="button"
                    className="text-rose-700 font-semibold flex items-center gap-1"
                  >
                    {copiedItem === 'v_hook' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Salin</span>
                  </button>
                </div>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={viralContent.hook}
                    onChange={(e) => setViralContent({ ...viralContent, hook: e.target.value })}
                    className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs"
                  />
                ) : (
                  <p className="text-slate-900 font-bold text-sm leading-relaxed">{viralContent.hook}</p>
                )}
              </div>

              {/* PROBLEM */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase">2. PROBLEM:</span>
                  <button
                    onClick={() => copyToClipboard(viralContent.problem, 'v_prob')}
                    type="button"
                    className="text-slate-500 font-semibold flex items-center gap-1"
                  >
                    {copiedItem === 'v_prob' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Salin</span>
                  </button>
                </div>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={viralContent.problem}
                    onChange={(e) => setViralContent({ ...viralContent, problem: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed">{viralContent.problem}</p>
                )}
              </div>

              {/* SOLUTION */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase">3. SOLUTION:</span>
                  <button
                    onClick={() => copyToClipboard(viralContent.solution, 'v_sol')}
                    type="button"
                    className="text-slate-500 font-semibold flex items-center gap-1"
                  >
                    {copiedItem === 'v_sol' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Salin</span>
                  </button>
                </div>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={viralContent.solution}
                    onChange={(e) => setViralContent({ ...viralContent, solution: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed">{viralContent.solution}</p>
                )}
              </div>

              {/* PROOF */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase">4. PROOF:</span>
                  <button
                    onClick={() => copyToClipboard(viralContent.proof, 'v_proof')}
                    type="button"
                    className="text-slate-500 font-semibold flex items-center gap-1"
                  >
                    {copiedItem === 'v_proof' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Salin</span>
                  </button>
                </div>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={viralContent.proof}
                    onChange={(e) => setViralContent({ ...viralContent, proof: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed">{viralContent.proof}</p>
                )}
              </div>

              {/* BENEFIT */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase">5. BENEFIT:</span>
                  <button
                    onClick={() => copyToClipboard(viralContent.benefit, 'v_ben')}
                    type="button"
                    className="text-slate-500 font-semibold flex items-center gap-1"
                  >
                    {copiedItem === 'v_ben' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Salin</span>
                  </button>
                </div>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={viralContent.benefit}
                    onChange={(e) => setViralContent({ ...viralContent, benefit: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed">{viralContent.benefit}</p>
                )}
              </div>

              {/* CTA */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 uppercase">6. CTA:</span>
                  <button
                    onClick={() => copyToClipboard(viralContent.cta, 'v_cta')}
                    type="button"
                    className="text-emerald-700 font-semibold flex items-center gap-1"
                  >
                    {copiedItem === 'v_cta' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Salin</span>
                  </button>
                </div>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={viralContent.cta}
                    onChange={(e) => setViralContent({ ...viralContent, cta: e.target.value })}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-xs"
                  />
                ) : (
                  <p className="text-emerald-950 font-bold leading-relaxed">{viralContent.cta}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Tautan Affiliate:{' '}
            <span className="font-semibold text-rose-600">
              {product.affiliateUrl || 'Shopee Link Aktif'}
            </span>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
