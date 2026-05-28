import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/shared/components/badge";
import { TrafficLightIndicator } from "@/shared/components/data/traffic-light-indicator";
import { cn } from "@/shared/utils/cn";

export type CommitteeProjectCardProps = {
  projectId: number;
  name: string;
  trafficLightCode: string;
  executiveStatusName?: string;
  chips?: { label: string; tone?: "red" | "yellow" | "blue" | "slate" | "purple" | "green" }[];
  lines?: string[];
  variant?: "critical" | "watch";
};

export function CommitteeProjectCard({
  projectId,
  name,
  trafficLightCode,
  executiveStatusName,
  chips = [],
  lines = [],
  variant = "critical",
}: CommitteeProjectCardProps) {
  return (
    <Link
      href={`/projects?open=${projectId}`}
      className={cn(
        "group flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2",
        variant === "critical"
          ? "border-slate-200/80 hover:border-red-200 focus-visible:ring-red-200"
          : "border-slate-200/80 hover:border-amber-200 focus-visible:ring-amber-200",
      )}
    >
      <div className="flex items-center gap-3">
        <TrafficLightIndicator code={trafficLightCode} size="sm" className="shrink-0" />
        <h4 className="min-w-0 flex-1 truncate text-sm font-semibold leading-snug text-slate-900 group-hover:text-slate-700">
          {name}
        </h4>
        {executiveStatusName && (
          <Badge tone="slate" className="shrink-0 text-[10px]">
            {executiveStatusName}
          </Badge>
        )}
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
      </div>

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <Badge key={chip.label} tone={chip.tone ?? "slate"} className="text-[10px]">
              {chip.label}
            </Badge>
          ))}
        </div>
      )}

      {lines.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
          {lines.map((line) => (
            <p key={line} className="line-clamp-2 text-xs leading-relaxed text-slate-500">
              {line}
            </p>
          ))}
        </div>
      )}
    </Link>
  );
}
