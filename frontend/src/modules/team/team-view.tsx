"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useAllAssignments } from "@/hooks/use-all-assignments";
import { dashboardService, teamService } from "@/services/project.service";
import { useConfirm } from "@/providers/confirm-provider";
import { useToast } from "@/providers/toast-provider";
import { Badge } from "@/shared/components/badge";
import { Button } from "@/shared/components/button";
import { Card, CardContent } from "@/shared/components/card";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageSkeleton } from "@/shared/components/feedback/skeleton";
import { TrafficLightBadge } from "@/shared/components/traffic-light-badge";
import { ErrorState } from "@/shared/components/state";
import { cn } from "@/shared/utils/cn";

type Tab = "members" | "assignments" | "capacity";

export function TeamView() {
  const [tab, setTab] = useState<Tab>("members");
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { confirm: confirmDialog } = useConfirm();

  const members = useQuery({ queryKey: ["team-members"], queryFn: () => teamService.list() });
  const committee = useQuery({ queryKey: ["committee-summary"], queryFn: dashboardService.committee });
  const assignments = useAllAssignments();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => teamService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      showToast("Persona eliminada", "info");
    },
  });

  const capacityRows = useMemo(() => {
    const top = committee.data?.resourceLoad.topMembers ?? [];
    const max = Math.max(...top.map((m) => m.assignmentCount), 1);
    return top.map((m) => ({ ...m, pct: Math.round((m.assignmentCount / max) * 100) }));
  }, [committee.data]);

  if (members.isLoading) return <PageSkeleton />;
  if (members.isError) return <ErrorState message={members.error.message} />;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Equipos"
        title="Personas, asignaciones y carga"
        subtitle="Catálogo de talento, matriz proyecto-equipo y heatmap de saturación."
        actions={tab === "members" ? <Button onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> Nueva persona</Button> : undefined}
      />

      <div className="flex w-full max-w-full overflow-x-auto rounded-app bg-app-surface-muted p-1">
        {([
          ["members", "Personas"],
          ["assignments", "Asignaciones"],
          ["capacity", "Carga"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition sm:px-4",
              tab === id ? "bg-app-surface text-app-fg shadow-sm" : "text-app-muted hover:text-app-fg",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "members" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(members.data?.content ?? []).map((m) => {
            const load = capacityRows.find((c) => c.memberName === m.name)?.assignmentCount ?? 0;
            return (
              <Card key={m.id} className="transition hover:shadow-md">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-sm text-slate-500">{m.defaultRoleName ?? m.defaultRoleCode}</p>
                    </div>
                    <Badge tone={m.active ? "green" : "slate"}>{m.active ? "Activo" : "Inactivo"}</Badge>
                  </div>
                  {m.email && <p className="text-sm text-blue-600">{m.email}</p>}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{load} proyecto(s)</span>
                    {m.notes && <span className="truncate italic">{m.notes}</span>}
                  </div>
                  <Button
                    variant="ghost"
                    className="text-red-600"
                    onClick={async () => {
                      const ok = await confirmDialog({
                        title: "Eliminar persona",
                        description: `¿Eliminar a ${m.name}? Se quitarán sus asignaciones asociadas.`,
                        confirmLabel: "Eliminar",
                        variant: "danger",
                      });
                      if (ok) deleteMutation.mutate(m.id);
                    }}
                  >
                    Eliminar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "assignments" && (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            {assignments.isLoading ? <PageSkeleton /> : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Proyecto</th>
                    <th className="px-4 py-3">Semáforo</th>
                    <th className="px-4 py-3">Líder</th>
                    <th className="px-4 py-3">Integrantes</th>
                    <th className="px-4 py-3">Pipeline</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.rows.map(({ project, lead, members: mems }) => (
                    <tr key={project.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/projects?open=${project.id}`} className="hover:text-blue-700">{project.name}</Link>
                      </td>
                      <td className="px-4 py-3"><TrafficLightBadge code={project.currentTrafficLight} /></td>
                      <td className="px-4 py-3">{lead?.teamMemberName ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {mems.map((a) => (
                            <Badge key={a.id} tone="slate">{a.teamMemberName}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{project.pipelineStatusName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!assignments.isLoading && !assignments.rows.length && (
              <p className="p-8 text-center text-sm text-slate-500">Sin asignaciones registradas.</p>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "capacity" && (
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="text-sm text-slate-500">
              {committee.data?.resourceLoad.activeMemberCount ?? 0} personas activas · {committee.data?.resourceLoad.totalAssignments ?? 0} asignaciones
            </p>
            {capacityRows.map((m) => (
              <div key={m.memberId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[140px_1fr_48px] sm:gap-4">
                <span className="truncate text-sm font-medium sm:col-auto">{m.memberName}</span>
                <div className="col-span-2 h-3 overflow-hidden rounded-full bg-slate-100 sm:col-span-1">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      m.assignmentCount >= 5 ? "bg-red-500" : m.assignmentCount >= 3 ? "bg-amber-500" : "bg-blue-500",
                    )}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
                <Badge className="justify-self-end sm:justify-self-auto" tone={m.assignmentCount >= 5 ? "red" : m.assignmentCount >= 3 ? "yellow" : "blue"}>{m.assignmentCount}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {showCreate && <MemberModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); queryClient.invalidateQueries({ queryKey: ["team-members"] }); }} />}
    </div>
  );
}

function MemberModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [roleCode, setRoleCode] = useState("LIDER_TECNICO");
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl" onSubmit={async (e) => {
        e.preventDefault();
        try {
          await teamService.create({ name, defaultRoleCode: roleCode, email, active: true });
          showToast("Persona agregada", "success");
          onSaved();
        } catch (err) {
          showToast(err instanceof Error ? err.message : "Error", "error");
        }
      }}>
        <h3 className="text-lg font-bold">Nueva persona</h3>
        <input className="w-full rounded-xl border px-3 py-2.5 text-sm" placeholder="Nombre *" value={name} onChange={(e) => setName(e.target.value)} required />
        <select className="w-full rounded-xl border px-3 py-2.5 text-sm" value={roleCode} onChange={(e) => setRoleCode(e.target.value)}>
          <option value="LIDER_TECNICO">Líder Técnico</option>
          <option value="BE_JAVA">BE Java</option>
          <option value="FE">Frontend</option>
        </select>
        <input className="w-full rounded-xl border px-3 py-2.5 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </div>
  );
}
