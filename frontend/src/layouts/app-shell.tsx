"use client";

import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/shared/components/button";
import { AlertsPanel } from "@/shared/components/layout/alerts-panel";
import { AppSidebar, PAGE_TITLES } from "@/shared/components/layout/app-sidebar";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/modules/auth/auth-store";
import { useKanbanNotifications } from "@/hooks/use-kanban-notifications";
import { dashboardService, kanbanService } from "@/services/project.service";
import {
  getSidebarCollapsedServerSnapshot,
  getSidebarCollapsedSnapshot,
  saveSidebarCollapsed,
  subscribeSidebarCollapsed,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
} from "@/shared/utils/sidebar-preferences";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const hasPermission = useAuthStore((state) => state.hasPermission);
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
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        hasPermission={hasPermission}
      />

      <div
        className={cn("transition-[padding] duration-300 ease-in-out lg:pl-[var(--sidebar-width)]")}
        style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
      >
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-900">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {hasPermission("reports:read") && (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Alertas"
                  className="relative rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                  onClick={() => setAlertsOpen(!alertsOpen)}
                >
                  <Bell className="h-[18px] w-[18px]" />
                  {(alerts.data?.length ?? 0) > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                      {alerts.data?.length}
                    </span>
                  )}
                </button>
                {alertsOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Cerrar alertas"
                      className="fixed inset-0 z-10"
                      onClick={() => setAlertsOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-[min(100vw-2rem,420px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="font-semibold text-slate-900">Alertas activas</p>
                        <p className="text-xs text-slate-500">{alerts.data?.length ?? 0} señales operativas</p>
                      </div>
                      <AlertsPanel alerts={alerts.data ?? []} onNavigate={() => setAlertsOpen(false)} />
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="hidden text-right sm:block">
              <p className="max-w-[140px] truncate text-sm font-semibold text-slate-900">{user?.fullName ?? "Usuario"}</p>
              <p className="max-w-[140px] truncate text-[11px] text-slate-500">{user?.roles[0] ?? ""}</p>
            </div>

            <Button
              variant="secondary"
              className="h-9 px-3"
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

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
