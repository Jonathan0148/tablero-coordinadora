"use client";

import Link from "next/link";
import { BrandMark } from "@/shared/branding/brand-mark";
import { BrandWordmark } from "@/shared/branding/brand-wordmark";
import { cn } from "@/shared/utils/cn";
import { SIDEBAR_WIDTH_COLLAPSED } from "@/shared/utils/sidebar-preferences";

type SidebarBrandProps = {
  expanded: boolean;
  className?: string;
};

export function SidebarBrand({ expanded, className }: SidebarBrandProps) {
  return (
    <Link
      href="/"
      aria-label="Coltefinanciera — Inicio"
      className={cn(
        "group grid h-14 w-full shrink-0 items-center overflow-hidden",
        "grid-cols-[var(--sidebar-icon-col)_minmax(0,1fr)]",
        className,
      )}
      style={{ "--sidebar-icon-col": SIDEBAR_WIDTH_COLLAPSED } as React.CSSProperties}
    >
      <span className="flex items-center justify-center">
        <BrandMark
          size="sm"
          priority
          className="transition-transform duration-300 ease-out group-hover:scale-105"
        />
      </span>
      <span
        className={cn(
          "min-w-0 pr-3 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          expanded ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-1 opacity-0",
        )}
        aria-hidden={!expanded}
      >
        <BrandWordmark size="sm" className="block min-w-0" />
      </span>
    </Link>
  );
}

type AppBrandProps = {
  /** Inline row (sidebar-style) or stacked for login. */
  layout?: "inline" | "stacked";
  className?: string;
};

/** Branding for login, mobile drawer header, etc. */
export function AppBrand({ layout = "inline", className }: AppBrandProps) {
  if (layout === "stacked") {
    return (
      <Link
        href="/"
        aria-label="Coltefinanciera — Inicio"
        className={cn("inline-flex flex-col items-center gap-3", className)}
      >
        <BrandMark size="lg" priority />
        <BrandWordmark size="lg" />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      aria-label="Coltefinanciera — Inicio"
      className={cn("inline-flex min-w-0 items-center gap-2.5", className)}
    >
      <BrandMark size="md" priority />
      <BrandWordmark size="md" />
    </Link>
  );
}
