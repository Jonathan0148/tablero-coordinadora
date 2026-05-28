"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/button";
import { cn } from "@/shared/utils/cn";
import type { DashboardCoordinationProjectItem } from "@/types/domain";

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

function CoordinationCard({
  project,
  compact = false,
}: {
  project: DashboardCoordinationProjectItem;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/projects?open=${project.projectId}`}
      className={cn(
        "group relative flex h-full flex-col rounded-xl border border-red-100/80 bg-white p-4 shadow-sm",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300",
        compact && "p-3.5",
      )}
    >
      <span className="absolute right-3 top-3 flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>

      <p className={cn("pr-4 font-semibold leading-snug text-slate-900", compact ? "text-sm" : "text-[15px]")}>
        {project.projectName}
      </p>

      {project.coordinationDesc && (
        <p className={cn("mt-2 line-clamp-2 text-slate-600", compact ? "text-xs" : "text-sm")}>
          <span className="font-medium text-red-700">Coordinación:</span>{" "}
          {project.coordinationDesc}
        </p>
      )}

      {project.responsibleAreaName && project.responsibleAction && (
        <p className="mt-auto pt-3 text-[11px] leading-relaxed text-amber-900/90">
          <span className="rounded-md bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-800">
            {project.responsibleAreaName}
          </span>{" "}
          {project.responsibleAction}
        </p>
      )}

      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition group-hover:text-red-600">
        Ver proyecto
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function CoordinationFullPanel({
  projects,
  onClose,
}: {
  projects: DashboardCoordinationProjectItem[];
  onClose: () => void;
}) {
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
      <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300">
        <div className="flex items-start justify-between gap-4 border-b border-red-100 bg-gradient-to-r from-red-50 to-white px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <LayoutList className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Listado completo</h3>
              <p className="mt-0.5 text-xs text-red-700/80">
                {projects.length} proyecto(s) pendientes de coordinación
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {projects.map((p) => (
            <CoordinationCard key={p.projectId} project={p} compact />
          ))}
        </div>
      </aside>
    </div>
  );
}

export function CoordinationPanel({ projects }: { projects: DashboardCoordinationProjectItem[] }) {
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
              <h3 className="font-semibold text-red-900">Acción de coordinación requerida</h3>
              <p className="text-xs text-red-700/80">
                {projects.length} proyecto(s) pendientes de decisión
              </p>
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
                  <CoordinationCard key={p.projectId} project={p} />
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
