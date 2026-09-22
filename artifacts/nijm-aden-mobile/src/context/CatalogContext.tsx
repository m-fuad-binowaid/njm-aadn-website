import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { catalog as defaultCatalog, type CatalogProduct } from '@/data/catalog';
import {
  type StoreSettings,
  DEFAULT_STORE_SETTINGS,
  type CatalogContextValue,
} from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

const CatalogContext = createContext<CatalogContextValue | null>(null);

const STORAGE_PRODUCTS_KEY = 'najm_aden_products';
const STORAGE_SETTINGS_KEY = 'najm_aden_settings';

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();

  // Initialize products from localStorage or default catalog
  const [products, setProducts] = useState<CatalogProduct[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading products from localStorage', e);
    }
    return defaultCatalog;
  });

  // Initialize store settings from localStorage or default
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
    }
    return DEFAULT_STORE_SETTINGS;
  });

  // Auto-sync products to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to localStorage', e);
    }
  }, [products]);

  // Auto-sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage', e);
    }
  }, [settings]);

  // Add new product
  const addProduct = (newProd: Omit<CatalogProduct, 'id'> & { id?: string }) => {
    const id = newProd.id || `product-${Date.now()}`;
    const productToAdd: CatalogProduct = {
      ...newProd,
      id,
      images: newProd.images && newProd.images.length > 0 ? newProd.images : ['/logo3.jpg'],
      rating: newProd.rating || 5.0,
      reviewsCount: newProd.reviewsCount || 1,
      specs: newProd.specs || ['جهاز فحص معتمد', 'ضمان 7 أيام استبدال'],
      tags: newProd.tags || [newProd.title],
      accent: newProd.accent || '#D4AF37',
      availability: newProd.availability || 'متوفر بالمعرض',
      priceText: newProd.priceText || 'تسعير فوري بالواتساب',
    };

    setProducts((prev) => [productToAdd, ...prev]);
    toast({
      title: 'تمت إضافة الجهاز بنجاح',
      description: `تمت إضافة "${productToAdd.title}" إلى المخزون المباشر.`,
    });
  };

  // Update existing product
  const updateProduct = (id: string, updates: Partial<CatalogProduct>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    toast({
      title: 'تم تحديث بيانات الجهاز',
      description: 'تم حفظ كافة التعديلات ومزامنتها بنجاح.',
    });
  };

  // Delete product
  const deleteProduct = (id: string) => {
    const itemToDelete = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: 'تم حذف الجهاز',
      description: `تمت إزالة "${itemToDelete?.title || id}" من المخزون.`,
      variant: 'destructive',
    });
  };

  // Toggle in-stock / out-of-stock
  const toggleStock = (id: string) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isCurrentlyInStock =
            item.availability.includes('متوفر') ||
            !item.availability.includes('نفذت');
          const newAvailability = isCurrentlyInStock ? 'نفذت الكمية' : 'متوفر بالمعرض';
          return {
            ...item,
            availability: newAvailability,
          };
        }
        return item;
      })
    );

    const target = products.find((p) => p.id === id);
    if (target) {
      const willBeInStock =
        target.availability.includes('نفذت');
      toast({
        title: willBeInStock ? 'تم تحديد الجهاز: متوفر' : 'تم تحديد الجهاز: نفذت الكمية',
        description: `تم تحديث حالة توفر "${target.title}" فوراً في المتجر.`,
      });
    }
  };

  // Update store settings
  const updateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    toast({
      title: 'تم تحديث إعدادات المتجر',
      description: 'تم حفظ أرقام الواتساب وبيانات المعرض بنجاح.',
    });
  };

  // Reset to default catalog
  const resetToDefaults = () => {
    setProducts(defaultCatalog);
    setSettings(DEFAULT_STORE_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_PRODUCTS_KEY);
      localStorage.removeItem(STORAGE_SETTINGS_KEY);
    } catch {
      // ignore
    }
    toast({
      title: 'تمت استعادة المخزون الافتراضي',
      description: 'تمت استعادة كافة أجهزة وبيانات المتجر الافتراضية بنجاح.',
    });
  };

  // Export JSON backup
  const exportCatalogJson = () => {
    try {
      const exportData = {
        meta: {
          storeName: 'نجم عدن موبايل (Najm Aden Mobile)',
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
        },
        settings,
        products,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `najm-aden-catalog-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast({
        title: 'تم تصدير ملف النسخة الاحتياطية',
        description: 'تم تنزيل ملف JSON يحتوي على كافة الأجهزة والإعدادات.',
      });
    } catch (e) {
      console.error('Failed to export JSON', e);
      toast({
        title: 'فشل التصدير',
        description: 'حدث خطأ أثناء إعداد ملف النسخة الاحتياطية.',
        variant: 'destructive',
      });
    }
  };

  const value = useMemo(
    () => ({
      products,
      settings,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleStock,
      updateSettings,
      resetToDefaults,
      exportCatalogJson,
    }),
    [products, settings]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
