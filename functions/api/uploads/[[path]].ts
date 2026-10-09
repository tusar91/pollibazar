import { Env } from '../_utils';

export async function onRequestGet(context: { params: { path: string | string[] }; env: Env; request: Request }) {
  const { params, env, request } = context;

  const rawPath = params.path;
  const pathParts = Array.isArray(rawPath) ? rawPath : [rawPath];
  const key = pathParts.filter(Boolean).join('/');

  if (!key) {
    return new Response('File path missing', { status: 400 });
  }

  // 1. If Cloudflare R2 bucket is bound, serve from R2
  if (env.IMAGES_BUCKET) {
    try {
      const object = await env.IMAGES_BUCKET.get(key);
      if (!object) {
        return new Response('ছবিটি R2 স্টোরেজে পাওয়া যায়নি।', { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('Access-Control-Allow-Origin', '*');

      return new Response(object.body, {
        headers,
        status: 200,
      });
    } catch (err: any) {
      console.error('Error fetching image from R2:', err);
      return new Response('R2 স্টোরেজ থেকে ছবি লোড করতে সমস্যা হয়েছে।', { status: 500 });
    }
  }

  // 2. If R2 is not configured in this deployment
  return new Response(
    'Cloudflare R2 স্টোরেজ বাকেট সংযুক্ত নয়। অনুগ্রহ করে wrangler.toml এ IMAGES_BUCKET বাকেট যুক্ত করুন।',
    {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    }
  );
}
