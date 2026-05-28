"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AlertCircle, Eye, Printer } from "lucide-react";
import { dashboardService } from "@/services/project.service";
import { Badge } from "@/shared/components/badge";
import { CommitteeProjectCard } from "@/shared/components/layout/committee-project-card";
import { CoordinationPanel } from "@/shared/components/layout/coordination-panel";
import { Card, CardContent, CardHeader } from "@/shared/components/card";
import { KpiStrip } from "@/shared/components/layout/kpi-strip";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageSkeleton } from "@/shared/components/feedback/skeleton";
import { ErrorState } from "@/shared/components/state";
import { collectCoordinationFromCommittee } from "@/shared/utils/coordination";
import { fmtDate } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";
import type { CommitteeProjectItem } from "@/types/domain";

function buildCriticalChips(p: CommitteeProjectItem) {
  const chips: { label: string; tone?: "red" | "yellow" | "blue" | "slate" }[] = [];
  if (p.requiresCoordination) chips.push({ label: "Coordinación", tone: "red" });
  if (p.hasStopper) chips.push({ label: `Stopper${p.stopperImpactName ? ` · ${p.stopperImpactName}` : ""}`, tone: "red" });
  return chips;
}

function buildCriticalLines(p: CommitteeProjectItem) {
  return [
    p.requiresCoordination && p.coordinationDesc ? `Coordinación: ${p.coordinationDesc}` : null,
    p.hasStopper && p.stopperDesc ? `Stopper: ${p.stopperDesc}` : null,
    p.leadName ? `Líder: ${p.leadName}` : null,
    p.pendingDecisions ? `Decisiones: ${p.pendingDecisions}` : null,
  ].filter(Boolean) as string[];
}

function buildFollowUpChips(p: CommitteeProjectItem) {
  const chips: { label: string; tone?: "yellow" | "blue" | "slate" }[] = [];
  if (p.staleDays && p.staleDays > 7) chips.push({ label: `${p.staleDays}d sin update`, tone: "yellow" });
  if (p.nextMilestoneDate) chips.push({ label: fmtDate(p.nextMilestoneDate), tone: "blue" });
  return chips;
}

function buildFollowUpLines(p: CommitteeProjectItem) {
  return [
    p.nextMilestone ? `Hito: ${p.nextMilestone}` : null,
    p.leadName ? `Líder: ${p.leadName}` : null,
    p.executiveStatusName ? `Estado: ${p.executiveStatusName}` : null,
  ].filter(Boolean) as string[];
}

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

  const { portfolioStats: s, immediateAttention, followUp, resourceLoad, milestones30Days } = query.data;

  return (
    <div className="committee-print space-y-6">
      <PageHeader
        eyebrow="Comité"
        title="Vista ejecutiva de seguimiento"
        subtitle="Consolidado para reunión de comité: atención inmediata, seguimiento, recursos e hitos."
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

      <CoordinationPanel
        projects={coordinationProjects}
        title="Acción inmediata de coordinación"
        subtitle={`${coordinationProjects.length || s.coordinationCount} proyecto(s) requieren decisión de coordinación`}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <CommitteeSection
          title="Atención inmediata"
          count={immediateAttention.projects.length}
          tone="critical"
          icon={AlertCircle}
          description="Proyectos en rojo o que requieren coordinación"
        >
          {immediateAttention.projects.length ? (
            immediateAttention.projects.map((p) => (
              <CommitteeProjectCard
                key={p.projectId}
                projectId={p.projectId}
                name={p.projectName}
                trafficLightCode={p.trafficLightCode}
                executiveStatusName={p.executiveStatusName}
                chips={buildCriticalChips(p)}
                lines={buildCriticalLines(p)}
                variant="critical"
              />
            ))
          ) : (
            <EmptySection text="Sin proyectos en estado crítico" />
          )}
        </CommitteeSection>

        <CommitteeSection
          title="Seguimiento"
          count={followUp.projects.length}
          tone="watch"
          icon={Eye}
          description="Amarillos, hitos próximos y proyectos sin actualizar"
        >
          {followUp.projects.length ? (
            followUp.projects.slice(0, 8).map((p) => (
              <CommitteeProjectCard
                key={p.projectId}
                projectId={p.projectId}
                name={p.projectName}
                trafficLightCode={p.trafficLightCode}
                executiveStatusName={p.executiveStatusName}
                chips={buildFollowUpChips(p)}
                lines={buildFollowUpLines(p)}
                variant="watch"
              />
            ))
          ) : (
            <EmptySection text="Sin proyectos en seguimiento activo" />
          )}
        </CommitteeSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><h3 className="text-sm font-semibold">Carga de recursos activos</h3></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500">{resourceLoad.activeMemberCount} personas · {resourceLoad.totalAssignments} asignaciones</p>
            {resourceLoad.topMembers.map((m) => (
              <div key={m.memberId} className="grid grid-cols-[1fr_120px_40px] items-center gap-3">
                <span className="truncate text-sm font-medium">{m.memberName}</span>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className={cn("h-2 rounded-full transition-all", m.assignmentCount >= 5 ? "bg-red-500" : m.assignmentCount >= 3 ? "bg-amber-500" : "bg-blue-500")} style={{ width: `${Math.min(100, m.assignmentCount * 20)}%` }} />
                </div>
                <Badge tone={m.assignmentCount >= 5 ? "red" : m.assignmentCount >= 3 ? "yellow" : "blue"}>{m.assignmentCount}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="text-sm font-semibold">Hitos próximos 30 días</h3></CardHeader>
          <CardContent className="space-y-2">
            {milestones30Days.milestones.length ? milestones30Days.milestones.map((m) => (
              <Link key={`${m.projectId}-${m.milestoneDate}`} href={`/projects?open=${m.projectId}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50">
                <div>
                  <p className="text-sm font-medium">{m.projectName}</p>
                  <p className="text-xs text-slate-500">{m.milestone}</p>
                </div>
                <Badge>{fmtDate(m.milestoneDate)}</Badge>
              </Link>
            )) : <EmptySection text="Sin hitos en 30 días" />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CommitteeSection({
  title,
  count,
  tone,
  icon: Icon,
  description,
  children,
}: {
  title: string;
  count: number;
  tone: "critical" | "watch";
  icon: typeof AlertCircle;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden",
        tone === "critical" ? "border-red-200/60" : "border-amber-200/60",
      )}
    >
      <CardHeader className={cn(
        "border-b pb-4",
        tone === "critical" ? "border-red-100 bg-red-50/30" : "border-amber-100 bg-amber-50/30",
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            tone === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700",
          )}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {title}{" "}
              <span className="font-mono text-slate-500">({count})</span>
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">{children}</CardContent>
    </Card>
  );
}

function EmptySection({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-slate-500">{text}</p>;
}
