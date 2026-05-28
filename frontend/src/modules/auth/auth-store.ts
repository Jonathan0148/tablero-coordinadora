"use client";

import { create } from "zustand";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/services/token-storage";
import type { UserProfile } from "@/types/domain";

type AuthState = {
  user: UserProfile | null;
  hydrated: boolean;
  hydrate: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,
  hydrate: () => set({ user: tokenStorage.getUser(), hydrated: true }),
  login: async (email, password) => {
    const payload = await authService.login({ email, password });
    set({ user: payload.user, hydrated: true });
  },
  logout: () => {
    authService.logout();
    set({ user: null, hydrated: true });
  },
  hasPermission: (permission) => Boolean(get().user?.permissions.includes(permission)),
}));
