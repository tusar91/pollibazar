import { Env, errorResponse, jsonResponse, verifyAdminSession } from '../_utils';

export async function onRequestOptions(context: { request: Request }) {
  const origin = context.request.headers.get('Origin') || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const auth = await verifyAdminSession(request, env);

  if (!auth.isValid || !auth.adminId) {
    return errorResponse('সেশন মেয়াদোত্তীর্ণ বা অননুমোদিত।', 401, undefined, request);
  }

  // Never return password hash to frontend (Requirement 11)
  return jsonResponse(
    {
      success: true,
      authenticated: true,
      admin: {
        id: auth.adminId,
        username: auth.username,
        role: auth.role || 'admin',
      },
    },
    200,
    {},
    request
  );
}
