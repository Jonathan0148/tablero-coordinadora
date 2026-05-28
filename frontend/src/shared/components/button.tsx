import { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "bg-app-accent text-app-accent-fg hover:bg-app-accent-hover",
  secondary: "bg-app-hover text-app-fg hover:opacity-90",
  ghost: "text-app-muted hover:bg-app-hover hover:text-app-fg",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center rounded-app px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
