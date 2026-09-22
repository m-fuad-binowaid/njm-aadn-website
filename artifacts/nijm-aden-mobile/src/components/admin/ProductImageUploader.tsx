import React, { useState, useRef } from 'react';
import { resolveImagePath } from '@/lib/utils';
import {
  UploadCloud,
  Camera,
  Trash2,
  RefreshCw,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from 'lucide-react';

interface ProductImageUploaderProps {
  value: string;
  onChange: (imageUrl: string) => void;
  presetImages?: Array<{ label: string; url: string }>;
}

const DEFAULT_PRESETS = [
  { label: 'آيفون عنابي ملكي', url: '/logo3.jpg' },
  { label: 'بوكس التغليف الفاخر', url: '/packaging.jpg' },
  { label: 'آيفون أزرق تيتانيوم', url: '/assets/hero-iphone.png' },
  { label: 'سامسونج S24 ألترا', url: '/assets/samsung-s24.jpeg' },
  { label: 'شاحن وكابل أبل', url: '/assets/charger.jpeg' },
  { label: 'سماعات جوي روم برو', url: '/assets/joyroom.jpeg' },
  { label: 'كفر MagSafe حماية', url: '/assets/camera-control.jpeg' },
];

/**
 * Optimizes an image file to a crisp, high-resolution Base64 data URL.
 * Automatically downscales ultra-large mobile camera photos (e.g. 10MB) to safe dimensions
 * so they fit effortlessly in browser localStorage while maintaining retina crispness.
 */
function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG, WebP)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const dataUrl = readerEvent.target?.result as string;
      if (!dataUrl) {
        reject(new Error('تعذرت قراءة الصورة من الجهاز'));
        return;
      }

      // If file is already lightweight (< 350KB), resolve directly
      if (file.size < 350 * 1024) {
        resolve(dataUrl);
        return;
      }

      // Optimize using off-screen HTML5 canvas to keep localStorage well within quotas
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('حدث خطأ أثناء قراءة ملف الصورة'));
    reader.readAsDataURL(file);
  });
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  value,
  onChange,
  presetImages = DEFAULT_PRESETS,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasImage = Boolean(value && value.trim().length > 0);
  const isBase64 = value?.startsWith('data:image/');

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const dataUrl = await processImageFile(file);
      onChange(dataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل تحميل الصورة من جهازك');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    onChange('');
    setErrorMessage('');
  };

  return (
    <div className="space-y-3" dir="rtl">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg,image/heic"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/30 p-2.5 text-xs text-red-200 animate-in fade-in">
          <AlertCircle size={15} className="text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Real-Time Image Preview Pad (When an image exists) */}
      {hasImage ? (
        <div className="space-y-2">
          <div className="group relative h-48 w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#181F2E]/60 p-3 shadow-inner flex items-center justify-center transition-all hover:border-slate-700">
            {/* Ambient gold glow behind image */}
            <div className="absolute inset-0 bg-radial from-[#D4AF37]/5 via-transparent to-transparent opacity-60 pointer-events-none" />

            {/* The Image Itself */}
            <img
              src={resolveImagePath(value)}
              alt="معاينة جهاز نجم عدن"
              className="relative z-10 max-h-full max-w-full object-contain mx-auto transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = resolveImagePath('/logo3.jpg');
              }}
            />

            {/* Top Overlay Actions Bar */}
            <div className="absolute top-2.5 inset-x-2.5 z-20 flex items-center justify-between pointer-events-none">
              {/* Image Type Tag */}
              <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-[#0A0D14]/85 px-2.5 py-1 text-[10px] font-bold text-slate-300 backdrop-blur-md border border-slate-800/80">
                {isBase64 ? (
                  <>
                    <Camera size={11} className="text-[#D4AF37]" />
                    <span className="text-[#FFF3C4]">صورة مرفوعة من جهازك</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={11} className="text-[#D4AF37]" />
                    <span>رابط / صورة جاهزة</span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pointer-events-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  title="تغيير الصورة من الجهاز"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-[#0F131C]/90 px-3 py-1.5 text-[11px] font-bold text-slate-200 backdrop-blur-md hover:border-[#D4AF37] hover:text-[#FFF3C4] hover:bg-[#161D2A] transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <RefreshCw size={12} className="text-[#D4AF37]" />
                  <span>تغيير الصورة</span>
                </button>

                <button
                  type="button"
                  onClick={clearImage}
                  title="إزالة الصورة"
                  className="grid h-7 w-7 place-items-center rounded-xl border border-red-500/40 bg-red-950/80 text-red-300 backdrop-blur-md hover:bg-red-900 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Loading Indicator when processing replacement */}
            {isProcessing && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FFF3C4]">
                  <RefreshCw size={16} className="animate-spin text-[#D4AF37]" />
                  <span>جاري معالجة الصورة وتحسينها...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 2. Drag & Drop File Selector Dropzone (When no image is selected) */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_25px_rgba(212,175,55,0.25)] scale-[0.99]'
              : 'border-slate-700/80 bg-[#121722]/70 hover:border-[#D4AF37]/70 hover:bg-[#151D2C]'
          }`}
        >
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute inset-0 bg-radial from-[#D4AF37]/5 via-transparent to-transparent opacity-40 pointer-events-none rounded-2xl" />

          {/* Upload Icon Container */}
          <div
            className={`mb-3 grid h-14 w-14 place-items-center rounded-2xl border transition-all duration-200 ${
              isDragging
                ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#FFF3C4] scale-110 shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                : 'border-slate-700 bg-[#0F1420] text-[#D4AF37] group-hover:border-[#D4AF37]/50 group-hover:scale-105'
            }`}
          >
            {isProcessing ? (
              <RefreshCw size={24} className="animate-spin text-[#D4AF37]" />
            ) : (
              <UploadCloud size={26} />
            )}
          </div>

          {/* Guidance Copy */}
          <h4 className="text-xs sm:text-sm font-bold text-white mb-1">
            اسحب الصورة وأفلتها هنا، أو اضغط للاختيار من جهازك
          </h4>
          <p className="text-[11px] text-slate-400 mb-3">
            يدعم جميع الصيغ: PNG, JPG, WebP (يتم الحفظ الفوري في ذاكرة المتجر)
          </p>

          {/* Luxury Gold Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerFileInput();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5B869] px-4 py-2 text-xs font-black text-[#0A0D14] shadow-[0_2px_12px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_20px_rgba(212,175,55,0.5)] active:scale-95 transition-all cursor-pointer"
          >
            <Camera size={14} />
            <span>+ اختر صورة من جهازك</span>
          </button>
        </div>
      )}

      {/* 3. Secondary Mode: Expandable Preset & Direct URL Fallback */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0F131C]/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowUrlFallback(!showUrlFallback)}
          className="flex w-full items-center justify-between px-3.5 py-2 text-right text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <LinkIcon size={12} className="text-[#D4AF37]" />
            <span>قوالب صور جاهزة أو رابط مباشر (اختياري)</span>
          </span>
          <span className="text-slate-500">
            {showUrlFallback ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>

        {showUrlFallback && (
          <div className="p-3.5 pt-1 space-y-3 border-t border-slate-800/60 bg-[#0B0F17]/70 animate-in fade-in duration-150">
            {/* Quick Presets */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                اختر قالباً جاهزاً من مكتبة المتجر:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presetImages.map((preset) => {
                  const isSelected = value === preset.url;
                  return (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => onChange(preset.url)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#FFF3C4]'
                          : 'border-slate-800 bg-[#121722] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check size={10} className="text-[#D4AF37]" />}
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom URL Input */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                أو أدخل رابطاً مباشراً للصورة (URL / Path):
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={value?.startsWith('data:') ? '' : value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="/logo3.jpg أو https://..."
                  className="w-full rounded-xl border border-slate-800 bg-[#121722] px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
