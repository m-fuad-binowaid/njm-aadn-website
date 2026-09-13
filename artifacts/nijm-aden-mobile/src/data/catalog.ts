import blueHero from '@assets/IMG_9213_1789304999025.jpeg';
import blueFront from '@assets/IMG_9207_1789304999026.jpeg';
import blueBack from '@assets/IMG_9206_1789304999026.jpeg';
import blueAngle from '@assets/IMG_9208_1789304999025.jpeg';
import blueDetail from '@assets/IMG_9205_1789304999026.jpeg';
import blackHero from '@assets/IMG_9212_1789304999025.jpeg';
import goldBack from '@assets/IMG_9211_1789304999025.jpeg';
import goldFront from '@assets/IMG_9210_1789304999025.jpeg';
import goldHero from '@assets/IMG_9209_1789304999025.jpeg';
import earbuds from '@assets/IMG_9204_1789304999026.jpeg';

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

export const catalog: CatalogProduct[] = [
  {
    id: 'iphone-16-blue',
    title: 'iPhone 16',
    subtitle: 'اللون الأزرق البنفسجي',
    specs: ['128GB', 'شريحة إلكترونية', 'حالة ممتازة'],
    color: 'أزرق بنفسجي',
    badge: 'الأكثر طلباً',
    images: [blueHero, blueFront, blueBack, blueAngle, blueDetail],
    accent: 'hsl(240 52% 67%)',
  },
  {
    id: 'iphone-16-black',
    title: 'iPhone 16',
    subtitle: 'اللون الأسود',
    specs: ['128GB', 'شريحة إلكترونية', 'حالة ممتازة'],
    color: 'أسود',
    images: [blackHero],
    accent: 'hsl(220 9% 28%)',
  },
  {
    id: 'iphone-pro-gold',
    title: 'iPhone Pro',
    subtitle: 'اللون الذهبي الصحراوي',
    specs: ['256GB', 'كاميرا Pro', 'حالة ممتازة'],
    color: 'ذهبي صحراوي',
    badge: 'اختيار فاخر',
    images: [goldHero, goldFront, goldBack],
    accent: 'hsl(33 39% 70%)',
  },
  {
    id: 'joyroom-earbuds',
    title: 'Joyroom Wireless',
    subtitle: 'سماعات لاسلكية',
    specs: ['صوت نقي', 'شحن سريع', 'حالة جديدة'],
    color: 'أبيض',
    images: [earbuds],
    accent: 'hsl(40 22% 81%)',
  },
];