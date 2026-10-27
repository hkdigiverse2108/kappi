import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomBar } from './components/layout/MobileBottomBar';
import { MobileMenuDrawer } from './components/layout/MobileMenuDrawer';
import { CartDrawer } from './components/cart/CartDrawer';
import { GlobalConfirmDialog } from './components/common/GlobalConfirmDialog';
import { QuickViewModal } from './components/product/QuickViewModal';
import { FloatingActions } from './components/common/FloatingActions';
import { LeafLoader } from './components/common/LeafLoader';
import { ScrollToTop } from './components/common/ScrollToTop';
import { RouteSeo } from './components/seo/RouteSeo';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import Login from './pages/Login';
import TrackOrder from './pages/TrackOrder';
import Guides from './pages/Guides';
import GuideDetail from './pages/GuideDetail';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import PolicyPage from './pages/PolicyPage';
import SearchResults from './pages/SearchResults';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollProgressBar } from './components/common/MotionWrapper';
import NotFound from './pages/NotFound';
import AdminApp from './admin/AdminApp';

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    transitionEnd: { transform: 'none' }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  }
};

const AppLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
        <GlobalConfirmDialog />
      </>
    );
  }

  const isCheckout = location.pathname === '/checkout';

  return (
    <div className="flex flex-col min-h-screen bg-ivory text-ink selection:bg-gold-light/40 selection:text-emerald-deep">
      <ScrollProgressBar />
      <ScrollToTop />
      <RouteSeo />
      
      {/* Global Modals & Drawers */}
      <CartDrawer />
      <QuickViewModal />
      <MobileMenuDrawer />
      <GlobalConfirmDialog />

      {/* Floating Buttons: WhatsApp & Back to Top */}
      {!isCheckout && <FloatingActions />}

      {/* Header (Announcement Bar + Sticky Navbar) */}
      {!isCheckout && (
        <>
          <AnnouncementBar />
          <Navbar />
        </>
      )}

      {/* Main Content Area with Fluid Page Transition on Open */}
      <main className="flex-1 overflow-x-clip">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className="w-full"
          >
            <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<Login defaultMode="forgot" />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/guides/:slug" element={<GuideDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/faqs" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/policies/:policyType" element={<PolicyPage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  </main>

      {/* Footer & Mobile Bottom Bar */}
      {!isCheckout && (
        <>
          <Footer />
          <MobileBottomBar />
        </>
      )}
    </div>
  );
};

export function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  return (
    <HelmetProvider>
      {initialLoading && <LeafLoader onLoaded={() => setInitialLoading(false)} />}
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
