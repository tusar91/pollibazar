// PolliBazar Product Image Asset & URL Utilities
// Safe, Cloudflare Pages static, optimized Data URL, and external URL management without R2 dependency

export interface PresetProductImage {
  id: string;
  title: string;
  category: string;
  url: string;
}

export const DEFAULT_PRODUCT_IMAGE = '/src/assets/images/category_daily_bazaar_1791438890146.jpg';

export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

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

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate image file size and type
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'কোনো ফাইল নির্বাচন করা হয়নি।' };
  }

  // Type check
  const fileType = file.type ? file.type.toLowerCase() : '';
  const fileExt = file.name ? file.name.split('.').pop()?.toLowerCase() : '';
  const isAllowedType =
    SUPPORTED_IMAGE_TYPES.includes(fileType) ||
    ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt || '');

  if (!isAllowedType) {
    return {
      valid: false,
      error: `অনুপযুক্ত ফাইল ফরম্যাট (${file.type || fileExt})। শুধুমাত্র JPG, PNG অথবা WEBP ফরম্যাট সমর্থিত।`,
    };
  }

  // Size check
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `ফাইলের সাইজ অনেক বড় (${sizeMb} MB)। সর্বোচ্চ সীমা ৫ MB।`,
    };
  }

  return { valid: true };
}

export interface OptimizedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  originalName: string;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
}

/**
 * Process, downscale (if needed) and optimize an image file into an ultra-clean Data URL
 * Keeps aspect ratio, scales to max 900px, and exports as high-quality WebP/JPEG.
 * Typically reduces a 2MB-5MB camera photo to 50KB-120KB for instant localStorage & D1 saving.
 */
export async function optimizeAndConvertImage(
  file: File,
  maxDimension = 900,
  quality = 0.85
): Promise<OptimizedImageResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'ফাইলের যাচাইকরণ ব্যর্থ হয়েছে।');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('ফাইলটি পড়া সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'));
    };

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('ছবিটি লোড করা সম্ভব হয়নি। ফাইলটি ক্ষতিগ্রস্ত হতে পারে।'));
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate scaled dimensions
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to raw data url if canvas 2d context unavailable
            const rawDataUrl = reader.result as string;
            resolve({
              dataUrl: rawDataUrl,
              width: img.width,
              height: img.height,
              originalName: file.name,
              originalSizeBytes: file.size,
              optimizedSizeBytes: Math.round(rawDataUrl.length * 0.75),
            });
            return;
          }

          // Use high-quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Attempt WebP export first, fallback to JPEG
          let dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          const approxBytes = Math.round(dataUrl.length * 0.75);

          resolve({
            dataUrl,
            width,
            height,
            originalName: file.name,
            originalSizeBytes: file.size,
            optimizedSizeBytes: approxBytes,
          });
        } catch (err: any) {
          reject(new Error('ছবি অপ্টিমাইজেশনে সমস্যা: ' + (err?.message || 'Error')));
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate product image URL
 */
export function isValidProductImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image/')) {
    return true;
  }
  if (trimmed.startsWith('/src/assets/images/') || trimmed.startsWith('/images/')) {
    return true;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return true;
  }
  return false;
}
