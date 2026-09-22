import type { CatalogProduct, ProductCategory, ProductCondition } from '@/data/catalog';

export interface StoreSettings {
  phone1: string;
  phone2: string;
  whatsapp1: string;
  whatsapp2: string;
  location: string;
  workingHours: string;
  announcementText: string;
  adminPin: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  phone1: '77887578',
  phone2: '77883537',
  whatsapp1: '96777887578',
  whatsapp2: '96777883537',
  location: 'عدن - جولة كالتكس - ردسي مول - البوابة الرئيسية',
  workingHours: 'يومياً من 9:00 صباحاً حتى 11:00 مساءً',
  announcementText: 'أجهزة أصلية معتمدة • فحص 30 نقطة • ردسي مول - عدن • توصيل فوري',
  adminPin: '2026',
};

export interface CatalogContextValue {
  products: CatalogProduct[];
  settings: StoreSettings;
  addProduct: (product: Omit<CatalogProduct, 'id'> & { id?: string }) => void;
  updateProduct: (id: string, updates: Partial<CatalogProduct>) => void;
  deleteProduct: (id: string) => void;
  toggleStock: (id: string) => void;
  updateSettings: (newSettings: StoreSettings) => void;
  resetToDefaults: () => void;
  exportCatalogJson: () => void;
}
