/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Video, Camera, Film, Sparkles, Copy, Check, RefreshCw, 
  Volume2, PlayCircle, Layers, Clapperboard, Eye, Tv, ArrowRight,
  ShieldCheck, Zap, Info, Smartphone, Monitor, MessageSquareQuote
} from 'lucide-react';
import { VideoScenePrompt, AspectRatioType } from '../../types/videoScenes';
import { 
  createProceduralTvcScenes, 
  generateTvcVideoScenesWithAi,
  ProductCategory,
  ModelMarket,
  ModelType,
  LocationType
} from '../../services/videoScenesGenerator';

interface TvcVideoScenesSectionProps {
  scenes: VideoScenePrompt[];
  category: ProductCategory;
  description: string;
  market: ModelMarket;
  modelType: ModelType;
  location: LocationType;
  productTitle?: string;
  narrative?: string;
  onUpdateScenes?: (newScenes: VideoScenePrompt[]) => void;
}

export const TvcVideoScenesSection: React.FC<TvcVideoScenesSectionProps> = ({
  scenes: initialScenes,
  category,
  description,
  market: initialMarket,
  modelType,
  location,
  productTitle,
  narrative,
  onUpdateScenes
}) => {
  const [activeMarket, setActiveMarket] = useState<ModelMarket>(initialMarket);
  const [activeAspectRatio, setActiveAspectRatio] = useState<AspectRatioType>('9:16');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // Keep local scenes state if regenerated or switched
  const [scenesState, setScenesState] = useState<Record<ModelMarket, VideoScenePrompt[]>>({
    indonesia: initialMarket === 'indonesia' && initialScenes && initialScenes.length === 5 
      ? initialScenes 
      : createProceduralTvcScenes({ category, description, market: 'indonesia', modelType, location, productTitle, narrative }),
    amazon: initialMarket === 'amazon' && initialScenes && initialScenes.length === 5 
      ? initialScenes 
      : createProceduralTvcScenes({ category, description, market: 'amazon', modelType, location, productTitle, narrative })
  });

  const activeScenes = scenesState[activeMarket] && scenesState[activeMarket].length === 5
    ? scenesState[activeMarket]
    : createProceduralTvcScenes({ category, description, market: activeMarket, modelType, location, productTitle, narrative });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getScenePromptForRatio = (scene: VideoScenePrompt, ratio: AspectRatioType) => {
    if (ratio === '9:16') {
      return scene.aiPrompt916 || scene.aiPrompt;
    }
    return scene.aiPrompt169 || scene.aiPrompt;
  };

  const handleCopyAllScenes = () => {
    const isEn = activeMarket === 'amazon';
    const ratioLabel = activeAspectRatio === '9:16' ? '9:16 (Vertical TikTok / Reels / Shorts)' : '16:9 (Widescreen TV / YouTube)';
    const header = isEn 
      ? `=== 30-SECOND PROFESSIONAL TV COMMERCIAL STORYBOARD (DIRECT-TO-CAMERA DIALOGUE) ===\nPRODUCT: ${productTitle || category}\nTARGET: Global / Universal Commercial\nTOTAL DURATION: 30s (5 Continuous Scenes)\nASPECT RATIO: ${ratioLabel}\n=================================================================================\n\n`
      : `=== STORYBOARD 5 ADEGAN IKLAN TELEVISI PROFESIONAL (MODEL BERBICARA LANGSUNG KE KAMERA) ===\nPRODUK: ${productTitle || category}\nTARGET: Shopee Video / TikTok Ads Indonesia\nTOTAL DURASI: 30 Detik (5 Adegan Sinematik)\nRASIO BINGKAI: ${ratioLabel}\n=========================================================================================\n\n`;

    const body = activeScenes.map((s) => {
      const promptText = getScenePromptForRatio(s, activeAspectRatio);
      return `--------------------------------------------------
${s.sceneTitle.toUpperCase()} [${s.duration}]
--------------------------------------------------
🗣️ DIALOG MODEL (LIP-SYNC KE KAMERA):
"${s.spokenDialogue || '-'}"

📷 SISI KAMERA & LENSA: ${s.cameraAngle}
🎬 GERAKAN KAMERA (MOTION): ${s.cameraMotion}
💡 PENCAHAYAAN (LIGHTING): ${s.lightingMood}
✨ AKSI MODEL & PRODUK: ${s.visualAction}
🎵 SFX / AUDIO CUE: ${s.audioCues || '-'}

PROMPT AI VIDEO GENERATOR (${ratioLabel}):
${promptText}
`;
    }).join('\n\n');

    handleCopy(header + body, 'copy-all-scenes');
  };

  const handleRegenerateScenes = async () => {
    setIsRegenerating(true);
    try {
      const newScenes = await generateTvcVideoScenesWithAi({
        category,
        description,
        market: activeMarket,
        modelType,
        location,
        productTitle,
        narrative
      });

      setScenesState(prev => ({
        ...prev,
        [activeMarket]: newScenes
      }));

      if (onUpdateScenes) {
        onUpdateScenes(newScenes);
      }
    } catch (e) {
      console.error("Error regenerating scenes:", e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const isAmazon = activeMarket === 'amazon';

  return (
    <div 
      id="tvc-video-scenes-container"
      className="bg-white rounded-2xl sm:rounded-3xl border border-black/5 p-3.5 sm:p-6 lg:p-8 shadow-sm space-y-4 sm:space-y-6 scroll-mt-20 w-full min-w-0 max-w-full overflow-hidden"
    >
      {/* Header Container */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-black/5 pb-4 sm:pb-5 w-full min-w-0">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0 mt-0.5">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-black/90">
                Prompt 5 Adegan Video Iklan Televisi Profesional (TVC)
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
                30s TVC • Model Bicara Langsung
              </span>
            </div>
            <p className="text-xs text-black/60 mt-1 leading-relaxed">
              Model berbicara langsung menghadap lensa kamera mengucapkan Selling Narrative dengan sinkronisasi bibir alami (lip-sync), dilengkapi pilihan rasio <strong>9:16 (Vertikal)</strong> & <strong>16:9 (Horizontal)</strong>.
            </p>
          </div>
        </div>

        {/* Top Controls: Market Toggle & Master Copy */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto min-w-0">
          {/* Target Market Switcher */}
          <div className="grid grid-cols-2 sm:flex p-1 bg-black/5 rounded-xl sm:rounded-2xl gap-1 w-full sm:w-auto min-w-0">
            <button
              type="button"
              onClick={() => setActiveMarket('indonesia')}
              className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 min-h-[40px] sm:min-h-0 min-w-0 ${
                !isAmazon 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-black/60 hover:text-black'
              }`}
            >
              <span className="shrink-0">🇮🇩</span>
              <span className="truncate">Shopee / TikTok TVC</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMarket('amazon')}
              className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 min-h-[40px] sm:min-h-0 min-w-0 ${
                isAmazon 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'text-black/60 hover:text-black'
              }`}
            >
              <span className="shrink-0">🌐</span>
              <span className="truncate">Universal TVC</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Regenerate Button */}
            <button
              type="button"
              onClick={handleRegenerateScenes}
              disabled={isRegenerating}
              className="flex-1 sm:flex-none p-2 sm:px-3 sm:py-2 text-xs font-bold text-black/70 bg-black/5 hover:bg-black/10 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-black/5 active:scale-95 disabled:opacity-50 min-h-[40px] sm:min-h-0"
              title="Generate ulang variasi sudut kamera & adegan"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-amber-600' : ''}`} />
              <span>{isRegenerating ? 'Membuat...' : 'Variasi Baru'}</span>
            </button>

            {/* Copy All Button */}
            <button
              type="button"
              onClick={handleCopyAllScenes}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-black hover:bg-black/80 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 min-h-[40px] sm:min-h-0"
              title="Salin seluruh 5 naskah adegan dan prompt AI sesuai rasio aktif"
            >
              {copiedKey === 'copy-all-scenes' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Semua Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Semua Adegan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Aspect Ratio Switcher Bar (9:16 vs 16:9) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-slate-100 rounded-2xl border border-amber-200/80 w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              Pilihan Rasio Bingkai Video:
            </span>
            <span className="text-[10px] text-slate-600">
              Sesuaikan format framing prompt untuk AI Generator
            </span>
          </div>
        </div>

        {/* Ratio Toggle Pills */}
        <div className="grid grid-cols-2 sm:flex items-center p-1 bg-white rounded-xl border border-amber-200/70 shadow-xs gap-1 min-w-0">
          <button
            type="button"
            onClick={() => setActiveAspectRatio('9:16')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[36px] sm:min-h-0 min-w-0 ${
              activeAspectRatio === '9:16'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Vertikal 9:16</span>
            <span className={`text-[9px] px-1 py-0.2 rounded font-extrabold shrink-0 hidden sm:inline ${
              activeAspectRatio === '9:16' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              Reels / TikTok
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAspectRatio('16:9')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[36px] sm:min-h-0 min-w-0 ${
              activeAspectRatio === '16:9'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Horizontal 16:9</span>
            <span className={`text-[9px] px-1 py-0.2 rounded font-extrabold shrink-0 hidden sm:inline ${
              activeAspectRatio === '16:9' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              TV / YouTube
            </span>
          </button>
        </div>
      </div>

      {/* Storyboard Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none w-full min-w-0 max-w-full">
        <span className="text-[11px] font-bold text-black/40 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Film className="w-3.5 h-3.5 text-amber-600" /> Alur 5 Adegan:
        </span>
        {activeScenes.map((s) => (
          <a
            key={s.sceneNumber}
            href={`#scene-card-${s.sceneNumber}`}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200/80 hover:border-amber-300 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors shrink-0"
          >
            <span className="font-bold text-amber-700">0{s.sceneNumber}</span> {s.duration.split(' ')[0]}
          </a>
        ))}
      </div>

      {/* 5 Storyboard Scene Cards */}
      <div className="space-y-4 sm:space-y-6 w-full min-w-0">
        {activeScenes.map((scene) => {
          const currentPrompt = getScenePromptForRatio(scene, activeAspectRatio);
          const sceneCopyKey = `scene-prompt-${activeMarket}-${scene.sceneNumber}-${activeAspectRatio}`;
          const isCopied = copiedKey === sceneCopyKey;
          const dialogueCopyKey = `dialogue-${activeMarket}-${scene.sceneNumber}`;
          const isDialogueCopied = copiedKey === dialogueCopyKey;

          return (
            <div
              key={scene.sceneNumber}
              id={`scene-card-${scene.sceneNumber}`}
              className="rounded-2xl border border-black/10 bg-[#FAFBFD] p-3.5 sm:p-6 transition-all hover:border-amber-300/80 hover:shadow-md space-y-3.5 sm:space-y-4 relative group w-full min-w-0 max-w-full overflow-hidden"
            >
              {/* Scene Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-black/5 pb-3">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-black text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    0{scene.sceneNumber}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-black/90 leading-tight">
                      {scene.sceneTitle}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                  <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-900 font-mono text-[11px] font-bold shrink-0">
                    ⏱ {scene.duration}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentPrompt, sceneCopyKey)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-xs active:scale-95 min-h-[36px] ${
                      isCopied
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white hover:bg-amber-50 text-black/80 hover:text-amber-900 border-black/10'
                    }`}
                    title={`Salin Prompt AI Video untuk adegan ini (${activeAspectRatio})`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Prompt Tersalin!' : `Copy Prompt ${activeAspectRatio}`}</span>
                  </button>
                </div>
              </div>

              {/* Direct-to-Camera Spoken Dialogue Box */}
              {scene.spokenDialogue && (
                <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white rounded-xl border border-emerald-300/80 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <MessageSquareQuote className="w-4 h-4 text-emerald-600" />
                      Naskah Dialog Model (Diucapkan Langsung ke Kamera):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(scene.spokenDialogue!, dialogueCopyKey)}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 px-2 py-0.5 bg-white rounded-md border border-emerald-200 active:scale-95 transition-all"
                      title="Salin kalimat naskah dialog ini"
                    >
                      {isDialogueCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{isDialogueCopied ? 'Tersalin' : 'Salin Dialog'}</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-emerald-950 leading-relaxed italic bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                    "{scene.spokenDialogue}"
                  </p>
                </div>
              )}

              {/* Technical Cinematography Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 text-xs">
                {/* Camera Angle & Lens */}
                <div className="p-3 bg-white rounded-xl border border-black/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-600" />
                    Sisi Kamera & Lensa
                  </span>
                  <p className="font-semibold text-slate-800 leading-snug">
                    {scene.cameraAngle}
                  </p>
                </div>

                {/* Camera Motion */}
                <div className="p-3 bg-white rounded-xl border border-black/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-blue-600" />
                    Gerakan Kamera (Motion)
                  </span>
                  <p className="font-semibold text-slate-800 leading-snug">
                    {scene.cameraMotion}
                  </p>
                </div>

                {/* Lighting & Mood */}
                <div className="p-3 bg-white rounded-xl border border-black/5 space-y-1 sm:col-span-2 lg:col-span-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Pencahayaan & Suasana
                  </span>
                  <p className="font-semibold text-slate-800 leading-snug">
                    {scene.lightingMood}
                  </p>
                </div>
              </div>

              {/* Visual Action & Product Presentation */}
              <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/60 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5 text-amber-600" />
                  Aksi Model & Interaksi Produk (Visual Story)
                </span>
                <p className="text-slate-800 leading-relaxed font-normal text-xs sm:text-sm">
                  {scene.visualAction}
                </p>
                {scene.audioCues && (
                  <div className="pt-1.5 mt-1.5 border-t border-amber-200/40 flex items-start gap-1.5 text-[11px] text-amber-950/75">
                    <Volume2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span><strong className="text-amber-900">Audio / SFX Cue:</strong> {scene.audioCues}</span>
                  </div>
                )}
              </div>

              {/* Master Prompt for AI Video Generator (Runway / Sora / Kling) */}
              <div className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      Prompt AI Video Generator:
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                      activeAspectRatio === '9:16'
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-blue-50 text-blue-900 border-blue-200'
                    }`}>
                      {activeAspectRatio === '9:16' ? '📱 Rasio Vertikal 9:16' : '📺 Rasio Horizontal 16:9'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveAspectRatio('9:16')}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                        activeAspectRatio === '9:16'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      9:16
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAspectRatio('16:9')}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                        activeAspectRatio === '16:9'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      16:9
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <pre className="p-3 sm:p-3.5 bg-[#0F172A] text-slate-200 rounded-xl text-xs font-mono leading-relaxed whitespace-pre-wrap break-words select-all border border-slate-800 max-h-52 overflow-y-auto">
                    {currentPrompt}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pro Tips Footer Box */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <Tv className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h5 className="font-bold text-amber-950 text-xs">
              Panduan Praktis Pembuatan Video Iklan Televisi dengan Model Berbicara (Lip-Sync AI)
            </h5>
            <p className="text-[11px] text-amber-900/80 leading-relaxed mt-0.5">
              Untuk hasil video lip-sync paling presisi di <strong>Runway Gen-3 Alpha</strong>, <strong>Kling AI</strong>, atau <strong>Luma Dream Machine</strong>, gunakan rasio <strong>9:16</strong> untuk platform mobile (Shopee/TikTok/Reels) atau <strong>16:9</strong> untuk iklan televisi/YouTube, lalu upload foto hasil generate model di atas sebagai <em>First Frame (Image-to-Video)</em>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyAllScenes}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 min-h-[40px]"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Salin 5 Prompt ({activeAspectRatio})</span>
        </button>
      </div>
    </div>
  );
};
