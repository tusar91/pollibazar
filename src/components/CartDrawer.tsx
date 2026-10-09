import React from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { ProductImage } from './ProductImage';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartCount,
    subtotal,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const { navigate } = useNavigation();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 transition-opacity backdrop-blur-xs"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-stone-900">
                শপিং কার্ট ({cartCount} টি পণ্য)
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-stone-800 mb-1">
                  আপনার কার্ট বর্তমানে খালি
                </h3>
                <p className="text-sm text-stone-500 mb-6 max-w-xs">
                  পল্লি বাজারের খাঁটি ও তাজা পণ্য দেখতে এখনই শপে যান।
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('shop');
                  }}
                  className="px-5 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors shadow-xs"
                >
                  কেনাকাটা শুরু করুন
                </button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="pt-4 first:pt-0 flex gap-4">
                    <ProductImage
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-18 h-18 object-cover rounded-lg bg-stone-100 shrink-0 border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-stone-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{item.product.unit}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-stone-200 text-stone-600 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold tabular-bdt text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1 hover:bg-stone-200 disabled:opacity-40 disabled:hover:bg-transparent text-stone-600 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-stone-900 tabular-bdt">
                          ৳{item.product.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-stone-200 p-6 bg-stone-50 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">সাবটোটাল</span>
                <span className="text-lg font-bold text-stone-900 tabular-bdt">
                  ৳{subtotal}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                ডেলিভারি চার্জ ও ট্যাক্স চেকআউট পেজে হিসাব করা হবে।
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('cart');
                  }}
                  className="w-full py-2.5 px-4 bg-white border border-stone-300 text-stone-700 text-sm font-semibold rounded-lg hover:bg-stone-100 transition-colors text-center"
                >
                  কার্ট দেখুন
                </button>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('checkout');
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>চেকআউট</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
