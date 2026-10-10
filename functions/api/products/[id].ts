import { Env, errorResponse, isAdminRole, jsonResponse, verifyAdminSession } from '../_utils';

export async function onRequestGet(context: { params: { id: string }; env: Env }) {
  const { id } = context.params;
  const { env } = context;

  if (env.DB) {
    try {
      const product = await env.DB.prepare(`
        SELECT 
          p.id, p.name, p.slug, p.category_id as category, c.name as categoryName,
          p.price, p.old_price as oldPrice, p.discount, p.unit, p.image, p.gallery,
          p.short_description as shortDescription, p.description, p.rating, 
          p.review_count as reviewCount, p.stock,
          (CASE WHEN (p.status = 'active' OR p.status IS NULL) AND (p.stock IS NULL OR p.stock > 0) THEN 1 ELSE 0 END) as inStock,
          p.origin, p.featured, p.new_arrival as newArrival, p.status
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.slug
        WHERE p.id = ? OR p.slug = ?
      `).bind(id, id).first();

      if (product) {
        return jsonResponse({
          success: true,
          data: {
            ...product,
            inStock: Boolean(product.inStock),
            featured: Boolean(product.featured),
            newArrival: Boolean(product.newArrival),
          },
        });
      }
    } catch (e: any) {
      console.error('Failed to get product from D1:', e);
    }
  }

  return errorResponse('পণ্যটি পাওয়া যায়নি।', 404);
}

export async function onRequestPut(context: { params: { id: string }; request: Request; env: Env }) {
  const { params, request, env } = context;
  const auth = await verifyAdminSession(request, env);
  if (!auth.isValid) {
    return errorResponse('অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।', 401);
  }

  if (!isAdminRole(auth.role)) {
    return errorResponse('শুধুমাত্র অ্যাডমিন পণ্য সম্পাদন করতে পারেন। মডারেটরের এই অনুমতি নেই।', 403);
  }

  try {
    const body: any = await request.json();
    const newStatus = body.status !== undefined 
      ? body.status 
      : (body.inStock !== undefined ? (body.inStock ? 'active' : 'inactive') : null);

    if (env.DB) {
      await env.DB.prepare(`
        UPDATE products SET
          name = COALESCE(?, name),
          price = COALESCE(?, price),
          old_price = COALESCE(?, old_price),
          discount = COALESCE(?, discount),
          unit = COALESCE(?, unit),
          image = COALESCE(?, image),
          short_description = COALESCE(?, short_description),
          description = COALESCE(?, description),
          stock = COALESCE(?, stock),
          status = COALESCE(?, status),
          featured = COALESCE(?, featured),
          new_arrival = COALESCE(?, new_arrival),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        body.name ?? null,
        body.price !== undefined ? Number(body.price) : null,
        body.oldPrice !== undefined ? Number(body.oldPrice) : null,
        body.discount !== undefined ? Number(body.discount) : null,
        body.unit ?? null,
        body.image ?? null,
        body.shortDescription ?? null,
        body.description ?? null,
        body.stock !== undefined ? Number(body.stock) : null,
        newStatus,
        body.featured !== undefined ? (body.featured ? 1 : 0) : null,
        body.newArrival !== undefined ? (body.newArrival ? 1 : 0) : null,
        params.id
      ).run();

      // If a new image URL is provided, update/insert primary image in product_images (Requirement 3 & 4)
      if (body.image) {
        // Demote previous primary images for this product
        await env.DB.prepare(
          'UPDATE product_images SET is_primary = 0 WHERE product_id = ?'
        ).bind(params.id).run().catch(() => {});

        const imageRecordId = `img-${crypto.randomUUID().slice(0, 8)}`;
        await env.DB.prepare(`
          INSERT INTO product_images (id, product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, ?, 1, 0)
        `).bind(imageRecordId, params.id, body.image).run().catch((imgErr: any) => {
          console.warn('Notice updating product_images entry:', imgErr?.message);
        });
      }
    }

    return jsonResponse({
      success: true,
      message: 'পণ্য তথ্য সফলভাবে আপডেট করা হয়েছে।',
    });
  } catch (e: any) {
    return errorResponse('পণ্য আপডেট করতে সমস্যা হয়েছে: ' + (e?.message || 'Error'), 500);
  }
}

export async function onRequestDelete(context: { params: { id: string }; request: Request; env: Env }) {
  const { params, request, env } = context;
  const auth = await verifyAdminSession(request, env);
  if (!auth.isValid) {
    return errorResponse('অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।', 401);
  }

  if (!isAdminRole(auth.role)) {
    return errorResponse('শুধুমাত্র অ্যাডমিন পণ্য মুছে ফেলতে পারেন। মডারেটরের এই অনুমতি নেই।', 403);
  }

  if (env.DB) {
    try {
      await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(params.id).run();
    } catch (e: any) {
      return errorResponse('পণ্য মুছতে সমস্যা হয়েছে: ' + (e?.message || 'Error'), 500);
    }
  }

  return jsonResponse({
    success: true,
    message: 'পণ্যটি সফলভাবে মুছে ফেলা হয়েছে।',
  });
}
