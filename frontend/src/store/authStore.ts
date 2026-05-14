import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '../types';

interface AuthState {
  user: AuthResponse | null;
  token: string | null;
  setAuth: (data: AuthResponse) => void;
  logout: () => void;
  isSeeker: () => boolean;
  isEmployer: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (data) => {
        localStorage.setItem('token', data.token);
        set({ user: data, token: data.token });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
      isSeeker: () => get().user?.role === 'ROLE_SEEKER',
      isEmployer: () => get().user?.role === 'ROLE_EMPLOYER',
      isAdmin: () => get().user?.role === 'ROLE_ADMIN',
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);
