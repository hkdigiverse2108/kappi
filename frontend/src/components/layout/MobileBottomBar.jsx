import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export const MobileBottomBar = () => {
  const { getItemCount, setIsCartOpen, cartBump } = useCartStore();
  const cartCount = getItemCount();

  const navClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 py-1.5 flex-1 text-[11px] font-medium transition-colors ${
      isActive ? 'text-emerald-deep font-bold' : 'text-muted hover:text-ink'
    }`;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-soft/80 shadow-lg px-2 safe-bottom">
      <div className="flex items-center justify-around h-14">
        {/* Home */}
        <NavLink to="/" className={navClass}>
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        {/* Shop */}
        <NavLink to="/shop" className={navClass}>
          <Grid className="w-5 h-5" />
          <span>Shop</span>
        </NavLink>

        {/* Wishlist */}
        <NavLink to="/wishlist" className={navClass}>
          <Heart className="w-5 h-5" />
          <span>Wishlist</span>
        </NavLink>

        {/* Cart Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 flex-1 text-[11px] font-medium text-muted hover:text-ink relative transition-transform ${
            cartBump ? 'scale-125' : ''
          }`}
          aria-label="Open cart"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-emerald" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-deep text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {/* Account */}
        <NavLink to="/account" className={navClass}>
          <User className="w-5 h-5" />
          <span>Account</span>
        </NavLink>
      </div>
    </div>
  );
};

export default MobileBottomBar;
