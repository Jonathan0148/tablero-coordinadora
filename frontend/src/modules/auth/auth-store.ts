"use client";

import { create } from "zustand";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/services/token-storage";
import type { UserProfile } from "@/types/domain";

type AuthState = {
  user: UserProfile | null;
  hydrated: boolean;
  hydrate: () => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,
  hydrate: () => set({ user: tokenStorage.getUser(), hydrated: true }),
  login: async (username, password) => {
    const payload = await authService.login({ username, password });
    set({ user: payload.user, hydrated: true });
  },
  logout: () => {
    authService.logout();
    set({ user: null, hydrated: true });
  },
  hasPermission: (permission) => Boolean(get().user?.permissions.includes(permission)),
}));
