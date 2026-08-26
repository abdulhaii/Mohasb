import React, { useState } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Download,
  Trash2,
  Maximize2,
  RefreshCw,
  Layers,
  Wand2,
  Check,
  AlertCircle
} from 'lucide-react';
import { GeneratedVisual } from '../types';

interface FinancialImageStudioProps {
  visuals: GeneratedVisual[];
  onSaveVisual: (visual: GeneratedVisual) => void;
  onDeleteVisual: (id: string) => void;
}

const TEMPLATE_PROMPTS = [
  {
    title: 'لوحة رؤية الادخار - سيارة الأحلام',
    prompt:
      'A sleek, modern luxury vehicle in a minimalist architectural showroom with warm ambient golden lighting, 3D render, photorealistic, 8k aesthetic, financial success vibe',
    ratio: '16:9',
  },
  {
    title: 'شعار ذهبي لصندوق الطوارئ',
    prompt:
      'A 3D glossy metallic gold and emerald green shield icon representing financial security and emergency savings, minimalist modern flat icon style on a clean light stone background',
    ratio: '1:1',
  },
  {
    title: 'غلاف تقرير المصاريف الشهري',
    prompt:
      'An elegant abstract minimalist background with subtle geometric bar charts, financial growth arrows, modern emerald and warm beige tones, clean typography space',
    ratio: '16:9',
  },
  {
    title: 'أيقونة فئة القهوة والمطاعم الفاخرة',
    prompt:
      'A warm artisan coffee cup with exquisite latte art next to fresh pastries, cozy warm cafe atmosphere, cinematic lighting, 3D modern isometric aesthetic',
    ratio: '1:1',
  },
  {
    title: 'رحلة إجازة الصيف والحرية المالية',
    prompt:
      'A breathtaking tropical beach destination with turquoise water, palm trees, golden sunset, a passport and travel boarding pass on wooden desk, photorealistic vacation dream',
    ratio: '16:9',
  },
];

