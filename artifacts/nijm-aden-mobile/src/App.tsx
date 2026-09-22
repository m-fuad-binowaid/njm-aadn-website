import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { LogoLoader } from '@/components/LogoLoader';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import NotFound from '@/pages/not-found';
import {
  ArrowDown,
  ArrowLeft,
  Check,
  ChevronLeft,
  Clock,
  Eye,
  Grid2X2,
  Home as HomeIcon,
  LayoutList,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Truck,
  X,
  ZoomIn,
  Lock,
} from 'lucide-react';
import {
  catalog,
  type CatalogProduct,
  type ProductCategory,
  STORE_CONTACTS,
} from '@/data/catalog';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { CatalogProvider, useCatalog } from '@/context/CatalogContext';
import { AdminPinGate } from '@/components/admin/AdminPinGate';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

const queryClient = new QueryClient();

// Cart Item Model for Multi-Product WhatsApp Inquiry
export interface InquiryCartItem {
  id: string;
  product: CatalogProduct;
  selectedCapacity: string;
  quantity: number;
}

// Category definition for pills and navigation
export interface CategoryFilterItem {
  key: ProductCategory;
  label: string;
  iconName?: string;
  count: number;
}

const CATEGORY_ITEMS: { key: ProductCategory; label: string }[] = [
  { key: 'الكل', label: 'الكل' },
  { key: 'هواتف آيفون', label: 'هواتف آيفون' },
  { key: 'أجهزة مستعملة ونظيفة', label: 'أجهزة مستعملة ونظيفة' },
  { key: 'سامسونج', label: 'سامسونج' },
  { key: 'سماعات وساعات', label: 'سماعات وساعات' },
  { key: 'إكسسوارات وحماية', label: 'إكسسوارات وحماية' },
];

// Helper to construct formatted Arabic WhatsApp URL for cart
function buildCartWhatsAppUrl(items: InquiryCartItem[], customNote?: string, customPhone?: string): string {
  const phone = customPhone || STORE_CONTACTS.whatsapp2 || STORE_CONTACTS.whatsapp1;
  let text = `السلام عليكم ورحمة الله وبركاته،\nأود الاستفسار وتأكيد التوفر والتسعيرة للمنتجات التالية من *نجم عدن موبايل*:\n\n`;

  items.forEach((item, index) => {
    text += `${index + 1}) *${item.product.title}*\n`;
    text += `   • السعة/النوع: ${item.selectedCapacity}\n`;
    text += `   • الحالة: ${item.product.condition}`;
    if (item.product.batteryHealth) {
      text += ` (صحة البطارية: ${item.product.batteryHealth})`;
    }
    text += `\n   • الكمية: ${item.quantity}\n\n`;
  });

  const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);
  text += `— إجمالي عدد القطع: ${totalUnits} قطعة\n`;

  if (customNote && customNote.trim()) {
    text += `— ملاحظة العميل: ${customNote.trim()}\n`;
  }

  text += `\nالرجاء إفادتي بالأسعار الحالية وتأكيد موعد الاستلام من المعرض (ردسي مول - عدن). شكراً!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

// Helper to construct WhatsApp URL for single product direct inquiry
function buildSingleProductWhatsAppUrl(product: CatalogProduct, capacity?: string, customPhone?: string): string {
  const phone = customPhone || STORE_CONTACTS.whatsapp1;
  const chosenCapacity = capacity || product.defaultCapacity;
  let text = `السلام عليكم ورحمة الله،\nأود الاستفسار الفوري عن توفر وسعر الجهاز التالي في نجم عدن موبايل:\n\n`;
  text += `*${product.title}*\n`;
  text += `• السعة: ${chosenCapacity}\n`;
  text += `• الحالة: ${product.condition}`;
  if (product.batteryHealth) {
    text += ` (صحة البطارية: ${product.batteryHealth})`;
  }
  text += `\n• اللون: ${product.color}\n`;
  text += `\nهل هو متوفر حالياً للاستلام من صالة ردسي مول بعدن؟ شكراً!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

