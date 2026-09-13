import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
  ChevronDown,
  ClipboardCheck,
  Eye,
  Grid2X2,
  LayoutList,
  Menu,
  MessageCircle,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Tag,
  X,
  ZoomIn,
} from 'lucide-react';
import { catalog, type CatalogProduct } from '@/data/catalog';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type CategoryKey = 'all' | 'phones' | 'iphone' | 'accessories' | 'earbuds' | 'offers';

const categoryOptions: { key: CategoryKey; label: string }[] = [
  { key: 'all', label: 'كل المنتجات' },
  { key: 'phones', label: 'الهواتف' },
  { key: 'iphone', label: 'آيفون' },
  { key: 'accessories', label: 'الإكسسوارات' },
  { key: 'earbuds', label: 'السماعات' },
  { key: 'offers', label: 'العروض' },
];

const categoryTiles: { key: CategoryKey; label: string; image: string }[] = [
  { key: 'iphone', label: 'آيفون', image: '/assets/iphone-blue-front.jpeg' },
  { key: 'phones', label: 'الهواتف', image: '/assets/iphone-gold-front.jpeg' },
  { key: 'earbuds', label: 'السماعات والصوتيات', image: '/assets/joyroom.jpeg' },
  { key: 'accessories', label: 'الإكسسوارات', image: '/assets/camera-control.jpeg' },
];

const categoryPaths: Record<CategoryKey, string> = {
  all: '/category/products',
  phones: '/category/phones',
  iphone: '/category/iphones',
  accessories: '/category/accessories',
  earbuds: '/category/earbuds',
  offers: '/category/offers',
};

const categorySlugs: Record<string, CategoryKey> = {
  products: 'all',
  all: 'all',
  phones: 'phones',
  iphones: 'iphone',
  iphone: 'iphone',
  accessories: 'accessories',
  earbuds: 'earbuds',
  offers: 'offers',
};

const categoryMeta: Record<CategoryKey, { label: string; description: string }> = {
  all: { label: 'كل المنتجات', description: 'اكتشف كامل مختارات نجم عدن من الهواتف والإكسسوارات.' },
  phones: { label: 'الهواتف', description: 'هواتف منتقاة بعناية مع تفاصيل واضحة وحالة موثقة.' },
  iphone: { label: 'آيفون', description: 'مختارات آيفون بألوان وسعات مختلفة لتجد ما يناسبك.' },
  accessories: { label: 'الإكسسوارات', description: 'إكسسوارات عملية تكمل تجربتك اليومية.' },
  earbuds: { label: 'السماعات والصوتيات', description: 'صوت واضح وتجربة لاسلكية للاستخدام اليومي.' },
  offers: { label: 'العروض', description: 'منتجات مختارة بعلامات مميزة وتواصل مباشر لمعرفة التفاصيل.' },
};

const heroMessages = [
  { kicker: 'وصل حديثاً', title: 'تجربة راقية', highlight: 'تبدأ من اختيارك.', description: 'أجهزة أصلية منتقاة بعناية، مع فحص واضح وتجربة تمنحك راحة البال قبل اتخاذ القرار.' },
  { kicker: 'مختارات نجم عدن', title: 'تقنية تليق', highlight: 'بذوقك.', description: 'ألوان مميزة، حالات موثقة، وتفاصيل نوضحها لك قبل أن تختار.' },
  { kicker: 'تواصل مباشر', title: 'اسأل عن جهازك', highlight: 'بكل ثقة.', description: 'أرسل لنا المنتج الذي أعجبك، وسنشاركك كل التفاصيل عبر واتساب.' },
];

