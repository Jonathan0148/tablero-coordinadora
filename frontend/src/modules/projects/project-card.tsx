import { MoreHorizontal, Users } from "lucide-react";
import { Badge } from "@/shared/components/badge";
import { TrafficLightBadge } from "@/shared/components/traffic-light-badge";
import { fmtDate } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";
import type { Project } from "@/types/domain";

type ProjectCardProps = {
  project: Project;
  onOpen: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ProjectCard({ project, onOpen, onEdit, onDelete }: ProjectCardProps) {
  const stale = (project.staleDays ?? 0) > 7;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition",
        "hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        project.requiresCoordination && "border-red-200/80 ring-1 ring-red-100",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-snug text-slate-900 group-hover:text-slate-700">
            {project.name}
          </h3>
          <p className="mt-1 text-xs text-slate-500">{project.pipelineStatusName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <button type="button" onClick={onEdit} className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <TrafficLightBadge code={project.currentTrafficLight} />
        {project.requiresCoordination && <Badge tone="red">Coord.</Badge>}
        {project.hasStopper && (
          <Badge tone="red">Stopper{project.stopperImpactCode ? ` · ${project.stopperImpactCode}` : ""}</Badge>
        )}
        {stale && <Badge tone="yellow">{project.staleDays}d</Badge>}
      </div>

      <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-slate-600">
        {project.summaryPreview || "Sin actualizaciones registradas"}
      </p>

      <div className="mt-4 flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="min-w-0 text-xs text-slate-500">
          {project.leadName ? (
            <span className="font-medium text-slate-700">{project.leadName}</span>
          ) : (
            <span className="italic">Sin líder</span>
          )}
          <div className="mt-1 flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" /> {project.assignmentCount ?? 0}
            </span>
            <span>📋 {project.openTaskCount ?? 0}</span>
            {project.legacyUpdatedAt && (
              <span className="truncate">{fmtDate(project.legacyUpdatedAt)}</span>
            )}
          </div>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-[11px] font-medium text-slate-400 opacity-0 transition hover:text-red-600 group-hover:opacity-100"
          >
            Eliminar
          </button>
        )}
      </div>
    </article>
  );
}
