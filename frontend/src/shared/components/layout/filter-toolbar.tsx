"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { ReactNode, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/button";

type FilterChip = { id: string; label: string; active?: boolean; onClick: () => void };

type FilterToolbarProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  chips?: FilterChip[];
  advanced?: ReactNode;
  activeCount?: number;
  onClear?: () => void;
  sticky?: boolean;
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
}: FilterToolbarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur",
        sticky && "sticky top-[4.25rem] z-[5]",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
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
            <button
              key={chip.id}
              type="button"
              onClick={chip.onClick}
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-semibold transition",
                chip.active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
        {advanced && (
          <Button
            type="button"
            variant="secondary"
            className="h-8 px-3 text-xs"
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
            Filtros
            {activeCount > 0 && (
              <span className="ml-1.5 rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] text-white">{activeCount}</span>
            )}
          </Button>
        )}
        {activeCount > 0 && onClear && (
          <button type="button" onClick={onClear} className="inline-flex h-8 items-center gap-1 px-2 text-xs text-slate-500 hover:text-slate-800">
            <X className="h-3.5 w-3.5" /> Limpiar
          </button>
        )}
      </div>
      {advancedOpen && advanced && (
        <div className="mt-3 border-t border-slate-100 pt-3">{advanced}</div>
      )}
    </div>
  );
}
