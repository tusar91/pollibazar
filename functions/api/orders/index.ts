import { Env, errorResponse, generateOrderNumber, jsonResponse, verifyAdminSession } from '../_utils';

export async function onRequestOptions(context: { request: Request }) {
  const origin = context.request.headers.get('Origin') || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

/**
 * GET /api/orders
 * Admin / Moderator order listing with status & search filtering and pagination
 */
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // 1. Enforce Server-Side Authentication
  const auth = await verifyAdminSession(request, env);
  if (!auth.isValid) {
    return errorResponse('অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।', 401, undefined, request);
  }

  // 2. Database connection check
  if (!env.DB) {
    return errorResponse('ডাটাবেজ সংযোগ পাওয়া যায়নি।', 500, undefined, request);
  }

  const url = new URL(request.url);
  const statusParam = (url.searchParams.get('status') || '').trim();
  const searchParam = (url.searchParams.get('search') || '').trim();
  const limitParam = parseInt(url.searchParams.get('limit') || '100', 10);
  const offsetParam = parseInt(url.searchParams.get('offset') || '0', 10);
  const limit = isNaN(limitParam) ? 100 : Math.min(200, Math.max(1, limitParam));
  const offset = isNaN(offsetParam) ? 0 : Math.max(0, offsetParam);

  try {
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

    if (statusParam && statusParam !== 'all') {
      if (statusParam === 'placed') {
        query += ' AND (o.order_status = "placed" OR o.order_status = "pending")';
      } else {
        query += ' AND o.order_status = ?';
        params.push(statusParam);
      }
    }

    if (searchParam) {
      query += ' AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)';
      params.push(`%${searchParam}%`, `%${searchParam}%`, `%${searchParam}%`);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results: orders } = await env.DB.prepare(query).bind(...params).all();

    if (!orders || orders.length === 0) {
      return jsonResponse({
        success: true,
        count: 0,
        data: [],
      }, 200, {}, request);
    }

    // Fetch all items for retrieved orders in a single query with product image joined
    const orderIds = orders.map((o: any) => o.id);
    const placeholders = orderIds.map(() => '?').join(',');
    const { results: allItems } = await env.DB.prepare(`
      SELECT 
        oi.order_id, 
        oi.product_id as id, 
        oi.product_name as name, 
        oi.price, 
        oi.quantity, 
        oi.unit, 
        oi.subtotal,
        COALESCE(p.image, '') as image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (${placeholders})
    `).bind(...orderIds).all();

    const itemsByOrderId: Record<string, any[]> = {};
    (allItems || []).forEach((itm: any) => {
      if (!itemsByOrderId[itm.order_id]) {
        itemsByOrderId[itm.order_id] = [];
      }
      itemsByOrderId[itm.order_id].push({
        id: itm.id,
        name: itm.name,
        price: Number(itm.price),
        quantity: Number(itm.quantity),
        unit: itm.unit || '',
        image: itm.image || '',
        subtotal: Number(itm.subtotal),
      });
    });

    const ordersWithItems = orders.map((o: any) => ({
      orderId: o.orderId,
      id: o.id,
      customer: {
        fullName: o.customer_name,
        phone: o.customer_phone,
        district: o.district,
        area: o.area,
        address: o.delivery_address,
        notes: o.notes || '',
      },
      items: itemsByOrderId[o.id] || [],
      subtotal: Number(o.subtotal),
      deliveryCharge: Number(o.deliveryCharge),
      discount: Number(o.discount || 0),
      total: Number(o.total),
      paymentMethod: o.paymentMethod,
      paymentNumber: o.paymentNumber,
      trxId: o.trxId,
      paymentStatus: o.paymentStatus,
      status: o.status === 'pending' ? 'placed' : o.status,
      createdAt: o.createdAt,
    }));

    return jsonResponse({
      success: true,
      count: ordersWithItems.length,
      data: ordersWithItems,
    }, 200, {}, request);
  } catch (e: any) {
    console.error('Failed to list orders from D1:', e);
    return errorResponse('অর্ডার তালিকা লোড করতে ব্যর্থ হয়েছে: ' + (e?.message || 'DB Error'), 500, undefined, request);
  }
}

