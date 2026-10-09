import React, { useState } from 'react';
import { Minus, Plus, ShoppingBag, Star, X, Check, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { ProductImage } from './ProductImage';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { openProduct } = useNavigation();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const activeImage = images[activeImageIndex] || product.image;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-stone-400 hover:text-stone-700 bg-white/80 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery Left */}
            <div className="bg-stone-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200">
              <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-white border border-stone-200">
                <ProductImage
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discount && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-xs">
                    -{product.discount}% ছাড়
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${
                        activeImageIndex === idx ? 'border-emerald-600' : 'border-stone-200'
                      }`}
                    >
                      <ProductImage src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Right */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
                  <span className="font-medium text-emerald-800">{product.categoryName}</span>
                  {product.origin && (
                    <>
                      <span>·</span>
                      <span>উৎপত্তি: {product.origin}</span>
                    </>
                  )}
                </div>

                <h3 className="text-lg font-bold text-stone-900 leading-snug mb-2">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                    <span className="text-xs font-bold text-stone-800 ml-1">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-xs text-stone-400">
                    ({product.reviewCount} টি রিভিউ)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl font-bold text-emerald-800 tabular-bdt">
                    ৳{product.price}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-stone-400 line-through tabular-bdt">
                      ৳{product.oldPrice}
                    </span>
                  )}
                  <span className="text-xs text-stone-500">/ {product.unit}</span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed mb-6">
                  {product.shortDescription}
                </p>

                {/* Stock status */}
                <div className="flex items-center gap-2 text-xs mb-6">
                  <span className="text-stone-500">স্টক অবস্থা:</span>
                  {product.isAvailable && product.stock > 0 ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> স্টকে আছে ({product.stock} টি)
                    </span>
                  ) : (
                    <span className="text-rose-600 font-medium">স্টক শেষ</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-stone-200 text-stone-600 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-semibold tabular-bdt text-stone-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-2 hover:bg-stone-200 text-stone-600 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={!product.isAvailable || product.stock === 0}
                    className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>কার্টে যোগ করুন</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    openProduct(product.slug);
                  }}
                  className="w-full text-center text-xs font-medium text-emerald-800 hover:text-emerald-950 hover:underline flex items-center justify-center gap-1 py-1"
                >
                  <span>বিস্তারিত পেজে যান</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
