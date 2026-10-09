import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
          ব্যবহারের শর্তাবলী ও রিটার্ন নীতি (Terms & Return Policy)
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          পল্লি বাজার (PolliBazar) প্ল্যাটফর্ম ব্যবহারের নিয়মাবলী
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900">১. সাধারণ শর্তাবলী</h2>
          <p>
            পল্লি বাজার ওয়েবসাইটে কোনো পণ্যের অর্ডার করার মাধ্যমে আপনি আমাদের শর্তাবলীর সাথে সম্মতি
            জ্ঞাপন করছেন। পণ্যের দাম, অফার এবং প্রাপ্যতা যেকোনো সময় পরিবর্তনশীল হতে পারে। তবে একবার
            অর্ডার নিশ্চিত হলে পূর্ববর্তী নির্ধারিত মূল্যেই পণ্য সরবরাহ করা হবে।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900">২. অর্ডার ও পেমেন্ট</h2>
          <p>
            গ্রাহক ক্যাশ অন ডেলিভারি, বিকাশ বা নগদ যেকোনো একটির মাধ্যমে বিল পরিশোধ করতে পারবেন।
            অর্ডার দেওয়ার পর আমাদের টিম ফোন কলের মাধ্যমে ঠিকানা এবং পণ্যের তালিকা নিশ্চিত করবেন।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900">৩. ডেলিভারি ও প্যাকেজিং</h2>
          <p>
            আমরা যথাসম্ভব দ্রুততম সময়ে পণ্য পৌঁছানোর চেষ্টা করি। প্রাকৃতিক দুর্যোগ, রাজনৈতিক হরতাল
            বা অপ্রত্যাশিত লজিস্টিক সমস্যার কারণে ডেলিভারিতে বিলম্ব হতে পারে, যা গ্রাহককে অবহিত করা হবে।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900">৪. রিটার্ন ও রিফান্ড নীতি (Return & Refund)</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
            <li>
              <strong>পণ্য প্রাপ্তির সময় পরীক্ষা:</strong> ডেলিভারি প্রতিনিধির সামনেই পণ্য যাচাই করে গ্রহণ করুন।
            </li>
            <li>
              <strong>নষ্ট বা ভুল পণ্য:</strong> ভুল পণ্য সরবরাহ হলে বা প্যাকেটে ক্ষতি থাকলে কোনো অতিরিক্ত খরচ ছাড়া পণ্য বদলে দেওয়া হবে।
            </li>
            <li>
              <strong>রিটার্নের সময়সীমা:</strong> পণ্য পাওয়ার পর যেকোনো অসঙ্গতির বিষয়ে সর্বোচ্চ ২৪ ঘণ্টার মধ্যে আমাদের হেল্পলাইনে (01712334707) জানাতে হবে।
            </li>
            <li>
              <strong>টাকা ফেরত (Refund):</strong> আগাম বিকাশ বা নগদে পেমেন্টকৃত পণ্যের অর্ডার বাতিল বা রিটার্নের ক্ষেত্রে ৩ থেকে ৫ কার্যদিবসের মধ্যে টাকা গ্রাহকের একাউন্টে রিফান্ড করা হয়।
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
