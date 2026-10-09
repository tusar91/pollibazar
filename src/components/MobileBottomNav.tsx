import React from 'react';
import { Home, ShoppingBag, Truck, Grid, Heart } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';

export const MobileBottomNav: React.FC = () => {
  const { currentRoute, navigate } = useNavigation();
  const { cartCount, setIsCartDrawerOpen } = useCart();

  // Hide on admin routes
  if (currentRoute.startsWith('admin')) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 py-2 px-3 flex items-center justify-around shadow-lg">
      <button
        onClick={() => navigate('home')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          currentRoute === 'home' ? 'text-emerald-800 font-bold' : 'text-stone-500'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>হোম</span>
      </button>

      <button
        onClick={() => navigate('shop')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          currentRoute === 'shop' ? 'text-emerald-800 font-bold' : 'text-stone-500'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span>শপ</span>
      </button>

      <button
        onClick={() => setIsCartDrawerOpen(true)}
        className="flex flex-col items-center gap-1 text-[10px] font-medium text-stone-500 relative cursor-pointer"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-emerald-800" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-emerald-700 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-bdt">
              {cartCount}
            </span>
          )}
        </div>
        <span>কার্ট</span>
      </button>

      <button
        onClick={() => navigate('track-order')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          currentRoute === 'track-order' ? 'text-emerald-800 font-bold' : 'text-stone-500'
        }`}
      >
        <Truck className="w-5 h-5" />
        <span>ট্র্যাকিং</span>
      </button>
    </nav>
  );
};
