import { Env, errorResponse, isAdminRole, jsonResponse, verifyAdminSession } from '../_utils';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');
  const featured = url.searchParams.get('featured');
  const newArrival = url.searchParams.get('new_arrival');

  if (env.DB) {
    try {
      let query = `
        SELECT 
          p.id, p.name, p.slug, p.category_id as category, c.name as categoryName,
          p.price, p.old_price as oldPrice, p.discount, p.unit, p.image, p.gallery,
          p.short_description as shortDescription, p.description, p.rating, 
          p.review_count as reviewCount, p.stock,
          (CASE WHEN p.stock IS NULL OR p.stock > 0 THEN 1 ELSE 0 END) as inStock,
          p.origin, p.featured, p.new_arrival as newArrival
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.slug
        WHERE 1=1
      `;
      const params: any[] = [];

      if (category && category !== 'all') {
        query += ' AND (p.category_id = ? OR c.slug = ?)';
        params.push(category, category);
      }
      if (search) {
        query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }
      if (featured === 'true' || featured === '1') {
        query += ' AND p.featured = 1';
      }
      if (newArrival === 'true' || newArrival === '1') {
        query += ' AND p.new_arrival = 1';
      }

      query += ' ORDER BY p.id ASC';

      const stmt = env.DB.prepare(query).bind(...params);
      const { results } = await stmt.all();

      return jsonResponse({
        success: true,
        count: results?.length || 0,
        data: (results || []).map((r: any) => ({
          ...r,
          inStock: Boolean(r.inStock),
          isAvailable: Boolean(r.inStock && (r.stock === null || r.stock === undefined || Number(r.stock) > 0)),
          featured: Boolean(r.featured),
          newArrival: Boolean(r.newArrival),
          gallery: r.gallery ? JSON.parse(r.gallery) : undefined,
        })),
      });
    } catch (e: any) {
      console.error('Failed to query products from D1:', e);
    }
  }

  // Fallback response if D1 is not yet bound
  return jsonResponse({
    success: true,
    data: [],
    message: 'D1 database binding active or client offline fallback enabled',
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const auth = await verifyAdminSession(request, env);
  if (!auth.isValid) {
    return errorResponse('অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।', 401);
  }

  if (!isAdminRole(auth.role)) {
    return errorResponse('শুধুমাত্র অ্যাডমিন পণ্য তৈরি করতে পারেন। মডারেটরের এই অনুমতি নেই।', 403);
  }

  try {
    const body: any = await request.json();
    if (!body.name || !body.price || !body.category) {
      return errorResponse('পণ্যের নাম, মূল্য ও ক্যাটাগরি আবশ্যক।', 400);
    }

    const id = body.id || `pb-${Date.now().toString().slice(-6)}`;
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-');

    if (env.DB) {
      await env.DB.prepare(`
        INSERT INTO products (
          id, name, slug, category_id, price, old_price, discount, unit,
          image, short_description, description, rating, review_count, stock,
          origin, featured, new_arrival
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        body.name,
        slug,
        body.category,
        Number(body.price),
        body.oldPrice ? Number(body.oldPrice) : null,
        body.discount ? Number(body.discount) : 0,
        body.unit || '১ পিস',
        body.image || '/src/assets/images/hero_fresh_groceries_1791438853885.jpg',
        body.shortDescription || '',
        body.description || '',
        body.rating || 5.0,
        body.reviewCount || 0,
        body.stock !== undefined ? Number(body.stock) : 10,
        body.origin || '',
        body.featured ? 1 : 0,
        body.newArrival ? 1 : 0
      ).run();

      // Record image into product_images table (Requirement 3)
      const productImage = body.image || '/src/assets/images/hero_fresh_groceries_1791438853885.jpg';
      const imageRecordId = `img-${crypto.randomUUID().slice(0, 8)}`;
      await env.DB.prepare(`
        INSERT INTO product_images (id, product_id, image_url, is_primary, sort_order)
        VALUES (?, ?, ?, 1, 0)
      `).bind(imageRecordId, id, productImage).run().catch((imgErr: any) => {
        console.warn('Notice adding product_images entry:', imgErr?.message);
      });
    }

    return jsonResponse({
      success: true,
      message: 'পণ্যটি সফলভাবে যুক্ত করা হয়েছে।',
      data: { id, slug, ...body },
    }, 201);
  } catch (e: any) {
    return errorResponse('পণ্য যুক্ত করতে সমস্যা হয়েছে: ' + (e?.message || 'Error'), 500);
  }
}
