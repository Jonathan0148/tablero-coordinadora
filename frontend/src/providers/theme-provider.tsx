"use client";

import { useEffect } from "react";
import { applyThemeToDocument } from "@/shared/theme/apply-theme";
import { useThemeStore } from "@/shared/theme/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preset = useThemeStore((state) => state.preset);
  const customizations = useThemeStore((state) => state.customizations);

  useEffect(() => {
    applyThemeToDocument({ preset, customizations });
  }, [preset, customizations]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    const timer = window.setTimeout(() => root.classList.remove("theme-transition"), 400);
    return () => window.clearTimeout(timer);
  }, [preset, customizations]);

  return children;
}
