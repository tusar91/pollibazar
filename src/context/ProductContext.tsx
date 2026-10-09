import React, { createContext, useContext, useEffect, useState } from 'react';
import { CATEGORIES, INITIAL_PRODUCTS } from '../data/products';
import { Category, Product } from '../types';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updated: Partial<Product>) => boolean;
  deleteProduct: (id: string) => boolean;
  toggleStock: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => Category;
  resetToDefaults: () => void;
}

const PRODUCTS_STORAGE_KEY = 'pollibazar_products_v2';
const CATEGORIES_STORAGE_KEY = 'pollibazar_categories_v2';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return CATEGORIES;
  });

  useEffect(() => {
    let isMounted = true;
    async function hydrateFromApi() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/categories').then((r) => (r.ok ? r.json() : null)),
        ]);
        if (!isMounted) return;
        if (prodRes && prodRes.success && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
          setProducts(prodRes.data);
        }
        if (catRes && catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
          setCategories(catRes.data);
        }
      } catch {
        // Fallback silently to client store
      }
    }
    hydrateFromApi();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage', e);
    }
  }, [categories]);

  const getProductById = (id: string) => products.find((p) => p.id === id);
  const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug || p.id === slug);

  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newId = `pb-${Date.now().toString().slice(-4)}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
    };
    setProducts((prev) => [newProduct, ...prev]);
    // update category count
    setCategories((prev) =>
      prev.map((c) => (c.slug === newProduct.category ? { ...c, count: c.count + 1 } : c))
    );

    // Sync to backend D1 database if authenticated
    try {
      const token = localStorage.getItem('pb_session_token') || '';
      fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(newProduct),
      }).catch((err) => console.warn('D1 product sync notice:', err));
    } catch {}

    return newProduct;
  };

  const updateProduct = (id: string, updated: Partial<Product>): boolean => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );

    // Sync to backend D1 database if authenticated
    try {
      const token = localStorage.getItem('pb_session_token') || '';
      fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(updated),
      }).catch((err) => console.warn('D1 product update sync notice:', err));
    } catch {}

    return true;
  };

  const deleteProduct = (id: string): boolean => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return false;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCategories((prev) =>
      prev.map((c) => (c.slug === prod.category ? { ...c, count: Math.max(0, c.count - 1) } : c))
    );

    // Sync to backend D1 database if authenticated
    try {
      const token = localStorage.getItem('pb_session_token') || '';
      fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      }).catch((err) => console.warn('D1 product delete sync notice:', err));
    } catch {}

    return true;
  };

  const toggleStock = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextAvailable = !p.isAvailable;
          return {
            ...p,
            isAvailable: nextAvailable,
            stock: nextAvailable ? (p.stock > 0 ? p.stock : 25) : 0,
          };
        }
        return p;
      })
    );
  };

  const addCategory = (categoryData: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now().toString().slice(-4)}`,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(CATEGORIES);
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(CATEGORIES_STORAGE_KEY);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        getProductById,
        getProductBySlug,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleStock,
        addCategory,
        resetToDefaults,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
