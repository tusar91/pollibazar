import React, { useState } from 'react';
import { Mail, Phone, Search, Users } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useOrders } from '../../context/OrderContext';

interface CustomerSummary {
  name: string;
  phone: string;
  email?: string;
  district: string;
  area: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export const AdminCustomersPage: React.FC = () => {
  const { orders } = useOrders();
  const [search, setSearch] = useState('');

  // Aggregate customers from orders
  const customerMap = new Map<string, CustomerSummary>();

  orders.forEach((o) => {
    if (!o.customer?.phone) return;
    const key = o.customer.phone.trim();
    const existing = customerMap.get(key);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += (o.total || 0);
    } else {
      customerMap.set(key, {
        name: o.customer.fullName || 'গ্রাহক',
        phone: o.customer.phone,
        email: o.customer.email,
        district: o.customer.district || '',
        area: o.customer.area || '',
        address: o.customer.address || '',
        totalOrders: 1,
        totalSpent: o.total || 0,
        lastOrderDate: o.createdAt || '',
      });
    }
  });

  const customers = Array.from(customerMap.values()).filter((c) => {
    return (
      !search.trim() ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search.trim()) ||
      c.district.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <AdminLayout currentTab="admin-customers">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-serif">
            গ্রাহক তালিকা (Customers)
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            সর্বমোট {customers.length} জন গ্রাহকের তথ্য ও কেনাকাটার হিসাব
          </p>
        </div>

        {/* Search */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
          <div className="relative max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="গ্রাহকের নাম বা মোবাইল..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">গ্রাহকের নাম</th>
                  <th className="py-3 px-4">যোগাযোগ</th>
                  <th className="py-3 px-4">ঠিকানা</th>
                  <th className="py-3 px-4">মোট অর্ডার</th>
                  <th className="py-3 px-4">মোট ক্রয় (৳)</th>
                  <th className="py-3 px-4">সর্বশেষ কেনাকাটা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {customers.map((c) => (
                  <tr key={c.phone} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{c.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-stone-800">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{c.phone}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-0.5">
                          <Mail className="w-3 h-3 text-stone-400" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-stone-700">{c.address}</div>
                      <div className="text-[10px] text-stone-400">
                        {c.area}, {c.district}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold tabular-bdt">
                      {c.totalOrders} টি
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-800 tabular-bdt">
                      ৳{c.totalSpent}
                    </td>
                    <td className="py-3 px-4 text-stone-500 tabular-bdt">
                      {c.lastOrderDate}
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
