import React, { useState } from 'react';
import {
  Heart,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  Truck,
  X,
  ChevronDown,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { CATEGORIES } from '../data/products';

export const Header: React.FC = () => {
  const { cartCount, subtotal, setIsCartDrawerOpen, wishlist } = useCart();
  const { currentRoute, params, navigate, openCategory, isAdminLoggedIn } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('shop', { q: searchQuery.trim() });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'হোম', route: 'home' as const, path: '/index.html' },
    { label: 'শপ', route: 'shop' as const, path: '/shop.html' },
    { label: 'অফার', route: 'shop' as const, path: '/shop.html?filter=offers', params: { filter: 'offers' } },
    { label: 'অর্ডার ট্র্যাক', route: 'track-order' as const, path: '/track-order.html' },
    { label: 'আমাদের সম্পর্কে', route: 'about' as const, path: '/about.html' },
    { label: 'যোগাযোগ', route: 'contact' as const, path: '/contact.html' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      {/* Top Announcement Bar */}
      <div className="bg-emerald-800 text-emerald-50 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-300" />
              <span>২৫০০৳+ অর্ডারে ফ্রি ডেলিভারি</span>
            </span>
            <span className="hidden sm:inline text-emerald-300">·</span>
            <span className="hidden sm:inline">গ্রামের পণ্য, আপনার ঘরে</span>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <a
              href="tel:01712334707"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-300" />
              <span className="font-medium">০১৭১২-৩৩৪৭০৭</span>
            </a>
            <span className="text-emerald-500">|</span>
            <button
              onClick={() => navigate(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
              className="text-emerald-200 hover:text-white transition-colors flex items-center gap-1 font-medium"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>অ্যাডমিন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Zone (Single clean wordmark) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
            aria-label="Open menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <a
            href="/index.html"
            onClick={(e) => {
              e.preventDefault();
              navigate('home');
            }}
            className="flex items-center gap-2 group text-decoration-none"
          >
            {/* Original PolliBazar SVG Logo */}
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-800 transition-colors">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-emerald-950 font-serif leading-none">
                PolliBazar
              </span>
              <span className="text-[11px] text-emerald-700 font-medium tracking-wide mt-0.5">
                পল্লি বাজার
              </span>
            </div>
          </a>
        </div>

        {/* Search Bar - Desktop */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-lg mx-6 relative"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="পণ্য খুঁজুন... (যেমন: মিনিকেট চাল, সরিষার তেল, খাঁটি মধু)"
            className="w-full pl-4 pr-11 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-stone-800 placeholder:text-stone-400"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 transition-colors flex items-center justify-center"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Action Zone */}
        <div className="flex items-center gap-3">
          {/* Wishlist */}
          <button
            onClick={() => navigate('shop', { filter: 'wishlist' })}
            className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors hidden sm:flex items-center"
            title="পছন্দের তালিকা"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-bdt">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex items-center gap-2.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg hover:bg-emerald-100 transition-colors group cursor-pointer"
            aria-label="Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-emerald-700 group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-emerald-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-bdt">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[10px] text-emerald-700 font-medium">কার্ট</span>
              <span className="text-xs font-bold text-stone-900 tabular-bdt">
                ৳{subtotal}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="পণ্য খুঁজুন (যেমন: মিনিকেট চাল, তেল)..."
            className="w-full pl-3 pr-10 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:bg-white"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-2.5 bg-emerald-700 text-white rounded-md text-xs"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:block bg-stone-50 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="flex items-center gap-2 py-3 px-3 text-xs font-semibold text-emerald-900 hover:text-emerald-700 transition-colors"
              >
                <span>সব ক্যাটাগরি</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isCategoryMenuOpen && (
                <div
                  className="absolute left-0 top-full mt-1 w-56 bg-white border border-stone-200 rounded-lg shadow-lg py-2 z-50 divide-y divide-stone-100"
                  onMouseLeave={() => setIsCategoryMenuOpen(false)}
                >
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        openCategory(cat.slug);
                        setIsCategoryMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-[11px] text-stone-400 tabular-bdt">
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-stone-300">|</span>

            {navLinks.map((link) => {
              const isLinkActive =
                link.route === 'shop' && link.params?.filter === 'offers'
                  ? currentRoute === 'shop' && params?.filter === 'offers'
                  : link.route === 'shop'
                  ? currentRoute === 'shop' && params?.filter !== 'offers'
                  : currentRoute === link.route;

              return (
                <a
                  key={link.label}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(link.route, link.params);
                  }}
                  className={`py-3 px-3 text-xs font-medium transition-colors ${
                    isLinkActive
                      ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          <div className="text-xs text-stone-500 flex items-center gap-2">
            <span>পেমেন্ট:</span>
            <span className="font-medium text-stone-700">ক্যাশ অন ডেলিভারি · বিকাশ · নগদ</span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.route, link.params);
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-sm font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="border-t border-stone-100 pt-3">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2 px-3">
              ক্যাটাগরি
            </span>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    openCategory(cat.slug);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left px-3 py-1.5 text-xs text-stone-600 hover:text-emerald-800 hover:bg-stone-50 rounded-md"
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-stone-100 pt-3 flex items-center justify-between px-3 text-xs text-stone-500">
            <a href="tel:01712334707" className="text-emerald-700 font-medium">
              হটলাইন: 01712334707
            </a>
            <button
              onClick={() => {
                navigate('admin-login');
                setIsMobileMenuOpen(false);
              }}
              className="text-stone-600 hover:text-stone-900 flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>অ্যাডমিন পোর্টাল</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
