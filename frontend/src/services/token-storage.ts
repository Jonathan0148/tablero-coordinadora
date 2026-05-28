import type { UserProfile } from "@/types/domain";

const TOKEN_KEY = "it_dashboard_access_token";
const USER_KEY = "it_dashboard_user";

export const tokenStorage = {
  getToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  setSession(token: string, user: UserProfile) {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    document.cookie = `it_dashboard_session=1; path=/; max-age=${60 * 60}; SameSite=Lax`;
  },
  getUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const value = window.localStorage.getItem(USER_KEY);
    if (!value) return null;
    try {
      return JSON.parse(value) as UserProfile;
    } catch {
      return null;
    }
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    document.cookie = "it_dashboard_session=; path=/; max-age=0; SameSite=Lax";
  },
};
