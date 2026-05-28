"use client";

import { BarChart3 } from "lucide-react";
import { Badge } from "@/shared/components/badge";
import { Card, CardContent, CardHeader } from "@/shared/components/card";
import { EXECUTIVE_STATUSES } from "@/shared/utils/constants";
import { cn } from "@/shared/utils/cn";

const STATUS_TONE: Record<string, { bar: string; badge: "blue" | "yellow" | "red" | "purple" | "green" | "slate" }> = {
  EN_CURSO: { bar: "bg-blue-500", badge: "blue" },
  EN_RIESGO: { bar: "bg-amber-500", badge: "yellow" },
  BLOQUEADO: { bar: "bg-red-500", badge: "red" },
  REQUIERE_DECISION: { bar: "bg-violet-500", badge: "purple" },
  COMPLETADO: { bar: "bg-emerald-500", badge: "green" },
};

function resolveCount(breakdown: Record<string, number>, code: string, label: string): number {
  return breakdown[code] ?? breakdown[label] ?? 0;
}

type ExecutiveStatusBreakdownProps = {
  breakdown: Record<string, number>;
  totalProjects: number;
};

export function ExecutiveStatusBreakdown({ breakdown, totalProjects }: ExecutiveStatusBreakdownProps) {
  const rows = EXECUTIVE_STATUSES.map((status) => ({
    ...status,
    count: resolveCount(breakdown, status.code, status.label),
  }));

  const maxCount = Math.max(...rows.map((r) => r.count), 1);
  const withUpdates = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Estado ejecutivo</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {withUpdates} de {totalProjects} proyectos con actualización registrada
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {rows.map((row) => {
          const tone = STATUS_TONE[row.code] ?? { bar: "bg-slate-400", badge: "slate" as const };
          const barPct = (row.count / maxCount) * 100;
          const portfolioPct = totalProjects > 0 ? Math.round((row.count / totalProjects) * 100) : 0;

          return (
            <div
              key={row.code}
              className="group grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50/80"
            >
              <div className="min-w-0">
                <Badge tone={tone.badge} className="max-w-full truncate text-[11px]">
                  {row.label}
                </Badge>
              </div>

              <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    tone.bar,
                    row.count === 0 && "opacity-0",
                  )}
                  style={{ width: `${barPct}%` }}
                />
              </div>

              <div className="flex min-w-[3.5rem] items-baseline justify-end gap-1.5 text-right">
                <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                  {row.count}
                </span>
                <span className="text-[10px] font-medium tabular-nums text-slate-400">
                  {portfolioPct}%
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
