/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const AppContent: React.FC = () => {
  const { currentRoute, isAdminLoggedIn } = useNavigation();

  // Admin Routes
  if (currentRoute === 'admin-login') {
    return <AdminLoginPage />;
  }

  if (currentRoute === 'admin-dashboard') {
    return isAdminLoggedIn ? <AdminDashboardPage /> : <AdminLoginPage />;
  }

  if (currentRoute === 'admin-products') {
    return isAdminLoggedIn ? <AdminProductsPage /> : <AdminLoginPage />;
  }

  if (currentRoute === 'admin-categories') {
    return isAdminLoggedIn ? <AdminCategoriesPage /> : <AdminLoginPage />;
  }

  if (currentRoute === 'admin-orders') {
    return isAdminLoggedIn ? <AdminOrdersPage /> : <AdminLoginPage />;
  }

  if (currentRoute === 'admin-customers') {
    return isAdminLoggedIn ? <AdminCustomersPage /> : <AdminLoginPage />;
  }

  if (currentRoute === 'admin-settings') {
    return isAdminLoggedIn ? <AdminSettingsPage /> : <AdminLoginPage />;
  }

  // Customer Storefront Routes
  const renderStorefrontContent = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'product':
        return <ProductDetailPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-success':
        return <OrderSuccessPage />;
      case 'track-order':
        return <TrackOrderPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsPage />;
      case '404':
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 pb-14 md:pb-0">
      <Header />
      <main className="flex-1">{renderStorefrontContent()}</main>
      <Footer />
      <CartDrawer />
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <OrderProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </OrderProvider>
      </CartProvider>
    </ProductProvider>
  );
}

