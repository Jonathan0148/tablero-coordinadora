"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { okrService } from "@/services/project.service";
import { useToast } from "@/providers/toast-provider";
import { Badge } from "@/shared/components/badge";
import { Card, CardContent, CardHeader } from "@/shared/components/card";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageSkeleton } from "@/shared/components/feedback/skeleton";
import { ErrorState } from "@/shared/components/state";

const OKR_STATUSES = ["PENDIENTE", "EN_CURSO", "COMPLETADO", "BLOQUEADO"];

/** Metas trimestrales: pendiente exposición en API (okr_activity_milestone). Placeholder documentado. */
function MilestonesPlaceholder() {
  return (
    <p className="text-[11px] italic text-slate-400" title="Requiere GET /okrs con milestones en backend">
      Metas Q1–Q4 disponibles tras endpoint backend
    </p>
  );
}

export function OkrsView() {
  const query = useQuery({ queryKey: ["okrs"], queryFn: okrService.list });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const updateMutation = useMutation({
    mutationFn: ({ okrId, activityId, pct, statusCode }: { okrId: number; activityId: number; pct?: number; statusCode?: string }) =>
      okrService.updateActivity(okrId, activityId, { pct, statusCode }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["okrs"] }),
    onError: (e: Error) => showToast(e.message, "error"),
  });

  if (query.isLoading) return <PageSkeleton />;
  if (query.isError) return <ErrorState message={query.error.message} />;
  if (!query.data?.length) return <p className="text-slate-500">Sin OKRs registrados.</p>;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="OKRs & KRs" title="Objetivos y resultados clave" subtitle="Progreso por actividad, dependencias y entregables." />

      {query.data.map((okr) => {
        const avg = okr.activities.length ? Math.round(okr.activities.reduce((a, x) => a + (x.pct ?? 0), 0) / okr.activities.length) : 0;
        const circumference = 2 * Math.PI * 36;
        const offset = circumference * (1 - avg / 100);

        return (
          <Card key={okr.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{okr.legacyId ?? okr.id}</p>
                <h3 className="text-lg font-bold">{okr.name}</h3>
              </div>
              <div className="relative flex h-20 w-20 items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <circle cx="40" cy="40" r="36" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-500" />
                </svg>
                <span className="font-mono text-sm font-bold">{avg}%</span>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-white text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="min-w-[200px] px-4 py-3">Actividad</th>
                    <th className="px-4 py-3">Responsable</th>
                    <th className="px-4 py-3">Dependencia</th>
                    <th className="px-4 py-3">Salida</th>
                    <th className="px-4 py-3">Avance</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Metas</th>
                  </tr>
                </thead>
                <tbody>
                  {okr.activities.map((act) => (
                    <tr key={act.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs">{act.legacyId}</td>
                      <td className="px-4 py-3 leading-relaxed">{act.text}</td>
                      <td className="px-4 py-3 text-slate-600">{act.responsible ?? "—"}</td>
                      <td className="px-4 py-3">{act.dependency ? <Badge tone="slate">{act.dependency}</Badge> : "—"}</td>
                      <td className="max-w-[180px] px-4 py-3 text-xs text-slate-600">{act.deliverable ?? "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input type="range" min={0} max={100} value={act.pct ?? 0} className="w-24 accent-slate-900" onChange={(e) => updateMutation.mutate({ okrId: okr.id, activityId: act.id, pct: Number(e.target.value) })} />
                        <span className="ml-2 font-mono text-xs">{act.pct ?? 0}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <select className="rounded-lg border border-slate-200 px-2 py-1 text-xs" value={act.statusCode} onChange={(e) => updateMutation.mutate({ okrId: okr.id, activityId: act.id, statusCode: e.target.value })}>
                          {OKR_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3"><MilestonesPlaceholder /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
