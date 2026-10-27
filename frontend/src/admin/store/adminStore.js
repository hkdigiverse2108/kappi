import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useProductStore } from '../../store/useProductStore';
import * as homeApi from '../../api/homeApi';
import * as productApi from '../../api/productApi';
import * as reviewApi from '../../api/reviewApi';
import * as couponApi from '../../api/couponApi';
import * as adminAuthApi from '../../api/adminAuthApi';
import * as customerApi from '../../api/customerApi';
import * as contactApi from '../../api/contactApi';
import * as newsletterApi from '../../api/newsletterApi';
import * as ourStoryApi from '../../api/ourStoryApi';
import * as faqApi from '../../api/faqApi';
import * as policyApi from '../../api/policyApi';
import * as footerApi from '../../api/footerApi';
import * as announcementApi from '../../api/announcementApi';
import * as orderApi from '../../api/orderApi';
import { productBadgeList } from '../lib/productBadges';

// Seed Admin Users
const initialAdmins = [
  {
    id: 'usr-1',
    name: 'Karan Patel',
    email: 'admin@kapee.in',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'Active',
    lastLogin: 'Just now',
    phone: '+91 98250 12345'
  },
  {
    id: 'usr-2',
    name: 'Neha Mehta',
    email: 'neha@kapee.in',
    role: 'Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    status: 'Active',
    lastLogin: '2 hours ago',
    phone: '+91 98765 43210'
  },
  {
    id: 'usr-3',
    name: 'Amit Shah',
    email: 'support@kapee.in',
    role: 'Support',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'Active',
    lastLogin: 'Yesterday',
    phone: '+91 91234 56789'
  },
  {
    id: 'usr-4',
    name: 'Rohan Sharma',
    email: 'viewer@kapee.in',
    role: 'Viewer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    status: 'Active',
    lastLogin: '3 days ago',
    phone: '+91 99887 66554'
  }
];

// Seed Categories
// Short two-note chime for a new order (no sound file needed)
const playOrderChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const start = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.start(start);
      osc.stop(start + 0.4);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch {
    // Browser blocked audio (no click on the page yet); the on-screen notification still shows
  }
};

