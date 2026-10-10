import React, { useEffect, useState } from 'react';
import {
  Boxes,
  CircleDollarSign,
  Clock,
  PackageCheck,
  ShoppingBag,
  TrendingUp,
  Users,
  ArrowRight,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useNavigation } from '../../context/NavigationContext';

export const AdminDashboardPage: React.FC = () => {
  const { products } = useProducts();
  const { orders, fetchOrders } = useOrders();
  const { navigate } = useNavigation();

  // Authenticated Admin State verified from /api/admin/me
  const [adminUser, setAdminUser] = useState<{ id: string; username: string; role: string } | null>(null);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);

  // Validate active session against /api/admin/me on page load
  useEffect(() => {
    let isMounted = true;

    const checkCurrentSession = async () => {
      try {
        fetchOrders(true);
        const token = localStorage.getItem('pb_session_token') || '';
        const res = await fetch('/api/admin/me', {
          method: 'GET',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.authenticated && data?.admin) {
            if (isMounted) {
              setAdminUser(data.admin);
              setIsVerifyingSession(false);
            }
            return;
          }
        }

        // If unauthorized or session expired, redirect to login
        if (res.status === 401) {
          try {
            localStorage.removeItem('pollibazar_admin_auth');
            localStorage.removeItem('pb_session_token');
          } catch {}
          if (isMounted) {
            navigate('admin-login');
          }
        }
      } catch {
        // Network or offline fallback
        const savedRole = localStorage.getItem('pollibazar_user_role') || 'admin';
        const savedUsername = localStorage.getItem('pollibazar_username') || 'admin';
        if (isMounted) {
          setAdminUser({ id: '1', username: savedUsername, role: savedRole });
        }
      } finally {
        if (isMounted) {
          setIsVerifyingSession(false);
        }
      }
    };

    checkCurrentSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'placed' || (o.status as string) === 'pending').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Unique customers
  const uniqueCustomerPhones = new Set(orders.map((o) => o.customer?.phone).filter(Boolean));
  const totalCustomers = uniqueCustomerPhones.size;

  return (
    <AdminLayout currentTab="admin-dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-serif">
              ওভারভিউ ও ড্যাশবোর্ড
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              পল্লি বাজারের বর্তমান বিক্রয় ও সামগ্রিক পরিসংখ্যান
            </p>
          </div>
          {adminUser && (
            <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-stone-900">লগইন: {adminUser.username}</span>
              <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {adminUser.role || 'admin'}
              </span>
            </div>
          )}
        </div>

        {/* 5 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-semibold">মোট পণ্য</span>
              <Boxes className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900 tabular-bdt">
              {totalProducts}
            </div>
            <span className="text-[11px] text-emerald-700">১০টি ক্যাটাগরিতে সক্রিয়</span>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-semibold">মোট অর্ডার</span>
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900 tabular-bdt">
              {totalOrders}
            </div>
            <span className="text-[11px] text-emerald-700">লাইভ ট্র্যাকিং সক্রিয়</span>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-semibold">অপেক্ষমান অর্ডার</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600 tabular-bdt">
              {pendingOrders}
            </div>
            <span className="text-[11px] text-amber-700">কনফার্মেশনের অপেক্ষায়</span>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-semibold">মোট গ্রাহক</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900 tabular-bdt">
              {totalCustomers}
            </div>
            <span className="text-[11px] text-blue-700">নিবন্ধিত ও সক্রিয়</span>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-semibold">মোট আয় (রেভিনিউ)</span>
              <CircleDollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-800 tabular-bdt">
              ৳{totalRevenue}
            </div>
            <span className="text-[11px] text-emerald-700">ক্যাশ ও ডিজিটাল পেমেন্ট</span>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">
              সাম্প্রতিক অর্ডারসমূহ
            </h3>
            <button
              onClick={() => navigate('admin-orders')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>সকল অর্ডার দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">অর্ডার আইডি</th>
                  <th className="py-3 px-4">গ্রাহকের নাম ও ফোন</th>
                  <th className="py-3 px-4">মোট বিল</th>
                  <th className="py-3 px-4">পেমেন্ট</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">অবস্থা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.orderId} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      {order.orderId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">
                        {order.customer.fullName}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {order.customer.phone} ({order.customer.district})
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900 tabular-bdt">
                      ৳{order.total}
                    </td>
                    <td className="py-3 px-4">
                      <span className="uppercase font-medium text-[11px]">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-500 tabular-bdt">
                      {order.createdAt}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'processing'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
