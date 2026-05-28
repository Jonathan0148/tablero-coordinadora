"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Boxes,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Shield,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
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

type AppSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  hasPermission: (permission: string) => boolean;
};

export function AppSidebar({ collapsed, onToggle, hasPermission }: AppSidebarProps) {
  const pathname = usePathname();
  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <aside
      className="fixed inset-y-0 left-0 z-20 hidden flex-col bg-app-sidebar shadow-[var(--app-shadow)] transition-[width] duration-300 ease-in-out lg:flex"
      style={{ width }}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center transition-all duration-300",
          collapsed ? "justify-center px-2" : "gap-3 px-4",
        )}
      >
        <Link href="/" className="flex min-w-0 items-center gap-3 overflow-hidden">
          <Image
            src="/logo.png"
            alt="Coltefinanciera"
            width={collapsed ? 36 : 40}
            height={collapsed ? 36 : 40}
            className="h-9 w-9 shrink-0 object-contain"
            priority
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-app-fg">IT Dashboard</p>
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-app-muted">
                Coltefinanciera
              </p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2">
        {NAV_ITEMS.filter((item) => hasPermission(item.permission)).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center rounded-app text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-app-sidebar-active text-app-sidebar-active-fg"
                  : "text-app-sidebar-fg hover:bg-app-hover hover:text-app-fg",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && (
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

      <div className="shrink-0 p-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          className={cn(
            "flex w-full items-center rounded-app py-2.5 text-app-muted transition hover:bg-app-hover hover:text-app-fg",
            collapsed ? "justify-center" : "gap-2 px-3",
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="text-xs font-semibold">Colapsar</span>}
        </button>
      </div>
    </aside>
  );
}

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
