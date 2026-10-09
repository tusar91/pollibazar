import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Truck,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useNavigation } from '../context/NavigationContext';
import { PaymentMethod } from '../types';
import { ProductImage } from '../components/ProductImage';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    subtotal,
    deliveryCharge,
    discountAmount,
    total,
    deliveryDistrict,
    setDeliveryDistrict,
    clearCart,
  } = useCart();
  const { createOrder } = useOrders();
  const { navigate } = useNavigation();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [postCode, setPostCode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [paymentNumber, setPaymentNumber] = useState('');
  const [trxId, setTrxId] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">
          আপনার কার্ট খালি রয়েছে
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          অর্ডার সম্পন্ন করতে প্রথমে কিছু পণ্য কার্টে যোগ করুন।
        </p>
        <button
          onClick={() => navigate('shop')}
          className="px-6 py-2.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
        >
          কেনাকাটা শুরু করুন
        </button>
      </div>
    );
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'আপনার পূর্ণ নাম লিখুন';
    }

    const cleanPhone = phone.trim().replace(/[-+ ]/g, '');
    if (!cleanPhone) {
      errs.phone = 'মোবাইল নম্বর দেওয়া আবশ্যক';
    } else if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      errs.phone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 01712334707)';
    }

    if (!address.trim()) {
      errs.address = 'সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন';
    }

    if (!area.trim()) {
      errs.area = 'এলাকা বা থানার নাম লিখুন';
    }

    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      if (!paymentNumber.trim()) {
        errs.paymentNumber = 'যে নম্বর থেকে পেমেন্ট করেছেন তা লিখুন';
      }
      if (!trxId.trim()) {
        errs.trxId = 'TrxID বা লেনদেন আইডি লিখুন';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Prepare items
    const orderItems = cart.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      unit: item.product.unit,
      image: item.product.image,
    }));

    const orderPayload = {
      customer: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        district: deliveryDistrict,
        area: area.trim(),
        address: address.trim(),
        postCode: postCode.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      items: orderItems,
      subtotal,
      deliveryCharge,
      discount: discountAmount,
      total,
      paymentMethod,
      paymentNumber: paymentNumber.trim() || undefined,
      trxId: trxId.trim() || undefined,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      if (res.ok) {
        const data: any = await res.json();
        if (data.success && data.order) {
          const apiOrder = createOrder({
            ...orderPayload,
            ...data.order,
          });
          clearCart();
          setIsSubmitting(false);
          navigate('order-success', { id: data.order.orderId || apiOrder.orderId });
          return;
        }
      }
    } catch {
      // Graceful fallback to client-side order creation
    }

    const newOrder = createOrder(orderPayload);
    clearCart();
    setIsSubmitting(false);
    navigate('order-success', { id: newOrder.orderId });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
          অর্ডার চেকআউট
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          অনুগ্রহ করে আপনার সঠিক ঠিকানা ও প্রয়োজনীয় তথ্য প্রদান করুন
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Details Box */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span>১. গ্রাহকের ঠিকানা ও তথ্য</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    পূর্ণ নাম <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="যেমন: মোঃ তানভীর হাসান"
                    className={`w-full px-3.5 py-2 text-xs bg-stone-50 border rounded-lg focus:outline-hidden focus:bg-white text-stone-900 ${
                      errors.fullName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-stone-200'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    মোবাইল নম্বর <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01712334707"
                    className={`w-full px-3.5 py-2 text-xs bg-stone-50 border rounded-lg focus:outline-hidden focus:bg-white text-stone-900 ${
                      errors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-stone-200'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    ইমেইল ঠিকানা (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white text-stone-900"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    জেলা <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={deliveryDistrict}
                    onChange={(e) => setDeliveryDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white text-stone-900 font-medium"
                  >
                    <option value="ঢাকা">ঢাকা (ডেলিভারি ৳৬০)</option>
                    <option value="দোহার, ঢাকা">দোহার, ঢাকা (ডেলিভারি ৳৬০)</option>
                    <option value="মুন্সীগঞ্জ">মুন্সীগঞ্জ</option>
                    <option value="মানিকগঞ্জ">মানিকগঞ্জ</option>
                    <option value="নারায়ণগঞ্জ">নারায়ণগঞ্জ</option>
                    <option value="গাজীপুর">গাজীপুর</option>
                    <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                    <option value="রাজশাহী">রাজশাহী</option>
                    <option value="খুলনা">খুলনা</option>
                    <option value="সিলেট">সিলেট</option>
                    <option value="বরিশাল">বরিশাল</option>
                    <option value="রংপুর">রংপুর</option>
                    <option value="অন্যান্য জেলা">অন্যান্য সকল জেলা</option>
                  </select>
                </div>

                {/* Area / Thana / Upazila */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    এলাকা / থানা / উপজেলা <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="যেমন: দোহার, ধানমন্ডি, বাড্ডা"
                    className={`w-full px-3.5 py-2 text-xs bg-stone-50 border rounded-lg focus:outline-hidden focus:bg-white text-stone-900 ${
                      errors.area ? 'border-rose-500 ring-1 ring-rose-500' : 'border-stone-200'
                    }`}
                  />
                  {errors.area && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.area}</span>
                    </p>
                  )}
                </div>

                {/* Full Address */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    সম্পূর্ণ বিস্তারিত ঠিকানা <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="গ্রাম/রোড নম্বর, বাড়ি/হোল্ডিং নম্বর, নিকটবর্তী পরিচিত স্থান..."
                    className={`w-full px-3.5 py-2 text-xs bg-stone-50 border rounded-lg focus:outline-hidden focus:bg-white text-stone-900 ${
                      errors.address ? 'border-rose-500 ring-1 ring-rose-500' : 'border-stone-200'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.address}</span>
                    </p>
                  )}
                </div>

                {/* Post Code & Notes */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    পোস্ট কোড
                  </label>
                  <input
                    type="text"
                    value={postCode}
                    onChange={(e) => setPostCode(e.target.value)}
                    placeholder="যেমন: ১৩৩০"
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    অর্ডার নোট (যদি থাকে)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="বিশেষ নির্দেশনা বা ডেলিভারির সময়"
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Box */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span>২. মূল্য পরিশোধের মাধ্যম (Payment Method)</span>
              </h2>

              <div className="space-y-3">
                {/* COD */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-stone-900 block">
                      ক্যাশ অন ডেলিভারি (Cash on Delivery)
                    </span>
                    <span className="text-[11px] text-stone-500">
                      পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানকে নগদ টাকা পরিশোধ করুন।
                    </span>
                  </div>
                </label>

                {/* bKash */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'bkash'
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bkash"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">
                        বিকাশ (bKash)
                      </span>
                      <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded">
                        bKash Personal
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      আমাদের বিকাশ নম্বরে (01712334707) সেন্ড মানি করুন।
                    </span>

                    {paymentMethod === 'bkash' && (
                      <div className="mt-3 pt-3 border-t border-pink-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                            আপনার বিকাশ নম্বর
                          </label>
                          <input
                            type="tel"
                            value={paymentNumber}
                            onChange={(e) => setPaymentNumber(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900"
                          />
                          {errors.paymentNumber && (
                            <p className="text-[10px] text-rose-600 mt-0.5">
                              {errors.paymentNumber}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                            TrxID (লেনদেন আইডি)
                          </label>
                          <input
                            type="text"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            placeholder="যেমন: BK9X..."
                            className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg uppercase text-stone-900"
                          />
                          {errors.trxId && (
                            <p className="text-[10px] text-rose-600 mt-0.5">
                              {errors.trxId}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* Nagad */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'nagad'
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="nagad"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => setPaymentMethod('nagad')}
                    className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">
                        নগদ (Nagad)
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                        Nagad Personal
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      আমাদের নগদ নম্বরে (01712334707) সেন্ড মানি করুন।
                    </span>

                    {paymentMethod === 'nagad' && (
                      <div className="mt-3 pt-3 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                            আপনার নগদ নম্বর
                          </label>
                          <input
                            type="tel"
                            value={paymentNumber}
                            onChange={(e) => setPaymentNumber(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900"
                          />
                          {errors.paymentNumber && (
                            <p className="text-[10px] text-rose-600 mt-0.5">
                              {errors.paymentNumber}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                            TrxID (লেনদেন আইডি)
                          </label>
                          <input
                            type="text"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            placeholder="যেমন: NG88..."
                            className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg uppercase text-stone-900"
                          />
                          {errors.trxId && (
                            <p className="text-[10px] text-rose-600 mt-0.5">
                              {errors.trxId}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4 sticky top-28">
              <h2 className="text-base font-bold text-stone-900">
                অর্ডার বিস্তারিত
              </h2>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="py-2.5 flex items-center gap-3 first:pt-0">
                    <ProductImage
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg border border-stone-200 bg-stone-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <span className="text-[11px] text-stone-500 tabular-bdt">
                        {item.quantity} × ৳{item.product.price} ({item.product.unit})
                      </span>
                    </div>
                    <span className="text-xs font-bold text-stone-900 tabular-bdt shrink-0">
                      ৳{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="border-t border-stone-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>সাবটোটাল</span>
                  <span className="font-semibold text-stone-900 tabular-bdt">৳{subtotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>ডিসকাউন্ট ছাড়</span>
                    <span className="font-semibold tabular-bdt">-৳{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>ডেলিভারি চার্জ ({deliveryDistrict})</span>
                  <span className="font-semibold text-stone-900 tabular-bdt">
                    {deliveryCharge === 0 ? 'ফ্রি' : `৳${deliveryCharge}`}
                  </span>
                </div>

                <div className="border-t border-stone-200 pt-3 flex justify-between text-sm">
                  <span className="font-bold text-stone-900">মোট প্রদেয়</span>
                  <span className="font-bold text-emerald-800 text-lg tabular-bdt">৳{total}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-400 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <span>অর্ডার প্রস্তুত হচ্ছে...</span>
                ) : (
                  <>
                    <span>অর্ডার সম্পন্ন করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-[11px] text-stone-500 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>আপনার ব্যক্তিগত তথ্য সম্পূর্ণ সুরক্ষিত থাকবে</span>
                </div>
                <p>
                  অর্ডার দেওয়ার পর আমাদের টিম শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করবে।
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
