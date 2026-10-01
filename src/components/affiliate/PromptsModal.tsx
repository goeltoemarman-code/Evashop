import React, { useState } from 'react';
import { 
  X, Image as ImageIcon, Video, Copy, Check, Sparkles, ArrowRight, Lightbulb 
} from 'lucide-react';
import { ShopeeProduct, FashionImagePrompt, FashionVideoPrompt } from '../../types/affiliate';
import { generateFashionImagePrompt, generateFashionVideoPrompt } from '../../services/geminiResearch';

interface PromptsModalProps {
  product: ShopeeProduct | null;
  initialType: 'image' | 'video';
  onSendToUgcStudio: (product: ShopeeProduct, promptOverride?: string) => void;
  onClose: () => void;
}

export const PromptsModal: React.FC<PromptsModalProps> = ({
  product,
  initialType,
  onSendToUgcStudio,
  onClose,
}) => {
  if (!product) return null;

  const [activeTab, setActiveTab] = useState<'image' | 'video'>(initialType);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const imagePromptData: FashionImagePrompt = generateFashionImagePrompt(product);
  const videoPromptData: FashionVideoPrompt = generateFashionVideoPrompt(product);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50 to-white">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              {product.category}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
              {product.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('image')}
            type="button"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'image'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>19. Prompt Gambar Produk</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            type="button"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'video'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>20. Prompt Video (5s / 10s / 15s)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: IMAGE PROMPTS */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <span className="font-bold text-blue-900 block text-xs">
                  Format Standar Fashion Eva Shop:
                </span>
                <p className="text-blue-800 leading-relaxed text-[11px]">
                  FULL BODY • REALISTIC • NATURAL LIGHTING • HIGH DETAIL • FASHION PHOTOGRAPHY • PRODUCT ACCURACY
                </p>
              </div>

              {/* Master Prompt Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wide">
                    Master Fashion Prompt:
                  </span>
                  <button
                    onClick={() => handleCopy(imagePromptData.prompt, 'img_master')}
                    type="button"
                    className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-semibold"
                  >
                    {copiedKey === 'img_master' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'img_master' ? 'Tersalin' : 'Salin Prompt'}</span>
                  </button>
                </div>
                <p className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-slate-700 leading-relaxed text-[11px] select-all">
                  {imagePromptData.prompt}
                </p>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block">Rasio Aspek Direkomendasikan:</span>
                  <span className="font-bold text-slate-800">{imagePromptData.aspectRatio}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block">Pencahayaan:</span>
                  <span className="font-bold text-slate-800">{imagePromptData.lighting}</span>
                </div>
              </div>

              {/* Action Button: Send to UGC Studio */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onSendToUgcStudio(product, imagePromptData.prompt);
                    onClose();
                  }}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Foto Langsung di Eva UGC Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VIDEO PROMPTS */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                <span className="font-bold text-purple-900 block text-xs">
                  Prompt Video AI (Sora, Runway Gen-2, Kling, Luma):
                </span>
                <p className="text-purple-800 leading-relaxed text-[11px]">
                  Fokus pada gerakan model realistis: berjalan mendekat, putar badan 360°, sentuh tekstur kain, dan senyum natural.
                </p>
              </div>

              {/* 5s */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase">⏱️ 5 Detik (Hook &amp; Front Silhouette):</span>
                  <button
                    onClick={() => handleCopy(videoPromptData.duration5s, 'vid_5')}
                    type="button"
                    className="flex items-center gap-1 text-slate-600 hover:text-purple-600 font-semibold"
                  >
                    {copiedKey === 'vid_5' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Salin</span>
                  </button>
                </div>
                <p className="font-mono text-slate-700 text-[11px] leading-relaxed p-2 bg-white rounded border border-slate-200">
                  {videoPromptData.duration5s}
                </p>
              </div>

              {/* 10s */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase">⏱️ 10 Detik (Fabric Touch &amp; Detail):</span>
                  <button
                    onClick={() => handleCopy(videoPromptData.duration10s, 'vid_10')}
                    type="button"
                    className="flex items-center gap-1 text-slate-600 hover:text-purple-600 font-semibold"
                  >
                    {copiedKey === 'vid_10' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Salin</span>
                  </button>
                </div>
                <p className="font-mono text-slate-700 text-[11px] leading-relaxed p-2 bg-white rounded border border-slate-200">
                  {videoPromptData.duration10s}
                </p>
              </div>

              {/* 15s */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase">⏱️ 15 Detik (Full Spin &amp; Motion Try-On):</span>
                  <button
                    onClick={() => handleCopy(videoPromptData.duration15s, 'vid_15')}
                    type="button"
                    className="flex items-center gap-1 text-slate-600 hover:text-purple-600 font-semibold"
                  >
                    {copiedKey === 'vid_15' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Salin</span>
                  </button>
                </div>
                <p className="font-mono text-slate-700 text-[11px] leading-relaxed p-2 bg-white rounded border border-slate-200">
                  {videoPromptData.duration15s}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
