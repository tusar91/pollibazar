import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin, navigate } = useNavigation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setErrorMsg('ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: u, password: p }),
      });

      const data: any = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.token) {
        try {
          localStorage.setItem('pb_session_token', data.token);
          localStorage.setItem('pollibazar_admin_auth', 'true');
          if (data.user?.role) localStorage.setItem('pollibazar_user_role', data.user.role);
          if (data.user?.username) localStorage.setItem('pollibazar_username', data.user.username);
        } catch {}
        setLoading(false);
        adminLogin(data.token, data.user);
        return;
      } else {
        setLoading(false);
        setErrorMsg(data?.error || 'ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে। সঠিক তথ্য দিয়ে চেষ্টা করুন।');
        return;
      }
    } catch {
      setLoading(false);
      setErrorMsg('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে নেটওয়ার্ক সংযোগ পরীক্ষা করুন।');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif">
            পল্লি বাজার অ্যাডমিন লগইন
          </h1>
          <p className="text-xs text-stone-500">
            স্টোর ও ক্যাটালগ পরিচালনার জন্য প্রবেশ করুন
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-800 leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong>রোল-ভিত্তিক এক্সেস:</strong> অ্যাডমিন (পূর্ণ ক্ষমতা) অথবা মডারেটর (অর্ডার স্ট্যাটাস ব্যবস্থাপনা) একাউন্ট দিয়ে লগইন করুন।
          </div>
        </div>

        {/* Role Quick Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setUsername('admin')}
            className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${
              username === 'admin'
                ? 'bg-white text-emerald-800 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            অ্যাডমিন (Admin)
          </button>
          <button
            type="button"
            onClick={() => setUsername('moderator')}
            className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${
              username === 'moderator'
                ? 'bg-white text-emerald-800 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            মডারেটর (Moderator)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              ইউজারনেম
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ইউজারনেম লিখুন"
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white text-stone-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="পাসওয়ার্ড লিখুন"
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white text-stone-900"
            />
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-lg flex items-center gap-2">
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-70 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'যাচাই করা হচ্ছে...' : 'ড্যাশবোর্ডে প্রবেশ করুন'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('home')}
            className="text-xs text-stone-500 hover:text-stone-800 underline"
          >
            স্টোরে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
};
