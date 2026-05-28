"use client";

import { ReactNode } from "react";
import { usePermission } from "@/hooks/use-permission";

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return usePermission(permission) ? children : fallback;
}
