import React from 'react';
import { CheckCircle2, Heart, ShieldCheck, Sprout, Truck, Users } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const AboutPage: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
          আমাদের গল্প
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 font-serif leading-tight">
          গ্রামের খাঁটি স্বাদ ও নিত্যপ্রয়োজনীয় পণ্য, সরাসরি আপনার ঘরে
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          পল্লি বাজার (PolliBazar) একটি আধুনিক বাংলাদেশি অনলাইন মার্কেটপ্লেস, যা দৈনন্দিন গ্রোসারি,
          গৃহস্থালি পণ্য এবং গ্রামীণ খাঁটি খাদ্যপণ্য বিশ্বস্ততার সাথে পৌঁছে দেয়।
        </p>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 shadow-xs">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-stone-900 font-serif">
            পল্লি বাজারের লক্ষ্য ও উদ্দেশ্য
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            শহরের ব্যস্ত জীবনে খাঁটি ও কেমিক্যালমুক্ত চাল, ডাল, সরিষার তেল কিংবা সুন্দরবনের খাঁটি
            মধু সংগ্রহ করা অনেক সময় কষ্টসাধ্য হয়ে পড়ে। অন্যদিকে গ্রামের প্রান্তিক কৃষকরা তাদের
            কষ্টার্জিত ফসলের সঠিক দাম থেকে বঞ্চিত হন।
          </p>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            এই সমস্যা সমাধানের লক্ষ্যেই ঢাকা জেলার ঐতিহ্যবাহী দোহার উপজেলার মধুরখোলা, মুকসুদপুর থেকে
            পল্লি বাজারের যাত্রা শুরু। আমরা সরাসরি স্থানীয় কৃষক ও খাঁটি উৎপাদকদের সাথে সংযোগ স্থাপন
            করে মধ্যস্বত্বভোগী ছাড়াই স্বাস্থ্যসম্মত পণ্য গ্রাহকদের দরজায় পৌঁছে দিই।
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-emerald-950">আমাদের মূল অঙ্গীকার:</h3>
          <ul className="space-y-3 text-xs sm:text-sm text-emerald-900">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>কোনো ক্ষতিকর প্রিজারভেটিভ বা কৃত্রিম রং ছাড়া শতভাগ আসল পণ্য।</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>কৃষকের জন্য ন্যায্য মূল্য এবং ক্রেতার জন্য সাশ্রয়ী দাম।</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>ক্যাশ অন ডেলিভারি এবং দ্রুততম সময়ে নিরাপদ হোম ডেলিভারি।</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>যেকোনো ত্রুটিতে গ্রাহকবান্ধব সমাধান ও সহজ রিটার্ন ব্যবস্থা।</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900">তাজা ও স্বাস্থ্যকর</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            দিনাজপুরের মিনিকেট চাল থেকে শুরু করে মানিকগঞ্জের খেজুর পাটালি গুড় — প্রতিটি খাদ্যেই
            প্রকৃতির আসল পুষ্টি বজায় থাকে।
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900">বিশ্বাস ও সততা</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            আমরা ওজনে কম দিই না এবং কোনো নকল পণ্য প্রচার করি না। সততাই আমাদের প্রধান মূলধন।
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900">স্থানীয় উন্নয়ন</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            পল্লি বাজারে আপনার প্রতিটি কেনাকাটা গ্রামীণ অর্থনীতি ও দেশীয় ক্ষুদ্র উদ্যোক্তাদের এগিয়ে
            নিয়ে যেতে সরাসরি ভূমিকা রাখে।
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4">
        <h3 className="text-2xl font-bold font-serif">
          আজই যোগ দিন পল্লি বাজার পরিবারে
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
          আপনার রান্নাঘরের প্রয়োজনীয় গ্রোসারি ও খাঁটি পণ্য অর্ডার করুন ঘরে বসেই।
        </p>
        <div className="pt-2">
          <button
            onClick={() => navigate('shop')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            পণ্য দেখতে শপ ভিজিট করুন
          </button>
        </div>
      </div>
    </div>
  );
};
