"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  Boxes,
  CheckSquare,
  ChevronDown,
  Landmark,
  Shield,
  Target,
  UserCog,
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

export type NavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  permission: string;
  children: { href: string; label: string; icon: LucideIcon }[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: BarChart3, permission: "reports:read" },
  { href: "/committee", label: "Comité", icon: Landmark, permission: "committee:read" },
  { href: "/projects", label: "Proyectos", icon: Boxes, permission: "projects:read" },
  { href: "/kanban", label: "Kanban", icon: CheckSquare, permission: "kanban:read" },
  { href: "/log", label: "Bitácora", icon: BookOpen, permission: "logs:read" },
  { href: "/team", label: "Equipo", icon: Users, permission: "teams:read" },
  { href: "/okrs", label: "OKRs", icon: Target, permission: "okrs:read" },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "admin",
    label: "Administración",
    icon: Shield,
    permission: "security:admin",
    children: [
      { href: "/admin/users", label: "Usuarios", icon: Users },
      { href: "/admin/roles", label: "Roles", icon: UserCog },
    ],
  },
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
  "/admin/users": "Usuarios",
  "/admin/roles": "Roles",
};

export function resolvePageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/admin/users")) return "Usuarios";
  if (pathname.startsWith("/admin/roles")) return "Roles";
  if (pathname.startsWith("/admin")) return "Administración";
  return "IT Dashboard";
}

type SidebarNavProps = {
  expanded: boolean;
  hasPermission: (permission: string) => boolean;
  onNavigate?: () => void;
  className?: string;
};

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  expanded,
  indent,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  expanded: boolean;
  indent?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={!expanded ? label : undefined}
      className={cn(
        "group relative grid w-full items-center rounded-app text-sm font-medium",
        "grid-cols-[var(--sidebar-icon-col)_minmax(0,1fr)]",
        "transition-colors duration-200 ease-out",
        "py-2.5",
        indent && expanded && "ml-1",
        active
          ? "bg-app-sidebar-active text-app-sidebar-active-fg"
          : "text-app-sidebar-fg hover:bg-app-hover hover:text-app-fg",
      )}
    >
      <span className="flex items-center justify-center">
        <Icon className={cn("shrink-0", indent ? "h-4 w-4" : "h-[18px] w-[18px]")} aria-hidden />
      </span>
      <span
        className={cn(
          "truncate whitespace-nowrap pr-3 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          expanded ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-1 opacity-0",
        )}
      >
        {label}
      </span>
      {!expanded && (
        <span
          className={cn(
            "pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg",
            "bg-app-accent px-2.5 py-1.5 text-xs font-medium text-app-accent-fg shadow-[var(--app-shadow-lg)]",
            "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
          )}
        >
          {label}
        </span>
      )}
    </Link>
  );
}

function NavGroupSection({
  group,
  expanded,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  expanded: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  const GroupIcon = group.icon;
  const isActive = group.children.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`));
  const [open, setOpen] = useState(isActive);
  const [flyoutOpen, setFlyoutOpen] = useState(false);

  const visibleChildren = group.children;

  if (!expanded) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setFlyoutOpen(true)}
        onMouseLeave={() => setFlyoutOpen(false)}
      >
        <button
          type="button"
          title={group.label}
          className={cn(
            "group relative grid w-full items-center rounded-app text-sm font-medium",
            "grid-cols-[var(--sidebar-icon-col)_minmax(0,1fr)] py-2.5 transition-colors",
            isActive
              ? "bg-app-sidebar-active text-app-sidebar-active-fg"
              : "text-app-sidebar-fg hover:bg-app-hover hover:text-app-fg",
          )}
        >
          <span className="flex items-center justify-center">
            <GroupIcon className="h-[18px] w-[18px] shrink-0" aria-hidden />
          </span>
        </button>

        {flyoutOpen && (
          <div
            className={cn(
              "absolute left-full top-0 z-50 ml-2 min-w-[10.5rem] overflow-hidden rounded-xl",
              "border border-app-border/40 bg-app-sidebar py-1.5 shadow-[var(--app-shadow-lg)]",
            )}
          >
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-app-muted">
              {group.label}
            </p>
            {visibleChildren.map((child) => {
              const ChildIcon = child.icon;
              const active = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 text-sm transition",
                    active
                      ? "bg-app-sidebar-active text-app-sidebar-active-fg"
                      : "text-app-sidebar-fg hover:bg-app-hover hover:text-app-fg",
                  )}
                >
                  <ChildIcon className="h-4 w-4 shrink-0" />
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "grid w-full items-center rounded-app text-sm font-medium",
          "grid-cols-[var(--sidebar-icon-col)_minmax(0,1fr)_auto] py-2.5 transition-colors",
          isActive
            ? "bg-app-sidebar-active/60 text-app-sidebar-active-fg"
            : "text-app-sidebar-fg hover:bg-app-hover hover:text-app-fg",
        )}
      >
        <span className="flex items-center justify-center">
          <GroupIcon className="h-[18px] w-[18px] shrink-0" aria-hidden />
        </span>
        <span className="truncate whitespace-nowrap text-left">{group.label}</span>
        <ChevronDown
          className={cn(
            "mr-3 h-4 w-4 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="space-y-0.5">
          {visibleChildren.map((child) => (
            <NavLink
              key={child.href}
              href={child.href}
              label={child.label}
              icon={child.icon}
              active={pathname === child.href}
              expanded={expanded}
              indent
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarNav({ expanded, hasPermission, onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex flex-col gap-0.5", className)}
      style={{ "--sidebar-icon-col": SIDEBAR_WIDTH_COLLAPSED } as React.CSSProperties}
    >
      {NAV_ITEMS.filter((item) => hasPermission(item.permission)).map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          active={pathname === item.href}
          expanded={expanded}
          onNavigate={onNavigate}
        />
      ))}

      {NAV_GROUPS.filter((group) => hasPermission(group.permission)).map((group) => {
        const groupActive = group.children.some(
          (c) => pathname === c.href || pathname.startsWith(`${c.href}/`),
        );
        return (
          <NavGroupSection
            key={`${group.id}-${groupActive ? "active" : "idle"}`}
            group={group}
            expanded={expanded}
            pathname={pathname}
            onNavigate={onNavigate}
          />
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
        "sidebar-rail fixed inset-y-0 left-0 z-50 hidden flex-col bg-app-sidebar will-change-[width] lg:flex",
        expanded ? "z-shell-sidebar-expanded" : "z-shell-sidebar",
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
