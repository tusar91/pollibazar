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

    if (!env.DB) {
      return errorResponse('ডাটাবেজ সংযোগ পাওয়া যায়নি।', 500, undefined, request);
    }

    const adminRecord: any = await env.DB.prepare(
      'SELECT id, username, password_hash, role FROM admins WHERE username = ?'
    ).bind(String(username).trim()).first();

    if (!adminRecord || !adminRecord.password_hash) {
      return errorResponse('ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে।', 401, undefined, request);
    }

    const isValid = await verifyPassword(String(password).trim(), adminRecord.password_hash);
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
