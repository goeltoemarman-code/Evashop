import React, { useState, useEffect } from 'react';
import { 
  X, FileText, Sparkles, Copy, Check, RefreshCw, Edit3, Eye, 
  Send, ExternalLink, Key, CheckCircle2, ShieldAlert, Code, 
  HelpCircle, Link as LinkIcon, Search, Tag, Image as ImageIcon, Video
} from 'lucide-react';
import { ShopeeProduct, EvaArticle, BloggerAuth } from '../../types/affiliate';
import { generateEvaArticle } from '../../services/geminiResearch';
import { saveArticleAsDraft } from '../../services/bloggerApi';

interface ArticleModalProps {
  product: ShopeeProduct | null;
  bloggerAuth: BloggerAuth;
  onOpenBloggerModal: () => void;
  onOpenPromptsModal: (product: ShopeeProduct, type: 'image' | 'video') => void;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  product,
  bloggerAuth,
  onOpenBloggerModal,
  onOpenPromptsModal,
  onClose,
}) => {
  if (!product) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<EvaArticle | null>(null);

  // View modes
  const [viewMode, setViewMode] = useState<'preview' | 'html' | 'seo' | 'edit'>('preview');
  
  // Custom affiliate link input
  const [affiliateLink, setAffiliateLink] = useState(product.affiliateUrl || product.shopeeUrl || '');
  const [isEditingLink, setIsEditingLink] = useState(false);

  // Blogger draft export states
  const [isSavingBlogger, setIsSavingBlogger] = useState(false);
  const [bloggerFeedback, setBloggerFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    url?: string;
  } | null>(null);

  // Copy state
  const [copiedType, setCopiedType] = useState<string | null>(null);

  useEffect(() => {
    loadArticle();
  }, [product.id]);

  const loadArticle = async () => {
    setIsLoading(true);
    setError(null);
    setBloggerFeedback(null);
    try {
      const res = await generateEvaArticle(product, affiliateLink);
      setArticle(res);
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan artikel ulasan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  /**
   * 21. EKSPOR KE BLOGGER
   * STRICT MANDATE: isDraft=true ONLY! No Publish, No Publikasikan!
   */
  const handleSaveToBloggerDraft = async () => {
    if (!article) return;

    if (!bloggerAuth.isConnected || !bloggerAuth.accessToken) {
      setBloggerFeedback({
        type: 'error',
        message: 'Blogger belum terhubung. Silakan klik "Hubungkan Blogger" terlebih dahulu.',
      });
      onOpenBloggerModal();
      return;
    }

    if (!bloggerAuth.selectedBlog) {
      setBloggerFeedback({
        type: 'error',
        message: 'Belum ada blog yang dipilih. Buka pengaturan Blogger untuk memilih blog.',
      });
      onOpenBloggerModal();
      return;
    }

    setIsSavingBlogger(true);
    setBloggerFeedback(null);

    try {
      const labels = [
        'Eva Shop',
        product.category,
        ...(article.seo?.hashtags || []).map(h => h.replace(/^#/, '')),
      ];

      const res = await saveArticleAsDraft(
        bloggerAuth.accessToken,
        bloggerAuth.selectedBlog.id,
        article.title,
        article.fullHtml,
        labels
      );

      setBloggerFeedback({
        type: 'success',
        message: '✅ Artikel berhasil disimpan sebagai Draft di Blogger.',
        url: res.url,
      });
    } catch (err: any) {
      setBloggerFeedback({
        type: 'error',
        message: `❌ Gagal menyimpan Draft: ${err.message || 'Terjadi kesalahan sistem'}`,
      });
    } finally {
      setIsSavingBlogger(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-rose-100 flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in duration-200">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50 via-pink-50 to-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
                16. Generator Artikel EvaShop
              </span>
              <span className="text-xs font-bold text-slate-700">{product.category}</span>
              {article && (
                <span className="text-xs font-semibold text-slate-500">
                  (~{article.wordCount} Kata)
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1 mt-0.5">
              {article ? article.title : product.name}
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

        {/* Action Controls & Navigation Tabs */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* View Modes */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('preview')}
              type="button"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                viewMode === 'preview'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>👁️ Preview</span>
            </button>

            <button
              onClick={() => setViewMode('seo')}
              type="button"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                viewMode === 'seo'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>🔍 SEO Meta</span>
            </button>

            <button
              onClick={() => setViewMode('html')}
              type="button"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                viewMode === 'html'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>&lt;/&gt; Kode HTML</span>
            </button>

            <button
              onClick={() => setViewMode('edit')}
              type="button"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                viewMode === 'edit'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>✏️ Edit</span>
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setIsEditingLink(!isEditingLink)}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold"
            >
              <LinkIcon className="w-3.5 h-3.5 text-rose-600" />
              <span>🔗 Link Affiliate</span>
            </button>

            <button
              onClick={() => onOpenPromptsModal(product, 'image')}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Prompt Gambar</span>
            </button>

            <button
              onClick={() => onOpenPromptsModal(product, 'video')}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold"
            >
              <Video className="w-3.5 h-3.5 text-purple-600" />
              <span>Prompt Video</span>
            </button>

            <button
              onClick={loadArticle}
              disabled={isLoading}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>🔄 Generate Ulang</span>
            </button>

            <button
              onClick={() => handleCopy(viewMode === 'html' ? (article?.fullHtml || '') : (article?.fullMarkdown || ''), 'article')}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold shadow-xs"
            >
              {copiedType === 'article' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'article' ? 'Tersalin!' : '📋 Salin'}</span>
            </button>

            {/* MANDATORY: STRICTLY ONLY "SIMPAN SEBAGAI DRAFT" - NEVER PUBLISH */}
            <button
              onClick={handleSaveToBloggerDraft}
              disabled={isSavingBlogger || !article}
              type="button"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#8b5a2b] hover:bg-[#734720] text-white font-bold rounded-lg shadow-sm disabled:opacity-50 transition-all"
              title="Simpan artikel sebagai draft ke Blogger"
            >
              {isSavingBlogger ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>🟤 SIMPAN SEBAGAI DRAFT</span>
            </button>
          </div>
        </div>

        {/* Affiliate Link Quick Drawer */}
        {isEditingLink && (
          <div className="px-4 sm:px-6 py-2.5 bg-rose-50/70 border-b border-rose-100 flex items-center gap-2 text-xs">
            <span className="font-bold text-rose-900 shrink-0">Tautan Affiliate:</span>
            <input
              type="url"
              value={affiliateLink}
              onChange={(e) => setAffiliateLink(e.target.value)}
              placeholder="Masukkan link affiliate Shopee Eva Shop kamu..."
              className="flex-1 px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <button
              onClick={() => {
                setIsEditingLink(false);
                loadArticle();
              }}
              type="button"
              className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 shrink-0"
            >
              Terapkan ke Artikel
            </button>
          </div>
        )}

        {/* Blogger Status / Feedback Banner */}
        {bloggerFeedback && (
          <div className={`px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs border-b ${
            bloggerFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            <div className="flex items-center gap-2 font-medium">
              {bloggerFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{bloggerFeedback.message}</span>
            </div>

            {bloggerFeedback.url && (
              <a
                href={bloggerFeedback.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-bold underline hover:opacity-80 ml-2"
              >
                <span>Buka di Blogger</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading && (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-9 h-9 text-rose-600 animate-spin mx-auto" />
              <p className="text-base font-bold text-slate-800">
                Menulis artikel ulasan komprehensif (1.000 - 1.800 kata)...
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Menyusun H1, kelebihan produk, detail bahan, audiens target, FAQ mendalam, dan meta SEO otomatis.
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
              <p className="font-bold">Gagal Membuat Artikel:</p>
              <p>{error}</p>
              <button
                onClick={loadArticle}
                type="button"
                className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* VIEW 1: PREVIEW (Visual Render) */}
          {viewMode === 'preview' && article && !isLoading && (
            <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              {/* Render article HTML directly */}
              <div 
                className="prose max-w-none text-slate-800"
                dangerouslySetInnerHTML={{ __html: article.fullHtml }}
              />
            </div>
          )}

          {/* VIEW 2: SEO META INFORMATION */}
          {viewMode === 'seo' && article && !isLoading && (
            <div className="max-w-3xl mx-auto space-y-4 text-xs">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                <span className="font-black text-purple-900 text-sm block mb-1">
                  17. Ringkasan SEO Otomatis
                </span>
                <p className="text-slate-600">
                  Semua meta title, meta description, kata kunci pencarian, slug, dan alt-text gambar telah dioptimalkan secara otomatis untuk mesin pencari Google dan Blogger.
                </p>
              </div>

              {/* Google SERP Snippet Preview */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Pratinjau Hasil Pencarian Google (SERP):
                </span>
                <div className="font-mono text-[11px] text-slate-500">
                  https://evashop.blogger.com/{article.seo.slug}
                </div>
                <div className="text-base font-bold text-blue-700 hover:underline cursor-pointer">
                  {article.seo.seoTitle}
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {article.seo.metaDescription}
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-700">Primary Keyword:</span>
                  <p className="font-mono text-rose-600 font-bold">{article.seo.primaryKeyword}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-700">Search Intent:</span>
                  <p className="font-semibold text-slate-800">{article.seo.searchIntent}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-700">URL Slug:</span>
                  <p className="font-mono text-slate-800">/{article.seo.slug}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-700">Image Alt-Text:</span>
                  <p className="text-slate-800">{article.seo.imageAltText}</p>
                </div>
              </div>

              {/* Secondary & Long-tail Keywords */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Secondary Keywords:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {article.seo.secondaryKeywords.map((k, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded font-mono text-[11px]">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Long-tail Keywords:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {article.seo.longTailKeywords.map((k, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded font-mono text-[11px]">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Hashtags (5 Buah):</span>
                  <div className="flex flex-wrap gap-1.5 text-rose-600 font-semibold">
                    {article.seo.hashtags.map((h, i) => (
                      <span key={i}>{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: HTML CODE */}
          {viewMode === 'html' && article && !isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  Kode HTML Siap Tempel ke Editor HTML Blogger:
                </span>
                <button
                  onClick={() => handleCopy(article.fullHtml, 'html_code')}
                  type="button"
                  className="text-rose-600 font-bold hover:underline flex items-center gap-1"
                >
                  {copiedType === 'html_code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'html_code' ? 'Kode Tersalin!' : 'Salin Semua HTML'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={18}
                value={article.fullHtml}
                className="w-full p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl border border-slate-800 leading-relaxed"
              />
            </div>
          )}

          {/* VIEW 4: EDIT CONTENT */}
          {viewMode === 'edit' && article && !isLoading && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                ✏️ Anda dapat memodifikasi judul artikel, pendahuluan, atau teks FAQ sebelum mengekspor ke draft Blogger.
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Artikel (H1):</label>
                <input
                  type="text"
                  value={article.title}
                  onChange={(e) => setArticle({ ...article, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pendahuluan:</label>
                <textarea
                  rows={4}
                  value={article.intro}
                  onChange={(e) => setArticle({ ...article, intro: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kenapa Produk Ini Banyak Diminati?</label>
                <textarea
                  rows={4}
                  value={article.whyPopular}
                  onChange={(e) => setArticle({ ...article, whyPopular: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kelebihan Produk:</label>
                <textarea
                  rows={4}
                  value={article.advantages}
                  onChange={(e) => setArticle({ ...article, advantages: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kesimpulan:</label>
                <textarea
                  rows={4}
                  value={article.conclusion}
                  onChange={(e) => setArticle({ ...article, conclusion: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Target Blog:</span>
            {bloggerAuth.isConnected && bloggerAuth.selectedBlog ? (
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                🟢 {bloggerAuth.selectedBlog.name}
              </span>
            ) : (
              <button
                onClick={onOpenBloggerModal}
                type="button"
                className="text-amber-800 font-bold underline hover:text-amber-900"
              >
                🔐 Hubungkan Blogger Terlebih Dahulu
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors"
            >
              Tutup
            </button>

            {/* SECONDARY "SIMPAN SEBAGAI DRAFT" in Footer */}
            <button
              onClick={handleSaveToBloggerDraft}
              disabled={isSavingBlogger || !article}
              type="button"
              className="px-4 py-2 bg-[#8b5a2b] hover:bg-[#734720] text-white font-bold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSavingBlogger ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>🟤 SIMPAN SEBAGAI DRAFT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
