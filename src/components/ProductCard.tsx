import React, { useState } from 'react';
import { Eye, Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { QuickViewModal } from './QuickViewModal';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { openProduct } = useNavigation();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isFavorited = wishlist.includes(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.isAvailable || product.stock === 0) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <div
        onClick={() => openProduct(product.slug)}
        className="group relative bg-white border border-stone-200/90 rounded-xl overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col cursor-pointer"
      >
        {/* Top Image Container */}
        <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Discount Badge */}
          {product.discount && (
            <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
              -{product.discount}%
            </span>
          )}

          {/* Out of Stock Overlay */}
          {(!product.isAvailable || product.stock === 0) && (
            <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-2xs flex items-center justify-center">
              <span className="bg-white/90 text-stone-900 text-xs font-bold px-3 py-1 rounded-md shadow-xs">
                স্টক শেষ
              </span>
            </div>
          )}

          {/* Quick Actions Hover Island */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full shadow-xs transition-colors ${
                isFavorited
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-white/95 text-stone-600 hover:text-rose-600'
              }`}
              title="পছন্দ করুন"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
            </button>

            <button
              onClick={handleOpenQuickView}
              className="p-2 bg-white/95 text-stone-600 hover:text-emerald-700 rounded-full shadow-xs transition-colors"
              title="ঝটপট দেখুন"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Clean unboxed metadata per Zero-Pill discipline */}
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-1">
              <span className="text-emerald-800 font-medium">{product.categoryName}</span>
              {product.origin && (
                <>
                  <span>·</span>
                  <span>{product.origin}</span>
                </>
              )}
            </div>

            {/* Product Title */}
            <h3 className="text-sm font-semibold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug mb-1.5">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 text-xs mb-3">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                <span className="text-xs font-semibold text-stone-700 ml-1">
                  {product.rating}
                </span>
              </div>
              <span className="text-[11px] text-stone-400">({product.reviewCount})</span>
              <span className="text-stone-300">·</span>
              <span className="text-[11px] text-stone-500 truncate">{product.unit}</span>
            </div>
          </div>

          {/* Pricing & Add to Cart button */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-base font-bold text-stone-900 tabular-bdt">
                ৳{product.price}
              </span>
              {product.oldPrice && (
                <span className="text-xs text-stone-400 line-through tabular-bdt">
                  ৳{product.oldPrice}
                </span>
              )}
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={!product.isAvailable || product.stock === 0}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-700 hover:text-white border border-emerald-200'
              } disabled:opacity-40 disabled:pointer-events-none cursor-pointer`}
              title="কার্টে যোগ করুন"
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">যুক্ত হয়েছে</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">কার্ট</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {isQuickViewOpen && (
        <QuickViewModal
          product={product}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </>
  );
};
