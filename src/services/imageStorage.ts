// PolliBazar Product Image Asset & URL Utilities
// Safe, Cloudflare Pages static and external URL management without R2 dependency

export interface PresetProductImage {
  id: string;
  title: string;
  category: string;
  url: string;
}

export const DEFAULT_PRODUCT_IMAGE = '/src/assets/images/category_daily_bazaar_1791438890146.jpg';

/**
 * Curated high-resolution static product images available locally in the project
 */
export const PRESET_PRODUCT_IMAGES: PresetProductImage[] = [
  {
    id: 'groceries',
    title: 'মিনিকেট চাল ও গ্রোসারি',
    category: 'grocery',
    url: '/src/assets/images/hero_fresh_groceries_1791438853885.jpg',
  },
  {
    id: 'harvest',
    title: 'সরিষার তেল ও গ্রামীণ ফসল',
    category: 'grocery',
    url: '/src/assets/images/hero_village_harvest_1791438866620.jpg',
  },
  {
    id: 'honey',
    title: 'খাঁটি প্রাকৃতিক মধু',
    category: 'food',
    url: '/src/assets/images/promo_mustard_honey_1791438879357.jpg',
  },
  {
    id: 'vegetables',
    title: 'তাজা শাকসবজি',
    category: 'vegetables',
    url: '/src/assets/images/category_fresh_vegetables_1791440561440.jpg',
  },
  {
    id: 'daily_bazaar',
    title: 'নিত্যদিনের বাজার ও পণ্য',
    category: 'grocery',
    url: '/src/assets/images/category_daily_bazaar_1791438890146.jpg',
  },
  {
    id: 'tea_leaves',
    title: 'প্রিমিয়াম চা পাতা',
    category: 'food',
    url: '/src/assets/images/promo_mustard_honey_1791438879357.jpg',
  },
  {
    id: 'beauty',
    title: 'ভেষজ ও রূপচর্চা পণ্য',
    category: 'beauty',
    url: '/src/assets/images/category_beauty_herbal_1791440546624.jpg',
  },
  {
    id: 'fashion',
    title: 'পোশাক ও তাঁতশিল্প',
    category: 'clothing',
    url: '/src/assets/images/category_fashion_1791440518720.jpg',
  },
  {
    id: 'electronics',
    title: 'ইলেকট্রনিক্স ও গেজেট',
    category: 'electronics',
    url: '/src/assets/images/category_electronics_1791440532857.jpg',
  },
];

/**
 * Validate product image URL
 */
export function isValidProductImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/src/assets/images/') || trimmed.startsWith('/images/')) {
    return true;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return true;
  }
  return false;
}
