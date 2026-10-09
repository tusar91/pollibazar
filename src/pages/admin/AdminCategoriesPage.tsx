import React, { useState } from 'react';
import { FolderTree, Plus, ShoppingBag, X } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useProducts } from '../../context/ProductContext';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, addCategory } = useProducts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const slug = catSlug.trim() || catName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    addCategory({
      name: catName.trim(),
      nameEn: catName.trim(),
      slug,
      icon: 'ShoppingBasket',
      count: 0,
      description: catDesc.trim() || 'নতুন ক্যাটাগরি',
    });
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setIsAddModalOpen(false);
  };

  return (
    <AdminLayout currentTab="admin-categories">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-serif">
              ক্যাটাগরি ব্যবস্থাপনা (Categories)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              মোট {categories.length} টি ক্যাটাগরি কনফিগার করা রয়েছে
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ক্যাটাগরি তৈরি করুন</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FolderTree className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full tabular-bdt">
                  {c.count} টি পণ্য
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-stone-900">{c.name}</h3>
                <span className="text-[11px] text-stone-400 font-mono">slug: {c.slug}</span>
                <p className="text-xs text-stone-500 mt-1.5 line-clamp-2">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">নতুন ক্যাটাগরি যোগ করুন</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  ক্যাটাগরির নাম (বাংলায়) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="যেমন: মশলাপাতি"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  স্লাগ (English Slug)
                </label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="যেমন: spices"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="ক্যাটাগরি বিবরণ..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
