import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
          গোপনীয়তা নীতিমালা (Privacy Policy)
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          সর্বশেষ হালনাগাদ: অক্টোবর ২০২৬ · পল্লি বাজার (PolliBazar)
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900">১. ভূমিকা ও তথ্যের সুরক্ষা</h2>
          <p>
            পল্লি বাজার (PolliBazar) আমাদের সম্মানিত গ্রাহকদের তথ্যের গোপনীয়তা রক্ষায় সর্বোচ্চ
            গুরুত্ব প্রদান করে। এই গোপনীয়তা নীতিমালায় ব্যাখ্যা করা হয়েছে যে, যখন আপনি আমাদের
            ওয়েবসাইট ব্যবহার করেন তখন আমরা কীভাবে আপনার তথ্য সংগ্রহ, সংরক্ষণ ও ব্যবহার করি।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900">২. আমরা কী ধরনের তথ্য সংগ্রহ করি</h2>
          <p>অর্ডার প্রক্রিয়াকরণ এবং হোম ডেলিভারির জন্য আমরা নিম্নলিখিত তথ্য সংগ্রহ করি:</p>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li>আপনার পূর্ণ নাম</li>
            <li>মোবাইল নম্বর ও ইমেইল ঠিকানা</li>
            <li>সম্পূর্ণ ডেলিভারি ঠিকানা (জেলা, উপজেলা, গ্রাম/রাস্তা)</li>
            <li>অর্ডারের পণ্যের তালিকা ও পছন্দসমূহ</li>
            <li>পেমেন্ট সংক্রান্ত তথ্য (ক্যাশ অন ডেলিভারি, বিকাশ বা নগদ TrxID)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900">৩. তথ্যের ব্যবহার</h2>
          <p>সংগৃহীত তথ্য কেবলমাত্র নিম্নলিখিত ক্ষেত্রে ব্যবহৃত হয়:</p>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li>আপনার অর্ডার সফলভাবে প্রস্তুত ও ডেলিভারি করার জন্য</li>
            <li>অর্ডার কনফার্মেশন ও ট্র্যাকিং বিষয়ে ফোনে বা এসএমএসে যোগাযোগের জন্য</li>
            <li>গ্রাহক সেবার মানোন্নয়ন ও প্রশ্নের সমাধান করতে</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900">৪. তৃতীয় পক্ষের সাথে তথ্য প্রকাশ নয়</h2>
          <p>
            পল্লি বাজার কোনো অবস্থাতেই আপনার ব্যক্তিগত তথ্য কোনো বাণিজ্যিক উদ্দেশ্যে তৃতীয় কোনো পক্ষের
            কাছে বিক্রয়, হস্তান্তর বা অপব্যবহার করে না। শুধুমাত্র পণ্য আপনার ঠিকানায় পৌঁছে দেওয়ার
            জন্য নিয়োজিত ডেলিভারি প্রতিনিধির সাথে প্রয়োজনীয় যোগাযোগের তথ্য শেয়ার করা হয়।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900">৫. যোগাযোগ</h2>
          <p>
            গোপনীয়তা বিষয়ক যেকোনো তথ্যের জন্য সরাসরি যোগাযোগ করুন:
          </p>
          <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs">
            <p><strong>মোবাইল:</strong> 01712334707</p>
            <p><strong>ইমেইল:</strong> ice.tusar@gmail.com</p>
            <p><strong>ঠিকানা:</strong> পল্লি বাজার, মধুরখোলা, মুকসুদপুর, দোহার, ঢাকা, বাংলাদেশ</p>
          </div>
        </section>
      </div>
    </div>
  );
};