export const FinancialImageStudio: React.FC<FinancialImageStudioProps> = ({
  visuals,
  onSaveVisual,
  onDeleteVisual,
}) => {
  const [prompt, setPrompt] = useState(TEMPLATE_PROMPTS[0].prompt);
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreviewImage, setActivePreviewImage] = useState<GeneratedVisual | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageSize,
          aspectRatio,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل في توليد الصورة المالية.');
      }

      const newVisual: GeneratedVisual = {
        id: `vis-${Date.now()}`,
        prompt: prompt.trim(),
        imageUrl: data.imageUrl,
        imageSize,
        aspectRatio,
        createdAt: Date.now(),
        title: prompt.slice(0, 40) + '...',
      };

      onSaveVisual(newVisual);
      setActivePreviewImage(newVisual);
    } catch (err: any) {
      console.error('Image gen error:', err);
      setError(err?.message || 'حدث خطأ أثناء توليد الصورة.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `financial-visual-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-zinc-900 to-rose-950/80 border border-amber-800/40 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700/50 text-xs font-black backdrop-blur-md">
              Gemini 3 Pro Image Preview
            </span>
            <span className="text-xs font-bold text-amber-300/80">دقة فائقة (1K, 2K, 4K)</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-100">استوديو الصور والرؤية المالية الذكي</h2>
          <p className="text-xs text-zinc-300 max-w-xl mt-1 font-medium">
            ولد لوحات رؤية لأهداف ادخارك، أيقونات وأغلفة مميزة لفئات مصاريفك، وتصاميم فنية راقية لتقاريرك المحاسبية.
          </p>
        </div>
      </div>

      {/* Generator Controls Card */}
      <div className="bg-[#121214] rounded-3xl p-6 border border-zinc-800/80 shadow-lg shadow-black/20 space-y-5 text-zinc-100">
        
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Prompt Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>اكتب وصف الصورة المالية المطلوبة:</span>
            </label>
            <span className="text-[11px] text-zinc-500 font-semibold">Gemini Pro Image Engine</span>
          </div>

          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="مثال: لوحة ثلاثية الأبعاد تمثل صندوق الاستثمار والأرباح المالية مع عملات ذهبية ونمو متصاعد..."
            className="w-full p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Preset Templates */}
        <div>
          <span className="text-[11px] font-bold text-zinc-400 block mb-2">نماذج جاهزة سريعة:</span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {TEMPLATE_PROMPTS.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(tmpl.prompt);
                  setAspectRatio(tmpl.ratio);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 hover:border-amber-500/50 border border-zinc-700/60 text-zinc-300 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer"
              >
                {tmpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Affordance (1K, 2K, 4K) & Aspect Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
          
          {/* Resolution Selector: 1K, 2K, 4K */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-2">
              دقة وجودة الصورة (Image Size Affordance):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as const).map((size) => {
                const isSelected = imageSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setImageSize(size)}
                    className={`py-2 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-black border-amber-500 shadow-md'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{size}</span>
                    {size === '4K' && <span className="text-[9px] bg-amber-600 text-white px-1 rounded">PRO</span>}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5">
              يدعم النموذج توليد عالي الدقة حتى 4K (4096px)
            </p>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-2">
              نسبة الأبعاد (Aspect Ratio):
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: '1:1', label: '1:1 مربع' },
                { id: '16:9', label: '16:9 عريض' },
                { id: '4:3', label: '4:3 كارت' },
                { id: '3:4', label: '3:4 طولي' },
              ].map((ratio) => {
                const isSelected = aspectRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-xs'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    {ratio.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Generate CTA Button */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-95 active:scale-98 disabled:opacity-50 text-white text-sm font-black shadow-lg shadow-orange-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>جاري توليد الصورة بدقة {imageSize} عبر gemini-3-pro-image-preview...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>توليد الصورة المالية بجودة {imageSize}</span>
            </>
          )}
        </button>
      </div>

      {/* Gallery of Generated Images */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-100">معرض الصور المالية المنشأة ({visuals.length})</h3>
          <span className="text-xs text-zinc-400">احفظها وشاركها في تقاريرك</span>
        </div>

        {visuals.length === 0 ? (
          <div className="bg-[#121214] rounded-3xl p-12 text-center border border-dashed border-zinc-800">
            <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-zinc-200">لا توجد صور منشأة بعد</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              اكتب وصفاً أو اختر نموذجاً من الأعلى واضغط "توليد الصورة المالية" لبدء إنشاء صورك بدقة 1K, 2K, 4K.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visuals.map((vis) => (
              <div
                key={vis.id}
                className="bg-[#121214] rounded-2xl overflow-hidden border border-zinc-800/80 shadow-lg shadow-black/20 hover:border-zinc-700 transition-all group flex flex-col justify-between"
              >
                <div className="relative bg-zinc-900 aspect-video overflow-hidden">
                  <img
                    src={vis.imageUrl}
                    alt={vis.prompt}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-black backdrop-blur-xs">
                      {vis.imageSize}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[10px] font-bold">
                      {vis.aspectRatio}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 space-y-2.5">
                  <p className="text-xs text-zinc-200 font-medium line-clamp-2">{vis.prompt}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 font-semibold">
                      {new Date(vis.createdAt).toLocaleDateString('ar-SA-u-nu-latn')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActivePreviewImage(vis)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                        title="عرض بالحجم الكامل"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDownload(vis.imageUrl, vis.prompt)}
                        className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 transition-colors cursor-pointer"
                        title="تحميل الصورة"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteVisual(vis.id)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Resolution Modal Preview */}
      {activePreviewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl max-w-3xl w-full p-4 overflow-hidden shadow-2xl flex flex-col text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-black text-xs font-black">
                  {activePreviewImage.imageSize} Resolution
                </span>
                <span className="text-xs text-zinc-300 font-medium line-clamp-1">
                  {activePreviewImage.prompt}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleDownload(activePreviewImage.imageUrl, activePreviewImage.prompt)
                  }
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل</span>
                </button>
                <button
                  onClick={() => setActivePreviewImage(null)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>

            <div className="mt-4 max-h-[75vh] overflow-auto flex items-center justify-center bg-black/60 rounded-2xl p-2 border border-zinc-800/80">
              <img
                src={activePreviewImage.imageUrl}
                alt="Full resolution artwork"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
