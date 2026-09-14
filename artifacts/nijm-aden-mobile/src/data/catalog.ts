export type ProductCategory =
  | 'الكل'
  | 'هواتف آيفون'
  | 'الأجهزة الذكية'
  | 'الساعات الذكية'
  | 'السماعات والصوتيات'
  | 'إكسسوارات الجوال'
  | 'عروض حصرية';

export type CatalogProduct = {
  id: string;
  title: string;
  subtitle: string;
  category: ProductCategory;
  specs: string[];
  tags: string[];
  color: string;
  badge?: string;
  images: string[];
  accent: string;
  availability: string;
  rating: number;
  reviewsCount: number;
  priceText: string;
  originalPriceText?: string;
  featured?: boolean;
  isNew?: boolean;
};

export const STORE_CONTACTS = {
  phone1: '77887578',
  phone2: '77883537',
  whatsapp1: '96777887578',
  whatsapp2: '96777883537',
  location: 'عدن - جولة كالتكس - ردسي مول - البوابة الرئيسية',
  workingHours: 'يومياً من 9:00 صباحاً حتى 11:00 مساءً',
};

export const catalog: CatalogProduct[] = [
  {
    id: 'iphone-16-pro-gold',
    title: 'آيفون 16 برو ماكس (iPhone 16 Pro Max)',
    subtitle: 'اللون الذهبي الصحراوي (Desert Titanium)',
    category: 'هواتف آيفون',
    specs: ['256GB', 'تيتانيوم صحراوي فاخر', 'كاميرا Pro 48MP', 'فحص شامل وحالة وكالة'],
    tags: ['آيفون', 'برو ماكس', 'تيتانيوم', 'وصل حديثاً'],
    color: 'ذهبي صحراوي',
    badge: 'اختيار فاخر',
    images: [
      '/assets/iphone-gold-combo.jpeg',
      '/assets/iphone-gold-front.jpeg',
      '/assets/iphone-gold-back.jpeg',
    ],
    accent: '#D4AF37',
    availability: 'متوفر الآن بالمعرض',
    rating: 5.0,
    reviewsCount: 48,
    priceText: 'سعر منافس عند الاستفسار',
    originalPriceText: 'أفضل سعر بالسوق',
    featured: true,
    isNew: true,
  },
  {
    id: 'iphone-16-blue',
    title: 'آيفون 16 (iPhone 16)',
    subtitle: 'اللون الأزرق البنفسجي الفاخر (Ultramarine)',
    category: 'هواتف آيفون',
    specs: ['128GB', 'زر التحكم بالكاميرا', 'شريحة إلكترونية eSIM', 'ضمان تجربة 7 أيام'],
    tags: ['آيفون', 'ألترا مارين', 'الأحدث'],
    color: 'أزرق بنفسجي',
    badge: 'الأكثر طلباً',
    images: [
      '/assets/iphone-blue-hero.jpeg',
      '/assets/iphone-blue-front.jpeg',
      '/assets/iphone-blue-back.jpeg',
      '/assets/camera-control.jpeg',
      '/assets/iphone-blue-combo.jpeg',
    ],
    accent: '#4F46E5',
    availability: 'متوفر الآن بالمعرض',
    rating: 4.9,
    reviewsCount: 62,
    priceText: 'سعر خاص عند الاستفسار',
    featured: true,
    isNew: true,
  },
  {
    id: 'iphone-16-black',
    title: 'آيفون 16 (iPhone 16)',
    subtitle: 'اللون الأسود الفاحم الملكي (Black)',
    category: 'هواتف آيفون',
    specs: ['128GB', 'شاشة Super Retina XDR', 'مقاوم للماء والغبار', 'حالة فحص معتمدة'],
    tags: ['آيفون', 'أسود', 'هواتف'],
    color: 'أسود ملكي',
    badge: 'متوفر الآن',
    images: ['/assets/iphone-black-combo.jpeg'],
    accent: '#1F2937',
    availability: 'متوفر الآن بالمعرض',
    rating: 4.8,
    reviewsCount: 35,
    priceText: 'تواصل لمعرفة السعر الفوري',
    featured: true,
  },
  {
    id: 'joyroom-earbuds',
    title: 'سماعات Joyroom اللاسلكية الأصلية',
    subtitle: 'سماعات بلوتوث بصوت نقي وعزل للمكالمات',
    category: 'السماعات والصوتيات',
    specs: ['صوت محيطي عالي النقاء', 'شحن سريع وبطارية تدوم 24 ساعة', 'حالة جديدة بالكرتون'],
    tags: ['سماعات', 'جوي روم', 'إكسسوارات'],
    color: 'أبيض لؤلؤي',
    badge: 'الأعلى مبيعاً',
    images: ['/assets/joyroom.jpeg'],
    accent: '#C5A880',
    availability: 'متوفر الآن بكميات محدودة',
    rating: 5.0,
    reviewsCount: 74,
    priceText: 'سعر ترويجي مميز',
    featured: true,
  },
  {
    id: 'camera-control-accessory',
    title: 'كفر حماية فاخر يدعم Camera Control و MagSafe',
    subtitle: 'حماية متطورة مخصصة لسلسلة آيفون 16',
    category: 'إكسسوارات الجوال',
    specs: ['زر حساس مخصص للتحكم بالكاميرا', 'مغناطيس MagSafe مدمج فائق القوة', 'مقاوم للصدمات والخدوش'],
    tags: ['كفر', 'حماية', 'ماج سيف'],
    color: 'شفاف بإطار تيتانيوم',
    badge: 'إكسسوار حصري',
    images: ['/assets/camera-control.jpeg'],
    accent: '#64748B',
    availability: 'متوفر الآن',
    rating: 4.9,
    reviewsCount: 29,
    priceText: 'متوفر بجميع المقاسات',
  },
  {
    id: 'luxury-packaging-box',
    title: 'بوكس التغليف الفاخر وبطاقة الضمان الرسمية',
    subtitle: 'تغليف ملكي يحافظ على جهازك مع كارت الفحص المعتمد',
    category: 'عروض حصرية',
    specs: ['تغليف أنيق يحافظ على جهازك', 'باركود فحص مباشر وتواصل واتساب', 'ضمان تجربة 7 أيام موثق'],
    tags: ['ضمان', 'تغليف', 'نجم عدن'],
    color: 'أبيض وذهبي',
    badge: 'هدية مجانية مع كل جهاز',
    images: ['/assets/guarantee-card.jpeg', '/assets/packaging-box.jpeg'],
    accent: '#D4AF37',
    availability: 'مشمول مع جميع الأجهزة',
    rating: 5.0,
    reviewsCount: 112,
    priceText: 'مجاناً مع مشتريات الأجهزة',
    featured: true,
  },
];