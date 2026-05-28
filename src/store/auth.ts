import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  setUser: (user: AuthUser, token: string) => void;
  clearUser: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setUser: (user, token) => set({ user, token }),
      clearUser: () => set({ user: null, token: null }),
      isAuthenticated: () => !!get().user,
      isAdmin: () => ["ADMIN", "SUPER_ADMIN"].includes(get().user?.role || ""),
    }),
    { name: "noir-auth" }
  )
);
