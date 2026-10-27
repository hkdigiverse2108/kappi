import { create } from 'zustand';
import { fetchProducts } from '../api/productApi';

// Website product catalogue. Products are managed in Admin > Products and come only
// from the backend (GET /api/products); nothing is hardcoded in the frontend.
export const useProductStore = create((set) => ({
  products: [],
  loaded: false,

  loadProducts: async () => {
    try {
      set({ products: await fetchProducts(), loaded: true });
    } catch (err) {
      console.error('Failed to load products:', err);
      set({ loaded: true });
    }
  }
}));
