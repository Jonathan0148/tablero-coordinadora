import { BRAND_NAME } from "@/shared/branding/brand-assets";
import { cn } from "@/shared/utils/cn";

const sizeStyles = {
  sm: "text-[10px] tracking-[0.22em]",
  md: "text-xs tracking-[0.24em]",
  lg: "text-sm tracking-[0.26em]",
} as const;

type BrandWordmarkProps = {
  size?: keyof typeof sizeStyles;
  className?: string;
};

/** Theme-adaptive corporate wordmark — uses CSS tokens, not image assets. */
export function BrandWordmark({ size = "sm", className }: BrandWordmarkProps) {
  return (
    <span
      className={cn(
        "brand-wordmark truncate font-semibold uppercase leading-none",
        sizeStyles[size],
        className,
      )}
    >
      {BRAND_NAME}
    </span>
  );
}
