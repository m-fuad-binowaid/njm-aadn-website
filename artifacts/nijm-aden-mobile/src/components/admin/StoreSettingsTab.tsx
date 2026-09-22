import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  Megaphone,
  KeyRound,
  Save,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useCatalog } from '@/context/CatalogContext';
import { DEFAULT_STORE_SETTINGS, type StoreSettings } from '@/types/admin';

export const StoreSettingsTab: React.FC = () => {
  const { settings, updateSettings, resetToDefaults } = useCatalog();
  const [formState, setFormState] = useState<StoreSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'هل أنت متأكد من رغبتك في استعادة الإعدادات الأصلية الافتراضية للمتجر؟'
      )
    ) {
      setFormState({ ...DEFAULT_STORE_SETTINGS });
      resetToDefaults();
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Info */}
      <div className="rounded-2xl border border-slate-800 bg-[#121722]/80 p-5 backdrop-blur-md">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <MessageCircle className="text-[#25D366]" size={20} />
          <span>إعدادات التواصل والمتجر المباشر</span>
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          تحكم في أرقام الواتساب المخصصة للاستفسارات، شريط الإعلانات العلوي، وعنوان المعرض وساعات العمل دون الحاجة لتعديل الكود البرمجي.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* WhatsApp & Call Channels */}
        <div className="rounded-2xl border border-slate-800 bg-[#121722]/80 p-5 space-y-4">
          <h3 className="text-sm font-black text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <MessageCircle className="text-[#25D366]" size={16} />
            <span>قنوات الواتساب والمبيعات المباشرة</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                رقم الواتساب الرئيسي (للاستفسار الفوري عن جهاز مفرد)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formState.whatsapp1}
                  onChange={(e) =>
                    setFormState({ ...formState, whatsapp1: e.target.value })
                  }
                  placeholder="96777887578"
                  className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                تأكد من كتابة مفتاح الدولة كاملاً (مثال: 96777887578)
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                رقم الواتساب الثاني (لسلة الطلبات المتعددة)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formState.whatsapp2}
                  onChange={(e) =>
                    setFormState({ ...formState, whatsapp2: e.target.value })
                  }
                  placeholder="96777883537"
                  className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                مخصص لاستقبال استفسارات السلة المتكاملة وقسم المبيعات
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Phone size={13} className="text-[#D4AF37]" />
                <span>رقم الاتصال المباشر 1</span>
              </label>
              <input
                type="text"
                value={formState.phone1}
                onChange={(e) =>
                  setFormState({ ...formState, phone1: e.target.value })
                }
                placeholder="77887578"
                className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Phone size={13} className="text-[#D4AF37]" />
                <span>رقم الاتصال المباشر 2</span>
              </label>
              <input
                type="text"
                value={formState.phone2}
                onChange={(e) =>
                  setFormState({ ...formState, phone2: e.target.value })
                }
                placeholder="77883537"
                className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Announcement & Working Info */}
        <div className="rounded-2xl border border-slate-800 bg-[#121722]/80 p-5 space-y-4">
          <h3 className="text-sm font-black text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Megaphone className="text-[#D4AF37]" size={16} />
            <span>شريط الإعلانات العلوي ومعلومات المعرض</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              نص شريط الإعلانات في أعلى الصفحة
            </label>
            <input
              type="text"
              value={formState.announcementText}
              onChange={(e) =>
                setFormState({ ...formState, announcementText: e.target.value })
              }
              placeholder="أجهزة أصلية معتمدة • فحص 30 نقطة • ردسي مول - عدن"
              className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <MapPin size={13} className="text-[#D4AF37]" />
                <span>عنوان المعرض الفعلي</span>
              </label>
              <input
                type="text"
                value={formState.location}
                onChange={(e) =>
                  setFormState({ ...formState, location: e.target.value })
                }
                placeholder="عدن - جولة كالتكس - ردسي مول - البوابة الرئيسية"
                className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Clock size={13} className="text-[#D4AF37]" />
                <span>ساعات وأوقات العمل</span>
              </label>
              <input
                type="text"
                value={formState.workingHours}
                onChange={(e) =>
                  setFormState({ ...formState, workingHours: e.target.value })
                }
                placeholder="يومياً من 9:00 صباحاً حتى 11:00 مساءً"
                className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Security / PIN change */}
        <div className="rounded-2xl border border-slate-800 bg-[#121722]/80 p-5 space-y-4">
          <h3 className="text-sm font-black text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <KeyRound className="text-[#D4AF37]" size={16} />
            <span>رمز الدخول السري للوحة الإدارة (PIN)</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                رمز المرور المكون من 4 أرقام
              </label>
              <input
                type="text"
                maxLength={4}
                value={formState.adminPin}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    adminPin: e.target.value.replace(/\D/g, '').slice(0, 4),
                  })
                }
                placeholder="2026"
                className="w-40 rounded-xl border border-slate-700/80 bg-[#0B0F17] px-3.5 py-2 text-center text-sm font-mono tracking-widest text-[#D4AF37] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 sm:mt-5">
              هذا الرمز يُطلب دائماً عند الضغط على رمز القفل أو الدخول إلى صفحة الإدارة.
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-400 transition-colors py-2 px-3 rounded-lg hover:bg-slate-800/40"
          >
            <RotateCcw size={14} />
            <span>استعادة الإعدادات الافتراضية للمتجر</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5B869] px-7 py-3 text-xs sm:text-sm font-black text-[#0A0D14] shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] active:scale-95 transition-all"
          >
            {isSaved ? (
              <>
                <CheckCircle2 size={16} />
                <span>تم الحفظ والمزامنة!</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>حفظ التغييرات في المتجر</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
