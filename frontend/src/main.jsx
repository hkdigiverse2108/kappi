import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useAdminStore } from './admin/store/adminStore'
import { useCartStore } from './store/useCartStore'
import { useUserStore } from './store/useUserStore'
import { useProductStore } from './store/useProductStore'

// Load home content before the first render (index.html already preloads /api/home)
useAdminStore.getState().loadHomeContent()
// Products from Admin > Products (shop, search, menu, cart suggestions...)
useProductStore.getState().loadProducts()
// Stock changes with every order and with the admin, so the catalogue is loaded again whenever the tab
// is opened or focused again (at most every 10 seconds)
let productsLoadedAt = Date.now()
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || Date.now() - productsLoadedAt < 10000) return
  productsLoadedAt = Date.now()
  useProductStore.getState().loadProducts()
})
// WhatsApp / phone / email from Admin > CMS: Contact Us Page (footer, floating WhatsApp button...)
useAdminStore.getState().loadContactContent()
// Policy pages from Admin > CMS: Policy Pages (footer links)
useAdminStore.getState().loadPolicies()
// Footer texts and links from Admin > CMS: Footer
useAdminStore.getState().loadFooter()
// Top announcement ticker messages from Admin > CMS: Banners & Bar
useAdminStore.getState().loadAnnouncementBar()
// Coupons from Admin > Offers, used by the cart's "apply coupon"
useCartStore.getState().loadCoupons()
// Cart rewards (free shipping, free gift, extra discount) and fees from Admin > Offers > Cart Rewards
useCartStore.getState().loadCartOffers()
// Is the customer logged in? (session cookie checked by the backend)
useUserStore.getState().loadSession()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
