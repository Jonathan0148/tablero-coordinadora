import {
  DEFAULT_CUSTOMIZATIONS,
  DENSITY_VALUES,
  getPresetById,
  RADIUS_VALUES,
  type ThemeCustomizations,
  type ThemePresetId,
} from "@/shared/theme/theme-presets";

export const THEME_STORAGE_KEY = "cit-theme-storage";

export type ThemeStateSnapshot = {
  preset: ThemePresetId;
  customizations: ThemeCustomizations;
};

export function applyThemeToDocument(state: ThemeStateSnapshot): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const preset = getPresetById(state.preset);
  const custom = { ...DEFAULT_CUSTOMIZATIONS, ...state.customizations };

  // Clear stale inline overrides so CSS [data-theme] tokens take effect.
  for (const key of [
    "--app-accent",
    "--app-accent-hover",
    "--app-sidebar",
    "--app-bg",
    "--app-surface",
    "--app-radius",
    "--app-density-scale",
    "--app-navbar",
  ]) {
    root.style.removeProperty(key);
  }

  root.setAttribute("data-theme", state.preset);
  root.setAttribute("data-color-scheme", preset.colorScheme);
  root.setAttribute("data-navbar-style", custom.navbarStyle);
  root.setAttribute("data-density", custom.density);
  root.style.colorScheme = preset.colorScheme;

  // Only inline overrides for user customizations — preset tokens live in CSS [data-theme].
  if (custom.accentColor) {
    root.style.setProperty("--app-accent", custom.accentColor);
    root.style.setProperty("--app-accent-hover", custom.accentColor);
  }

  if (custom.sidebarColor) {
    root.style.setProperty("--app-sidebar", custom.sidebarColor);
  }

  if (custom.backgroundTone) {
    root.style.setProperty("--app-bg", custom.backgroundTone);
  }

  if (custom.cardTone) {
    root.style.setProperty("--app-surface", custom.cardTone);
  }

  if (custom.radius !== DEFAULT_CUSTOMIZATIONS.radius) {
    root.style.setProperty("--app-radius", RADIUS_VALUES[custom.radius]);
  }

  if (custom.density !== DEFAULT_CUSTOMIZATIONS.density) {
    root.style.setProperty("--app-density-scale", DENSITY_VALUES[custom.density]);
  }
}

export function readThemeFromStorage(): ThemeStateSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: ThemeStateSnapshot };
    const state = parsed.state ?? (parsed as unknown as ThemeStateSnapshot);
    if (!state?.preset) return null;
    return {
      preset: state.preset,
      customizations: { ...DEFAULT_CUSTOMIZATIONS, ...state.customizations },
    };
  } catch {
    return null;
  }
}

export function buildThemeBootstrapScript(): string {
  const darkPresets = ["dark-graphite", "midnight-blue", "modern-emerald", "orchid-executive"];
  return `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var dark=${JSON.stringify(darkPresets)};var r=localStorage.getItem(k);if(!r)return;var p=JSON.parse(r);var s=p.state||p;if(!s||!s.preset)return;var d=document.documentElement;var c=s.customizations||{};d.setAttribute("data-theme",s.preset);d.setAttribute("data-color-scheme",dark.indexOf(s.preset)>=0?"dark":"light");d.setAttribute("data-density",c.density||"default");d.setAttribute("data-navbar-style",c.navbarStyle||"glass");if(c.accentColor)d.style.setProperty("--app-accent",c.accentColor);if(c.sidebarColor)d.style.setProperty("--app-sidebar",c.sidebarColor);if(c.backgroundTone)d.style.setProperty("--app-bg",c.backgroundTone);if(c.cardTone)d.style.setProperty("--app-surface",c.cardTone);}catch(e){}})();`;
}
