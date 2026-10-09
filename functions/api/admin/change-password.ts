import { Env, errorResponse, hashPassword, jsonResponse, verifyAdminSession, verifyPassword } from '../_utils';

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
    // 1. Confirm that the user is currently authenticated using the existing session system
    const auth = await verifyAdminSession(request, env);
    if (!auth.isValid || !auth.adminId) {
      return errorResponse('অননুমোদিত অনুরোধ। পাসওয়ার্ড পরিবর্তন করতে অনুগ্রহ করে প্রথমে অ্যাডমিন প্যানেলে লগইন করুন।', 401, undefined, request);
    }

    if (!env.DB) {
      return errorResponse('ডাটাবেজ সংযোগ পাওয়া যায়নি।', 500, undefined, request);
    }

    // 2. Parse request payload
    let body: any;
    try {
      body = await request.json();
    } catch {
      return errorResponse('অনুরোধের তথ্য সঠিক ফরম্যাটে প্রদান করা হয়নি।', 400, undefined, request);
    }

    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword.trim() : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword.trim() : '';
    const confirmPassword = typeof body?.confirmPassword === 'string' ? body.confirmPassword.trim() : '';

    // 3. New password validation checks
    if (!currentPassword) {
      return errorResponse('বর্তমান পাসওয়ার্ড প্রদান করুন।', 400, undefined, request);
    }

    if (!newPassword) {
      return errorResponse('নতুন পাসওয়ার্ড প্রদান করুন।', 400, undefined, request);
    }

    if (!confirmPassword) {
      return errorResponse('নতুন পাসওয়ার্ড নিশ্চিতকরণ (কনফার্মেশন) প্রদান করুন।', 400, undefined, request);
    }

    if (newPassword !== confirmPassword) {
      return errorResponse('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না। দয়া করে নিশ্চিত করুন দুটি পাসওয়ার্ড একই।', 400, undefined, request);
    }

    if (newPassword.length < 8) {
      return errorResponse('নতুন পাসওয়ার্ডটি অবশ্যই কমপক্ষে ৮ অক্ষরের হতে হবে।', 400, undefined, request);
    }

    if (currentPassword === newPassword) {
      return errorResponse('নতুন পাসওয়ার্ডটি বর্তমান পাসওয়ার্ড থেকে ভিন্ন হতে হবে। একটি নতুন পাসওয়ার্ড নির্বাচন করুন।', 400, undefined, request);
    }

    // 4. Retrieve existing password hash and verify current password against D1
    let adminRecord: any = null;

    // 4a. If auth from verifyAdminSession already retrieved the joined admin record, use it
    if (auth.passwordHash) {
      adminRecord = {
        id: auth.adminId,
        username: auth.username,
        password_hash: auth.passwordHash,
        role: auth.role,
      };
    }

    // 4b. If not populated in auth, query by session token
    if (!adminRecord || !adminRecord.password_hash) {
      if (auth.token) {
        adminRecord = await env.DB.prepare(
          `SELECT a.id, a.username, a.password_hash, a.role
           FROM sessions s
           JOIN admins a ON s.admin_id = a.id
           WHERE s.token = ?`
        ).bind(auth.token).first();
      }
    }

    // 4c. Or query by verified adminId
    if (!adminRecord || !adminRecord.password_hash) {
      adminRecord = await env.DB.prepare(
        'SELECT id, username, password_hash, role FROM admins WHERE id = ?'
      ).bind(auth.adminId).first();
    }

    if (!adminRecord || !adminRecord.password_hash) {
      return errorResponse('অ্যাডমিন অ্যাকাউন্ট তথ্য পাওয়া যায়নি।', 404, undefined, request);
    }

    // Verify the Current Password using the exact same Web Crypto SHA-256 with salt verification
    const isCurrentPasswordCorrect = await verifyPassword(currentPassword, adminRecord.password_hash);
    if (!isCurrentPasswordCorrect) {
      return errorResponse('বর্তমান পাসওয়ার্ডটি সঠিক নয়। দয়া করে সঠিক পাসওয়ার্ড প্রদান করুন।', 400, undefined, request);
    }

    // 5. Hash the new password using the SAME secure hashing method
    const newPasswordHash = await hashPassword(newPassword);

    // 6. Update ONLY the authenticated administrator's password_hash using a parameterized query
    // Keep username, role, and other records completely untouched
    await env.DB.prepare(
      'UPDATE admins SET password_hash = ? WHERE id = ?'
    ).bind(newPasswordHash, adminRecord.id).run();

    // 7. Invalidate sessions for this admin in D1 and require a fresh login
    try {
      await env.DB.prepare('DELETE FROM sessions WHERE admin_id = ?').bind(adminRecord.id).run();
    } catch (sessionErr) {
      console.warn('Session invalidation warning:', sessionErr);
    }

    // Clear session cookie
    const isHttps = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';
    const secureAttr = isHttps ? '; Secure' : '';
    const clearCookie = `pb_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secureAttr}`;

    return jsonResponse(
      {
        success: true,
        message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে পুনরায় লগইন করুন।',
        requireLogin: true,
      },
      200,
      {
        'Set-Cookie': clearCookie,
      },
      request
    );
  } catch (e: any) {
    // Avoid logging or leaking sensitive password or query data
    return errorResponse('পাসওয়ার্ড পরিবর্তন প্রক্রিয়ায় অপ্রত্যাশিত ত্রুটি ঘটেছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।', 500, undefined, request);
  }
}
