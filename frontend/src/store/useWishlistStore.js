import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],

      toggleWishlist: (product) => {
        const list = get().wishlist;
        const exists = list.some((item) => item.id === product.id);

        if (exists) {
          set({ wishlist: list.filter((item) => item.id !== product.id) });
        } else {
          set({ wishlist: [...list, product] });
        }
      },

      isInWishlist: (productId) => {
        return get().wishlist.some((item) => item.id === productId);
      },

      removeFromWishlist: (productId) => {
        set({ wishlist: get().wishlist.filter((item) => item.id !== productId) });
      },

      clearWishlist: () => set({ wishlist: [] })
    }),
    {
      name: 'kapee-wishlist-store'
    }
  )
);
