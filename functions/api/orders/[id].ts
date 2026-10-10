import { Env, errorResponse, isAdminRole, isAuthorizedRole, isModeratorRole, jsonResponse, verifyAdminSession } from '../_utils';

export async function onRequestOptions(context: { request: Request }) {
  const origin = context.request.headers.get('Origin') || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function onRequestGet(context: { params: { id: string }; env: Env }) {
  const { id } = context.params;
  const { env } = context;

  if (!env.DB) {
    return errorResponse('ডাটাবেজ সংযোগ পাওয়া যায়নি।', 500);
  }

  try {
    const order: any = await env.DB.prepare(`
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
      const { results: items } = await env.DB.prepare(`
        SELECT 
          oi.product_id as id, 
          oi.product_name as name, 
          oi.price, 
          oi.quantity, 
          oi.unit, 
          oi.subtotal,
          COALESCE(p.image, '') as image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).bind(order.id).all();

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
    return errorResponse('অর্ডার লোড করতে সমস্যা হয়েছে: ' + (e?.message || 'Error'), 500);
  }

  return errorResponse('অর্ডারটি পাওয়া যায়নি।', 404);
}

export async function onRequestPatch(context: { params: { id: string }; request: Request; env: Env }) {
  const { params, request, env } = context;
  const auth = await verifyAdminSession(request, env);
  if (!auth.isValid) {
    return errorResponse('অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।', 401);
  }

  if (!env.DB) {
    return errorResponse('ডাটাবেজ সংযোগ পাওয়া যায়নি।', 500);
  }

  const isMod = isModeratorRole(auth.role);
  const isAdmin = isAdminRole(auth.role);

  if (!isAdmin && !isMod) {
    return errorResponse('আপনার এই অনুরোধটি সম্পাদনের অনুমতি নেই।', 403);
  }

  try {
    const body: any = await request.json();
    const { status, paymentStatus } = body;

    // Moderator RBAC restriction:
    // Moderator can change only explicitly permitted order or fulfillment statuses
    const ALLOWED_ORDER_STATUSES = [
      'pending',
      'placed',
      'confirmed',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
    ];
    const ALLOWED_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

    if (isMod) {
      // Validate that moderator does not submit arbitrary database fields
      const submittedKeys = Object.keys(body || {});
      const forbiddenKeys = submittedKeys.filter(
        (key) => key !== 'status' && key !== 'paymentStatus'
      );

      if (forbiddenKeys.length > 0) {
        return errorResponse(
          'মডারেটর শুধুমাত্র অর্ডারের স্থিতি (Status) পরিবর্তন করতে পারেন। অন্য কোনো তথ্য পরিবর্তনের অনুমতি নেই।',
          403
        );
      }

      if (status !== undefined && !ALLOWED_ORDER_STATUSES.includes(String(status).toLowerCase())) {
        return errorResponse(`অননুমোদিত অর্ডার স্ট্যাটাস: ${status}`, 400);
      }

      if (
        paymentStatus !== undefined &&
        !ALLOWED_PAYMENT_STATUSES.includes(String(paymentStatus).toLowerCase())
      ) {
        return errorResponse(`অননুমোদিত পেমেন্ট স্ট্যাটাস: ${paymentStatus}`, 400);
      }
    }

    const res = await env.DB.prepare(`
      UPDATE orders SET
        order_status = COALESCE(?, order_status),
        payment_status = COALESCE(?, payment_status),
        updated_at = CURRENT_TIMESTAMP
      WHERE order_number = ? OR id = ?
    `).bind(status ?? null, paymentStatus ?? null, params.id, params.id).run();

    return jsonResponse({
      success: true,
      message: 'অর্ডারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।',
    });
  } catch (e: any) {
    return errorResponse('অর্ডার আপডেট ব্যর্থ হয়েছে: ' + (e?.message || 'Error'), 500);
  }
}

export async function onRequestDelete(context: { params: { id: string }; request: Request; env: Env }) {
  const { params, request, env } = context;
  const auth = await verifyAdminSession(request, env);
  if (!auth.isValid) {
    return errorResponse('অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।', 401);
  }

  // Only Admin can delete orders
  if (!isAdminRole(auth.role)) {
    return errorResponse('শুধুমাত্র অ্যাডমিন অর্ডার মুছে ফেলতে পারেন। মডারেটরের এই অনুমতি নেই।', 403);
  }

  if (!env.DB) {
    return errorResponse('ডাটাবেজ সংযোগ পাওয়া যায়নি।', 500);
  }

  try {
    await env.DB.prepare('DELETE FROM orders WHERE order_number = ? OR id = ?').bind(params.id, params.id).run();
    return jsonResponse({
      success: true,
      message: 'অর্ডারটি সফলভাবে মুছে ফেলা হয়েছে।',
    });
  } catch (e: any) {
    return errorResponse('অর্ডার মুছতে সমস্যা হয়েছে: ' + (e?.message || 'Error'), 500);
  }
}
