import { Env, errorResponse, jsonResponse, verifyAdminSession } from '../_utils';

export async function onRequestGet(context: { env: Env }) {
  const { env } = context;

  if (env.DB) {
    try {
      const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
      const settingsMap: Record<string, string> = {};
      (results || []).forEach((row: any) => {
        settingsMap[row.key] = row.value;
      });

      return jsonResponse({
        success: true,
        data: settingsMap,
      });
    } catch (e: any) {
      console.error('Failed to get settings from D1:', e);
    }
  }

  // Fallback defaults
  return jsonResponse({
    success: true,
    data: {
      site_name: 'PolliBazar (পল্লি বাজার)',
      site_phone: '01712334707',
      site_email: 'ice.tusar@gmail.com',
      site_address: 'PolliBazar, Madhurkhola, Muksudpur, Dohar, Dhaka, Bangladesh',
      currency: '৳',
      delivery_charge_dhaka: '60',
      delivery_charge_outside: '120',
      free_delivery_threshold: '2500',
    },
  });
}

export async function onRequestPut(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const auth = await verifyAdminSession(request, env);
  if (!auth.isValid) {
    return errorResponse('অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।', 401);
  }

  try {
    const body: Record<string, any> = await request.json();

    if (env.DB) {
      for (const [key, value] of Object.entries(body)) {
        await env.DB.prepare(`
          INSERT INTO settings (key, value, updated_at)
          VALUES (?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        `).bind(key, String(value)).run();
      }
    }

    return jsonResponse({
      success: true,
      message: 'স্টোর সেটিংস সফলভাবে আপডেট করা হয়েছে।',
    });
  } catch (e: any) {
    return errorResponse('সেটিংস সংরক্ষণে ব্যর্থ হয়েছে: ' + (e?.message || 'Error'), 500);
  }
}
