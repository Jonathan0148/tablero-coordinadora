"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Printer } from "lucide-react";
import { dashboardService } from "@/services/project.service";
import { Badge } from "@/shared/components/badge";
import { Card, CardContent, CardHeader } from "@/shared/components/card";
import { KpiStrip } from "@/shared/components/layout/kpi-strip";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageSkeleton } from "@/shared/components/feedback/skeleton";
import { TrafficLightBadge } from "@/shared/components/traffic-light-badge";
import { ErrorState } from "@/shared/components/state";
import { fmtDate } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";

export function CommitteeView() {
  const query = useQuery({ queryKey: ["committee-summary"], queryFn: dashboardService.committee });

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
          <button type="button" onClick={() => window.print()} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold hover:bg-slate-50">
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

      {s.coordinationCount > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800">
          {s.coordinationCount} proyecto(s) requieren acción inmediata de coordinación
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <CommitteeSection title={`Atención inmediata (${immediateAttention.projects.length})`} tone="critical">
          {immediateAttention.projects.length ? immediateAttention.projects.map((p) => (
            <CommitteeRow key={p.projectId} projectId={p.projectId} name={p.projectName} tl={p.trafficLightCode} lines={[
              p.requiresCoordination && p.coordinationDesc ? `Coordinación: ${p.coordinationDesc}` : null,
              p.hasStopper ? `Stopper ${p.stopperImpactName ?? ""}` : null,
              p.leadName ? `Líder: ${p.leadName}` : null,
            ].filter(Boolean) as string[]} />
          )) : <EmptySection text="Sin proyectos en estado crítico" />}
        </CommitteeSection>

        <CommitteeSection title={`Seguimiento (${followUp.projects.length})`} tone="watch">
          {followUp.projects.slice(0, 8).map((p) => (
            <CommitteeRow key={p.projectId} projectId={p.projectId} name={p.projectName} tl={p.trafficLightCode} lines={[
              p.nextMilestone ? `${fmtDate(p.nextMilestoneDate)} · ${p.nextMilestone}` : null,
              p.staleDays ? `${p.staleDays}d sin actualizar` : null,
            ].filter(Boolean) as string[]} />
          ))}
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
                  <div className={cn("h-2 rounded-full", m.assignmentCount >= 5 ? "bg-red-500" : m.assignmentCount >= 3 ? "bg-amber-500" : "bg-blue-500")} style={{ width: `${Math.min(100, m.assignmentCount * 20)}%` }} />
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
              <Link key={`${m.projectId}-${m.milestoneDate}`} href={`/projects?open=${m.projectId}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
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

function CommitteeSection({ title, tone, children }: { title: string; tone: "critical" | "watch"; children: React.ReactNode }) {
  return (
    <Card className={cn(tone === "critical" ? "border-red-200" : "border-amber-200")}>
      <CardHeader><h3 className="text-sm font-semibold">{title}</h3></CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}

function CommitteeRow({ projectId, name, tl, lines }: { projectId: number; name: string; tl: string; lines: string[] }) {
  return (
    <Link href={`/projects?open=${projectId}`} className="flex gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50">
      <TrafficLightBadge code={tl} />
      <div className="min-w-0">
        <p className="font-medium">{name}</p>
        {lines.map((l) => <p key={l} className="mt-0.5 line-clamp-2 text-xs text-slate-500">{l}</p>)}
      </div>
    </Link>
  );
}

function EmptySection({ text }: { text: string }) {
  return <p className="py-4 text-center text-sm text-slate-500">{text}</p>;
}
