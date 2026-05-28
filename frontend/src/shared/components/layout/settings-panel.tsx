"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check, RotateCcw, Settings2, X } from "lucide-react";
import { Button } from "@/shared/components/button";
import { cn } from "@/shared/utils/cn";
import {
  DEFAULT_CUSTOMIZATIONS,
  DENSITY_VALUES,
  RADIUS_VALUES,
  THEME_PRESETS,
  type DensitySize,
  type NavbarStyle,
  type RadiusSize,
  type ThemePreset,
  type ThemePresetId,
} from "@/shared/theme/theme-presets";
import { useThemeStore } from "@/shared/theme/theme-store";

function buildPreviewGradient(item: ThemePreset): string {
  if (item.previewGradient) return item.previewGradient;
  const [base, mid, accent] = item.preview;
  return `linear-gradient(135deg, ${base} 0%, ${mid} 52%, ${accent} 100%)`;
}

function ThemePreviewSwatch({ item, selected }: { item: ThemePreset; selected: boolean }) {
  return (
    <div
      className={cn(
        "relative h-11 w-[4.5rem] shrink-0 overflow-hidden rounded-xl shadow-sm transition",
        selected && "ring-2 ring-app-accent/40 ring-offset-1 ring-offset-app-surface",
      )}
      style={{ background: buildPreviewGradient(item) }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
      <div className="absolute bottom-1.5 left-2 h-1 w-6 rounded-full bg-white/25 backdrop-blur-[1px]" />
      <div className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-white/35" />
    </div>
  );
}

function hasCustomizations(custom: typeof DEFAULT_CUSTOMIZATIONS): boolean {
  return (
    custom.accentColor !== null ||
    custom.sidebarColor !== null ||
    custom.backgroundTone !== null ||
    custom.cardTone !== null ||
    custom.navbarStyle !== DEFAULT_CUSTOMIZATIONS.navbarStyle ||
    custom.radius !== DEFAULT_CUSTOMIZATIONS.radius ||
    custom.density !== DEFAULT_CUSTOMIZATIONS.density
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">
      {children}
    </h3>
  );
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex rounded-app bg-app-surface-muted p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "flex-1 rounded-[calc(var(--app-radius)-0.25rem)] px-2 py-1.5 text-xs font-semibold transition",
            value === option.id
              ? "bg-app-accent text-app-accent-fg shadow-sm"
              : "text-app-muted hover:bg-app-hover hover:text-app-fg",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ColorField({
  label,
  value,
  fallback,
  onChange,
  onReset,
}: {
  label: string;
  value: string | null;
  fallback: string;
  onChange: (value: string) => void;
  onReset: () => void;
}) {
  const current = value ?? fallback;
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-app-fg">{label}</p>
        <p className="text-[11px] text-app-muted">{value ? "Personalizado" : "Predeterminado"}</p>
      </div>
      <div className="flex items-center gap-2">
        {value && (
          <button
            type="button"
            aria-label={`Restablecer ${label}`}
            onClick={onReset}
            className="rounded-lg p-1.5 text-app-muted transition hover:bg-app-hover hover:text-app-fg"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
        <label className="relative">
          <span className="sr-only">{label}</span>
          <input
            type="color"
            value={current}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-9 cursor-pointer overflow-hidden rounded-lg bg-app-surface-muted p-0.5"
          />
        </label>
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const open = useThemeStore((state) => state.settingsOpen);
  const setOpen = useThemeStore((state) => state.setSettingsOpen);
  const preset = useThemeStore((state) => state.preset);
  const customizations = useThemeStore((state) => state.customizations);
  const setPreset = useThemeStore((state) => state.setPreset);
  const setCustomization = useThemeStore((state) => state.setCustomization);
  const resetCustomizations = useThemeStore((state) => state.resetCustomizations);

  const activePreset = THEME_PRESETS.find((item) => item.id === preset) ?? THEME_PRESETS[0];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="settings-backdrop fixed inset-0 z-[60] bg-black/35 backdrop-blur-[3px]" />
        <Dialog.Content
          className={cn(
            "settings-panel fixed inset-y-0 right-0 z-[61] flex w-full max-w-[420px] flex-col",
            "bg-app-surface shadow-[var(--app-shadow-lg)] outline-none",
          )}
        >
          <div className="flex items-start justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-app bg-app-accent text-app-accent-fg">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="text-base font-semibold text-app-fg">
                  Configuración
                </Dialog.Title>
                <Dialog.Description className="text-xs text-app-muted">
                  Personaliza la apariencia de la plataforma
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Cerrar configuración"
                className="rounded-lg p-2 text-app-muted transition hover:bg-app-hover hover:text-app-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto px-5 py-5">
            <section className="space-y-3">
              <SectionTitle>Temas predefinidos</SectionTitle>
              <div className="grid gap-2.5">
                {THEME_PRESETS.map((item) => {
                  const selected = item.id === preset;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPreset(item.id as ThemePresetId)}
                      className={cn(
                        "flex w-full items-center gap-3.5 rounded-app p-3 text-left transition duration-200",
                        selected
                          ? "bg-app-hover shadow-[var(--app-shadow)]"
                          : "bg-app-surface-muted hover:bg-app-hover",
                      )}
                    >
                      <ThemePreviewSwatch item={item} selected={selected} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-app-fg">{item.name}</p>
                        <p className="truncate text-xs text-app-muted">{item.description}</p>
                      </div>
                      {selected && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-app-accent text-app-accent-fg shadow-sm">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle>Personalización avanzada</SectionTitle>

              <ColorField
                label="Color de acento"
                value={customizations.accentColor}
                fallback={activePreset.accentDefault}
                onChange={(value) => setCustomization("accentColor", value)}
                onReset={() => setCustomization("accentColor", null)}
              />

              <ColorField
                label="Color del sidebar"
                value={customizations.sidebarColor}
                fallback={activePreset.sidebarDefault}
                onChange={(value) => setCustomization("sidebarColor", value)}
                onReset={() => setCustomization("sidebarColor", null)}
              />

              <ColorField
                label="Tono de fondo"
                value={customizations.backgroundTone}
                fallback={activePreset.backgroundDefault}
                onChange={(value) => setCustomization("backgroundTone", value)}
                onReset={() => setCustomization("backgroundTone", null)}
              />

              <ColorField
                label="Tono de tarjetas"
                value={customizations.cardTone}
                fallback={activePreset.surfaceDefault}
                onChange={(value) => setCustomization("cardTone", value)}
                onReset={() => setCustomization("cardTone", null)}
              />

              <div className="space-y-2">
                <p className="text-sm font-medium text-app-fg">Estilo del navbar</p>
                <SegmentedControl<NavbarStyle>
                  value={customizations.navbarStyle}
                  options={[
                    { id: "glass", label: "Glass" },
                    { id: "solid", label: "Sólido" },
                  ]}
                  onChange={(value) => setCustomization("navbarStyle", value)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-app-fg">Radio de bordes</p>
                <SegmentedControl<RadiusSize>
                  value={customizations.radius}
                  options={[
                    { id: "sm", label: "Suave" },
                    { id: "md", label: "Medio" },
                    { id: "lg", label: "Amplio" },
                  ]}
                  onChange={(value) => setCustomization("radius", value)}
                />
                <p className="text-[11px] text-app-muted">Actual: {RADIUS_VALUES[customizations.radius]}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-app-fg">Densidad visual</p>
                <SegmentedControl<DensitySize>
                  value={customizations.density}
                  options={[
                    { id: "compact", label: "Compacta" },
                    { id: "default", label: "Normal" },
                    { id: "comfortable", label: "Amplia" },
                  ]}
                  onChange={(value) => setCustomization("density", value)}
                />
                <p className="text-[11px] text-app-muted">
                  Escala: {DENSITY_VALUES[customizations.density]}x
                </p>
              </div>
            </section>
          </div>

          <div className="p-4">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={resetCustomizations}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restablecer personalización
            </Button>
            <p className="mt-2 text-center text-[11px] text-app-muted">
              Tema activo: {activePreset.name}
              {hasCustomizations(customizations) ? " · con ajustes personalizados" : ""}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
