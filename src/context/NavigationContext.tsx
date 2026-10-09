import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppRoute =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'track-order'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-categories'
  | 'admin-orders'
  | 'admin-customers'
  | 'admin-settings'
  | '404';

interface NavigationContextType {
  currentRoute: AppRoute;
  params: Record<string, string>;
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
  openProduct: (productIdOrSlug: string) => void;
  openCategory: (categorySlug: string) => void;
  isAdminLoggedIn: boolean;
  adminLogin: (token?: string) => void;
  adminLogout: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

function getRouteFromLocation(): { route: AppRoute; params: Record<string, string> } {
  const pathname = window.location.pathname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.toLowerCase().replace('#', '');

  const params: Record<string, string> = {};
  searchParams.forEach((val, key) => {
    params[key] = val;
  });

  // Check hash route first if available
  const target = hash ? hash : pathname;

  if (target.includes('admin-login')) return { route: 'admin-login', params };
  if (target.includes('admin-products')) return { route: 'admin-products', params };
  if (target.includes('admin-categories')) return { route: 'admin-categories', params };
  if (target.includes('admin-orders')) return { route: 'admin-orders', params };
  if (target.includes('admin-customers')) return { route: 'admin-customers', params };
  if (target.includes('admin-settings')) return { route: 'admin-settings', params };
  if (target.includes('admin-dashboard') || target.endsWith('/admin') || target.endsWith('/admin/')) {
    return { route: 'admin-dashboard', params };
  }

  if (target === '/' || target === '/index.html' || target === '') return { route: 'home', params };
  if (target.includes('shop')) return { route: 'shop', params };
  if (target.includes('product')) return { route: 'product', params };
  if (target.includes('cart')) return { route: 'cart', params };
  if (target.includes('checkout')) return { route: 'checkout', params };
  if (target.includes('order-success')) return { route: 'order-success', params };
  if (target.includes('track-order') || target.includes('tracking')) return { route: 'track-order', params };
  if (target.includes('about')) return { route: 'about', params };
  if (target.includes('contact')) return { route: 'contact', params };
  if (target.includes('privacy')) return { route: 'privacy', params };
  if (target.includes('terms')) return { route: 'terms', params };
  if (target.includes('404')) return { route: '404', params };

  return { route: 'home', params };
}

function getPathForRoute(route: AppRoute, params?: Record<string, string>): string {
  let path = '/';
  switch (route) {
    case 'home':
      path = '/index.html';
      break;
    case 'shop':
      path = '/shop.html';
      break;
    case 'product':
      path = '/product.html';
      break;
    case 'cart':
      path = '/cart.html';
      break;
    case 'checkout':
      path = '/checkout.html';
      break;
    case 'order-success':
      path = '/order-success.html';
      break;
    case 'track-order':
      path = '/track-order.html';
      break;
    case 'about':
      path = '/about.html';
      break;
    case 'contact':
      path = '/contact.html';
      break;
    case 'privacy':
      path = '/privacy.html';
      break;
    case 'terms':
      path = '/terms.html';
      break;
    case 'admin-login':
      path = '/admin/admin-login.html';
      break;
    case 'admin-dashboard':
      path = '/admin/admin-dashboard.html';
      break;
    case 'admin-products':
      path = '/admin/admin-products.html';
      break;
    case 'admin-categories':
      path = '/admin/admin-categories.html';
      break;
    case 'admin-orders':
      path = '/admin/admin-orders.html';
      break;
    case 'admin-customers':
      path = '/admin/admin-customers.html';
      break;
    case 'admin-settings':
      path = '/admin/admin-settings.html';
      break;
    case '404':
      path = '/404.html';
      break;
  }

  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams(params).toString();
    return `${path}?${query}`;
  }
  return path;
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routeState, setRouteState] = useState<{ route: AppRoute; params: Record<string, string> }>(
    getRouteFromLocation
  );

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pollibazar_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handlePopState = () => {
      setRouteState(getRouteFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const titles: Record<AppRoute, string> = {
      home: 'PolliBazar — গ্রামের পণ্য, আপনার ঘরে',
      shop: 'শপ ক্যাটালগ — PolliBazar',
      product: 'পণ্যের বিবরণ — PolliBazar',
      cart: 'শপিং কার্ট — PolliBazar',
      checkout: 'অর্ডার চেকআউট — PolliBazar',
      'order-success': 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে — PolliBazar',
      'track-order': 'অর্ডার ট্র্যাকিং — PolliBazar',
      about: 'আমাদের সম্পর্কে — PolliBazar',
      contact: 'যোগাযোগ ও সহায়তা — PolliBazar',
      privacy: 'গোপনীয়তা নীতিমালা — PolliBazar',
      terms: 'ব্যবহারের শর্তাবলী — PolliBazar',
      'admin-login': 'অ্যাডমিন লগইন — PolliBazar',
      'admin-dashboard': 'অ্যাডমিন ড্যাশবোর্ড — PolliBazar',
      'admin-products': 'পণ্য ব্যবস্থাপনা — PolliBazar',
      'admin-categories': 'ক্যাটাগরি ব্যবস্থাপনা — PolliBazar',
      'admin-orders': 'অর্ডার ব্যবস্থাপনা — PolliBazar',
      'admin-customers': 'গ্রাহক তালিকা — PolliBazar',
      'admin-settings': 'স্টোর সেটিংস ও D1 — PolliBazar',
      '404': 'পৃষ্ঠাটি পাওয়া যায়নি (404) — PolliBazar',
    };
    if (typeof document !== 'undefined') {
      document.title = titles[routeState.route] || 'PolliBazar — গ্রামের পণ্য, আপনার ঘরে';
    }
  }, [routeState.route]);

  const navigate = (newRoute: AppRoute, newParams?: Record<string, string>) => {
    const path = getPathForRoute(newRoute, newParams);
    try {
      window.history.pushState(null, '', path);
    } catch {
      // In sandboxed environments if pushState fails, fallback
    }
    setRouteState({
      route: newRoute,
      params: newParams || {},
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProduct = (productIdOrSlug: string) => {
    navigate('product', { id: productIdOrSlug });
  };

  const openCategory = (categorySlug: string) => {
    navigate('shop', { category: categorySlug });
  };

  const adminLogin = (token?: string) => {
    setIsAdminLoggedIn(true);
    try {
      localStorage.setItem('pollibazar_admin_auth', 'true');
      if (token) {
        localStorage.setItem('pb_session_token', token);
      }
    } catch {}
    navigate('admin-dashboard');
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    try {
      const token = localStorage.getItem('pb_session_token') || '';
      localStorage.removeItem('pollibazar_admin_auth');
      localStorage.removeItem('pb_session_token');
      fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }).catch(() => {});
    } catch {}
    navigate('admin-login');
  };

  return (
    <NavigationContext.Provider
      value={{
        currentRoute: routeState.route,
        params: routeState.params,
        navigate,
        openProduct,
        openCategory,
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
