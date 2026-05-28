export type ThemePresetId =
  | "light-executive"
  | "dark-graphite"
  | "cream-minimal"
  | "midnight-blue"
  | "modern-emerald";

export type NavbarStyle = "glass" | "solid";
export type RadiusSize = "sm" | "md" | "lg";
export type DensitySize = "compact" | "default" | "comfortable";

export type ThemeCustomizations = {
  accentColor: string | null;
  sidebarColor: string | null;
  backgroundTone: string | null;
  cardTone: string | null;
  navbarStyle: NavbarStyle;
  radius: RadiusSize;
  density: DensitySize;
};

export type ThemePreset = {
  id: ThemePresetId;
  name: string;
  description: string;
  colorScheme: "light" | "dark";
  preview: [string, string, string];
  accentDefault: string;
  sidebarDefault: string;
  backgroundDefault: string;
  surfaceDefault: string;
};

export const DEFAULT_CUSTOMIZATIONS: ThemeCustomizations = {
  accentColor: null,
  sidebarColor: null,
  backgroundTone: null,
  cardTone: null,
  navbarStyle: "glass",
  radius: "md",
  density: "default",
};

export const RADIUS_VALUES: Record<RadiusSize, string> = {
  sm: "0.625rem",
  md: "0.875rem",
  lg: "1.25rem",
};

export const DENSITY_VALUES: Record<DensitySize, string> = {
  compact: "0.85",
  default: "1",
  comfortable: "1.15",
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "light-executive",
    name: "Light Executive",
    description: "Limpio, claro y ejecutivo",
    colorScheme: "light",
    preview: ["#f8fafc", "#ffffff", "#0f172a"],
    accentDefault: "#0f172a",
    sidebarDefault: "#ffffff",
    backgroundDefault: "#f8fafc",
    surfaceDefault: "#ffffff",
  },
  {
    id: "dark-graphite",
    name: "Dark Graphite",
    description: "Oscuro neutro y profesional",
    colorScheme: "dark",
    preview: ["#0a0a0b", "#18181b", "#fafafa"],
    accentDefault: "#fafafa",
    sidebarDefault: "#0f0f11",
    backgroundDefault: "#09090b",
    surfaceDefault: "#18181b",
  },
  {
    id: "cream-minimal",
    name: "Cream Minimal",
    description: "Cálido, suave y minimalista",
    colorScheme: "light",
    preview: ["#faf8f5", "#fffdf9", "#44403c"],
    accentDefault: "#57534e",
    sidebarDefault: "#fffdf9",
    backgroundDefault: "#faf8f5",
    surfaceDefault: "#fffdf9",
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    description: "Profundo, elegante y nocturno",
    colorScheme: "dark",
    preview: ["#0b1220", "#111827", "#3b82f6"],
    accentDefault: "#3b82f6",
    sidebarDefault: "#0f172a",
    backgroundDefault: "#0b1220",
    surfaceDefault: "#111827",
  },
  {
    id: "modern-emerald",
    name: "Modern Emerald",
    description: "Oscuro con acento esmeralda",
    colorScheme: "dark",
    preview: ["#0c1210", "#151f1b", "#10b981"],
    accentDefault: "#10b981",
    sidebarDefault: "#0f1714",
    backgroundDefault: "#0c1210",
    surfaceDefault: "#151f1b",
  },
];

export function getPresetById(id: ThemePresetId): ThemePreset {
  return THEME_PRESETS.find((preset) => preset.id === id) ?? THEME_PRESETS[0];
}
