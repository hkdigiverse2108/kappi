import { create } from 'zustand';

// One confirmation popup for the whole app (website and admin panel), shown before anything is deleted.
// Usage: useConfirmStore.getState().confirm({ title, message, confirmText, onConfirm })
export const useConfirmStore = create((set) => ({
  request: null,
  confirm: (request) => set({ request }),
  close: () => set({ request: null })
}));

export const confirmDelete = (request) => useConfirmStore.getState().confirm(request);
