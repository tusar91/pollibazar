import React, { useState } from 'react';
import {
  Mail,
  MapPin,
  Phone,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) return;
    setSubmitted(true);
  };

  const faqs = [
    {
      q: 'অর্ডার দেওয়ার কতদিনের মধ্যে ডেলিভারি পাওয়া যায়?',
      a: 'ঢাকা শহর এবং দোহার অঞ্চলে সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন হয়। অন্যান্য জেলায় ২ থেকে ৩ কার্যদিবস সময় লাগতে পারে।',
    },
    {
      q: 'ক্যাশ অন ডেলিভারি সুবিধা কি সারা দেশে প্রযোজ্য?',
      a: 'হ্যাঁ, বাংলাদেশের যেকোনো প্রান্তে পণ্য পৌঁছানোর পর ডেলিভারি ম্যানের কাছে নগদ টাকা পরিশোধ করার সুবিধা রয়েছে।',
    },
    {
      q: 'পণ্য পছন্দ না হলে বা ক্ষতিগ্রস্ত হলে ফেরত নেওয়ার নিয়ম কী?',
      a: 'ডেলিভারি ম্যান উপস্থিত থাকাকালীন পণ্য চেক করে নিন। কোনো ত্রুটি বা গরমিল পাওয়া গেলে সাথে সাথে আমাদের হটলাইনে (01712334707) জানান, আমরা বিনামূল্যে পণ্য পরিবর্তন অথবা মূল্য ফেরত দেব।',
    },
    {
      q: 'বিকাশ বা নগদে কীভাবে পেমেন্ট করব?',
      a: 'চেকআউট পেজে বিকাশ অথবা নগদ সিলেক্ট করলে আমাদের অফিশিয়াল পার্সোনাল নম্বর দেখতে পাবেন। পেমেন্ট সম্পন্ন করে TrxID ও নম্বরটি ফরমে ইনপুট দিলেই আপনার অর্ডার চূড়ান্ত হবে।',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
          সাহায্য ও অনুসন্ধান
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
          আমাদের সাথে যোগাযোগ করুন
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          যেকোনো জিজ্ঞাসা, অর্ডার সংক্রান্ত তথ্য বা সহযোগিতার জন্য সরাসরি কথা বলুন আমাদের সাথে।
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">ফোন করুন</h3>
          <p className="text-xs text-stone-500">সকাল ৯টা থেকে রাত ১০টা পর্যন্ত</p>
          <a
            href="tel:01712334707"
            className="text-base font-bold text-emerald-800 hover:text-emerald-950 block tabular-bdt"
          >
            01712334707
          </a>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">ইমেইল পাঠান</h3>
          <p className="text-xs text-stone-500">যেকোনো প্রশ্ন বা প্রাতিষ্ঠানিক অর্ডার</p>
          <a
            href="mailto:ice.tusar@gmail.com"
            className="text-sm font-semibold text-emerald-800 hover:text-emerald-950 block"
          >
            ice.tusar@gmail.com
          </a>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">অফিস ও স্টোর ঠিকানা</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            পল্লি বাজার, মধুরখোলা, মুকসুদপুর, দোহার, ঢাকা, বাংলাদেশ
          </p>
        </div>
      </div>

      {/* Form + Map/Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Left (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-700" />
            <span>বার্তা পাঠান</span>
          </h2>

          {submitted ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
              <h3 className="text-base font-bold text-emerald-950">
                আপনার বার্তা সফলভাবে গৃহীত হয়েছে!
              </h3>
              <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                ধন্যবাদ। আমাদের কাস্টমার সাপোর্ট টিম অতি শীঘ্রই আপনার দেওয়া মোবাইল নম্বরে
                যোগাযোগ করবে।
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', phone: '', subject: '', message: '' });
                }}
                className="mt-3 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
              >
                নতুন বার্তা লিখুন
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    আপনার নাম <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="নাম লিখুন"
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    মোবাইল নম্বর <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  বিষয় (Subject)
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="যেমন: অর্ডার ডেলিভারি বা নতুন পণ্যের জিজ্ঞাসা"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  আপনার বার্তা / প্রশ্ন <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="বিস্তারিত লিখে আমাদের জানান..."
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white text-stone-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>বার্তা পাঠান</span>
              </button>
            </form>
          )}
        </div>

        {/* FAQs Right (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-stone-900">
            সাধারণ জিজ্ঞাসা (FAQ)
          </h2>

          <div className="divide-y divide-stone-100">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-3 first:pt-0">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left flex items-start justify-between gap-2 text-xs font-semibold text-stone-800 hover:text-emerald-800 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-emerald-700' : 'text-stone-400'
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <p className="text-[11px] text-stone-600 leading-relaxed mt-2 pl-1 animate-fadeIn">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
