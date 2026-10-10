const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

console.log('=== TEST SUITE: POLLIBAZAR D1 ORDER LIFECYCLE & COLUMN INTEGRITY ===');

// 1. Create SQLite DB simulating existing production database (WITHOUT is_available column)
const db = new DatabaseSync(':memory:');

// Create products table matching production schema (NO is_available column)
db.exec(`
  CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id TEXT NOT NULL,
    price REAL NOT NULL,
    old_price REAL,
    discount INTEGER DEFAULT 0,
    unit TEXT NOT NULL,
    image TEXT NOT NULL,
    gallery TEXT,
    short_description TEXT,
    description TEXT,
    rating REAL DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 10,
    origin TEXT,
    featured BOOLEAN DEFAULT 0,
    new_arrival BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    count INTEGER DEFAULT 0,
    description TEXT
  );

  CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    district TEXT NOT NULL,
    area TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    district TEXT NOT NULL,
    area TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    subtotal REAL NOT NULL,
    delivery_charge REAL NOT NULL,
    discount REAL DEFAULT 0,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL,
    payment_number TEXT,
    trx_id TEXT,
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'pending',
    customer_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT,
    subtotal REAL NOT NULL
  );

  CREATE TABLE admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert initial categories and sample products
db.exec(`
  INSERT INTO categories (id, name, name_en, slug, icon, count, description)
  VALUES ('cat-1', 'মুদি', 'Grocery', 'grocery', 'ShoppingBasket', 8, 'নিত্যপণ্য');

  INSERT INTO products (id, name, slug, category_id, price, unit, image, stock)
  VALUES 
    ('pb-01', 'মিনিকেট চাল', 'miniket-rice', 'cat-1', 375, '৫ কেজি বস্তা', '/img/rice.jpg', 50),
    ('pb-02', 'সরিষার তেল', 'mustard-oil', 'cat-1', 220, '১ লিটার বোতল', '/img/oil.jpg', 0),
    ('pb-03', 'খেজুর গুড়', 'date-jaggery', 'cat-1', 350, '১ কেজি হাড়ি', '/img/gur.jpg', 10);

  INSERT INTO settings (key, value) VALUES ('free_delivery_threshold', '2500');
`);

console.log('✓ Successfully created production-equivalent schema (WITHOUT status or is_available columns)');

// 2. Test Product Query in functions/api/orders/index.ts
// Verify that the query no longer fails with "no such column: status" or "is_available"
const queriedProduct = db.prepare(
  'SELECT id, name, price, stock, unit, image FROM products WHERE id = ? OR slug = ?'
).get('pb-01', 'pb-01');

console.log('✓ Product query executed without column errors:', queriedProduct);
if (!queriedProduct || queriedProduct.name !== 'মিনিকেট চাল') {
  throw new Error('Product query failed');
}

// Test out-of-stock product validation
const outOfStockProduct = db.prepare(
  'SELECT id, name, price, stock, unit, image FROM products WHERE id = ? OR slug = ?'
).get('pb-02', 'pb-02');
const hasOosStock = outOfStockProduct.stock !== null && outOfStockProduct.stock !== undefined ? outOfStockProduct.stock >= 1 : true;
const isOosAvailable = outOfStockProduct.stock !== null && outOfStockProduct.stock !== undefined ? outOfStockProduct.stock > 0 : true;
console.log('✓ Out of stock check:', { isOosAvailable, hasOosStock });
if (hasOosStock !== false || isOosAvailable !== false) throw new Error('Out of stock check should report false');

// Test available in-stock product validation
const availableProduct = db.prepare(
  'SELECT id, name, price, stock, unit, image FROM products WHERE id = ? OR slug = ?'
).get('pb-03', 'pb-03');
const hasAvailStock = availableProduct.stock !== null && availableProduct.stock !== undefined ? availableProduct.stock >= 1 : true;
const isProductAvailable = availableProduct.stock !== null && availableProduct.stock !== undefined ? availableProduct.stock > 0 : true;
console.log('✓ In-stock product check:', { isProductAvailable, hasAvailStock });
if (hasAvailStock !== true || isProductAvailable !== true) throw new Error('In-stock product check should report true');

// 3. Test Product Listing Query in functions/api/products/index.ts
const listQuery = `
  SELECT 
    p.id, p.name, p.slug, p.category_id as category, c.name as categoryName,
    p.price, p.old_price as oldPrice, p.discount, p.unit, p.image, p.gallery,
    p.short_description as shortDescription, p.description, p.rating, 
    p.review_count as reviewCount, p.stock,
    (CASE WHEN p.stock IS NULL OR p.stock > 0 THEN 1 ELSE 0 END) as inStock,
    p.origin, p.featured, p.new_arrival as newArrival
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.slug
  ORDER BY p.id ASC
`;
const listedProducts = db.prepare(listQuery).all();
console.log('✓ Listed products count from D1:', listedProducts.length);
if (listedProducts.length !== 3) throw new Error('Expected 3 products');
console.log('✓ inStock flags calculated accurately based on stock column:', listedProducts.map(p => ({ name: p.name, inStock: p.inStock, stock: p.stock })));

// 4. Test Order Submission Batch Transaction
const testOrderId = 'ord-verify-col-01';
const testOrderNumber = 'PB-20261010-8888';
const phone = '01712334707';
const customerId = 'cust-test-88';

// Run batch simulation
db.prepare(`
  INSERT INTO customers (id, name, phone, email, district, area, address, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`).run(customerId, 'কবির হোসেন', phone, null, 'ঢাকা', 'ধানমন্ডি', 'ধানমন্ডি ৩২');

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
  'কবির হোসেন',
  phone,
  'ঢাকা',
  'ধানমন্ডি',
  'ধানমন্ডি ৩২',
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

db.prepare(`
  INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity, unit, subtotal)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run('item-test-88', testOrderId, 'pb-01', 'মিনিকেট চাল', 375, 1, '৫ কেজি বস্তা', 375);

db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?').run(1, 'pb-01');

console.log('✓ Order and items successfully committed to database');

// Verify stock was decremented from 50 to 49
const updatedProduct = db.prepare('SELECT stock FROM products WHERE id = ?').get('pb-01');
console.log('✓ Updated product stock:', updatedProduct.stock);
if (updatedProduct.stock !== 49) throw new Error('Stock decrement failed');

// 5. Verify Admin Order List API Query
const adminOrderQuery = `
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
const adminOrders = db.prepare(adminOrderQuery).all();
console.log('✓ Admin retrieved orders count:', adminOrders.length);
if (adminOrders.length !== 1) throw new Error('Admin order retrieval failed');

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
`).all(adminOrders[0].id);

console.log('✓ Retrieved order items:', items);
if (items.length !== 1 || items[0].name !== 'মিনিকেট চাল') {
  throw new Error('Order item query failed');
}

// 6. Test applying migration 0004 (ALTER TABLE products ADD COLUMN is_available BOOLEAN DEFAULT 1)
db.exec(fs.readFileSync('migrations/0004_add_is_available_to_products.sql', 'utf8'));
const columnCheck = db.prepare("PRAGMA table_info(products)").all();
const hasIsAvailableCol = columnCheck.some(c => c.name === 'is_available');
console.log('✓ Tested Migration 0004 execution - column exists:', hasIsAvailableCol);
if (!hasIsAvailableCol) throw new Error('Migration 0004 failed to add column');

// Cleanup test records
db.prepare('DELETE FROM order_items WHERE order_id = ?').run(testOrderId);
db.prepare('DELETE FROM orders WHERE id = ?').run(testOrderId);
db.prepare('DELETE FROM customers WHERE id = ?').run(customerId);

console.log('=== ALL TESTS PASSED WITH 0 ERRORS ===');
