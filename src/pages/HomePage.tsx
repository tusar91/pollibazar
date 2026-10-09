import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  RotateCcw,
  Percent,
  CheckCircle2,
  Mail,
  Send,
  HeartHandshake,
  Clock,
  MapPin,
  Check,
  ShoppingBasket,
  Wheat,
  UtensilsCrossed,
  Sprout,
  Shirt,
  Smartphone,
  Home,
  Zap,
  Layers,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { ProductCard } from '../components/ProductCard';
import {
  HERO_FRESH_IMAGE,
  HERO_HARVEST_IMAGE,
  PROMO_MUSTARD_HONEY_IMAGE,
} from '../data/products';

export const HomePage: React.FC = () => {
  const { products, categories } = useProducts();
  const { navigate, openCategory } = useNavigation();

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const slides = [
    {
      title: 'গ্রামের পণ্য, আপনার ঘরে',
      subtitle: 'দিনাজপুরের খাঁটি চাল, মানিকগঞ্জের গুড় ও খাঁটি সরিষার তেল সরাসরি আপনার দরজায়।',
      cta: 'পণ্য দেখুন',
      image: HERO_HARVEST_IMAGE,
      tag: 'পল্লি বাজার · গ্রামের খাঁটি পণ্য',
      action: () => openCategory('rice'),
    },
    {
      title: 'আপনার প্রয়োজন, এখন হাতের মুঠোয়',
      subtitle: 'প্রতিদিনের প্রয়োজনীয় মুদি ও পুষ্টিকর নিত্যপণ্য সহজেই কিনুন বিশ্বস্ততার সাথে।',
      cta: 'এখনই কিনুন',
      image: HERO_FRESH_IMAGE,
      tag: 'তাজা ও খাঁটি পণ্য',
      action: () => navigate('shop'),
    },
    {
      title: 'বিশেষ অফার চলছে',
      subtitle: 'সুন্দরবনের খাঁটি মধু ও কোল্ড প্রেসড সরিষার তেলের ওপর বিশেষ ছাড় উপভোগ করুন।',
      cta: 'অফার দেখুন',
      image: PROMO_MUSTARD_HONEY_IMAGE,
      tag: 'সীমিত সময়ের অফার',
      action: () => navigate('shop', { filter: 'offers' }),
    },
  ];

  // Auto advance slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Active category filter for featured section
  const [featuredCatFilter, setFeaturedCatFilter] = useState('all');

  const featuredProducts = products
    .filter((p) => p.featured)
    .filter((p) => (featuredCatFilter === 'all' ? true : p.category === featuredCatFilter))
    .slice(0, 8);

  const newArrivalProducts = products.filter((p) => p.newArrival).slice(0, 4);
  const specialOfferProducts = products.filter((p) => (p.discount || 0) >= 10).slice(0, 4);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. HERO BANNER / CAROUSEL */}
      <section className="relative overflow-hidden bg-stone-900 text-white">
        <div className="relative min-h-[420px] md:min-h-[500px] flex items-center">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/70 to-stone-950/30" />

              <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center py-16">
                <div className="max-w-xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{slide.tag}</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-serif leading-tight text-white text-balance">
                    {slide.title}
                  </h1>

                  <p className="text-sm sm:text-base text-stone-200 leading-relaxed max-w-md">
                    {slide.subtitle}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={slide.action}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <span>{slide.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate('shop')}
                      className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg backdrop-blur-xs transition-colors cursor-pointer"
                    >
                      ক্যাটালগ দেখুন
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-xs transition-colors hidden sm:flex items-center justify-center cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-xs transition-colors hidden sm:flex items-center justify-center cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 transition-all rounded-full ${
                  idx === currentSlide ? 'w-8 bg-emerald-500' : 'w-2 bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
              ক্যাটালগ
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              জনপ্রিয় ক্যাটাগরি
            </h2>
          </div>
          <button
            onClick={() => navigate('shop')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>সবগুলো দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {categories.map((cat) => {
            const renderIcon = () => {
              switch (cat.slug) {
                case 'grocery':
                  return <ShoppingBasket className="w-5 h-5" />;
                case 'rice':
                  return <Wheat className="w-5 h-5" />;
                case 'food':
                  return <UtensilsCrossed className="w-5 h-5" />;
                case 'agriculture':
                  return <Sprout className="w-5 h-5" />;
                case 'fashion':
                  return <Shirt className="w-5 h-5" />;
                case 'mobile':
                  return <Smartphone className="w-5 h-5" />;
                case 'household':
                  return <Home className="w-5 h-5" />;
                case 'beauty':
                  return <Sparkles className="w-5 h-5" />;
                case 'electronics':
                  return <Zap className="w-5 h-5" />;
                default:
                  return <Layers className="w-5 h-5" />;
              }
            };

            return (
              <button
                key={cat.id}
                onClick={() => openCategory(cat.slug)}
                className="bg-white border border-stone-200 hover:border-emerald-500 hover:shadow-sm rounded-xl p-4 text-center transition-all group flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2.5 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  {renderIcon()}
                </div>
                <h3 className="text-sm font-semibold text-stone-800 group-hover:text-emerald-800 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-stone-400 mt-0.5 tabular-bdt">
                  {cat.count} টি পণ্য
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS (নির্বাচিত পণ্যসমূহ) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
              সেরা সংগ্রহ
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              নির্বাচিত পণ্যসমূহ (Featured)
            </h2>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setFeaturedCatFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 cursor-pointer ${
                featuredCatFilter === 'all'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              সব পণ্য
            </button>
            <button
              onClick={() => setFeaturedCatFilter('rice')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 cursor-pointer ${
                featuredCatFilter === 'rice'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              চাল
            </button>
            <button
              onClick={() => setFeaturedCatFilter('grocery')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 cursor-pointer ${
                featuredCatFilter === 'grocery'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              মুদি
            </button>
            <button
              onClick={() => setFeaturedCatFilter('food')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 cursor-pointer ${
                featuredCatFilter === 'food'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              খাবার ও মধু
            </button>
            <button
              onClick={() => setFeaturedCatFilter('agriculture')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 cursor-pointer ${
                featuredCatFilter === 'agriculture'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              কৃষি
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. NEW ARRIVALS (টাটকা নতুন সংগ্রহ) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
              টাটকা আগমন
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              নতুন আগমন (New Arrivals)
            </h2>
          </div>
          <button
            onClick={() => navigate('shop', { sort: 'newest' })}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>নতুন সব পণ্য</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivalProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. SPECIAL OFFERS (বিশেষ অফার) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block mb-1">
              হ্রাসকৃত মূল্য
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              বিশেষ অফার (Special Offers)
            </h2>
          </div>
          <button
            onClick={() => navigate('shop', { filter: 'offers' })}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>সকল অফার দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {specialOfferProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. WHY CHOOSE POLLIBAZAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              আমাদের বৈশিষ্ট্য
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif leading-tight">
              কেন বেছে নেবেন পল্লি বাজার?
            </h2>
            <p className="text-sm text-emerald-200 leading-relaxed">
              আমরা কোনো ভেজাল বা কৃত্রিম কেমিক্যালযুক্ত খাবার বিক্রি করি না। দেশীয় চাষীদের জমি
              থেকে সরাসরি বাছাই করে খাঁটি ও পুষ্টিকর নিত্যপণ্য সাশ্রয়ী মূল্যে আপনার পরিবারের কাছে
              পৌঁছে দিই।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3">
              <div className="flex items-center gap-2.5 text-xs text-stone-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>শতভাগ প্রাকৃতিক ও খাঁটি উপাদানের নিশ্চয়তা</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-stone-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ওজনে কোনো কমতি নেই, নিখুঁত পরিমাপ</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-stone-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ক্যাশ অন ডেলিভারি ও পণ্য দেখে মূল্য পরিশোধ</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-stone-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ন্যায্য মূল্য ও কৃষকের পরিশ্রমের মূল্যায়ন</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DELIVERY INFORMATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
              ডেলিভারি নেটওয়ার্ক
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              ডেলিভারি সংক্রান্ত তথ্য
            </h2>
            <p className="text-xs text-stone-500">
              সরাসরি ঢাকা ও দোহার হাব থেকে সারা বাংলাদেশের ঘরে ঘরে
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-stone-50 border border-stone-100 rounded-xl p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">২৪–৪৮ ঘণ্টায় ডেলিভারি</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                ঢাকা শহর ও দোহার উপজেলার মধ্যে যেকোনো অর্ডার সর্বোচ্চ ২৪ থেকে ৪৮ ঘণ্টার মধ্যে
                নিরাপদে পৌঁছে দেওয়া হয়।
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-100 rounded-xl p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">ফ্রি ডেলিভারি অফার</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                যে কোনো গ্রাহক ২৫০০৳ বা তার বেশি মূল্যের পণ্য অর্ডার করলে কোনো ডেলিভারি চার্জ
                ছাড়াই সম্পূর্ণ ফ্রি ডেলিভারি পাবেন।
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-100 rounded-xl p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">সারা দেশে কুরিয়ার সুবিধা</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                বাংলাদেশের অন্যান্য ৬৩টি জেলায় বিশ্বস্ত কুরিয়ার পার্টনারদের মাধ্যমে ২–৩ দিনের
                মধ্যে পণ্য হস্তান্তর করা হয়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CUSTOMER TRUST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-6 sm:p-8">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              গ্রাহকের আস্থা
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              গ্রাহক সন্তুষ্টিই আমাদের শক্তি
            </h2>
            <p className="text-xs text-stone-600">
              হাজারো বাংলাদেশি পরিবারের দৈনন্দিন কেনাকাটার নির্ভরতার নাম পল্লি বাজার
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-5 rounded-xl border border-emerald-100/80 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-stone-900">১০০% খাঁটি পণ্য</h3>
              <p className="text-[11px] text-stone-500">রাসায়নিক ও ফরমালিনমুক্ত</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-emerald-100/80 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-stone-900">সহজ রিটার্ন ব্যবস্থা</h3>
              <p className="text-[11px] text-stone-500">পছন্দ না হলে সহজ ফেরত</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-emerald-100/80 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-stone-900">সরাসরি কৃষক থেকে</h3>
              <p className="text-[11px] text-stone-500">মধ্যস্বত্বভোগীহীন ন্যায্য মূল্য</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-emerald-100/80 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-stone-900">ক্যাশ অন ডেলিভারি</h3>
              <p className="text-[11px] text-stone-500">পণ্য দেখে মূল্য পরিশোধ</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. NEWSLETTER / SIGNUP UI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-xs">
            <Mail className="w-6 h-6" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif">
            নিয়মিত অফার ও নতুন পণ্যের আপডেট পান
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
            পল্লি বাজারের মৌসুমি ফল, তাজা খেজুরের গুড় ও বিশেষ ছাড়ের নোটিফিকেশন পেতে আপনার ইমেইল দিয়ে
            যুক্ত থাকুন।
          </p>

          {newsletterSubscribed ? (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-900/60 border border-emerald-700 text-emerald-200 rounded-xl text-xs font-semibold">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>ধন্যবাদ! আপনি সফলভাবে পল্লি বাজারে সাবস্ক্রাইব করেছেন।</span>
            </div>
          ) : (
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="আপনার ইমেইল লিখুন..."
                className="flex-1 px-4 py-2.5 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder:text-stone-400 focus:outline-hidden focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>সাবস্ক্রাইব করুন</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <p className="text-[11px] text-stone-500 pt-1">
            আমরা কোনো স্প্যাম পাঠাই না। আপনি যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।
          </p>
        </div>
      </section>
    </div>
  );
};
