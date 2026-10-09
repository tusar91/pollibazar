import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function devApiPlugin(): Plugin {
  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/admin/login' && req.method === 'POST') {
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

        if (req.url === '/api/admin/me' && req.method === 'GET') {
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

        if (req.url === '/api/admin/logout' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, message: 'Logged out' }));
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
