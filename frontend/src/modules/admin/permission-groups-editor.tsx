"use client";

import { Check, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { AdminPermissionGroup } from "@/types/domain";
import { cn } from "@/shared/utils/cn";

type PermissionGroupsEditorProps = {
  groups: AdminPermissionGroup[];
  selected: Set<string>;
  onChange: (codes: Set<string>) => void;
  readOnly?: boolean;
};

function ToggleSwitch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-app-accent" : "bg-app-border/60",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
          checked && "translate-x-4",
        )}
      />
    </button>
  );
}

export function PermissionGroupsEditor({ groups, selected, onChange, readOnly }: PermissionGroupsEditorProps) {
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (p) =>
            p.code.toLowerCase().includes(q) ||
            p.action.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            group.label.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [groups, query]);

  const togglePermission = (code: string, enabled: boolean) => {
    const next = new Set(selected);
    if (enabled) next.add(code);
    else next.delete(code);
    onChange(next);
  };

  const toggleGroup = (group: AdminPermissionGroup, enabled: boolean) => {
    const next = new Set(selected);
    for (const permission of group.permissions) {
      if (enabled) next.add(permission.code);
      else next.delete(permission.code);
    }
    onChange(next);
  };

  const totalSelected = selected.size;
  const totalAvailable = groups.reduce((acc, g) => acc + g.permissions.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-app-muted">
          {totalSelected} de {totalAvailable} permisos activos
        </p>
        {!readOnly && (
          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-app-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar permisos..."
              className="h-8 w-full rounded-app bg-app-input px-3 pl-9 text-xs text-app-fg outline-none transition focus:ring-2 focus:ring-app-border/50"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filteredGroups.map((group) => {
          const groupCodes = group.permissions.map((p) => p.code);
          const selectedInGroup = groupCodes.filter((c) => selected.has(c)).length;
          const allSelected = selectedInGroup === groupCodes.length && groupCodes.length > 0;
          const someSelected = selectedInGroup > 0 && !allSelected;

          return (
            <div
              key={group.module}
              className="overflow-hidden rounded-app border border-app-border/40 bg-app-surface-muted/50"
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-app-fg">{group.label}</p>
                  <p className="text-[11px] text-app-muted">
                    {selectedInGroup}/{groupCodes.length} permisos
                  </p>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group, !allSelected)}
                    className={cn(
                      "inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition",
                      allSelected || someSelected
                        ? "bg-app-accent/10 text-app-accent"
                        : "bg-app-hover text-app-muted hover:text-app-fg",
                    )}
                  >
                    {allSelected && <Check className="h-3 w-3" />}
                    {allSelected ? "Quitar todos" : "Seleccionar todos"}
                  </button>
                )}
              </div>

              <div className="divide-y divide-app-border/30 border-t border-app-border/30">
                {group.permissions.map((permission) => {
                  const isOn = selected.has(permission.code);
                  return (
                    <div
                      key={permission.code}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 transition hover:bg-app-hover/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-app-fg">{permission.code}</p>
                        {permission.description && (
                          <p className="truncate text-[11px] text-app-muted">{permission.description}</p>
                        )}
                      </div>
                      {readOnly ? (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                            isOn ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {isOn ? "Activo" : "—"}
                        </span>
                      ) : (
                        <ToggleSwitch
                          checked={isOn}
                          onChange={(value) => togglePermission(permission.code, value)}
                          label={`Permiso ${permission.code}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <p className="py-8 text-center text-sm text-app-muted">No se encontraron permisos.</p>
        )}
      </div>
    </div>
  );
}
