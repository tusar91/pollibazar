import { Env, errorResponse, jsonResponse } from '../_utils';

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    const body: any = await request.json();
    const orderNumber = (body.orderNumber || body.orderId || '').trim();
    const phone = (body.phone || '').replace(/[^0-9]/g, '');

    if (!orderNumber && !phone) {
      return errorResponse('অনুগ্রহ করে অর্ডার নম্বর অথবা মোবাইল নম্বর প্রদান করুন।', 400);
    }

    if (env.DB) {
      let query = `
        SELECT 
          o.id, o.order_number as orderId, o.customer_id, o.customer_name, o.customer_phone,
          o.district, o.area, o.delivery_address, o.subtotal, o.delivery_charge as deliveryCharge,
          o.discount, o.total, o.payment_method as paymentMethod, o.payment_number as paymentNumber,
          o.trx_id as trxId, o.payment_status as paymentStatus, o.order_status as status,
          o.customer_note as notes, o.created_at as createdAt
        FROM orders o
        WHERE 1=1
      `;
      const params: any[] = [];

      if (orderNumber) {
        query += ' AND (o.order_number = ? OR o.id = ?)';
        params.push(orderNumber, orderNumber);
      }
      if (phone) {
        query += ' AND o.customer_phone LIKE ?';
        params.push(`%${phone}%`);
      }

      query += ' ORDER BY o.created_at DESC LIMIT 1';

      const order = await env.DB.prepare(query).bind(...params).first();

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
    }

    return errorResponse('উক্ত তথ্যের সাথে কোনো সক্রিয় অর্ডার পাওয়া যায়নি। নম্বরটি যাচাই করে পুনরায় চেষ্টা করুন।', 404);
  } catch (e: any) {
    return errorResponse('অর্ডার ট্র্যাকিং এ সমস্যা হয়েছে: ' + (e?.message || 'Error'), 500);
  }
}
