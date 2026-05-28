import Image from "next/image";
import { BRAND_MARK_SRC } from "@/shared/branding/brand-assets";
import { cn } from "@/shared/utils/cn";

/** Display size (Tailwind) and 2× intrinsic pixels for retina sharpness. */
const sizes = {
  sm: { className: "h-8 w-8", px: 64 },
  md: { className: "h-9 w-9", px: 72 },
  lg: { className: "h-11 w-11", px: 88 },
} as const;

type BrandMarkProps = {
  size?: keyof typeof sizes;
  className?: string;
  priority?: boolean;
};

export function BrandMark({ size = "sm", className, priority }: BrandMarkProps) {
  const { className: sizeClass, px } = sizes[size];

  return (
    <Image
      src={BRAND_MARK_SRC}
      alt=""
      width={px}
      height={px}
      className={cn("shrink-0 object-contain", sizeClass, className)}
      priority={priority}
    />
  );
}
