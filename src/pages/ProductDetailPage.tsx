import React, { useState } from 'react';
import {
  Check,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Zap,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';

export const ProductDetailPage: React.FC = () => {
  const { products, getProductById, getProductBySlug } = useProducts();
  const { params, navigate, openCategory } = useNavigation();
  const { addToCart, wishlist, toggleWishlist } = useCart();

  const productIdOrSlug = params.id || params.slug || 'pb-01';
  const product =
    getProductById(productIdOrSlug) ||
    getProductBySlug(productIdOrSlug) ||
    products[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">পণ্যটি খুঁজে পাওয়া যায়নি</h2>
        <button
          onClick={() => navigate('shop')}
          className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm"
        >
          শপে ফিরে যান
        </button>
      </div>
    );
  }

  const isFavorited = wishlist.includes(product.id);
  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const activeImage = images[activeImageIndex] || product.image;

  // Related products from the same category
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('checkout');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <button
          onClick={() => navigate('home')}
          className="hover:text-emerald-800 transition-colors"
        >
          হোম
        </button>
        <span>/</span>
        <button
          onClick={() => openCategory(product.category)}
          className="hover:text-emerald-800 transition-colors"
        >
          {product.categoryName}
        </button>
        <span>/</span>
        <span className="text-stone-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-4/3 w-full bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
            <ProductImage
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-xs">
                -{product.discount}% বিশেষ ছাড়
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <ProductImage src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase Module (lg:col-span-6) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div>
            {/* Metadata & Origin */}
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-800 uppercase tracking-wider">
                  {product.categoryName}
                </span>
                {product.origin && (
                  <>
                    <span>·</span>
                    <span>উৎপাদন অঞ্চল: {product.origin}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                  title="লিংক কপি করুন"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'কপি হয়েছে!' : 'শেয়ার'}</span>
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isFavorited
                      ? 'text-rose-600 bg-rose-50'
                      : 'text-stone-400 hover:text-rose-600 hover:bg-stone-100'
                  }`}
                  title="পছন্দের তালিকা"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif leading-tight mb-3">
              {product.name}
            </h1>

            {/* Ratings & Reviews */}
            <div className="flex items-center gap-3 text-xs mb-4">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                <span className="font-bold text-stone-900 ml-1.5">{product.rating}</span>
              </div>
              <span className="text-stone-300">·</span>
              <span className="text-stone-500">{product.reviewCount} জন গ্রাহক সন্তুষ্ট</span>
              <span className="text-stone-300">·</span>
              <span className="text-stone-500">পরিমাণ: {product.unit}</span>
            </div>

            {/* Pricing */}
            <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-4 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-emerald-800 tabular-bdt">
                  ৳{product.price}
                </span>
                {product.oldPrice && (
                  <span className="text-base text-stone-400 line-through tabular-bdt">
                    ৳{product.oldPrice}
                  </span>
                )}
                <span className="text-xs text-stone-500">
                  (প্রতি {product.unit} এর মূল্য)
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                ভ্যাট ও সকল সরকারি কর অন্তর্ভুক্ত
              </p>
            </div>

            {/* Short Description */}
            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              {product.shortDescription}
            </p>

            {/* Stock Availability */}
            <div className="flex items-center gap-2 text-xs mb-6">
              <span className="text-stone-500">স্টকের অবস্থা:</span>
              {product.isAvailable && product.stock > 0 ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> স্টকে মজুত রয়েছে ({product.stock} টি অবশিষ্ট)
                </span>
              ) : (
                <span className="text-rose-600 font-semibold">দুঃখিত, স্টক শেষ</span>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3.5 pt-2 border-t border-stone-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-stone-100 text-stone-600 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 text-sm font-bold tabular-bdt text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="p-3 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent text-stone-600 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!product.isAvailable || product.stock === 0}
                  className="flex-1 py-3 px-6 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>কার্টে যোগ করুন</span>
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={!product.isAvailable || product.stock === 0}
                className="w-full py-3 px-6 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>সরাসরি অর্ডার করুন (Buy Now)</span>
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Strip */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-stone-200 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>ঢাকা ও দোহারে ২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>ক্যাশ অন ডেলিভারি ও শতভাগ খাঁটি পণ্যের নিশ্চয়তা</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-6 border-b border-stone-200 pb-3 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 -mb-3 transition-colors ${
              activeTab === 'desc'
                ? 'text-emerald-700 border-b-2 border-emerald-700'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            পণ্যের পূর্ণ বিবরণ
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 -mb-3 transition-colors ${
              activeTab === 'specs'
                ? 'text-emerald-700 border-b-2 border-emerald-700'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            স্পেসিফিকেশন ও তথ্য
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 -mb-3 transition-colors ${
              activeTab === 'reviews'
                ? 'text-emerald-700 border-b-2 border-emerald-700'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            গ্রাহক রিভিউ ({product.reviewCount})
          </button>
        </div>

        <div className="pt-6">
          {activeTab === 'desc' && (
            <div className="prose prose-stone text-xs sm:text-sm leading-relaxed text-stone-700 space-y-4 max-w-3xl">
              <p>{product.description}</p>
              <p>
                পল্লি বাজার গ্রাহকদের স্বাস্থ্য এবং খাঁটি খাবারের স্বাদ অক্ষুণ্ণ রাখতে প্রতিটি
                পণ্য সরাসরি স্থানীয় কৃষক এবং খাঁটি কারিগরদের থেকে যাচাই করে সংগ্রহ করে।
                প্যাকিং এবং পরিবহনে সম্পূর্ণ স্বাস্থ্যসম্মত মান নিশ্চিত করা হয়।
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-xl text-xs sm:text-sm">
              <div className="divide-y divide-stone-100">
                <div className="py-2.5 flex justify-between">
                  <span className="text-stone-500">ব্র্যান্ড / প্ল্যাটফর্ম</span>
                  <span className="font-semibold text-stone-900">পল্লি বাজার (PolliBazar)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-stone-500">ক্যাটাগরি</span>
                  <span className="font-semibold text-stone-900">{product.categoryName}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-stone-500">প্যাকেট / ইউনিট</span>
                  <span className="font-semibold text-stone-900">{product.unit}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-stone-500">উৎপাদন অঞ্চল</span>
                  <span className="font-semibold text-stone-900">{product.origin || 'বাংলাদেশ'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-stone-500">পেমেন্ট মেথড</span>
                  <span className="font-semibold text-stone-900">ক্যাশ অন ডেলিভারি, বিকাশ, নগদ</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div className="text-center pr-4 border-r border-stone-200">
                  <span className="text-3xl font-bold text-stone-900 tabular-bdt">
                    {product.rating}
                  </span>
                  <div className="flex items-center text-amber-500 justify-center mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                  </div>
                  <span className="text-[11px] text-stone-400">সর্বমোট ৫ এর মধ্যে</span>
                </div>
                <p className="text-xs text-stone-600">
                  পল্লি বাজারের এই পণ্যটি কেনার পর {product.reviewCount} জন ক্রেতা ৫-স্টার
                  রেটিং দিয়ে সন্তুষ্টি প্রকাশ করেছেন।
                </p>
              </div>

              {/* Sample Reviews */}
              <div className="space-y-3">
                <div className="border border-stone-100 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900">মোঃ রফিকুল ইসলাম (দোহার)</span>
                    <span className="text-stone-400">৩ দিন আগে</span>
                  </div>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                  </div>
                  <p className="text-xs text-stone-600">
                    পণ্যের মান অসাধারণ। যেমন চেয়েছিলাম ঠিক তেমনই পেয়েছি। ডেলিভারিও খুব দ্রুত ছিল।
                  </p>
                </div>

                <div className="border border-stone-100 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900">তাহমিনা বেগম (ঢাকা)</span>
                    <span className="text-stone-400">১ সপ্তাহ আগে</span>
                  </div>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                  </div>
                  <p className="text-xs text-stone-600">
                    খাঁটি দেশি স্বাদের নিশ্চয়তা। পল্লি বাজার থেকে নিয়মিত কেনার ইচ্ছা আছে।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-stone-900 font-serif">
              সম্পর্কিত অন্যান্য পণ্য
            </h3>
            <button
              onClick={() => openCategory(product.category)}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              ক্যাটাগরির সব পণ্য
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
