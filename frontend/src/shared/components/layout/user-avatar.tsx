"use client";

import { cn } from "@/shared/utils/cn";
import { getAvatarGradient, getInitials } from "@/shared/utils/avatar";

type UserAvatarProps = {
  name: string;
  role?: string;
  size?: "sm" | "md";
  showMeta?: boolean;
  className?: string;
};

export function UserAvatar({
  name,
  role,
  size = "md",
  showMeta = true,
  className,
}: UserAvatarProps) {
  const initials = getInitials(name);
  const gradient = getAvatarGradient(name);
  const avatarSize = size === "sm" ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-xs";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm",
          gradient,
          avatarSize,
        )}
        aria-hidden
      >
        {initials}
      </div>
      {showMeta && (
        <div className="hidden min-w-0 text-left sm:block">
          <p className="max-w-[148px] truncate text-sm font-semibold text-app-fg">{name}</p>
          {role && (
            <p className="max-w-[148px] truncate text-[11px] font-medium uppercase tracking-wide text-app-muted">
              {role}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
