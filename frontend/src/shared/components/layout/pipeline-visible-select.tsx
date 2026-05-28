"use client";

import { Check } from "lucide-react";
import { DEFAULT_VISIBLE_PIPELINE, PIPELINE_STATUSES } from "@/shared/utils/constants";
import { cn } from "@/shared/utils/cn";

type PipelineVisibleSelectProps = {
  value: string[];
  onChange: (codes: string[]) => void;
};

export function PipelineVisibleSelect({ value, onChange }: PipelineVisibleSelectProps) {
  const toggle = (code: string) => {
    const next = value.includes(code)
      ? value.filter((c) => c !== code)
      : [...value, code];
    onChange(next.length > 0 ? next : [...DEFAULT_VISIBLE_PIPELINE]);
  };

  const isDefault =
    value.length === DEFAULT_VISIBLE_PIPELINE.length
    && DEFAULT_VISIBLE_PIPELINE.every((c) => value.includes(c));

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Estados visibles
        </p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-500">
          {value.length}/{PIPELINE_STATUSES.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PIPELINE_STATUSES.map((status) => {
          const selected = value.includes(status.code);
          return (
            <button
              key={status.code}
              type="button"
              onClick={() => toggle(status.code)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
                selected
                  ? "bg-slate-900 text-white shadow-sm"
                  : "border border-dashed border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <span
                className={cn(
                  "flex h-3.5 w-3.5 items-center justify-center rounded border transition",
                  selected ? "border-white/40 bg-white/20" : "border-slate-300 bg-white",
                )}
              >
                {selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
              </span>
              {status.label}
            </button>
          );
        })}
      </div>

      {!isDefault && (
        <button
          type="button"
          onClick={() => onChange([...DEFAULT_VISIBLE_PIPELINE])}
          className="text-[11px] font-medium text-slate-500 transition hover:text-slate-800"
        >
          Restablecer selección default
        </button>
      )}
    </div>
  );
}
