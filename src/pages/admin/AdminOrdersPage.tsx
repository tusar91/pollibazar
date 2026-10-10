import React, { useState, useEffect } from 'react';
import {
  Eye,
  Filter,
  Search,
  ShoppingBag,
  Trash2,
  X,
  Phone,
  MapPin,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useOrders } from '../../context/OrderContext';
import { Order, OrderStatus } from '../../types';
import { ProductImage } from '../../components/ProductImage';

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, fetchOrders, isLoading } = useOrders();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Hydrate fresh orders from D1 backend on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      Boolean(o.orderId && o.orderId.toLowerCase().includes(q)) ||
      Boolean(o.customer?.fullName && o.customer.fullName.toLowerCase().includes(q)) ||
      Boolean(o.customer?.phone && o.customer.phone.includes(search.trim()));
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(orderId);
    await updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    setIsUpdating(null);
  };

  return (
    <AdminLayout currentTab="admin-orders">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-serif">
              অর্ডার ব্যবস্থাপনা (Orders)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              সর্বমোট {orders.length} টি অর্ডারের স্থিতি পরিচালনা ও পর্যবেক্ষণ
            </p>
          </div>

          <button
            onClick={() => fetchOrders()}
            disabled={isLoading}
            className="px-3.5 py-2 bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
            title="নতুন অর্ডার লোড করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : 'text-stone-500'}`} />
            <span>{isLoading ? 'রিফ্রেশ হচ্ছে...' : 'রিফ্রেশ করুন'}</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="অর্ডার আইডি বা মোবাইল..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-stone-500">স্টেটাস:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 font-medium"
            >
              <option value="all">সবগুলো ({orders.length})</option>
              <option value="placed">অর্ডার গৃহীত (Placed)</option>
              <option value="processing">প্রস্তুত হচ্ছে (Processing)</option>
              <option value="shipped">কুরিয়ারে পাঠানো (Shipped)</option>
              <option value="out_for_delivery">ডেলিভারির পথে (Out for Delivery)</option>
              <option value="delivered">সম্পন্ন (Delivered)</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">অর্ডার আইডি</th>
                  <th className="py-3 px-4">গ্রাহক</th>
                  <th className="py-3 px-4">পণ্য ও পরিমাণ</th>
                  <th className="py-3 px-4">মোট বিল (৳)</th>
                  <th className="py-3 px-4">পেমেন্ট</th>
                  <th className="py-3 px-4">স্টেটাস আপডেট</th>
                  <th className="py-3 px-4 text-right">ভিউ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
                      <p className="font-medium text-stone-600">কোনো অর্ডার পাওয়া যায়নি</p>
                      <p className="text-[11px] text-stone-400 mt-1">
                        ফিল্টার পরিবর্তন করুন অথবা নতুন অর্ডারের জন্য রিফ্রেশ বাটনে ক্লিক করুন।
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.orderId} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {o.orderId}
                        <div className="text-[10px] text-stone-400 font-sans tabular-bdt">
                          {o.createdAt}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">{o.customer.fullName}</div>
                        <div className="text-[11px] text-stone-500">{o.customer.phone}</div>
                        <div className="text-[10px] text-stone-400 truncate max-w-[150px]">
                          {o.customer.district}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-stone-800">
                          {o.items.length} টি আইটেম
                        </span>
                        <div className="text-[10px] text-stone-400 line-clamp-1">
                          {o.items.map((i) => i.name).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900 tabular-bdt">
                        ৳{o.total}
                      </td>
                      <td className="py-3 px-4">
                        <span className="uppercase text-[11px] font-semibold block">
                          {o.paymentMethod}
                        </span>
                        {o.trxId && (
                          <span className="text-[10px] text-emerald-700 font-mono">
                            Trx: {o.trxId}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            handleStatusChange(o.orderId, e.target.value as OrderStatus)
                          }
                          className={`text-[11px] font-bold rounded-lg px-2 py-1 border cursor-pointer ${
                            o.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : o.status === 'shipped'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : o.status === 'processing'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="placed">Placed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition-colors"
                          title="বিস্তারিত দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-mono">
                  {selectedOrder.orderId}
                </h3>
                <span className="text-xs text-stone-400">তারিখ: {selectedOrder.createdAt}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-stone-50 p-3.5 rounded-xl text-xs space-y-1">
              <span className="font-bold text-stone-900 block mb-1">গ্রাহকের বিবরণ:</span>
              <p><strong>নাম:</strong> {selectedOrder.customer.fullName}</p>
              <p><strong>ফোন:</strong> {selectedOrder.customer.phone}</p>
              {selectedOrder.customer.email && (
                <p><strong>ইমেইল:</strong> {selectedOrder.customer.email}</p>
              )}
              <p>
                <strong>ঠিকানা:</strong> {selectedOrder.customer.address},{' '}
                {selectedOrder.customer.area}, {selectedOrder.customer.district}
              </p>
              {selectedOrder.customer.notes && (
                <p className="text-amber-800">
                  <strong>নোট:</strong> {selectedOrder.customer.notes}
                </p>
              )}
            </div>

            {/* Item list */}
            <div className="divide-y divide-stone-100 text-xs">
              <span className="font-bold text-stone-900 block pb-2">অর্ডারের আইটেমসমূহ:</span>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 rounded object-cover border"
                    />
                    <div>
                      <div className="font-semibold text-stone-900">{item.name}</div>
                      <div className="text-[10px] text-stone-500">
                        {item.quantity} × ৳{item.price} ({item.unit})
                      </div>
                    </div>
                  </div>
                  <span className="font-bold tabular-bdt">৳{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-stone-200 pt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>সাবটোটাল</span>
                <span className="tabular-bdt">৳{selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ</span>
                <span className="tabular-bdt">৳{selectedOrder.deliveryCharge}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>ডিসকাউন্ট</span>
                  <span className="tabular-bdt">-৳{selectedOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-stone-900 pt-1 border-t">
                <span>সর্বমোট প্রদেয়</span>
                <span className="text-emerald-800 tabular-bdt">৳{selectedOrder.total}</span>
              </div>
            </div>

            {/* Status change in modal */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                অর্ডার স্টেটাস পরিবর্তন করুন:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered'] as OrderStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedOrder.orderId, st)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                        selectedOrder.status === st
                          ? 'bg-emerald-700 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
