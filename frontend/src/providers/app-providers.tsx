"use client";

import { ReactNode } from "react";
import { AuthHydrator } from "@/providers/auth-hydrator";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthHydrator>
        <ToastProvider>{children}</ToastProvider>
      </AuthHydrator>
    </QueryProvider>
  );
}
