import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Heart,
  ShoppingBag,
  User,
  Menu,
  ChevronDown,
  Sparkles,
  LogOut,
  Package,
  CheckCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { HeaderSearchInput, HeaderSearchDropdown } from './HeaderSearchBar';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useUserStore } from '../../store/useUserStore';
import { useUIStore } from '../../store/useUIStore';
import { useClickOutside } from '../../hooks/useClickOutside';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  useClickOutside(profileRef, isProfileOpen, () => setIsProfileOpen(false));

  const { getItemCount, setIsCartOpen, cartBump } = useCartStore();
  const { wishlist } = useWishlistStore();
  const { user, isLoggedIn, logout } = useUserStore();
  const { isSearchOpen, setIsSearchOpen, setMobileMenuOpen } = useUIStore();
  const navigate = useNavigate();

  const cartCount = getItemCount();
  const wishlistCount = wishlist.length;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 relative ${
        isSearchOpen
          ? 'bg-white shadow-xs py-3 border-b border-gray-200'
          : isScrolled
          ? 'bg-ivory/90 backdrop-blur-md shadow-soft py-2.5 border-b border-emerald-soft/70'
          : 'bg-ivory py-4 border-b border-emerald-soft/40'
      }`}
    >
      <div className="relative z-20 max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Hamburger & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-ink hover:text-emerald rounded-lg hover:bg-emerald-soft/50 transition-colors"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo (Enlarged) */}
            <Logo className={isScrolled ? 'h-10 sm:h-11 w-auto' : 'h-12 sm:h-14 w-auto'} />
          </div>

          {/* Desktop Center: Navigation Links OR Header Search Bar (Happi Planet style) */}
          {isSearchOpen ? (
            <HeaderSearchInput />
          ) : (
            <nav className="hidden lg:flex items-center gap-7">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors duration-200 relative py-1 group ${
                    isActive ? 'text-emerald-deep font-bold' : 'text-ink hover:text-emerald'
                  }`
                }
              >
                <span>Home</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-deep rounded-full transition-all duration-300 group-hover:w-full" />
              </NavLink>

              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors duration-200 relative py-1 group ${
                    isActive ? 'text-emerald-deep font-bold' : 'text-ink hover:text-emerald'
                  }`
                }
              >
                <span>Shop</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-deep rounded-full transition-all duration-300 group-hover:w-full" />
              </NavLink>

              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors duration-200 relative py-1 group ${
                    isActive ? 'text-emerald-deep font-bold' : 'text-ink hover:text-emerald'
                  }`
                }
              >
                <span>Contact</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-deep rounded-full transition-all duration-300 group-hover:w-full" />
              </NavLink>

              <NavLink
                to="/faqs"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors duration-200 relative py-1 group ${
                    isActive ? 'text-emerald-deep font-bold' : 'text-ink hover:text-emerald'
                  }`
                }
              >
                <span>FAQs</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-deep rounded-full transition-all duration-300 group-hover:w-full" />
              </NavLink>
            </nav>
          )}

          {/* Right Action Icons: Search, Wishlist, Profile, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger (hidden while searchbar is active, matching Happi Planet) */}
            {!isSearchOpen && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-ink hover:text-emerald hover:bg-emerald-soft/50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Search store"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 text-ink hover:text-emerald hover:bg-emerald-soft/50 rounded-xl transition-all flex items-center gap-1"
                aria-label="User Account"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-emerald-soft py-2 z-50 animate-fadeIn"
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  {isLoggedIn ? (
                    <div>
                      <div className="px-4 py-2.5 border-b border-emerald-soft">
                        <p className="text-xs text-muted">Signed in as</p>
                        <p className="text-xs font-bold text-ink truncate">{user?.name}</p>
                        <p className="text-[11px] text-muted truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/account"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-ink hover:bg-ivory hover:text-emerald"
                        >
                          <User className="w-4 h-4 text-muted" /> My Account
                        </Link>
                        <Link
                          to="/account?tab=orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-ink hover:bg-ivory hover:text-emerald"
                        >
                          <Package className="w-4 h-4 text-muted" /> My Orders
                        </Link>
                        <Link
                          to="/track-order"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-ink hover:bg-ivory hover:text-emerald"
                        >
                          <CheckCircle className="w-4 h-4 text-muted" /> Track Order
                        </Link>
                      </div>

                      <div className="border-t border-emerald-soft pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-error hover:bg-error/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center space-y-2">
                      <p className="text-xs text-muted">Sign in to track orders & save addresses</p>
                      <Link
                        to="/login"
                        onClick={() => setIsProfileOpen(false)}
                        className="btn-primary w-full text-xs py-2 block text-center"
                      >
                        Sign In / Register
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-ink hover:text-emerald hover:bg-emerald-soft/50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 relative"
              aria-label={`Wishlist (${wishlistCount})`}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-deep text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger - Clean Minimalist Icon (Happi Planet style) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`p-2 text-ink hover:text-emerald hover:bg-emerald-soft/50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 relative ${
                cartBump ? 'scale-110 text-emerald-deep' : ''
              }`}
              aria-label={`Cart (${cartCount} items)`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-deep text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Attached Search Dropdown Panel (Happi Planet style) */}
      <HeaderSearchDropdown />
    </header>
  );
};

export default Navbar;
