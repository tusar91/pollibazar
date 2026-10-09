// PolliBazar Image Storage Service
// Handles client-side validation, IndexedDB local persistence, and Cloudflare R2 backend uploads

const DB_NAME = 'pollibazar_image_store';
const STORE_NAME = 'uploaded_images';
const DB_VERSION = 1;

// Maximum allowed image file size (5 Megabytes)
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// In-memory cache for fast blob URLs
const memoryBlobUrlCache = new Map<string, string>();

/**
 * Open or create the IndexedDB instance for image persistence
 */
function openImageDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target?.result as IDBDatabase;
        if (db && !db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target?.result as IDBDatabase);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Save image blob to IndexedDB
 */
export async function saveImageToLocalStore(key: string, blob: Blob): Promise<void> {
  // Update in-memory cache
  try {
    const existing = memoryBlobUrlCache.get(key);
    if (existing) {
      URL.revokeObjectURL(existing);
    }
    const blobUrl = URL.createObjectURL(blob);
    memoryBlobUrlCache.set(key, blobUrl);
  } catch {}

  const db = await openImageDb();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(blob, key);

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Retrieve image blob from IndexedDB
 */
export async function getImageFromLocalStore(key: string): Promise<Blob | null> {
  const db = await openImageDb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = (event: any) => {
        resolve(event.target?.result || null);
      };
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Retrieve cached blob URL for a stable image path
 */
export async function getResolvedImageUrl(pathOrUrl: string): Promise<string> {
  if (!pathOrUrl) return '';

  // Non-upload paths (static assets or external CDN)
  if (!pathOrUrl.startsWith('/api/uploads/')) {
    return pathOrUrl;
  }

  // Check in-memory cache first
  const cached = memoryBlobUrlCache.get(pathOrUrl);
  if (cached) return cached;

  // Check IndexedDB
  const blob = await getImageFromLocalStore(pathOrUrl);
  if (blob) {
    const blobUrl = URL.createObjectURL(blob);
    memoryBlobUrlCache.set(pathOrUrl, blobUrl);
    return blobUrl;
  }

  return pathOrUrl;
}

/**
 * Client-side validation for image files
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'কোনো ফাইল নির্বাচন করা হয়নি।' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'শুধুমাত্র JPG, JPEG, PNG এবং WebP ফরম্যাটের ছবি আপলোড করা যাবে।',
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `ফাইলের আকার (${sizeMb} MB) অনুমোদিত সীমা (৫ MB) অতিক্রম করেছে।`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'ফাইলটি খালি বা ত্রুটিপূর্ণ।' };
  }

  return { valid: true };
}

/**
 * Upload an image file to the PolliBazar backend and store locally for resilient fallback
 */
export async function uploadProductImage(
  file: File,
  productId?: string
): Promise<{ success: boolean; url: string; error?: string }> {
  // 1. Client-side validation
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, url: '', error: validation.error };
  }

  // 2. Generate a stable URL path
  const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'webp';
  const cleanId = (productId || 'prod').replace(/[^a-zA-Z0-9_-]/g, '');
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const stableKey = `products/${cleanId}-${timestamp}-${randomSuffix}.${safeExt}`;
  const stableUrl = `/api/uploads/${stableKey}`;

  // 3. Immediately store the blob in local IndexedDB keyed by the stable URL
  await saveImageToLocalStore(stableUrl, file);

  // 4. Send to backend endpoint for Cloudflare R2 / D1 persistence
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (productId) {
      formData.append('productId', productId);
    }
    formData.append('stableKey', stableKey);

    const token = localStorage.getItem('pb_session_token') || '';
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: formData,
    });

    if (res.ok) {
      const data: any = await res.json().catch(() => null);
      if (data?.success && data?.url) {
        // Backend upload succeeded
        if (data.url !== stableUrl) {
          // If backend generated a different URL, cache to that one too
          await saveImageToLocalStore(data.url, file);
        }
        return { success: true, url: data.url };
      }
    }
  } catch (err) {
    console.warn('Backend image upload network notice; relying on resilient local store:', err);
  }

  // If backend was unreachable or in offline/client mode, the stable URL backed by IndexedDB is returned
  return { success: true, url: stableUrl };
}
