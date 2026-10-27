import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set, get) => ({
      isSearchOpen: false,
      searchQuery: '',
      setSearchQuery: (val) => set({ searchQuery: val }),
      setIsSearchOpen: (open) => set({ isSearchOpen: open, ...(open ? {} : { searchQuery: '' }) }),

      announcementDismissed: false,
      setAnnouncementDismissed: (val) => set({ announcementDismissed: val }),

      quickViewProduct: null,
      setQuickViewProduct: (product) => set({ quickViewProduct: product }),

      mobileMenuOpen: false,
      setMobileMenuOpen: (val) => set({ mobileMenuOpen: val }),

      recentlyViewed: ['prod-1', 'prod-3', 'prod-7'],
      addRecentlyViewed: (productId) => {
        const current = get().recentlyViewed.filter((id) => id !== productId);
        set({ recentlyViewed: [productId, ...current].slice(0, 8) });
      }
    }),
    {
      name: 'kapee-ui-store',
      partialize: (state) => ({
        announcementDismissed: state.announcementDismissed,
        recentlyViewed: state.recentlyViewed
      })
    }
  )
);
