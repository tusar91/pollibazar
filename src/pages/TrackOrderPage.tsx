import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Search,
  Truck,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useNavigation } from '../context/NavigationContext';
import { Order, OrderStatus } from '../types';

export const TrackOrderPage: React.FC = () => {
  const { orders, getOrderById, getOrderByTracking } = useOrders();
  const { params } = useNavigation();

  const [orderIdInput, setOrderIdInput] = useState(params.id || '');
  const [phoneInput, setPhoneInput] = useState(params.phone || '');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto search if params provided
  useEffect(() => {
    if (params.id) {
      const found = getOrderById(params.id);
      if (found) {
        setSearchedOrder(found);
        setHasSearched(true);
      }
    }
  }, [params.id, getOrderById]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setHasSearched(true);

    if (!orderIdInput.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার অর্ডার আইডি (যেমন: PB-20261008-0001) লিখুন');
      setSearchedOrder(null);
      return;
    }

    let found: Order | undefined;
    if (phoneInput.trim()) {
      found = getOrderByTracking(orderIdInput, phoneInput);
    } else {
      found = getOrderById(orderIdInput);
    }

    if (found) {
      setSearchedOrder(found);
      return;
    }

    // Server-side lookup via Cloudflare Pages Functions
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderIdInput.trim(),
          phone: phoneInput.trim(),
        }),
      });
      if (res.ok) {
        const result: any = await res.json();
        if (result.success && result.data) {
          setSearchedOrder(result.data);
          return;
        }
      }
    } catch {
      // Fallback
    }

    setSearchedOrder(null);
    setErrorMessage('প্রদত্ত তথ্য অনুযায়ী কোনো অর্ডার পাওয়া যায়নি। সঠিক অর্ডার আইডি বা মোবাইল নম্বর দিন।');
  };

  const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'placed', label: 'অর্ডার গ্রহণ করা হয়েছে', desc: 'অর্ডারটি সফলভাবে সিস্টেমে জমা হয়েছে' },
    { key: 'processing', label: 'অর্ডার প্রস্তুত হচ্ছে', desc: 'পণ্য যাচাই ও প্যাকিং সম্পন্ন হচ্ছে' },
    { key: 'shipped', label: 'কুরিয়ারে পাঠানো হয়েছে', desc: 'ডেলিভারি পার্টনারের নিকট হস্তান্তর করা হয়েছে' },
    { key: 'out_for_delivery', label: 'ডেলিভারির পথে', desc: 'ডেলিভারি ম্যান আপনার ঠিকানার দিকে বের হয়েছে' },
    { key: 'delivered', label: 'ডেলিভারি সম্পন্ন', desc: 'গ্রাহকের নিকট সফলভাবে পৌঁছে দেওয়া হয়েছে' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = searchedOrder ? getStepIndex(searchedOrder.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
          অর্ডার ট্র্যাকিং
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
          আপনার অর্ডার আইডি ও মোবাইল নম্বর লিখে বর্তমান স্থিতি (Status) লাইভ জানুন
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                অর্ডার আইডি <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="যেমন: PB-20261008-0001"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white text-stone-900 uppercase font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                মোবাইল নম্বর (ঐচ্ছিক)
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="01712334707"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white text-stone-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>অর্ডারের অবস্থা দেখুন</span>
          </button>
        </form>

        {/* Demo order quick links for testing */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
          <span>দ্রুত টেস্ট করুন:</span>
          {orders.slice(0, 3).map((o) => (
            <button
              key={o.orderId}
              type="button"
              onClick={() => {
                setOrderIdInput(o.orderId);
                setPhoneInput(o.customer.phone);
                setSearchedOrder(o);
                setHasSearched(true);
                setErrorMessage('');
              }}
              className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded font-mono font-medium transition-colors"
            >
              {o.orderId}
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Search Result Timeline */}
      {searchedOrder && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8 animate-fadeIn">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-stone-100">
            <div>
              <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider block">
                অর্ডার স্টেটাস
              </span>
              <h2 className="text-xl font-bold text-stone-900 font-mono">
                {searchedOrder.orderId}
              </h2>
              <span className="text-xs text-stone-500">
                অর্ডার তারিখ: {searchedOrder.createdAt}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                {statusSteps[currentStepIdx].label}
              </span>
            </div>
          </div>

          {/* Visual Order Timeline */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-6">
              ডেলিভারি অগ্রগতি
            </h3>

            <div className="relative">
              {/* Desktop Horizontal Line */}
              <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-stone-200 -z-0">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500"
                  style={{
                    width: `${(currentStepIdx / (statusSteps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Steps Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                {statusSteps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div
                      key={step.key}
                      className="flex sm:flex-col items-start sm:items-center gap-3 sm:text-center"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-stone-300 text-stone-400'
                        } ${isCurrent ? 'ring-4 ring-emerald-600/20' : ''}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="text-xs font-bold">{idx + 1}</span>
                        )}
                      </div>

                      <div className="sm:mt-2">
                        <h4
                          className={`text-xs font-bold ${
                            isCompleted ? 'text-stone-900' : 'text-stone-400'
                          }`}
                        >
                          {step.label}
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5 max-w-[140px] sm:mx-auto">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Info & Delivery Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-stone-100 text-xs">
            {/* Delivery address */}
            <div className="space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200/70">
              <span className="font-bold text-stone-900 block">প্রাপকের ঠিকানা ও বিবরণ</span>
              <p className="text-stone-700">{searchedOrder.customer.fullName}</p>
              <p className="text-stone-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{searchedOrder.customer.phone}</span>
              </p>
              <p className="text-stone-600 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>
                  {searchedOrder.customer.address}, {searchedOrder.customer.area},{' '}
                  {searchedOrder.customer.district}
                </span>
              </p>
            </div>

            {/* Delivery estimate */}
            <div className="space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200/70">
              <span className="font-bold text-stone-900 block">পেমেন্ট ও সম্ভাব্য তারিখ</span>
              <p className="text-stone-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>
                  সম্ভাব্য ডেলিভারি:{' '}
                  <strong className="text-stone-900">
                    {searchedOrder.estimatedDelivery || '২৪-৪৮ ঘণ্টার মধ্যে'}
                  </strong>
                </span>
              </p>
              <p className="text-stone-600 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                <span>
                  পেমেন্ট মাধ্যম:{' '}
                  <strong className="text-stone-900">
                    {searchedOrder.paymentMethod === 'cod'
                      ? 'ক্যাশ অন ডেলিভারি'
                      : searchedOrder.paymentMethod === 'bkash'
                      ? 'বিকাশ (bKash)'
                      : 'নগদ (Nagad)'}
                  </strong>
                </span>
              </p>
              <p className="text-stone-600">
                মোট বিল:{' '}
                <strong className="text-emerald-800 text-sm tabular-bdt">
                  ৳{searchedOrder.total}
                </strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
