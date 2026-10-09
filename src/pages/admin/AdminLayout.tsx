import React from 'react';
import {
  Boxes,
  Database,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { AppRoute, useNavigation } from '../../context/NavigationContext';

interface AdminLayoutProps {
  currentTab: string;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentTab, children }) => {
  const { navigate, adminLogout, adminUserRole, adminUsername } = useNavigation();

  const isModerator = adminUserRole === 'moderator';

  const menuItems = [
    {
      id: 'admin-dashboard',
      label: 'ড্যাশবোর্ড (Dashboard)',
      icon: LayoutDashboard,
      route: 'admin-dashboard' as AppRoute,
    },
    {
      id: 'admin-products',
      label: isModerator ? 'পণ্য তালিকা (শুধুমাত্র দর্শন)' : 'পণ্য তালিকা (Products)',
      icon: Boxes,
      route: 'admin-products' as AppRoute,
    },
    {
      id: 'admin-categories',
      label: isModerator ? 'ক্যাটাগরি (শুধুমাত্র দর্শন)' : 'ক্যাটাগরি (Categories)',
      icon: FolderTree,
      route: 'admin-categories' as AppRoute,
    },
    {
      id: 'admin-orders',
      label: 'অর্ডারসমূহ (Orders)',
      icon: ShoppingBag,
      route: 'admin-orders' as AppRoute,
    },
    {
      id: 'admin-customers',
      label: 'গ্রাহক তালিকা (Customers)',
      icon: Users,
      route: 'admin-customers' as AppRoute,
    },
    ...(!isModerator
      ? [
          {
            id: 'admin-settings',
            label: 'সেটিংস ও D1 এক্সপোর্ট',
            icon: Settings,
            route: 'admin-settings' as AppRoute,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-stone-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center font-bold font-serif text-sm">
            PB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight">PolliBazar Admin</h1>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isModerator
                    ? 'bg-blue-900/80 text-blue-200 border border-blue-700'
                    : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                }`}
              >
                {isModerator ? 'মডারেটর (Moderator)' : 'অ্যাডমিন (Admin)'}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 block -mt-0.5">
              ইউজার: {adminUsername || (isModerator ? 'moderator' : 'admin')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('home')}
            className="text-xs text-stone-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors"
          >
            <span>স্টোরে ফিরে যান</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={adminLogout}
            className="text-xs text-rose-300 hover:text-rose-100 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </header>

      {/* Main Admin Wrapper */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Admin Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-4 space-y-1 shrink-0">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 mb-2">
            ব্যবস্থাপনা মেনু
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
