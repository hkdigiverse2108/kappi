import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Logo } from '../components/common/Logo';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 text-center">
      <Helmet>
        <title>404 - Page Not Found | KAPEE Enterprise</title>
      </Helmet>

      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-12 border border-emerald-soft shadow-xl space-y-6">
        <div className="flex justify-center">
          <Logo className="h-10 w-auto" />
        </div>

        <div className="space-y-2">
          <span className="font-serif text-6xl sm:text-7xl font-extrabold text-emerald-deep block">
            404
          </span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-ink">
            Page Wiped Clean!
          </h1>
          <p className="text-xs text-muted leading-relaxed">
            Oops! It seems this stain has been completely erased. The page you're looking for doesn't exist or has moved.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Link
            to="/"
            className="btn-primary w-full text-xs font-bold py-3 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Return to Homepage
          </Link>
          <Link
            to="/shop"
            className="btn-secondary w-full text-xs font-bold py-3 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Browse Cleaning Essentials
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
