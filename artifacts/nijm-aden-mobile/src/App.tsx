import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
  ClipboardCheck,
  Eye,
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

type CategoryKey = 'all' | 'phones' | 'iphone' | 'accessories' | 'earbuds';

const categoryOptions: { key: CategoryKey; label: string }[] = [
  { key: 'all', label: 'كل المنتجات' },
  { key: 'phones', label: 'الهواتف' },
  { key: 'iphone', label: 'آيفون' },
  { key: 'accessories', label: 'الإكسسوارات' },
  { key: 'earbuds', label: 'السماعات' },
];

function Home() {
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [search, setSearch] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const heroProducts = useMemo(() => catalog.slice(0, 3), []);
  const heroProduct = heroProducts[heroIndex] ?? heroProducts[0];
  const normalizedSearch = search.trim().toLowerCase();
  const hasFilter = activeCategory !== 'all' || normalizedSearch.length > 0;

  const openWhatsApp = (productName = 'كتالوج نجم عدن موبايل') => {
    const message = `السلام عليكم، أريد الاستفسار عن ${productName}`;
    window.open(`https://wa.me/96777887578?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const selectCategory = (category: CategoryKey) => {
    setActiveCategory(category);
    setMobileMenu(false);
    window.requestAnimationFrame(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const filteredProducts = useMemo(() => {
    return catalog.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' ||
        (activeCategory === 'phones' && product.category === 'هواتف') ||
        (activeCategory === 'iphone' && product.category === 'هواتف' && product.title.toLowerCase().includes('iphone')) ||
        (activeCategory === 'accessories' && product.category === 'إكسسوارات') ||
        (activeCategory === 'earbuds' && product.tags.includes('سماعات'));
      const searchable = [product.title, product.subtitle, product.category, product.color, ...product.specs, ...product.tags].join(' ').toLowerCase();
      return matchesCategory && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
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

      <header className="relative z-20 border-b border-[hsl(var(--foreground)/.09)] bg-[hsl(var(--background)/.9)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-4 lg:px-10">
          <a href="#top" className="focus-ring flex shrink-0 items-center gap-3">
            <span className="grid h-11 w-11 place-items-center border border-[hsl(var(--secondary)/.8)] text-[hsl(var(--secondary-foreground))]">
              <span className="font-serif text-xl">ن</span>
            </span>
            <span>
              <strong className="block text-[15px] font-extrabold tracking-tight">نجم عدن موبايل</strong>
              <span className="eyebrow">مختارات تستحقها</span>
            </span>
          </a>

          <form className="store-search hidden min-w-0 flex-1 items-center gap-3 border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 md:flex" onSubmit={(event) => { event.preventDefault(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
            <Search size={17} className="shrink-0 text-[hsl(var(--foreground)/.48)]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[hsl(var(--foreground)/.45)]" placeholder="ابحث عن جهاز أو إكسسوار..." aria-label="البحث في المنتجات" />
            {search && <button type="button" onClick={() => setSearch('')} className="focus-ring text-[hsl(var(--foreground)/.5)]" aria-label="مسح البحث"><X size={15} /></button>}
          </form>

          <div className="mr-auto flex items-center gap-2">
            <button onClick={() => openWhatsApp()} className="focus-ring hidden items-center gap-2 border border-[hsl(var(--primary))] px-4 py-3 text-xs font-bold text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] sm:inline-flex">
              <MessageCircle size={15} /> تواصل الآن
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="focus-ring grid h-11 w-11 place-items-center border border-[hsl(var(--border))] md:hidden" aria-expanded={mobileMenu} aria-label="فتح القائمة">
              <Menu size={19} />
            </button>
            <a href="#products" className="focus-ring hidden h-11 w-11 place-items-center border border-[hsl(var(--border))] text-[hsl(var(--foreground)/.72)] sm:grid" aria-label="المنتجات">
              <ShoppingBag size={18} />
            </a>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-7 overflow-x-auto px-5 pb-4 lg:px-10">
          <span className="hidden shrink-0 items-center gap-2 text-xs font-bold text-[hsl(var(--foreground)/.5)] md:inline-flex"><SlidersHorizontal size={14} /> تصفح حسب</span>
          {categoryOptions.map((category) => (
            <button key={category.key} onClick={() => selectCategory(category.key)} className={`category-link focus-ring shrink-0 text-xs font-bold transition-colors ${activeCategory === category.key ? 'active' : ''}`}>
              {category.label}
            </button>
          ))}
          <a href="#promise" className="category-link focus-ring shrink-0 text-xs font-bold">لماذا نجم عدن؟</a>
        </div>

        {mobileMenu && (
          <div className="border-t border-[hsl(var(--foreground)/.08)] px-5 py-4 md:hidden">
            <form className="store-search mb-4 flex items-center gap-3 border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3" onSubmit={(event) => { event.preventDefault(); setMobileMenu(false); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
              <Search size={17} className="shrink-0 text-[hsl(var(--foreground)/.48)]" />
              <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[hsl(var(--foreground)/.45)]" placeholder="ابحث عن منتج..." aria-label="البحث في المنتجات" />
            </form>
            <div className="flex flex-wrap gap-x-5 gap-y-4 text-xs font-bold">
              <a href="#promise" onClick={() => setMobileMenu(false)}>وعد نجم عدن</a>
              <a href="#contact" onClick={() => setMobileMenu(false)}>تواصل معنا</a>
              <button onClick={() => { setMobileMenu(false); openWhatsApp(); }} className="text-[hsl(var(--secondary-foreground))]">استفسار عبر واتساب</button>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        <section className="hero-storefront relative isolate overflow-hidden">
          <div className="hero-grid absolute inset-0 -z-10" />
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-16 pt-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10 lg:pb-24 lg:pt-14">
            <div className="rise order-2 lg:order-1">
              <p className="eyebrow mb-5 flex items-center gap-3"><span className="h-px w-10 bg-[hsl(var(--secondary))]" /> {heroProduct.isNew ? 'وصل حديثاً' : 'مختارات نجم عدن'}</p>
              <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.22] tracking-[-.05em] sm:text-6xl lg:text-[5rem]">{heroProduct.title}<br /><span className="text-[hsl(var(--secondary-foreground)/.62)]">{heroProduct.subtitle}</span></h1>
              <p className="mt-6 max-w-lg text-[15px] leading-8 text-[hsl(var(--foreground)/.68)]">منتجات أصلية منتقاة بعناية، مع فحص واضح وتجربة تمنحك راحة البال قبل اتخاذ القرار.</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button onClick={() => { setActiveCategory('all'); setSearch(''); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="focus-ring inline-flex items-center gap-3 bg-[hsl(var(--primary))] px-6 py-4 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-all hover:-translate-y-1 hover:bg-[hsl(var(--foreground)/.88)]">تصفح المنتجات <ArrowLeft size={18} /></button>
                <button onClick={() => openWhatsApp(heroProduct.title)} className="focus-ring inline-flex items-center gap-2 border border-[hsl(var(--border))] px-5 py-4 text-sm font-bold transition-colors hover:border-[hsl(var(--secondary))]"><MessageCircle size={17} /> اسأل الآن</button>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[hsl(var(--foreground)/.12)] pt-5 text-xs text-[hsl(var(--foreground)/.6)]">
                <span className="inline-flex items-center gap-2"><Check size={14} className="text-[hsl(var(--secondary-foreground))]" /> أصالة وحالة موثقة</span>
                <span className="inline-flex items-center gap-2"><Check size={14} className="text-[hsl(var(--secondary-foreground))]" /> توصيل آمن</span>
              </div>
            </div>
            <div className="rise rise-delay-2 order-1 lg:order-2">
              <div className="hero-stage relative overflow-hidden border border-[hsl(var(--secondary)/.32)] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-md)] sm:p-7">
                <div className="absolute right-7 top-7 z-10 flex items-center gap-2 bg-[hsl(var(--background)/.88)] px-3 py-2 text-[10px] font-bold backdrop-blur-md"><span className="h-2 w-2 rounded-full bg-[hsl(var(--secondary))]" /> {heroProduct.badge ?? 'متوفر الآن'}</div>
                <img key={heroProduct.id} src={heroProduct.images[0]} alt={`${heroProduct.title} ${heroProduct.subtitle}`} className="hero-product-image aspect-[1.16] w-full object-cover mix-blend-multiply" />
                <div className="absolute bottom-7 left-7 border border-[hsl(var(--secondary)/.65)] bg-[hsl(var(--background)/.9)] px-5 py-4 backdrop-blur-md"><span className="eyebrow">{String(heroIndex + 1).padStart(2, '0')} / {String(heroProducts.length).padStart(2, '0')}</span><p className="mt-1 font-bold">{heroProduct.title}</p></div>
              </div>
              <div className="mt-5 flex items-center justify-center gap-2">
                {heroProducts.map((product, index) => <button key={product.id} onClick={() => setHeroIndex(index)} className={`hero-dot focus-ring h-2 rounded-full transition-all ${heroIndex === index ? 'active w-8' : 'w-2'}`} aria-label={`عرض ${product.title}`} />)}
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="mx-auto max-w-7xl scroll-mt-36 px-5 pb-16 pt-10 lg:px-10 lg:pb-24">
          <div className="store-section-heading mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow mb-3">{hasFilter ? 'نتائج التصفح' : '01 — اكتشف المختارات'}</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{hasFilter ? 'المنتجات المطابقة' : 'منتجات تستحق الاختيار'}</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--foreground)/.55)]"><Tag size={14} className="text-[hsl(var(--secondary-foreground))]" /> {filteredProducts.length} منتجات متاحة</div>
          </div>

          {hasFilter ? (
            <ProductShelf products={filteredProducts} onOpen={setSelected} onWhatsApp={openWhatsApp} />
          ) : (
            <div className="space-y-16">
              <ProductShelf eyebrow="الأكثر طلباً" title="مختارات العملاء" products={featuredProducts} onOpen={setSelected} onWhatsApp={openWhatsApp} />
              <ProductShelf eyebrow="وصل حديثاً" title="أحدث الوصول" products={newProducts} onOpen={setSelected} onWhatsApp={openWhatsApp} />
              <ProductShelf eyebrow="لإكمال تجربتك" title="إكسسوارات مختارة" products={accessoryProducts} onOpen={setSelected} onWhatsApp={openWhatsApp} />
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
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-[hsl(var(--foreground)/.58)] sm:flex-row sm:items-center sm:justify-between lg:px-10"><div><b className="text-sm text-[hsl(var(--foreground))]">نجم عدن موبايل</b><span className="mx-3 text-[hsl(var(--secondary))]">•</span>صالة هواتف منتقاة من صنعاء</div><div className="flex flex-wrap gap-5"><span className="inline-flex items-center gap-2"><Phone size={13} /> 77887578 / 77883537</span><span>© 2025 نجم عدن</span></div></div>
      </footer>
      <button onClick={() => openWhatsApp()} className="wa-float focus-ring fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#1d6844] px-5 py-3 text-sm font-bold text-white"><MessageCircle size={18} /> واتساب</button>
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onWhatsApp={() => openWhatsApp(selected.title)} />}
    </div>
  );
}

function ProductShelf({ eyebrow, title, products, onOpen, onWhatsApp }: { eyebrow?: string; title?: string; products: CatalogProduct[]; onOpen: (product: CatalogProduct) => void; onWhatsApp: (productName: string) => void }) {
  if (!products.length) {
    return <div className="border border-dashed border-[hsl(var(--border))] px-6 py-16 text-center"><Search className="mx-auto mb-4 text-[hsl(var(--foreground)/.4)]" size={26} /><h3 className="font-bold">لم نعثر على منتجات مطابقة</h3><p className="mt-2 text-xs text-[hsl(var(--foreground)/.55)]">جرّب كلمة أخرى أو اختر تصنيفاً مختلفاً.</p></div>;
  }
  return <div>{eyebrow && title && <div className="mb-5 flex items-end justify-between gap-4"><div><p className="eyebrow mb-2">{eyebrow}</p><h3 className="text-2xl font-extrabold tracking-tight">{title}</h3></div><span className="hidden text-xs text-[hsl(var(--foreground)/.5)] sm:inline-flex">{products.length} منتجات</span></div>}<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product, index) => <ProductCard key={`${product.id}-${index}`} product={product} index={index} onOpen={() => onOpen(product)} onWhatsApp={() => onWhatsApp(product.title)} />)}</div></div>;
}

function ProductCard({ product, index, onOpen, onWhatsApp }: { product: CatalogProduct; index: number; onOpen: () => void; onWhatsApp: () => void }) {
  return <article className="product-card rise flex flex-col border border-[hsl(var(--card-border))] bg-[hsl(var(--card))]" style={{ animationDelay: `${index * 90}ms` }}>
    <button onClick={onOpen} className="focus-ring block w-full text-right">
      <div className="relative overflow-hidden bg-[hsl(var(--muted))] p-4"><img src={product.images[0]} alt={`${product.title} ${product.subtitle}`} className="product-image aspect-square w-full object-cover mix-blend-multiply" />{product.badge && <span className="absolute right-6 top-6 bg-[hsl(var(--primary))] px-3 py-1 text-[10px] font-bold text-[hsl(var(--primary-foreground))]">{product.badge}</span>}<span className="absolute bottom-6 left-6 grid h-9 w-9 place-items-center rounded-full bg-[hsl(var(--background)/.86)] text-[hsl(var(--foreground))]"><Eye size={16} /></span></div>
      <div className="px-5 pt-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-extrabold">{product.title}</h3><p className="mt-1 text-xs text-[hsl(var(--foreground)/.58)]">{product.subtitle}</p></div><span className="mt-1 h-3 w-3 rounded-full border border-[hsl(var(--foreground)/.2)]" style={{ background: product.accent }} /></div></div>
    </button>
    <div className="flex flex-1 flex-col px-5 pb-5 pt-4"><div className="mb-4 flex flex-wrap gap-2">{product.specs.map((spec) => <span key={spec} className="border border-[hsl(var(--border))] px-2 py-1 text-[10px] text-[hsl(var(--foreground)/.61)]">{spec}</span>)}</div><div className="mb-5 flex items-center justify-between gap-2 text-[10px] font-semibold text-[hsl(var(--foreground)/.58)]"><span className="inline-flex items-center gap-1"><Check size={12} className="text-[hsl(var(--secondary-foreground))]" /> {product.availability}</span><span>{product.category}</span></div><div className="mt-auto grid grid-cols-[1fr_auto] gap-2"><button onClick={onWhatsApp} className="focus-ring inline-flex items-center justify-center gap-2 bg-[hsl(var(--primary))] px-3 py-3 text-xs font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5"><MessageCircle size={15} /> اسأل عبر واتساب</button><button onClick={onOpen} className="focus-ring grid place-items-center border border-[hsl(var(--border))] px-3" aria-label={`تفاصيل ${product.title}`}><ArrowLeft size={16} /></button></div></div>
  </article>;
}

function Promise({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="bg-[hsl(var(--primary))] p-7"><div className="mb-8 text-[hsl(var(--secondary))]">{icon}</div><h3 className="font-bold">{title}</h3><p className="mt-3 text-xs leading-6 text-[hsl(var(--primary-foreground)/.57)]">{text}</p></div>;
}

function ProductModal({ product, onClose, onWhatsApp }: { product: CatalogProduct; onClose: () => void; onWhatsApp: () => void }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
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
    <div className="modal-panel relative max-h-[94dvh] w-full max-w-5xl overflow-y-auto bg-[hsl(var(--background))] shadow-[var(--shadow-md)]">
      <button onClick={onClose} className="focus-ring absolute left-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--background)/.9)]" aria-label="إغلاق"><X size={19} /></button>
      <div className="grid lg:grid-cols-[1.05fr_.95fr]">
        <div className="bg-[hsl(var(--muted))] p-4 sm:p-8"><div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[hsl(var(--card))]"><img src={product.images[active]} alt={`${product.title} زاوية ${active + 1}`} onClick={() => setZoom(!zoom)} className={`modal-image h-full w-full object-cover mix-blend-multiply ${zoom ? 'zoomed' : ''}`} /><span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 bg-[hsl(var(--background)/.82)] px-3 py-2 text-[10px]"><ZoomIn size={13} /> اضغط للتكبير</span></div><div className="mt-4 flex gap-3 overflow-x-auto pb-1">{product.images.map((image, index) => <button key={`${image}-${index}`} onClick={() => { setActive(index); setZoom(false); }} className={`focus-ring h-16 w-16 shrink-0 overflow-hidden border-2 bg-[hsl(var(--card))] ${active === index ? 'border-[hsl(var(--secondary))]' : 'border-transparent'}`} aria-label={`عرض زاوية ${index + 1}`}><img src={image} alt="" className="h-full w-full object-cover mix-blend-multiply" /></button>)}</div><div className="mt-4 flex justify-between"><button onClick={previous} className="focus-ring inline-flex items-center gap-2 text-xs font-bold" aria-label="الصورة السابقة"><ChevronRight size={16} /> السابقة</button><span className="eyebrow">{String(active + 1).padStart(2, '0')} / {String(product.images.length).padStart(2, '0')}</span><button onClick={next} className="focus-ring inline-flex items-center gap-2 text-xs font-bold" aria-label="الصورة التالية">التالية <ChevronLeft size={16} /></button></div></div>
        <div className="flex flex-col p-7 sm:p-10"><p className="eyebrow mb-5">تفاصيل المنتج</p><h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{product.title}</h2><p className="mt-2 text-sm text-[hsl(var(--foreground)/.58)]">{product.subtitle}</p><div className="my-8 h-px bg-[hsl(var(--border))]" /><div className="space-y-5"><div><span className="eyebrow">المواصفات</span><div className="mt-3 flex flex-wrap gap-2">{product.specs.map((spec) => <span key={spec} className="bg-[hsl(var(--muted))] px-3 py-2 text-xs font-semibold">{spec}</span>)}</div></div><div><span className="eyebrow">اللون</span><p className="mt-2 text-sm">{product.color}</p></div><div><span className="eyebrow">التوفر</span><p className="mt-2 text-sm">{product.availability}</p></div></div><div className="mt-auto pt-10"><button onClick={onWhatsApp} className="focus-ring flex w-full items-center justify-center gap-3 bg-[hsl(var(--primary))] px-5 py-4 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-1"><MessageCircle size={18} /> استفسار أو اطلب عبر الواتساب</button><p className="mt-4 text-center text-[11px] leading-6 text-[hsl(var(--foreground)/.52)]">يتوفر التواصل على الرقمين<br /><b className="text-[hsl(var(--foreground)/.78)]">77887578</b> و <b className="text-[hsl(var(--foreground)/.78)]">77883537</b></p><div className="mt-7 flex items-center justify-center gap-5 border-t border-[hsl(var(--border))] pt-6 text-[10px] text-[hsl(var(--foreground)/.58)]"><span className="inline-flex items-center gap-1"><Check size={13} className="text-[hsl(var(--secondary-foreground))]" /> جودة مضمونة</span><span className="inline-flex items-center gap-1"><Check size={13} className="text-[hsl(var(--secondary-foreground))]" /> تجربة 7 أيام</span></div></div></div>
      </div>
    </div>
  </div>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;