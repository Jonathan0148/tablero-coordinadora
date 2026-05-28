import { getPresetById, type ThemePresetId } from "@/shared/theme/theme-presets";

export const BRAND_MARK_SRC = "/log.jpeg";
export const BRAND_LOGO_LIGHT_SRC = "/logo-negro.jpeg";
export const BRAND_LOGO_DARK_SRC = "/logo-blanco.jpeg";

export type BrandColorScheme = "light" | "dark";

export function resolveBrandColorScheme(presetId: ThemePresetId): BrandColorScheme {
  return getPresetById(presetId).colorScheme;
}

export function resolveFullLogoSrc(colorScheme: BrandColorScheme): string {
  return colorScheme === "dark" ? BRAND_LOGO_DARK_SRC : BRAND_LOGO_LIGHT_SRC;
}

export function getBrandAssetsForPreset(presetId: ThemePresetId) {
  const colorScheme = resolveBrandColorScheme(presetId);
  return {
    mark: BRAND_MARK_SRC,
    full: resolveFullLogoSrc(colorScheme),
    colorScheme,
  };
}
