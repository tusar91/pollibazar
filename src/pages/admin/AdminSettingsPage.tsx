import React, { useState } from 'react';
import {
  Check,
  Copy,
  Database,
  Download,
  RotateCcw,
  Save,
  Server,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useProducts } from '../../context/ProductContext';
import { useNavigation } from '../../context/NavigationContext';

export const AdminSettingsPage: React.FC = () => {
  const { resetToDefaults } = useProducts();
  const { adminUserRole } = useNavigation();
  const isModerator = adminUserRole === 'moderator';

  const [storeName, setStoreName] = useState('PolliBazar (পল্লি বাজার)');
  const [storePhone, setStorePhone] = useState('01712334707');
  const [storeEmail, setStoreEmail] = useState('ice.tusar@gmail.com');
  const [storeAddress, setStoreAddress] = useState(
    'PolliBazar, Madhurkhola, Muksudpur, Dohar, Dhaka, Bangladesh'
  );
  const [dhakaDelivery, setDhakaDelivery] = useState(60);
  const [outsideDelivery, setOutsideDelivery] = useState(120);
  const [freeThreshold, setFreeThreshold] = useState(2500);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetFeedback, setResetFeedback] = useState(false);

  const handleReset = () => {
    resetToDefaults();
    setShowResetConfirm(false);
    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const d1SqlSchema = `-- Cloudflare D1 Database Schema for PolliBazar
-- Tables: products, categories, customers, orders, order_items, admins, sessions, settings

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(slug),
  price REAL NOT NULL,
  old_price REAL,
  discount INTEGER,
  unit TEXT NOT NULL,
  image TEXT NOT NULL,
  gallery TEXT,
  short_description TEXT,
  description TEXT,
  rating REAL DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  origin TEXT,
  featured BOOLEAN DEFAULT 0,
  new_arrival BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  district TEXT NOT NULL,
  upazila TEXT NOT NULL,
  address TEXT NOT NULL,
  post_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  district TEXT NOT NULL,
  upazila TEXT NOT NULL,
  address TEXT NOT NULL,
  subtotal REAL NOT NULL,
  delivery_charge REAL NOT NULL,
  discount REAL DEFAULT 0,
  total REAL NOT NULL,
  payment_method TEXT NOT NULL,
  payment_number TEXT,
  trx_id TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT
);

CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

  const handleCopySql = () => {
    navigator.clipboard?.writeText(d1SqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (isModerator) {
    return (
      <AdminLayout currentTab="admin-settings">
        <div className="max-w-2xl bg-white border border-stone-200 rounded-2xl p-8 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              অননুমোদিত অ্যাক্সেস (Access Restricted)
            </h2>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              স্টোর সেটিংস এবং ক্লাউডফ্লেয়ার D1 ডাটাবেজ ব্যাকআপ ও কনফিগারেশন সুবিধা শুধুমাত্র মূল অ্যাডমিন (Admin) অ্যাকাউন্টের জন্য সংরক্ষিত।
            </p>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-700 space-y-1.5">
            <p className="font-semibold text-stone-900">মডারেটর হিসেবে আপনার অনুমোদিত কাজসমূহ:</p>
            <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1">
              <li>অর্ডারসমূহের তালিকা ও বিস্তারিত পর্যবেক্ষণ</li>
              <li>অর্ডারের স্থিতি (Status) পরিবর্তন ও ডেলিভারি আপডেট</li>
              <li>পণ্য ক্যাটালগ ও ক্যাটাগরি তালিকা পর্যবেক্ষণ</li>
              <li>গ্রাহক তালিকা ও যোগাযোগের বিবরণী দেখা</li>
            </ul>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentTab="admin-settings">
      <div className="space-y-8 max-w-4xl">
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-serif">
            স্টোর সেটিংস ও Cloudflare D1 প্রস্তুতি
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            ব্যবসার বিবরণ, ডেলিভারি হার ও ক্লাউডফ্লেয়ার ডি১ ব্যাকএন্ড স্কিমা
          </p>
        </div>

        {/* Store Information Form */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          <h3 className="text-sm font-bold text-stone-900 pb-3 border-b border-stone-100">
            সাধারণ স্টোর তথ্য (Business Information)
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  ব্যবসার নাম (Business Name)
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  হটলাইন ফোন নম্বর (Phone)
                </label>
                <input
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  অফিসিয়াল ইমেইল (Email)
                </label>
                <input
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  ফ্রি ডেলিভারি সীমা (৳)
                </label>
                <input
                  type="number"
                  value={freeThreshold}
                  onChange={(e) => setFreeThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 tabular-bdt"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 block mb-1">
                  স্টোর ঠিকানা (Address)
                </label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>সেটিংস সংরক্ষণ করুন</span>
                </button>
                {savedSuccess && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                    <Check className="w-3.5 h-3.5" />
                    <span>সফলভাবে সংরক্ষিত হয়েছে!</span>
                  </span>
                )}
              </div>

              {showResetConfirm ? (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 p-2 rounded-lg text-xs">
                  <span className="text-rose-700 font-medium">ডেমো ডেটা রিসেট করবেন?</span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition-colors"
                  >
                    হ্যাঁ, রিসেট করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded transition-colors"
                  >
                    বাতিল
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-stone-500 hover:text-rose-600 flex items-center gap-1 text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ডেমো ডেটা রিসেট</span>
                </button>
              )}

              {resetFeedback && (
                <span className="text-xs text-emerald-700 font-medium block">
                  সফলভাবে ডিফল্ট ডেটায় রিসেট করা হয়েছে!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Future Cloudflare D1 Backend Schema Box */}
        <div className="bg-stone-900 text-stone-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Cloudflare D1 Backend Schema (SQL Architecture)
              </h3>
            </div>

            <button
              onClick={handleCopySql}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>SQL কপি করুন</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed">
            পল্লি বাজারের ফ্রন্টএন্ড কোড এবং ডেটা স্ট্রাকচার সম্পূর্ণভাবে এই Cloudflare D1 রিলেশনাল
            স্কিমার সাথে সামঞ্জস্যপূর্ণ। পরবর্তীতে যখন Cloudflare Pages Functions ও D1 যুক্ত হবে,
            তখন নিচের SQL স্ক্রিপ্টটি চালিয়ে সরাসরি সার্ভারলেস ডেটাবেস প্রস্তুত করা যাবে।
          </p>

          <pre className="p-4 bg-stone-950 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-72 border border-stone-800 leading-relaxed">
            {d1SqlSchema}
          </pre>
        </div>
      </div>
    </AdminLayout>
  );
};
