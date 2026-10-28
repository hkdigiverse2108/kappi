import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchActiveCoupons } from '../api/couponApi';
import { fetchCartOffers } from '../api/cartOffersApi';
import { couponType, couponMinOrder, couponProductIds } from '../utils/coupons';
import { triggerCelebration } from '../utils/confetti';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      coupon: null,
      couponError: '',
      // Coupons created in Admin > Offers that can be used right now (loaded on app start)
      availableCoupons: [],
      // Cart rewards and fees from Admin > Offers > Cart Rewards (loaded on app start); null = not loaded yet
      cartOffers: null,
      orderNote: '',
      cartBump: false,
      unlockToast: null, // { title: string, desc: string }
      unlockedMilestones: {
        shipping: false,
        gift: false,
        extraDiscount: false,
      },

      setIsCartOpen: (open) => set({ isCartOpen: open }),

      triggerCartBump: () => {
        set({ cartBump: true });
        setTimeout(() => set({ cartBump: false }), 400);
      },

      setUnlockToast: (toast) => {
        set({ unlockToast: toast });
        if (toast) {
          setTimeout(() => {
            const current = get().unlockToast;
            if (current && current.title === toast.title) {
              set({ unlockToast: null });
            }
          }, 4000);
        }
      },

      // Celebrates rewards as the cart crosses their amounts, and adds / removes the free gift
      checkThresholdMilestones: (newSubtotal) => {
        const offers = get().cartOffers;
        const shipping = offers?.freeShipping;
        const gift = offers?.freeGift?.enabled && offers.freeGift.items?.length ? offers.freeGift : null;
        const extra = offers?.extraDiscount?.enabled && offers.extraDiscount.percent > 0 ? offers.extraDiscount : null;

        const reached = {
          shipping: !!shipping?.enabled && newSubtotal >= shipping.threshold,
          gift: !!gift && newSubtotal >= gift.threshold,
          extraDiscount: !!extra && newSubtotal >= extra.threshold
        };
        const messages = {
          shipping: { title: '🎉 Free Shipping Unlocked!', desc: 'Your order qualifies for free delivery across India.' },
          gift: gift && {
            title: gift.items.length > 1 ? '🎁 Free Gifts Added!' : '🎁 Free Gift Added!',
            desc: `${gift.items.map((g) => g.title).join(', ')} ${gift.items.length > 1 ? 'have' : 'has'} been added to your cart for free.`
          },
          extraDiscount: extra && {
            title: `🔥 Extra ${extra.percent}% Off Unlocked!`,
            desc: `An extra ${extra.percent}% cart discount has been applied.`
          }
        };

        const currentUnlocked = get().unlockedMilestones;
        let changed = false;
        const nextUnlocked = { ...currentUnlocked };
        Object.keys(reached).forEach((key) => {
          if (reached[key] && !currentUnlocked[key]) {
            nextUnlocked[key] = true;
            changed = true;
            triggerCelebration();
            get().setUnlockToast(messages[key]);
          } else if (!reached[key] && currentUnlocked[key]) {
            nextUnlocked[key] = false;
            changed = true;
          }
        });

        // Auto manage the free gifts in cart items (replaced if the admin changed the gifts)
        let items = get().items;
        const giftId = (g) => `gift-${g.productId}-${g.variantId || 'default'}`;
        const currentGiftIds = items.filter((i) => i.isFreeGift).map((i) => i.id).join('|');
        const wantedGiftIds = reached.gift ? gift.items.map(giftId).join('|') : '';

        if (currentGiftIds !== wantedGiftIds) {
          items = [
            ...items.filter((i) => !i.isFreeGift),
            ...(reached.gift
              ? gift.items.map((g) => ({
                  id: giftId(g),
                  productId: g.productId,
                  slug: g.slug,
                  title: `🎁 ${g.title} (Free Gift)`,
                  variantName: g.variant,
                  price: 0,
                  mrp: g.mrp,
                  quantity: 1,
                  image: g.image,
                  isFreeGift: true
                }))
              : [])
          ];
        }

        if (changed || items !== get().items) {
          set({ unlockedMilestones: nextUnlocked, items });
        }
      },

      loadCartOffers: async () => {
        try {
          set({ cartOffers: await fetchCartOffers() });
          // The rewards may have changed since the cart was saved in this browser
          get().checkThresholdMilestones(get().getSubtotal());
        } catch (err) {
          console.error('Failed to load cart rewards:', err);
        }
      },

      addItem: ({ product, variant, quantity = 1, isBundle = false, bundleItems = null }) => {
        const items = [...get().items];
        const itemId = isBundle 
          ? `bundle-${product.id}-${Date.now()}` 
          : `${product.id}-${variant?.id || 'default'}`;

        const existingIndex = isBundle ? -1 : items.findIndex((i) => i.id === itemId);

        const price = isBundle ? product.comboPrice || product.price : (variant ? variant.price : product.basePrice || product.price);
        const mrp = isBundle ? product.originalPrice || product.mrp : (variant ? variant.mrp : product.baseMrp || product.mrp);
        const variantName = isBundle ? (product.subtitle || 'Bundle Set') : (variant ? variant.name : 'Standard');
        const image = product.images?.[0] || product.image || '';

        if (existingIndex > -1) {
          items[existingIndex].quantity += quantity;
        } else {
          items.push({
            id: itemId,
            productId: product.id,
            slug: product.slug,
            title: product.title,
            variantId: variant?.id || null,
            variantName,
            price,
            mrp,
            quantity,
            image,
            isBundle,
            bundleItems,
            isFreeGift: false,
          });
        }

        set({ items, isCartOpen: true });
        get().triggerCartBump();

        // Calculate subtotal of non-gift items
        const subtotal = items
          .filter((i) => !i.isFreeGift)
          .reduce((sum, item) => sum + item.price * item.quantity, 0);

        get().checkThresholdMilestones(subtotal);
      },

      updateQuantity: (itemId, newQuantity) => {
        let items = [...get().items];
        if (newQuantity <= 0) {
          items = items.filter((i) => i.id !== itemId);
        } else {
          items = items.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          );
        }

        set({ items });
        const subtotal = items
          .filter((i) => !i.isFreeGift)
          .reduce((sum, item) => sum + item.price * item.quantity, 0);

        get().checkThresholdMilestones(subtotal);
      },

      removeItem: (itemId) => {
        const items = get().items.filter((i) => i.id !== itemId);
        set({ items });

        const subtotal = items
          .filter((i) => !i.isFreeGift)
          .reduce((sum, item) => sum + item.price * item.quantity, 0);

        get().checkThresholdMilestones(subtotal);
      },

      loadCoupons: async () => {
        try {
          set({ availableCoupons: await fetchActiveCoupons() });
        } catch (err) {
          console.error('Failed to load coupons:', err);
        }
      },

      applyCoupon: (code) => {
        const cleanCode = code.trim().toUpperCase();
        const found = get().availableCoupons.find((c) => c.code === cleanCode);
        const subtotal = get().getSubtotal();

        if (!found) {
          set({ couponError: 'Invalid or expired coupon code' });
          return false;
        }

        if (couponProductIds(found).length && get().getCouponEligibleSubtotal(found) === 0) {
          set({ couponError: `${found.code} is not valid for the products in your cart` });
          return false;
        }

        if (subtotal < couponMinOrder(found)) {
          set({
            couponError: `Minimum order value for ${found.code} is ₹${couponMinOrder(found)}`
          });
          return false;
        }

        set({ coupon: found, couponError: '' });
        triggerCelebration();
        return true;
      },

      removeCoupon: () => set({ coupon: null, couponError: '' }),
      setOrderNote: (note) => set({ orderNote: note }),

      clearCart: () => {
        set({
          items: [],
          coupon: null,
          couponError: '',
          orderNote: '',
          unlockedMilestones: { shipping: false, gift: false, extraDiscount: false }
        });
      },

      // Calculation helpers
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items
          .filter((i) => !i.isFreeGift)
          .reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getMrpTotal: () => {
        return get().items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
      },

      getSavings: () => {
        const mrpTotal = get().getMrpTotal();
        const subtotal = get().getSubtotal();
        const catalogSavings = Math.max(0, mrpTotal - subtotal);
        const couponDisc = get().getCouponDiscount();
        const extraTierDisc = get().getExtraTierDiscount();
        return catalogSavings + couponDisc + extraTierDisc;
      },

      getExtraTierDiscount: () => {
        const subtotal = get().getSubtotal();
        const extra = get().cartOffers?.extraDiscount;
        if (extra?.enabled && subtotal >= extra.threshold) {
          return Math.round((subtotal * extra.percent) / 100);
        }
        return 0;
      },

      // Cart value the coupon can discount: only its chosen products (all products when none chosen)
      getCouponEligibleSubtotal: (coupon) => {
        const ids = couponProductIds(coupon);
        return get().items
          .filter((i) => !i.isFreeGift && (!ids.length || ids.includes(i.productId)))
          .reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getCouponDiscount: () => {
        const coupon = get().coupon;
        const subtotal = get().getSubtotal();
        if (!coupon || subtotal < couponMinOrder(coupon)) return 0;

        const eligible = get().getCouponEligibleSubtotal(coupon);
        if (eligible === 0) return 0;

        const type = couponType(coupon);
        if (type === 'percentage') {
          const discount = Math.round((eligible * coupon.value) / 100);
          return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
        }
        if (type === 'free_shipping') {
          return get().getShippingFee();
        }
        return Math.min(coupon.value, eligible);
      },

      // Same rule as the backend order total
      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        const offers = get().cartOffers;
        if (subtotal === 0 || !offers) return 0;
        if (offers.freeShipping.enabled && subtotal >= offers.freeShipping.threshold) return 0;
        return offers.shippingFee;
      },

      getFinalTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const couponDisc = get().getCouponDiscount();
        const extraTierDisc = get().getExtraTierDiscount();
        const shipping = get().getShippingFee();

        return Math.max(0, subtotal - couponDisc - extraTierDisc + shipping);
      }
    }),
    {
      name: 'kapee-cart-store',
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
        orderNote: state.orderNote,
        unlockedMilestones: state.unlockedMilestones
      })
    }
  )
);
