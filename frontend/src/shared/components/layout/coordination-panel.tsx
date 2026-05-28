"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/button";
import { cn } from "@/shared/utils/cn";

export type CoordinationProjectItem = {
  projectId: number;
  projectName: string;
  coordinationDesc?: string;
  responsibleAreaName?: string;
  responsibleAction?: string;
};

const AUTO_SCROLL_MS = 6000;

function useVisibleCount() {
  const [count, setCount] = useState(4);

  useEffect(() => {
    const queries = [
      { mq: window.matchMedia("(max-width: 639px)"), value: 1 },
      { mq: window.matchMedia("(min-width: 640px) and (max-width: 1023px)"), value: 2 },
      { mq: window.matchMedia("(min-width: 1024px) and (max-width: 1279px)"), value: 3 },
      { mq: window.matchMedia("(min-width: 1280px)"), value: 4 },
    ];

    const sync = () => {
      const match = queries.find(({ mq }) => mq.matches);
      setCount(match?.value ?? 4);
    };

    sync();
    queries.forEach(({ mq }) => mq.addEventListener("change", sync));
    return () => queries.forEach(({ mq }) => mq.removeEventListener("change", sync));
  }, []);

  return count;
}

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

/** Carousel card — preview destacado en dashboard/comité */
function CoordinationCarouselCard({ project }: { project: CoordinationProjectItem }) {
  return (
    <Link
      href={`/projects?open=${project.projectId}`}
      className={cn(
        "group relative flex h-full flex-col rounded-xl border border-red-100/80 bg-white p-3.5 shadow-sm",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300",
      )}
    >
      <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />

      <p className="pr-3 text-[15px] font-semibold leading-snug text-slate-900 line-clamp-2">
        {project.projectName}
      </p>

      {project.coordinationDesc && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
          <span className="font-medium text-red-700">Coord.</span> {project.coordinationDesc}
        </p>
      )}

      {(project.responsibleAreaName || project.responsibleAction) && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {project.responsibleAreaName && (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
              {project.responsibleAreaName}
            </span>
          )}
          {project.responsibleAction && (
            <span className="line-clamp-1 text-[10px] text-slate-500">{project.responsibleAction}</span>
          )}
        </div>
      )}

      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition group-hover:text-red-600">
        Abrir
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/** Fila compacta — panel lateral “Ver todos” */
function CoordinationListRow({ project }: { project: CoordinationProjectItem }) {
  return (
    <Link
      href={`/projects?open=${project.projectId}`}
      className={cn(
        "group grid grid-cols-[auto_1fr_auto] items-start gap-2.5 rounded-lg border border-slate-100",
        "bg-white px-2.5 py-2 transition-all duration-200",
        "hover:border-red-200/80 hover:bg-red-50/50 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200",
      )}
    >
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500 ring-2 ring-red-100" aria-hidden />

      <div className="min-w-0 space-y-0.5">
        <p className="truncate text-sm font-semibold leading-tight text-slate-900 group-hover:text-red-900">
          {project.projectName}
        </p>
        {project.coordinationDesc && (
          <p className="line-clamp-1 text-xs leading-snug text-slate-600">
            {project.coordinationDesc}
          </p>
        )}
        {(project.responsibleAreaName || project.responsibleAction) && (
          <div className="flex min-w-0 items-center gap-1.5 pt-0.5">
            {project.responsibleAreaName && (
              <span className="shrink-0 rounded px-1.5 py-px text-[10px] font-semibold leading-tight text-amber-800 bg-amber-50">
                {project.responsibleAreaName}
              </span>
            )}
            {project.responsibleAction && (
              <span className="truncate text-[10px] leading-tight text-slate-500">
                {project.responsibleAction}
              </span>
            )}
          </div>
        )}
      </div>

      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-red-500" />
    </Link>
  );
}

