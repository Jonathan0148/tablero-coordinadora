"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ProjectCard } from "@/modules/projects/project-card";
import { ProjectDetailPanel } from "@/modules/projects/project-detail-panel";
import { ProjectFiltersPanel } from "@/modules/projects/project-filters-panel";
import { projectService } from "@/services/project.service";
import { useToast } from "@/providers/toast-provider";
import { Button } from "@/shared/components/button";
import { FilterToolbar } from "@/shared/components/layout/filter-toolbar";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageSkeleton } from "@/shared/components/feedback/skeleton";
import { EmptyState, ErrorState } from "@/shared/components/state";
import { DEFAULT_VISIBLE_PIPELINE, PIPELINE_STATUSES } from "@/shared/utils/constants";
import { loadVisiblePipelineStatuses, saveVisiblePipelineStatuses } from "@/shared/utils/ui-preferences";
import { cn } from "@/shared/utils/cn";
import type { Project, ProjectFilters } from "@/types/domain";

const TL_OPTIONS = [
  { code: "", label: "Todos" },
  { code: "ROJO", label: "Rojo" },
  { code: "AMARILLO", label: "Amarillo" },
  { code: "VERDE", label: "Verde" },
  { code: "GRIS", label: "Sin datos" },
];

export function ProjectsView() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState("");
  const [tlFilter, setTlFilter] = useState("");
  const [visibleStatuses, setVisibleStatuses] = useState<string[]>(() =>
    loadVisiblePipelineStatuses(DEFAULT_VISIBLE_PIPELINE),
  );
  const [staleOnly, setStaleOnly] = useState(false);
  const [coordOnly, setCoordOnly] = useState(false);
  const [stopperOnly, setStopperOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openProjectId, setOpenProjectId] = useState<number | null>(() => {
    const open = searchParams.get("open");
    return open ? Number(open) : null;
  });
  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const filters: ProjectFilters = useMemo(() => ({
    search: search || undefined,
    pipelineStatus: pipelineFilter || undefined,
    pipelineStatuses: visibleStatuses,
    trafficLight: tlFilter || undefined,
    stale: staleOnly || undefined,
    requiresCoordination: coordOnly || undefined,
    hasStopper: stopperOnly || undefined,
    activeOnly: true,
  }), [search, pipelineFilter, visibleStatuses, tlFilter, staleOnly, coordOnly, stopperOnly]);

  const query = useQuery({
    queryKey: ["projects", page, filters],
    queryFn: () => projectService.list(page, 24, filters),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showToast("Proyecto eliminado", "info");
    },
  });

  const advancedActive = [staleOnly, coordOnly, stopperOnly].filter(Boolean).length
    + (visibleStatuses.length !== DEFAULT_VISIBLE_PIPELINE.length ? 1 : 0)
    + (pipelineFilter ? 1 : 0);

  const activeTags = useMemo(() => {
    const tags: { key: string; label: string; onRemove: () => void }[] = [];
    if (search) tags.push({ key: "search", label: `Buscar: ${search}`, onRemove: () => { setSearch(""); setPage(0); } });
    if (tlFilter) {
      const tl = TL_OPTIONS.find((o) => o.code === tlFilter);
      tags.push({ key: "tl", label: `Semáforo: ${tl?.label ?? tlFilter}`, onRemove: () => { setTlFilter(""); setPage(0); } });
    }
    if (pipelineFilter) {
      const p = PIPELINE_STATUSES.find((s) => s.code === pipelineFilter);
      tags.push({ key: "pipeline", label: `Pipeline: ${p?.label ?? pipelineFilter}`, onRemove: () => { setPipelineFilter(""); setPage(0); } });
    }
    if (staleOnly) tags.push({ key: "stale", label: "Sin actualizar", onRemove: () => { setStaleOnly(false); setPage(0); } });
    if (coordOnly) tags.push({ key: "coord", label: "Coordinación", onRemove: () => { setCoordOnly(false); setPage(0); } });
    if (stopperOnly) tags.push({ key: "stopper", label: "Con stopper", onRemove: () => { setStopperOnly(false); setPage(0); } });
    if (visibleStatuses.length !== DEFAULT_VISIBLE_PIPELINE.length) {
      tags.push({
        key: "visible",
        label: `Estados visibles (${visibleStatuses.length})`,
        onRemove: () => {
          setVisibleStatuses([...DEFAULT_VISIBLE_PIPELINE]);
          saveVisiblePipelineStatuses(DEFAULT_VISIBLE_PIPELINE);
          setPage(0);
        },
      });
    }
    return tags;
  }, [search, tlFilter, pipelineFilter, staleOnly, coordOnly, stopperOnly, visibleStatuses]);

  const clearFilters = () => {
    setSearch("");
    setPipelineFilter("");
    setTlFilter("");
    setVisibleStatuses(DEFAULT_VISIBLE_PIPELINE);
    saveVisiblePipelineStatuses(DEFAULT_VISIBLE_PIPELINE);
    setStaleOnly(false);
    setCoordOnly(false);
    setStopperOnly(false);
    setPage(0);
  };

  const handleVisibleStatusesChange = (codes: string[]) => {
    setVisibleStatuses(codes);
    saveVisiblePipelineStatuses(codes);
    setPage(0);
  };

  if (query.isLoading && !query.data) return <PageSkeleton />;
  if (query.isError) return <ErrorState message={query.error.message} />;
  if (!query.data) return <PageSkeleton />;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Proyectos"
        title="Portafolio con seguimiento ejecutivo"
        subtitle="Cards accionables con semáforo, coordinación, aging y equipo."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo proyecto
          </Button>
        }
      />

      <FilterToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        searchPlaceholder="Buscar por nombre..."
        chips={TL_OPTIONS.map((o) => ({
          id: o.code || "all",
          label: o.label,
          active: tlFilter === o.code,
          onClick: () => { setTlFilter(o.code); setPage(0); },
        }))}
        activeCount={advancedActive + (search ? 1 : 0) + (tlFilter ? 1 : 0)}
        onClear={clearFilters}
        advancedOpen={filtersOpen}
        onAdvancedOpenChange={setFiltersOpen}
        advanced={
          <ProjectFiltersPanel
            pipelineFilter={pipelineFilter}
            onPipelineFilterChange={(code) => { setPipelineFilter(code); setPage(0); }}
            staleOnly={staleOnly}
            coordOnly={coordOnly}
            stopperOnly={stopperOnly}
            onStaleChange={(v) => { setStaleOnly(v); setPage(0); }}
            onCoordChange={(v) => { setCoordOnly(v); setPage(0); }}
            onStopperChange={(v) => { setStopperOnly(v); setPage(0); }}
            visibleStatuses={visibleStatuses}
            onVisibleStatusesChange={handleVisibleStatusesChange}
          />
        }
      />

      {activeTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Activos</span>
          {activeTags.map((tag) => (
            <button
              key={tag.key}
              type="button"
              onClick={tag.onRemove}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white py-1 pl-2.5 pr-1.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              {tag.label}
              <X className="h-3 w-3 text-slate-400" />
            </button>
          ))}
        </div>
      )}

      {!query.data.content.length ? (
        <EmptyState title="Sin proyectos" description="No hay proyectos para los filtros seleccionados." />
      ) : (
        <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3 transition-opacity duration-200", query.isFetching && "opacity-70")}>
          {query.data.content.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() => setOpenProjectId(project.id)}
              onEdit={() => setEditingProject(project)}
              onDelete={() => { if (confirm(`¿Eliminar "${project.name}"?`)) deleteMutation.mutate(project.id); }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Página {query.data.page + 1} de {query.data.totalPages} · {query.data.totalElements} proyectos</span>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
          <Button variant="secondary" disabled={page + 1 >= query.data.totalPages} onClick={() => setPage(page + 1)}>Siguiente</Button>
        </div>
      </div>

      {openProjectId && <ProjectDetailPanel projectId={openProjectId} onClose={() => setOpenProjectId(null)} />}
      {showCreate && (
        <ProjectFormModal
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); queryClient.invalidateQueries({ queryKey: ["projects"] }); }}
        />
      )}
      {editingProject && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSaved={() => { setEditingProject(null); queryClient.invalidateQueries({ queryKey: ["projects"] }); }}
        />
      )}
    </div>
  );
}

function ProjectFormModal({
  project,
  onClose,
  onSaved,
}: {
  project?: Project;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(project?.name ?? "");
  const [pipelineStatusCode, setPipelineStatusCode] = useState(project?.pipelineStatusCode ?? "DESARROLLO");
  const { showToast } = useToast();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            if (project) {
              await projectService.update(project.id, { name, pipelineStatusCode });
              showToast("Proyecto actualizado", "success");
            } else {
              await projectService.create({ name, pipelineStatusCode });
              showToast("Proyecto creado", "success");
            }
            onSaved();
          } catch (err) {
            showToast(err instanceof Error ? err.message : "Error", "error");
          }
        }}
      >
        <h3 className="text-lg font-bold">{project ? "Editar proyecto" : "Nuevo proyecto"}</h3>
        <input className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Nombre *" value={name} onChange={(e) => setName(e.target.value)} required />
        <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={pipelineStatusCode} onChange={(e) => setPipelineStatusCode(e.target.value)}>
          {PIPELINE_STATUSES.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
        </select>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{project ? "Guardar" : "Crear"}</Button>
        </div>
      </form>
    </div>
  );
}