function openWhatsApp(productName = 'كتالوج نجم عدن موبايل') {
  const message = `السلام عليكم، أريد الاستفسار عن ${productName}`;
  window.open(`https://wa.me/96777887578?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function filterCatalog(category: CategoryKey, search = '') {
  const normalizedSearch = search.trim().toLowerCase();
  return catalog.filter((product) => {
    const matchesCategory =
      category === 'all' ||
      (category === 'phones' && product.category === 'هواتف') ||
      (category === 'iphone' && product.category === 'هواتف' && product.title.toLowerCase().includes('iphone')) ||
      (category === 'accessories' && product.category === 'إكسسوارات') ||
      (category === 'earbuds' && product.tags.includes('سماعات')) ||
      (category === 'offers' && Boolean(product.badge));
    const searchable = [product.title, product.subtitle, product.category, product.color, ...product.specs, ...product.tags].join(' ').toLowerCase();
    return matchesCategory && (!normalizedSearch || searchable.includes(normalizedSearch));
  });
}

function Home() {
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [search, setSearch] = useState('');
  const [catalogView, setCatalogView] = useState<'large' | 'compact'>('large');
  const [heroIndex, setHeroIndex] = useState(0);
  const [, setLocation] = useLocation();
  const heroProducts = useMemo(() => catalog.slice(0, 3), []);
  const heroProduct = heroProducts[heroIndex] ?? heroProducts[0];
  const normalizedSearch = search.trim().toLowerCase();
  const hasFilter = activeCategory !== 'all' || normalizedSearch.length > 0;

  const filteredProducts = useMemo(() => {
    return filterCatalog(activeCategory, search);
  }, [activeCategory, normalizedSearch]);

  useEffect(() => {
    document.title = 'نجم عدن موبايل — متجر الهواتف والإكسسوارات';
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setHeroIndex((current) => (current + 1) % heroProducts.length), 6500);
    return () => window.clearInterval(timer);
  }, [heroProducts.length]);

  if (!heroProduct) return null;

  const featuredProducts = filteredProducts.filter((product) => product.featured);
  const newProducts = filteredProducts.filter((product) => product.isNew);
  const accessoryProducts = filteredProducts.filter((product) => product.category === 'إكسسوارات');

  return (
    <div className="site-shell grain min-h-[100dvh]" dir="rtl">
      <div className="store-topline bg-[hsl(var(--primary))] px-5 py-2 text-center text-[11px] font-semibold text-[hsl(var(--primary-foreground))]">
        <span>فحص شامل قبل البيع</span><span className="mx-3 text-[hsl(var(--secondary))]">•</span><span>تجربة 7 أيام</span><span className="mx-3 text-[hsl(var(--secondary))]">•</span><span>تواصل مباشر عبر واتساب</span>
      </div>

      <StoreHeader activeCategory={activeCategory} search={search} onSearchChange={setSearch} onOpenWhatsApp={openWhatsApp} />

      <main id="top">
        <section className="hero-banner relative isolate overflow-hidden">
          <div className="hero-banner-wash absolute inset-0 -z-10" />
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:py-14 lg:grid-cols-[1fr_.9fr] lg:px-10 lg:py-16">
            <div className="hero-banner-copy rise order-2 lg:order-1">
              <p className="eyebrow mb-5 flex items-center gap-3 text-[hsl(var(--secondary))]"><span className="h-px w-10 bg-[hsl(var(--secondary))]" /> {heroMessages[heroIndex]?.kicker}</p>
              <h1 className="max-w-2xl text-4xl font-black leading-[1.14] tracking-[-.04em] text-white sm:text-6xl lg:text-[5.2rem]">{heroMessages[heroIndex]?.title}<br /><span className="text-[hsl(var(--secondary))]">{heroMessages[heroIndex]?.highlight}</span></h1>
              <p className="mt-6 max-w-lg text-[15px] font-semibold leading-8 text-white/75">{heroMessages[heroIndex]?.description}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button onClick={() => { setActiveCategory('all'); setSearch(''); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="focus-ring inline-flex items-center gap-3 bg-[hsl(var(--secondary))] px-6 py-4 text-sm font-black text-[hsl(var(--secondary-foreground))] transition-all hover:-translate-y-1 hover:bg-white">تصفح المنتجات <ArrowLeft size={18} /></button>
                <button onClick={() => openWhatsApp(heroProduct.title)} className="focus-ring inline-flex items-center gap-2 border border-white/30 px-5 py-4 text-sm font-bold text-white transition-colors hover:border-[hsl(var(--secondary))]"><MessageCircle size={17} /> اسأل الآن</button>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/15 pt-5 text-xs font-semibold text-white/75">
                <span className="inline-flex items-center gap-2"><Check size={14} className="text-[hsl(var(--secondary))]" /> أصالة وحالة موثقة</span>
                <span className="inline-flex items-center gap-2"><Check size={14} className="text-[hsl(var(--secondary))]" /> تجربة 7 أيام</span>
              </div>
            </div>
            <div className="hero-banner-art rise rise-delay-2 order-1">
              <div className="hero-product-orbit absolute -inset-10 rounded-full border border-white/10" />
              <div className="hero-product-orbit hero-product-orbit-small absolute -inset-3 rounded-full border border-[hsl(var(--secondary)/.45)]" />
              <img key={heroProduct.id} src={heroProduct.images[0]} alt={`${heroProduct.title} ${heroProduct.subtitle}`} className="hero-banner-product relative z-10 w-full object-cover mix-blend-multiply" />
              <div className="hero-product-label absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-white/95 px-4 py-3 text-xs font-black text-[hsl(var(--primary))] shadow-lg sm:bottom-8 sm:left-8"><span className="h-2 w-2 rounded-full bg-[hsl(var(--secondary))]" /> {heroProduct.badge ?? 'متوفر الآن'}</div>
              <div className="hero-product-name absolute right-3 top-3 z-20 border border-white/20 bg-[hsl(var(--primary)/.65)] px-4 py-3 text-xs font-bold text-white backdrop-blur-md sm:right-8 sm:top-8">{heroProduct.title} — {heroProduct.color}</div>
            </div>
          </div>
          <div className="hero-dots relative z-20 flex items-center justify-center gap-2 pb-7">
            {heroProducts.map((product, index) => <button key={product.id} onClick={() => setHeroIndex(index)} className={`hero-dot focus-ring h-2.5 rounded-full transition-all ${heroIndex === index ? 'active w-9' : 'w-2.5'}`} aria-label={`عرض الشريحة ${index + 1}`} />)}
          </div>
        </section>

        <section id="categories" className="category-section mx-auto max-w-7xl scroll-mt-36 px-5 py-10 lg:px-10 lg:py-14">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div><p className="eyebrow mb-2">تصفح سريع</p><h2 className="text-2xl font-black tracking-tight sm:text-3xl">تسوق حسب التصنيف</h2></div>
            <span className="hidden text-xs font-semibold text-[hsl(var(--foreground)/.55)] sm:inline">اختر ما يناسبك</span>
          </div>
          <div className="category-grid grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-7">
            {categoryTiles.map((category) => <button key={category.key} onClick={() => setLocation(categoryPaths[category.key])} className={`category-tile focus-ring group ${activeCategory === category.key ? 'active' : ''}`} aria-pressed={activeCategory === category.key}><span className="category-image mx-auto block overflow-hidden rounded-full border-4 border-[hsl(var(--muted))] bg-[hsl(var(--muted))] p-2 transition-all group-hover:border-[hsl(var(--secondary))] group-hover:shadow-[var(--shadow)]"><img src={category.image} alt="" className="h-full w-full rounded-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-110" /></span><span className="mt-4 block text-sm font-black text-[hsl(var(--foreground)/.78)] transition-colors group-hover:text-[hsl(var(--foreground))]">{category.label}</span></button>)}
          </div>
        </section>

        <section id="products" className="mx-auto max-w-7xl scroll-mt-36 px-5 pb-16 pt-10 lg:px-10 lg:pb-24">
            <div className="store-section-heading mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow mb-3">{hasFilter ? 'نتائج التصفح' : '01 — اكتشف المختارات'}</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{hasFilter ? 'المنتجات المطابقة' : 'منتجات تستحق الاختيار'}</h2>
            </div>
             <div className="flex flex-wrap items-center gap-4">
               <div className="catalog-view-toggle flex items-center gap-1 border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1" role="group" aria-label="طريقة عرض المنتجات">
                 <button
                   type="button"
                   onClick={() => setCatalogView('large')}
                   className={`focus-ring view-toggle-button inline-flex items-center gap-2 px-3 py-2 text-xs font-bold transition-colors ${catalogView === 'large' ? 'active' : ''}`}
                   aria-pressed={catalogView === 'large'}
                   title="العرض الكبير"
                 >
                   <LayoutList size={15} /> <span>كبير</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setCatalogView('compact')}
                   className={`focus-ring view-toggle-button inline-flex items-center gap-2 px-3 py-2 text-xs font-bold transition-colors ${catalogView === 'compact' ? 'active' : ''}`}
                   aria-pressed={catalogView === 'compact'}
                   title="العرض الشبكي"
                 >
                   <Grid2X2 size={15} /> <span>شبكة</span>
                 </button>
               </div>
               <div className="flex items-center gap-2 text-xs text-[hsl(var(--foreground)/.55)]"><Tag size={14} className="text-[hsl(var(--secondary-foreground))]" /> {filteredProducts.length} منتجات متاحة</div>
             </div>
          </div>

          {hasFilter ? (
             <ProductShelf view={catalogView} products={filteredProducts} onOpen={setSelected} onWhatsApp={openWhatsApp} />
          ) : (
            <div className="space-y-16">
               <ProductShelf view={catalogView} eyebrow="الأكثر طلباً" title="مختارات العملاء" products={featuredProducts} onOpen={setSelected} onWhatsApp={openWhatsApp} />
               <ProductShelf view={catalogView} eyebrow="وصل حديثاً" title="أحدث الوصول" products={newProducts} onOpen={setSelected} onWhatsApp={openWhatsApp} />
               <ProductShelf view={catalogView} eyebrow="لإكمال تجربتك" title="إكسسوارات مختارة" products={accessoryProducts} onOpen={setSelected} onWhatsApp={openWhatsApp} />
            </div>
          )}
        </section>

        <section id="promise" className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-24">
            <div><p className="eyebrow text-[hsl(var(--secondary))]">02 — وعد نجم عدن</p><h2 className="mt-4 max-w-sm text-4xl font-extrabold leading-[1.3] tracking-tight">الشراء بثقة<br /><span className="text-[hsl(var(--secondary))]">يبدأ من الوضوح.</span></h2><p className="mt-6 max-w-sm text-sm leading-8 text-[hsl(var(--primary-foreground)/.62)]">نعرض لك حالة المنتج بوضوح، ونبقى قريبين منك قبل وبعد الاختيار.</p></div>
            <div className="grid gap-px bg-[hsl(var(--primary-foreground)/.14)] sm:grid-cols-3">
              <Promise icon={<ShieldCheck />} title="جودة مضمونة" text="أصالة الجهاز وحالته موثقة بوضوح." />
              <Promise icon={<ClipboardCheck />} title="فحص شامل" text="نختبر كل تفصيلة قبل أن تصل إليك." />
              <Promise icon={<RotateCcw />} title="7 أيام تجربة" text="خذ وقتك لتتأكد أن الاختيار لك." />
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-5 py-16 lg:px-10 lg:py-24">
          <div className="relative overflow-hidden border border-[hsl(var(--secondary)/.42)] bg-[hsl(var(--muted))] px-6 py-12 sm:px-12">
            <div className="absolute -left-20 -top-28 h-72 w-72 rounded-full border border-[hsl(var(--secondary)/.35)]" /><div className="absolute -left-10 -top-18 h-52 w-52 rounded-full border border-[hsl(var(--secondary)/.25)]" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]"><div><p className="eyebrow mb-3">03 — على مسافة رسالة</p><h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">وجدت ما يناسبك؟</h2><p className="mt-4 text-sm leading-7 text-[hsl(var(--foreground)/.62)]">أرسل لنا اسم المنتج، وسنعود إليك بكل التفاصيل.</p></div><button onClick={() => openWhatsApp()} className="focus-ring inline-flex items-center justify-center gap-3 bg-[hsl(var(--primary))] px-7 py-4 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-1"><MessageCircle size={18} /> استفسار أو اطلب عبر الواتساب</button></div>
          </div>
        </section>
      </main>

       <footer className="border-t border-[hsl(var(--foreground)/.1)]">
         <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-8 text-xs text-[hsl(var(--foreground)/.58)] sm:flex-row sm:items-center sm:justify-between lg:px-10">
           <div className="flex min-w-0 items-center gap-4">
             <span className="logo-frame logo-frame-footer grid h-16 w-16 shrink-0 place-items-center overflow-hidden border border-[hsl(var(--secondary)/.7)] bg-white p-1">
               <img src="/assets/nijm-aden-logo.jpeg" alt="شعار نجم عدن موبايل" className="logo-image h-full w-full object-cover" />
             </span>
             <div><b className="block text-sm text-[hsl(var(--foreground))]">نجم عدن موبايل</b><span className="mt-1 block">صالة هواتف منتقاة من صنعاء</span></div>
           </div>
           <div className="flex flex-wrap gap-5"><span className="inline-flex items-center gap-2"><Phone size={13} /> 77887578 / 77883537</span><span>© 2025 نجم عدن</span></div>
         </div>
      </footer>
      <button onClick={() => openWhatsApp()} className="wa-float focus-ring fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#1d6844] px-5 py-3 text-sm font-bold text-white"><MessageCircle size={18} /> واتساب</button>
       {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onWhatsApp={() => openWhatsApp(selected.title)} />}
    </div>
  );
}

function StoreHeader({ activeCategory, search, onSearchChange, onOpenWhatsApp }: { activeCategory: CategoryKey; search: string; onSearchChange: (value: string) => void; onOpenWhatsApp: (productName?: string) => void }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!mobileMenu) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setMobileMenu(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenu(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileMenu]);

  const goToCategory = (category: CategoryKey) => {
    setMobileMenu(false);
    setLocation(categoryPaths[category]);
  };

  return (
    <header ref={headerRef} className="relative z-20 border-b border-[hsl(var(--foreground)/.09)] bg-[hsl(var(--background)/.9)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-4 lg:px-10">
        <a href="/" className="focus-ring flex min-w-0 shrink-0 items-center gap-3">
          <span className="logo-frame grid h-12 w-12 shrink-0 place-items-center overflow-hidden border border-[hsl(var(--secondary)/.8)] bg-white">
            <img src="/assets/nijm-aden-logo.jpeg" alt="شعار نجم عدن موبايل" className="logo-image h-full w-full object-cover" />
          </span>
          <span><strong className="block text-[15px] font-extrabold tracking-tight">نجم عدن موبايل</strong><span className="eyebrow">مختارات تستحقها</span></span>
        </a>
        <form className="store-search hidden min-w-0 flex-1 items-center gap-3 border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 md:flex" onSubmit={(event) => { event.preventDefault(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
          <Search size={17} className="shrink-0 text-[hsl(var(--foreground)/.48)]" />
          <input value={search} onChange={(event) => onSearchChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[hsl(var(--foreground)/.45)]" placeholder="ابحث عن جهاز أو إكسسوار..." aria-label="البحث في المنتجات" />
          {search && <button type="button" onClick={() => onSearchChange('')} className="focus-ring text-[hsl(var(--foreground)/.5)]" aria-label="مسح البحث"><X size={15} /></button>}
        </form>
        <div className="mr-auto flex items-center gap-2">
          <button onClick={() => onOpenWhatsApp()} className="focus-ring hidden items-center gap-2 border border-[hsl(var(--primary))] px-4 py-3 text-xs font-bold text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] sm:inline-flex"><MessageCircle size={15} /> تواصل الآن</button>
          <button onClick={() => setMobileMenu((open) => !open)} className="focus-ring grid h-11 w-11 place-items-center border border-[hsl(var(--border))] md:hidden" aria-expanded={mobileMenu} aria-controls="mobile-navigation" aria-label={mobileMenu ? 'إغلاق القائمة' : 'فتح القائمة'}>{mobileMenu ? <X size={19} /> : <Menu size={19} />}</button>
          <a href="/#products" className="focus-ring hidden h-11 w-11 place-items-center border border-[hsl(var(--border))] text-[hsl(var(--foreground)/.72)] sm:grid" aria-label="المنتجات"><ShoppingBag size={18} /></a>
        </div>
      </div>
      <nav className="mx-auto hidden max-w-7xl flex-wrap items-center gap-x-7 gap-y-4 px-5 pb-4 lg:px-10 md:flex" aria-label="تصنيفات المتجر">
        <span className="hidden shrink-0 items-center gap-2 text-xs font-bold text-[hsl(var(--foreground)/.5)] md:inline-flex"><SlidersHorizontal size={14} /> تصفح حسب</span>
        {categoryOptions.map((category) => <a key={category.key} href={categoryPaths[category.key]} onClick={() => setMobileMenu(false)} className={`category-link focus-ring text-xs font-bold transition-colors ${activeCategory === category.key ? 'active' : ''}`}>{category.label}</a>)}
        <a href="/#promise" className="category-link focus-ring text-xs font-bold">لماذا نجم عدن؟</a>
      </nav>
      <div id="mobile-navigation" aria-hidden={!mobileMenu} className={`mobile-menu-layer md:hidden ${mobileMenu ? 'open' : ''}`}>
        <button type="button" className="mobile-menu-backdrop" onClick={() => setMobileMenu(false)} aria-label="إغلاق القائمة" tabIndex={mobileMenu ? 0 : -1} />
        <aside className="mobile-menu-drawer" role="dialog" aria-modal="true" aria-label="قائمة متجر نجم عدن">
          <div className="mobile-drawer-heading">
            <div>
              <p className="eyebrow">نجم عدن موبايل</p>
              <h2>القائمة الرئيسية</h2>
            </div>
            <button type="button" onClick={() => setMobileMenu(false)} className="focus-ring mobile-drawer-close" aria-label="إغلاق القائمة" tabIndex={mobileMenu ? 0 : -1}><X size={20} /></button>
          </div>
          <form className="store-search mobile-drawer-search mb-5 flex items-center gap-3 border px-4 py-3" onSubmit={(event) => { event.preventDefault(); setMobileMenu(false); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
            <Search size={17} className="shrink-0" />
            <input autoFocus={mobileMenu} value={search} onChange={(event) => onSearchChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs outline-none" placeholder="ابحث عن منتج..." aria-label="البحث في المنتجات" tabIndex={mobileMenu ? 0 : -1} />
          </form>
          <nav className="mobile-menu-list" aria-label="التنقل في المتجر">
            {categoryOptions.map((category) => <a key={category.key} href={categoryPaths[category.key]} onClick={() => setMobileMenu(false)} className={`mobile-menu-link ${activeCategory === category.key ? 'active' : ''}`} aria-current={activeCategory === category.key ? 'page' : undefined} tabIndex={mobileMenu ? 0 : -1}>{category.label}</a>)}
            <a href="/#promise" onClick={() => setMobileMenu(false)} className="mobile-menu-link" tabIndex={mobileMenu ? 0 : -1}>لماذا نجم عدن؟</a>
            <a href="/#contact" onClick={() => setMobileMenu(false)} className="mobile-menu-link" tabIndex={mobileMenu ? 0 : -1}>تواصل معنا</a>
            <button onClick={() => { setMobileMenu(false); onOpenWhatsApp(); }} className="mobile-menu-link accent" tabIndex={mobileMenu ? 0 : -1}>استفسار عبر واتساب</button>
          </nav>
        </aside>
      </div>
    </header>
  );
}

function CategoryPage({ slug }: { slug: string }) {
  const categoryKey = categorySlugs[slug];
  const resolvedCategory = categoryKey ?? 'all';
  const meta = categoryMeta[resolvedCategory];
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  useEffect(() => {
    if (meta) {
      document.title = `${meta.label} — نجم عدن موبايل`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [meta]);

  const products = useMemo(() => {
    const visible = filterCatalog(resolvedCategory, search).filter((product) => !availabilityOnly || product.availability.includes('متوفر'));
    return [...visible].sort((a, b) => sortBy === 'newest' ? Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) : Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [availabilityOnly, resolvedCategory, search, sortBy]);

  if (!meta) return <NotFound />;

  return (
    <div className="site-shell grain min-h-[100dvh]" dir="rtl">
      <div className="store-topline bg-[hsl(var(--primary))] px-5 py-2 text-center text-[11px] font-semibold text-[hsl(var(--primary-foreground))]"><span>فحص شامل قبل البيع</span><span className="mx-3 text-[hsl(var(--secondary))]">•</span><span>تجربة 7 أيام</span><span className="mx-3 text-[hsl(var(--secondary))]">•</span><span>تواصل مباشر عبر واتساب</span></div>
      <StoreHeader activeCategory={resolvedCategory} search={search} onSearchChange={setSearch} onOpenWhatsApp={openWhatsApp} />
      <main id="products" className="category-page mx-auto max-w-7xl px-5 pb-16 pt-7 lg:px-10 lg:pb-24">
        <nav className="breadcrumb mb-9 flex items-center gap-2 text-xs font-bold" aria-label="مسار التنقل"><a href="/" className="transition-colors hover:text-[hsl(var(--secondary-foreground))]">الرئيسية</a><ChevronLeft size={14} className="text-[hsl(var(--foreground)/.35)]" /><span className="text-[hsl(var(--foreground)/.55)]">{meta.label}</span></nav>
        <div className="mb-8 flex flex-col gap-5 border-b border-[hsl(var(--border))] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow mb-3">كتالوج نجم عدن</p><h1 className="text-3xl font-black tracking-tight sm:text-5xl">{meta.label}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[hsl(var(--foreground)/.62)]">{meta.description}</p></div>
          <a href="/" className="focus-ring inline-flex shrink-0 items-center gap-2 border border-[hsl(var(--border))] px-4 py-3 text-xs font-bold transition-colors hover:border-[hsl(var(--secondary))]">العودة للرئيسية <ArrowLeft size={15} /></a>
        </div>
        <div className="category-actions relative z-10 mb-7 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button onClick={() => { setFilterOpen((open) => !open); setSortOpen(false); }} className={`category-action-button focus-ring ${filterOpen || availabilityOnly ? 'active' : ''}`} aria-expanded={filterOpen}><SlidersHorizontal size={15} /> تصفية</button>
              {filterOpen && <div className="category-popover right-0 mt-2 min-w-52"><p className="mb-3 text-xs font-black">عرض المنتجات</p><button onClick={() => setAvailabilityOnly(false)} className={`category-option ${!availabilityOnly ? 'active' : ''}`}>كل المنتجات <Check size={14} /></button><button onClick={() => setAvailabilityOnly(true)} className={`category-option ${availabilityOnly ? 'active' : ''}`}>متوفر الآن <Check size={14} /></button></div>}
            </div>
            <div className="relative">
              <button onClick={() => { setSortOpen((open) => !open); setFilterOpen(false); }} className={`category-action-button focus-ring ${sortOpen ? 'active' : ''}`} aria-expanded={sortOpen}>ترتيب حسب: {sortBy === 'newest' ? 'الأحدث' : 'الأكثر طلباً'} <ChevronDown size={15} /></button>
              {sortOpen && <div className="category-popover right-0 mt-2 min-w-52"><button onClick={() => { setSortBy('newest'); setSortOpen(false); }} className={`category-option ${sortBy === 'newest' ? 'active' : ''}`}>الأحدث <Check size={14} /></button><button onClick={() => { setSortBy('popular'); setSortOpen(false); }} className={`category-option ${sortBy === 'popular' ? 'active' : ''}`}>الأكثر طلباً <Check size={14} /></button></div>}
            </div>
          </div>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--foreground)/.55)]"><Tag size={14} className="text-[hsl(var(--secondary-foreground))]" /> {products.length} منتجات</span>
        </div>
        <ProductShelf view="compact" products={products} onOpen={setSelected} onWhatsApp={openWhatsApp} />
      </main>
      <footer className="border-t border-[hsl(var(--foreground)/.1)]"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-7 text-xs text-[hsl(var(--foreground)/.58)] lg:px-10"><a href="/" className="font-black text-[hsl(var(--foreground))]">نجم عدن موبايل</a><span>77887578 / 77883537</span></div></footer>
      <button onClick={() => openWhatsApp()} className="wa-float focus-ring fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#1d6844] px-5 py-3 text-sm font-bold text-white"><MessageCircle size={18} /> واتساب</button>
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onWhatsApp={() => openWhatsApp(selected.title)} />}
    </div>
  );
}

function ProductShelf({ eyebrow, title, products, view, onOpen, onWhatsApp }: { eyebrow?: string; title?: string; products: CatalogProduct[]; view: 'large' | 'compact'; onOpen: (product: CatalogProduct) => void; onWhatsApp: (productName: string) => void }) {
  if (!products.length) {
    return <div className="border border-dashed border-[hsl(var(--border))] px-6 py-16 text-center"><Search className="mx-auto mb-4 text-[hsl(var(--foreground)/.4)]" size={26} /><h3 className="font-bold">لم نعثر على منتجات مطابقة</h3><p className="mt-2 text-xs text-[hsl(var(--foreground)/.55)]">جرّب كلمة أخرى أو اختر تصنيفاً مختلفاً.</p></div>;
  }
   return <div>{eyebrow && title && <div className="mb-5 flex items-end justify-between gap-4"><div><p className="eyebrow mb-2">{eyebrow}</p><h3 className="text-2xl font-extrabold tracking-tight">{title}</h3></div><span className="hidden text-xs text-[hsl(var(--foreground)/.5)] sm:inline-flex">{products.length} منتجات</span></div>}<div className={view === 'large' ? 'grid gap-6 lg:grid-cols-2' : 'grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4'}>{products.map((product, index) => <ProductCard key={`${product.id}-${index}`} product={product} index={index} view={view} onOpen={() => onOpen(product)} onWhatsApp={() => onWhatsApp(product.title)} />)}</div></div>;
}

function ProductCard({ product, index, view, onOpen, onWhatsApp }: { product: CatalogProduct; index: number; view: 'large' | 'compact'; onOpen: () => void; onWhatsApp: () => void }) {
  const compact = view === 'compact';
  return <article className={`product-card rise flex flex-col border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] ${compact ? 'product-card-compact' : 'product-card-large'}`} style={{ animationDelay: `${index * 90}ms` }}>
    <button onClick={onOpen} className="focus-ring block w-full text-right">
      <div className={`relative overflow-hidden bg-[hsl(var(--muted))] ${compact ? 'p-2.5 sm:p-4' : 'p-4 sm:p-6'}`}><img src={product.images[0]} alt={`${product.title} ${product.subtitle}`} className={`product-image w-full object-cover mix-blend-multiply ${compact ? 'aspect-square' : 'aspect-[1.2]'}`} />{product.badge && <span className={`absolute right-4 top-4 bg-[hsl(var(--primary))] px-3 py-1 text-[10px] font-bold text-[hsl(var(--primary-foreground))] ${compact ? 'max-w-[calc(100%-2rem)] truncate' : ''}`}>{product.badge}</span>}<span className={`absolute grid place-items-center rounded-full bg-[hsl(var(--background)/.86)] text-[hsl(var(--foreground))] ${compact ? 'bottom-3 left-3 h-8 w-8' : 'bottom-5 left-5 h-10 w-10'}`}><Eye size={compact ? 14 : 17} /></span></div>
      <div className={compact ? 'px-3 pt-3 sm:px-5 sm:pt-5' : 'px-5 pt-5'}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className={`truncate font-extrabold ${compact ? 'text-sm sm:text-lg' : 'text-xl'}`}>{product.title}</h3><p className="mt-1 truncate text-xs text-[hsl(var(--foreground)/.58)]">{product.subtitle}</p></div><span className="mt-1 h-3 w-3 shrink-0 rounded-full border border-[hsl(var(--foreground)/.2)]" style={{ background: product.accent }} /></div></div>
    </button>
    <div className={`flex flex-1 flex-col ${compact ? 'px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-4' : 'px-5 pb-6 pt-4'}`}><div className={`flex flex-wrap gap-2 ${compact ? 'mb-3 max-h-8 overflow-hidden' : 'mb-4'}`}>{product.specs.map((spec) => <span key={spec} className="border border-[hsl(var(--border))] px-2 py-1 text-[10px] text-[hsl(var(--foreground)/.61)]">{spec}</span>)}</div><div className={`flex items-center justify-between gap-2 text-[10px] font-semibold text-[hsl(var(--foreground)/.58)] ${compact ? 'mb-3' : 'mb-5'}`}><span className="inline-flex min-w-0 items-center gap-1 truncate"><Check size={12} className="shrink-0 text-[hsl(var(--secondary-foreground))]" /> {product.availability}</span><span className="shrink-0">{product.category}</span></div><div className="mb-4 flex items-center gap-1 text-[10px] font-bold text-[hsl(var(--secondary-foreground))]"><Tag size={12} /> السعر عند الاستفسار</div>{!compact && <div className="mb-5 flex flex-wrap gap-3 border-y border-[hsl(var(--border))] py-3 text-[10px] font-semibold text-[hsl(var(--foreground)/.58)]"><span className="inline-flex items-center gap-1"><ShieldCheck size={13} className="text-[hsl(var(--secondary-foreground))]" /> فحص شامل</span><span className="inline-flex items-center gap-1"><Check size={13} className="text-[hsl(var(--secondary-foreground))]" /> تجربة 7 أيام</span></div>}<div className="mt-auto grid grid-cols-[1fr_auto] gap-2"><button onClick={onWhatsApp} className={`focus-ring inline-flex items-center justify-center gap-2 bg-[hsl(var(--primary))] font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5 ${compact ? 'px-2 py-2.5 text-[10px] sm:px-3 sm:text-xs' : 'px-3 py-3 text-xs'}`}><MessageCircle size={compact ? 14 : 15} /> <span className={compact ? 'hidden sm:inline' : ''}>اسأل عبر واتساب</span></button><button onClick={onOpen} className={`focus-ring grid place-items-center border border-[hsl(var(--border))] ${compact ? 'w-9' : 'px-3'}`} aria-label={`تفاصيل ${product.title}`}><ArrowLeft size={16} /></button></div></div>
  </article>;
}

function Promise({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="bg-[hsl(var(--primary))] p-7"><div className="mb-8 text-[hsl(var(--secondary))]">{icon}</div><h3 className="font-bold">{title}</h3><p className="mt-3 text-xs leading-6 text-[hsl(var(--primary-foreground)/.57)]">{text}</p></div>;
}

function ProductModal({ product, onClose, onWhatsApp }: { product: CatalogProduct; onClose: () => void; onWhatsApp: () => void }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    setActive(0);
    setZoom(false);
  }, [product.id]);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setActive((current) => (current - 1 + product.images.length) % product.images.length);
      if (event.key === 'ArrowLeft') setActive((current) => (current + 1) % product.images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleKeyDown); };
  }, [onClose, product.images.length]);
  const next = () => setActive((current) => (current + 1) % product.images.length);
  const previous = () => setActive((current) => (current - 1 + product.images.length) % product.images.length);
  return <div className="modal-backdrop fixed inset-0 z-50 grid place-items-center bg-[hsl(220 24% 13%/.76)] p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label={`تفاصيل ${product.title}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
     <div className="modal-panel relative max-h-[94dvh] w-full max-w-5xl min-w-0 overflow-x-hidden overflow-y-auto bg-[hsl(var(--background))] shadow-[var(--shadow-md)]">
      <button onClick={onClose} className="focus-ring absolute left-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--background)/.9)]" aria-label="إغلاق"><X size={19} /></button>
      <div className="grid lg:grid-cols-[1.05fr_.95fr]">
          <div className="min-w-0 bg-[hsl(var(--muted))] p-4 sm:p-8"><div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-[hsl(var(--card))]"><img key={`${product.id}-${active}`} src={product.images[active]} alt={`${product.title} زاوية ${active + 1}`} onClick={() => setZoom(!zoom)} className={`modal-image h-full w-full object-cover mix-blend-multiply ${zoom ? 'zoomed' : ''}`} /><span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 bg-[hsl(var(--background)/.82)] px-3 py-2 text-[10px]"><ZoomIn size={13} /> اضغط للتكبير</span></div><div className="mt-4 flex flex-wrap gap-3 pb-1">{product.images.map((image, index) => <button key={`${image}-${index}`} onClick={() => { setActive(index); setZoom(false); }} className={`focus-ring h-16 w-16 shrink-0 overflow-hidden border-2 bg-[hsl(var(--card))] ${active === index ? 'border-[hsl(var(--secondary))]' : 'border-transparent'}`} aria-label={`عرض زاوية ${index + 1}`}><img src={image} alt="" className="h-full w-full object-cover mix-blend-multiply" /></button>)}</div><div className="mt-4 flex justify-between gap-3"><button onClick={previous} className="focus-ring inline-flex items-center gap-2 text-xs font-bold" aria-label="الصورة السابقة"><ChevronRight size={16} /> السابقة</button><span className="eyebrow shrink-0">{String(active + 1).padStart(2, '0')} / {String(product.images.length).padStart(2, '0')}</span><button onClick={next} className="focus-ring inline-flex items-center gap-2 text-xs font-bold" aria-label="الصورة التالية">التالية <ChevronLeft size={16} /></button></div></div>
         <div className="min-w-0 flex flex-col p-6 sm:p-10"><p className="eyebrow mb-5">تفاصيل المنتج</p><h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{product.title}</h2><p className="mt-2 text-sm text-[hsl(var(--foreground)/.58)]">{product.subtitle}</p><div className="my-8 h-px bg-[hsl(var(--border))]" /><div className="space-y-5"><div><span className="eyebrow">المواصفات</span><div className="mt-3 flex flex-wrap gap-2">{product.specs.map((spec) => <span key={spec} className="bg-[hsl(var(--muted))] px-3 py-2 text-xs font-semibold">{spec}</span>)}</div></div><div><span className="eyebrow">اللون</span><p className="mt-2 text-sm">{product.color}</p></div><div><span className="eyebrow">التوفر</span><p className="mt-2 text-sm">{product.availability}</p></div></div><div className="mt-auto pt-10"><button onClick={onWhatsApp} className="focus-ring flex w-full items-center justify-center gap-3 bg-[hsl(var(--primary))] px-5 py-4 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-1"><MessageCircle size={18} /> استفسار أو اطلب عبر الواتساب</button><p className="mt-4 text-center text-[11px] leading-6 text-[hsl(var(--foreground)/.52)]">يتوفر التواصل على الرقمين<br /><b className="text-[hsl(var(--foreground)/.78)]">77887578</b> و <b className="text-[hsl(var(--foreground)/.78)]">77883537</b></p><div className="mt-7 flex flex-wrap items-center justify-center gap-5 border-t border-[hsl(var(--border))] pt-6 text-[10px] text-[hsl(var(--foreground)/.58)]"><span className="inline-flex items-center gap-1"><Check size={13} className="text-[hsl(var(--secondary-foreground))]" /> جودة مضمونة</span><span className="inline-flex items-center gap-1"><Check size={13} className="text-[hsl(var(--secondary-foreground))]" /> تجربة 7 أيام</span></div></div></div>
      </div>
    </div>
  </div>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/category/:slug">{({ slug }) => <CategoryPage slug={slug} />}</Route><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;