// Helper for direct WhatsApp general chat
function openDirectWhatsApp(message?: string, customPhone?: string) {
  const phone = customPhone || STORE_CONTACTS.whatsapp1;
  const text = message || 'السلام عليكم، أود الاستفسار عن الأجهزة والعروض المتوفرة في صالة نجم عدن موبايل.';
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

// ---------------------------------------------------------------------
// Main Storefront Component
// ---------------------------------------------------------------------
function Home() {
  const { toast } = useToast();
  const { products, settings } = useCatalog();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('najm_aden_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [viewMode, setViewMode] = useState<'store' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'admin' || window.location.pathname.startsWith('/admin')) {
        return 'admin';
      }
    }
    return 'store';
  });

  // Listen for browser popstate or URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'admin' || window.location.pathname.startsWith('/admin')) {
        setViewMode('admin');
      } else {
        setViewMode('store');
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const [cart, setCart] = useState<InquiryCartItem[]>(() => {
    try {
      const saved = localStorage.getItem('najm_aden_inquiry_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileLayout, setMobileLayout] = useState<'grid-2' | 'grid-1'>('grid-2');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initial Luxury Brand Splash Entrance Loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
      setTimeout(() => setShowSplash(false), 450);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('najm_aden_inquiry_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Set document title
  useEffect(() => {
    document.title = 'نجم عدن موبايل | هواتف آيفون وسامسونج الأصلية وإكسسوارات فاخرة';
  }, []);

  // Filter products with small debounce animation
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchCategory =
        activeCategory === 'الكل' || product.category === activeCategory;
      const matchSearch =
        !query ||
        product.title.toLowerCase().includes(query) ||
        product.subtitle.toLowerCase().includes(query) ||
        product.color.toLowerCase().includes(query) ||
        product.condition.toLowerCase().includes(query) ||
        product.capacities.some((c) => c.toLowerCase().includes(query)) ||
        product.specs.some((s) => s.toLowerCase().includes(query)) ||
        product.tags.some((t) => t.toLowerCase().includes(query));
      return matchCategory && matchSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // Calculate counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { الكل: products.length };
    products.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Add to inquiry cart
  const handleAddToCart = (product: CatalogProduct, capacity?: string) => {
    const chosenCapacity = capacity || product.defaultCapacity;
    const cartItemId = `${product.id}-${chosenCapacity}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === cartItemId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          selectedCapacity: chosenCapacity,
          quantity: 1,
        },
      ];
    });

    toast({
      title: 'تمت الإضافة لسلة الاستفسار',
      description: `${product.title} (${chosenCapacity})`,
      action: (
        <button
          onClick={() => setIsCartOpen(true)}
          className="rounded bg-[#111111] px-2.5 py-1 text-[11px] font-black text-white hover:bg-[#d4af37] hover:text-[#111111] transition-colors"
        >
          عرض السلة
        </button>
      ),
    });
  };

  // Update item quantity
  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as InquiryCartItem[];
    });
  };

  // Remove from cart
  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Clear entire cart
  const handleClearCart = () => {
    setCart([]);
  };

  // Select category with smooth skeleton transition (250ms - 400ms)
  const handleSelectCategory = (cat: ProductCategory) => {
    if (cat === activeCategory && !searchQuery) return;
    setIsFiltering(true);
    setActiveCategory(cat);
    if (searchQuery) setSearchQuery('');
    setTimeout(() => {
      setIsFiltering(false);
    }, 320);
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Admin Mode
  if (viewMode === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AdminPinGate
          expectedPin={settings.adminPin || '2026'}
          onSuccess={() => {
            setIsAdminAuthenticated(true);
            try {
              sessionStorage.setItem('najm_aden_admin_auth', 'true');
            } catch {}
          }}
          onExit={() => {
            setViewMode('store');
            const url = new URL(window.location.href);
            url.searchParams.delete('view');
            window.history.pushState({}, '', url.pathname === '/admin' ? '/' : url.pathname + (url.search ? url.search : ''));
          }}
        />
      );
    }

    return (
      <AdminDashboard
        onExitToStore={() => {
          setViewMode('store');
          const url = new URL(window.location.href);
          url.searchParams.delete('view');
          window.history.pushState({}, '', url.pathname === '/admin' ? '/' : url.pathname + (url.search ? url.search : ''));
        }}
        onLockSession={() => {
          setIsAdminAuthenticated(false);
          try {
            sessionStorage.removeItem('najm_aden_admin_auth');
          } catch {}
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 font-sans overflow-x-hidden selection:bg-[#D4AF37] selection:text-black" dir="rtl">
      {/* 0. Luxury Branded Splash Intro (Initial Load State) */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-[300] flex items-center justify-center bg-[#0A0D14] transition-opacity duration-500 ${
            isInitialLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <LogoLoader text="جاري تجهيز أحدث الأجهزة..." />
        </div>
      )}

      {/* 1. Top Guarantee & Quality Trust Ribbon */}
      <div className="bg-[#0A0D14] text-slate-200 border-b border-slate-800/80 px-3 py-1.5 text-[11px] font-bold">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[#FFF3C4]">
              <Sparkles size={13} className="text-[#D4AF37]" /> {settings.announcementText || 'أجهزة أصلية معتمدة • فحص 30 نقطة • ردسي مول - عدن'}
            </span>
          </div>

          <a
            href={`tel:${settings.phone1 || STORE_CONTACTS.phone1}`}
            className="flex items-center gap-1 text-[#FFF3C4] hover:text-[#D4AF37] transition-colors shrink-0"
          >
            <Phone size={12} className="text-[#D4AF37]" /> {settings.phone1 || STORE_CONTACTS.phone1}
          </a>
        </div>
      </div>

      {/* 2. Compact Sticky Mobile Header */}
      <MobileHeader
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        isSearchOpen={isSearchOpen}
        onToggleSearch={() => {
          setIsSearchOpen(!isSearchOpen);
          if (!isSearchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="w-full pb-28">
        {/* 3. Mobile Hero Section (Vertical Mobile Stack - Zero Black Voids) */}
        <MobileHero
          onExploreCatalog={scrollToCatalog}
          onDirectInquiry={() => openDirectWhatsApp()}
        />

        {/* 4. Horizontal Swipe Category Pills (Sticky Navigation) */}
        <section
          id="catalog-section"
          className="sticky top-14 sm:top-16 z-30 bg-[#0A0D14]/90 backdrop-blur-md border-b border-slate-800/80 py-2.5 px-3 sm:px-6 shadow-md"
        >
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar py-0.5">
              {CATEGORY_ITEMS.map((item) => {
                const isActive = activeCategory === item.key;
                const count = categoryCounts[item.key] || 0;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectCategory(item.key)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all shrink-0 tap-scale ${
                      isActive
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5B869] text-[#0A0D14] shadow-[0_0_15px_rgba(212,175,55,0.35)] border border-[#D4AF37]'
                        : 'bg-[#121722]/85 text-[#CBD5E1] border border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                        isActive
                          ? 'bg-[#0A0D14] text-[#E5B869]'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Layout switch on mobile */}
            <div className="hidden sm:flex items-center gap-1 bg-[#121722] border border-slate-800 p-0.5 rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => setMobileLayout('grid-2')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  mobileLayout === 'grid-2' ? 'bg-[#D4AF37] text-[#0A0D14]' : 'text-slate-400 hover:text-white'
                }`}
                title="عرض شبكي مزدوج"
              >
                <Grid2X2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setMobileLayout('grid-1')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  mobileLayout === 'grid-1' ? 'bg-[#D4AF37] text-[#0A0D14]' : 'text-slate-400 hover:text-white'
                }`}
                title="عرض فردي مفصل"
              >
                <LayoutList size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* 5. Mobile-Optimized 2-Column Product Grid */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 pt-4 sm:pt-6">
          {/* Active section info */}
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
              <span className="text-white font-black text-sm">
                {activeCategory === 'الكل' ? 'جميع الأجهزة المتوفرة' : activeCategory}
              </span>
              <span className="text-slate-400">({filteredProducts.length})</span>
            </span>

            {/* Quick layout toggle for mobile screens */}
            <div className="flex sm:hidden items-center gap-1 bg-[#121722] border border-slate-800 px-1 py-0.5 rounded-md">
              <button
                onClick={() => setMobileLayout('grid-2')}
                className={`px-1.5 py-0.5 text-[10px] rounded font-bold transition-colors ${
                  mobileLayout === 'grid-2' ? 'bg-[#D4AF37] text-[#0A0D14]' : 'text-slate-400'
                }`}
              >
                شبكي
              </button>
              <button
                onClick={() => setMobileLayout('grid-1')}
                className={`px-1.5 py-0.5 text-[10px] rounded font-bold transition-colors ${
                  mobileLayout === 'grid-1' ? 'bg-[#D4AF37] text-[#0A0D14]' : 'text-slate-400'
                }`}
              >
                قائمة
              </button>
            </div>
          </div>

          {/* Product cards or skeleton loader with zero CLS layout matching */}
          {isFiltering ? (
            <div
              className={`grid gap-2.5 sm:gap-4 transition-opacity duration-300 ease-in-out ${
                mobileLayout === 'grid-1'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  : 'grid-cols-2 lg:grid-cols-4'
              }`}
            >
              {[...Array(mobileLayout === 'grid-1' ? 4 : 6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-[#121722]/60 p-8 sm:p-12 text-center my-4">
              <Search size={36} className="mx-auto mb-2 text-slate-500" />
              <h3 className="text-base font-bold text-white">لا توجد منتجات مطابقة لبحثك</h3>
              <p className="mt-1 text-xs text-slate-400">
                جرب البحث بكلمة أخرى أو اختر قسماً آخر من شريط التصنيفات
              </p>
              <button
                onClick={() => {
                  handleSelectCategory('الكل');
                }}
                className="mt-4 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#E5B869] px-4 py-2 text-xs font-black text-[#0A0D14] hover:shadow-lg transition-all"
              >
                عرض كافة الأجهزة
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-2.5 sm:gap-4 transition-opacity duration-300 ease-in-out ${
                mobileLayout === 'grid-1'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  : 'grid-cols-2 lg:grid-cols-4'
              }`}
            >
              {filteredProducts.map((product) => (
                <MobileProductCard
                  key={product.id}
                  product={product}
                  onOpen={() => setSelectedProduct(product)}
                  onAddToCart={handleAddToCart}
                  onSingleInquiry={(capacity) => {
                    const url = buildSingleProductWhatsAppUrl(product, capacity, settings.whatsapp1);
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* 6. Guarantee & Showroom Location Section */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 pt-10">
          <div className="rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#121722] via-[#0F1420] to-[#0A0D14] p-5 sm:p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Subtle Gold Ambient Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 text-[11px] font-bold text-[#FFF3C4] mb-2.5">
                  <ShieldCheck size={14} className="text-[#D4AF37]" /> فحص 30 نقطة معتمد
                </span>
                <h3 className="text-lg sm:text-2xl font-black leading-snug">
                  جهازك مفحوص بدقة مع تغليف ملكي وبطاقة ضمان 7 أيام
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  في نجم عدن موبايل، نضمن لك فحص حقيقي لكافة وظائف الجهاز (البطارية، الشاشة، الكاميرا، الأزرار، والشبكة)، مع هدية بوكس التغليف الفاخر وكارت الفحص المعتمد.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Check size={14} className="text-[#D4AF37]" /> فحص كامل للبطارية
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={14} className="text-[#D4AF37]" /> ضمان تجربة 7 أيام
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={14} className="text-[#D4AF37]" /> تغليف فاخر هدية
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={14} className="text-[#D4AF37]" /> دعم وصيانة مباشرة
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => openDirectWhatsApp('السلام عليكم، أود معرفة تفاصيل الضمان والفحص للأجهزة في نجم عدن موبايل.', settings.whatsapp1)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-black text-white hover:bg-[#20BA59] active:scale-95 transition-all shadow"
                  >
                    <MessageCircle size={15} /> استفسر عن الضمان
                  </button>
                  <a
                    href={`tel:${settings.phone1 || STORE_CONTACTS.phone1}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs font-bold text-slate-200 hover:border-[#D4AF37] hover:text-white transition-colors"
                  >
                    <Phone size={14} className="text-[#D4AF37]" /> اتصال بالمبيعات
                  </a>
                </div>
              </div>

              <div className="flex justify-center w-full mt-6 md:mt-0">
                <div className="relative before:absolute before:-inset-2 before:bg-gradient-to-r before:from-amber-500/10 before:to-yellow-600/10 before:rounded-3xl before:blur-xl before:-z-10 w-full max-w-md mx-auto">
                  <img
                    src="/packaging.jpg"
                    alt="بوكس التغليف الملكي نجم عدن"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/packaging.jpeg';
                    }}
                    className="w-full max-w-md mx-auto rounded-2xl object-cover border border-slate-800/80 shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Showroom Location & Contact */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 pt-6">
          <div className="rounded-2xl border border-slate-800 bg-[#121722]/90 p-4 sm:p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#0A0D14] border border-[#D4AF37] grid place-items-center text-[#D4AF37] shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">موقع صالة العرض في عدن</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{settings.location || STORE_CONTACTS.location}</p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                    <Clock size={12} className="text-[#D4AF37]" /> {settings.workingHours || STORE_CONTACTS.workingHours}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openDirectWhatsApp('السلام عليكم، أود زيارة المعرض في ردسي مول، ما هي الأجهزة المتوفرة اليوم؟', settings.whatsapp1)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A2232] border border-slate-700 px-4 py-2.5 text-xs font-bold text-white hover:border-[#D4AF37] hover:bg-[#20293D] transition-colors"
                >
                  <MessageCircle size={15} className="text-[#25D366]" /> تأكيد التوفر قبل الزيارة
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Desktop/Tablet Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0A0D14] text-slate-400 text-xs pb-24 sm:pb-8 pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
            <BrandLogo />
            <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
              <a href={`tel:${settings.phone1 || STORE_CONTACTS.phone1}`} className="hover:text-[#D4AF37] transition-colors">
                هاتف: {settings.phone1 || STORE_CONTACTS.phone1}
              </a>
              <span className="text-[#D4AF37]">•</span>
              <a href={`tel:${settings.phone2 || STORE_CONTACTS.phone2}`} className="hover:text-[#D4AF37] transition-colors">
                هاتف: {settings.phone2 || STORE_CONTACTS.phone2}
              </a>
            </div>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              جميع الحقوق محفوظة © {new Date().getFullYear()} نجم عدن موبايل. تصميم مخصص وعالي الأداء للهواتف الذكية.
            </div>
            <button
              onClick={() => {
                setViewMode('admin');
                const url = new URL(window.location.href);
                url.searchParams.set('view', 'admin');
                window.history.pushState({}, '', url.toString());
              }}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#D4AF37] transition-colors py-1.5 px-3 rounded-lg border border-slate-800 bg-[#121722]/80 hover:bg-[#161D2B] cursor-pointer"
              title="لوحة الإدارة والمخزون"
            >
              <Lock size={12} className="text-[#D4AF37]" />
              <span>لوحة الإدارة والمخزون</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* 9. THUMB-ZONE NAVIGATION & APP DOCK (CRITICAL FOR MOBILE)      */}
      {/* ============================================================== */}
      <nav
        className="mobile-bottom-dock flex items-center justify-around px-2 py-1 max-w-md mx-auto sm:max-w-none"
        aria-label="شريط التنقل السريع"
      >
        {/* 1) الرئيسية (Home) */}
        <button
          type="button"
          onClick={() => {
            setActiveCategory('الكل');
            setSearchQuery('');
            scrollToTop();
          }}
          className="dock-item-btn"
          aria-label="الرئيسية"
        >
          <div className="dock-icon-wrapper">
            <HomeIcon size={20} />
          </div>
          <span>الرئيسية</span>
        </button>

        {/* 2) الكتالوج (Catalog) */}
        <button
          type="button"
          onClick={scrollToCatalog}
          className="dock-item-btn"
          aria-label="الكتالوج"
        >
          <div className="dock-icon-wrapper">
            <Grid2X2 size={20} />
          </div>
          <span>الكتالوج</span>
        </button>

        {/* 3) سلة الاستفسار (Cart with real-time floating badge counter) */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="dock-item-btn relative"
          aria-label="سلة الاستفسار"
        >
          <div className="dock-icon-wrapper relative">
            <ShoppingCart size={20} />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[10px] font-black text-[#0A0D14] shadow-[0_0_8px_rgba(212,175,55,0.9)] animate-pulse">
                {totalCartCount}
              </span>
            )}
          </div>
          <span>سلة الاستفسار</span>
        </button>

        {/* 4) واتساب المبيعات (High-contrast WhatsApp button for instant 1-tap support) */}
        <button
          type="button"
          onClick={() => openDirectWhatsApp()}
          className="dock-item-btn text-[#25D366] hover:text-[#20BA59]"
          aria-label="واتساب المبيعات"
        >
          <div className="dock-icon-wrapper flex items-center justify-center h-7 w-7 rounded-full bg-[#25D366] text-white shadow-[0_0_10px_rgba(37,211,102,0.4)]">
            <MessageCircle size={17} className="fill-white" />
          </div>
          <span className="text-[#25D366] font-bold">واتساب المبيعات</span>
        </button>
      </nav>

      {/* ============================================================== */}
      {/* 10. NATIVE-STYLE MOBILE CART (BOTTOM SHEET DRAWER)              */}
      {/* ============================================================== */}
      {isCartOpen &&
        createPortal(
          <MobileCartBottomSheet
            items={cart}
            onClose={() => setIsCartOpen(false)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            whatsappNumber={settings.whatsapp2 || settings.whatsapp1}
          />,
          document.body
        )}

      {/* ============================================================== */}
      {/* 11. SIDE SLIDE-OVER CATEGORY DRAWER                             */}
      {/* ============================================================== */}
      {isDrawerOpen &&
        createPortal(
          <MobileSideDrawer
            activeCategory={activeCategory}
            onSelectCategory={(cat) => {
              handleSelectCategory(cat);
              setIsDrawerOpen(false);
              scrollToCatalog();
            }}
            onClose={() => setIsDrawerOpen(false)}
            onOpenCart={() => {
              setIsDrawerOpen(false);
              setIsCartOpen(true);
            }}
            cartCount={totalCartCount}
            onOpenAdmin={() => {
              setViewMode('admin');
              const url = new URL(window.location.href);
              url.searchParams.set('view', 'admin');
              window.history.pushState({}, '', url.toString());
            }}
          />,
          document.body
        )}

      {/* ============================================================== */}
      {/* 12. MULTI-ANGLE PRODUCT MODAL                                  */}
      {/* ============================================================== */}
      {selectedProduct &&
        createPortal(
          <ProductDetailsModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(prod, cap) => {
              handleAddToCart(prod, cap);
            }}
            onDirectWhatsApp={(prod, cap) => {
              const url = buildSingleProductWhatsAppUrl(prod, cap, settings.whatsapp1);
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
          />,
          document.body
        )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Component: Brand Logo (Static Local Asset /assets/logo.png)
// ---------------------------------------------------------------------
function BrandLogo({
  className = '',
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`relative flex items-center group cursor-pointer ${className}`}>
      <img
        src="/assets/logo.png"
        alt="نجم عدن موبايل"
        className="h-10 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_14px_rgba(212,175,55,0.45)]"
      />
    </div>
  );
}

// ---------------------------------------------------------------------
// Component: Sticky Glassmorphic Header
// ---------------------------------------------------------------------
function MobileHeader({
  isDrawerOpen,
  onToggleDrawer,
  isSearchOpen,
  onToggleSearch,
  searchQuery,
  onSearchChange,
  searchInputRef,
  cartCount,
  onOpenCart,
}: {
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  cartCount: number;
  onOpenCart: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0A0D14]/85 border-b border-slate-800/80 transition-all">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-3">
          {/* Right (RTL): Drawer Toggle + Brand Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleDrawer}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-800 bg-[#121722]/80 text-slate-200 hover:border-[#D4AF37]/50 hover:text-white active:scale-95 transition-all"
              aria-label="القائمة الجانبية"
            >
              <Menu size={20} />
            </button>

            {/* Seamless Brand Identity with star pulse on hover */}
            <a href="/" className="inline-flex items-center">
              <BrandLogo compact={false} />
            </a>
          </div>

          {/* Center: Modern Search Bar (Translucent with Gold Ring on Focus) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full flex items-center rounded-xl bg-[#121722]/80 border border-slate-700/60 px-3 py-2 transition-all focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37]/80">
              <Search size={16} className="text-[#D4AF37] shrink-0 ml-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث عن جهازك المفضل، سعة، أو ملحق..."
                className="w-full bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-slate-400 hover:text-white"
                  aria-label="مسح نص البحث"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Left (RTL): Action Icons (Search on mobile + Cart with Gold Counter + WhatsApp Support) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={onToggleSearch}
              className={`md:hidden grid h-10 w-10 place-items-center rounded-xl border transition-all ${
                isSearchOpen
                  ? 'bg-[#D4AF37] text-[#0A0D14] border-[#D4AF37]'
                  : 'border-slate-800 bg-[#121722]/80 text-slate-200 hover:border-slate-700'
              }`}
              aria-label="البحث عن جهاز"
            >
              <Search size={18} />
            </button>

            {/* WhatsApp Quick Support Button */}
            <a
              href={`https://wa.me/${STORE_CONTACTS.whatsapp1}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار والدعم المباشر من مبيعات نجم عدن موبايل.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-white active:scale-95 transition-all text-xs font-black shadow-sm"
              title="دعم فوري عبر واتساب"
            >
              <MessageCircle size={17} />
              <span className="hidden sm:inline">دعم واتساب</span>
            </a>

            {/* Cart Icon in Header with Real-Time Gold Badge Counter */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-800 bg-[#121722]/80 text-slate-200 hover:border-[#D4AF37]/60 hover:text-white active:scale-95 transition-all"
              aria-label="سلة الاستفسار"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[9px] font-black text-[#0A0D14] shadow-[0_0_8px_rgba(212,175,55,0.8)]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Input (Mobile Screen Dropdown) */}
        {isSearchOpen && (
          <div className="pb-3 pt-1 border-t border-slate-800/80 animate-fadeIn md:hidden">
            <div className="flex items-center gap-2 rounded-xl border border-[#D4AF37] bg-[#121722] px-3 py-2 shadow-lg">
              <Search size={16} className="text-[#D4AF37] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث عن جهازك المفضل، سعة، أو ملحق..."
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-slate-400 hover:text-white"
                  aria-label="مسح نص البحث"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------
// Component: 2-Column Split Hero Section (Attachment 2 Luxury Burgundy iPhone)
// ---------------------------------------------------------------------
function MobileHero({
  onExploreCatalog,
  onDirectInquiry,
}: {
  onExploreCatalog: () => void;
  onDirectInquiry: () => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 pt-3 sm:pt-6 pb-8 sm:pb-12">
      <div className="relative rounded-2xl bg-gradient-to-b from-[#0F1420] via-[#121722] to-[#0A0D14] border border-slate-800/80 shadow-2xl p-5 sm:p-8 lg:p-10 text-white">
        {/* Subtle Dual Ambient Radial Glow (Champagne Gold + Deep Burgundy Halo) */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-tr from-[#8B1538]/30 via-[#D4AF37]/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

        {/* 2-Column Split Layout */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* RIGHT COLUMN: Content & Direct CTAs */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-right">
            {/* Micro-Pill Tag */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#121722]/90 border border-[#D4AF37]/45 px-3.5 py-1.5 text-[10px] sm:text-xs font-bold text-[#FFF3C4] shadow-[0_0_15px_rgba(212,175,55,0.15)] mb-3 sm:mb-4">
              <span className="text-[#D4AF37]">✨</span>
              <span>أجهزة أصلية معتمدة</span>
              <span className="text-[#D4AF37]">•</span>
              <span>فحص 30 نقطة</span>
              <span className="text-[#D4AF37]">•</span>
              <span>ضمان تجربة 7 أيام</span>
            </div>

            {/* Main Title: Bold High-Impact Gradient Typography */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight sm:leading-tight tracking-tight">
              <span className="bg-gradient-to-l from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                هواتف آيفون الأصلية
              </span>{' '}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-l from-[#FFF3C4] via-[#E5B869] to-[#D4AF37] bg-clip-text text-transparent">
                بأفضل أسعار صالات عدن
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm lg:text-base text-slate-300 max-w-xl leading-relaxed font-medium">
              أجهزة جديدة بكراتينها ومستعملة بحالة الوكالة مع تغليف ملكي معتمد وتسعير فوري عبر الواتساب.
            </p>

            {/* Direct CTA Action Buttons (Positioned directly under text) */}
            <div className="mt-5 sm:mt-6 w-full max-w-md flex flex-col sm:flex-row items-stretch gap-2.5 sm:gap-3">
              {/* Primary CTA: WhatsApp Green */}
              <button
                onClick={onDirectInquiry}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-xs sm:text-sm font-black text-white hover:bg-[#20BA59] active:scale-95 transition-all shadow-[0_4px_20px_rgba(37,211,102,0.35)]"
              >
                <MessageCircle size={18} className="fill-white" />
                <span>استفسار وتسعير فوري عبر واتساب</span>
              </button>

              {/* Secondary CTA: Dark Slate with subtle gold border */}
              <button
                onClick={onExploreCatalog}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#121722]/90 hover:border-[#D4AF37]/60 hover:bg-[#1A2232] px-5 py-3.5 text-xs sm:text-sm font-bold text-slate-200 active:scale-95 transition-all"
              >
                <span>تصفح أجهزة اليوم</span>
                <ArrowDown size={15} className="text-[#D4AF37]" />
              </button>
            </div>
          </div>

          {/* LEFT COLUMN: Hero Visual (Phone Showcase in Mobile View) */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-4 lg:py-6 bg-transparent">
            <div className="relative w-full max-w-[280px] sm:max-w-[340px] flex items-center justify-center bg-transparent">
              {/* Subtle Ambient Radial Gradient Behind Phone Container */}
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-950/20 via-transparent to-transparent blur-2xl pointer-events-none" />

              {/* Showcase Image directly matching requested spec */}
              <img
                src="/logo3.jpg"
                alt="iPhone 18 Pro Max Burgundy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/logo3.jpg';
                }}
                className="w-full max-w-[280px] sm:max-w-[340px] mx-auto object-contain drop-shadow-[0_15px_35px_rgba(159,18,57,0.25)] relative z-10"
              />

              {/* Floating Badge: ⚡ بطارية 100% */}
              <div className="absolute top-2 right-1 sm:right-2 z-20 backdrop-blur-md bg-slate-900/80 border border-slate-700/60 text-amber-400 text-xs px-3 py-1 rounded-full shadow-lg inline-flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>⚡</span>
                <span className="font-bold text-slate-100">بطارية 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Component: Mobile Product Card (Decluttered & Minimalist)
// ---------------------------------------------------------------------
function MobileProductCard({
  product,
  onOpen,
  onAddToCart,
  onSingleInquiry,
}: {
  product: CatalogProduct;
  onOpen: () => void;
  onAddToCart: (p: CatalogProduct, capacity?: string) => void;
  onSingleInquiry: (capacity?: string) => void;
}) {
  const [selectedCap] = useState(product.defaultCapacity);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedCap);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleQuickChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSingleInquiry(selectedCap);
  };

  // Clean title without english brackets
  const cleanTitle = product.title.replace(/\s*\([^)]*\)/g, '').trim();

  // Minimalist storage indicator: sleek inline row showing available capacities (e.g., "128G | 256G | 512G")
  const formattedCapacities =
    product.capacities && product.capacities.length > 0
      ? product.capacities.map((c) => c.replace(/B/i, '')).join(' | ')
      : null;

  return (
    <article
      onClick={onOpen}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#121722]/90 p-3 sm:p-3.5 shadow-lg hover:border-[#D4AF37]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)] transition-all cursor-pointer overflow-hidden"
    >
      <div>
        {/* TOP: Single, elegant pill badge only */}
        <div className="flex items-center justify-start mb-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wide ${
              product.condition.includes('جديد')
                ? 'bg-[#D4AF37] text-[#0A0D14]'
                : 'bg-slate-800 text-slate-300 border border-slate-700/80'
            }`}
          >
            {product.condition}
          </span>
        </div>

        {/* IMAGE: Clean centered device photo on a subtle dark elevated pad */}
        <div className="relative flex items-center justify-center bg-[#181F2E]/50 rounded-xl mb-2.5 border border-slate-800/40 overflow-hidden">
          <img
            src={product.images[0]}
            alt={cleanTitle}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/packaging.jpeg';
            }}
            className={`w-full h-36 mx-auto rounded-xl transition-transform duration-300 group-hover:scale-105 ${
              product.images[0].includes('packaging')
                ? 'object-cover'
                : 'object-contain p-2.5 mix-blend-multiply dark:mix-blend-normal'
            }`}
            loading="lazy"
          />
        </div>

        {/* TITLE: Clean, non-truncated Arabic device name with color in a muted small caption below it */}
        <h3
          className="text-xs sm:text-sm font-black text-slate-100 leading-snug group-hover:text-[#D4AF37] transition-colors"
          title={cleanTitle}
        >
          {cleanTitle}
        </h3>

        {product.color && (
          <p className="mt-0.5 text-[11px] text-slate-400 font-medium">
            {product.color}
          </p>
        )}

        {/* SPECS: Minimalist storage indicator: sleek inline row */}
        {formattedCapacities && (
          <div className="mt-1.5 text-[10px] font-bold text-slate-400 tracking-wider">
            {formattedCapacities}
          </div>
        )}
      </div>

      {/* BOTTOM ACTIONS (COMPACT & BALANCED): Dual trigger */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2">
        {/* 1) Primary WhatsApp Button: Green pill button labeled "تسعير فوري" with gentle entrance pulse */}
        <button
          type="button"
          onClick={handleQuickChat}
          className="bg-[#25D366] text-black font-bold text-xs py-2 px-3 flex-1 flex items-center justify-center gap-1.5 rounded-xl hover:bg-[#20BA59] active:scale-95 transition-all shadow-sm animate-gentle-cta"
          aria-label={`تسعير فوري عبر واتساب لجهاز ${cleanTitle}`}
        >
          <MessageCircle size={15} className="fill-black text-black" />
          <span>تسعير فوري</span>
        </button>

        {/* 2) Secondary Cart Add: Sleek dark square icon button (+) to add to the inquiry cart */}
        <button
          type="button"
          onClick={handleAdd}
          className={`h-9 w-9 shrink-0 grid place-items-center rounded-xl border transition-all active:scale-90 ${
            justAdded
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-[#181F2E] border-slate-700/80 text-slate-200 hover:border-[#D4AF37] hover:text-[#D4AF37]'
          }`}
          title="إضافة إلى سلة الاستفسار"
          aria-label={`إضافة ${cleanTitle} إلى سلة الاستفسار`}
        >
          {justAdded ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------
// Component: Native-Style Mobile Cart (Bottom Sheet Drawer)
// ---------------------------------------------------------------------
function MobileCartBottomSheet({
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  whatsappNumber,
}: {
  items: InquiryCartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  whatsappNumber?: string;
}) {
  const [customNote, setCustomNote] = useState('');
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSendToWhatsApp = () => {
    if (items.length === 0) return;
    const url = buildCartWhatsAppUrl(items, customNote, whatsappNumber);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div
        className="bottom-sheet-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="bottom-sheet-container bg-[#0F131C] text-slate-100 border-t border-[#D4AF37]/35"
        role="dialog"
        aria-modal="true"
        aria-label="سلة الاستفسار والتسعيرة"
      >
        {/* Drag handle */}
        <div className="pt-3 pb-1 cursor-grab active:cursor-grabbing">
          <div className="h-1.5 w-12 bg-slate-750 bg-slate-700 rounded-full mx-auto" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-[#D4AF37]" />
            <h3 className="text-sm font-black text-white">
              سلة الاستفسار والتسعيرة
            </h3>
            <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-[10px] font-black text-[#0A0D14] shadow-[0_0_8px_rgba(212,175,55,0.4)]">
              {totalItems}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-400 transition-colors"
              >
                تفريغ
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
              aria-label="إغلاق السلة"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Items List or Empty State */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-slate-800/80 border border-slate-700 text-[#D4AF37] mx-auto grid place-items-center">
                <ShoppingCart size={28} />
              </div>
              <h4 className="text-sm font-bold text-white">سلة الاستفسار فارغة حالياً</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                أضف الهواتف والإكسسوارات التي تريد السؤال عنها لتجهيز رسالة واتساب واحدة مرتبة مباشرة لخدمة العملاء.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5B869] px-4 py-2 text-xs font-black text-[#0A0D14] hover:shadow-lg transition-all"
              >
                تصفح الأجهزة والكتالوج
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-2.5 shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="h-14 w-14 rounded-lg bg-[#121722] border border-slate-700/80 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-white truncate">
                      {item.product.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 border border-slate-700 font-bold text-slate-200">
                        {item.selectedCapacity}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {item.product.condition}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Counter (Touch Target >= 44x44px) */}
                  <div className="flex items-center gap-1 bg-[#121722] border border-slate-700 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="h-8 w-8 grid place-items-center rounded text-slate-300 hover:text-white hover:bg-slate-750 active:scale-90"
                      aria-label="تقليل الكمية"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-5 text-center text-xs font-black text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="h-8 w-8 grid place-items-center rounded text-slate-300 hover:text-white hover:bg-slate-750 active:scale-90"
                      aria-label="زيادة الكمية"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="h-8 w-8 grid place-items-center text-slate-400 hover:text-rose-400 transition-colors"
                    aria-label="حذف العنصر"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Optional Custom Note */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  ملاحظات أو أسئلة إضافية للمبيعات (اختياري):
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="مثلاً: متى يمكنني الاستلام اليوم من ردسي مول؟"
                  className="w-full rounded-xl border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Trust Reminder */}
              <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-2.5 flex items-center gap-2 text-emerald-300 text-[11px] font-bold">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>جميع الأجهزة مفحوصة مع ضمان تجربة 7 أيام وتغليف ملكي هدية</span>
              </div>
            </>
          )}
        </div>

        {/* Sticky Bottom WhatsApp Action CTA */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-[#0F131C]">
            <button
              type="button"
              onClick={handleSendToWhatsApp}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] py-3.5 text-sm font-black text-white hover:bg-[#20BA59] active:scale-95 transition-all shadow-lg"
            >
              <MessageCircle size={20} className="fill-white" />
              <span>إرسال الاستفسار والتسعيرة عبر الواتساب ({totalItems})</span>
            </button>
            <p className="mt-1.5 text-center text-[10px] text-slate-400">
              سيتم فتح محادثة مباشرة مع مبيعات نجم عدن موبايل: {STORE_CONTACTS.phone1}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------
// Component: Side Category Drawer
// ---------------------------------------------------------------------
function MobileSideDrawer({
  activeCategory,
  onSelectCategory,
  onClose,
  onOpenCart,
  cartCount,
  onOpenAdmin,
}: {
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  onClose: () => void;
  onOpenCart: () => void;
  cartCount: number;
  onOpenAdmin?: () => void;
}) {
  return (
    <>
      <div
        className="mobile-drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="mobile-drawer-content"
        role="dialog"
        aria-modal="true"
        aria-label="قائمة الأقسام"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#121722]">
          <BrandLogo />
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750"
            aria-label="إغلاق القائمة"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Cart Shortcut in Drawer */}
        <div className="p-3 border-b border-slate-800/80">
          <button
            onClick={onOpenCart}
            className="w-full flex items-center justify-between rounded-xl bg-[#121722] border border-slate-750 p-2.5 text-xs font-bold text-slate-200 hover:border-[#D4AF37]"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-[#D4AF37]" />
              <span>سلة الاستفسار والتسعيرة</span>
            </span>
            <span className="rounded-full bg-[#D4AF37] text-[#0A0D14] font-black px-2 py-0.5 text-[10px] shadow-sm">
              {cartCount}
            </span>
          </button>
        </div>

        {/* Categories list */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase">
            أقسام المتجر
          </div>
          {CATEGORY_ITEMS.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onSelectCategory(cat.key)}
                className={`drawer-category-item w-full ${isActive ? 'active' : ''}`}
              >
                <span>{cat.label}</span>
                <ChevronLeft size={16} className={isActive ? 'text-[#D4AF37]' : 'text-slate-500'} />
              </button>
            );
          })}

          <div className="px-4 pt-4 pb-1.5 text-[10px] font-bold text-slate-400 uppercase">
            معلومات الصالة والضمان
          </div>
          <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#D4AF37]" /> فحص شامل قبل التسليم
            </span>
            <Check size={14} className="text-emerald-400" />
          </div>
          <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center gap-2">
              <RotateCcw size={16} className="text-[#D4AF37]" /> ضمان تجربة 7 أيام
            </span>
            <Check size={14} className="text-emerald-400" />
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#0F131C] space-y-2">
          <a
            href={`https://wa.me/${STORE_CONTACTS.whatsapp1}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن الأجهزة المتوفرة في نجم عدن موبايل.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#25D366] py-3 text-xs font-black text-white shadow hover:bg-[#20BA59] transition-all"
          >
            <MessageCircle size={16} /> واتساب المبيعات: {STORE_CONTACTS.phone1}
          </a>
          <a
            href={`tel:${STORE_CONTACTS.phone2}`}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2 text-xs font-bold text-slate-200 hover:border-[#D4AF37] hover:text-white transition-colors"
          >
            <Phone size={14} className="text-[#D4AF37]" /> اتصال بالفرع: {STORE_CONTACTS.phone2}
          </a>
          {onOpenAdmin && (
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-800 bg-[#0B0F17] py-2 text-xs font-bold text-slate-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
            >
              <Lock size={13} className="text-[#D4AF37]" />
              <span>لوحة إدارة المخزون (PIN)</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

// ---------------------------------------------------------------------
// Component: Detailed Multi-Angle Product Modal
// ---------------------------------------------------------------------
function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
  onDirectWhatsApp,
}: {
  product: CatalogProduct;
  onClose: () => void;
  onAddToCart: (prod: CatalogProduct, capacity: string) => void;
  onDirectWhatsApp: (prod: CatalogProduct, capacity: string) => void;
}) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedCap, setSelectedCap] = useState(product.defaultCapacity);
  const [zoomed, setZoomed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
  }, [activeImgIndex]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[1000] grid place-items-center bg-black/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto rounded-2xl bg-[#0F131C] text-slate-100 shadow-2xl border border-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 shadow hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="إغلاق النافذة"
        >
          <X size={18} />
        </button>

        <div className="grid sm:grid-cols-2">
          {/* Photos View */}
          <div className="bg-[#0B0F17] p-4 flex flex-col items-center justify-between border-b sm:border-b-0 sm:border-l border-slate-800">
            <div
              onClick={() => setZoomed(!zoomed)}
              className="relative w-full aspect-square flex items-center justify-center overflow-hidden rounded-xl bg-[#121722] border border-slate-750 cursor-zoom-in"
            >
              {!imgLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121722]">
                  <div className="animate-logo-breath opacity-40">
                    <img
                      src="/assets/logo.png"
                      alt="تحميل"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                      className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.35)]"
                    />
                  </div>
                  <div className="shimmer-sweep" />
                </div>
              )}
              <img
                src={product.images[activeImgIndex] || product.images[0]}
                alt={product.title}
                onLoad={() => setImgLoaded(true)}
                className={`max-h-full max-w-full object-contain transition-all duration-300 ${
                  zoomed ? 'scale-150 cursor-zoom-out' : ''
                } ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
              {imgLoaded && (
                <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-[#0A0D14]/80 border border-slate-700 px-2 py-0.5 text-[9px] text-slate-300">
                  <ZoomIn size={11} className="text-[#D4AF37]" /> انقر للتكبير
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto w-full justify-center pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImgIndex(idx);
                      setZoomed(false);
                    }}
                    className={`h-12 w-12 rounded-lg overflow-hidden border-2 p-1 bg-[#121722] transition-all ${
                      idx === activeImgIndex
                        ? 'border-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.4)]'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-md bg-[#D4AF37] text-[#0A0D14] px-2 py-0.5 text-[10px] font-black">
                  {product.condition}
                </span>
                {product.batteryHealth && (
                  <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                    ⚡ صحة البطارية: {product.batteryHealth}
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-black text-white leading-snug">
                {product.title}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400 font-medium">{product.subtitle}</p>

              {/* Price */}
              <div className="mt-2 text-sm font-black text-[#D4AF37]">
                {product.priceText}
              </div>

              {/* Capacity Selector */}
              {product.capacities && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-300 block mb-1.5">
                    اختر سعة التخزين:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.capacities.map((cap) => (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setSelectedCap(cap)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                          selectedCap === cap
                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5B869] text-[#0A0D14] font-black shadow-sm'
                            : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {cap}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Specs */}
              <div className="mt-3 space-y-1.5 text-xs">
                {product.specs.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-300">
                    <Check size={13} className="text-[#D4AF37] shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, selectedCap);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1A2232] border border-slate-700 py-3 text-xs font-black text-white hover:border-[#D4AF37] hover:bg-[#20293D] active:scale-95 transition-all shadow-md"
              >
                <Plus size={16} className="text-[#D4AF37]" /> إضافة إلى سلة الاستفسار والتسعيرة
              </button>

              <button
                type="button"
                onClick={() => onDirectWhatsApp(product, selectedCap)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-xs font-black text-white hover:bg-[#20BA59] active:scale-95 transition-all shadow-md"
              >
                <MessageCircle size={16} className="fill-white" /> استفسار مباشر عن هذا الجهاز بالواتساب
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// App Routing Shell & Admin Route
// ---------------------------------------------------------------------
function AdminRouteWrapper() {
  const { settings } = useCatalog();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('najm_aden_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  if (!isAdminAuthenticated) {
    return (
      <AdminPinGate
        expectedPin={settings.adminPin || '2026'}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          try {
            sessionStorage.setItem('najm_aden_admin_auth', 'true');
          } catch {}
        }}
        onExit={() => {
          window.location.href = '/';
        }}
      />
    );
  }

  return (
    <AdminDashboard
      onExitToStore={() => {
        window.location.href = '/';
      }}
      onLockSession={() => {
        setIsAdminAuthenticated(false);
        try {
          sessionStorage.removeItem('najm_aden_admin_auth');
        } catch {}
      }}
    />
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={AdminRouteWrapper} />
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CatalogProvider>
        <TooltipProvider>
          <WouterRouter>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </CatalogProvider>
    </QueryClientProvider>
  );
}
