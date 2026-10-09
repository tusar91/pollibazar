import React, { useState } from 'react';
import {
  Boxes,
  Edit2,
  Plus,
  Search,
  Trash2,
  X,
  Check,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useProducts } from '../../context/ProductContext';
import { Product } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleStock,
  } = useProducts();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('grocery');
  const [formPrice, setFormPrice] = useState<number>(100);
  const [formOldPrice, setFormOldPrice] = useState<number>(120);
  const [formUnit, setFormUnit] = useState('১ কেজি');
  const [formStock, setFormStock] = useState<number>(50);
  const [formOrigin, setFormOrigin] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('grocery');
    setFormPrice(150);
    setFormOldPrice(170);
    setFormUnit('১ কেজি');
    setFormStock(50);
    setFormOrigin('ঢাকা');
    setFormShortDesc('খাঁটি দেশি ও স্বাস্থ্যসম্মত মান।');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormOldPrice(p.oldPrice || p.price);
    setFormUnit(p.unit);
    setFormStock(p.stock);
    setFormOrigin(p.origin || '');
    setFormShortDesc(p.shortDescription);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const catObj = categories.find((c) => c.slug === formCategory);
    const catName = catObj ? catObj.name : 'মুদি';
    const slug = formName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName.trim(),
        category: formCategory,
        categoryName: catName,
        price: formPrice,
        oldPrice: formOldPrice > formPrice ? formOldPrice : undefined,
        discount:
          formOldPrice > formPrice
            ? Math.round(((formOldPrice - formPrice) / formOldPrice) * 100)
            : undefined,
        unit: formUnit.trim(),
        stock: formStock,
        origin: formOrigin.trim(),
        shortDescription: formShortDesc.trim(),
        isAvailable: formStock > 0,
      });
    } else {
      addProduct({
        name: formName.trim(),
        slug,
        category: formCategory,
        categoryName: catName,
        price: formPrice,
        oldPrice: formOldPrice > formPrice ? formOldPrice : undefined,
        discount:
          formOldPrice > formPrice
            ? Math.round(((formOldPrice - formPrice) / formOldPrice) * 100)
            : undefined,
        image: '/src/assets/images/category_daily_bazaar_1791438890146.jpg',
        gallery: ['/src/assets/images/category_daily_bazaar_1791438890146.jpg'],
        unit: formUnit.trim(),
        stock: formStock,
        isAvailable: formStock > 0,
        shortDescription: formShortDesc.trim(),
        description: `${formName} — পল্লি বাজারের যাচাইকৃত খাঁটি ও স্বাস্থ্যসম্মত পণ্য।`,
        rating: 4.8,
        reviewCount: 1,
        featured: false,
        newArrival: true,
        origin: formOrigin.trim(),
      });
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <AdminLayout currentTab="admin-products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-serif">
              পণ্য ব্যবস্থাপনা (Products)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              মোট {products.length} টি পণ্য স্টোরে অন্তর্ভুক্ত রয়েছে
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন পণ্য যোগ করুন</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden text-stone-900"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-stone-500">ক্যাটাগরি:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 font-medium"
            >
              <option value="all">সবগুলো ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">পণ্য</th>
                  <th className="py-3 px-4">ক্যাটাগরি</th>
                  <th className="py-3 px-4">দাম (৳)</th>
                  <th className="py-3 px-4">স্টক</th>
                  <th className="py-3 px-4">স্টক স্থিতি</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg border border-stone-200 bg-stone-50 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-stone-900 line-clamp-1">{p.name}</div>
                          <div className="text-[11px] text-stone-400">
                            {p.unit} {p.origin ? `· ${p.origin}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-emerald-800">{p.categoryName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900 tabular-bdt">৳{p.price}</div>
                      {p.oldPrice && (
                        <div className="text-[10px] text-stone-400 line-through tabular-bdt">
                          ৳{p.oldPrice}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium tabular-bdt">
                      {p.stock} টি
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleStock(p.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          p.isAvailable && p.stock > 0
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {p.isAvailable && p.stock > 0 ? 'ইন-স্টক (সক্রিয়)' : 'আউট অব স্টক'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition-colors"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(p.id, p.name)}
                          className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                {editingProduct ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যুক্ত করুন'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  পণ্যের নাম <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="যেমন: মিনিকেট চাল"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">ক্যাটাগরি</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">ইউনিট / পরিমাণ</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="১ কেজি / ১ লিটার"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">পূর্বের মূল্য (৳)</label>
                  <input
                    type="number"
                    value={formOldPrice}
                    onChange={(e) => setFormOldPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">স্টক পরিমাণ</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">উৎপাদন জেলা / অঞ্চল</label>
                <input
                  type="text"
                  value={formOrigin}
                  onChange={(e) => setFormOrigin(e.target.value)}
                  placeholder="যেমন: দিনাজপুর, মানিকগঞ্জ, দোহার"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows={2}
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="পণ্যের বিশেষত্ব..."
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
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">পণ্য মুছে ফেলতে চান?</h3>
                <p className="text-xs text-stone-500">এই পরিবর্তনটি ফিরিয়ে নেওয়া যাবে না।</p>
              </div>
            </div>

            <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-200">
              আপনি কি নিশ্চিতভাবে <strong className="text-stone-900">"{deleteTarget.name}"</strong> মুছে ফেলতে চান?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
