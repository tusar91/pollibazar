import { Env, errorResponse, jsonResponse, verifyAdminSession } from './_utils';

export async function onRequestOptions(context: { request: Request }) {
  const origin = context.request.headers.get('Origin') || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Validates image buffer using magic bytes (file signature)
 */
function detectImageMimeType(bytes: Uint8Array): { mime: string; ext: string } | null {
  if (bytes.length < 12) return null;

  // JPEG signature: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }

  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: 'png' };
  }

  // WebP signature: RIFF .... WEBP
  // bytes 0-3: 52 49 46 46 ("RIFF")
  // bytes 8-11: 57 45 42 50 ("WEBP")
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { mime: 'image/webp', ext: 'webp' };
  }

  return null;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // 1. Authenticate admin user
  const auth = await verifyAdminSession(request, env);
  if (!auth.isValid) {
    return errorResponse('অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে প্রথমে অ্যাডমিন প্যানেলে লগইন করুন।', 401, undefined, request);
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return errorResponse('অনুরোধটি অবশ্যই multipart/form-data ফরম্যাটে হতে হবে।', 400, undefined, request);
    }

    const formData = await request.formData();
    const file = (formData.get('file') || formData.get('image')) as File | null;
    const productId = formData.get('productId') as string | null;
    const customKey = formData.get('stableKey') as string | null;

    if (!file || typeof file === 'string') {
      return errorResponse('কোনো ছবি পাওয়া যায়নি। অনুগ্রহ করে একটি ছবি নির্বাচন করুন।', 400, undefined, request);
    }

    // 2. File size validation (Server-side)
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return errorResponse(`ফাইলের আকার (${sizeMb} MB) খুব বড়। সর্বোচ্চ ৫ MB আকারের ছবি আপলোড করা যাবে।`, 400, undefined, request);
    }

    if (file.size === 0) {
      return errorResponse('ফাইলটি খালি বা অকার্যকর।', 400, undefined, request);
    }

    // 3. Magic bytes inspection (Do not trust client file extension or declared MIME type alone)
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const detected = detectImageMimeType(bytes);

    if (!detected) {
      return errorResponse(
        'অননুমোদিত ফাইল ফরম্যাট। শুধুমাত্র প্রকৃত JPG, JPEG, PNG এবং WebP ফরম্যাটের ছবি আপলোড করা যাবে।',
        400,
        undefined,
        request
      );
    }

    // 4. Generate stable storage key and URL
    const cleanId = (productId || 'prod').replace(/[^a-zA-Z0-9_-]/g, '');
    const timestamp = Date.now();
    const randomHex = crypto.randomUUID().slice(0, 8);
    const key = customKey && customKey.startsWith('products/')
      ? customKey.replace(/^\/+/, '')
      : `products/${cleanId}-${timestamp}-${randomHex}.${detected.ext}`;

    const stableUrl = `/api/uploads/${key}`;

    // 5. Store in Cloudflare R2 if binding is available
    let storedInR2 = false;
    if (env.IMAGES_BUCKET) {
      try {
        await env.IMAGES_BUCKET.put(key, arrayBuffer, {
          httpMetadata: {
            contentType: detected.mime,
            cacheControl: 'public, max-age=31536000, immutable',
          },
          customMetadata: {
            uploadedBy: auth.username || 'admin',
            originalName: file.name.slice(0, 100),
            uploadedAt: new Date().toISOString(),
          },
        });
        storedInR2 = true;
      } catch (r2Err: any) {
        console.error('Failed to write to Cloudflare R2 bucket:', r2Err);
      }
    }

    // 6. Record in D1 product_images table if productId was provided and DB is connected
    if (env.DB && productId) {
      try {
        const imageId = `img-${crypto.randomUUID().slice(0, 8)}`;
        await env.DB.prepare(`
          INSERT INTO product_images (id, product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, ?, 1, 0)
        `).bind(imageId, productId, stableUrl).run();
      } catch (dbErr: any) {
        // Table or record non-fatal warning
        console.warn('Notice recording in product_images table:', dbErr?.message);
      }
    }

    return jsonResponse(
      {
        success: true,
        message: 'ছবি সফলভাবে গ্রহণ ও আপলোড করা হয়েছে।',
        url: stableUrl,
        key,
        filename: file.name,
        size: file.size,
        mimeType: detected.mime,
        storedInR2,
        r2Configured: Boolean(env.IMAGES_BUCKET),
      },
      200,
      {},
      request
    );
  } catch (err: any) {
    return errorResponse('ছবি আপলোড প্রক্রিয়ায় সমস্যা হয়েছে: ' + (err?.message || 'Error'), 500, undefined, request);
  }
}