/**
 * POST /api/orders
 * Customer order submission with atomic D1 batch transaction
 */
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // 1. Mandatory D1 Database availability check
  // Never confirm order if database connection is unavailable
  if (!env.DB) {
    return errorResponse('ডাটাবেজ সংযোগ পাওয়া যায়নি। অর্ডার সংরক্ষণ করা সম্ভব হয়নি।', 500, undefined, request);
  }

  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return errorResponse('অনুরোধের তথ্য সঠিক ফরম্যাটে প্রদান করা হয়নি।', 400, undefined, request);
    }

    const { customer, items, paymentMethod, paymentNumber, trxId } = body || {};

    // 2. Validate customer information
    if (!customer || !customer.fullName || !customer.phone || !customer.address) {
      return errorResponse('গ্রাহকের নাম, মোবাইল নম্বর এবং সম্পূর্ণ ডেলিভারি ঠিকানা আবশ্যক।', 400, undefined, request);
    }

    // Normalize phone number (handle +880 or 880 prefix)
    let phoneClean = String(customer.phone).replace(/[^0-9]/g, '');
    if (phoneClean.startsWith('880')) {
      phoneClean = phoneClean.slice(2);
    }
    if (phoneClean.length !== 11 || !phoneClean.startsWith('01')) {
      return errorResponse('সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর প্রদান করুন (যেমন: 01712334707)।', 400, undefined, request);
    }

    // 3. Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse('কার্টে কমপক্ষে একটি পণ্য থাকা আবশ্যক।', 400, undefined, request);
    }

    // 4. Server-side product, category, and price verification
    let calculatedSubtotal = 0;
    const verifiedItems: any[] = [];

    // Ensure a default fallback category exists in D1 for foreign key safety
    let defaultCategoryId = 'cat-1';
    try {
      const catCheck: any = await env.DB.prepare('SELECT id FROM categories WHERE id = "cat-1" OR slug = "grocery" LIMIT 1').first();
      if (catCheck && catCheck.id) {
        defaultCategoryId = catCheck.id;
      }
    } catch {}

    for (const item of items) {
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      let unitPrice = Number(item.price);
      let productName = item.name || 'পণ্য';
      let unit = item.unit || '১ পিস';
      let imageUrl = item.image || '';
      let validProductId = String(item.id || '');

      // Query product in D1
      const dbProduct: any = await env.DB.prepare(
        'SELECT id, name, price, stock, is_available, unit, image FROM products WHERE id = ? OR slug = ?'
      ).bind(item.id, item.id).first();

      if (dbProduct) {
        if (!dbProduct.is_available || (dbProduct.stock !== null && dbProduct.stock < quantity)) {
          return errorResponse(`দুঃখিত, "${dbProduct.name}" বর্তমানে পর্যাপ্ত স্টকে নেই।`, 409, undefined, request);
        }
        validProductId = dbProduct.id;
        unitPrice = Number(dbProduct.price);
        productName = dbProduct.name;
        unit = dbProduct.unit || unit;
        imageUrl = dbProduct.image || imageUrl;
      } else {
        // If product does not exist in D1 yet, insert it with valid category_id to satisfy foreign key
        const safeSlug = `prod-${validProductId.toLowerCase().replace(/[^a-z0-9]/g, '-') || Date.now()}`;
        await env.DB.prepare(`
          INSERT OR IGNORE INTO products (
            id, name, slug, category_id, price, unit, image, stock, is_available
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 100, 1)
        `).bind(
          validProductId,
          productName,
          safeSlug,
          defaultCategoryId,
          unitPrice > 0 ? unitPrice : 100,
          unit,
          imageUrl || '/images/default.jpg'
        ).run().catch((e) => {
          console.warn('Notice: Product auto-seed notice:', e);
        });
      }

      if (unitPrice <= 0 || isNaN(unitPrice)) {
        return errorResponse(`"${productName}" এর মূল্য সঠিক নয়।`, 400, undefined, request);
      }

      const itemSubtotal = unitPrice * quantity;
      calculatedSubtotal += itemSubtotal;

      verifiedItems.push({
        id: validProductId,
        name: productName,
        price: unitPrice,
        quantity,
        unit,
        image: imageUrl,
        subtotal: itemSubtotal,
      });
    }

    // 5. Delivery charge calculation
    const districtClean = String(customer.district || 'ঢাকা').trim();
    const isDhaka = districtClean === 'ঢাকা' || districtClean.toLowerCase().includes('dhaka');
    let deliveryCharge = isDhaka ? 60 : 120;

    try {
      const threshold: any = await env.DB.prepare("SELECT value FROM settings WHERE key = 'free_delivery_threshold'").first();
      if (threshold && calculatedSubtotal >= Number(threshold.value)) {
        deliveryCharge = 0;
      } else {
        const chargeKey = isDhaka ? 'delivery_charge_dhaka' : 'delivery_charge_outside';
        const chargeSetting: any = await env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind(chargeKey).first();
        if (chargeSetting) {
          deliveryCharge = Number(chargeSetting.value);
        }
      }
    } catch {
      // Use fallback rates
      if (calculatedSubtotal >= 2500) {
        deliveryCharge = 0;
      }
    }

    const discount = Number(body.discount) || 0;
    const finalTotal = Math.max(0, calculatedSubtotal + deliveryCharge - discount);
    const orderNumber = generateOrderNumber();
    const orderId = `ord-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // 6. Resolve customer record safely to avoid ID or UNIQUE constraint collisions
    let actualCustomerId: string;
    let isExistingCustomer = false;

    try {
      const existingCust: any = await env.DB.prepare(
        'SELECT id FROM customers WHERE phone = ?'
      ).bind(phoneClean).first();

      if (existingCust && existingCust.id) {
        actualCustomerId = existingCust.id;
        isExistingCustomer = true;
      } else {
        actualCustomerId = `cust-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
      }
    } catch {
      actualCustomerId = `cust-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    }

    // 7. Assemble Atomic Database Batch Statements
    const batchStatements: any[] = [];

    // 7a. Customer upsert
    if (isExistingCustomer) {
      batchStatements.push(
        env.DB.prepare(`
          UPDATE customers SET
            name = ?,
            address = ?,
            district = ?,
            area = ?,
            email = COALESCE(?, email),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(
          customer.fullName.trim(),
          customer.address.trim(),
          customer.district || 'ঢাকা',
          customer.area ? customer.area.trim() : '',
          customer.email ? customer.email.trim() : null,
          actualCustomerId
        )
      );
    } else {
      batchStatements.push(
        env.DB.prepare(`
          INSERT INTO customers (id, name, phone, email, district, area, address, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(
          actualCustomerId,
          customer.fullName.trim(),
          phoneClean,
          customer.email ? customer.email.trim() : null,
          customer.district || 'ঢাকা',
          customer.area ? customer.area.trim() : '',
          customer.address.trim()
        )
      );
    }

    // 7b. Insert order record
    const paymentStatusVal = paymentMethod === 'cod' ? 'pending' : (trxId ? 'pending_verification' : 'pending');
    batchStatements.push(
      env.DB.prepare(`
        INSERT INTO orders (
          id, order_number, customer_id, customer_name, customer_phone,
          district, area, delivery_address, subtotal, delivery_charge,
          discount, total, payment_method, payment_number, trx_id,
          payment_status, order_status, customer_note, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(
        orderId,
        orderNumber,
        actualCustomerId,
        customer.fullName.trim(),
        phoneClean,
        customer.district || 'ঢাকা',
        customer.area ? customer.area.trim() : '',
        customer.address.trim(),
        calculatedSubtotal,
        deliveryCharge,
        discount,
        finalTotal,
        paymentMethod || 'cod',
        paymentNumber ? paymentNumber.trim() : null,
        trxId ? trxId.trim() : null,
        paymentStatusVal,
        'placed',
        customer.notes ? customer.notes.trim() : null
      )
    );

    // 7c. Insert order items & reduce stock atomically
    for (let idx = 0; idx < verifiedItems.length; idx++) {
      const itm = verifiedItems[idx];
      const itemId = `item-${Date.now()}-${idx}-${crypto.randomUUID().slice(0, 6)}`;
      batchStatements.push(
        env.DB.prepare(`
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
        )
      );

      batchStatements.push(
        env.DB.prepare(`
          UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?
        `).bind(itm.quantity, itm.id)
      );
    }

    // 8. Execute batch transaction in D1
    // Success is only confirmed AFTER this atomic operation succeeds
    await env.DB.batch(batchStatements);

    // 9. Build response payload
    const createdOrder = {
      orderId: orderNumber,
      id: orderId,
      customer: {
        fullName: customer.fullName.trim(),
        phone: phoneClean,
        email: customer.email ? customer.email.trim() : undefined,
        district: customer.district || 'ঢাকা',
        area: customer.area ? customer.area.trim() : '',
        address: customer.address.trim(),
        notes: customer.notes ? customer.notes.trim() : undefined,
      },
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      deliveryCharge,
      discount,
      total: finalTotal,
      paymentMethod: paymentMethod || 'cod',
      paymentNumber,
      trxId,
      status: 'placed',
      createdAt: new Date().toISOString(),
      estimatedDelivery: '২-৩ কর্মদিবস',
    };

    return jsonResponse({
      success: true,
      message: 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে।',
      order: createdOrder,
    }, 201, {}, request);
  } catch (e: any) {
    console.error('Unhandled order submission error:', e);
    return errorResponse(
      'অর্ডার তৈরি করতে অপ্রত্যাশিত সমস্যা হয়েছে: ' + (e?.message || 'Transaction Failed'),
      500,
      undefined,
      request
    );
  }
}
