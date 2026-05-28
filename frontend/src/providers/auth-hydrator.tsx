"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/modules/auth/auth-store";

export function AuthHydrator({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return children;
}
