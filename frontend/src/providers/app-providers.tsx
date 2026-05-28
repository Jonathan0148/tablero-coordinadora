"use client";

import { ReactNode } from "react";
import { AuthHydrator } from "@/providers/auth-hydrator";
import { ConfirmProvider } from "@/providers/confirm-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthHydrator>
          <ConfirmProvider>
            <ToastProvider>{children}</ToastProvider>
          </ConfirmProvider>
        </AuthHydrator>
      </ThemeProvider>
    </QueryProvider>
  );
}
