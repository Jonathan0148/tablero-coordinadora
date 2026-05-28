"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/utils/cn";
import { useBrandAssets } from "@/shared/hooks/use-brand-assets";
import { SIDEBAR_WIDTH_COLLAPSED } from "@/shared/utils/sidebar-preferences";

type SidebarBrandProps = {
  expanded: boolean;
  className?: string;
};

export function SidebarBrand({ expanded, className }: SidebarBrandProps) {
  const { mark, full } = useBrandAssets();

  return (
    <Link
      href="/"
      aria-label="Coltefinanciera — Inicio"
      className={cn(
        "grid h-14 w-full shrink-0 items-center overflow-hidden",
        "grid-cols-[var(--sidebar-icon-col)_minmax(0,1fr)]",
        className,
      )}
      style={{ "--sidebar-icon-col": SIDEBAR_WIDTH_COLLAPSED } as React.CSSProperties}
    >
      <span className="flex items-center justify-center">
        <Image
          src={mark}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
          priority
        />
      </span>
      <span
        className={cn(
          "flex min-w-0 items-center overflow-hidden pr-3 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          expanded ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-1 opacity-0",
        )}
        aria-hidden={!expanded}
      >
        <Image
          key={full}
          src={full}
          alt="Coltefinanciera"
          width={128}
          height={32}
          className="h-6 w-auto max-w-[7.5rem] object-contain object-left"
          priority
        />
      </span>
    </Link>
  );
}

type AppBrandProps = {
  variant?: "full" | "mark";
  className?: string;
};

/** Branding for login, mobile drawer header, etc. */
export function AppBrand({ variant = "full", className }: AppBrandProps) {
  const { mark, full } = useBrandAssets();

  if (variant === "mark") {
    return (
      <Link href="/" aria-label="Coltefinanciera — Inicio" className={cn("inline-flex shrink-0", className)}>
        <Image src={mark} alt="" width={36} height={36} className="h-9 w-9 object-contain" priority />
      </Link>
    );
  }

  return (
    <Link href="/" aria-label="Coltefinanciera — Inicio" className={cn("inline-flex shrink-0", className)}>
      <Image
        src={full}
        alt="Coltefinanciera"
        width={160}
        height={40}
        className="h-7 w-auto max-w-[140px] object-contain object-left"
        priority
      />
    </Link>
  );
}