const initialCategories = [
  { id: 'cat-1', name: 'Magic Erasers', slug: 'magic-erasers', count: 6, image: '/products/magic_eraser.jpg', description: 'Micro-abrasive melamine sponges for stubborn scuffs & marks', sortOrder: 1, showInMenu: true },
  { id: 'cat-2', name: 'Kitchen Essentials', slug: 'kitchen-essentials', count: 4, image: '/kitchen_clean.jpg', description: 'Degreasers, dish scrubbers, and chimney grime erasers', sortOrder: 2, showInMenu: true },
  { id: 'cat-3', name: 'Bathroom & Tile Care', slug: 'bathroom-tile-care', count: 5, image: '/sink_clean.jpg', description: 'Hard water stain erasers and ceramic tile grout restorers', sortOrder: 3, showInMenu: true },
  { id: 'cat-4', name: 'Sneaker & Shoe Care', slug: 'sneaker-shoe-care', count: 3, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80', description: 'Sole restorers, midsole scuff erasers and canvas cleaners', sortOrder: 4, showInMenu: true },
  { id: 'cat-5', name: 'Accessories & Bundles', slug: 'accessories-bundles', count: 4, image: '/products/magic_eraser_hover.jpg', description: 'Value packs, organizers, and microfiber companion cloths', sortOrder: 5, showInMenu: true }
];

// Seed Coupons

// Seed Delivery Partners
// Seed Delivery Partner (Delhivery Direct Only)
const initialDelhiveryConfig = {
  id: 'dp-delhivery',
  name: 'Delhivery Direct Express',
  slug: 'delhivery',
  status: 'Connected',
  isDefault: true,
  mode: 'Live', // 'Live' | 'Sandbox'
  apiToken: 'delh_live_9f8a32b91c8a331f',
  clientName: 'KAPEE ENTERPRISE',
  pickupLocation: 'Ahmedabad Primary Hub',
  pickupPincode: '380015',
  serviceType: 'Surface Express', // 'Surface Express' | 'Air Express'
  codEnabled: true,
  rtoEnabled: true,
  defaultWeight: 0.35, // kg
  webhookUrl: 'https://kapee.in/api/webhooks/delhivery/tracking'
};

const initialDeliveryPartners = [initialDelhiveryConfig];

// Seed Payment Gateway (Razorpay Only)
const initialRazorpayConfig = {
  id: 'pg-razorpay',
  name: 'Razorpay PG',
  slug: 'razorpay',
  status: 'Active',
  isDefault: true,
  mode: 'Live', // 'Live' | 'Test'
  keyId: 'rzp_live_8F9a21Bbc42',
  keySecret: 'sec_live_9941a87b003c21',
  webhookSecret: 'whsec_rzp_kapee_2026',
  webhookUrl: 'https://kapee.in/api/webhooks/razorpay',
  methods: ['UPI (GPay / PhonePe / Paytm)', 'Cards (Visa / Master / RuPay)', 'Net Banking (All Indian Banks)'],
  autoCapture: true,
  themeColor: '#0A5C55'
};

const initialPaymentGateways = [initialRazorpayConfig];

// Seed Homepage CMS Content
const initialHeroSlides = [
  {
    id: 'slide-1',
    tag: 'THE ZERO-CHEMICAL REVOLUTION',
    headline: 'Wipe Away Every Stain. Magic Included.',
    subtext: 'Powered by 100% German-grade melamine micro-abrasive foam. Erase tough grime, tile limescale, wall scuffs, and sneaker dirt with just plain tap water.',
    image: '/hero_banner.png',
    primaryCtaText: 'Shop Magic Erasers',
    primaryCtaLink: '/shop',
    secondaryCtaText: 'Explore Combos',
    secondaryCtaLink: '/shop',
    pillText: 'Water Only • Zero Toxic Fumes',
    active: true,
    order: 1
  },
  {
    id: 'slide-2',
    tag: 'FESTIVAL READY & SPOTLESS LIVING',
    headline: 'Deep Clean Every Room In Half The Time.',
    subtext: 'From burnt kitchen tadka oil to stubborn bathroom shower stains, discover our curated sponges designed specifically for Indian households.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80',
    primaryCtaText: 'Explore Cleaners',
    primaryCtaLink: '/shop',
    secondaryCtaText: 'View All Products',
    secondaryCtaLink: '/shop',
    pillText: 'Water-Activated Foam',
    active: true,
    order: 2
  },
  {
    id: 'slide-3',
    tag: 'FOR SNEAKERHEADS & SHOE LOVERS',
    headline: 'Restore Bright White Kicks In Just 3 Minutes.',
    subtext: 'Eliminate stubborn rubber midsole scuffs and oxidized yellowing effortlessly without soaking your shoes in water.',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
    primaryCtaText: 'Get Sneaker Kit',
    primaryCtaLink: '/shop',
    secondaryCtaText: 'Shop All Sponges',
    secondaryCtaLink: '/shop',
    pillText: 'Rated 4.9★ by 900+ Sneakerheads',
    active: true,
    order: 3
  }
];

// The website shows `badge` (one pill), so it is kept as the first of the selected `badges`
const withBadges = (product) => {
  const badges = productBadgeList(product);
  return { ...product, badges, badge: badges[0] || '' };
};

// Reviews are stored with the website's field names (author, productName, helpful, date);
// the admin Reviews page uses name, productTitle, helpfulCount and createdAt
const reviewFromApi = (r) => ({
  ...r,
  name: r.author,
  productTitle: r.productName,
  helpfulCount: r.helpful,
  createdAt: r.date
});
const reviewToApi = ({ name, productTitle, helpfulCount, createdAt, ...rest }) => ({
  ...rest,
  productId: rest.productId || '',
  author: name,
  productName: productTitle,
  helpful: helpfulCount || 0,
  // Website shows dates like "18 Oct 2026"
  date: createdAt && !Number.isNaN(Date.parse(createdAt)) && createdAt.includes('T')
    ? new Date(createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : createdAt
});

// Pending backend saves per home section (see persistHomeSection)
const homeSaveQueue = {};

// Contact page saves run one after another (see saveContactSection)
let contactSaveQueue = Promise.resolve();

// Our Story page saves run one after another (see saveOurStory)
let ourStorySaveQueue = Promise.resolve();

// FAQ page saves run one after another (see changeFaqPage)
let faqSaveQueue = Promise.resolve();

// Policy saves run one after another (see savePolicies)
let policySaveQueue = Promise.resolve();

// Footer saves run one after another (see saveFooter)
let footerSaveQueue = Promise.resolve();

// Announcement ticker saves run one after another (see saveAnnouncementMessages)
let announcementSaveQueue = Promise.resolve();

const enquiryFromApi = (e) => ({
  ...e,
  date: e.createdAt
    ? new Date(e.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : ''
});

export const useAdminStore = create(
  persist(
    (set, get) => ({
      // Theme & UI state
      darkMode: false,
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', next);
            document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
          }
          return { darkMode: next };
        }),
      toggleTheme: () =>
        set((state) => {
          const next = !state.darkMode;
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', next);
            document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
          }
          return { darkMode: next };
        }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      soundEnabled: false,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      // Unsaved changes bar
      hasUnsavedChanges: false,
      setHasUnsavedChanges: (val) => set({ hasUnsavedChanges: val }),

      // Toasts
      toasts: [],
      addToast: (toast) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newToast = { id, timestamp: Date.now(), ...toast };
        set((state) => ({ toasts: [newToast, ...state.toasts.slice(0, 4)] }));
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, toast.duration || 4500);
      },
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      // Auth & Role
      // Logged-in admin (from the backend session cookie); null = not logged in
      currentUser: null,
      adminSessionChecked: false,
      setCurrentUser: (user) => set({ currentUser: user }),
      loadAdminSession: async () => {
        try {
          set({ currentUser: await adminAuthApi.fetchAdminMe(), adminSessionChecked: true });
        } catch {
          set({ currentUser: null, adminSessionChecked: true });
        }
      },
      adminLogin: async (email, password) => {
        const admin = await adminAuthApi.adminLogin(email, password);
        set({ currentUser: admin, adminSessionChecked: true });
        return admin;
      },
      adminLogout: async () => {
        set({ currentUser: null });
        try {
          await adminAuthApi.adminLogout();
        } catch (err) {
          console.error('Admin logout failed:', err);
        }
      },
      users: initialAdmins,
      addUser: (user) => {
        const newUser = { id: `usr-${Date.now()}`, ...user, lastLogin: 'Never' };
        set((state) => ({ users: [...state.users, newUser] }));
        get().logActivity('Team', `Invited admin member ${user.name} with role ${user.role}`);
      },
      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u))
        }));
        get().logActivity('Team', `Updated user details for ID: ${id}`);
      },
      deleteUser: (id) => {
        set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
        get().logActivity('Team', `Removed user ID: ${id}`);
      },

      // Activity Audit Log
      activityLogs: [
        { id: 'act-1', user: 'Karan Patel', role: 'Super Admin', action: 'Published Product', details: 'KAPEE Magic Eraser Sponge (Pack of 5)', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
        { id: 'act-2', user: 'Neha Mehta', role: 'Manager', action: 'Applied Coupon', details: 'Created coupon CLEAN50 with ₹50 flat discount', timestamp: new Date(Date.now() - 120 * 60000).toISOString() },
        { id: 'act-3', user: 'Amit Shah', role: 'Support', action: 'Updated Order Status', details: 'Marked order #KAP-1031 as Shipped via Shiprocket', timestamp: new Date(Date.now() - 240 * 60000).toISOString() },
        { id: 'act-4', user: 'Karan Patel', role: 'Super Admin', action: 'Connected Partner', details: 'Tested live connection with Delhivery Direct API', timestamp: new Date(Date.now() - 480 * 60000).toISOString() }
      ],
      logActivity: (category, details) => {
        const user = get().currentUser || { name: 'Admin', role: 'Super Admin' };
        const newLog = {
          id: `act-${Date.now()}`,
          user: user.name,
          role: user.role,
          action: category,
          details,
          timestamp: new Date().toISOString()
        };
        set((state) => ({ activityLogs: [newLog, ...state.activityLogs] }));
      },

      // Products CRUD - every change is also saved to the backend (/api/products),
      // which decides the Home page best sellers from the product badge
      products: [],
      loadProducts: async () => {
        try {
          set({ products: await productApi.fetchProducts() });
        } catch (err) {
          console.error('Failed to load products:', err);
        }
      },
      syncProduct: (request, title) => {
        request
          .then(() => {
            get().loadHomeContent();
            // The website catalogue shows the change without a page reload
            useProductStore.getState().loadProducts();
          })
          .catch((err) => {
            get().addToast({ type: 'error', title: 'Save Failed', message: `Could not save "${title}": ${err.message}` });
          });
      },
      addProduct: (prod) => {
        const id = `prod-${Date.now()}`;
        const baseSlug = prod.slug || prod.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        // Slugs must be unique (e.g. when duplicating a product)
        const slug = get().products.some((p) => p.slug === baseSlug) ? `${baseSlug}-${id.slice(5)}` : baseSlug;
        const newProduct = withBadges({
          ...prod,
          id,
          slug,
          // rating / reviewCount come from the approved reviews (worked out by the backend)
          rating: 0,
          reviewCount: 0,
          stock: Number(prod.stock) || 50,
          basePrice: Number(prod.basePrice) || 199,
          baseMrp: Number(prod.baseMrp) || 399,
          images: prod.images?.length ? prod.images : ['/products/magic_eraser.jpg']
        });
        set((state) => ({ products: [newProduct, ...state.products] }));
        get().syncProduct(productApi.saveProduct(newProduct), newProduct.title);
        get().logActivity('Products', `Created new product "${newProduct.title}"`);
      },
      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? withBadges({ ...p, ...updates }) : p))
        }));
        const product = get().products.find((p) => p.id === id);
        if (product) get().syncProduct(productApi.saveProduct(product), product.title);
        get().logActivity('Products', `Updated product details for ID: ${id}`);
      },
      deleteProduct: (id) => {
        const target = get().products.find((p) => p.id === id);
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
        get().syncProduct(productApi.deleteProduct(id), target?.title || id);
        get().logActivity('Products', `Deleted product: ${target?.title || id}`);
      },

      // Categories CRUD
      categories: initialCategories,
      addCategory: (cat) => {
        const newCat = { id: `cat-${Date.now()}`, slug: cat.name.toLowerCase().replace(/\s+/g, '-'), count: 0, sortOrder: get().categories.length + 1, showInMenu: true, ...cat };
        set((state) => ({ categories: [...state.categories, newCat] }));
        get().logActivity('Categories', `Created category: ${newCat.name}`);
      },
      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c))
        }));
        get().logActivity('Categories', `Updated category ID: ${id}`);
      },
      deleteCategory: (id) => {
        set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
        get().logActivity('Categories', `Deleted category ID: ${id}`);
      },

      // Orders - placed on the website checkout or booked here; stored in the backend (/api/orders)
      orders: [],
      ordersLoaded: false,
      loadOrders: async () => {
        try {
          set({ orders: await orderApi.fetchOrders(), ordersLoaded: true });
        } catch (err) {
          console.error('Failed to load orders:', err);
        }
      },
      // Called every few seconds while the admin panel is open: shows a notification for each new order
      checkNewOrders: async () => {
        if (!get().ordersLoaded) return get().loadOrders();
        let latest;
        try {
          latest = await orderApi.fetchOrders();
        } catch {
          return; // backend not reachable right now; try again on the next check
        }
        const known = new Set(get().orders.map((o) => o.id));
        const arrived = latest.filter((o) => !known.has(o.id));
        set({ orders: latest });
        if (!arrived.length) return;
        playOrderChime();
        arrived.slice(0, 3).forEach((o) =>
          get().addToast({
            type: 'order',
            title: `New Order ${o.orderNumber}`,
            message: `${o.customer.name} • ₹${o.pricing.total.toLocaleString('en-IN')} • ${o.items.length} item(s)`,
            action: { label: 'View', to: `/admin/orders?order=${o.id}` },
            duration: 10000
          })
        );
        if (arrived.length > 3) {
          get().addToast({
            type: 'order',
            title: `${arrived.length - 3} more new orders`,
            action: { label: 'View', to: '/admin/orders' },
            duration: 10000
          });
        }
      },
      // Bell notifications: website orders are unread (adminRead: false) until opened or marked as read
      setOrdersRead: async (ids, read = true) => {
        const before = get().orders;
        const targets = ids || before.map((o) => o.id);
        set({ orders: before.map((o) => (targets.includes(o.id) ? { ...o, adminRead: read } : o)) });
        try {
          await orderApi.markOrdersRead(ids || null, read);
        } catch (err) {
          set({ orders: before });
          get().addToast({ type: 'error', title: 'Not Saved', message: `Could not update notifications: ${err.message}` });
        }
      },
      markOrderRead: (id) => {
        const order = get().orders.find((o) => o.id === id);
        if (order && order.adminRead === false) get().setOrdersRead([id], true);
      },
      // Manual order booked by the admin; returns the saved order (throws on failure)
      addOrder: async (order) => {
        const saved = await orderApi.createManualOrder(order);
        set((state) => ({ orders: [saved, ...state.orders] }));
        get().logActivity('Orders', `Created manual order #${saved.orderNumber}`);
        return saved;
      },
      // Saves changes (status, payment status, courier, AWB, notes) and returns the saved order
      updateOrder: async (id, changes) => {
        try {
          const saved = await orderApi.updateOrder(id, changes);
          set((state) => ({ orders: state.orders.map((o) => (o.id === id ? saved : o)) }));
          get().logActivity('Orders', `Updated order #${saved.orderNumber}`);
          return saved;
        } catch (err) {
          get().addToast({ type: 'error', title: 'Save Failed', message: `Could not update the order: ${err.message}` });
          return null;
        }
      },
      updateOrderStatus: (id, newStatus) => get().updateOrder(id, { status: newStatus }),
      deleteOrder: async (id) => {
        try {
          await orderApi.deleteOrder(id);
          const order = get().orders.find((o) => o.id === id);
          set((state) => ({ orders: state.orders.filter((o) => o.id !== id) }));
          get().logActivity('Orders', `Deleted order #${order?.orderNumber || id}`);
          return true;
        } catch (err) {
          get().addToast({ type: 'error', title: 'Delete Failed', message: `Could not delete the order: ${err.message}` });
          return false;
        }
      },

      // Customers CRUD - the accounts registered on the website (backend /api/admin/customers)
      customers: [],
      loadCustomers: async () => {
        try {
          set({ customers: await customerApi.fetchCustomers() });
        } catch (err) {
          console.error('Failed to load customers:', err);
        }
      },
      addCustomer: async (cust) => {
        const newCust = await customerApi.createCustomer(cust);
        set((state) => ({ customers: [newCust, ...state.customers] }));
        get().logActivity('Customers', `Created customer profile for ${newCust.name}`);
        return newCust;
      },
      updateCustomer: async (id, updates) => {
        const current = get().customers.find((c) => c.id === id);
        const saved = await customerApi.updateCustomer(id, { ...current, ...updates });
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? saved : c))
        }));
        get().logActivity('Customers', `Updated customer ${id}`);
        return saved;
      },
      deleteCustomer: async (id) => {
        await customerApi.deleteCustomer(id);
        set((state) => ({ customers: state.customers.filter((c) => c.id !== id) }));
        get().logActivity('Customers', `Removed customer ${id}`);
      },

      // Reviews & Q&A CRUD
      // Reviews CRUD - stored in the backend (/api/reviews); approved ones show on the website
      reviews: [],
      loadReviews: async () => {
        try {
          const reviews = await reviewApi.fetchReviews();
          set({ reviews: reviews.map(reviewFromApi) });
        } catch (err) {
          console.error('Failed to load reviews:', err);
        }
      },
      syncReview: (id) => {
        const review = get().reviews.find((r) => r.id === id);
        const request = review ? reviewApi.saveReview(reviewToApi(review)) : reviewApi.deleteReview(id);
        request
          .then(() => get().loadHomeContent())
          .catch((err) => {
            get().addToast({ type: 'error', title: 'Save Failed', message: `Could not save review: ${err.message}` });
          });
      },
      addReview: (rev) => {
        const newRev = {
          id: `rev-${Date.now()}`,
          status: 'Approved',
          helpfulCount: 0,
          verified: true,
          createdAt: new Date().toISOString(),
          ...rev
        };
        set((state) => ({ reviews: [newRev, ...state.reviews] }));
        get().syncReview(newRev.id);
        get().logActivity('Reviews', `Added review by ${newRev.name}`);
      },
      updateReview: (id, updates) => {
        set((state) => ({
          reviews: state.reviews.map((r) => (r.id === id ? { ...r, ...updates } : r))
        }));
        get().syncReview(id);
        get().logActivity('Reviews', `Edited review ${id}`);
      },
      updateReviewStatus: (id, status) => {
        set((state) => ({
          reviews: state.reviews.map((r) => (r.id === id ? { ...r, status } : r))
        }));
        get().syncReview(id);
        get().logActivity('Reviews', `Marked review ${id} as ${status}`);
      },
      replyToReview: (id, replyText) => {
        set((state) => ({
          reviews: state.reviews.map((r) => (r.id === id ? { ...r, reply: replyText } : r))
        }));
        get().syncReview(id);
        get().logActivity('Reviews', `Replied to review ${id}`);
      },
      deleteReview: (id) => {
        set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) }));
        get().syncReview(id);
        get().logActivity('Reviews', `Deleted review ${id}`);
      },

      // FAQ page - questions, categories and page text all come from the backend (GET /api/faq)
      // and every change below saves the whole page back (PUT /api/faq)
      faqPage: null,
      loadFaqPage: async () => {
        try {
          set({ faqPage: await faqApi.fetchFaq() });
        } catch (err) {
          console.error('Failed to load FAQ page:', err);
        }
      },
      // Applies a change, saves it and returns the save request; on failure the page is reloaded from the backend
      changeFaqPage: (change, activity) => {
        set((state) => ({ faqPage: change(state.faqPage || { categories: [], faqs: [] }) }));
        get().logActivity('FAQ', activity);
        const request = faqSaveQueue.then(() => faqApi.saveFaq(get().faqPage));
        faqSaveQueue = request.catch(() => {});
        return request
          .then((saved) => set({ faqPage: saved }))
          .catch((err) => {
            get().addToast({ type: 'error', title: 'Save Failed', message: `Could not save FAQs: ${err.message}` });
            get().loadFaqPage();
            throw err;
          });
      },
      updateFaqPage: (updates) => get().changeFaqPage((page) => ({ ...page, ...updates }), 'Updated FAQ page text'),
      addFaqCategory: (cat) => {
        const trimmed = (cat || '').trim();
        return get().changeFaqPage(
          (page) => (page.categories.includes(trimmed) ? page : { ...page, categories: [...page.categories, trimmed] }),
          `Added FAQ category "${trimmed}"`
        );
      },
      // Questions in the deleted category move to the first remaining category
      deleteFaqCategory: (catToDelete) =>
        get().changeFaqPage((page) => {
          const remaining = page.categories.filter((c) => c !== catToDelete);
          return {
            ...page,
            categories: remaining,
            faqs: page.faqs.map((f) => (f.category === catToDelete ? { ...f, category: remaining[0] } : f))
          };
        }, `Deleted FAQ category "${catToDelete}"`),
      addFaq: (faq) =>
        get().changeFaqPage(
          (page) => ({ ...page, faqs: [...page.faqs, { id: `faq-${Date.now()}`, published: true, ...faq }] }),
          `Added FAQ: "${faq.question.slice(0, 30)}..."`
        ),
      updateFaq: (id, updates) =>
        get().changeFaqPage(
          (page) => ({ ...page, faqs: page.faqs.map((f) => (f.id === id ? { ...f, ...updates } : f)) }),
          `Updated FAQ ID: ${id}`
        ),
      deleteFaq: (id) =>
        get().changeFaqPage((page) => ({ ...page, faqs: page.faqs.filter((f) => f.id !== id) }), `Deleted FAQ ID: ${id}`),

      // Offers & Coupons
      // Coupons CRUD - stored in the backend (/api/coupons); active ones show on product pages and work in the cart
      coupons: [],
      loadCoupons: async () => {
        try {
          set({ coupons: await couponApi.fetchCoupons() });
        } catch (err) {
          console.error('Failed to load coupons:', err);
        }
      },
      syncCoupon: (request, code) => {
        request.catch((err) => {
          get().addToast({ type: 'error', title: 'Save Failed', message: `Could not save coupon ${code}: ${err.message}` });
        });
      },
      addCoupon: (cpn) => {
        const newCoupon = { id: `c-${Date.now()}`, usedCount: 0, status: 'Active', ...cpn };
        set((state) => ({ coupons: [newCoupon, ...state.coupons] }));
        get().syncCoupon(couponApi.saveCoupon(newCoupon), newCoupon.code);
        get().logActivity('Coupons', `Created promo code: ${newCoupon.code}`);
      },
      updateCoupon: (id, updates) => {
        set((state) => ({
          coupons: state.coupons.map((c) => (c.id === id ? { ...c, ...updates } : c))
        }));
        const coupon = get().coupons.find((c) => c.id === id);
        if (coupon) get().syncCoupon(couponApi.saveCoupon(coupon), coupon.code);
        get().logActivity('Coupons', `Updated coupon ID: ${id}`);
      },
      deleteCoupon: (id) => {
        const target = get().coupons.find((c) => c.id === id);
        set((state) => ({ coupons: state.coupons.filter((c) => c.id !== id) }));
        get().syncCoupon(couponApi.deleteCoupon(id), target?.code || id);
        get().logActivity('Coupons', `Deleted coupon ID: ${id}`);
      },

      // Delivery & Payments (Delhivery & Razorpay only)
      delhiveryConfig: initialDelhiveryConfig,
      updateDelhiveryConfig: (updates) => {
        set((state) => ({
          delhiveryConfig: { ...(state.delhiveryConfig || initialDelhiveryConfig), ...updates }
        }));
        get().logActivity('Delivery', 'Updated Delhivery courier API configuration');
      },
      deliveryPartners: initialDeliveryPartners,
      updateDeliveryPartner: (id, updates) => {
        set((state) => ({
          deliveryPartners: (state.deliveryPartners || initialDeliveryPartners).map((d) =>
            d.id === id ? { ...d, ...updates } : d
          )
        }));
        get().logActivity('Delivery', `Updated partner settings for ${id}`);
      },

      razorpayConfig: initialRazorpayConfig,
      updateRazorpayConfig: (updates) => {
        set((state) => ({
          razorpayConfig: { ...(state.razorpayConfig || initialRazorpayConfig), ...updates }
        }));
        get().logActivity('Payments', 'Updated Razorpay payment gateway credentials');
      },
      paymentGateways: initialPaymentGateways,
      updatePaymentGateway: (id, updates) => {
        set((state) => ({
          paymentGateways: (state.paymentGateways || initialPaymentGateways).map((p) =>
            p.id === id ? { ...p, ...updates } : p
          )
        }));
        get().logActivity('Payments', `Updated payment gateway config for ${id}`);
      },

      // Homepage CMS - all content comes from the backend (GET /api/home) and every
      // change below is saved back section by section (PUT /api/home/{section})
      homeLoaded: false,
      seo: null,
      heroBanner: null,
      trustSection: null,
      trustPillars: [],
      bestSellersSection: null,
      beforeAfterSettings: null,
      howItWorksHeader: null,
      howItWorksSteps: [],
      reviewsSection: null,
      comparisonTable: null,
      ugcSection: null,
      homepageSections: [],
      homeBestSellers: [],
      homeFeaturedReviews: [],

      loadHomeContent: async () => {
        try {
          const { bestSellers, featuredReviews, ...sections } = await homeApi.fetchHome();
          set({
            ...sections,
            homeBestSellers: bestSellers || [],
            homeFeaturedReviews: featuredReviews || [],
            homeLoaded: true
          });
        } catch (err) {
          // Keep the last cached (persisted) content so the page still renders
          set({ homeLoaded: true });
          console.error('Failed to load home content:', err);
        }
      },

      persistHomeSection: (section) => {
        // Saves of the same section run one after another and always send the latest value
        homeSaveQueue[section] = (homeSaveQueue[section] || Promise.resolve())
          .then(() => homeApi.saveHomeSection(section, get()[section]))
          .then(() => {
            // These sections decide which products/reviews the API returns, so refresh them
            if (section === 'bestSellersSection' || section === 'reviewsSection') {
              return get().loadHomeContent();
            }
          })
          .catch((err) => {
            get().addToast({ type: 'error', title: 'Save Failed', message: `Could not save ${section}: ${err.message}` });
          });
      },

      // Merge updates into an object section (seo, trustSection, bestSellersSection, reviewsSection, ugcSection)
      updateHomeContent: (section, updates) => {
        set((state) => ({ [section]: { ...(state[section] || {}), ...updates } }));
        get().persistHomeSection(section);
        get().logActivity('CMS', `Updated homepage ${section}`);
      },

      // Hero Banner & Action Strip
      updateHeroBanner: (updates) => {
        set((state) => ({ heroBanner: { ...(state.heroBanner || {}), ...updates } }));
        get().persistHomeSection('heroBanner');
        get().logActivity('CMS', 'Updated Hero Banner & Action Strip');
      },

      // Real Transformations (Before / After Slider)
      updateBeforeAfterSettings: (updates) => {
        set((state) => ({ beforeAfterSettings: { ...(state.beforeAfterSettings || {}), ...updates } }));
        get().persistHomeSection('beforeAfterSettings');
        get().logActivity('CMS', 'Updated Transformations (Before/After) Settings');
      },
      addBeforeAfterItem: (item) => {
        const newItem = { id: `ba-${Date.now()}`, active: true, ...item };
        set((state) => ({
          beforeAfterSettings: {
            ...(state.beforeAfterSettings || {}),
            items: [...(state.beforeAfterSettings?.items || []), newItem]
          }
        }));
        get().persistHomeSection('beforeAfterSettings');
        get().logActivity('CMS', `Added transformation item "${newItem.surface}"`);
      },
      updateBeforeAfterItem: (id, updates) => {
        set((state) => ({
          beforeAfterSettings: {
            ...(state.beforeAfterSettings || {}),
            items: (state.beforeAfterSettings?.items || []).map((it) => (it.id === id ? { ...it, ...updates } : it))
          }
        }));
        get().persistHomeSection('beforeAfterSettings');
        get().logActivity('CMS', `Updated transformation item ${id}`);
      },
      deleteBeforeAfterItem: (id) => {
        set((state) => ({
          beforeAfterSettings: {
            ...(state.beforeAfterSettings || {}),
            items: (state.beforeAfterSettings?.items || []).filter((it) => it.id !== id)
          }
        }));
        get().persistHomeSection('beforeAfterSettings');
        get().logActivity('CMS', `Deleted transformation item ${id}`);
      },

      // Comparison Table ("Why Choose KAPEE Over Ordinary Cleaners?")
      updateComparisonTable: (updates) => {
        set((state) => ({ comparisonTable: { ...(state.comparisonTable || {}), ...updates } }));
        get().persistHomeSection('comparisonTable');
        get().logActivity('CMS', 'Updated Comparison Table Settings');
      },
      addComparisonRow: (row) => {
        const newRow = { id: `cmp-${Date.now()}`, active: true, ...row };
        set((state) => ({
          comparisonTable: {
            ...(state.comparisonTable || {}),
            rows: [...(state.comparisonTable?.rows || []), newRow]
          }
        }));
        get().persistHomeSection('comparisonTable');
        get().logActivity('CMS', `Added comparison row "${newRow.feature}"`);
      },
      updateComparisonRow: (id, updates) => {
        set((state) => ({
          comparisonTable: {
            ...(state.comparisonTable || {}),
            rows: (state.comparisonTable?.rows || []).map((r) => (r.id === id ? { ...r, ...updates } : r))
          }
        }));
        get().persistHomeSection('comparisonTable');
        get().logActivity('CMS', `Updated comparison row ${id}`);
      },
      deleteComparisonRow: (id) => {
        set((state) => ({
          comparisonTable: {
            ...(state.comparisonTable || {}),
            rows: (state.comparisonTable?.rows || []).filter((r) => r.id !== id)
          }
        }));
        get().persistHomeSection('comparisonTable');
        get().logActivity('CMS', `Deleted comparison row ${id}`);
      },

      // Trust Pillars ("Why Choose KAPEE?")
      updateTrustPillar: (id, updates) => {
        set((state) => ({
          trustPillars: (state.trustPillars || []).map((p) => (p.id === id ? { ...p, ...updates } : p))
        }));
        get().persistHomeSection('trustPillars');
        get().logActivity('CMS', `Updated trust pillar ${id}`);
      },
      addTrustPillar: (pillar) => {
        const newPillar = { id: `tp-${Date.now()}`, active: true, ...pillar };
        set((state) => ({ trustPillars: [...(state.trustPillars || []), newPillar] }));
        get().persistHomeSection('trustPillars');
        get().logActivity('CMS', `Added trust pillar "${newPillar.title}"`);
      },
      deleteTrustPillar: (id) => {
        set((state) => ({ trustPillars: (state.trustPillars || []).filter((p) => p.id !== id) }));
        get().persistHomeSection('trustPillars');
        get().logActivity('CMS', `Deleted trust pillar ${id}`);
      },

      // How It Works Steps ("Wet. Wipe. Wow.")
      updateHowItWorksHeader: (updates) => {
        set((state) => ({ howItWorksHeader: { ...(state.howItWorksHeader || {}), ...updates } }));
        get().persistHomeSection('howItWorksHeader');
        get().logActivity('CMS', 'Updated "Wet. Wipe. Wow." header texts');
      },
      updateHowItWorksStep: (id, updates) => {
        set((state) => ({
          howItWorksSteps: (state.howItWorksSteps || []).map((s) => (s.id === id ? { ...s, ...updates } : s))
        }));
        get().persistHomeSection('howItWorksSteps');
        get().logActivity('CMS', `Updated how-it-works step ${id}`);
      },
      addHowItWorksStep: (step) => {
        const newStep = { id: `hw-${Date.now()}`, active: true, ...step };
        set((state) => ({ howItWorksSteps: [...(state.howItWorksSteps || []), newStep] }));
        get().persistHomeSection('howItWorksSteps');
        get().logActivity('CMS', `Added step "${newStep.title}"`);
      },
      deleteHowItWorksStep: (id) => {
        set((state) => ({ howItWorksSteps: (state.howItWorksSteps || []).filter((s) => s.id !== id) }));
        get().persistHomeSection('howItWorksSteps');
        get().logActivity('CMS', `Deleted step ${id}`);
      },

      // Homepage Sections Visibility
      updateHomepageSection: (id, updates) => {
        set((state) => ({
          homepageSections: (state.homepageSections || []).map((sec) => (sec.id === id ? { ...sec, ...updates } : sec))
        }));
        get().persistHomeSection('homepageSections');
        get().logActivity('CMS', `Toggled section visibility: ${id}`);
      },

      // Contact Page CMS - all content comes from the backend (GET /api/contact) and every
      // change below saves the whole page back (PUT /api/contact)
      contactSection: null,
      loadContactContent: async () => {
        try {
          set({ contactSection: await contactApi.fetchContact() });
        } catch (err) {
          console.error('Failed to load contact page:', err);
        }
      },
      // Returns the save request so the admin page can confirm it; on failure the page is reloaded from the backend
      saveContactSection: () => {
        const request = contactSaveQueue.then(() => contactApi.saveContact(get().contactSection));
        contactSaveQueue = request.catch(() => {});
        return request.catch((err) => {
          get().addToast({ type: 'error', title: 'Save Failed', message: `Could not save contact page: ${err.message}` });
          get().loadContactContent();
          throw err;
        });
      },
      updateContactSection: (updates) => {
        set((state) => ({ contactSection: { ...(state.contactSection || {}), ...updates } }));
        get().logActivity('CMS', 'Updated Contact Section Settings');
        return get().saveContactSection();
      },
      addContactCard: (card) => {
        const newCard = { id: `cc-${Date.now()}`, active: true, ...card };
        set((state) => ({
          contactSection: { ...(state.contactSection || {}), cards: [...(state.contactSection?.cards || []), newCard] }
        }));
        get().logActivity('CMS', `Added contact card "${newCard.title}"`);
        return get().saveContactSection();
      },
      updateContactCard: (id, updates) => {
        set((state) => ({
          contactSection: {
            ...(state.contactSection || {}),
            cards: (state.contactSection?.cards || []).map((c) => (c.id === id ? { ...c, ...updates } : c))
          }
        }));
        get().logActivity('CMS', `Updated contact card ${id}`);
        return get().saveContactSection();
      },
      deleteContactCard: (id) => {
        set((state) => ({
          contactSection: {
            ...(state.contactSection || {}),
            cards: (state.contactSection?.cards || []).filter((c) => c.id !== id)
          }
        }));
        get().logActivity('CMS', `Deleted contact card ${id}`);
        return get().saveContactSection();
      },

      // Our Story Page CMS - all content comes from the backend (GET /api/our-story) and every
      // change below saves the whole page back (PUT /api/our-story)
      ourStory: null,
      loadOurStory: async () => {
        try {
          set({ ourStory: await ourStoryApi.fetchOurStory() });
        } catch (err) {
          console.error('Failed to load Our Story page:', err);
        }
      },
      // Returns the save request so the admin page can confirm it; on failure the page is reloaded from the backend
      saveOurStory: () => {
        const request = ourStorySaveQueue.then(() => ourStoryApi.saveOurStory(get().ourStory));
        ourStorySaveQueue = request.catch(() => {});
        return request.catch((err) => {
          get().addToast({ type: 'error', title: 'Save Failed', message: `Could not save Our Story page: ${err.message}` });
          get().loadOurStory();
          throw err;
        });
      },
      updateOurStory: (updates) => {
        set((state) => ({ ourStory: { ...(state.ourStory || {}), ...updates } }));
        get().logActivity('CMS', 'Updated Our Story Page Content');
        return get().saveOurStory();
      },
      addOurStoryValue: (value) => {
        const newVal = { id: `val-${Date.now()}`, active: true, ...value };
        set((state) => ({
          ourStory: { ...(state.ourStory || {}), values: [...(state.ourStory?.values || []), newVal] }
        }));
        get().logActivity('CMS', `Added Brand Value "${newVal.title}"`);
        return get().saveOurStory();
      },
      updateOurStoryValue: (id, updates) => {
        set((state) => ({
          ourStory: {
            ...(state.ourStory || {}),
            values: (state.ourStory?.values || []).map((v) => (v.id === id ? { ...v, ...updates } : v))
          }
        }));
        get().logActivity('CMS', `Updated Brand Value ${id}`);
        return get().saveOurStory();
      },
      deleteOurStoryValue: (id) => {
        set((state) => ({
          ourStory: { ...(state.ourStory || {}), values: (state.ourStory?.values || []).filter((v) => v.id !== id) }
        }));
        get().logActivity('CMS', `Deleted Brand Value ${id}`);
        return get().saveOurStory();
      },

      // Policy Pages CMS - every policy comes from the backend (GET /api/policies) and is saved back
      // all together (PUT /api/policies)
      policies: null,
      loadPolicies: async () => {
        try {
          set({ policies: await policyApi.fetchPolicies() });
        } catch (err) {
          console.error('Failed to load policies:', err);
        }
      },
      // Returns the save request; on failure the policies are reloaded from the backend
      savePolicies: (newPolicies, activity) => {
        set({ policies: newPolicies });
        get().logActivity('CMS', activity);
        const request = policySaveQueue.then(() => policyApi.savePolicies(newPolicies));
        policySaveQueue = request.catch(() => {});
        return request.catch((err) => {
          get().addToast({ type: 'error', title: 'Save Failed', message: `Could not save policies: ${err.message}` });
          get().loadPolicies();
          throw err;
        });
      },

      // Footer CMS - all footer content comes from the backend (GET /api/footer) and every
      // change below saves the whole footer back (PUT /api/footer)
      footer: null,
      loadFooter: async () => {
        try {
          set({ footer: await footerApi.fetchFooter() });
        } catch (err) {
          console.error('Failed to load footer:', err);
        }
      },
      // Returns the save request; on failure the footer is reloaded from the backend
      saveFooter: () => {
        const request = footerSaveQueue.then(() => footerApi.saveFooter(get().footer));
        footerSaveQueue = request.catch(() => {});
        return request.catch((err) => {
          get().addToast({ type: 'error', title: 'Save Failed', message: `Could not save footer: ${err.message}` });
          get().loadFooter();
          throw err;
        });
      },
      updateFooter: (updates) => {
        set((state) => ({ footer: { ...(state.footer || {}), ...updates } }));
        get().logActivity('CMS', 'Updated Footer Content');
        return get().saveFooter();
      },
      // column is 'shopLinks' or 'companyLinks'
      addFooterLink: (column, link) => {
        const newLink = { id: `link-${Date.now()}`, ...link };
        set((state) => ({
          footer: { ...(state.footer || {}), [column]: [...(state.footer?.[column] || []), newLink] }
        }));
        get().logActivity('CMS', `Added Footer Link "${newLink.label}"`);
        return get().saveFooter();
      },
      updateFooterLink: (column, id, updates) => {
        set((state) => ({
          footer: {
            ...(state.footer || {}),
            [column]: (state.footer?.[column] || []).map((l) => (l.id === id ? { ...l, ...updates } : l))
          }
        }));
        get().logActivity('CMS', `Updated Footer Link ${id}`);
        return get().saveFooter();
      },
      deleteFooterLink: (column, id) => {
        set((state) => ({
          footer: { ...(state.footer || {}), [column]: (state.footer?.[column] || []).filter((l) => l.id !== id) }
        }));
        get().logActivity('CMS', `Deleted Footer Link ${id}`);
        return get().saveFooter();
      },

      // Top announcement ticker - messages come from the backend (GET /api/announcement-bar) and
      // are saved back all together (PUT /api/announcement-bar)
      announcementBar: null,
      loadAnnouncementBar: async () => {
        try {
          set({ announcementBar: await announcementApi.fetchAnnouncementBar() });
        } catch (err) {
          console.error('Failed to load announcement bar:', err);
        }
      },
      // Returns the save request; on failure the messages are reloaded from the backend
      saveAnnouncementMessages: (messages, activity) => {
        set((state) => ({ announcementBar: { ...(state.announcementBar || {}), messages } }));
        get().logActivity('CMS', activity);
        const request = announcementSaveQueue.then(() => announcementApi.saveAnnouncementBar(get().announcementBar));
        announcementSaveQueue = request.catch(() => {});
        return request.catch((err) => {
          get().addToast({ type: 'error', title: 'Save Failed', message: `Could not save announcement bar: ${err.message}` });
          get().loadAnnouncementBar();
          throw err;
        });
      },

      heroSlides: initialHeroSlides,
      updateHeroSlide: (id, updates) => {
        set((state) => ({
          heroSlides: state.heroSlides.map((s) => (s.id === id ? { ...s, ...updates } : s))
        }));
        get().logActivity('CMS', `Updated hero slide ${id}`);
      },
      addHeroSlide: (slide) => {
        const newSlide = { id: `slide-${Date.now()}`, active: true, order: (get().heroSlides || []).length + 1, ...slide };
        set((state) => ({ heroSlides: [...(state.heroSlides || []), newSlide] }));
        get().logActivity('CMS', `Added hero slide "${newSlide.headline || newSlide.title}"`);
      },
      deleteHeroSlide: (id) => {
        set((state) => ({ heroSlides: (state.heroSlides || []).filter((s) => s.id !== id) }));
        get().logActivity('CMS', `Deleted hero slide ${id}`);
      },

      // Media Library items
      mediaLibrary: [
        { id: 'med-1', name: 'magic_eraser.jpg', url: '/products/magic_eraser.jpg', size: '240 KB', folder: 'Products', type: 'image/jpeg' },
        { id: 'med-2', name: 'magic_eraser_hover.jpg', url: '/products/magic_eraser_hover.jpg', size: '215 KB', folder: 'Products', type: 'image/jpeg' },
        { id: 'med-3', name: 'hero_banner.png', url: '/hero_banner.png', size: '1.2 MB', folder: 'Banners', type: 'image/png' },
        { id: 'med-4', name: 'sink_clean.jpg', url: '/sink_clean.jpg', size: '380 KB', folder: 'Before/After', type: 'image/jpeg' },
        { id: 'med-5', name: 'kitchen_clean.jpg', url: '/kitchen_clean.jpg', size: '410 KB', folder: 'Before/After', type: 'image/jpeg' }
      ],
      addMedia: (media) => {
        const newMedia = { id: `med-${Date.now()}`, ...media };
        set((state) => ({ mediaLibrary: [newMedia, ...state.mediaLibrary] }));
        get().logActivity('Media', `Uploaded asset ${newMedia.name}`);
      },
      deleteMedia: (id) => {
        set((state) => ({ mediaLibrary: state.mediaLibrary.filter((m) => m.id !== id) }));
        get().logActivity('Media', `Deleted asset ID: ${id}`);
      },

      // Marketing
      // Newsletter subscribers - emails sent from the website footer (/api/newsletter)
      subscribers: [],
      loadSubscribers: async () => {
        try {
          const subscribers = await newsletterApi.fetchSubscribers();
          set({
            subscribers: subscribers.map((s) => ({
              ...s,
              date: s.createdAt
                ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : ''
            }))
          });
        } catch (err) {
          console.error('Failed to load subscribers:', err);
        }
      },
      deleteSubscriber: (id) => {
        set((state) => ({ subscribers: state.subscribers.filter((s) => s.id !== id) }));
        newsletterApi.deleteSubscriber(id).catch((err) => {
          get().addToast({ type: 'error', title: 'Delete Failed', message: `Could not remove subscriber: ${err.message}` });
          get().loadSubscribers();
        });
        get().logActivity('Marketing', `Removed subscriber ${id}`);
      },

      // Customer Enquiries Inbox - messages sent from the website contact form (/api/contact/enquiries)
      enquiries: [],
      loadEnquiries: async () => {
        try {
          const enquiries = await contactApi.fetchEnquiries();
          set({ enquiries: enquiries.map(enquiryFromApi) });
        } catch (err) {
          console.error('Failed to load enquiries:', err);
        }
      },
      updateEnquiryStatus: (id, status) => {
        set((state) => ({
          enquiries: (state.enquiries || []).map((e) => (e.id === id ? { ...e, status } : e))
        }));
        contactApi.updateEnquiryStatus(id, status).catch((err) => {
          get().addToast({ type: 'error', title: 'Save Failed', message: `Could not update enquiry: ${err.message}` });
          get().loadEnquiries();
        });
        get().logActivity('Marketing', `Updated enquiry ${id} to ${status}`);
      },
      deleteEnquiry: (id) => {
        set((state) => ({
          enquiries: (state.enquiries || []).filter((e) => e.id !== id)
        }));
        contactApi.deleteEnquiry(id).catch((err) => {
          get().addToast({ type: 'error', title: 'Delete Failed', message: `Could not delete enquiry: ${err.message}` });
          get().loadEnquiries();
        });
        get().logActivity('Marketing', `Deleted enquiry ID: ${id}`);
      }
    }),
    {
      name: 'kapee-admin-storage',
      // Older saves still hold reviews/customers/products/enquiries; ignore them so only backend data is shown
      merge: (persisted, current) => {
        // faqs / faqCategories are from before the FAQ page came from the backend (now faqPage)
        const { orders, milestones, reviews, customers, products, combos, enquiries, subscribers, contactSection, ourStory, faqs, faqCategories, policies, footer, ...rest } =
          persisted || {};
        // Pages cached before they came from the backend have no formTitle / seoTitle; drop those
        return {
          ...current,
          ...rest,
          ...(contactSection?.formTitle !== undefined ? { contactSection } : {}),
          ...(ourStory?.seoTitle !== undefined ? { ourStory } : {})
        };
      },
      partialize: (state) => ({
        darkMode: state.darkMode,
        sidebarCollapsed: state.sidebarCollapsed,
        soundEnabled: state.soundEnabled,
        // orders and products are not cached: they always come fresh from the backend (loadProducts)
        categories: state.categories,
        coupons: state.coupons,
        // reviews are not cached: they always come fresh from the backend (loadReviews)
        // FAQ page cache (refreshed from the backend on every visit)
        faqPage: state.faqPage,
        deliveryPartners: state.deliveryPartners,
        paymentGateways: state.paymentGateways,
        delhiveryConfig: state.delhiveryConfig,
        razorpayConfig: state.razorpayConfig,
        heroSlides: state.heroSlides,
        // Home content cache (refreshed from the backend on every visit)
        seo: state.seo,
        heroBanner: state.heroBanner,
        trustSection: state.trustSection,
        trustPillars: state.trustPillars,
        bestSellersSection: state.bestSellersSection,
        beforeAfterSettings: state.beforeAfterSettings,
        howItWorksHeader: state.howItWorksHeader,
        howItWorksSteps: state.howItWorksSteps,
        reviewsSection: state.reviewsSection,
        comparisonTable: state.comparisonTable,
        ugcSection: state.ugcSection,
        homepageSections: state.homepageSections,
        homeBestSellers: state.homeBestSellers,
        homeFeaturedReviews: state.homeFeaturedReviews,
        // subscribers are not cached: they always come fresh from the backend (loadSubscribers)
        // enquiries are not cached: they always come fresh from the backend (loadEnquiries)
        // Contact page cache (refreshed from the backend on every visit)
        contactSection: state.contactSection,
        // Our Story page cache (refreshed from the backend on every visit)
        ourStory: state.ourStory,
        // policies are not cached: they always come fresh from the backend (loadPolicies)
        // footer is not cached: it always comes fresh from the backend (loadFooter)
        // Announcement ticker cache (refreshed from the backend on every visit)
        announcementBar: state.announcementBar,
        activityLogs: state.activityLogs
      })
    }
  )
);
