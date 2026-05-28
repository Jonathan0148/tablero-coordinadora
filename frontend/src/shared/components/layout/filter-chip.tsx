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
        "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[calc(var(--app-radius)-0.25rem)] px-2.5 text-xs font-semibold transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-border",
        tone === "default" && (active
          ? "bg-app-accent text-app-accent-fg"
          : "bg-app-hover text-app-muted hover:text-app-fg"),
        tone === "signal" && (active
          ? "bg-amber-600 text-white"
          : "bg-app-hover text-app-muted hover:bg-amber-500/10 hover:text-amber-700"),
        tone === "pipeline" && (active
          ? "bg-app-accent text-app-accent-fg"
          : "bg-app-surface-muted text-app-muted hover:bg-app-hover hover:text-app-fg"),
        className,
      )}
    >
      {icon}
      {label}
    </button>
  );
}
