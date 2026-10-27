import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useUIStore } from '../../store/useUIStore';

export const MobileMenuDrawer = () => {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

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
        <div className="w-screen max-w-xs sm:max-w-sm bg-white shadow-drawer flex flex-col">
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
            {/* Menu List (same links as desktop navbar) */}
            <div className="space-y-1">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop' },
                { to: '/contact', label: 'Contact' },
                { to: '/faqs', label: 'FAQs' }
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={handleClose}
                  className={({ isActive }) =>
                    `flex items-center py-2.5 px-3 rounded-xl font-semibold text-sm hover:bg-ivory hover:text-emerald transition-colors ${
                      isActive ? 'text-emerald-deep font-bold bg-ivory' : 'text-ink'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenuDrawer;
