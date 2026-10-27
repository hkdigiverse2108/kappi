import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Plus,
  Moon,
  Sun,
  LogOut,
  ShoppingBag,
  Package,
  Tag,
  Star,
  ChevronDown,
  Palette,
  Check,
  Eye
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { istFriendly } from '../../../utils/istTime';

export const AdminTopBar = () => {
  const navigate = useNavigate();
  const {
    sidebarCollapsed,
    darkMode,
    toggleDarkMode,
    setCommandPaletteOpen,
    currentUser,
    adminLogout,
    orders,
    setOrdersRead
  } = useAdminStore();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickNewOpen, setQuickNewOpen] = useState(false);

  const quickNewRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  useClickOutside(quickNewRef, quickNewOpen, () => setQuickNewOpen(false));
  useClickOutside(notificationsRef, notificationsOpen, () => setNotificationsOpen(false));
  useClickOutside(profileRef, profileOpen, () => setProfileOpen(false));

  // Order notifications: website orders, newest first; unread until opened or marked as read
  const orderNotifications = orders.filter((o) => o.source !== 'Admin');
  const unreadOrders = orderNotifications.filter((o) => o.adminRead === false);
  // Latest 10 website orders; unread ones are highlighted
  const shownOrders = orderNotifications.slice(0, 10);



  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-bg/90 backdrop-blur-md border-b border-border transition-all duration-300 px-6 flex items-center justify-between shadow-xs ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Search trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-surface-2 dark:bg-[#112A26] hover:border-primary/40 rounded-xl text-xs text-muted dark:text-[#8FA8A3] transition-all border border-border focus:outline-none focus:ring-3 focus:ring-[var(--ring)] cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-muted" />
            <span className="truncate">Search products, orders, customers...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] bg-surface border border-border px-2 py-0.5 rounded shadow-2xs font-semibold text-text-2">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick New Button */}
        <div className="relative" ref={quickNewRef}>
          <button
            type="button"
            onClick={() => setQuickNewOpen(!quickNewOpen)}
            className="btn-primary text-xs !py-1.5 !px-3 font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {quickNewOpen && (
            <>
              <div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-[#0C1F1C] rounded-2xl shadow-lg border border-border p-1.5 z-20 text-xs text-text">
                <button
                  onClick={() => {
                    setQuickNewOpen(false);
                    navigate('/admin/products?action=new');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-tint text-left transition-colors cursor-pointer"
                >
                  <Package className="w-4 h-4 text-primary" />
                  <span>New Product</span>
                </button>
                <button
                  onClick={() => {
                    setQuickNewOpen(false);
                    navigate('/admin/orders?action=new');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-tint text-left transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  <span>Manual Order</span>
                </button>
                <button
                  onClick={() => {
                    setQuickNewOpen(false);
                    navigate('/admin/offers?action=new');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-tint text-left transition-colors cursor-pointer"
                >
                  <Tag className="w-4 h-4 text-primary" />
                  <span>Create Coupon</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle with Smooth Morph Animation */}
        <button
          id="theme-toggle-btn"
          type="button"
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-muted hover:text-text hover:bg-surface-tint transition-all cursor-pointer relative overflow-hidden"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle dark mode"
        >
          <AnimatePresence mode="wait" initial={false}>
            {darkMode ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-4 h-4 text-[#EBCB6B]" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-4 h-4 text-[#04403B]" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Notifications (with soft gold pulse) */}
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-muted hover:text-text hover:bg-surface-tint transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadOrders.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C8962E] text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-surface">
                {unreadOrders.length > 99 ? '99+' : unreadOrders.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface dark:bg-[#0C1F1C] rounded-2xl shadow-xl border border-border z-20 overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h4 className="text-sm font-bold text-text">Notifications</h4>
              </div>

              <div className="max-h-96 overflow-y-auto divide-y divide-border">
                {shownOrders.length === 0 ? (
                  <p className="py-10 text-center text-xs text-muted">No notifications yet</p>
                ) : (
                  shownOrders.map((o) => {
                    const unread = o.adminRead === false;
                    const itemCount = o.items.reduce((n, it) => n + (it.quantity || 1), 0);
                    return (
                      <div
                        key={o.id}
                        className={`px-5 py-4 space-y-1.5 ${unread ? 'bg-[#FDF8E8]/60 dark:bg-[#2A2410]/30' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[13px] font-bold text-text flex items-center gap-1.5">
                            {unread && <span className="w-1.5 h-1.5 rounded-full bg-[#C8962E] shrink-0" />}
                            New Order Received
                          </p>
                          <span className="text-[11px] text-muted shrink-0">{istFriendly(o.createdAt)}</span>
                        </div>
                        <p className="text-xs text-text-2 leading-relaxed line-clamp-2">
                          {o.customer.name} placed order {o.orderNumber} of ₹{o.pricing.total.toLocaleString('en-IN')} ({itemCount}{' '}
                          {itemCount === 1 ? 'item' : 'items'}) from {o.shippingAddress?.city || 'the website'}.
                        </p>
                        <div className="flex items-center gap-4 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setNotificationsOpen(false);
                              navigate(`/admin/orders?order=${o.id}`);
                            }}
                            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          {unread && (
                            <button
                              type="button"
                              onClick={() => setOrdersRead([o.id], true)}
                              className="flex items-center gap-1 text-xs font-medium text-muted hover:text-primary"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <button
                type="button"
                disabled={unreadOrders.length === 0}
                onClick={() => setOrdersRead(null, true)}
                className="w-full flex items-center justify-center gap-1.5 px-5 py-3 border-t border-border text-xs font-semibold text-primary hover:bg-surface-tint transition-colors disabled:text-muted disabled:opacity-60 disabled:hover:bg-transparent disabled:cursor-default"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            </div>
          )}
        </div>

        {/* Current User Role Switcher & Avatar */}
        <div className="relative pl-1" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-surface-tint transition-colors cursor-pointer"
          >
            <img
              src={currentUser.avatar || '/logo.png'}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-border"
            />
            <div className="hidden lg:block text-left text-xs leading-tight">
              <p className="font-bold text-text">{currentUser.name}</p>
              <p className="text-[10px] text-muted">{currentUser.role}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-muted" />
          </button>

          {profileOpen && (
            <>
              <div className="absolute right-0 mt-2 w-64 bg-surface dark:bg-[#0C1F1C] rounded-2xl shadow-lg border border-border p-3 z-20 text-xs">
                <div className="pb-3 border-b border-border">
                  <p className="font-bold text-text">{currentUser.name}</p>
                  <p className="text-[11px] text-muted">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary">
                    {currentUser.role}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={async () => {
                      setProfileOpen(false);
                      await adminLogout();
                      navigate('/admin/login');
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-error hover:bg-error/10 text-left font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
