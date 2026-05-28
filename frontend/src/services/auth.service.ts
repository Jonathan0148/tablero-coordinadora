import { apiClient, unwrap } from "@/services/api-client";
import { tokenStorage } from "@/services/token-storage";
import type { AuthPayload, UserProfile } from "@/types/domain";

export type LoginRequest = {
  email: string;
  password: string;
};

export const authService = {
  async login(request: LoginRequest) {
    const payload = await unwrap<AuthPayload>(apiClient.post("/v1/auth/login", request));
    tokenStorage.setSession(payload.accessToken, payload.user);
    return payload;
  },
  async me() {
    return unwrap<UserProfile>(apiClient.get("/v1/auth/me"));
  },
  logout() {
    tokenStorage.clear();
  },
};
