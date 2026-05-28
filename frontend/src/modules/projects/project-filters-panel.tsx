"use client";

import { FilterChip } from "@/shared/components/layout/filter-chip";
import { PipelineVisibleSelect } from "@/shared/components/layout/pipeline-visible-select";
import { PIPELINE_STATUSES } from "@/shared/utils/constants";

type ProjectFiltersPanelProps = {
  pipelineFilter: string;
  onPipelineFilterChange: (code: string) => void;
  staleOnly: boolean;
  coordOnly: boolean;
  stopperOnly: boolean;
  onStaleChange: (v: boolean) => void;
  onCoordChange: (v: boolean) => void;
  onStopperChange: (v: boolean) => void;
  visibleStatuses: string[];
  onVisibleStatusesChange: (codes: string[]) => void;
};

export function ProjectFiltersPanel({
  pipelineFilter,
  onPipelineFilterChange,
  staleOnly,
  coordOnly,
  stopperOnly,
  onStaleChange,
  onCoordChange,
  onStopperChange,
  visibleStatuses,
  onVisibleStatusesChange,
}: ProjectFiltersPanelProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <section className="space-y-2.5 rounded-xl bg-slate-50/80 p-3.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pipeline</p>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label="Todos"
            active={!pipelineFilter}
            tone="pipeline"
            onClick={() => onPipelineFilterChange("")}
          />
          {PIPELINE_STATUSES.map((s) => (
            <FilterChip
              key={s.code}
              label={s.label}
              active={pipelineFilter === s.code}
              tone="pipeline"
              onClick={() => onPipelineFilterChange(s.code)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-2.5 rounded-xl bg-slate-50/80 p-3.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Señales</p>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="Sin actualizar" active={staleOnly} tone="signal" onClick={() => onStaleChange(!staleOnly)} />
          <FilterChip label="Coordinación" active={coordOnly} tone="signal" onClick={() => onCoordChange(!coordOnly)} />
          <FilterChip label="Con stopper" active={stopperOnly} tone="signal" onClick={() => onStopperChange(!stopperOnly)} />
        </div>
      </section>

      <section className="rounded-xl bg-slate-50/80 p-3.5 sm:col-span-2 xl:col-span-1">
        <PipelineVisibleSelect value={visibleStatuses} onChange={onVisibleStatusesChange} />
      </section>
    </div>
  );
}
