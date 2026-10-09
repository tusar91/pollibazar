import { Env, errorResponse, jsonResponse, verifyAdminSession } from '../_utils';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const auth = await verifyAdminSession(request, env);
  if (!auth.isValid) {
    return errorResponse('অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।', 401);
  }

  if (env.DB) {
    try {
      const { results } = await env.DB.prepare(`
        SELECT 
          c.id, c.name, c.phone, c.email, c.district, c.area, c.address,
          COUNT(o.id) as order_count,
          COALESCE(SUM(o.total), 0) as total_spent,
          MAX(o.created_at) as last_order_date
        FROM customers c
        LEFT JOIN orders o ON c.id = o.customer_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `).all();

      return jsonResponse({
        success: true,
        count: results?.length || 0,
        data: results || [],
      });
    } catch (e: any) {
      console.error('Failed to list customers from D1:', e);
    }
  }

  return jsonResponse({
    success: true,
    data: [],
  });
}
