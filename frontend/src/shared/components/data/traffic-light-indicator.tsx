import { TRAFFIC_LIGHT_LABELS } from "@/shared/utils/constants";
import { cn } from "@/shared/utils/cn";

const STYLES: Record<string, { dot: string; ring: string; text: string }> = {
  ROJO: { dot: "bg-red-500", ring: "ring-red-100", text: "text-red-700" },
  AMARILLO: { dot: "bg-amber-400", ring: "ring-amber-100", text: "text-amber-800" },
  VERDE: { dot: "bg-emerald-500", ring: "ring-emerald-100", text: "text-emerald-700" },
  GRIS: { dot: "bg-slate-400", ring: "ring-slate-100", text: "text-slate-600" },
};

type TrafficLightIndicatorProps = {
  code?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
};

export function TrafficLightIndicator({
  code,
  showLabel = true,
  size = "md",
  className,
}: TrafficLightIndicatorProps) {
  const key = code ?? "GRIS";
  const style = STYLES[key] ?? STYLES.GRIS;
  const dotSize = size === "sm" ? "h-2.5 w-2.5 ring-[3px]" : "h-3 w-3 ring-4";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn("shrink-0 rounded-full ring-inset", dotSize, style.dot, style.ring)}
        aria-hidden
      />
      {showLabel && (
        <span className={cn("text-xs font-semibold leading-none", style.text, size === "sm" && "text-[11px]")}>
          {TRAFFIC_LIGHT_LABELS[key] ?? "Sin datos"}
        </span>
      )}
    </span>
  );
}
