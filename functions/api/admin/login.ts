import { Env, errorResponse, jsonResponse, verifyPassword } from '../_utils';

export async function onRequestOptions(context: { request: Request }) {
  const origin = context.request.headers.get('Origin') || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return errorResponse('অনুরোধের তথ্য সঠিক নয়।', 400, undefined, request);
    }

    const { username, password } = body || {};

    if (!username || !password) {
      return errorResponse('ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন।', 400, undefined, request);
    }

    const cleanUser = String(username).trim();
    const cleanPass = String(password).trim();

    if (!env.DB) {
      // Offline/Local Development fallback without D1
      if (cleanUser === 'admin' && cleanPass === 'Tt0171718411688727') {
        const sessionToken = `pb-sess-${crypto.randomUUID()}`;
        return jsonResponse(
          {
            success: true,
            message: 'অ্যাডমিন লগইন সফল হয়েছে।',
            token: sessionToken,
            user: { id: 'adm-01', username: 'admin', role: 'admin' },
          },
          200,
          {},
          request
        );
      } else if (cleanUser === 'moderator' && cleanPass === '01717184116') {
        const sessionToken = `pb-sess-mod-${crypto.randomUUID()}`;
        return jsonResponse(
          {
            success: true,
            message: 'মডারেটর লগইন সফল হয়েছে।',
            token: sessionToken,
            user: { id: 'adm-02', username: 'moderator', role: 'moderator' },
          },
          200,
          {},
          request
        );
      }
      return errorResponse('ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে।', 401, undefined, request);
    }

    let adminRecord: any = await env.DB.prepare(
      'SELECT id, username, password_hash, role FROM admins WHERE username = ?'
    ).bind(cleanUser).first();

    // Auto-seed admin or moderator if not yet present in D1
    if (!adminRecord) {
      if (cleanUser === 'moderator') {
        const modHash = 'pbdevsalt2026:c08c589c7588769519b782ca579c0aaddaa6d5869cfaa70875c69969c794be93';
        await env.DB.prepare(
          'INSERT OR IGNORE INTO admins (id, username, password_hash, role) VALUES (?, ?, ?, ?)'
        ).bind('adm-02', 'moderator', modHash, 'moderator').run().catch(() => {});
        adminRecord = await env.DB.prepare(
          'SELECT id, username, password_hash, role FROM admins WHERE username = ?'
        ).bind('moderator').first();
      } else if (cleanUser === 'admin') {
        const admHash = 'pbdevsalt2026:2240fde2ce7fe263c486076ac52389fc95f11f88a98956716fd58f1bbac9c575';
        await env.DB.prepare(
          'INSERT OR IGNORE INTO admins (id, username, password_hash, role) VALUES (?, ?, ?, ?)'
        ).bind('adm-01', 'admin', admHash, 'admin').run().catch(() => {});
        adminRecord = await env.DB.prepare(
          'SELECT id, username, password_hash, role FROM admins WHERE username = ?'
        ).bind('admin').first();
      }
    }

    if (!adminRecord || !adminRecord.password_hash) {
      return errorResponse('ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে।', 401, undefined, request);
    }

    const isValid = await verifyPassword(cleanPass, adminRecord.password_hash);
    if (!isValid) {
      return errorResponse('ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে।', 401, undefined, request);
    }

    // Generate Session Token
    const sessionToken = `pb-sess-${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await env.DB.prepare(
      'INSERT INTO sessions (admin_id, token, expires_at) VALUES (?, ?, ?)'
    ).bind(adminRecord.id, sessionToken, expiresAt).run();

    const isHttps = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';
    const secureFlag = isHttps ? '; Secure' : '';
    const cookie = `pb_session=${sessionToken}; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax${secureFlag}`;

    return jsonResponse(
      {
        success: true,
        message: 'লগইন সফল হয়েছে।',
        token: sessionToken,
        user: {
          id: adminRecord.id,
          username: adminRecord.username,
          role: adminRecord.role || 'admin',
        },
      },
      200,
      {
        'Set-Cookie': cookie,
      },
      request
    );
  } catch (e: any) {
    return errorResponse('লগইন প্রক্রিয়ায় ত্রুটি হয়েছে: ' + (e?.message || 'Error'), 500, undefined, request);
  }
}
