"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Calendar, CheckCircle2, Printer, Users } from "lucide-react";
import { dashboardService } from "@/services/project.service";
import { Badge } from "@/shared/components/badge";
import { CoordinationPanel } from "@/shared/components/layout/coordination-panel";
import { Card, CardContent, CardHeader } from "@/shared/components/card";
import { KpiStrip } from "@/shared/components/layout/kpi-strip";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageSkeleton } from "@/shared/components/feedback/skeleton";
import { ErrorState } from "@/shared/components/state";
import { collectCoordinationFromCommittee } from "@/shared/utils/coordination";
import { fmtDate } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";

export function CommitteeView() {
  const query = useQuery({ queryKey: ["committee-summary"], queryFn: dashboardService.committee });

  const coordinationProjects = useMemo(() => {
    if (!query.data) return [];
    return collectCoordinationFromCommittee(
      query.data.immediateAttention.projects,
      query.data.followUp.projects,
    );
  }, [query.data]);

  if (query.isLoading) return <PageSkeleton />;
  if (query.isError) return <ErrorState message={query.error.message} />;
  if (!query.data) return <PageSkeleton />;

  const { portfolioStats: s, resourceLoad, milestones30Days } = query.data;
  const coordinationCount = coordinationProjects.length || s.coordinationCount;

  return (
    <div className="committee-print space-y-8">
      <PageHeader
        eyebrow="Comité"
        title="Vista ejecutiva de seguimiento"
        subtitle="Portafolio consolidado con foco en coordinación, recursos e hitos próximos."
        actions={
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold transition hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" /> Imprimir
          </button>
        }
      />

      <KpiStrip
        items={[
          { label: "Proyectos", value: s.totalProjects, tone: "slate" },
          { label: "Rojo", value: s.redCount, tone: "red", barPct: s.totalProjects ? (s.redCount / s.totalProjects) * 100 : 0 },
          { label: "Amarillo", value: s.amberCount, tone: "amber", barPct: s.totalProjects ? (s.amberCount / s.totalProjects) * 100 : 0 },
          { label: "Verde", value: s.greenCount, tone: "green", barPct: s.totalProjects ? (s.greenCount / s.totalProjects) * 100 : 0 },
        ]}
      />

      <section className="space-y-3">
        {coordinationProjects.length > 0 ? (
          <CoordinationPanel
            projects={coordinationProjects}
            title="Acción inmediata de coordinación"
            subtitle={`${coordinationCount} proyecto(s) requieren acción inmediata de coordinación`}
          />
        ) : (
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-white px-6 py-8 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900">Sin pendientes de coordinación</h3>
              <p className="mt-1 text-sm text-emerald-800/80">
                No hay proyectos que requieran acción inmediata de coordinación en este momento.
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-start gap-3 pb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Carga de recursos activos</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {resourceLoad.activeMemberCount} personas · {resourceLoad.totalAssignments} asignaciones
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {resourceLoad.topMembers.length ? resourceLoad.topMembers.map((m) => (
              <div key={m.memberId} className="grid grid-cols-[1fr_minmax(80px,120px)_2.5rem] items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50">
                <span className="truncate text-sm font-medium text-slate-800">{m.memberName}</span>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      m.assignmentCount >= 5 ? "bg-red-500" : m.assignmentCount >= 3 ? "bg-amber-500" : "bg-blue-500",
                    )}
                    style={{ width: `${Math.min(100, m.assignmentCount * 20)}%` }}
                  />
                </div>
                <Badge tone={m.assignmentCount >= 5 ? "red" : m.assignmentCount >= 3 ? "yellow" : "blue"} className="justify-center tabular-nums">
                  {m.assignmentCount}
                </Badge>
              </div>
            )) : (
              <p className="py-4 text-center text-sm text-slate-500">Sin asignaciones activas</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-start gap-3 pb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Hitos próximos 30 días</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {milestones30Days.milestones.length} hito(s) programados
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {milestones30Days.milestones.length ? milestones30Days.milestones.map((m) => (
              <Link
                key={`${m.projectId}-${m.milestoneDate}`}
                href={`/projects?open=${m.projectId}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{m.projectName}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{m.milestone}</p>
                </div>
                <Badge tone="blue" className="shrink-0 text-[10px]">{fmtDate(m.milestoneDate)}</Badge>
              </Link>
            )) : (
              <p className="py-4 text-center text-sm text-slate-500">Sin hitos en 30 días</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
