import { cn } from "@/shared/utils/cn";

type FilterChipProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
  tone?: "default" | "signal" | "pipeline";
  icon?: React.ReactNode;
  className?: string;
};

export function FilterChip({
  label,
  active = false,
  onClick,
  tone = "default",
  icon,
  className,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
        tone === "default" && (active
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"),
        tone === "signal" && (active
          ? "bg-amber-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-800"),
        tone === "pipeline" && (active
          ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900"
          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"),
        className,
      )}
    >
      {icon}
      {label}
    </button>
  );
}
