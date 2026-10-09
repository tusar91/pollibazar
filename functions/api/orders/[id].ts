import { Env, errorResponse, jsonResponse, verifyAdminSession } from '../_utils';

export async function onRequestGet(context: { params: { id: string }; env: Env }) {
  const { id } = context.params;
  const { env } = context;

  if (env.DB) {
    try {
      const order = await env.DB.prepare(`
        SELECT 
          o.id, o.order_number as orderId, o.customer_id, o.customer_name, o.customer_phone,
          o.district, o.area, o.delivery_address, o.subtotal, o.delivery_charge as deliveryCharge,
          o.discount, o.total, o.payment_method as paymentMethod, o.payment_number as paymentNumber,
          o.trx_id as trxId, o.payment_status as paymentStatus, o.order_status as status,
          o.customer_note as notes, o.created_at as createdAt
        FROM orders o
        WHERE o.order_number = ? OR o.id = ?
      `).bind(id, id).first();

      if (order) {
        const { results: items } = await env.DB.prepare(
          'SELECT product_id as id, product_name as name, price, quantity, unit, subtotal FROM order_items WHERE order_id = ?'
        ).bind(order.id).all();

        return jsonResponse({
          success: true,
          data: {
            ...order,
            customer: {
              fullName: order.customer_name,
              phone: order.customer_phone,
              district: order.district,
              area: order.area,
              address: order.delivery_address,
              notes: order.notes,
            },
            items: items || [],
          },
        });
      }
    } catch (e: any) {
      console.error('Failed to get order from D1:', e);
    }
  }

  return errorResponse('অর্ডারটি পাওয়া যায়নি।', 404);
}

export async function onRequestPatch(context: { params: { id: string }; request: Request; env: Env }) {
  const { params, request, env } = context;
  const auth = await verifyAdminSession(request, env);
  if (!auth.isValid) {
    return errorResponse('অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।', 401);
  }

  try {
    const body: any = await request.json();
    const { status, paymentStatus } = body;

    if (env.DB) {
      await env.DB.prepare(`
        UPDATE orders SET
          order_status = COALESCE(?, order_status),
          payment_status = COALESCE(?, payment_status),
          updated_at = CURRENT_TIMESTAMP
        WHERE order_number = ? OR id = ?
      `).bind(status ?? null, paymentStatus ?? null, params.id, params.id).run();
    }

    return jsonResponse({
      success: true,
      message: 'অর্ডারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।',
    });
  } catch (e: any) {
    return errorResponse('অর্ডার আপডেট ব্যর্থ হয়েছে: ' + (e?.message || 'Error'), 500);
  }
}
