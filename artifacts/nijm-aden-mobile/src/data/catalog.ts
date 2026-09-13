export type CatalogProduct = {
  id: string;
  title: string;
  subtitle: string;
  specs: string[];
  color: string;
  badge?: string;
  images: string[];
  accent: string;
};

const assets = {
  blueHero: '/assets/iphone-blue-hero.jpeg',
  blueFront: '/assets/iphone-blue-front.jpeg',
  blueBack: '/assets/iphone-blue-back.jpeg',
  blueAngle: '/assets/camera-control.jpeg',
  blueDetail: '/assets/iphone-blue-combo.jpeg',
  blackHero: '/assets/iphone-black-combo.jpeg',
  goldBack: '/assets/iphone-gold-back.jpeg',
  goldFront: '/assets/iphone-gold-front.jpeg',
  goldHero: '/assets/iphone-gold-combo.jpeg',
  earbuds: '/assets/joyroom.jpeg',
} as const;

export const catalog: CatalogProduct[] = [
  {
    id: 'iphone-16-blue',
    title: 'iPhone 16',
    subtitle: 'اللون الأزرق البنفسجي',
    specs: ['128GB', 'شريحة إلكترونية', 'حالة ممتازة'],
    color: 'أزرق بنفسجي',
    badge: 'الأكثر طلباً',
    images: [assets.blueHero, assets.blueFront, assets.blueBack, assets.blueAngle, assets.blueDetail],
    accent: 'hsl(240 52% 67%)',
  },
  {
    id: 'iphone-16-black',
    title: 'iPhone 16',
    subtitle: 'اللون الأسود',
    specs: ['128GB', 'شريحة إلكترونية', 'حالة ممتازة'],
    color: 'أسود',
    images: [assets.blackHero],
    accent: 'hsl(220 9% 28%)',
  },
  {
    id: 'iphone-pro-gold',
    title: 'iPhone Pro',
    subtitle: 'اللون الذهبي الصحراوي',
    specs: ['256GB', 'كاميرا Pro', 'حالة ممتازة'],
    color: 'ذهبي صحراوي',
    badge: 'اختيار فاخر',
    images: [assets.goldHero, assets.goldFront, assets.goldBack],
    accent: 'hsl(33 39% 70%)',
  },
  {
    id: 'joyroom-earbuds',
    title: 'Joyroom Wireless',
    subtitle: 'سماعات لاسلكية',
    specs: ['صوت نقي', 'شحن سريع', 'حالة جديدة'],
    color: 'أبيض',
    images: [assets.earbuds],
    accent: 'hsl(40 22% 81%)',
  },
];