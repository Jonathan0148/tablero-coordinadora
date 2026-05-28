import { HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "slate" | "green" | "yellow" | "red" | "blue" | "purple";
};

const tones = {
  slate: "bg-slate-100 text-slate-700",
  green: "bg-emerald-100 text-emerald-700",
  yellow: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-violet-100 text-violet-700",
};

export function Badge({ tone = "slate", className, ...props }: BadgeProps) {
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)} {...props} />;
}
