"use client";

import Link from "next/link";
import { AlertItem } from "@/types/domain";
import { Badge } from "@/shared/components/badge";
import { alertTone, groupAlerts } from "@/shared/utils/alerts";
import { cn } from "@/shared/utils/cn";

export function AlertsPanel({ alerts, onNavigate }: { alerts: AlertItem[]; onNavigate?: () => void }) {
  const groups = groupAlerts(alerts);

  if (!alerts.length) {
    return <p className="p-6 text-sm text-slate-500">Sin alertas activas</p>;
  }

  return (
    <div className="max-h-[28rem] overflow-y-auto">
      {groups.map((group) => (
        <div key={group.id}>
          <div className="sticky top-0 border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            {group.label} ({group.items.length})
          </div>
          {group.items.map((a, i) => {
            const tone = alertTone(a.type);
            const href = a.projectId ? `/projects?open=${a.projectId}` : a.kanbanCardId ? "/kanban" : undefined;
            const inner = (
              <div className={cn("flex gap-3 border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50", tone === "red" && "border-l-2 border-l-red-400")}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", tone === "red" ? "bg-red-500" : tone === "yellow" ? "bg-amber-500" : "bg-blue-500")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800">{a.text}</p>
                  <Badge className="mt-1.5" tone={tone === "red" ? "red" : tone === "yellow" ? "yellow" : "blue"}>{a.tag}</Badge>
                </div>
              </div>
            );
            return href ? (
              <Link key={`${a.type}-${i}`} href={href} onClick={onNavigate}>{inner}</Link>
            ) : (
              <div key={`${a.type}-${i}`}>{inner}</div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
