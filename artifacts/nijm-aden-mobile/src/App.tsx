import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Grid2X2,
  LayoutList,
  Menu,
  MessageCircle,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  Tag,
  Truck,
  X,
  ZoomIn,
} from 'lucide-react';
import { catalog, type CatalogProduct, type ProductCategory, STORE_CONTACTS } from '@/data/catalog';
import { Route, Switch, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

// Circular Categories matching Rawah's circle icons
interface CircularCategory {
  key: ProductCategory;
  label: string;
  image: string;
  badge?: string;
}

const circularCategories: CircularCategory[] = [
  { key: 'الكل', label: 'جميع المنتجات', image: '/assets/iphone-blue-front.jpeg' },
  { key: 'هواتف آيفون', label: 'هواتف آيفون', image: '/assets/iphone-gold-front.jpeg' },
  { key: 'السماعات والصوتيات', label: 'السماعات', image: '/assets/joyroom.jpeg' },
  { key: 'إكسسوارات الجوال', label: 'إكسسوارات الجوال', image: '/assets/camera-control.jpeg' },
  { key: 'عروض حصرية', label: 'عروض حصرية', image: '/assets/guarantee-card.jpeg', badge: 'جديد' },
];

// Hero Promos matching Rawah's carousel
interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  image: string;
  ctaText: string;
  productId?: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: 'hero-1',
    badge: 'وصل حديثاً • إصدار فاخر',
    title: 'آيفون 16 برو ماكس',
    highlight: 'التيتانيوم الصحراوي الملكي',
    description: 'الأداء الأقوى بكاميرا احترافية وتصميم فخم، مفحوص بالكامل مع ضمان تجربة 7 أيام واستفسار فوري عبر واتساب.',
    image: '/assets/iphone-gold-combo.jpeg',
    ctaText: 'اطلب عبر واتساب',
    productId: 'iphone-16-pro-gold',
  },
  {
    id: 'hero-2',
    badge: 'الأكثر طلباً • لون استثنائي',
    title: 'آيفون 16 الأزرق البنفسجي',
    highlight: 'Ultramarine الجديد كلياً',
    description: 'زر التحكم بالكاميرا وشاشة فائقة الوضوح. جهازك جاهز للاستلام الفوري من صالة العرض في عدن.',
    image: '/assets/iphone-blue-hero.jpeg',
    ctaText: 'استفسر الآن',
    productId: 'iphone-16-blue',
  },
  {
    id: 'hero-3',
    badge: 'خدمة حصرية من نجم عدن',
    title: 'بوكس التغليف الملكي',
    highlight: 'مع كارت الضمان والفحص',
    description: 'نضمن لك أصالة الجهاز وحالته الممتازة مع بوكس التغليف الفاخر وبطاقة الفحص المعتمدة هدية مع كل جهاز.',
    image: '/assets/guarantee-card.jpeg',
    ctaText: 'تعرف على المزايا',
    productId: 'luxury-packaging-box',
  },
];

function buildWhatsAppUrl(productTitle?: string) {
  const phone = STORE_CONTACTS.whatsapp1;
  const greeting = productTitle
    ? `السلام عليكم، أود الاستفسار عن ${productTitle} المتوفر في متجر نجم عدن موبايل.`
    : `السلام عليكم، أود الاستفسار عن الأجهزة والعروض المتوفرة في نجم عدن موبايل.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`;
}

function openWhatsApp(productTitle?: string) {
  window.open(buildWhatsAppUrl(productTitle), '_blank', 'noopener,noreferrer');
}

