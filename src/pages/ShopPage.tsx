import React, { useState, useMemo, useEffect } from 'react';
import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

export const ShopPage: React.FC = () => {
  const { products, categories } = useProducts();
  const { params } = useNavigation();
  const { wishlist } = useCart();

  // Search & Filters state
  const [search, setSearch] = useState(params.q || '');
  const [selectedCategory, setSelectedCategory] = useState(params.category || 'all');
  const [sortBy, setSortBy] = useState<string>(params.sort || 'featured');
  const [onlyDiscounted, setOnlyDiscounted] = useState(params.filter === 'offers');
  const [onlyWishlist, setOnlyWishlist] = useState(params.filter === 'wishlist');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(1000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Sync params when URL changes
  useEffect(() => {
    if (params.q !== undefined) setSearch(params.q);
    if (params.category !== undefined) setSelectedCategory(params.category);
    if (params.sort !== undefined) setSortBy(params.sort);
    if (params.filter === 'offers') setOnlyDiscounted(true);
    if (params.filter === 'wishlist') setOnlyWishlist(true);
  }, [params]);

  // Filter and sort computation
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.origin && p.origin.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Discount filter
    if (onlyDiscounted) {
      result = result.filter((p) => (p.discount || 0) > 0);
    }

    // Wishlist filter
    if (onlyWishlist) {
      result = result.filter((p) => wishlist.includes(p.id));
    }

    // In-stock filter
    if (onlyInStock) {
      result = result.filter((p) => p.isAvailable && p.stock > 0);
    }

    // Price range
    result = result.filter((p) => p.price <= priceRange);

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [products, selectedCategory, search, onlyDiscounted, onlyWishlist, onlyInStock, priceRange, sortBy, wishlist]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSortBy('featured');
    setOnlyDiscounted(false);
    setOnlyWishlist(false);
    setOnlyInStock(false);
    setPriceRange(1000);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'all' ||
    onlyDiscounted ||
    onlyWishlist ||
    onlyInStock ||
    priceRange < 1000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
          পল্লি বাজার শপ
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          তাজা ও খাঁটি গ্রাম্য নিত্যপণ্যের বিশাল সংগ্রহ · মোট {products.length} টি পণ্য
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Mobile Filter Button & Sort */}
        <div className="lg:hidden flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-stone-200">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-200 text-stone-800 rounded-lg text-xs font-semibold shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
            <span>ফিল্টার ({hasActiveFilters ? 'সক্রিয়' : 'সব'})</span>
          </button>

          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium"
            >
              <option value="featured">নির্বাচিত (Default)</option>
              <option value="price-low">দাম: কম থেকে বেশি</option>
              <option value="price-high">দাম: বেশি থেকে কম</option>
              <option value="newest">নতুন আগমন</option>
              <option value="rating">জনপ্রিয়তা</option>
            </select>
          </div>
        </div>

        {/* Sidebar Filters (Desktop & Mobile Drawer) */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white p-6 shadow-2xl transition-transform lg:static lg:z-auto lg:w-auto lg:p-0 lg:shadow-none lg:bg-transparent ${
            isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between lg:hidden mb-6 pb-3 border-b border-stone-200">
            <h3 className="font-bold text-stone-900 text-base">ফিল্টার</h3>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="p-1.5 text-stone-500 hover:text-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Search Input */}
            <div className="bg-white p-4 rounded-xl border border-stone-200">
              <label className="text-xs font-bold text-stone-800 block mb-2">
                পণ্য খুঁজুন
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="পণ্য খুঁজুন..."
                  className="w-full pl-3 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:bg-white text-stone-900"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white p-4 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-stone-800">ক্যাটাগরি</label>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-[11px] text-emerald-700 hover:underline"
                  >
                    সব
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setCurrentPage(1);
                  }}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span>সব ক্যাটাগরি</span>
                  <span className="text-[10px] text-stone-400 tabular-bdt">
                    {products.length}
                  </span>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-stone-400 tabular-bdt">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div className="bg-white p-4 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-800">সর্বোচ্চ দাম</label>
                <span className="text-xs font-bold text-emerald-800 tabular-bdt">
                  ৳{priceRange}
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="1000"
                step="20"
                value={priceRange}
                onChange={(e) => {
                  setPriceRange(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1 tabular-bdt">
                <span>৳৪০</span>
                <span>৳১,০০০</span>
              </div>
            </div>

            {/* Quick Checkbox Filters */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2.5">
              <label className="text-xs font-bold text-stone-800 block mb-1">
                সুবিধা ও প্রাপ্যতা
              </label>

              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => {
                    setOnlyInStock(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <span>শুধু স্টকে থাকা পণ্য</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyDiscounted}
                  onChange={(e) => {
                    setOnlyDiscounted(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <span>ছাড়যুক্ত বিশেষ অফার</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyWishlist}
                  onChange={(e) => {
                    setOnlyWishlist(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <span>পছন্দের তালিকা ({wishlist.length})</span>
              </label>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ফিল্টার রিসেট করুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Backdrop */}
        {isMobileFilterOpen && (
          <div
            className="fixed inset-0 bg-stone-900/50 z-40 lg:hidden"
            onClick={() => setIsMobileFilterOpen(false)}
          />
        )}

        {/* Main Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="hidden lg:flex items-center justify-between bg-white p-3.5 rounded-xl border border-stone-200 text-xs">
            <span className="text-stone-500 font-medium tabular-bdt">
              মোট <strong className="text-stone-900">{filteredProducts.length}</strong> টি পণ্য পাওয়া গেছে
            </span>

            <div className="flex items-center gap-2">
              <span className="text-stone-500">সাজান:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 cursor-pointer font-medium"
              >
                <option value="featured">নির্বাচিত (Featured)</option>
                <option value="newest">নতুন আগমন (Newest)</option>
                <option value="rating">জনপ্রিয়তা ও রেটিং (Rating)</option>
                <option value="price-low">দাম: কম থেকে বেশি</option>
                <option value="price-high">দাম: বেশি থেকে কম</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mx-auto mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">
                কোনো পণ্য পাওয়া যায়নি
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
                আপনার অনুসন্ধানের শর্ত অনুযায়ী কোনো পণ্য মেলেনি। অন্য ক্যাটাগরি বা দামের ফিল্টার
                পরিবর্তন করে দেখুন।
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
              >
                সকল ফিল্টার রিসেট করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white border border-stone-200 text-stone-700 text-xs font-semibold rounded-lg disabled:opacity-40 hover:bg-stone-50 transition-colors"
              >
                পূর্ববর্তী
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold tabular-bdt transition-colors ${
                    currentPage === i + 1
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white border border-stone-200 text-stone-700 text-xs font-semibold rounded-lg disabled:opacity-40 hover:bg-stone-50 transition-colors"
              >
                পরবর্তী
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
