import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      signup: async (name, email, password, role) => {
        const { data } = await api.post('/auth/signup', { name, email, password, role });
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      switchRole: (role) => {
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        }));
      },
    }),
    { name: 'plm-auth' }
  )
);

export default useAuthStore;
