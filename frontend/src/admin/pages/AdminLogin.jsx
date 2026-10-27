import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { triggerKapeeCelebration } from '../components/common/Confetti';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin, currentUser, addToast } = useAdminStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Already logged in: go straight to the dashboard
  useEffect(() => {
    if (currentUser) navigate('/admin/dashboard', { replace: true });
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const admin = await adminLogin(email, password);
      triggerKapeeCelebration();
      addToast({
        type: 'success',
        title: `Welcome back, ${admin.name}!`,
        message: `Logged in as ${admin.role}.`
      });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-scope min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#FBF8F1] dark:bg-stone-950 text-ink dark:text-stone-100 font-sans">
      {/* Centered Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl p-6 sm:p-10"
      >
        <div className="w-full space-y-8">
          {/* Brand header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white p-2 shadow-md border border-stone-100 flex items-center justify-center">
              <img src="/logo.png" alt="KAPEE" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-ink dark:text-stone-100">KAPEE Enterprise</h2>
              <p className="text-xs text-gold font-semibold uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
              Enter your credentials to access the KAPEE admin workspace.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  placeholder="admin@kapee.in"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#04403B] via-[#0A5C55] to-[#138379] hover:opacity-95 active:scale-98 shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
