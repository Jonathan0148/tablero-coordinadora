"use client";

import Image from "next/image";
import { cn } from "@/shared/utils/cn";
import { getAvatarGradient, getInitials } from "@/shared/utils/avatar";

type AdminAvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-16 w-16 text-lg",
};

export function AdminAvatar({ name, imageUrl, size = "md", className }: AdminAvatarProps) {
  const initials = getInitials(name);
  const gradient = getAvatarGradient(name);

  if (imageUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full shadow-sm ring-2 ring-app-border/30",
          sizes[size],
          className,
        )}
      >
        <Image src={imageUrl} alt={name} fill className="object-cover" sizes="64px" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm ring-2 ring-white/10",
        gradient,
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
