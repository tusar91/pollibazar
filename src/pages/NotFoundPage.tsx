import React from 'react';
import { ArrowLeft, Home, Search, ShoppingBag } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const NotFoundPage: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
        <span className="text-3xl font-extrabold font-serif">404</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
        পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
      </h1>

      <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-sm mx-auto">
        আপনি যে লিংকটিতে প্রবেশ করার চেষ্টা করছেন তা হয়তো স্থানান্তরিত হয়েছে অথবা মুছে ফেলা হয়েছে।
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => navigate('home')}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>মূল পাতায় যান</span>
        </button>

        <button
          onClick={() => navigate('shop')}
          className="px-5 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>শপ ক্যাটালগ দেখুন</span>
        </button>
      </div>
    </div>
  );
};
