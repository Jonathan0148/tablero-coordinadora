"use client";

import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut, Settings2 } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/shared/components/button";
import { AlertsPanel } from "@/shared/components/layout/alerts-panel";
import { AppSidebar, PAGE_TITLES } from "@/shared/components/layout/app-sidebar";
import { SettingsPanel } from "@/shared/components/layout/settings-panel";
import { UserAvatar } from "@/shared/components/layout/user-avatar";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/modules/auth/auth-store";
import { useKanbanNotifications } from "@/hooks/use-kanban-notifications";
import { dashboardService, kanbanService } from "@/services/project.service";
import { useThemeStore } from "@/shared/theme/theme-store";
import {
  getSidebarCollapsedServerSnapshot,
  getSidebarCollapsedSnapshot,
  saveSidebarCollapsed,
  subscribeSidebarCollapsed,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
} from "@/shared/utils/sidebar-preferences";

function TopbarIconButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative rounded-app p-2 text-app-muted transition duration-200",
        "hover:bg-app-hover hover:text-app-fg",
        active && "bg-app-hover text-app-fg",
      )}
    >
      {children}
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const setSettingsOpen = useThemeStore((state) => state.setSettingsOpen);
  const settingsOpen = useThemeStore((state) => state.settingsOpen);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const sidebarCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    getSidebarCollapsedServerSnapshot,
  );

  const toggleSidebar = () => {
    saveSidebarCollapsed(!sidebarCollapsed);
  };

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
  const pageTitle = PAGE_TITLES[pathname] ?? "IT Dashboard";

  const alerts = useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn: dashboardService.alerts,
    refetchInterval: 60_000,
    enabled: hasPermission("reports:read"),
  });

  const kanban = useQuery({
    queryKey: ["kanban-notifications"],
    queryFn: () => kanbanService.list(),
    refetchInterval: 60_000,
    enabled: hasPermission("kanban:read"),
  });

  useKanbanNotifications(kanban.data?.content);

  return (
    <div className="min-h-screen bg-app-bg text-app-fg">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        hasPermission={hasPermission}
      />

      <div
        className={cn("transition-[padding] duration-300 ease-in-out lg:pl-[var(--sidebar-width)]")}
        style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
      >
        <header
          className={cn(
            "sticky top-0 z-10 flex h-14 items-center justify-between px-4 backdrop-blur-md sm:px-6",
            "bg-app-navbar shadow-[var(--app-shadow)]",
          )}
        >
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-app-fg">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {hasPermission("reports:read") && (
              <div className="relative">
                <TopbarIconButton
                  label="Alertas"
                  active={alertsOpen}
                  onClick={() => setAlertsOpen(!alertsOpen)}
                >
                  <Bell className="h-[18px] w-[18px]" />
                  {(alerts.data?.length ?? 0) > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                      {alerts.data?.length}
                    </span>
                  )}
                </TopbarIconButton>
                {alertsOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Cerrar alertas"
                      className="fixed inset-0 z-10"
                      onClick={() => setAlertsOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-[min(100vw-2rem,420px)] overflow-hidden rounded-app bg-app-surface shadow-[var(--app-shadow-lg)]">
                      <div className="px-4 py-3">
                        <p className="font-semibold text-app-fg">Alertas activas</p>
                        <p className="text-xs text-app-muted">{alerts.data?.length ?? 0} señales operativas</p>
                      </div>
                      <AlertsPanel alerts={alerts.data ?? []} onNavigate={() => setAlertsOpen(false)} />
                    </div>
                  </>
                )}
              </div>
            )}

            <TopbarIconButton
              label="Configuración"
              active={settingsOpen}
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="h-[18px] w-[18px]" />
            </TopbarIconButton>

            <UserAvatar
              name={user?.fullName ?? "Usuario"}
              role={user?.roles[0]}
            />

            <Button
              variant="ghost"
              className="h-9 px-2.5 sm:px-3"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </header>

        <main>{children}</main>
      </div>

      <SettingsPanel />
    </div>
  );
}
