"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, FileText, Landmark } from "lucide-react";
import { CoordinationPanel } from "@/modules/dashboard/coordination-panel";
import { ExecutiveStatusBreakdown } from "@/modules/dashboard/executive-status-breakdown";
import { dashboardService, projectService } from "@/services/project.service";
import { Badge } from "@/shared/components/badge";
import { Card, CardContent, CardHeader } from "@/shared/components/card";
import { KpiStrip } from "@/shared/components/layout/kpi-strip";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageSkeleton } from "@/shared/components/feedback/skeleton";
import { TrafficLightBadge } from "@/shared/components/traffic-light-badge";
import { ErrorState } from "@/shared/components/state";
import { alertTone, groupAlerts } from "@/shared/utils/alerts";
import { fmtDate, fmtDateTime } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";

function MetricBar({
  label,
  count,
  max,
  tone,
}: {
  label: string;
  count: number;
  max: number;
  tone?: "red" | "amber" | "green" | "slate";
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const bar = { red: "bg-red-500", amber: "bg-amber-500", green: "bg-emerald-500", slate: "bg-slate-400" };
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-28 shrink-0 text-sm text-slate-600">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full transition-all", bar[tone ?? "slate"])} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right font-mono text-xs tabular-nums text-slate-500">{count}</span>
    </div>
  );
}

