import { Env, errorResponse, generateOrderNumber, jsonResponse, verifyAdminSession } from '../_utils';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const auth = await verifyAdminSession(request, env);
  if (!auth.isValid) {
    return errorResponse('অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।', 401);
  }

  if (env.DB) {
    try {
      const { results: orders } = await env.DB.prepare(`
        SELECT 
          o.id, o.order_number as orderId, o.customer_id, o.customer_name, o.customer_phone,
          o.district, o.area, o.delivery_address, o.subtotal, o.delivery_charge as deliveryCharge,
          o.discount, o.total, o.payment_method as paymentMethod, o.payment_number as paymentNumber,
          o.trx_id as trxId, o.payment_status as paymentStatus, o.order_status as status,
          o.customer_note as notes, o.created_at as createdAt
        FROM orders o
        ORDER BY o.created_at DESC
      `).all();

      // Retrieve items for each order
      const ordersWithItems = await Promise.all(
        (orders || []).map(async (o: any) => {
          const { results: items } = await env.DB.prepare(
            'SELECT product_id as id, product_name as name, price, quantity, unit, subtotal FROM order_items WHERE order_id = ?'
          ).bind(o.id).all();

          return {
            ...o,
            customer: {
              fullName: o.customer_name,
              phone: o.customer_phone,
              district: o.district,
              area: o.area,
              address: o.delivery_address,
              notes: o.notes,
            },
            items: items || [],
          };
        })
      );

      return jsonResponse({
        success: true,
        count: ordersWithItems.length,
        data: ordersWithItems,
      });
    } catch (e: any) {
      console.error('Failed to list orders from D1:', e);
    }
  }

  return jsonResponse({
    success: true,
    data: [],
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    const body: any = await request.json();
    const { customer, items, paymentMethod, paymentNumber, trxId } = body;

    if (!customer || !customer.fullName || !customer.phone || !customer.address) {
      return errorResponse('গ্রাহকের নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা আবশ্যক।', 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse('কার্টে কমপক্ষে একটি পণ্য থাকা আবশ্যক।', 400);
    }

    // Verify phone number (11 digits BD format)
    const phoneClean = customer.phone.replace(/[^0-9]/g, '');
    if (phoneClean.length !== 11) {
      return errorResponse('সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর প্রদান করুন।', 400);
    }

    // Server-side Price Verification and Subtotal Calculation
    let calculatedSubtotal = 0;
    const verifiedItems: any[] = [];

    for (const item of items) {
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      let unitPrice = Number(item.price);
      let productName = item.name || 'পণ্য';
      let unit = item.unit || '১ পিস';
      let imageUrl = item.image || '';

      // If D1 is connected, fetch canonical price and check stock from DB
      if (env.DB) {
        const dbProduct = await env.DB.prepare(
          'SELECT id, name, price, stock, is_available, unit, image FROM products WHERE id = ?'
        ).bind(item.id).first();

        if (dbProduct) {
          if (!dbProduct.is_available || (dbProduct.stock !== null && dbProduct.stock < quantity)) {
            return errorResponse(`দুঃখিত, "${dbProduct.name}" বর্তমানে পর্যাপ্ত স্টকে নেই।`, 409);
          }
          unitPrice = Number(dbProduct.price);
          productName = dbProduct.name;
          unit = dbProduct.unit || unit;
          imageUrl = dbProduct.image || imageUrl;
        }
      }

      if (unitPrice <= 0 || isNaN(unitPrice)) {
        return errorResponse('পণ্যের মূল্য সঠিকভাবে নির্ধারণ করা সম্ভব হয়নি।', 400);
      }

      const itemSubtotal = unitPrice * quantity;
      calculatedSubtotal += itemSubtotal;

      verifiedItems.push({
        id: item.id,
        name: productName,
        price: unitPrice,
        quantity,
        unit,
        image: imageUrl,
        subtotal: itemSubtotal,
      });
    }

    // Delivery charge calculation
    const isDhaka = customer.district === 'ঢাকা' || customer.district?.toLowerCase().includes('dhaka');
    let deliveryCharge = isDhaka ? 60 : 120;

    // Fetch configurable delivery charge from D1 if available
    if (env.DB) {
      try {
        const threshold = await env.DB.prepare("SELECT value FROM settings WHERE key = 'free_delivery_threshold'").first();
        if (threshold && calculatedSubtotal >= Number(threshold.value)) {
          deliveryCharge = 0;
        } else {
          const chargeKey = isDhaka ? 'delivery_charge_dhaka' : 'delivery_charge_outside';
          const chargeSetting = await env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind(chargeKey).first();
          if (chargeSetting) {
            deliveryCharge = Number(chargeSetting.value);
          }
        }
      } catch (e) {
        console.warn('Settings lookup failed, using defaults');
      }
    } else if (calculatedSubtotal >= 2500) {
      deliveryCharge = 0;
    }

    const discount = Number(body.discount) || 0;
    const finalTotal = calculatedSubtotal + deliveryCharge - discount;
    const orderNumber = generateOrderNumber();
    const orderId = `ord-${Date.now()}`;
    const customerId = `cust-${phoneClean.slice(-6)}`;

    // Save to D1
    if (env.DB) {
      // 1. Upsert customer
      await env.DB.prepare(`
        INSERT INTO customers (id, name, phone, email, district, area, address, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(phone) DO UPDATE SET
          name = excluded.name,
          address = excluded.address,
          district = excluded.district,
          area = excluded.area,
          updated_at = CURRENT_TIMESTAMP
      `).bind(
        customerId,
        customer.fullName,
        phoneClean,
        customer.email || null,
        customer.district || 'ঢাকা',
        customer.area || '',
        customer.address
      ).run();

      // 2. Insert order
      await env.DB.prepare(`
        INSERT INTO orders (
          id, order_number, customer_id, customer_name, customer_phone,
          district, area, delivery_address, subtotal, delivery_charge,
          discount, total, payment_method, payment_number, trx_id,
          payment_status, order_status, customer_note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        orderId,
        orderNumber,
        customerId,
        customer.fullName,
        phoneClean,
        customer.district || 'ঢাকা',
        customer.area || '',
        customer.address,
        calculatedSubtotal,
        deliveryCharge,
        discount,
        finalTotal,
        paymentMethod || 'cod',
        paymentNumber || null,
        trxId || null,
        paymentMethod === 'cod' ? 'pending' : (trxId ? 'pending_verification' : 'pending'),
        'pending',
        customer.notes || null
      ).run();

      // 3. Insert order items & reduce stock
      for (const itm of verifiedItems) {
        const itemId = `item-${crypto.randomUUID().slice(0, 8)}`;
        await env.DB.prepare(`
          INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity, unit, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          itemId,
          orderId,
          itm.id,
          itm.name,
          itm.price,
          itm.quantity,
          itm.unit,
          itm.subtotal
        ).run();

        // Reduce stock in products table
        await env.DB.prepare(`
          UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?
        `).bind(itm.quantity, itm.id).run();
      }
    }

    const createdOrder = {
      orderId: orderNumber,
      dbId: orderId,
      customer: {
        ...customer,
        phone: phoneClean,
      },
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      deliveryCharge,
      discount,
      total: finalTotal,
      paymentMethod: paymentMethod || 'cod',
      paymentNumber,
      trxId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedDelivery: '২-৩ কর্মদিবস',
    };

    return jsonResponse({
      success: true,
      message: 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে।',
      order: createdOrder,
    }, 201);
  } catch (e: any) {
    return errorResponse('অর্ডার তৈরি করতে ব্যর্থ হয়েছে: ' + (e?.message || 'Error'), 500);
  }
}
