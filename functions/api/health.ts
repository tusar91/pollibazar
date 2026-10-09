import { Env, jsonResponse } from './_utils';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context;
  let dbStatus = 'disconnected';

  if (env.DB) {
    try {
      const result = await env.DB.prepare('SELECT 1 as test').first();
      if (result && result.test === 1) {
        dbStatus = 'connected';
      }
    } catch (e: any) {
      dbStatus = 'error: ' + (e?.message || 'failed to query D1');
    }
  }

  return jsonResponse({
    success: true,
    service: 'PolliBazar API',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    environment: env.ENVIRONMENT || 'production',
  });
}

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}
