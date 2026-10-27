import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/authApi';
import { fetchMyOrders, toCustomerOrder } from '../api/orderApi';

const guestUser = () => ({
  name: '',
  email: '',
  phone: '',
  addresses: [],
  orders: []
});

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: guestUser(),
      isLoggedIn: false,

      // The account comes from the backend; its orders are loaded separately (loadMyOrders)
      setSessionUser: (apiUser) => {
        const current = get().user;
        const orders = current?.id === apiUser.id ? current.orders || [] : [];
        set({ user: { ...apiUser, addresses: apiUser.addresses || [], orders }, isLoggedIn: true });
        if (current?.id !== apiUser.id) get().loadMyOrders();
      },

      clearSession: () => {
        set({ user: guestUser(), isLoggedIn: false });
      },

      // Orders this customer placed while signed in (guests track theirs by order ID)
      loadMyOrders: async () => {
        if (!get().isLoggedIn) return;
        try {
          const orders = (await fetchMyOrders()).map(toCustomerOrder);
          set({ user: { ...get().user, orders } });
        } catch (err) {
          console.error('Failed to load orders:', err);
        }
      },

      // Checks the session cookie with the backend (called once on app start)
      loadSession: async () => {
        try {
          get().setSessionUser(await authApi.fetchMe());
          get().loadMyOrders();
        } catch (err) {
          if (err.status === 401) get().clearSession();
          // Network errors keep the cached state until the backend is reachable again
        }
      },

      // Creates the account only; the customer signs in afterwards
      register: ({ name, email, phone, password }) => authApi.register({ name, email, phone, password }),

      // Step 1: checks the password and emails a sign-in code
      login: (email, password) => authApi.login(email, password),

      // Step 2: the emailed code starts the session
      verifyLoginOtp: async (email, otp) => {
        get().setSessionUser(await authApi.verifyLoginOtp(email, otp));
      },

      logout: async () => {
        get().clearSession();
        try {
          await authApi.logout();
        } catch (err) {
          console.error('Logout failed:', err);
        }
      },

      updateProfile: async (updatedData) => {
        const { name, email, phone, dob, gender } = { ...get().user, ...updatedData };
        get().setSessionUser(await authApi.updateProfile({ name, email, phone, dob: dob || '', gender: gender || '' }));
      },

      addAddress: async (newAddr) => {
        get().setSessionUser(await authApi.addAddress(newAddr));
      },

      updateAddress: async (id, updatedAddr) => {
        get().setSessionUser(await authApi.updateAddress(id, updatedAddr));
      },

      deleteAddress: async (id) => {
        get().setSessionUser(await authApi.deleteAddress(id));
      },

      setDefaultAddress: async (id) => {
        get().setSessionUser(await authApi.setDefaultAddress(id));
      }
    }),
    {
      // New name so the old demo account ("Arjun Nambiar") saved in browsers is not loaded
      name: 'kapee-user-session',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn
      })
    }
  )
);
