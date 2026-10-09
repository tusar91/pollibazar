import { Env, extractSessionTokens, jsonResponse } from '../_utils';

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

  const candidateTokens = extractSessionTokens(request);

  if (env.DB && candidateTokens.length > 0) {
    for (const token of candidateTokens) {
      try {
        await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
      } catch (e) {
        console.warn('Session delete error:', e);
      }
    }
  }

  const isHttps = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';
  const secureAttr = isHttps ? '; Secure' : '';
  const clearCookie = `pb_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secureAttr}`;

  return jsonResponse(
    {
      success: true,
      message: 'লগআউট সফল হয়েছে।',
    },
    200,
    {
      'Set-Cookie': clearCookie,
    },
    request
  );
}
