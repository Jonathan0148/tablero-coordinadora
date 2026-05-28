"use client";

import { useAuthStore } from "@/modules/auth/auth-store";

export function usePermission(permission: string) {
  return useAuthStore((state) => state.hasPermission(permission));
}
