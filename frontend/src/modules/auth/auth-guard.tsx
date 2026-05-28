"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/modules/auth/auth-store";
import { LoadingState } from "@/shared/components/state";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login");
    }
  }, [hydrated, router, user]);

  if (!hydrated || !user) {
    return <LoadingState label="Validando sesión enterprise..." />;
  }

  return children;
}
