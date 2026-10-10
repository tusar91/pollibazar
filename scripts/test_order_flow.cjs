const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

console.log('=== TEST SUITE: POLLIBAZAR D1 ORDER LIFECYCLE & INTEGRITY ===');

// 1. Initialize SQLite database and apply migrations
const db = new DatabaseSync(':memory:');
db.exec(fs.readFileSync('migrations/0001_initial.sql', 'utf8'));
db.exec(fs.readFileSync('migrations/0002_update_admin_password_and_clean_sample_data.sql', 'utf8'));
db.exec(fs.readFileSync('migrations/0003_add_moderator_and_roles.sql', 'utf8'));
console.log('✓ Loaded migrations 0001, 0002, 0003');

// 2. Verify Admin and Moderator Roles & Accounts
const admin = db.prepare('SELECT id, username, role FROM admins WHERE username = ?').get('admin');
const mod = db.prepare('SELECT id, username, role FROM admins WHERE username = ?').get('moderator');
console.log('✓ Admin account:', admin);
console.log('✓ Moderator account:', mod);

if (!admin || admin.role !== 'admin') throw new Error('Admin role verification failed');
if (!mod || mod.role !== 'moderator') throw new Error('Moderator role verification failed');

// 3. Test Order Creation & Batch Transaction
const testOrderId = 'ord-test-lifecycle-01';
const testOrderNumber = 'PB-20261010-7777';
const phone = '01712334707';
const customerId = 'cust-test-77';

// 3a. Customer insert
db.prepare(`
  INSERT INTO customers (id, name, phone, email, district, area, address, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`).run(customerId, 'হাসান মাহমুদ', phone, null, 'ঢাকা', 'মিরপুর', 'মিরপুর-২, ঢাকা');

// 3b. Order insert
db.prepare(`
  INSERT INTO orders (
    id, order_number, customer_id, customer_name, customer_phone,
    district, area, delivery_address, subtotal, delivery_charge,
    discount, total, payment_method, payment_number, trx_id,
    payment_status, order_status, customer_note, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`).run(
  testOrderId,
  testOrderNumber,
  customerId,
  'হাসান মাহমুদ',
  phone,
  'ঢাকা',
  'মিরপুর',
  'মিরপুর-২, ঢাকা',
  375,
  60,
  0,
  435,
  'cod',
  null,
  null,
  'pending',
  'placed',
  'টেস্ট অর্ডার'
);

// 3c. Order item insert
db.prepare(`
  INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity, unit, subtotal)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run('item-test-01', testOrderId, 'pb-01', 'মিনিকেট চাল (প্রিমিয়াম সিল্কি পলিশ)', 375, 1, '৫ কেজি বস্তা', 375);

// 3d. Stock reduction
db.prepare(`UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?`).run(1, 'pb-01');

console.log('✓ Order and items successfully committed to database');

// 4. Test Admin Order-List API Query
const query = `
  SELECT 
    o.id, o.order_number as orderId, o.customer_id, o.customer_name, o.customer_phone,
    o.district, o.area, o.delivery_address, o.subtotal, o.delivery_charge as deliveryCharge,
    o.discount, o.total, o.payment_method as paymentMethod, o.payment_number as paymentNumber,
    o.trx_id as trxId, o.payment_status as paymentStatus, o.order_status as status,
    o.customer_note as notes, o.created_at as createdAt
  FROM orders o
  WHERE 1=1
  ORDER BY o.created_at DESC LIMIT 10 OFFSET 0
`;
const orders = db.prepare(query).all();
console.log('✓ Admin retrieved orders count:', orders.length);
if (orders.length !== 1) throw new Error('Expected 1 order');
const ord = orders[0];
if (ord.orderId !== testOrderNumber) throw new Error('Order number mismatch');

// Verify order_items join with product image
const items = db.prepare(`
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
  WHERE oi.order_id = ?
`).all(ord.id);
console.log('✓ Retrieved order items:', items);
if (items.length !== 1 || items[0].name !== 'মিনিকেট চাল (প্রিমিয়াম সিল্কি পলিশ)') {
  throw new Error('Order item verification failed');
}

// 5. Test Moderator Status Update
db.prepare(`
  UPDATE orders SET 
    order_status = ?, 
    updated_at = CURRENT_TIMESTAMP 
  WHERE id = ?
`).run('confirmed', testOrderId);

const updatedOrd = db.prepare('SELECT order_status FROM orders WHERE id = ?').get(testOrderId);
console.log('✓ Moderator updated order status to:', updatedOrd.order_status);
if (updatedOrd.order_status !== 'confirmed') throw new Error('Status update check failed');

// 6. Test Repeat Customer (Updating existing customer without ID collision)
const existingCust = db.prepare('SELECT id FROM customers WHERE phone = ?').get(phone);
console.log('✓ Found existing customer for repeat order:', existingCust.id);
db.prepare(`
  UPDATE customers SET 
    name = ?, 
    address = ?, 
    updated_at = CURRENT_TIMESTAMP 
  WHERE id = ?
`).run('হাসান মাহমুদ (আপডেট)', 'মিরপুর-১০, ঢাকা', existingCust.id);

const updatedCust = db.prepare('SELECT name, address FROM customers WHERE id = ?').get(existingCust.id);
console.log('✓ Successfully updated existing customer:', updatedCust);

// 7. Cleanup test data
db.prepare('DELETE FROM order_items WHERE order_id = ?').run(testOrderId);
db.prepare('DELETE FROM orders WHERE id = ?').run(testOrderId);
db.prepare('DELETE FROM customers WHERE id = ?').run(customerId);

const finalOrderCount = db.prepare('SELECT count(*) as c FROM orders').get().c;
console.log('✓ Test order cleanly removed. Remaining orders in DB:', finalOrderCount);

console.log('=== ALL TESTS PASSED SUCCESSFULLY ===');
