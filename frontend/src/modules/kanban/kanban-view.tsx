"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { kanbanService, projectService } from "@/services/project.service";
import { useConfirm } from "@/providers/confirm-provider";
import { useToast } from "@/providers/toast-provider";
import { Badge } from "@/shared/components/badge";
import { Button } from "@/shared/components/button";
import { FilterToolbar } from "@/shared/components/layout/filter-toolbar";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageSkeleton } from "@/shared/components/feedback/skeleton";
import { ErrorState } from "@/shared/components/state";
import { KANBAN_AREAS, KANBAN_PRIORITIES, KANBAN_STATUSES } from "@/shared/utils/constants";
import { dueSeverity, fmtDate, fmtDateTime } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";
import type { KanbanCard } from "@/types/domain";

const COLUMNS = [
  { code: "PENDIENTE", label: "Pendiente", accent: "border-t-slate-400" },
  { code: "EN_CURSO", label: "En curso", accent: "border-t-blue-500" },
  { code: "HECHO", label: "Hecho", accent: "border-t-emerald-500" },
];

export function KanbanView() {
  const [priorityFilter, setPriorityFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [editing, setEditing] = useState<KanbanCard | null | "new">(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const query = useQuery({ queryKey: ["kanban"], queryFn: () => kanbanService.list() });
  const projects = useQuery({ queryKey: ["projects-kanban"], queryFn: () => projectService.list(0, 100) });

  const moveMutation = useMutation({
    mutationFn: ({ id, statusCode }: { id: number; statusCode: string }) => kanbanService.updateStatus(id, statusCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban"] });
      showToast("Actividad movida", "info");
    },
  });

  const projectName = useMemo(() => {
    const map: Record<number, string> = {};
    (projects.data?.content ?? []).forEach((p) => { map[p.id] = p.name; });
    return map;
  }, [projects.data]);

  const cardsByColumn = useMemo(() => {
    let all = query.data?.content ?? [];
    if (priorityFilter) all = all.filter((c) => c.priorityCode === priorityFilter);
    if (areaFilter) all = all.filter((c) => c.areaCode === areaFilter);
    return COLUMNS.map((col) => ({ ...col, cards: all.filter((c) => c.statusCode === col.code) }));
  }, [query.data, priorityFilter, areaFilter]);

  if (query.isLoading) return <PageSkeleton />;
  if (query.isError) return <ErrorState message={query.error.message} />;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Actividades"
        title="Tablero Kanban operativo"
        subtitle="Gestión diaria con prioridades, vencimientos y arrastre entre columnas."
        actions={<Button onClick={() => setEditing("new")}><Plus className="mr-2 h-4 w-4" /> Nueva actividad</Button>}
      />

      <FilterToolbar
        chips={[
          { id: "all", label: "Todas", active: !priorityFilter, onClick: () => setPriorityFilter("") },
          ...KANBAN_PRIORITIES.map((p) => ({
            id: p.code,
            label: p.label,
            active: priorityFilter === p.code,
            onClick: () => setPriorityFilter(priorityFilter === p.code ? "" : p.code),
          })),
        ]}
        advanced={
          <select className="h-9 rounded-xl border border-slate-200 px-3 text-sm" value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
            <option value="">Todas las áreas</option>
            {KANBAN_AREAS.map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}
          </select>
        }
      />

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:snap-none lg:grid-cols-3 lg:overflow-visible lg:pb-0">
        {cardsByColumn.map((col) => (
          <div
            key={col.code}
            className={cn(
              "w-[min(100%,280px)] shrink-0 snap-start rounded-app bg-app-surface-muted p-3 lg:w-auto lg:shrink",
              "border-t-4",
              col.accent,
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggedId) moveMutation.mutate({ id: draggedId, statusCode: col.code });
              setDraggedId(null);
            }}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-800">{col.label}</h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-sm">{col.cards.length}</span>
            </div>
            <div className="space-y-2 min-h-[120px]">
              {col.cards.map((card) => {
                const sev = dueSeverity(card.dueDate, card.statusCode);
                return (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => setDraggedId(card.id)}
                    onDoubleClick={() => setEditing(card)}
                    className={cn(
                      "cursor-grab rounded-xl border bg-white p-3 shadow-sm transition active:cursor-grabbing hover:shadow-md",
                      sev === "overdue" && "border-red-300 bg-red-50/30",
                      sev === "today" && "border-amber-300 bg-amber-50/30",
                      draggedId === card.id && "opacity-50",
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Badge tone={card.priorityCode === "ALTA" ? "red" : card.priorityCode === "MEDIA" ? "yellow" : "slate"}>{card.priorityCode}</Badge>
                      <span className="text-[10px] font-medium uppercase text-slate-400">{KANBAN_AREAS.find((a) => a.code === card.areaCode)?.label}</span>
                    </div>
                    <p className="text-sm font-medium leading-snug text-slate-900">{card.text}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                      {card.dueDate && <span className={cn(sev === "overdue" && "font-semibold text-red-600")}>📅 {fmtDate(card.dueDate)}</span>}
                      {card.projectId && projectName[card.projectId] && (
                        <span className="truncate rounded bg-slate-100 px-1.5 py-0.5">{projectName[card.projectId]}</span>
                      )}
                    </div>
                    {card.reminderAt && <p className="mt-1 text-[10px] text-blue-600">⏰ {fmtDateTime(card.reminderAt)}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <KanbanModal
          card={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); queryClient.invalidateQueries({ queryKey: ["kanban"] }); }}
        />
      )}
    </div>
  );
}

function KanbanModal({ card, onClose, onSaved }: { card: KanbanCard | null; onClose: () => void; onSaved: () => void }) {
  const [text, setText] = useState(card?.text ?? "");
  const [areaCode, setAreaCode] = useState(card?.areaCode ?? "EXEC");
  const [priorityCode, setPriorityCode] = useState(card?.priorityCode ?? "MEDIA");
  const [statusCode, setStatusCode] = useState(card?.statusCode ?? "PENDIENTE");
  const [dueDate, setDueDate] = useState(card?.dueDate ?? "");
  const { showToast } = useToast();
  const { confirm: confirmDialog } = useConfirm();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl" onSubmit={async (e) => {
        e.preventDefault();
        try {
          const payload = { text, areaCode, priorityCode, statusCode, dueDate: dueDate || undefined };
          if (card) await kanbanService.update(card.id, payload);
          else await kanbanService.create(payload);
          showToast(card ? "Actividad actualizada" : "Actividad creada", "success");
          onSaved();
        } catch (err) {
          showToast(err instanceof Error ? err.message : "Error", "error");
        }
      }}>
        <h3 className="text-lg font-bold">{card ? "Editar actividad" : "Nueva actividad"}</h3>
        <textarea className="w-full rounded-xl border px-3 py-2 text-sm" rows={3} value={text} onChange={(e) => setText(e.target.value)} required />
        <div className="grid gap-3 sm:grid-cols-3">
          <select className="rounded-xl border px-3 py-2 text-sm" value={areaCode} onChange={(e) => setAreaCode(e.target.value)}>{KANBAN_AREAS.map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}</select>
          <select className="rounded-xl border px-3 py-2 text-sm" value={priorityCode} onChange={(e) => setPriorityCode(e.target.value)}>{KANBAN_PRIORITIES.map((p) => <option key={p.code} value={p.code}>{p.label}</option>)}</select>
          <select className="rounded-xl border px-3 py-2 text-sm" value={statusCode} onChange={(e) => setStatusCode(e.target.value)}>{KANBAN_STATUSES.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}</select>
        </div>
        <input type="date" className="w-full rounded-xl border px-3 py-2 text-sm" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <div className="flex justify-end gap-2">
          {card && (
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                const ok = await confirmDialog({
                  title: "Eliminar actividad",
                  description: "¿Eliminar esta tarjeta del tablero Kanban?",
                  confirmLabel: "Eliminar",
                  variant: "danger",
                });
                if (ok) {
                  await kanbanService.remove(card.id);
                  onSaved();
                }
              }}
            >
              Eliminar
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </div>
  );
}
