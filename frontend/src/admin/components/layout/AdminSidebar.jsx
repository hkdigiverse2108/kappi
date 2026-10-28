import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import logoImg from '../../../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Star,
  HelpCircle,
  Tag,
  Truck,
  FolderTree,
  Megaphone,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  Sparkles,
  PhoneCall,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Compass,
  MessageSquareQuote,
  Layers,
  Flag,
  Palette,
  Gift,
  MessageSquareText,
  PanelBottom,
  Search
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';

export const AdminSidebar = ({ mobileOpen = false, onMobileClose }) => {
  const location = useLocation();
  const { sidebarCollapsed: collapsedSetting, toggleSidebar, orders, reviews, enquiries } = useAdminStore();
  // The mobile drawer always shows full labels
  const sidebarCollapsed = collapsedSetting && !mobileOpen;
  const [cmsExpanded, setCmsExpanded] = useState(
    location.pathname.startsWith('/admin/cms')
  );

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const pendingReviewsCount = reviews.filter((r) => r.status === 'Pending').length;
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;

  const mainNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : null, badgeColor: 'bg-[#D98E04] text-white' },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Reviews', path: '/admin/reviews', icon: Star, badge: pendingReviewsCount > 0 ? pendingReviewsCount : null, badgeColor: 'bg-[#1E8E5A] text-white' },
    { label: 'FAQ', path: '/admin/faqs', icon: HelpCircle },
    { label: 'Coupons', path: '/admin/offers', icon: Tag },
    { label: 'Cart Rewards', path: '/admin/cart-rewards', icon: Gift },
    { label: 'Delivery & Payments', path: '/admin/delivery-payments', icon: Truck },
  ];

  const cmsNavItems = [
    { label: 'Homepage CMS', path: '/admin/cms/homepage', icon: Sparkles },
    { label: 'Our Story Page', path: '/admin/cms/story', icon: BookOpen },
    { label: 'Contact Us Page', path: '/admin/cms/contact', icon: PhoneCall },
    { label: 'Policy Pages', path: '/admin/cms/policies', icon: ShieldCheck },
    { label: 'Footer', path: '/admin/cms/footer', icon: PanelBottom },
    { label: 'Banners & Bar', path: '/admin/cms/banners', icon: Flag },
  ];

  const bottomNavItems = [
    { label: 'Inquiries', path: '/admin/marketing', icon: MessageSquareText, badge: newEnquiriesCount > 0 ? newEnquiriesCount : null, badgeColor: 'bg-[#C8962E] text-[#04403B]' },
    { label: 'SEO', path: '/admin/seo', icon: Search },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  const isCurrentActive = (path) => {
    if (path === '/admin/dashboard') return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      style={{
        background: 'linear-gradient(160deg, #032E2A 0%, #04403B 45%, #0A5C55 100%)',
      }}
      className={`fixed top-0 bottom-0 left-0 z-30 text-white flex flex-col transition-all duration-300 ease-in-out border-r border-[#074B45] shadow-xl overflow-hidden w-64 lg:translate-x-0 ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
      } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Subtle Leaf Pattern Overlay (4% opacity) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(#EBCB6B 1px, transparent 1px), radial-gradient(#6FB2A7 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Soft Radial Gold Glow at the bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none -z-0"
        style={{
          background: 'radial-gradient(circle at 50% 100%, rgba(200, 150, 46, 0.12) 0%, transparent 70%)',
        }}
      />

      {/* Brand Header */}
      <div className="h-16 px-3.5 flex items-center justify-between border-b border-[#074B45]/80 relative z-10">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5 overflow-hidden group">
          {/* Exact Logo from website (clean white rounded badge) */}
          <div className="p-1.5 bg-white rounded-xl shadow-md inline-flex items-center justify-center shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
            <img
              src={logoImg}
              alt="KAPEE Enterprise"
              className={`${sidebarCollapsed ? 'h-7 w-7' : 'h-8 w-auto max-w-[130px]'} object-contain`}
              style={{ imageRendering: 'auto' }}
            />
          </div>

          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="leading-tight truncate"
            >
              <h1 className="font-serif font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
                <span>KAPEE</span>
                <span className="text-[9px] font-sans font-bold bg-[#EBCB6B] text-[#032E2A] px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </h1>
              <p className="text-[10px] text-stone-300 tracking-wider">
                Enterprise Suite
              </p>
            </motion.div>
          )}
        </Link>

        {/* Close (mobile drawer) */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-lg text-[#CFE6E2]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block p-1.5 rounded-lg text-[#CFE6E2]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 relative z-10 scrollbar-thin">
        {/* Core Operations Section */}
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <p className="px-3 pb-1 text-[11px] font-bold text-[#6FB2A7] uppercase tracking-wider">
              Core Operations
            </p>
          )}

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  backgroundColor: active ? 'rgba(235, 203, 107, 0.14)' : undefined,
                  color: active ? '#FFFFFF' : '#CFE6E2',
                }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group hover:bg-white/[0.08] hover:text-white ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {/* 3px Gold-Gradient Active Indicator Bar on Left */}
                {active && (
                  <span
                    style={{ background: 'linear-gradient(135deg, #8F6414 0%, #EBCB6B 45%, #C8962E 100%)' }}
                    className="absolute left-0 inset-y-1.5 w-[3px] rounded-r shadow-xs"
                  />
                )}

                <Icon
                  style={{ color: active ? '#EBCB6B' : undefined }}
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    active ? 'text-[#EBCB6B]' : 'text-[#A0CDC5]'
                  }`}
                />

                {!sidebarCollapsed && (
                  <span className={`flex-1 truncate ${active ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                )}

                {!sidebarCollapsed && item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${item.badgeColor || 'bg-[#C8962E] text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Collapsible Content & Storefront (CMS) */}
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <p className="px-3 pb-1 text-[11px] font-bold text-[#6FB2A7] uppercase tracking-wider">
              Content & Storefront
            </p>
          )}

          <button
            type="button"
            onClick={() => setCmsExpanded(!cmsExpanded)}
            style={{ color: '#CFE6E2' }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium hover:bg-white/[0.08] hover:text-white transition-colors group cursor-pointer ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? 'CMS Manager' : undefined}
          >
            <div className="flex items-center gap-3">
              <FolderTree className="w-4 h-4 text-[#A0CDC5] group-hover:scale-110 transition-transform" />
              {!sidebarCollapsed && <span className="font-semibold">CMS Manager</span>}
            </div>

            {!sidebarCollapsed && (
              <motion.div
                animate={{ rotate: cmsExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5 text-[#CFE6E2]/70" />
              </motion.div>
            )}
          </button>

          {/* Sub items */}
          <AnimatePresence initial={false}>
            {cmsExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className={`overflow-hidden pl-2 space-y-1 ${sidebarCollapsed ? 'hidden' : ''}`}
              >
                {cmsNavItems.map((sub) => {
                  const SubIcon = sub.icon;
                  const active = location.pathname === sub.path;
                  return (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      style={{
                        backgroundColor: active ? 'rgba(235, 203, 107, 0.14)' : undefined,
                        color: active ? '#FFFFFF' : '#CFE6E2',
                      }}
                      className="relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] transition-all group hover:bg-white/[0.08] hover:text-white"
                    >
                      {active && (
                        <span
                          style={{ background: 'linear-gradient(135deg, #8F6414 0%, #EBCB6B 45%, #C8962E 100%)' }}
                          className="absolute left-0 inset-y-1 w-[3px] rounded-r"
                        />
                      )}
                      <SubIcon
                        style={{ color: active ? '#EBCB6B' : undefined }}
                        className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-[#EBCB6B]' : 'text-[#A0CDC5]/80'}`}
                      />
                      <span className={`truncate ${active ? 'font-bold' : ''}`}>{sub.label}</span>
                    </NavLink>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Growth & Settings */}
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <p className="px-3 pb-1 text-[11px] font-bold text-[#6FB2A7] uppercase tracking-wider">
              Growth & Settings
            </p>
          )}

          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  backgroundColor: active ? 'rgba(235, 203, 107, 0.14)' : undefined,
                  color: active ? '#FFFFFF' : '#CFE6E2',
                }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group hover:bg-white/[0.08] hover:text-white ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {active && (
                  <span
                    style={{ background: 'linear-gradient(135deg, #8F6414 0%, #EBCB6B 45%, #C8962E 100%)' }}
                    className="absolute left-0 inset-y-1.5 w-[3px] rounded-r"
                  />
                )}

                <Icon
                  style={{ color: active ? '#EBCB6B' : undefined }}
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    active ? 'text-[#EBCB6B]' : 'text-[#A0CDC5]'
                  }`}
                />

                {!sidebarCollapsed && (
                  <span className={`flex-1 truncate ${active ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                )}

                {!sidebarCollapsed && item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-[#C8962E] text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Storefront Link Footer */}
      <div className="p-3 border-t border-[#074B45]/80 bg-black/15 relative z-10">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#CFE6E2] hover:text-white hover:bg-white/10 transition-colors"
          title="Open live storefront in new tab"
        >
          <ExternalLink className="w-4 h-4 shrink-0 text-[#EBCB6B]" />
          {!sidebarCollapsed && <span className="truncate">View Storefront</span>}
        </a>
      </div>
    </aside>
  );
};
