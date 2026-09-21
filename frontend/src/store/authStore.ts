import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT';
  phone?: string;
  avatar?: string;
  clinicId?: string;
  specialty?: string;
  qualification?: string;
  registrationNumber?: string;
  consultationFee?: number;
  signature?: string;
  clinic?: { id: string; name: string; logo?: string };
  pin?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLocked: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  lockApp: () => void;
  updateUser: (data: Partial<User>) => void;
  registerPasskey: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLocked: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.login({ email, password });
          set({
            isAuthenticated: true,
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isLocked: false,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Login failed');
        }
      },

      register: async (registerData) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.register(registerData);
          set({
            isAuthenticated: true,
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isLocked: false,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Registration failed');
        }
      },

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLocked: false,
        }),

      setPin: (pin: string) =>
        set((state) => ({
          user: state.user ? { ...state.user, pin } : null,
        })),

      verifyPin: (pin: string) => {
        const { user } = get();
        if (user?.pin === pin) {
          set({ isAuthenticated: true, isLocked: false });
          return true;
        }
        return false;
      },

      lockApp: () => set({ isLocked: true }),

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
        
      registerPasskey: async () => {
         // Placeholder for registerPasskey
         console.log("registerPasskey called");
      },
    }),
    {
      name: 'mednivo-auth',
    }
  )
);
