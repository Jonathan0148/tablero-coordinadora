"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  Boxes,
  CheckSquare,
  Landmark,
  Shield,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { SidebarBrand } from "@/shared/components/layout/sidebar-brand";
import { cn } from "@/shared/utils/cn";
import {
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
} from "@/shared/utils/sidebar-preferences";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: BarChart3, permission: "reports:read" },
  { href: "/committee", label: "Comité", icon: Landmark, permission: "committee:read" },
  { href: "/projects", label: "Proyectos", icon: Boxes, permission: "projects:read" },
  { href: "/kanban", label: "Kanban", icon: CheckSquare, permission: "kanban:read" },
  { href: "/log", label: "Bitácora", icon: BookOpen, permission: "logs:read" },
  { href: "/team", label: "Equipo", icon: Users, permission: "teams:read" },
  { href: "/okrs", label: "OKRs", icon: Target, permission: "okrs:read" },
  { href: "/admin", label: "Admin RBAC", icon: Shield, permission: "security:admin" },
];

export const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/committee": "Comité",
  "/projects": "Proyectos",
  "/kanban": "Kanban",
  "/log": "Bitácora",
  "/team": "Equipo",
  "/okrs": "OKRs",
  "/admin": "Administración",
};

type SidebarNavProps = {
  expanded: boolean;
  hasPermission: (permission: string) => boolean;
  onNavigate?: () => void;
  className?: string;
};

export function SidebarNav({ expanded, hasPermission, onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex flex-col gap-0.5", className)}
      style={{ "--sidebar-icon-col": SIDEBAR_WIDTH_COLLAPSED } as React.CSSProperties}
    >
      {NAV_ITEMS.filter((item) => hasPermission(item.permission)).map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={!expanded ? item.label : undefined}
            className={cn(
              "group relative grid w-full items-center rounded-app text-sm font-medium",
              "grid-cols-[var(--sidebar-icon-col)_minmax(0,1fr)]",
              "transition-colors duration-200 ease-out",
              "py-2.5",
              active
                ? "bg-app-sidebar-active text-app-sidebar-active-fg"
                : "text-app-sidebar-fg hover:bg-app-hover hover:text-app-fg",
            )}
          >
            <span className="flex items-center justify-center">
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
            </span>
            <span
              className={cn(
                "truncate whitespace-nowrap pr-3 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                expanded ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-1 opacity-0",
              )}
            >
              {item.label}
            </span>
            {!expanded && (
              <span
                className={cn(
                  "pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg",
                  "bg-app-accent px-2.5 py-1.5 text-xs font-medium text-app-accent-fg shadow-[var(--app-shadow-lg)]",
                  "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                )}
              >
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

type AppSidebarProps = {
  hasPermission: (permission: string) => boolean;
};

export function AppSidebar({ hasPermission }: AppSidebarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocusCapture={() => setExpanded(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setExpanded(false);
        }
      }}
      style={{
        width: expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
      }}
      className={cn(
        "sidebar-rail fixed inset-y-0 left-0 z-30 hidden flex-col bg-app-sidebar will-change-[width] lg:flex",
        "transition-[width,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        expanded ? "shadow-[var(--app-shadow-lg)]" : "shadow-[var(--app-shadow)]",
      )}
    >
      <SidebarBrand expanded={expanded} />
      <div className="flex-1 overflow-x-hidden overflow-y-auto px-1 pb-3 pt-1">
        <SidebarNav expanded={expanded} hasPermission={hasPermission} />
      </div>
    </aside>
  );
}
