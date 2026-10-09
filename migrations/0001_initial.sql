-- ============================================================================
-- Cloudflare D1 Migration for PolliBazar (পল্লি বাজার)
-- Database name: pollibazar-db | Binding: DB
-- Migration: 0001_initial.sql
-- ============================================================================

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sessions Table (for secure session authentication)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  count INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(slug),
  price REAL NOT NULL,
  old_price REAL,
  discount INTEGER DEFAULT 0,
  unit TEXT NOT NULL,
  image TEXT NOT NULL,
  gallery TEXT,
  short_description TEXT,
  description TEXT,
  rating REAL DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 10,
  is_available BOOLEAN DEFAULT 1,
  origin TEXT,
  featured BOOLEAN DEFAULT 0,
  new_arrival BOOLEAN DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Product Images Table (R2 & multi-image support ready)
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  area TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  district TEXT NOT NULL,
  area TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  subtotal REAL NOT NULL,
  delivery_charge REAL NOT NULL,
  discount REAL DEFAULT 0,
  total REAL NOT NULL,
  payment_method TEXT NOT NULL, -- 'cod' | 'bkash' | 'nagad'
  payment_number TEXT,
  trx_id TEXT,
  payment_status TEXT DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'
  order_status TEXT DEFAULT 'pending', -- 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
  customer_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT,
  subtotal REAL NOT NULL
);

-- 9. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Categories (10 standard categories)
INSERT OR IGNORE INTO categories (id, name, name_en, slug, icon, count, description) VALUES
('cat-1', 'মুদি', 'Grocery', 'grocery', 'ShoppingBasket', 8, 'তেল, ডাল, চিনি, লবণ ও প্রাত্যহিক রান্নার নিত্যপণ্য'),
('cat-2', 'চাল', 'Rice', 'rice', 'Wheat', 4, 'দিনাজপুরের খাঁটি মিনিকেট, নাজিরশাইল ও আতপ চাল'),
('cat-3', 'খাবার', 'Food', 'food', 'UtensilsCrossed', 5, 'চা, বিস্কুট, সুন্দরবনের মধু ও ঐতিহ্যবাহী খেজুর গুড়'),
('cat-4', 'কৃষি', 'Agriculture', 'agriculture', 'Sprout', 6, 'তাজা আলু, পেঁয়াজ, রসুন, আদা ও বাগান পরিচর্যা সামগ্রী'),
('cat-5', 'ফ্যাশন', 'Fashion', 'fashion', 'Shirt', 3, 'ঐতিহ্যবাহী তাঁতের লুঙ্গি, সুতি পাঞ্জাবি ও গামছা'),
('cat-6', 'মোবাইল', 'Mobile', 'mobile', 'Smartphone', 2, 'ফাস্ট চার্জার, টাইপ-সি ক্যাবল ও মোবাইল গ্যাজেট'),
('cat-7', 'গৃহস্থালি', 'Household', 'household', 'Home', 2, 'মশারি, খাঁটি নারিকেল ঝাড়ু ও ঘরকন্নার প্রয়োজনীয় জিনিস'),
('cat-8', 'সৌন্দর্য', 'Beauty', 'beauty', 'Sparkles', 2, 'খাঁটি নারিকেল তেল, অর্গানিক নিম সাবান ও হার্বাল যত্ন'),
('cat-9', 'ইলেকট্রনিক্স', 'Electronics', 'electronics', 'Zap', 2, 'মাল্টিপ্লাগ, এলইডি বাতি ও বিদ্যুৎ সাশ্রয়ী পণ্য'),
('cat-10', 'অন্যান্য', 'Others', 'others', 'Package', 1, 'পল্লি অঞ্চলের বিশেষ শৌখিন ও হস্তশিল্প পণ্য');

