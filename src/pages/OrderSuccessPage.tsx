import React from 'react';
import {
  CheckCircle,
  Copy,
  Printer,
  ShoppingBag,
  Truck,
  ArrowRight,
  MapPin,
  Phone,
  Check,
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useNavigation } from '../context/NavigationContext';
import { ProductImage } from '../components/ProductImage';

export const OrderSuccessPage: React.FC = () => {
  const { orders, recentPlacedOrder } = useOrders();
  const { params, navigate } = useNavigation();

  const [copiedId, setCopiedId] = React.useState(false);

  const orderId = params.id || (recentPlacedOrder ? recentPlacedOrder.orderId : orders[0]?.orderId);
  const order = orders.find((o) => o.orderId === orderId) || recentPlacedOrder || orders[0];

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">কোনো অর্ডার পাওয়া যায়নি</h2>
        <button
          onClick={() => navigate('home')}
          className="px-5 py-2.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
        >
          হোমে ফিরে যান
        </button>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard?.writeText(order.orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Success Hero */}
      <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-xs text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
          অর্ডার সফলভাবে গ্রহণ করা হয়েছে!
        </h1>

        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
          পল্লি বাজার থেকে কেনাকাটা করার জন্য ধন্যবাদ। আমাদের প্রতিনিধি শীঘ্রই আপনার মোবাইল নম্বরে
          যোগাযোগ করে অর্ডারটি নিশ্চিত করবেন।
        </p>

        {/* Order ID Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs">
          <span className="text-stone-500 font-medium">অর্ডার নম্বর:</span>
          <span className="font-bold text-emerald-800 font-mono text-sm tracking-wide">
            {order.orderId}
          </span>
          <button
            onClick={handleCopyId}
            className="p-1 text-stone-500 hover:text-stone-900 transition-colors ml-1 cursor-pointer"
            title="আইডি কপি করুন"
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Action Buttons as requested */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate('track-order', { id: order.orderId, phone: order.customer.phone })}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>অর্ডার ট্র্যাক করুন</span>
          </button>

          <button
            onClick={() => navigate('shop')}
            className="px-5 py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>শপিং চালিয়ে যান</span>
          </button>

          <button
            onClick={() => navigate('home')}
            className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            হোমে ফিরে যান
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-500 border border-stone-200 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="প্রিন্ট করুন"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট রসিদ</span>
          </button>
        </div>
      </div>

      {/* Order Invoice Breakdown */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <h2 className="text-base font-bold text-stone-900">
            অর্ডার রসিদ বিবরণ
          </h2>
          <span className="text-xs text-stone-400 tabular-bdt">
            তারিখ: {order.createdAt}
          </span>
        </div>

        {/* Customer & Delivery Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200/80">
          <div>
            <span className="text-stone-400 font-medium block mb-1">গ্রাহকের তথ্য</span>
            <p className="font-bold text-stone-900">{order.customer.fullName}</p>
            <p className="text-stone-600 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-stone-400" />
              <span>{order.customer.phone}</span>
            </p>
            {order.customer.email && (
              <p className="text-stone-600 mt-0.5">{order.customer.email}</p>
            )}
          </div>

          <div>
            <span className="text-stone-400 font-medium block mb-1">ডেলিভারি ঠিকানা</span>
            <p className="text-stone-700 flex items-start gap-1">
              <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
              <span>
                {order.customer.address}, {order.customer.area},{' '}
                {order.customer.district}
                {order.customer.postCode ? ` (${order.customer.postCode})` : ''}
              </span>
            </p>
            <p className="text-stone-500 mt-1">
              পেমেন্ট মাধ্যম:{' '}
              <strong className="text-stone-900">
                {order.paymentMethod === 'cod'
                  ? 'ক্যাশ অন ডেলিভারি'
                  : order.paymentMethod === 'bkash'
                  ? 'বিকাশ (bKash)'
                  : 'নগদ (Nagad)'}
              </strong>
            </p>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="divide-y divide-stone-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <ProductImage
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded-lg border border-stone-200"
                />
                <div>
                  <h4 className="font-semibold text-stone-900">{item.name}</h4>
                  <span className="text-[11px] text-stone-500">
                    {item.quantity} × ৳{item.price} ({item.unit})
                  </span>
                </div>
              </div>
              <span className="font-bold text-stone-900 tabular-bdt">
                ৳{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Calculation Summary */}
        <div className="border-t border-stone-200 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>পণ্যসমূহের মোট মূল্য</span>
            <span className="font-semibold text-stone-900 tabular-bdt">৳{order.subtotal}</span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>ছাড়</span>
              <span className="font-semibold tabular-bdt">-৳{order.discount}</span>
            </div>
          )}

          <div className="flex justify-between text-stone-600">
            <span>ডেলিভারি চার্জ</span>
            <span className="font-semibold text-stone-900 tabular-bdt">
              {order.deliveryCharge === 0 ? 'ফ্রি' : `৳${order.deliveryCharge}`}
            </span>
          </div>

          <div className="border-t border-stone-200 pt-3 flex justify-between text-base">
            <span className="font-bold text-stone-900">সর্বমোট প্রদেয়</span>
            <span className="font-bold text-emerald-800 tabular-bdt">৳{order.total}</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => navigate('home')}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
        >
          মূল পাতায় (হোম) ফিরে যান
        </button>
      </div>
    </div>
  );
};
