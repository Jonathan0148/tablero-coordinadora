"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyThemeToDocument, THEME_STORAGE_KEY } from "@/shared/theme/apply-theme";
import {
  DEFAULT_CUSTOMIZATIONS,
  type ThemeCustomizations,
  type ThemePresetId,
} from "@/shared/theme/theme-presets";

type ThemeStore = {
  preset: ThemePresetId;
  customizations: ThemeCustomizations;
  settingsOpen: boolean;
  setPreset: (preset: ThemePresetId) => void;
  setCustomization: <K extends keyof ThemeCustomizations>(
    key: K,
    value: ThemeCustomizations[K],
  ) => void;
  resetCustomizations: () => void;
  setSettingsOpen: (open: boolean) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      preset: "light-executive",
      customizations: DEFAULT_CUSTOMIZATIONS,
      settingsOpen: false,
      setPreset: (preset) => {
        const customizations = get().customizations;
        set({ preset });
        applyThemeToDocument({ preset, customizations });
      },
      setCustomization: (key, value) => {
        const customizations = { ...get().customizations, [key]: value };
        set({ customizations });
        applyThemeToDocument({ preset: get().preset, customizations });
      },
      resetCustomizations: () => {
        const preset = get().preset;
        set({ customizations: DEFAULT_CUSTOMIZATIONS });
        applyThemeToDocument({ preset, customizations: DEFAULT_CUSTOMIZATIONS });
      },
      setSettingsOpen: (open) => set({ settingsOpen: open }),
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({
        preset: state.preset,
        customizations: state.customizations,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDocument({
            preset: state.preset,
            customizations: state.customizations,
          });
        }
      },
    },
  ),
);
