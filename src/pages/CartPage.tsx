import React, { useState } from 'react';
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  Tag,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';

export const CartPage: React.FC = () => {
  const {
    cart,
    cartCount,
    subtotal,
    deliveryCharge,
    deliveryDistrict,
    setDeliveryDistrict,
    couponCode,
    discountAmount,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { navigate } = useNavigation();
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string }>({});

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
          শপিং কার্ট
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          আপনার কার্টে মোট <strong className="text-stone-900 tabular-bdt">{cartCount}</strong> টি পণ্য রয়েছে
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-stone-900 mb-2">
            আপনার কার্ট বর্তমানে খালি
          </h2>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            আপনি এখনও কোনো পণ্য কার্টে যোগ করেননি। পল্লি বাজারের খাঁটি ও তাজা পণ্য দেখতে
            শপ ভিজিট করুন।
          </p>
          <button
            onClick={() => navigate('shop')}
            className="px-6 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
          >
            কেনাকাটা শুরু করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Cart Items List (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between">
                <span className="text-sm font-bold text-stone-900">পণ্যের তালিকা</span>
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
                >
                  সবগুলো মুছুন
                </button>
              </div>

              <div className="divide-y divide-stone-100">
                {cart.map((item) => (
                  <div key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl bg-stone-100 border border-stone-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider block">
                            {item.product.categoryName}
                          </span>
                          <h3 className="text-sm font-bold text-stone-900 leading-snug">
                            {item.product.name}
                          </h3>
                          <span className="text-xs text-stone-500">
                            একক মূল্য: ৳{item.product.price} ({item.product.unit})
                          </span>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Bottom row: Stepper & Subtotal */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-50">
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-stone-200 text-stone-600 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold tabular-bdt text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1.5 hover:bg-stone-200 disabled:opacity-40 disabled:hover:bg-transparent text-stone-600 transition-colors"
                            aria-label="Increase quantity"
                            title={item.quantity >= item.product.stock ? 'সর্বোচ্চ স্টক পরিমাণ পৌঁছেছে' : 'পরিমাণ বাড়ান'}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-bold text-stone-900 tabular-bdt">
                            ৳{item.product.price * item.quantity}
                          </span>
                          {item.quantity >= item.product.stock && (
                            <span className="text-[10px] text-amber-700 block">
                              সর্বোচ্চ স্টক: {item.product.stock}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                onClick={() => navigate('shop')}
                className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>আরও কেনাকাটা করুন</span>
              </button>
            </div>
          </div>

          {/* Right: Order Summary (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-stone-900">
                অর্ডার সারাংশ
              </h2>

              {/* District Selector for Delivery Calculation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  ডেলিভারি অঞ্চল নির্বাচন করুন
                </label>
                <select
                  value={deliveryDistrict}
                  onChange={(e) => setDeliveryDistrict(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="ঢাকা">ঢাকা জেলা ও দোহার (ডেলিভারি ৳৬০)</option>
                  <option value="অন্যান্য জেলা">অন্যান্য জেলা (ডেলিভারি ৳১২০)</option>
                </select>
                {subtotal >= 2500 ? (
                  <p className="text-[11px] text-emerald-700 font-medium">
                    🎉 ২৫০০৳ এর বেশি অর্ডারে আপনি ফ্রি ডেলিভারি পাচ্ছেন!
                  </p>
                ) : (
                  <p className="text-[11px] text-stone-500">
                    আরও ৳{2500 - subtotal} টাকার পণ্য কিনলে ফ্রি ডেলিভারি!
                  </p>
                )}
              </div>

              {/* Coupon Form */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700 block">
                  কুপন বা ডিসকাউন্ট কোড
                </label>
                {couponCode ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{couponCode} (সক্রিয়)</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                    >
                      বাতিল
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="POLLI10"
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 uppercase"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      প্রয়োগ
                    </button>
                  </form>
                )}
                {couponFeedback.message && (
                  <p
                    className={`text-[11px] ${
                      couponFeedback.success ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}
              </div>

              {/* Calculation Rows */}
              <div className="border-t border-stone-100 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>পণ্যসমূহের মূল্য (সাবটোটাল)</span>
                  <span className="font-semibold text-stone-900 tabular-bdt">৳{subtotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>কুপন ছাড়</span>
                    <span className="font-semibold tabular-bdt">-৳{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-semibold text-stone-900 tabular-bdt">
                    {deliveryCharge === 0 ? 'ফ্রি' : `৳${deliveryCharge}`}
                  </span>
                </div>

                <div className="border-t border-stone-200 pt-3 flex justify-between text-sm">
                  <span className="font-bold text-stone-900">সর্বমোট প্রদেয়</span>
                  <span className="font-bold text-emerald-800 text-lg tabular-bdt">৳{total}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('checkout')}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>অর্ডার নিশ্চিত করতে এগিয়ে যান</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
