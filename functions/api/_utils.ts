// PolliBazar Cloudflare Pages Functions Utilities
// Compatible with Cloudflare Workers runtime, V8 Isolates, and Web Crypto API

export interface Env {
  DB?: any;
  IMAGES_BUCKET?: any; // Cloudflare R2 bucket binding
  ADMIN_SECRET?: string;
  ENVIRONMENT?: string;
}

export function jsonResponse(
  data: any,
  status = 200,
  headers: Record<string, string> = {},
  request?: Request
) {
  const origin = request?.headers.get('Origin') || '*';
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      ...headers,
    },
  });
}

export function errorResponse(
  message: string,
  status = 400,
  details?: any,
  request?: Request
) {
  return jsonResponse(
    {
      success: false,
      error: message,
      ...(details ? { details } : {}),
    },
    status,
    {},
    request
  );
}

// Web Crypto SHA-256 with Salt
export async function hashPassword(password: string, salt?: string): Promise<string> {
  const actualSalt = salt || crypto.randomUUID().replace(/-/g, '');
  const enc = new TextEncoder();
  const data = enc.encode(`${actualSalt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${actualSalt}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHash] = parts;
  const computed = await hashPassword(password, salt);
  const [, computedHash] = computed.split(':');
  return computedHash === expectedHash;
}

// Generate unique order number (e.g. PB-20261008-0042)
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
  return `PB-${year}${month}${day}-${randomSuffix}`;
}

export interface VerifiedAdminSession {
  isValid: boolean;
  adminId?: string;
  username?: string;
  role?: string;
  token?: string;
  sessionId?: string;
  passwordHash?: string;
}

/**
 * Extracts candidate session tokens from Request:
 * 1. pb_session HttpOnly cookie
 * 2. Authorization Bearer header
 */
export function extractSessionTokens(request: Request): string[] {
  const tokens: string[] = [];

  // 1. Extract from Cookie header (pb_session)
  const cookieHeader = request.headers.get('Cookie') || request.headers.get('cookie') || '';
  if (cookieHeader) {
    const cookies = cookieHeader.split(';');
    for (const raw of cookies) {
      const trimmed = raw.trim();
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (key === 'pb_session') {
          val = val.replace(/^["']|["']$/g, '').trim();
          try {
            val = decodeURIComponent(val);
          } catch {}
          if (val && !tokens.includes(val)) {
            tokens.push(val);
          }
        }
      }
    }
  }

  // 2. Extract from Authorization header
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization') || '';
  if (authHeader) {
    const cleanAuth = authHeader.trim();
    let bearerToken = '';
    if (/^Bearer\s+/i.test(cleanAuth)) {
      bearerToken = cleanAuth.replace(/^Bearer\s+/i, '').trim();
    } else if (!cleanAuth.includes(' ') && cleanAuth.length > 5) {
      bearerToken = cleanAuth;
    }
    bearerToken = bearerToken.replace(/^["']|["']$/g, '').trim();
    if (bearerToken && !tokens.includes(bearerToken)) {
      tokens.push(bearerToken);
    }
  }

  return tokens;
}

// Session Validation Helper
export async function verifyAdminSession(
  request: Request,
  env: Env
): Promise<VerifiedAdminSession> {
  const candidateTokens = extractSessionTokens(request);

  if (candidateTokens.length === 0) {
    return { isValid: false };
  }

  // If D1 is connected, check sessions table joined with admins
  if (env.DB) {
    for (const token of candidateTokens) {
      try {
        // Requirements 8, 9, 10:
        // 8. Verify that the session belongs to an existing record in the sessions table.
        // 9. Verify that the session's admin_id points to an existing record in the admins table.
        // 10. Retrieve the admin record securely from D1.
        const row: any = await env.DB.prepare(
          `SELECT 
             s.id AS session_id,
             s.admin_id,
             s.token,
             s.expires_at,
             a.id AS admin_record_id,
             a.username,
             a.password_hash,
             a.role
           FROM sessions s
           JOIN admins a ON s.admin_id = a.id
           WHERE s.token = ?`
        ).bind(token).first();

        if (row && row.admin_record_id) {
          // Verify expiration safely
          let isExpired = false;
          if (row.expires_at) {
            const expRaw = row.expires_at;
            let expMs = NaN;
            if (typeof expRaw === 'number') {
              expMs = expRaw < 1e11 ? expRaw * 1000 : expRaw;
            } else if (typeof expRaw === 'string') {
              if (/^\d+$/.test(expRaw.trim())) {
                const num = Number(expRaw.trim());
                expMs = num < 1e11 ? num * 1000 : num;
              } else {
                expMs = new Date(expRaw).getTime();
              }
            }
            if (!isNaN(expMs) && expMs < Date.now()) {
              isExpired = true;
            }
          }

          if (!isExpired) {
            return {
              isValid: true,
              adminId: String(row.admin_record_id),
              username: String(row.username),
              role: row.role ? String(row.role) : 'admin',
              token,
              sessionId: String(row.session_id),
              passwordHash: row.password_hash ? String(row.password_hash) : undefined,
            };
          }
        }
      } catch (e) {
        console.warn('Session verification error:', e);
      }
    }

    // When D1 is connected and no valid session was found in D1, reject
    return { isValid: false };
  }

  // When D1 is not bound, reject authentication - no mock fallbacks allowed
  return { isValid: false };
}
