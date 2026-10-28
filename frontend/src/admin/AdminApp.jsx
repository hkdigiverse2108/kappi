import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminLogin } from './pages/AdminLogin';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductsPage } from './pages/ProductsPage';
import { CustomersPage } from './pages/CustomersPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { FAQPage } from './pages/FAQPage';
import { OffersPage } from './pages/OffersPage';
import { CartRewardsPage } from './pages/CartRewardsPage';
import { CartTrackingPage } from './pages/CartTrackingPage';
import { DeliveryPaymentsPage } from './pages/DeliveryPaymentsPage';
import { HomepageManagerPage } from './pages/cms/HomepageManagerPage';
import { OurStoryPageCMS } from './pages/cms/OurStoryPageCMS';
import { PolicyPagesCMS } from './pages/cms/PolicyPagesCMS';
import { ContactPageCMS } from './pages/cms/ContactPageCMS';
import { FooterCMS } from './pages/cms/FooterCMS';
import { BannersPage } from './pages/cms/BannersPage';
import { MarketingPage } from './pages/MarketingPage';
import { ReportsPage } from './pages/ReportsPage';
import { SeoPage } from './pages/SeoPage';
import { DesignSystemPage } from './pages/DesignSystemPage';
import { useAdminStore } from './store/adminStore';

// Sends visitors without an admin session to the admin login page
const RequireAdmin = ({ children }) => {
  const { currentUser, adminSessionChecked } = useAdminStore();
  if (!adminSessionChecked) return null;
  if (!currentUser) return <Navigate to="/admin/login" replace />;
  return children;
};

export const AdminApp = () => {
  const currentUser = useAdminStore((state) => state.currentUser);

  // Is an admin logged in? (session cookie checked by the backend)
  useEffect(() => {
    useAdminStore.getState().loadAdminSession();
  }, []);

  // Products, reviews, coupons, customers, enquiries and subscribers come from the backend so the admin always edits what the website shows
  useEffect(() => {
    if (!currentUser) return;
    const { loadProducts, loadReviews, loadCoupons, loadCustomers, loadEnquiries, loadSubscribers, loadOrders } = useAdminStore.getState();
    loadProducts();
    loadReviews();
    loadCoupons();
    loadCustomers();
    loadEnquiries();
    loadSubscribers();
    loadOrders();
  }, [currentUser]);

  // New orders from the website show up as notifications (checked every 15s and when the tab is opened again)
  useEffect(() => {
    if (!currentUser) return;
    const check = () => useAdminStore.getState().checkNewOrders();
    const timer = setInterval(check, 15000);
    const onVisible = () => document.visibilityState === 'visible' && check();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [currentUser]);

  return (
    <Routes>
      {/* Standalone Login Page */}
      <Route path="login" element={<AdminLogin />} />

      {/* Main Admin Shell with Sidebar & Topbar */}
      <Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="faqs" element={<FAQPage />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="cart-tracking" element={<CartTrackingPage />} />
        <Route path="cart-rewards" element={<CartRewardsPage />} />
        <Route path="delivery-payments" element={<DeliveryPaymentsPage />} />

        {/* CMS Sub-pages */}
        <Route path="cms/homepage" element={<HomepageManagerPage />} />
        <Route path="cms/story" element={<OurStoryPageCMS />} />
        <Route path="cms/contact" element={<ContactPageCMS />} />
        <Route path="cms/policies" element={<PolicyPagesCMS />} />
        <Route path="cms/footer" element={<FooterCMS />} />
        <Route path="cms/pages" element={<Navigate to="/admin/cms/policies" replace />} />
        <Route path="cms/banners" element={<BannersPage />} />

        {/* Marketing, Reports, Design System */}
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="seo" element={<SeoPage />} />
        <Route path="design-system" element={<DesignSystemPage />} />
      </Route>

      {/* Fallback to Dashboard */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminApp;
