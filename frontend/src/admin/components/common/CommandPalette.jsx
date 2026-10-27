import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Star,
  HelpCircle,
  Tag,
  Truck,
  FileText,
  Megaphone,
  BarChart3,
  ShieldAlert,
  PlusCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { modalVariants, backdropVariants } from '../../lib/motion';

export const CommandPalette = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, products, orders } = useAdminStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, category: 'Pages' },
    { label: 'Orders & Returns', path: '/admin/orders', icon: ShoppingBag, category: 'Pages' },
    { label: 'Products', path: '/admin/products', icon: Package, category: 'Pages' },
    { label: 'Customer Directory', path: '/admin/customers', icon: Users, category: 'Pages' },
    { label: 'Customer Reviews & Q&A', path: '/admin/reviews', icon: Star, category: 'Pages' },
    { label: 'FAQ Manager', path: '/admin/faqs', icon: HelpCircle, category: 'Pages' },
    { label: 'Coupons', path: '/admin/offers', icon: Tag, category: 'Pages' },
    { label: 'Cart Rewards (Free Shipping, Gift, Discount)', path: '/admin/cart-rewards', icon: Tag, category: 'Pages' },
    { label: 'Delivery & Payment Gateways', path: '/admin/delivery-payments', icon: Truck, category: 'Pages' },
    { label: 'CMS Homepage Manager', path: '/admin/cms/homepage', icon: FileText, category: 'CMS' },
    { label: 'CMS Our Story Page', path: '/admin/cms/story', icon: FileText, category: 'CMS' },
    { label: 'CMS Contact Us Page', path: '/admin/cms/contact', icon: FileText, category: 'CMS' },
    { label: 'CMS Policy Pages', path: '/admin/cms/policies', icon: FileText, category: 'CMS' },
    { label: 'CMS Banners & Bar', path: '/admin/cms/banners', icon: FileText, category: 'CMS' },
    { label: 'Inquiries', path: '/admin/marketing', icon: Megaphone, category: 'Pages' },
    { label: 'Analytics Reports', path: '/admin/reports', icon: BarChart3, category: 'Pages' },
  ];

  const quickActions = [
    { label: 'Add New Product', path: '/admin/products?action=new', icon: PlusCircle, category: 'Actions' },
    { label: 'Create Manual Order', path: '/admin/orders?action=new', icon: PlusCircle, category: 'Actions' },
    { label: 'Create Discount Coupon', path: '/admin/offers?action=new', icon: PlusCircle, category: 'Actions' },
    { label: 'View Public Storefront', path: '/', external: true, icon: ExternalLink, category: 'Actions' }
  ];

  const allItems = [...quickActions, ...navItems];

  const filteredItems = query.trim()
    ? allItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : allItems;

  const handleSelect = (item) => {
    setCommandPaletteOpen(false);
    setQuery('');
    if (item.external) {
      window.open(item.path, '_blank');
    } else {
      navigate(item.path);
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="exit"
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
          />

          <motion.div
            variants={modalVariants}
            initial="closed"
            animate="open"
            exit="exit"
            className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 z-10 overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-3.5 border-b border-stone-200 dark:border-stone-800">
              <Search className="w-5 h-5 text-stone-400 mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command, page, product or order... (Esc to close)"
                autoFocus
                className="w-full bg-transparent text-sm text-ink dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
              />
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-md">
                ESC
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 text-stone-700 dark:text-stone-200 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 text-stone-500 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item.label}</p>
                          <p className="text-[10px] text-stone-400 uppercase tracking-wider">{item.category}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-600 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-stone-400">
                  No matching commands or pages found.
                </div>
              )}
            </div>

            {/* Footer Tip */}
            <div className="px-4 py-2.5 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
              <span>Navigate with mouse or arrows</span>
              <span>KAPEE Enterprise Quick Navigator</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
