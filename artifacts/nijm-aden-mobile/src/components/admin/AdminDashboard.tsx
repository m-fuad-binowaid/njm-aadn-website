import React, { useState, useMemo } from 'react';
import {
  Package,
  CheckCircle,
  BatteryCharging,
  AlertTriangle,
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  ArrowUpRight,
  SlidersHorizontal,
  RefreshCw,
  LogOut,
  Layers,
  Settings,
  X,
  ExternalLink,
} from 'lucide-react';
import { useCatalog } from '@/context/CatalogContext';
import { ProductFormModal } from './ProductFormModal';
import { StoreSettingsTab } from './StoreSettingsTab';
import type { CatalogProduct, ProductCategory } from '@/data/catalog';

interface AdminDashboardProps {
  onExitToStore: () => void;
  onLockSession: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onExitToStore,
  onLockSession,
}) => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleStock,
    exportCatalogJson,
    resetToDefaults,
  } = useCatalog();

  // Active view tab in admin: 'inventory' | 'settings'
  const [activeTab, setActiveTab] = useState<'inventory' | 'settings'>('inventory');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);

  // Delete guardrail modal state
  const [productToDelete, setProductToDelete] = useState<CatalogProduct | null>(null);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.color.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'الكل' ||
        (selectedCategory === 'آيفون' && p.category.includes('آيفون')) ||
        (selectedCategory === 'سامسونج' && p.category.includes('سامسونج')) ||
        (selectedCategory === 'مستعمل ونظيف' &&
          (p.category.includes('مستعمل') || p.condition.includes('مستخدم'))) ||
        (selectedCategory === 'إكسسوارات' &&
          (p.category.includes('إكسسوارات') || p.category.includes('سماعات'))) ||
        p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // KPI Calculations
  const totalCount = products.length;
  const inStockCount = products.filter(
    (p) => !p.availability.includes('نفذت')
  ).length;
  const certifiedPreOwnedCount = products.filter((p) =>
    p.condition.includes('مستخدم')
  ).length;
  const outOfStockCount = products.filter((p) =>
    p.availability.includes('نفذت')
  ).length;

  // Handle open add modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (prod: CatalogProduct) => {
    setEditingProduct(prod);
    setIsFormModalOpen(true);
  };

  // Handle save from modal
  const handleSaveProduct = (data: Partial<CatalogProduct>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data as any);
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 font-sans pb-16" dir="rtl">
      {/* 1. Admin Global Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0F131C]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt="نجم عدن"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.3)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-white">
                  نجم عدن موبايل
                </span>
                <span className="rounded-md bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-1.5 py-0.5 text-[10px] font-bold text-[#FFF3C4]">
                  لوحة الإدارة
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                إدارة المخزون المباشر والتسعير وقنوات الواتساب
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            {/* Store Preview CTA */}
            <button
              onClick={onExitToStore}
              className="flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/80 bg-[#121722] px-3 sm:px-4 py-2 text-xs font-black text-[#FFF3C4] shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:bg-[#D4AF37] hover:text-[#0A0D14] transition-all active:scale-95"
            >
              <span>معاينة المتجر</span>
              <ArrowUpRight size={14} />
            </button>

            {/* Lock session */}
            <button
              onClick={onLockSession}
              title="قفل لوحة الإدارة"
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-800 bg-[#121722] text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto flex max-w-7xl px-4 sm:px-6 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'border-[#D4AF37] text-[#FFF3C4]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={15} />
            <span>المخزون والمنتجات ({totalCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-[#D4AF37] text-[#FFF3C4]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings size={15} />
            <span>إعدادات المتجر وقنوات الواتساب</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 pt-5 sm:pt-7">
        {activeTab === 'settings' ? (
          <StoreSettingsTab />
        ) : (
          <div className="space-y-6">
            {/* Overview KPIs & 4 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Metric 1: Total Inventory */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#121722]/90 p-4 sm:p-5 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">إجمالي الأجهزة</span>
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-800/60 text-[#D4AF37]">
                    <Package size={17} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {totalCount}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">موديل مسجل</span>
                </div>
              </div>

              {/* Metric 2: In Stock */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#121722]/90 p-4 sm:p-5 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">متوفر بالمعرض</span>
                  <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-emerald-500/10 text-[#25D366]">
                    <CheckCircle size={17} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {inStockCount}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/80 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    جاهز للتسليم
                  </span>
                </div>
              </div>

              {/* Metric 3: Certified Pre-Owned */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#121722]/90 p-4 sm:p-5 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">أجهزة مستعملة مفحوصة</span>
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-500/10 text-purple-400">
                    <BatteryCharging size={17} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-purple-300">
                    {certifiedPreOwnedCount}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">بحالة الوكالة</span>
                </div>
              </div>

              {/* Metric 4: Out of Stock */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#121722]/90 p-4 sm:p-5 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">نفذت الكمية</span>
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-red-500/10 text-red-400">
                    <AlertTriangle size={17} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-red-400">
                    {outOfStockCount}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">بحاجة للتجديد</span>
                </div>
              </div>
            </div>

            {/* Controls Bar: Search, Category Filters & Actions */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#121722]/90 p-4 backdrop-blur-md space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن موديل، لون، أو تصنيف..."
                    className="w-full rounded-xl border border-slate-700/80 bg-[#0B0F17] pr-10 pl-9 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Backup JSON Button */}
                  <button
                    onClick={exportCatalogJson}
                    title="تنزيل نسخة احتياطية من الكتالوج (JSON)"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">تصدير (JSON)</span>
                  </button>

                  {/* Add Product Button */}
                  <button
                    onClick={handleOpenAdd}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5B869] px-4 py-2.5 text-xs font-black text-[#0A0D14] shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all active:scale-95"
                  >
                    <Plus size={16} />
                    <span>إضافة جهاز جديد</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-1">
                  تصفية:
                </span>
                {['الكل', 'آيفون', 'سامسونج', 'مستعمل ونظيف', 'إكسسوارات'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all whitespace-nowrap border ${
                      selectedCategory === cat
                        ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#FFF3C4]'
                        : 'border-slate-800 bg-[#0B0F17] text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                {filteredProducts.length !== products.length && (
                  <span className="text-[11px] text-slate-500 font-bold mr-auto">
                    ({filteredProducts.length} من {products.length})
                  </span>
                )}
              </div>
            </div>

            {/* Dual Responsive Data Display: Desktop Table vs Mobile Cards */}

            {/* DESKTOP TABLE (≥1024px) */}
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-800/80 bg-[#121722]/90 shadow-xl backdrop-blur-md">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0F131C] text-slate-400">
                    <th className="py-3 px-4 font-bold">صورة الجهاز</th>
                    <th className="py-3 px-4 font-bold">اسم الموديل</th>
                    <th className="py-3 px-4 font-bold">التصنيف</th>
                    <th className="py-3 px-4 font-bold">الحالة</th>
                    <th className="py-3 px-4 font-bold">السعات المتاحة</th>
                    <th className="py-3 px-4 font-bold text-center">التوفر الفوري</th>
                    <th className="py-3 px-4 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        لا توجد أجهزة مطابقة للبحث أو التصنيف المحدد
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const isInStock = !product.availability.includes('نفذت');
                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-[#161D2B]/50 transition-colors"
                        >
                          {/* Image */}
                          <td className="py-3 px-4">
                            <div className="relative h-12 w-12 rounded-xl bg-[#0B0F17] border border-slate-800 overflow-hidden flex items-center justify-center p-1">
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/logo3.jpg';
                                }}
                                className="h-full w-full object-contain"
                              />
                            </div>
                          </td>

                          {/* Title & subtitle */}
                          <td className="py-3 px-4">
                            <div className="font-black text-white text-sm">
                              {product.title}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">
                              {product.subtitle || product.color}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className="rounded-md bg-slate-800/80 px-2 py-1 text-[11px] font-bold text-slate-300">
                              {product.category}
                            </span>
                          </td>

                          {/* Condition & Battery */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                  product.condition.includes('جديد')
                                    ? 'bg-[#D4AF37]/20 text-[#FFF3C4] border border-[#D4AF37]/40'
                                    : 'bg-purple-900/30 text-purple-300 border border-purple-700/50'
                                }`}
                              >
                                {product.condition}
                              </span>
                              {product.condition.includes('مستخدم') &&
                                product.batteryHealth && (
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                    <BatteryCharging size={11} className="text-[#25D366]" />
                                    {product.batteryHealth}
                                  </span>
                                )}
                            </div>
                          </td>

                          {/* Capacities */}
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {product.capacities.map((cap) => (
                                <span
                                  key={cap}
                                  className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono text-slate-300"
                                >
                                  {cap.replace(/B/i, '')}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Real-time In-Stock Toggle Switch */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleStock(product.id)}
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all border ${
                                isInStock
                                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/40'
                                  : 'bg-red-950/40 border-red-500/50 text-red-400 hover:bg-red-900/40'
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isInStock ? 'bg-emerald-400' : 'bg-red-400'
                                }`}
                              />
                              <span>{isInStock ? 'متوفر' : 'نفذت الكمية'}</span>
                            </button>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(product)}
                                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:border-[#D4AF37] hover:bg-[#1A2232] transition-colors"
                                title="تعديل بيانات الجهاز"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => setProductToDelete(product)}
                                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-800 bg-slate-800/40 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-950/30 transition-colors"
                                title="حذف الجهاز من المخزون"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS (<1024px) (Thumb-Friendly UX) */}
            <div className="lg:hidden space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-[#121722] p-8 text-center text-slate-400">
                  لا توجد أجهزة مطابقة للبحث أو التصنيف
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const isInStock = !product.availability.includes('نفذت');
                  return (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-slate-800/80 bg-[#121722]/90 p-3.5 shadow-md space-y-3"
                    >
                      {/* Top Row: Thumbnail + Info */}
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 shrink-0 rounded-xl bg-[#0B0F17] border border-slate-800 overflow-hidden flex items-center justify-center p-1">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo3.jpg';
                            }}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                                product.condition.includes('جديد')
                                  ? 'bg-[#D4AF37]/20 text-[#FFF3C4] border border-[#D4AF37]/40'
                                  : 'bg-purple-900/30 text-purple-300 border border-purple-700/50'
                              }`}
                            >
                              {product.condition}
                            </span>
                            {product.condition.includes('مستخدم') &&
                              product.batteryHealth && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ⚡ {product.batteryHealth}
                                </span>
                              )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-black text-white truncate">
                            {product.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">
                            {product.color} • {product.category}
                          </p>
                        </div>
                      </div>

                      {/* Storage Chips */}
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-[10px] text-slate-500 font-bold ml-1">
                          السعات:
                        </span>
                        {product.capacities.map((cap) => (
                          <span
                            key={cap}
                            className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-slate-300"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>

                      {/* Bottom Row: Direct Stock Toggle + Actions */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                        {/* Real-time Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleStock(product.id)}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all border ${
                            isInStock
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                              : 'bg-red-950/40 border-red-500/50 text-red-400'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isInStock ? 'bg-emerald-400' : 'bg-red-400'
                            }`}
                          />
                          <span>{isInStock ? 'متوفر بالمعرض' : 'نفذت الكمية'}</span>
                        </button>

                        {/* Edit & Delete */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white hover:border-[#D4AF37]"
                          >
                            <Edit2 size={12} />
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="grid h-8 w-8 place-items-center rounded-xl border border-slate-800 bg-slate-800/50 text-slate-400 hover:text-red-400 hover:border-red-500/50"
                            aria-label="حذف"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3. Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        initialProduct={editingProduct}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* 4. Delete Guardrail Confirmation Modal */}
      {productToDelete && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          dir="rtl"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-[#121722] p-6 text-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-white">
                تأكيد حذف الجهاز من المخزون
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف{' '}
                <span className="font-bold text-white">
                  "{productToDelete.title}"
                </span>
                ؟ سيتم حذفه نهائياً من المتجر والمخزون.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 py-2.5 text-xs font-black text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] active:scale-95 transition-all"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
