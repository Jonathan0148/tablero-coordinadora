"use client";

import { useSyncExternalStore } from "react";
import {
  resolveFullLogoSrc,
  type BrandColorScheme,
  BRAND_MARK_SRC,
} from "@/shared/branding/brand-assets";
import { getPresetById } from "@/shared/theme/theme-presets";
import { useThemeStore } from "@/shared/theme/theme-store";

function getDocumentColorScheme(): BrandColorScheme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-color-scheme");
  return attr === "dark" ? "dark" : "light";
}

function subscribeColorScheme(onStoreChange: () => void) {
  if (typeof document === "undefined") return () => undefined;
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-color-scheme", "data-theme"],
  });
  return () => observer.disconnect();
}

export function useBrandAssets() {
  const preset = useThemeStore((state) => state.preset);

  const domColorScheme = useSyncExternalStore(
    subscribeColorScheme,
    getDocumentColorScheme,
    () => resolveBrandColorSchemeFromPreset(preset),
  );

  const colorScheme = domColorScheme;
  const full = resolveFullLogoSrc(colorScheme);

  return {
    mark: BRAND_MARK_SRC,
    full,
    colorScheme,
    presetName: getPresetById(preset).name,
  };
}

function resolveBrandColorSchemeFromPreset(preset: Parameters<typeof getPresetById>[0]): BrandColorScheme {
  return getPresetById(preset).colorScheme;
}
