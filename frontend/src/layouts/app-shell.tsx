"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Bell, BookOpen, Boxes, CheckSquare, Landmark, LogOut, Shield, Target, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/button";
import { AlertsPanel } from "@/shared/components/layout/alerts-panel";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/modules/auth/auth-store";
import { useKanbanNotifications } from "@/hooks/use-kanban-notifications";
import { dashboardService, kanbanService } from "@/services/project.service";

const nav = [
  { href: "/", label: "Dashboard", icon: BarChart3, permission: "reports:read" },
  { href: "/committee", label: "Comité", icon: Landmark, permission: "committee:read" },
  { href: "/projects", label: "Proyectos", icon: Boxes, permission: "projects:read" },
  { href: "/kanban", label: "Kanban", icon: CheckSquare, permission: "kanban:read" },
  { href: "/log", label: "Bitácora", icon: BookOpen, permission: "logs:read" },
  { href: "/team", label: "Equipo", icon: Users, permission: "teams:read" },
  { href: "/okrs", label: "OKRs", icon: Target, permission: "okrs:read" },
  { href: "/admin", label: "Admin RBAC", icon: Shield, permission: "security:admin" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [alertsOpen, setAlertsOpen] = useState(false);

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
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-slate-100 px-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Coltefinanciera</p>
            <h1 className="text-lg font-bold">IT Dashboard</h1>
          </div>
        </div>
        <nav className="space-y-1 p-4">
          {nav
            .filter((item) => hasPermission(item.permission))
            .map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                    active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Plataforma enterprise</p>
            <p className="text-sm text-slate-600">Datos reales desde Oracle vía Spring Boot</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                className="relative rounded-xl border border-slate-200 p-2 hover:bg-slate-50"
                onClick={() => setAlertsOpen(!alertsOpen)}
              >
                <Bell className="h-5 w-5" />
                {(alerts.data?.length ?? 0) > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {alerts.data?.length}
                  </span>
                )}
              </button>
              {alertsOpen && (
                <div className="absolute right-0 mt-2 w-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="font-semibold">Alertas activas</p>
                    <p className="text-xs text-slate-500">{alerts.data?.length ?? 0} señales operativas</p>
                  </div>
                  <AlertsPanel alerts={alerts.data ?? []} onNavigate={() => setAlertsOpen(false)} />
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{user?.fullName ?? "Usuario"}</p>
              <p className="text-xs text-slate-500">{user?.roles.join(", ")}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
