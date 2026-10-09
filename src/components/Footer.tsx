import React from 'react';
import {
  Heart,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const Footer: React.FC = () => {
  const { navigate, openCategory } = useNavigation();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Trust Features Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-stone-800 text-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white">দ্রুত হোম ডেলিভারি</h5>
              <p className="text-xs text-stone-400">ঢাকা ও সারা দেশে নির্ভরযোগ্য ডেলিভারি</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white">খাঁটি ও ফ্রেশ পণ্যের নিশ্চয়তা</h5>
              <p className="text-xs text-stone-400">সরাসরি কৃষক ও নির্ভরযোগ্য উৎস</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white">ক্যাশ অন ডেলিভারি</h5>
              <p className="text-xs text-stone-400">পণ্য হাতে পেয়ে মূল্য পরিশোধ</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white">সহজ রিটার্ন সুবিধা</h5>
              <p className="text-xs text-stone-400">ত্রুটিযুক্ত পণ্যে সহজ বদল ও সহায়তা</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white font-serif tracking-tight">
                PolliBazar
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              "গ্রামের পণ্য, আপনার ঘরে" — নিত্যপ্রয়োজনীয় অর্গানিক খাদ্যপণ্য, চাল, ডাল, সরিষার
              তেল ও গ্রামীণ খাঁটি পণ্যের নির্ভরযোগ্য বাংলাদেশি ই-কমার্স প্ল্যাটফর্ম।
            </p>
            <div className="pt-2 text-xs text-stone-400 space-y-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>পল্লি বাজার, মধুরখোলা, মুকসুদপুর, দোহার, ঢাকা, বাংলাদেশ</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:01712334707" className="hover:text-emerald-400 transition-colors">
                  01712334707
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="mailto:ice.tusar@gmail.com"
                  className="hover:text-emerald-400 transition-colors"
                >
                  ice.tusar@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wide">জরুরি লিংক</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/index.html"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('home');
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  মূল পাতা (হোম)
                </a>
              </li>
              <li>
                <a
                  href="/shop.html"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('shop');
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  সকল পণ্য (শপ)
                </a>
              </li>
              <li>
                <a
                  href="/track-order.html"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('track-order');
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  অর্ডার ট্র্যাক করুন
                </a>
              </li>
              <li>
                <a
                  href="/about.html"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('about');
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  আমাদের সম্পর্কে
                </a>
              </li>
              <li>
                <a
                  href="/contact.html"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('contact');
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  যোগাযোগ ও সহায়তা
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wide">ক্যাটাগরি</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => openCategory('grocery')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  মুদি পণ্য ও তেল
                </button>
              </li>
              <li>
                <button
                  onClick={() => openCategory('rice')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  খাঁটি মিনিকেট ও নাজিরশাইল চাল
                </button>
              </li>
              <li>
                <button
                  onClick={() => openCategory('food')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  মধু ও ঐতিহ্যবাহী খেজুর গুড়
                </button>
              </li>
              <li>
                <button
                  onClick={() => openCategory('agriculture')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  তাজা পেঁয়াজ, রসুন ও আলু
                </button>
              </li>
              <li>
                <button
                  onClick={() => openCategory('beauty')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  ভেষজ সাবান ও শ্যাম্পু
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Policy & Payment */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wide">নীতিমালা ও পেমেন্ট</h4>
            <ul className="space-y-2 text-xs mb-4">
              <li>
                <a
                  href="/privacy.html"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('privacy');
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  গোপনীয়তা নীতিমালা (Privacy)
                </a>
              </li>
              <li>
                <a
                  href="/terms.html"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('terms');
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  শর্তাবলী ও ফেরত নীতি (Terms)
                </a>
              </li>
              <li>
                <a
                  href="/admin/admin-login.html"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('admin-login');
                  }}
                  className="text-stone-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>অ্যাডমিন ম্যানেজমেন্ট</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <span className="text-[11px] text-stone-400 block mb-2 font-medium">
                অনুমোদিত পেমেন্ট মাধ্যম:
              </span>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-stone-800 text-stone-200 border border-stone-700 rounded text-[11px] font-medium">
                  ক্যাশ অন ডেলিভারি
                </span>
                <span className="px-2.5 py-1 bg-stone-800 text-stone-200 border border-stone-700 rounded text-[11px] font-medium">
                  বিকাশ (bKash)
                </span>
                <span className="px-2.5 py-1 bg-stone-800 text-stone-200 border border-stone-700 rounded text-[11px] font-medium">
                  নগদ (Nagad)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} PolliBazar. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1 text-stone-400">
            <span>দোহার, ঢাকা থেকে সারা বাংলাদেশের ঘরে ঘরে</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