function Home() {
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileLayout, setMobileLayout] = useState<'grid-2' | 'grid-1'>('grid-2');
  const [heroIndex, setHeroIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'نجم عدن موبايل | هواتف وإكسسوارات فاخرة بأفضل الأسعار';
  }, []);

  // Hero carousel auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return catalog.filter((product) => {
      const matchCategory = activeCategory === 'الكل' || product.category === activeCategory;
      const matchSearch =
        !query ||
        product.title.toLowerCase().includes(query) ||
        product.subtitle.toLowerCase().includes(query) ||
        product.color.toLowerCase().includes(query) ||
        product.specs.some((s) => s.toLowerCase().includes(query)) ||
        product.tags.some((t) => t.toLowerCase().includes(query));
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const currentHero = heroSlides[heroIndex] || heroSlides[0];

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]" dir="rtl">
      {/* 1. Rawah Style Top Guarantee Strip */}
      <div className="guarantee-bar px-3 py-2 text-center text-[11px] sm:text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 sm:gap-4 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className="guarantee-item">
            <ShieldCheck size={13} className="text-[#d4af37]" /> فحص شامل قبل البيع
          </span>
          <span className="guarantee-bullet">•</span>
          <span className="guarantee-item">
            <RotateCcw size={13} className="text-[#d4af37]" /> ضمان تجربة 7 أيام
          </span>
          <span className="guarantee-bullet">•</span>
          <span className="guarantee-item">
            <Truck size={13} className="text-[#d4af37]" /> خدمة ما بعد البيع
          </span>
          <span className="guarantee-bullet">•</span>
          <span className="guarantee-item">
            <MessageCircle size={13} className="text-[#25d366]" /> تواصل مباشر عبر واتساب
          </span>
        </div>
      </div>

      {/* 2. Main Store Header (Rawah Architecture) */}
      <StoreHeader
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        searchInputRef={searchInputRef}
      />

      <main className="w-full overflow-x-hidden">
        {/* 3. Hero Banner Slider (Rawah Style) */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 pt-3 sm:pt-6">
          <div className="hero-slide relative isolate p-6 sm:p-10 lg:p-12 min-h-[360px] sm:min-h-[420px] flex items-center shadow-lg border border-[#333333]">
            {/* Background Decorative Rings */}
            <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full border border-[#d4af37]/20 pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-60 h-60 rounded-full border border-[#d4af37]/15 pointer-events-none" />
            <div className="absolute right-0 bottom-0 w-96 h-96 bg-radial from-[#d4af37]/10 to-transparent pointer-events-none" />

            <div className="relative z-10 grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Text / Copy */}
              <div className="order-2 lg:order-1 text-right">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 px-3 py-1 text-[11px] font-bold text-[#f3e5ab] mb-4">
                  <Star size={12} className="fill-[#d4af37] text-[#d4af37]" /> {currentHero.badge}
                </span>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                  {currentHero.title}
                  <span className="block mt-1 text-[#d4af37]">{currentHero.highlight}</span>
                </h1>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
                  {currentHero.description}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => openWhatsApp(currentHero.title)}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#c5a880] px-5 py-3 text-xs sm:text-sm font-black text-[#111111] shadow-md hover:brightness-110 active:scale-95 transition-all"
                  >
                    <MessageCircle size={17} /> {currentHero.ctaText}
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('products-grid');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    تصفح الكتالوج <ArrowLeft size={16} />
                  </button>
                </div>
              </div>

              {/* Product Visual */}
              <div className="order-1 lg:order-2 flex justify-center items-center relative">
                <div className="relative w-48 h-48 sm:w-72 sm:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#d4af37]/25 to-transparent blur-2xl" />
                  <img
                    key={currentHero.id}
                    src={currentHero.image}
                    alt={currentHero.title}
                    className="relative z-10 max-h-full max-w-full object-contain filter drop-shadow-2xl transition-all duration-700 animate-fadeIn"
                  />
                </div>
              </div>
            </div>

            {/* Pagination Dots (Rawah Style) */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {heroSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setHeroIndex(idx)}
                  className={`hero-dot-indicator ${idx === heroIndex ? 'active' : ''}`}
                  aria-label={`شريحة ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4. Circular Categories Ribbon (Rawah Exact Architecture) */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 pt-7 sm:pt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-[#b89327] tracking-wider uppercase">الأقسام السريعة</span>
              <h2 className="text-lg sm:text-xl font-black text-[#111111]">تسوق حسب التصنيف</h2>
            </div>
            <span className="text-xs text-gray-500 font-medium">مرر للاستعراض ‹</span>
          </div>

          <div className="circular-categories-scroll">
            {circularCategories.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <div
                  key={cat.key}
                  onClick={() => {
                    setActiveCategory(cat.key);
                    document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`circular-category-item ${isActive ? 'active' : ''}`}
                >
                  <div className="circular-avatar-frame relative">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover rounded-full mix-blend-multiply"
                    />
                    {cat.badge && (
                      <span className="absolute -top-1 -right-1 bg-[#d4af37] text-[#111111] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <span className="circular-category-label">{cat.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Product Grid & Card Anatomy (Rawah Style) */}
        <section id="products-grid" className="mx-auto max-w-7xl px-3 sm:px-6 pt-8 pb-16">
          {/* Header with Title & Mobile View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                <span className="text-[11px] font-bold text-[#888888]">كتالوج نجم عدن المعتمد</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#111111]">
                {activeCategory === 'الكل' ? 'أجهزة وإكسسوارات مختارة' : activeCategory}
              </h2>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              {/* Mobile Column Toggle: 2 cols vs 1 col (Requested in directive) */}
              <div className="flex sm:hidden items-center gap-1 bg-[#f8f9fa] border border-[#eaeaea] p-1 rounded-lg">
                <button
                  onClick={() => setMobileLayout('grid-2')}
                  className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 transition-colors ${
                    mobileLayout === 'grid-2' ? 'bg-[#111111] text-white' : 'text-gray-600'
                  }`}
                  aria-label="عرض شبكي مزدوج"
                >
                  <Grid2X2 size={15} /> <span>مزدوج</span>
                </button>
                <button
                  onClick={() => setMobileLayout('grid-1')}
                  className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 transition-colors ${
                    mobileLayout === 'grid-1' ? 'bg-[#111111] text-white' : 'text-gray-600'
                  }`}
                  aria-label="عرض مفصل فردي"
                >
                  <LayoutList size={15} /> <span>فردي</span>
                </button>
              </div>

              <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5 bg-[#f8f9fa] px-3 py-1.5 rounded-lg border border-[#eaeaea]">
                <Tag size={13} className="text-[#d4af37]" /> {filteredProducts.length} منتجات متوفرة
              </span>
            </div>
          </div>

          {/* Product Cards Container */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-[#f8f9fa] p-12 text-center">
              <Search size={36} className="mx-auto mb-3 text-gray-400" />
              <h3 className="text-base font-bold text-gray-700">لا توجد منتجات مطابقة لبحثك</h3>
              <p className="mt-1 text-xs text-gray-500">جرب البحث بكلمة أخرى أو اختر قسماً مختلفاً من الأعلى</p>
              <button
                onClick={() => {
                  setActiveCategory('الكل');
                  setSearchQuery('');
                }}
                className="mt-4 rounded-lg bg-[#111111] px-4 py-2 text-xs font-bold text-white hover:bg-[#d4af37] hover:text-[#111111] transition-colors"
              >
                عرض كل المنتجات
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-3 sm:gap-5 ${
                mobileLayout === 'grid-1'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  : 'grid-cols-2 lg:grid-cols-4'
              }`}
            >
              {filteredProducts.map((product) => (
                <ProductCardItem
                  key={product.id}
                  product={product}
                  onOpen={() => setSelectedProduct(product)}
                  onWhatsApp={() => openWhatsApp(product.title)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 6. Guarantee & Inspection Banner (Nijm Aden Packaging Proof) */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 pb-16">
          <div className="rounded-2xl border border-[#d4af37]/30 bg-gradient-to-br from-[#161616] to-[#222222] p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] items-center">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/30 px-3 py-1 text-[11px] font-bold text-[#f3e5ab] mb-3">
                  <ShieldCheck size={13} className="text-[#d4af37]" /> ضمان وثقة نجم عدن موبايل
                </span>
                <h3 className="text-xl sm:text-3xl font-black leading-snug">
                  جهازك مفحوص ومضمون، مع تغليف ملكي وبطاقة فحص معتمدة
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
                  نحن لا نبيع أجهزة فقط، بل نمنحك تجربة تسوق راقية تبدأ من الفحص الدقيق لكافة وظائف الجهاز، مروراً بضمان التجربة الحقيقي لمدة 7 أيام، وحتى خدمة ما بعد البيع عبر أرقام الدعم المباشر.
                </p>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <Check size={15} className="text-[#d4af37]" /> أصالة 100%
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={15} className="text-[#d4af37]" /> تجربة 7 أيام
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={15} className="text-[#d4af37]" /> تغليف مجاني
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={15} className="text-[#d4af37]" /> دعم متواصل
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/40 shadow-2xl max-w-xs">
                  <img
                    src="/assets/guarantee-card.jpeg"
                    alt="كارت الضمان والتغليف"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Luxury Store Footer */}
      <footer className="border-t border-gray-200 bg-[#f8f9fa]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-8 border-b border-gray-200">
            {/* Store Branding */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/assets/nijm-aden-logo.jpeg"
                  alt="نجم عدن موبايل"
                  className="h-12 w-12 rounded-xl border border-[#d4af37] p-1 bg-white object-cover"
                />
                <div>
                  <h4 className="text-base font-black text-[#111111]">نجم عدن موبايل</h4>
                  <span className="text-xs text-[#b89327] font-bold">صالة الهواتف والإكسسوارات الفاخرة</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                وجهتكم الأولى في عدن للأجهزة الذكية الأصلية وهواتف آيفون مع فحص شامل وضمان التجربة المعتمد.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="text-sm font-black text-[#111111] mb-3">الأقسام الرئيسية</h5>
              <ul className="space-y-2 text-xs text-gray-600 font-bold">
                {circularCategories.map((c) => (
                  <li key={c.key}>
                    <button
                      onClick={() => {
                        setActiveCategory(c.key);
                        document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hover:text-[#b89327] transition-colors"
                    >
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Address & Hours */}
            <div>
              <h5 className="text-sm font-black text-[#111111] mb-3">العنوان وأوقات العمل</h5>
              <p className="text-xs text-gray-600 leading-relaxed mb-2 font-medium">
                {STORE_CONTACTS.location}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                {STORE_CONTACTS.workingHours}
              </p>
            </div>

            {/* Direct Contact & Support */}
            <div>
              <h5 className="text-sm font-black text-[#111111] mb-3">التواصل المباشر</h5>
              <div className="space-y-2 text-xs font-bold">
                <a
                  href={`tel:${STORE_CONTACTS.phone1}`}
                  className="flex items-center gap-2 text-gray-700 hover:text-[#b89327]"
                >
                  <Phone size={14} className="text-[#d4af37]" /> {STORE_CONTACTS.phone1}
                </a>
                <a
                  href={`tel:${STORE_CONTACTS.phone2}`}
                  className="flex items-center gap-2 text-gray-700 hover:text-[#b89327]"
                >
                  <Phone size={14} className="text-[#d4af37]" /> {STORE_CONTACTS.phone2}
                </a>
                <button
                  onClick={() => openWhatsApp()}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#25d366] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#20ba59] transition-colors"
                >
                  <MessageCircle size={15} /> فتح محادثة واتساب
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()} نجم عدن موبايل</span>
            <span className="text-[11px] text-gray-400">تصميم وتطوير متقدم بهوية فاخرة متجاوبة</span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Action Button (Lower-Left Corner) */}
      <button
        onClick={() => openWhatsApp()}
        className="floating-whatsapp focus:outline-none"
        aria-label="تواصل عبر واتساب"
      >
        <MessageCircle size={20} className="fill-white" />
        <span className="hidden sm:inline">تواصل عبر واتساب</span>
      </button>

      {/* Product Details Modal with Multi-Angle Viewer */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onWhatsApp={() => openWhatsApp(selectedProduct.title)}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Store Header Component (Rawah Architecture)
// -------------------------------------------------------------
function StoreHeader({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  isSearchOpen,
  setIsSearchOpen,
  searchInputRef,
}: {
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      <header className="main-header">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
            {/* Right on mobile / RTL: Hamburger menu (☰) triggering the drawer */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-lg border border-gray-200 text-[#111111] hover:bg-gray-100 transition-colors"
                aria-label="فتح القائمة الجانبية"
              >
                <Menu size={22} />
              </button>

              {/* Quick WhatsApp Support Callout (Desktop) */}
              <button
                onClick={() => openWhatsApp()}
                className="hidden lg:inline-flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg hover:border-[#d4af37] transition-colors"
              >
                <Phone size={13} className="text-[#d4af37]" /> {STORE_CONTACTS.phone1}
              </button>
            </div>

            {/* Center: Official "نجم عدن موبايل" Store Logo */}
            <a href="/" className="flex items-center gap-2.5 sm:gap-3 text-center">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl overflow-hidden border border-[#d4af37] shadow-sm bg-white p-0.5 shrink-0">
                <img
                  src="/assets/nijm-aden-logo.jpeg"
                  alt="شعار نجم عدن موبايل"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-right">
                <span className="block text-base sm:text-xl font-black text-[#111111] tracking-tight leading-none">
                  نجم عدن موبايل
                </span>
                <span className="block text-[10px] sm:text-[11px] font-bold text-[#b89327] mt-1">
                  NIJM ADEN MOBILE
                </span>
              </div>
            </a>

            {/* Left: Quick search icon and direct contact action */}
            <div className="flex items-center gap-2">
              {/* Search Toggle Button */}
              <button
                type="button"
                onClick={toggleSearch}
                className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-lg border border-gray-200 text-[#111111] hover:bg-gray-100 transition-colors"
                aria-label="البحث عن منتج"
              >
                <Search size={19} />
              </button>

              {/* Direct WhatsApp CTA Button */}
              <button
                type="button"
                onClick={() => openWhatsApp()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#111111] px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-white hover:bg-[#d4af37] hover:text-[#111111] transition-all shadow-sm"
                aria-label="تواصل مباشر عبر واتساب"
              >
                <MessageCircle size={16} className="text-[#25d366]" />
                <span className="hidden sm:inline">تواصل مباشر</span>
              </button>
            </div>
          </div>

          {/* Desktop Category Bar (Horizontal under header) */}
          <nav className="hidden md:flex items-center justify-center gap-8 py-2.5 border-t border-gray-100 text-xs font-bold">
            {circularCategories.map((cat) => {
              const active = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => onSelectCategory(cat.key)}
                  className={`relative py-1 transition-colors ${
                    active ? 'text-[#b89327] font-black' : 'text-gray-600 hover:text-[#111111]'
                  }`}
                >
                  {cat.label}
                  {active && (
                    <span className="absolute -bottom-2.5 right-0 left-0 h-0.5 bg-[#d4af37] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Expandable Search Bar */}
          {isSearchOpen && (
            <div className="pb-3 pt-1 border-t border-gray-100 animate-fadeIn">
              <div className="header-search-input flex items-center gap-2 px-4 py-2.5">
                <Search size={17} className="text-gray-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="ابحث عن هاتف، موديل، سعة تخزين، أو إكسسوار..."
                  className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-gray-400 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    aria-label="مسح البحث"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 3. Mobile Slide-Over Drawer (Full-Height Sidebar Directive) */}
      {drawerOpen &&
        createPortal(
          <>
            <div
              className="mobile-drawer-backdrop"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <aside
              className="mobile-drawer-content"
              role="dialog"
              aria-modal="true"
              aria-label="قائمة متجر نجم عدن موبايل"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#fdfbf7]">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/nijm-aden-logo.jpeg"
                    alt="شعار نجم عدن"
                    className="h-9 w-9 rounded-lg border border-[#d4af37] object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-black text-[#111111]">نجم عدن موبايل</h3>
                    <span className="text-[10px] font-bold text-[#b89327]">القائمة الرئيسية</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
                  aria-label="إغلاق القائمة"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Search */}
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-[#f8f9fa] px-3 py-2 text-xs">
                  <Search size={15} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="ابحث في المتجر..."
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              {/* Drawer Category Links with arrows (‹) */}
              <div className="flex-1 overflow-y-auto py-2">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase">
                  التصنيفات
                </div>
                {circularCategories.map((cat) => {
                  const isActive = activeCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => {
                        onSelectCategory(cat.key);
                        setDrawerOpen(false);
                        document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`drawer-category-item w-full ${isActive ? 'active' : ''}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <img
                          src={cat.image}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover border border-gray-200"
                        />
                        <span>{cat.label}</span>
                      </span>
                      <ChevronLeft size={16} className="text-gray-400" />
                    </button>
                  );
                })}

                <div className="px-3 pt-4 pb-1.5 text-[10px] font-bold text-gray-400 uppercase">
                  معلومات وضمانات
                </div>
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#d4af37]" /> فحص شامل قبل التسليم
                  </span>
                  <Check size={14} className="text-green-600" />
                </div>
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-2">
                    <RotateCcw size={16} className="text-[#d4af37]" /> تجربة 7 أيام مضمونة
                  </span>
                  <Check size={14} className="text-green-600" />
                </div>
              </div>

              {/* Drawer Bottom Actions: WhatsApp to 77887578 and 77883537 */}
              <div className="p-4 border-t border-gray-100 bg-[#fdfbf7] space-y-2">
                <div className="text-[11px] font-bold text-gray-500 text-center mb-1">
                  تواصل مباشر عبر أرقام خدمة العملاء
                </div>
                <a
                  href={`https://wa.me/${STORE_CONTACTS.whatsapp1}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن الأجهزة المتوفرة.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#25d366] py-2.5 text-xs font-bold text-white shadow hover:bg-[#20ba59]"
                >
                  <MessageCircle size={16} /> واتساب المبيعات: {STORE_CONTACTS.phone1}
                </a>
                <a
                  href={`https://wa.me/${STORE_CONTACTS.whatsapp2}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن الأجهزة المتوفرة.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 bg-white py-2 text-xs font-bold text-gray-700 hover:border-[#d4af37]"
                >
                  <Phone size={14} className="text-[#d4af37]" /> خط الدعم الثاني: {STORE_CONTACTS.phone2}
                </a>
              </div>
            </aside>
          </>,
          document.body
        )}
    </>
  );
}

// -------------------------------------------------------------
// Product Card Item (Rawah Style: 2 cols on mobile, 4 on desktop)
// -------------------------------------------------------------
function ProductCardItem({
  product,
  onOpen,
  onWhatsApp,
}: {
  product: CatalogProduct;
  onOpen: () => void;
  onWhatsApp: () => void;
}) {
  return (
    <article className="product-card group">
      {/* Product Image Container */}
      <div className="product-image-container cursor-pointer" onClick={onOpen}>
        {/* Stock / Quality Badge */}
        {product.badge && <span className="product-stock-badge">{product.badge}</span>}

        <img
          src={product.images[0]}
          alt={product.title}
          className="product-image-el"
          loading="lazy"
        />

        {/* Quick View Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="absolute bottom-2.5 left-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-[#d4af37] hover:text-white transition-colors"
          aria-label={`معاينة صور ${product.title}`}
        >
          <Eye size={15} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-3 sm:p-4 flex flex-1 flex-col justify-between">
        <div>
          {/* Rating Stars (Rawah Style) */}
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex text-[#f59e0b]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} className="fill-[#f59e0b] text-[#f59e0b]" />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-semibold">({product.reviewsCount})</span>
          </div>

          {/* Title & Subtitle */}
          <h3
            onClick={onOpen}
            className="text-xs sm:text-sm font-black text-[#111111] line-clamp-2 leading-snug cursor-pointer hover:text-[#b89327] transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>
          <p className="mt-1 text-[11px] text-gray-500 line-clamp-1">{product.subtitle}</p>

          {/* Specs pills */}
          <div className="mt-2 flex flex-wrap gap-1">
            {product.specs.slice(0, 2).map((spec, i) => (
              <span
                key={i}
                className="rounded bg-[#f1f3f5] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-gray-600"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Price Indicator & WhatsApp CTA */}
        <div className="mt-4 pt-2.5 border-t border-gray-100">
          <div className="mb-2.5 flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#b89327]">{product.priceText}</span>
            <span className="text-[10px] font-semibold text-gray-400">{product.availability}</span>
          </div>

          {/* Prominent WhatsApp CTA Button (matches Rawah's "أضف إلى السلة" prominent button) */}
          <button
            type="button"
            onClick={onWhatsApp}
            className="whatsapp-cta-btn"
            aria-label={`طلب ${product.title} عبر واتساب`}
          >
            <MessageCircle size={15} className="text-[#25d366]" />
            <span>اسأل أو اطلب عبر واتساب</span>
          </button>
        </div>
      </div>
    </article>
  );
}

// -------------------------------------------------------------
// Detailed Product Modal (Multi-angle photos, zoom, specs)
// -------------------------------------------------------------
function ProductModal({
  product,
  onClose,
  onWhatsApp,
}: {
  product: CatalogProduct;
  onClose: () => void;
  onWhatsApp: () => void;
}) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        setActiveImgIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
      }
      if (e.key === 'ArrowLeft') {
        setActiveImgIndex((prev) => (prev + 1) % product.images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, product.images.length]);

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] grid place-items-center bg-black/70 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl max-h-[92dvh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-gray-100"
          aria-label="إغلاق النافذة"
        >
          <X size={18} />
        </button>

        <div className="grid lg:grid-cols-2">
          {/* Gallery View */}
          <div className="bg-[#f8f9fa] p-4 sm:p-8 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-l border-gray-100">
            <div
              onClick={() => setZoomed(!zoomed)}
              className="relative w-full aspect-square flex items-center justify-center overflow-hidden rounded-xl bg-white border border-gray-200 cursor-zoom-in"
            >
              <img
                src={product.images[activeImgIndex] || product.images[0]}
                alt={product.title}
                className={`max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 ${
                  zoomed ? 'scale-150 cursor-zoom-out' : ''
                }`}
              />
              <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-[10px] text-white">
                <ZoomIn size={12} /> انقر للتكبير
              </span>
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto w-full justify-center pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImgIndex(idx);
                      setZoomed(false);
                    }}
                    className={`h-14 w-14 rounded-lg overflow-hidden border-2 p-1 bg-white transition-all ${
                      idx === activeImgIndex ? 'border-[#d4af37] shadow' : 'border-gray-200 opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & WhatsApp Action */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#b89327]">
                  {product.badge || 'متوفر الآن'}
                </span>
                <span className="text-xs text-gray-500 font-bold">{product.category}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#111111]">{product.title}</h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 font-medium">{product.subtitle}</p>

              <div className="mt-5 space-y-3 border-t border-b border-gray-100 py-4">
                <div>
                  <span className="text-[11px] font-bold text-gray-400">المواصفات الأساسية:</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {product.specs.map((spec, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-[#f8f9fa] border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div>
                    <span className="text-gray-400 block text-[10px]">اللون:</span>
                    <span className="font-bold text-[#111111]">{product.color}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">حالة التوفر:</span>
                    <span className="font-bold text-green-600">{product.availability}</span>
                  </div>
                </div>
              </div>

              {/* Guarantees List */}
              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#d4af37]" /> فحص شامل لجميع وظائف الجهاز
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-[#d4af37]" /> ضمان تجربة حقيقي لمدة 7 أيام
                </div>
              </div>
            </div>

            {/* Bottom Direct Inquiry */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={onWhatsApp}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c5a880] py-3.5 text-sm font-black text-[#111111] shadow-lg hover:brightness-105 active:scale-95 transition-all"
              >
                <MessageCircle size={18} /> طلب أو استفسار فوري عبر واتساب
              </button>
              <p className="mt-2.5 text-center text-[11px] text-gray-500 font-medium">
                تواصل مباشر مع مبيعات نجم عدن: <b>{STORE_CONTACTS.phone1}</b> / <b>{STORE_CONTACTS.phone2}</b>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// -------------------------------------------------------------
// Routing & App Shell
// -------------------------------------------------------------
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}