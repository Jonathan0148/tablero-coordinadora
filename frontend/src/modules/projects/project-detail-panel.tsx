"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { kanbanService, assignmentService, projectService, teamService } from "@/services/project.service";
import { Timeline, TimelineItem } from "@/shared/components/data/timeline";
import { useToast } from "@/providers/toast-provider";
import { Badge } from "@/shared/components/badge";
import { Button } from "@/shared/components/button";
import { TrafficLightBadge } from "@/shared/components/traffic-light-badge";
import { LoadingState } from "@/shared/components/state";
import {
  EXECUTIVE_STATUSES,
  RESPONSIBLE_AREAS,
  STOPPER_IMPACTS,
} from "@/shared/utils/constants";
import { fmtDate, fmtDateTime } from "@/shared/utils/format";
import { calcTrafficLight } from "@/shared/utils/traffic-light";
import type { CreateProjectUpdatePayload, Project, ProjectUpdate } from "@/types/domain";

type Tab = "overview" | "update" | "history" | "team" | "risks" | "activity";

const TAB_LABELS: Record<Tab, string> = {
  overview: "Resumen",
  update: "Actualizar",
  history: "Timeline",
  team: "Equipo",
  risks: "Riesgos",
  activity: "Actividades",
};

export function ProjectDetailPanel({ projectId, onClose }: { projectId: number; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const project = useQuery({ queryKey: ["project", projectId], queryFn: () => projectService.get(projectId) });
  const updates = useQuery({ queryKey: ["project-updates", projectId], queryFn: () => projectService.updates(projectId) });
  const assignments = useQuery({ queryKey: ["project-assignments", projectId], queryFn: () => projectService.assignments(projectId) });
  const members = useQuery({ queryKey: ["team-members"], queryFn: () => teamService.list() });
  const kanban = useQuery({ queryKey: ["kanban-project", projectId], queryFn: () => kanbanService.list(0, 200) });

  const latest = updates.data?.content[0];
  const projectTasks = (kanban.data?.content ?? []).filter((c) => c.projectId === projectId && c.statusCode !== "HECHO");

  const removeAssignment = useMutation({
    mutationFn: (id: number) => assignmentService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-assignments", projectId] });
      showToast("Asignación removida", "info");
    },
  });

  if (project.isLoading) return <LoadingState />;

  const p = project.data as Project | undefined;
  if (!p) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-3xl flex-col bg-app-surface shadow-2xl">
        <div className="bg-app-surface-muted/50 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Detalle de proyecto</p>
              <h2 className="mt-1 truncate text-xl font-bold">{p.name}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{p.pipelineStatusName}</Badge>
                <TrafficLightBadge code={p.currentTrafficLight} />
                {p.requiresCoordination && <Badge tone="red">Coordinación</Badge>}
                {p.hasStopper && <Badge tone="red">Stopper</Badge>}
                {(p.staleDays ?? 0) > 7 && <Badge tone="yellow">{p.staleDays}d sin update</Badge>}
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 hover:bg-white"><X className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="flex overflow-x-auto border-b border-slate-100 px-4">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${tab === t ? "border-slate-950 text-slate-950" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === "overview" && latest && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Estado ejecutivo" value={latest.executiveStatusName} />
                <Metric label="Última actualización" value={fmtDateTime(latest.updatedAtOriginal)} />
                <Metric label="Próximo hito" value={latest.nextMilestone ? `${latest.nextMilestone} (${fmtDate(latest.nextMilestoneDate)})` : "—"} />
                <Metric label="Tareas abiertas" value={String(projectTasks.length)} />
              </div>
              <Section title="Resumen">{latest.summary}</Section>
              {latest.pendingItems && <Section title="Pendientes">{latest.pendingItems}</Section>}
              {latest.pendingDecisions && <Section title="Decisiones pendientes">{latest.pendingDecisions}</Section>}
            </div>
          )}
          {tab === "overview" && !latest && <p className="text-sm text-slate-500">Sin actualizaciones. Registra la primera en la pestaña Actualizar.</p>}
          {tab === "update" && (
            <ProjectUpdateForm
              key={latest?.id ?? "new"}
              projectId={projectId}
              latest={latest}
              onSaved={() => {
                queryClient.invalidateQueries({ queryKey: ["project-updates", projectId] });
                queryClient.invalidateQueries({ queryKey: ["project", projectId] });
                queryClient.invalidateQueries({ queryKey: ["projects"] });
                queryClient.invalidateQueries({ queryKey: ["dashboard-executive"] });
                setTab("history");
              }}
            />
          )}

          {tab === "history" && (
            <Timeline>
              {!updates.data?.content.length ? (
                <p className="text-sm text-slate-500">Sin actualizaciones registradas.</p>
              ) : (
                updates.data.content.map((u: ProjectUpdate, i) => (
                  <TimelineItem
                    key={u.id}
                    title={fmtDateTime(u.updatedAtOriginal)}
                    badges={<><TrafficLightBadge code={u.trafficLightCode} /><Badge>{u.executiveStatusName}</Badge></>}
                    isLast={i === updates.data!.content.length - 1}
                  >
                    <p className="whitespace-pre-wrap">{u.summary}</p>
                    {u.pendingItems && <p><span className="font-medium">Pendientes:</span> {u.pendingItems}</p>}
                  </TimelineItem>
                ))
              )}
            </Timeline>
          )}

          {tab === "risks" && (
            <div className="space-y-4">
              {!latest ? <p className="text-sm text-slate-500">Sin datos de riesgos.</p> : (
                <>
                  {latest.hasStopper && (
                    <Section title={`Stopper · ${latest.stopperImpactCode ?? ""}`}>
                      {latest.stopperDesc}
                      {latest.stopperOwner && <p className="mt-2 text-xs text-slate-500">Responsable: {latest.stopperOwner}</p>}
                    </Section>
                  )}
                  {latest.relevantRisks && <Section title="Riesgos relevantes">{latest.relevantRisks}</Section>}
                  {latest.requiresCoordination && <Section title="Coordinación">{latest.coordinationDesc}</Section>}
                  {!latest.hasStopper && !latest.relevantRisks && !latest.requiresCoordination && (
                    <p className="text-sm text-slate-500">Sin riesgos, stoppers ni coordinación activa.</p>
                  )}
                </>
              )}
            </div>
          )}

          {tab === "activity" && (
            <div className="space-y-2">
              {projectTasks.length ? projectTasks.map((t) => (
                <div key={t.id} className="rounded-xl border border-slate-100 p-3">
                  <p className="text-sm font-medium">{t.text}</p>
                  <div className="mt-1 flex gap-2 text-xs text-slate-500">
                    <Badge tone="slate">{t.statusCode}</Badge>
                    {t.dueDate && <span>📅 {fmtDate(t.dueDate)}</span>}
                  </div>
                </div>
              )) : <p className="text-sm text-slate-500">Sin actividades kanban abiertas para este proyecto.</p>}
            </div>
          )}

          {tab === "team" && (
            <div className="space-y-4">
              {assignments.data?.filter((a) => a.lead).map((lead) => (
                <div key={lead.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase text-amber-700">Líder técnico</p>
                  <p className="font-semibold">{lead.teamMemberName}</p>
                  <p className="text-sm text-slate-600">{lead.roleName}</p>
                </div>
              ))}
              {assignments.data?.filter((a) => !a.lead).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                  <div>
                    <p className="font-medium">{a.teamMemberName}</p>
                    <p className="text-sm text-slate-500">{a.roleName}</p>
                  </div>
                  <Button variant="ghost" onClick={() => removeAssignment.mutate(a.id)}>Quitar</Button>
                </div>
              ))}
              <AssignForm projectId={projectId} members={members.data?.content ?? []} onDone={() => queryClient.invalidateQueries({ queryKey: ["project-assignments", projectId] })} />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function ProjectUpdateForm({
  projectId,
  latest,
  onSaved,
}: {
  projectId: number;
  latest?: ProjectUpdate;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<CreateProjectUpdatePayload>(() => ({
    executiveStatusCode: latest?.executiveStatusCode ?? "EN_CURSO",
    summary: latest?.summary ?? "",
    pendingItems: latest?.pendingItems ?? "",
    hasStopper: latest?.hasStopper ?? false,
    stopperDesc: latest?.stopperDesc ?? "",
    stopperOwner: latest?.stopperOwner ?? "",
    stopperImpactCode: latest?.stopperImpactCode ?? "",
    relevantRisks: latest?.relevantRisks ?? "",
    nextMilestone: latest?.nextMilestone ?? "",
    nextMilestoneDate: latest?.nextMilestoneDate ?? "",
    pendingDecisions: latest?.pendingDecisions ?? "",
    requiresCoordination: latest?.requiresCoordination ?? false,
    coordinationDesc: latest?.coordinationDesc ?? "",
    responsibleAreaCode: latest?.responsibleAreaCode ?? "",
    responsibleAction: latest?.responsibleAction ?? "",
    additionalNotes: latest?.additionalNotes ?? "",
    calculateTrafficLight: true,
  }));

  const previewTl = useMemo(
    () =>
      calcTrafficLight({
        requiresCoordination: form.requiresCoordination,
        executiveStatusCode: form.executiveStatusCode,
        hasStopper: form.hasStopper,
        stopperImpactCode: form.stopperImpactCode,
        relevantRisks: form.relevantRisks,
      }),
    [form],
  );

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!form.summary.trim()) {
          showToast("El resumen es obligatorio", "error");
          return;
        }
        if (form.requiresCoordination && !form.coordinationDesc?.trim()) {
          showToast("La descripción de coordinación es obligatoria", "error");
          return;
        }
        setPending(true);
        try {
          await projectService.createUpdate(projectId, form);
          showToast("Actualización guardada", "success");
          onSaved();
        } catch (err) {
          showToast(err instanceof Error ? err.message : "Error", "error");
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Estado ejecutivo *</span>
          <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.executiveStatusCode} onChange={(e) => setForm({ ...form, executiveStatusCode: e.target.value })}>
            {EXECUTIVE_STATUSES.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
          </select>
        </label>
        <div>
          <span className="text-sm font-medium">Semáforo (calculado)</span>
          <div className="mt-2"><TrafficLightBadge code={previewTl} /></div>
        </div>
      </div>
      {(
        [
          ["summary", "Resumen de avances *", true],
          ["pendingItems", "Pendientes principales", false],
          ["relevantRisks", "Riesgos relevantes", false],
          ["pendingDecisions", "Decisiones pendientes", false],
          ["additionalNotes", "Observaciones adicionales", false],
        ] as const
      ).map(([key, label, required]) => (
        <label key={key} className="block text-sm">
          <span className="font-medium">{label}</span>
          <textarea className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" rows={key === "summary" ? 4 : 2} required={required} value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        </label>
      ))}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">¿Stopper?</span>
          <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.hasStopper ? "true" : "false"} onChange={(e) => setForm({ ...form, hasStopper: e.target.value === "true" })}>
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </label>
        {form.hasStopper && (
          <label className="block text-sm">
            <span className="font-medium">Impacto</span>
            <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.stopperImpactCode} onChange={(e) => setForm({ ...form, stopperImpactCode: e.target.value })}>
              <option value="">—</option>
              {STOPPER_IMPACTS.map((i) => <option key={i.code} value={i.code}>{i.label}</option>)}
            </select>
          </label>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Próximo hito</span>
          <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.nextMilestone} onChange={(e) => setForm({ ...form, nextMilestone: e.target.value })} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Fecha compromiso</span>
          <input type="date" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.nextMilestoneDate ?? ""} onChange={(e) => setForm({ ...form, nextMilestoneDate: e.target.value })} />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-medium">¿Requiere coordinación?</span>
        <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.requiresCoordination ? "true" : "false"} onChange={(e) => setForm({ ...form, requiresCoordination: e.target.value === "true" })}>
          <option value="false">No</option>
          <option value="true">Sí</option>
        </select>
      </label>
      {form.requiresCoordination && (
        <label className="block text-sm">
          <span className="font-medium">Descripción coordinación *</span>
          <textarea className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" rows={2} value={form.coordinationDesc} onChange={(e) => setForm({ ...form, coordinationDesc: e.target.value })} />
        </label>
      )}
      <label className="block text-sm">
        <span className="font-medium">Área responsable</span>
        <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.responsibleAreaCode} onChange={(e) => setForm({ ...form, responsibleAreaCode: e.target.value })}>
          <option value="">—</option>
          {RESPONSIBLE_AREAS.map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-medium">Acción requerida</span>
        <textarea className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" rows={2} value={form.responsibleAction} onChange={(e) => setForm({ ...form, responsibleAction: e.target.value })} />
      </label>
      <Button type="submit" disabled={pending}>Guardar actualización</Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{children}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function AssignForm({ projectId, members, onDone }: { projectId: number; members: { id: number; name: string; defaultRoleCode?: string }[]; onDone: () => void }) {
  const [memberId, setMemberId] = useState("");
  const [roleCode, setRoleCode] = useState("LIDER_TECNICO");
  const [lead, setLead] = useState(false);
  const { showToast } = useToast();

  return (
    <form
      className="space-y-3 rounded-xl border border-dashed border-slate-200 p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!memberId) return;
        try {
          await assignmentService.create({ projectId, teamMemberId: Number(memberId), roleCode, lead });
          showToast("Persona asignada", "success");
          onDone();
        } catch (err) {
          showToast(err instanceof Error ? err.message : "Error", "error");
        }
      }}
    >
      <p className="text-sm font-semibold">Asignar persona</p>
      <select className="w-full rounded-xl border border-slate-200 px-3 py-2" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
        <option value="">— Seleccionar —</option>
        {members.filter((m) => m).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      <select className="w-full rounded-xl border border-slate-200 px-3 py-2" value={roleCode} onChange={(e) => setRoleCode(e.target.value)}>
        <option value="LIDER_TECNICO">Líder Técnico</option>
        <option value="BE_JAVA">BE Java</option>
        <option value="FE">Frontend</option>
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={lead} onChange={(e) => setLead(e.target.checked)} />
        Es líder técnico
      </label>
      <Button type="submit">Asignar</Button>
    </form>
  );
}
