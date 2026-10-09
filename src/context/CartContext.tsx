import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  deliveryCharge: number;
  deliveryDistrict: string;
  setDeliveryDistrict: (district: string) => void;
  couponCode: string;
  discountAmount: number;
  total: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CART_STORAGE_KEY = 'pollibazar_cart';
const WISHLIST_STORAGE_KEY = 'pollibazar_wishlist';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem('pollibazar_cart_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY) || localStorage.getItem('pollibazar_wishlist_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryDistrict, setDeliveryDistrict] = useState<string>('ঢাকা');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponPercent, setCouponPercent] = useState<number>(0);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Math.min(newQty, product.stock),
        };
        return next;
      } else {
        return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
      }
    });
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            quantity: Math.min(quantity, item.product.stock),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setCouponPercent(0);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Delivery charge rule:
  // Subtotal >= 2500 ৳: Free delivery
  // Dhaka / Dohar: 60 ৳
  // Outside Dhaka: 120 ৳
  const deliveryCharge =
    subtotal === 0
      ? 0
      : subtotal >= 2500
      ? 0
      : deliveryDistrict.includes('ঢাকা') || deliveryDistrict.includes('দোহার')
      ? 60
      : 120;

  const discountAmount = Math.round((subtotal * couponPercent) / 100);
  const total = Math.max(0, subtotal - discountAmount + deliveryCharge);

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'POLLI10') {
      setCouponCode('POLLI10');
      setCouponPercent(10);
      return { success: true, message: 'অভিনন্দন! ১০% মূল্যছাড় যুক্ত হয়েছে।' };
    } else if (cleanCode === 'POLLI20' && subtotal >= 1000) {
      setCouponCode('POLLI20');
      setCouponPercent(20);
      return { success: true, message: 'অভিনন্দন! ২০% স্পেশাল ছাড় যুক্ত হয়েছে।' };
    } else {
      return { success: false, message: 'অকার্যকর কুপন কোড! (চেষ্টা করুন: POLLI10)' };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponPercent(0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        deliveryCharge,
        deliveryDistrict,
        setDeliveryDistrict,
        couponCode,
        discountAmount,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isWishlisted,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