-- Seed Initial Products (26 products)
INSERT OR IGNORE INTO products (id, name, slug, category_id, price, old_price, discount, unit, image, short_description, description, rating, review_count, stock, is_available, origin, featured, new_arrival, status) VALUES
('pb-01', 'মিনিকেট চাল (প্রিমিয়াম সিল্কি পলিশ)', 'miniket-rice-premium', 'rice', 375, 410, 8, '৫ কেজি বস্তা', '/src/assets/images/hero_village_harvest_1791438866620.jpg', 'দিনাজপুরের সেরা ঝরঝরে প্রিমিয়াম গ্রেড চাল', 'দিনাজপুরের নিজস্ব কৃষকদের উৎপাদিত প্রিমিয়াম কোয়ালিটি মিনিকেট চাল। রান্নার পর ভাত লম্বা, ঝরঝরে ও সুস্বাদু হয়। ১০০% ধুলোবালি ও কাঁকড়মুক্ত।', 4.9, 128, 45, 1, 'দিনাজপুর', 1, 0, 'active'),
('pb-02', 'নাজিরশাইল চাল (পুরানো দেশি ধান)', 'nazirshail-rice', 'rice', 420, 460, 9, '৫ কেজি বস্তা', '/src/assets/images/hero_village_harvest_1791438866620.jpg', 'আসল পুরানো চাল, ঝরঝরে পুষ্টিকর ভাত', 'যশোর অঞ্চলের খাঁটি নাজিরশাইল চাল। কম স্টার্চযুক্ত ও সহজে হজমযোগ্য। ডায়াবেটিস ও স্বাস্থ্য সচেতন পরিবারের জন্য আদর্শ।', 4.8, 94, 30, 1, 'যশোর', 1, 0, 'active'),
('pb-03', 'চিনিরগুঁড়া পোলাওয়ের সুগন্ধি চাল', 'chinigura-polao-rice', 'rice', 160, 185, 14, '১ কেজি প্যাকেট', '/src/assets/images/hero_village_harvest_1791438866620.jpg', 'উচ্চ সুবাসযুক্ত খাঁটি দিনাজপুরের পোলাও চাল', 'বিরিয়ানি, পোলাও ও পায়েস রান্নার জন্য সর্বোচ্চ সুবাসযুক্ত ছোট দানার প্রাকৃতিক চাল। ১০০% কৃত্রিম সুবাস বা কেমিক্যাল মুক্ত।', 5.0, 210, 60, 1, 'দিনাজপুর', 1, 1, 'active'),
('pb-04', 'দেশি ছোট দানার মসুর ডাল', 'desi-red-lentil', 'rice', 145, 160, 9, '১ কেজি প্যাকেট', '/src/assets/images/category_daily_bazaar_1791438890146.jpg', 'ফরিদপুরের আসল দেশি মসুর ডাল, দ্রুত গলে', 'গাঢ় রঙের আসল দেশি মসুর ডাল। রান্নায় চমৎকার স্বাদ ও মিষ্টি ঘ্রাণ। খুব দ্রুত সুসিদ্ধ হয়।', 4.8, 86, 75, 1, 'ফরিদপুর', 1, 0, 'active'),
('pb-05', 'প্রিমিয়াম মুগ ডাল (ভাজা সুবাস)', 'premium-moong-dal', 'grocery', 170, 190, 11, '১ কেজি প্যাকেট', '/src/assets/images/category_daily_bazaar_1791438890146.jpg', 'হালকা সোনালী ভাজা মুগ ডাল', 'পরিপক্ক দেশি মুগের ডাল, পরিষ্কার ও ঝরঝরে। খিচুড়ি ও মুগ ডালের সুস্বাদু ঝোলের জন্য সেরা পছন্দ।', 4.7, 54, 40, 1, 'পাবনা', 0, 0, 'active'),
('pb-06', 'খাঁটি কাঠের ঘানি ভাঙা সরিষার তেল', 'cold-pressed-mustard-oil-1l', 'grocery', 260, 290, 10, '১ লিটার বোতল', '/src/assets/images/promo_mustard_honey_1791438879357.jpg', 'তীব্র ঝাঁঝালো স্বাদ ও গন্ধের ১০০% বিশুদ্ধ তেল', 'দেশি মাঘী সরিষা থেকে কাঠের ঘানিতে ঠাণ্ডা চাপে ভাঙানো তেল। কোনো কৃত্রিম ঝাঁঝ বা ব্লেন্ডিং নেই। ভর্তা ও আচার তৈরিতে অতুলনীয়।', 5.0, 312, 85, 1, 'সিরাজগঞ্জ', 1, 0, 'active'),
('pb-07', 'ঘানি ভাঙা সরিষার তেল (ফ্যামিলি প্যাক)', 'cold-pressed-mustard-oil-5l', 'grocery', 1250, 1400, 11, '৫ লিটার ক্যান', '/src/assets/images/promo_mustard_honey_1791438879357.jpg', 'সাশ্রয়ী পারিবারিক প্যাক, খাঁটি প্রাকৃতিক তেল', 'একত্রে ৫ লিটারের সিলগালা জার। দীর্ঘ সময় ঘ্রাণ ও গুণাগুণ বজায় থাকে।', 4.9, 78, 20, 1, 'সিরাজগঞ্জ', 0, 1, 'active'),
('pb-08', 'পাবনার খাঁটি গাওয়া ঘি', 'pure-desi-ghee-500g', 'food', 750, 850, 12, '৫০০ গ্রাম জার', '/src/assets/images/promo_mustard_honey_1791438879357.jpg', 'গ্রাম্য গৃহস্থ গরুর দুধের ননি থেকে তৈরি সুগন্ধি ঘি', 'ঐতিহ্যবাহী পদ্ধতিতে কাঁচা দুধের মাখন জ্বাল দিয়ে প্রস্তুতকৃত দানাদার সুগন্ধি ঘি। পোলাও, পরোটা ও গরম ভাতে অতুলনীয় স্বাদ যোগ করে।', 5.0, 145, 35, 1, 'পাবনা', 1, 0, 'active'),
('pb-09', 'সয়াবিন তেল (ফরটিফায়েড ভিটামিন এ)', 'fortified-soybean-oil-5l', 'grocery', 890, 950, 6, '৫ লিটার বোতল', '/src/assets/images/category_daily_bazaar_1791438890146.jpg', 'কোলেস্টেরল মুক্ত স্বাস্থ্যকর ভোজ্য তেল', 'ভিটামিন এ ও ই সমৃদ্ধ পরিচ্ছন্ন সয়াবিন তেল। দৈনন্দিন পারিবারিক রান্নার জন্য নিরাপদ ও নির্ভরযোগ্য।', 4.6, 62, 50, 1, 'ঢাকা', 0, 0, 'active'),
('pb-10', 'রিফাইন আটা (লাল গম থেকে ভাঙানো)', 'whole-wheat-atta-2kg', 'grocery', 120, 135, 11, '২ কেজি প্যাকেট', '/src/assets/images/category_daily_bazaar_1791438890146.jpg', 'ফাইবার সমৃদ্ধ নরম লাল আটা', 'স্বাস্থ্যকর দেশি গমের আটা। এতে তৈরি রুটি দীর্ঘ সময় নরম ও ফুলকো থাকে।', 4.7, 43, 60, 1, 'কুষ্টিয়া', 0, 0, 'active'),
('pb-11', 'সাদা চিনি (প্রিমিয়াম রিফাইন গ্রেড)', 'premium-white-sugar-1kg', 'grocery', 135, 145, 7, '১ কেজি প্যাকেট', '/src/assets/images/category_daily_bazaar_1791438890146.jpg', 'ঝকঝকে সাদা পরিষ্কার দানাদার চিনি', 'উচ্চমানের পরিচ্ছন্ন চিনি, মিষ্টি খাবার ও চায়ে দ্রুত দ্রবণীয়।', 4.5, 38, 90, 1, 'ঢাকা', 0, 0, 'active'),
('pb-12', 'সুন্দরবনের খাঁটি প্রাকৃতিক মধু (র ম্যাজিক)', 'sundarban-raw-honey-500g', 'food', 520, 600, 13, '৫০০ গ্রাম জার', '/src/assets/images/promo_mustard_honey_1791438879357.jpg', 'মৌয়ালদের সংগ্রহকৃত সম্পূর্ণ কাঁচা ও অপরিশোধিত মধু', 'সুন্দরবনের খলিশা ও গর্জন ফুলের প্রাকৃতিক চাকের মধু। কোনো হিটিং বা প্রসেসিং ছাড়া প্রাকৃতিক পুষ্টি উপাদানে ভরপুর।', 5.0, 189, 40, 1, 'সুন্দরবন', 1, 1, 'active'),
('pb-13', 'মানিকগঞ্জের ঐতিহ্যবাহী খাঁটি খেজুর পাটালি গুড়', 'khejurer-patali-gur-1kg', 'food', 280, 320, 13, '১ কেজি প্যাক', '/src/assets/images/promo_mustard_honey_1791438879357.jpg', 'শীতের সুবাসিত কচি রসের শক্ত পাটালি গুড়', 'শতভাগ ভেজাল ও হাইড্রোজমুক্ত প্রাকৃতিক খেজুর গুড়। পায়েস, পিঠা ও মিষ্টি তৈরিতে অতুলনীয় দেশীয় স্বাদ ও ঘ্রাণ।', 4.9, 112, 25, 1, 'মানিকগঞ্জ', 1, 0, 'active'),
('pb-14', 'প্রাকৃতিক শিলা লবণ (হিমালয়ান পিঙ্ক সল্ট)', 'himalayan-pink-salt-500g', 'grocery', 95, 115, 17, '৫০০ গ্রাম জার', '/src/assets/images/category_daily_bazaar_1791438890146.jpg', '৮৪টি মিনারেলযুক্ত প্রাকৃতিক আনরিফাইন্ড লবণ', 'সাধারণ সাদা লবণের বিকল্প স্বাস্থ্যকর খনিজসমৃদ্ধ লবণ। রক্তচাপ নিয়ন্ত্রণে সাহায্য করে।', 4.8, 67, 80, 1, 'আমদানি', 0, 1, 'active'),
('pb-15', 'মুন্সীগঞ্জের তাজা গোল ডায়মন্ড আলু', 'munshiganj-diamond-potato', 'agriculture', 135, 150, 10, '৩ কেজি ব্যাগ', '/src/assets/images/category_fresh_vegetables_1791440561440.jpg', 'শক্ত চামড়ার মিষ্টিহীন ডায়মন্ড আলু', 'মুন্সীগঞ্জের মাটির টাটকা গোল আলু। ঝোল ও ভাজিতে চমৎকার স্বাদ।', 4.8, 92, 100, 1, 'মুন্সীগঞ্জ', 0, 0, 'active'),
('pb-16', 'মেহেরপুরের ঝাঁঝালো দেশি লাল পেঁয়াজ', 'meherpur-desi-red-onion', 'agriculture', 190, 215, 12, '২ কেজি নেট ব্যাগ', '/src/assets/images/category_fresh_vegetables_1791440561440.jpg', 'তীব্র গন্ধযুক্ত আসল দেশি লাল পেঁয়াজ', 'মেহেরপুর থেকে সরাসরি আনা শক্ত পেঁয়াজ। পচনহীন ও রান্নায় মিষ্টি ঝাঁঝালো ফ্লেভার তৈরি করে।', 4.9, 140, 70, 1, 'মেহেরপুর', 1, 0, 'active'),
('pb-17', 'নাটোরের দেশি এককোয়া রসুন', 'natore-desi-garlic', 'agriculture', 140, 160, 13, '৫০০ গ্রাম প্যাক', '/src/assets/images/category_fresh_vegetables_1791440561440.jpg', 'স্বাদ ও ঔষধি গুণে ভরপুর দেশি রসুন', 'রান্নায় দারুণ তীব্রতা এবং রোগ প্রতিরোধ ক্ষমতা বৃদ্ধিতে সহায়ক।', 4.7, 51, 45, 1, 'নাটোর', 0, 0, 'active'),
('pb-18', 'ঐতিহ্যবাহী টাঙ্গাইলের তাঁতের সুতি লুঙ্গি', 'tangail-handloom-cotton-lungi', 'fashion', 480, 550, 13, '১ পিস', '/src/assets/images/category_fashion_1791440518720.jpg', '১০০% সুতি, আরামদায়ক নরম পাকা সুতা', 'টাঙ্গাইলের ঐতিহ্যবাহী দক্ষ তাঁতিদের বোনা আরামদায়ক লুঙ্গি। গরমে অত্যন্ত আরামদায়ক ও টেকসই রঙ।', 4.9, 74, 30, 1, 'টাঙ্গাইল', 1, 1, 'active'),
('pb-19', 'খাঁটি সুতি নকশি হ্যান্ডলুম পাঞ্জাবি', 'handloom-cotton-panjabi', 'fashion', 1150, 1350, 15, '১ পিস (L সাইজ)', '/src/assets/images/category_fashion_1791440518720.jpg', 'সুরুচিপূর্ণ মার্জিত কাটিং ও আরামদায়ক ফ্যাব্রিক', 'প্রাকৃতিক কটন কাপড়ে তৈরি পরিপাটি পাঞ্জাবি। জুম্মা, উৎসব ও ঘরোয়া যেকোনো অনুষ্ঠানে মানানসই।', 4.8, 48, 15, 1, 'ঢাকা', 0, 1, 'active'),
('pb-20', 'ফাস্ট চার্জিং ২৫ ওয়াট পিডি অ্যাডাপ্টার ও কেবল', 'fast-charging-25w-pd-adapter', 'mobile', 490, 580, 16, '১ সেট', '/src/assets/images/category_electronics_1791440532857.jpg', 'টাইপ-সি ফাস্ট চার্জার সকল অ্যান্ড্রয়েড ও আইফোনে উপযোগী', 'ওভার-ভোল্টেজ প্রটেকশনসহ দ্রুত চার্জ নিশ্চিত করে। টেকসই ব্রেইডেড ক্যাবল সংযুক্ত।', 4.7, 83, 40, 1, 'আমদানি', 1, 0, 'active'),
('pb-21', '১২ ওয়াট এনার্জি সেভিং এলইডি বাতি (প্যাক অব ২)', 'energy-saving-led-bulb-12w', 'electronics', 280, 320, 13, '২টি বাতির প্যাক', '/src/assets/images/category_electronics_1791440532857.jpg', '৮৫% বিদ্যুৎ সাশ্রয়ী দীর্ঘস্থায়ী উজ্জ্বল আলো', '২ বছরের লাইফটাইম ব্যাকআপসহ ঘরের উজ্জ্বল আলোর নিশ্চয়তা।', 4.6, 62, 55, 1, 'ঢাকা', 0, 0, 'active'),
('pb-22', 'খাঁটি হ্যান্ডমেড নিম ও তুলসী অর্গানিক সাবান', 'handmade-organic-neem-soap', 'beauty', 110, 130, 15, '১০০ গ্রাম বার', '/src/assets/images/category_beauty_herbal_1791440546624.jpg', 'ত্বকের ব্রণ দূরকারী ও প্রাকৃতিক অ্যান্টিব্যাকটেরিয়াল সাবান', 'গ্রামের ফ্রেশ নিম পাতা ও তুলসীর রস থেকে কোল্ড-প্রসেস পদ্ধতিতে তৈরি রাসায়নিকমুক্ত সাবান।', 4.9, 97, 60, 1, 'সিলেট', 1, 1, 'active'),
('pb-23', 'অর্গানিক এক্সট্রা ভার্জিন নারিকেল তেল', 'organic-virgin-coconut-oil-250ml', 'beauty', 240, 275, 13, '২৫০ মিলি জার', '/src/assets/images/category_beauty_herbal_1791440546624.jpg', 'চুল ও ত্বকের যত্নে ১০০% খাঁটি কোল্ড প্রেসড তেল', 'বাগেরহাটের কচি নারিকেল থেকে প্রস্তুত প্রাকৃতিক তেল। প্যারাবেন ও কৃত্রিম সুগন্ধিমুক্ত।', 4.9, 115, 35, 1, 'বাগেরহাট', 1, 0, 'active'),
('pb-24', 'গ্রাম্য প্রাকৃতিক সুতি মশারি (ডাবল বেড)', 'traditional-cotton-mosquito-net', 'household', 380, 430, 12, '৬x৭ ফুট ডাবল', '/src/assets/images/category_daily_bazaar_1791438890146.jpg', 'বাতাস চলাচলকারী ঘন বুননের আরামদায়ক মশারি', 'মশার উপদ্রব থেকে বাঁচতে স্বাস্থ্যকর ঘন জাল। দীর্ঘস্থায়ী ও ধোয়ার পর নষ্ট হয় না।', 4.8, 59, 25, 1, 'নরসিংদী', 0, 0, 'active'),
('pb-25', 'শ্রীমঙ্গলের প্রিমিয়াম ব্ল্যাক ক্লোন চা পাতা', 'sreemangal-premium-black-tea-400g', 'food', 195, 220, 11, '৪০০ গ্রাম প্যাক', '/src/assets/images/promo_mustard_honey_1791438879357.jpg', 'শ্রীমঙ্গলের সেরা বাগানের গাঢ় লিকার ও দারুণ সুবাস', 'কড়া লিকার ও চমৎকার ঘ্রাণের প্রিমিয়াম বিওপি ক্লোন চা পাতা। দুধ চা ও রঙ চা উভয়টির জন্যই পারফেক্ট।', 4.9, 88, 45, 1, 'মৌলভীবাজার', 1, 1, 'active'),
('pb-26', 'হাতে তৈরি শক্ত নারিকেলের শলাকা ঝাড়ু', 'handcrafted-coconut-broom', 'household', 75, 90, 17, '১ পিস', '/src/assets/images/category_daily_bazaar_1791438890146.jpg', 'উঠান ও মেঝের পরিষ্কারের জন্য দীর্ঘস্থায়ী শক্ত ঝাড়ু', 'গ্রামের অভিজ্ঞ কারিগরদের নিখুঁত বাঁধাইয়ের মজবুত ঝাড়ু। সহজে শলাকা খুলে পড়ে না।', 4.7, 41, 50, 1, 'বরিশাল', 0, 0, 'active');

-- Store Settings
INSERT OR IGNORE INTO settings (key, value) VALUES
('site_name', 'PolliBazar (পল্লি বাজার)'),
('site_tagline', 'গ্রামের পণ্য, আপনার ঘরে'),
('site_phone', '01712334707'),
('site_email', 'ice.tusar@gmail.com'),
('site_address', 'PolliBazar, Madhurkhola, Muksudpur, Dohar, Dhaka, Bangladesh'),
('currency', '৳'),
('delivery_charge_dhaka', '60'),
('delivery_charge_outside', '120'),
('free_delivery_threshold', '2500');

-- Production Admin User
-- Username: admin
-- Role: superadmin
INSERT OR IGNORE INTO admins (id, username, password_hash, role) VALUES
('adm-01', 'admin', 'pbdevsalt2026:2240fde2ce7fe263c486076ac52389fc95f11f88a98956716fd58f1bbac9c575', 'superadmin');