function FeedItem({
  dot,
  title,
  subtitle,
  tag,
  href,
}: {
  dot: string;
  title: string;
  subtitle?: string;
  tag?: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50">
      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dot)} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{title}</p>
        {subtitle && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {tag && <Badge tone="slate" className="shrink-0 text-[10px]">{tag}</Badge>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function DashboardView() {
  const executive = useQuery({
    queryKey: ["dashboard-executive"],
    queryFn: dashboardService.executive,
    refetchInterval: 60_000,
  });
  const alerts = useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn: dashboardService.alerts,
    refetchInterval: 60_000,
  });
  const committee = useQuery({
    queryKey: ["committee-summary"],
    queryFn: dashboardService.committee,
  });
  const projects = useQuery({
    queryKey: ["projects-pipeline-agg"],
    queryFn: () => projectService.list(0, 100),
  });

  if (executive.isLoading) return <PageSkeleton />;
  if (executive.isError) return <ErrorState message={executive.error.message} />;
  if (!executive.data) return <PageSkeleton />;

  const d = executive.data;
  const total = d.totalProjects || 1;
  const red = d.trafficLightCounts?.ROJO ?? 0;
  const amber = d.trafficLightCounts?.AMARILLO ?? 0;
  const stoppers = d.stopperCount;

  const pipelineAgg: Record<string, number> = {};
  (projects.data?.content ?? []).forEach((p) => {
    const key = p.pipelineStatusName ?? p.pipelineStatusCode;
    pipelineAgg[key] = (pipelineAgg[key] ?? 0) + 1;
  });
  const maxPipeline = Math.max(...Object.values(pipelineAgg), 1);
  const maxTl = Math.max(...Object.values(d.trafficLightCounts ?? {}), 1);
  const alertGroups = groupAlerts(alerts.data ?? []).slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Vista ejecutiva consolidada"
        subtitle="Portafolio IT, semáforos, coordinación, hitos y alertas operativas en tiempo real."
        actions={
          <Link href="/committee" className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <Landmark className="h-4 w-4" /> Vista comité <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      {/* Legacy: exactamente 4 KPIs — rs-projs, rs-red, rs-amber, rs-stoppers */}
      <KpiStrip
        items={[
          { label: "Proyectos", value: d.totalProjects, tone: "slate" },
          { label: "Semáforo rojo", value: red, tone: "red", barPct: (red / total) * 100 },
          { label: "Semáforo amarillo", value: amber, tone: "amber", barPct: (amber / total) * 100 },
          { label: "Con stopper", value: stoppers, tone: "red", barPct: (stoppers / total) * 100 },
        ]}
      />

      <CoordinationPanel projects={d.coordinationProjects} />

      <div className="grid gap-4 xl:grid-cols-3">
        <ExecutiveStatusBreakdown
          breakdown={d.executiveStatusBreakdown ?? {}}
          totalProjects={d.totalProjects}
        />
        <Card>
          <CardHeader><h3 className="text-sm font-semibold">Distribución semáforo</h3></CardHeader>
          <CardContent className="space-y-1">
            <MetricBar label="Rojo" count={red} max={maxTl} tone="red" />
            <MetricBar label="Amarillo" count={amber} max={maxTl} tone="amber" />
            <MetricBar label="Verde" count={d.trafficLightCounts?.VERDE ?? 0} max={maxTl} tone="green" />
            <MetricBar label="Sin datos" count={d.trafficLightCounts?.GRIS ?? 0} max={maxTl} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Calendar className="h-4 w-4 text-teal-600" />
            <h3 className="text-sm font-semibold">Próximos hitos</h3>
          </CardHeader>
          <CardContent className="space-y-0 pt-0">
            {d.upcomingMilestones.length ? d.upcomingMilestones.map((m) => (
              <FeedItem
                key={`${m.projectId}-${m.milestoneDate}`}
                dot="bg-teal-500"
                title={m.projectName}
                subtitle={m.milestone}
                tag={fmtDate(m.milestoneDate)}
                href={`/projects?open=${m.projectId}`}
              />
            )) : <p className="px-2 py-4 text-sm text-slate-500">Sin hitos próximos</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold">Sin actualizar (&gt;7d)</h3>
          </CardHeader>
          <CardContent className="space-y-0 pt-0">
            {d.staleProjects.length ? d.staleProjects.map((p) => (
              <FeedItem key={p.projectId} dot="bg-amber-500" title={p.projectName} tag={`${p.staleDays}d`} href={`/projects?open=${p.projectId}`} />
            )) : <p className="px-2 py-4 text-sm text-slate-500">Todos actualizados</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><h3 className="text-sm font-semibold">Alertas activas</h3></CardHeader>
          <CardContent className="space-y-0 pt-0">
            {alertGroups.length ? alertGroups.flatMap((g) => g.items.slice(0, 2)).slice(0, 5).map((a, i) => (
              <FeedItem
                key={`${a.type}-${i}`}
                dot={alertTone(a.type) === "red" ? "bg-red-500" : alertTone(a.type) === "yellow" ? "bg-amber-500" : "bg-blue-500"}
                title={a.text}
                tag={a.tag}
                href={a.projectId ? `/projects?open=${a.projectId}` : a.kanbanCardId ? "/kanban" : undefined}
              />
            )) : <p className="px-2 py-4 text-sm text-slate-500">Sin alertas activas</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <FileText className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-semibold">Bitácora reciente</h3>
          </CardHeader>
          <CardContent className="space-y-0 pt-0">
            {d.recentActivityLogs.length ? d.recentActivityLogs.map((l) => (
              <FeedItem
                key={l.id}
                dot="bg-violet-500"
                title={l.text}
                tag={l.loggedAt ? fmtDateTime(l.loggedAt).split(" ")[1] : undefined}
              />
            )) : <p className="px-2 py-4 text-sm text-slate-500">Sin registros</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><h3 className="text-sm font-semibold">Distribución por pipeline</h3></CardHeader>
          <CardContent className="space-y-1">
            {Object.entries(pipelineAgg).length ? Object.entries(pipelineAgg).map(([name, count]) => (
              <MetricBar key={name} label={name} count={count} max={maxPipeline} tone="slate" />
            )) : <p className="text-sm text-slate-500">Cargando portafolio...</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="text-sm font-semibold">Resumen comité — atención inmediata</h3>
            <Link href="/committee" className="text-xs font-semibold text-slate-500 hover:text-slate-900">Ver todo</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {(committee.data?.immediateAttention.projects ?? []).slice(0, 4).map((p) => (
              <Link key={p.projectId} href={`/projects?open=${p.projectId}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50">
                <TrafficLightBadge code={p.trafficLightCode} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.projectName}</p>
                  {p.leadName && <p className="text-xs text-slate-500">👤 {p.leadName}</p>}
                </div>
              </Link>
            )) || <p className="text-sm text-slate-500">Sin proyectos críticos</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
