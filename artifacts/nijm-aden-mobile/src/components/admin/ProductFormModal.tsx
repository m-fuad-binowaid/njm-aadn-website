import React, { useState } from 'react';
import { X, Image as ImageIcon, Check, Sparkles, BatteryCharging, ShieldAlert } from 'lucide-react';
import type { CatalogProduct, ProductCategory, ProductCondition } from '@/data/catalog';
import { ProductImageUploader } from './ProductImageUploader';

interface ProductFormModalProps {
  initialProduct?: CatalogProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<CatalogProduct>) => void;
}

const CATEGORIES: ProductCategory[] = [
  'هواتف آيفون',
  'أجهزة مستعملة ونظيفة',
  'سامسونج',
  'سماعات وساعات',
  'إكسسوارات وحماية',
];

const PRESET_CAPACITIES = ['128GB', '256GB', '512GB', '1TB'];

const PRESET_IMAGES = [
  { label: 'آيفون عنابي ملكي', url: '/logo3.jpg' },
  { label: 'بوكس التغليف الفاخر', url: '/packaging.jpg' },
  { label: 'آيفون أزرق تيتانيوم', url: '/assets/hero-iphone.png' },
  { label: 'سامسونج S24 ألترا', url: '/assets/samsung-s24.jpeg' },
  { label: 'شاحن وكابل أبل', url: '/assets/charger.jpeg' },
  { label: 'سماعات جوي روم برو', url: '/assets/joyroom.jpeg' },
  { label: 'كفر MagSafe حماية', url: '/assets/camera-control.jpeg' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  initialProduct,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(initialProduct);

  const [title, setTitle] = useState(initialProduct?.title || '');
  const [subtitle, setSubtitle] = useState(initialProduct?.subtitle || '');
  const [category, setCategory] = useState<ProductCategory>(
    initialProduct?.category || 'هواتف آيفون'
  );
  const [condition, setCondition] = useState<ProductCondition>(
    initialProduct?.condition || 'جديد كرتون'
  );
  const [batteryHealth, setBatteryHealth] = useState(
    initialProduct?.batteryHealth || '100%'
  );
  const [capacities, setCapacities] = useState<string[]>(
    initialProduct?.capacities || ['256GB', '512GB']
  );
  const [imageUrl, setImageUrl] = useState(
    initialProduct?.images?.[0] || '/logo3.jpg'
  );
  const [color, setColor] = useState(initialProduct?.color || 'تيتانيوم طبيعي');
  const [warrantyText, setWarrantyText] = useState(
    initialProduct?.specs?.[3] || 'ضمان فحص وتجربة 7 أيام معتمد'
  );
  const [availability, setAvailability] = useState(
    initialProduct?.availability || 'متوفر بالمعرض'
  );
  const [priceText, setPriceText] = useState(
    initialProduct?.priceText || 'تسعير فوري بالواتساب'
  );
  const [badge, setBadge] = useState(initialProduct?.badge || '');

  // Validation
  const [error, setError] = useState('');

  const toggleCapacity = (cap: string) => {
    if (capacities.includes(cap)) {
      if (capacities.length > 1) {
        setCapacities(capacities.filter((c) => c !== cap));
      }
    } else {
      setCapacities([...capacities, cap]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('يرجى إدخال اسم الجهاز');
      return;
    }

    const payload: Partial<CatalogProduct> = {
      title: title.trim(),
      subtitle: subtitle.trim() || 'جهاز أصلي معتمد مع ضمان نجم عدن',
      category,
      condition,
      batteryHealth: condition.includes('مستخدم') ? batteryHealth : '100%',
      capacities,
      defaultCapacity: capacities[0] || '256GB',
      color: color.trim() || 'أصلي',
      images: [imageUrl.trim() || '/logo3.jpg'],
      availability,
      priceText: priceText.trim() || 'تسعير فوري بالواتساب',
      badge: badge.trim() || undefined,
      specs: [
        'فحص تقني معتمد شامل',
        condition.includes('جديد') ? 'جديد كرتون وكالة' : `صحة البطارية: ${batteryHealth}`,
        'تغليف ملكي مع كارت الضمان',
        warrantyText.trim() || 'ضمان تجربة 7 أيام',
      ],
    };

    onSave(payload);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/85 p-0 sm:p-4 backdrop-blur-md overflow-y-auto"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-slate-800 bg-[#0F131C] text-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-[#0F131C]/95 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]">
              <Sparkles size={16} />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {isEditing ? 'تعديل بيانات الجهاز' : 'إضافة جهاز جديد للمخزون'}
              </h3>
              <p className="text-[11px] text-slate-400">
                يتم تحديث المخزون والمتجر المباشر فور حفظ التغييرات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="إغلاق"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-950/40 p-3 text-xs text-red-200">
              <ShieldAlert size={16} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Segment 1: Name and Subtitle */}
          <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-[#141A26]/60 p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                اسم الجهاز / الموديل <span className="text-red-400">*</span>
              </label>
              <span className="text-[10px] text-slate-500">مثال: آيفون 16 برو ماكس</span>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="مثال: آيفون 16 برو ماكس عنابي"
              className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            />

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                الوصف التعريفي المختصر
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="مثال: كرتون جديد بلون التيتانيوم الطبيعي وضمان 7 أيام"
                className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* Segment 2: Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#141A26]/60 p-4">
              <label className="text-xs font-bold text-slate-300 block mb-2">
                التصنيف في الكتالوج
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2.5 text-xs font-bold text-white focus:border-[#D4AF37] focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Pills */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#141A26]/60 p-4">
              <label className="text-xs font-bold text-slate-300 block mb-2">
                حالة الجهاز
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['جديد كرتون', 'مستخدم نظيف'] as ProductCondition[]).map((cond) => {
                  const isSelected = condition === cond;
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setCondition(cond)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#FFF3C4]'
                          : 'border-slate-800 bg-[#0B0F17] text-slate-400 hover:text-white'
                      }`}
                    >
                      {isSelected && <Check size={12} className="text-[#D4AF37]" />}
                      <span>{cond}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Segment 3: Battery Health (Conditional on 'مستخدم نظيف') */}
          {condition.includes('مستخدم') && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-2">
                <BatteryCharging size={16} className="text-[#D4AF37]" />
                <label className="text-xs font-bold text-[#FFF3C4]">
                  نسبة صحة البطارية للأجهزة المستعملة
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={batteryHealth}
                  onChange={(e) => setBatteryHealth(e.target.value)}
                  placeholder="مثال: 98% أو 100%"
                  className="w-36 rounded-xl border border-amber-500/40 bg-[#0B0F17] px-3.5 py-2 text-xs font-bold text-white focus:border-[#D4AF37] focus:outline-none"
                />
                <span className="text-[11px] text-amber-200/80">
                  تظهر مباشرة في شارة بطاقة الجهاز لتعزيز ثقة العميل
                </span>
              </div>
            </div>
          )}

          {/* Segment 4: Storage Capacities Multi-Select */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#141A26]/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300">
                السعات التخزينية المتاحة
              </label>
              <span className="text-[10px] text-slate-500">اختر السعات المتوفرة لهذا الموديل</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_CAPACITIES.map((cap) => {
                const isSelected = capacities.includes(cap);
                return (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => toggleCapacity(cap)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-[#0A0D14] shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                        : 'border-slate-700/80 bg-[#0B0F17] text-slate-400 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check size={12} />}
                    <span>{cap}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Segment 5: Luxury Dual Image Input (Local File Upload & URL Fallback) */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#141A26]/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                صورة الجهاز <span className="text-[#D4AF37]">(رفع مباشر من الجهاز أو رابط)</span>
              </label>
              <span className="text-[10px] text-slate-500">
                تظهر في الكتالوج والسلة ونافذة الاستفسار
              </span>
            </div>

            <ProductImageUploader
              value={imageUrl}
              onChange={(newUrl) => setImageUrl(newUrl)}
              presetImages={PRESET_IMAGES}
            />
          </div>

          {/* Segment 6: Color, Warranty & Price Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800/80 bg-[#141A26]/60 p-4">
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                اللون الرسمي للجهاز
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="مثال: عنابي ملكي، تيتانيوم أسود"
                className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-[#141A26]/60 p-4">
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                شارة خاصة (Badge)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="مثال: جديد كرتون، حصري، لقطة"
                className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800/80 bg-[#141A26]/60 p-4">
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                نص بند الضمان
              </label>
              <input
                type="text"
                value={warrantyText}
                onChange={(e) => setWarrantyText(e.target.value)}
                placeholder="مثال: ضمان فحص وتجربة 7 أيام معتمد"
                className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-[#141A26]/60 p-4">
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                حالة التوفر الفوري
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2 text-xs font-bold text-white focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="متوفر بالمعرض">متوفر بالمعرض (In Stock)</option>
                <option value="متوفر حبة واحدة فقط">متوفر حبة واحدة فقط (Low Stock)</option>
                <option value="متوفر بكميات">متوفر بكميات (High Stock)</option>
                <option value="نفذت الكمية">نفذت الكمية (Out of Stock)</option>
              </select>
            </div>
          </div>
        </form>

        {/* Sticky Modal Footer */}
        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-slate-800 bg-[#0F131C] px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5B869] px-6 py-2.5 text-xs font-black text-[#0A0D14] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all active:scale-95"
          >
            <Check size={14} />
            <span>{isEditing ? 'حفظ التغييرات' : 'إضافة الجهاز الآن'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