function filterProjects(projects: CoordinationProjectItem[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return projects;
  return projects.filter(
    (p) =>
      p.projectName.toLowerCase().includes(q)
      || p.coordinationDesc?.toLowerCase().includes(q)
      || p.responsibleAreaName?.toLowerCase().includes(q)
      || p.responsibleAction?.toLowerCase().includes(q),
  );
}

function CoordinationFullPanel({
  projects,
  onClose,
}: {
  projects: CoordinationProjectItem[];
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => filterProjects(projects, search), [projects, search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Cerrar panel"
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-slate-50/80 shadow-2xl">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 shrink-0 border-b border-red-100 bg-white/95 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3 px-4 py-3.5">
            <div className="flex min-w-0 items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
                <LayoutList className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-red-900">Coordinación pendiente</h3>
                <p className="text-[11px] text-red-700/75">
                  {filtered.length} de {projects.length} proyecto(s)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {projects.length > 3 && (
            <div className="border-t border-slate-100 px-4 pb-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Buscar proyecto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-red-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dense scroll list */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-2">
          {filtered.length > 0 ? (
            <div className="space-y-1">
              {filtered.map((p) => (
                <CoordinationListRow key={p.projectId} project={p} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-slate-500">
              {search ? "Sin resultados para la búsqueda" : "Sin proyectos pendientes"}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

type CoordinationPanelProps = {
  projects: CoordinationProjectItem[];
  title?: string;
  subtitle?: string;
};

export function CoordinationPanel({
  projects,
  title = "Acción de coordinación requerida",
  subtitle,
}: CoordinationPanelProps) {
  const visibleCount = useVisibleCount();
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const pages = useMemo(() => chunk(projects, visibleCount), [projects, visibleCount]);
  const pageCount = pages.length;
  const activePage = pageCount > 0 ? ((page % pageCount) + pageCount) % pageCount : 0;

  const goTo = useCallback(
    (next: number) => {
      if (pageCount <= 1) return;
      setPage(((next % pageCount) + pageCount) % pageCount);
    },
    [pageCount],
  );

  useEffect(() => {
    if (pageCount <= 1 || paused || expanded) return;
    const id = window.setInterval(() => goTo(activePage + 1), AUTO_SCROLL_MS);
    return () => window.clearInterval(id);
  }, [activePage, pageCount, paused, expanded, goTo]);

  if (!projects.length) return null;

  const resolvedSubtitle = subtitle ?? `${projects.length} proyecto(s) pendientes de decisión`;

  return (
    <>
      <section
        ref={panelRef}
        className="overflow-hidden rounded-2xl border border-red-200/80 bg-white shadow-md"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!panelRef.current?.contains(e.relatedTarget as Node)) setPaused(false);
        }}
      >
        <div className="flex flex-col gap-4 border-b border-red-100 bg-gradient-to-r from-red-50 via-white to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 shadow-sm">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">{title}</h3>
              <p className="text-xs text-red-700/80">{resolvedSubtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pageCount > 1 && (
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
                <button
                  type="button"
                  aria-label="Anterior"
                  onClick={() => goTo(page - 1)}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Siguiente"
                  onClick={() => goTo(page + 1)}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            <Button
              variant="secondary"
              className="h-9 px-3 text-xs"
              onClick={() => setExpanded(true)}
            >
              <LayoutList className="mr-1.5 h-3.5 w-3.5" />
              Ver todos
            </Button>
          </div>
        </div>

        <div className="overflow-hidden px-4 py-4 sm:px-5">
          <div
            className="flex transition-transform duration-500 ease-in-out will-change-transform"
            style={{ transform: `translateX(-${activePage * 100}%)` }}
          >
            {pages.map((pageItems, i) => (
              <div
                key={i}
                className="grid w-full shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
                style={{ minWidth: "100%" }}
              >
                {pageItems.map((p) => (
                  <CoordinationCarouselCard key={p.projectId} project={p} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-2 pb-4">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir a página ${i + 1}`}
                aria-current={i === activePage ? "true" : undefined}
                onClick={() => setPage(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activePage ? "w-6 bg-red-500" : "w-1.5 bg-slate-300 hover:bg-slate-400",
                )}
              />
            ))}
          </div>
        )}
      </section>

      {expanded && (
        <CoordinationFullPanel projects={projects} onClose={() => setExpanded(false)} />
      )}
    </>
  );
}
