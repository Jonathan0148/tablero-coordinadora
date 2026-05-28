"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/button";
import { FilterChip } from "@/shared/components/layout/filter-chip";

type FilterChipConfig = { id: string; label: string; active?: boolean; onClick: () => void };

type FilterToolbarProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  chips?: FilterChipConfig[];
  advanced?: ReactNode;
  activeCount?: number;
  onClear?: () => void;
  sticky?: boolean;
  advancedOpen?: boolean;
  onAdvancedOpenChange?: (open: boolean) => void;
};

export function FilterToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  chips = [],
  advanced,
  activeCount = 0,
  onClear,
  sticky = true,
  advancedOpen: controlledOpen,
  onAdvancedOpenChange,
}: FilterToolbarProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const advancedOpen = isControlled ? controlledOpen : internalOpen;

  const setAdvancedOpen = (open: boolean) => {
    if (isControlled) onAdvancedOpenChange?.(open);
    else setInternalOpen(open);
  };

  useEffect(() => {
    if (!advancedOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setAdvancedOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable setter via isControlled branch
  }, [advancedOpen, isControlled, onAdvancedOpenChange]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "rounded-2xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur",
        sticky && "sticky top-[4.25rem] z-[5]",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 p-3">
        {onSearchChange !== undefined && (
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200/60"
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <FilterChip
              key={chip.id}
              label={chip.label}
              active={chip.active}
              onClick={chip.onClick}
            />
          ))}
        </div>
        {advanced && (
          <Button
            type="button"
            variant="secondary"
            className={cn("h-8 px-3 text-xs", advancedOpen && "border-slate-300 bg-slate-100")}
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
            Filtros
            {activeCount > 0 && (
              <span className="ml-1.5 rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] text-white">
                {activeCount}
              </span>
            )}
          </Button>
        )}
        {activeCount > 0 && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-8 items-center gap-1 px-2 text-xs text-slate-500 transition hover:text-slate-800"
          >
            <X className="h-3.5 w-3.5" /> Limpiar
          </button>
        )}
      </div>

      {advancedOpen && advanced && (
        <div className="border-t border-slate-100 px-3 pb-3 pt-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Filtros avanzados
            </span>
            <button
              type="button"
              aria-label="Cerrar filtros"
              onClick={() => setAdvancedOpen(false)}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {advanced}
        </div>
      )}
    </div>
  );
}
