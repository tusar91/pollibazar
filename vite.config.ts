import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

// In-memory store for dev server API emulation
const devOrders: any[] = [];

function devApiPlugin(): Plugin {
  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        const pathname = url.pathname;

        // 1. Admin Login
        if (pathname === '/api/admin/login' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { username, password } = JSON.parse(body || '{}');
              const u = String(username || '').trim();
              const p = String(password || '').trim();

              if (u === 'admin' && p === 'Tt0171718411688727') {
                const token = `pb-sess-${Date.now()}`;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: true,
                    message: 'লগইন সফল হয়েছে।',
                    token,
                    user: { id: 'adm-01', username: 'admin', role: 'admin' },
                  })
                );
                return;
              } else if (u === 'moderator' && p === '01717184116') {
                const token = `pb-sess-mod-${Date.now()}`;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: true,
                    message: 'মডারেটর লগইন সফল হয়েছে।',
                    token,
                    user: { id: 'adm-02', username: 'moderator', role: 'moderator' },
                  })
                );
                return;
              } else {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    error: 'ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে। সঠিক তথ্য দিয়ে চেষ্টা করুন।',
                  })
                );
                return;
              }
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Invalid JSON request' }));
            }
          });
          return;
        }

        // 2. Admin Session Me
        if (pathname === '/api/admin/me' && req.method === 'GET') {
          const auth = String(req.headers['authorization'] || '');
          const isMod = auth.includes('pb-sess-mod');
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              success: true,
              authenticated: true,
              admin: {
                id: isMod ? 'adm-02' : 'adm-01',
                username: isMod ? 'moderator' : 'admin',
                role: isMod ? 'moderator' : 'admin',
              },
            })
          );
          return;
        }

        // 3. Admin Logout
        if (pathname === '/api/admin/logout' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, message: 'Logged out' }));
          return;
        }

        // 4. Create Order (POST /api/orders)
        if (pathname === '/api/orders' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              const { customer, items, subtotal, deliveryCharge, discount, total, paymentMethod } = payload;

              if (!customer || !customer.fullName || !customer.phone || !customer.address) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'গ্রাহকের নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা আবশ্যক।' }));
                return;
              }

              if (!items || !Array.isArray(items) || items.length === 0) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'কার্টে কমপক্ষে একটি পণ্য থাকা আবশ্যক।' }));
                return;
              }

              const now = new Date();
              const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
              const randomSeq = String(Math.floor(1000 + Math.random() * 9000));
              const orderId = `PB-${ymd}-${randomSeq}`;

              const verifiedItems = items.map((i: any) => ({
                id: String(i.id || ''),
                name: String(i.name || 'পণ্য'),
                price: Number(i.price) || 0,
                quantity: Number(i.quantity) || 1,
                unit: String(i.unit || '১ পিস'),
                image: String(i.image || ''),
                subtotal: (Number(i.price) || 0) * (Number(i.quantity) || 1),
              }));

              const newOrder = {
                orderId,
                id: `ord-${Date.now()}`,
                customer: {
                  fullName: customer.fullName.trim(),
                  phone: customer.phone.trim(),
                  email: customer.email || '',
                  district: customer.district || 'ঢাকা',
                  area: customer.area || '',
                  address: customer.address.trim(),
                  notes: customer.notes || '',
                },
                items: verifiedItems,
                subtotal: Number(subtotal) || 0,
                deliveryCharge: Number(deliveryCharge) || 0,
                discount: Number(discount) || 0,
                total: Number(total) || 0,
                paymentMethod: paymentMethod || 'cod',
                paymentNumber: payload.paymentNumber || '',
                trxId: payload.trxId || '',
                status: 'placed',
                createdAt: now.toISOString(),
                estimatedDelivery: '২-৩ কর্মদিবস',
              };

              devOrders.unshift(newOrder);

              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  message: 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে।',
                  order: newOrder,
                })
              );
              return;
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
            }
          });
          return;
        }

        // 5. Get Orders (GET /api/orders or /api/admin/orders)
        if ((pathname === '/api/orders' || pathname === '/api/admin/orders') && req.method === 'GET') {
          const statusParam = url.searchParams.get('status');
          const searchParam = url.searchParams.get('search');

          let filtered = [...devOrders];
          if (statusParam && statusParam !== 'all') {
            filtered = filtered.filter((o) => o.status === statusParam);
          }
          if (searchParam) {
            const q = searchParam.toLowerCase();
            filtered = filtered.filter(
              (o) =>
                o.orderId.toLowerCase().includes(q) ||
                o.customer.fullName.toLowerCase().includes(q) ||
                o.customer.phone.includes(q)
            );
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              success: true,
              count: filtered.length,
              data: filtered,
            })
          );
          return;
        }

        // 6. Track Order (POST /api/orders/track)
        if (pathname === '/api/orders/track' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { orderNumber, phone } = JSON.parse(body || '{}');
              const cleanNum = String(orderNumber || '').trim().toUpperCase();
              const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');

              const matched = devOrders.find((o) => {
                const idMatch = cleanNum ? o.orderId.toUpperCase() === cleanNum : true;
                const phoneMatch = cleanPhone ? o.customer.phone.replace(/[^0-9]/g, '').includes(cleanPhone) : true;
                return cleanNum && cleanPhone ? idMatch && phoneMatch : cleanNum ? idMatch : phoneMatch;
              });

              if (matched) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, data: matched }));
              } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'উক্ত তথ্যের সাথে কোনো সক্রিয় অর্ডার পাওয়া যায়নি।' }));
              }
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Invalid tracking request' }));
            }
          });
          return;
        }

        // 7. Update Order (PATCH /api/orders/:id)
        if (pathname.startsWith('/api/orders/') && req.method === 'PATCH') {
          const id = decodeURIComponent(pathname.replace('/api/orders/', ''));
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { status } = JSON.parse(body || '{}');
              const orderIdx = devOrders.findIndex((o) => o.orderId === id || o.id === id);
              if (orderIdx !== -1) {
                if (status) devOrders[orderIdx].status = status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, message: 'অর্ডারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।' }));
              } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'অর্ডার পাওয়া যায়নি।' }));
              }
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Invalid update body' }));
            }
          });
          return;
        }

        // 8. Delete Order (DELETE /api/orders/:id)
        if (pathname.startsWith('/api/orders/') && req.method === 'DELETE') {
          const id = decodeURIComponent(pathname.replace('/api/orders/', ''));
          const orderIdx = devOrders.findIndex((o) => o.orderId === id || o.id === id);
          if (orderIdx !== -1) {
            devOrders.splice(orderIdx, 1);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'অর্ডারটি সফলভাবে মুছে ফেলা হয়েছে।' }));
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'অর্ডার পাওয়া যায়নি।' }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), devApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname ?? '.', '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
