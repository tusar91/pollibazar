import { Env, errorResponse, jsonResponse, verifyAdminSession } from '../_utils';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context;

  if (env.DB) {
    try {
      const { results } = await env.DB.prepare(
        'SELECT id, name, name_en as nameEn, slug, icon, count, description FROM categories ORDER BY id ASC'
      ).all();
      return jsonResponse({
        success: true,
        data: results || [],
      });
    } catch (e: any) {
      console.error('Failed to fetch categories from D1:', e);
    }
  }

  // Graceful fallback if D1 not yet provisioned
  return jsonResponse({
    success: true,
    data: [
      { id: 'cat-1', name: 'মুদি', nameEn: 'Grocery', slug: 'grocery', icon: 'ShoppingBasket', count: 8, description: 'তেল, ডাল, চিনি, লবণ ও প্রাত্যহিক রান্নার নিত্যপণ্য' },
      { id: 'cat-2', name: 'চাল', nameEn: 'Rice', slug: 'rice', icon: 'Wheat', count: 4, description: 'দিনাজপুরের খাঁটি মিনিকেট, নাজিরশাইল ও আতপ চাল' },
      { id: 'cat-3', name: 'খাবার', nameEn: 'Food', slug: 'food', icon: 'UtensilsCrossed', count: 5, description: 'চা, বিস্কুট, সুন্দরবনের মধু ও ঐতিহ্যবাহী খেজুর গুড়' },
      { id: 'cat-4', name: 'কৃষি', nameEn: 'Agriculture', slug: 'agriculture', icon: 'Sprout', count: 6, description: 'তাজা আলু, পেঁয়াজ, রসুন, আদা ও বাগান পরিচর্যা সামগ্রী' },
      { id: 'cat-5', name: 'ফ্যাশন', nameEn: 'Fashion', slug: 'fashion', icon: 'Shirt', count: 3, description: 'ঐতিহ্যবাহী তাঁতের লুঙ্গি, সুতি পাঞ্জাবি ও গামছা' },
      { id: 'cat-6', name: 'মোবাইল', nameEn: 'Mobile', slug: 'mobile', icon: 'Smartphone', count: 2, description: 'ফাস্ট চার্জার, টাইপ-সি ক্যাবল ও মোবাইল গ্যাজেট' },
      { id: 'cat-7', name: 'গৃহস্থালি', nameEn: 'Household', slug: 'household', icon: 'Home', count: 2, description: 'মশারি, খাঁটি নারিকেল ঝাড়ু ও ঘরকন্নার প্রয়োজনীয় জিনিস' },
      { id: 'cat-8', name: 'সৌন্দর্য', nameEn: 'Beauty', slug: 'beauty', icon: 'Sparkles', count: 2, description: 'খাঁটি নারিকেল তেল, অর্গানিক নিম সাবান ও হার্বাল যত্ন' },
      { id: 'cat-9', name: 'ইলেকট্রনিক্স', nameEn: 'Electronics', slug: 'electronics', icon: 'Zap', count: 2, description: 'মাল্টিপ্লাগ, এলইডি বাতি ও বিদ্যুৎ সাশ্রয়ী পণ্য' },
      { id: 'cat-10', name: 'অন্যান্য', nameEn: 'Others', slug: 'others', icon: 'Package', count: 1, description: 'পল্লি অঞ্চলের বিশেষ শৌখিন ও হস্তশিল্প পণ্য' },
    ],
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const auth = await verifyAdminSession(request, env);
  if (!auth.isValid) {
    return errorResponse('অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।', 401);
  }

  try {
    const body: any = await request.json();
    if (!body.name || !body.slug) {
      return errorResponse('ক্যাটাগরির নাম ও স্ল্যাগ প্রদান আবশ্যক।', 400);
    }

    const id = body.id || `cat-${Date.now()}`;
    if (env.DB) {
      await env.DB.prepare(
        'INSERT INTO categories (id, name, name_en, slug, icon, count, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        id,
        body.name,
        body.nameEn || body.name_en || '',
        body.slug,
        body.icon || 'ShoppingBasket',
        body.count || 0,
        body.description || ''
      ).run();
    }

    return jsonResponse({
      success: true,
      message: 'ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে।',
      data: { id, ...body },
    }, 201);
  } catch (e: any) {
    return errorResponse('ক্যাটাগরি তৈরিতে সমস্যা হয়েছে: ' + (e?.message || 'Error'), 500);
  }
}
