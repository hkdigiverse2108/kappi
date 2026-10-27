import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  ChevronDown,
  ShoppingBag,
  Sparkles,
  Heart,
  User,
  Package,
  HelpCircle,
  Phone,
  BookOpen,
  Info,
  LogOut
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useUIStore } from '../../store/useUIStore';
import { useUserStore } from '../../store/useUserStore';
import { useWishlistStore } from '../../store/useWishlistStore';

export const MobileMenuDrawer = () => {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { user, isLoggedIn, logout } = useUserStore();
  const { wishlist } = useWishlistStore();
  const navigate = useNavigate();

  if (!mobileMenuOpen) return null;

  const handleClose = () => setMobileMenuOpen(false);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pr-12">
        <div className="w-screen max-w-xs sm:max-w-sm bg-white shadow-drawer flex flex-col justify-between">
          {/* Top Branding & Close */}
          <div className="px-5 py-4 border-b border-emerald-soft flex items-center justify-between bg-ivory">
            <Logo className="h-10 sm:h-11 w-auto" />
            <button
              onClick={handleClose}
              className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-emerald-soft"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* User Greeting block */}
            <div className="p-3.5 rounded-2xl bg-emerald-soft/60 border border-emerald-soft flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald text-white flex items-center justify-center font-bold">
                  {isLoggedIn ? user?.name?.charAt(0) : <User className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs text-muted">Welcome to KAPEE</p>
                  <p className="text-sm font-bold text-ink">
                    {isLoggedIn ? user?.name : 'Guest Customer'}
                  </p>
                </div>
              </div>
              <Link
                to={isLoggedIn ? '/account' : '/login'}
                onClick={handleClose}
                className="text-xs font-semibold text-emerald hover:underline"
              >
                {isLoggedIn ? 'Account' : 'Sign In'}
              </Link>
            </div>

            {/* Menu List */}
            <div className="space-y-1">
              <Link
                to="/"
                onClick={handleClose}
                className="flex items-center py-2.5 px-3 rounded-xl text-ink font-semibold text-sm hover:bg-ivory hover:text-emerald transition-colors"
              >
                Home
              </Link>

              {/* Shop Link */}
              <Link
                to="/shop"
                onClick={handleClose}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl text-ink font-semibold text-sm hover:bg-ivory hover:text-emerald transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald" />
                  Shop All Products
                </span>
                <span className="text-xs text-muted/80 bg-ivory px-2 py-0.5 rounded-full border border-muted/20">
                  12
                </span>
              </Link>

              {/* Combos with Gold Tag */}
              <Link
                to="/shop?category=combos"
                onClick={handleClose}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl text-ink font-semibold text-sm hover:bg-ivory hover:text-emerald transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  Combos & Bundles
                </span>
                <span className="text-[10px] uppercase font-bold bg-gold-light text-emerald-900 px-2 py-0.5 rounded-full">
                  Save More
                </span>
              </Link>

              <Link
                to="/contact"
                onClick={handleClose}
                className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-ink font-semibold text-sm hover:bg-ivory hover:text-emerald transition-colors"
              >
                <Phone className="w-4 h-4 text-muted" /> Contact
              </Link>

              <Link
                to="/faqs"
                onClick={handleClose}
                className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-ink font-semibold text-sm hover:bg-ivory hover:text-emerald transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-muted" /> FAQs
              </Link>

              <Link
                to="/track-order"
                onClick={handleClose}
                className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-ink font-semibold text-sm hover:bg-ivory hover:text-emerald transition-colors"
              >
                <Package className="w-4 h-4 text-muted" /> Track Order
              </Link>

              <Link
                to="/faqs"
                onClick={handleClose}
                className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-ink font-semibold text-sm hover:bg-ivory hover:text-emerald transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-muted" /> FAQs
              </Link>

              <Link
                to="/contact"
                onClick={handleClose}
                className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-ink font-semibold text-sm hover:bg-ivory hover:text-emerald transition-colors"
              >
                <Phone className="w-4 h-4 text-muted" /> Contact Us
              </Link>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 border-t border-emerald-soft bg-ivory">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  logout();
                  handleClose();
                }}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-error py-2.5 rounded-xl border border-error/20 hover:bg-error/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={handleClose}
                  className="btn-primary text-xs py-2 text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?tab=signup"
                  onClick={handleClose}
                  className="btn-secondary text-xs py-2 text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenuDrawer;
