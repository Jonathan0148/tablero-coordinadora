"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Plus, Shield, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminAvatar } from "@/modules/admin/admin-avatar";
import { PermissionGroupsEditor } from "@/modules/admin/permission-groups-editor";
import { useConfirm } from "@/providers/confirm-provider";
import { useToast } from "@/providers/toast-provider";
import { adminService } from "@/services/admin.service";
import { Badge } from "@/shared/components/badge";
import { Button } from "@/shared/components/button";
import { Card, CardContent } from "@/shared/components/card";
import { PageSkeleton } from "@/shared/components/feedback/skeleton";
import { FilterToolbar } from "@/shared/components/layout/filter-toolbar";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SidePanel } from "@/shared/components/layout/side-panel";
import { ErrorState } from "@/shared/components/state";
import type { AdminRole } from "@/types/domain";
import { cn } from "@/shared/utils/cn";

type PanelMode = "create" | "edit" | "permissions" | null;

const emptyRoleForm = {
  code: "",
  name: "",
  description: "",
  active: true,
};

export function AdminRolesView() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { confirm: confirmDialog } = useConfirm();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [roleForm, setRoleForm] = useState(emptyRoleForm);
  const [permissionSelection, setPermissionSelection] = useState<Set<string>>(new Set());

  const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: () => adminService.roles() });
  const permissionsQuery = useQuery({ queryKey: ["admin-permissions"], queryFn: () => adminService.permissions() });

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (rolesQuery.data?.content ?? []).filter((role) => {
      const matchesSearch =
        !q ||
        role.code.toLowerCase().includes(q) ||
        role.name.toLowerCase().includes(q) ||
        role.description?.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && role.active) ||
        (statusFilter === "inactive" && !role.active);
      return matchesSearch && matchesStatus;
    });
  }, [rolesQuery.data, search, statusFilter]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      adminService.createRole({
        code: roleForm.code.trim(),
        name: roleForm.name.trim(),
        description: roleForm.description.trim() || undefined,
        active: roleForm.active,
      }),
    onSuccess: () => {
      invalidate();
      setPanelMode(null);
      showToast("Rol creado correctamente", "success");
    },
    onError: (error: Error) => showToast(error.message, "error"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      adminService.updateRole(selectedRole!.id, {
        name: roleForm.name.trim(),
        description: roleForm.description.trim() || undefined,
        active: roleForm.active,
      }),
    onSuccess: () => {
      invalidate();
      setPanelMode(null);
      showToast("Rol actualizado", "success");
    },
    onError: (error: Error) => showToast(error.message, "error"),
  });

  const permissionsMutation = useMutation({
    mutationFn: () => adminService.assignRolePermissions(selectedRole!.id, [...permissionSelection]),
    onSuccess: () => {
      invalidate();
      setPanelMode(null);
      showToast("Permisos actualizados", "success");
    },
    onError: (error: Error) => showToast(error.message, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteRole(id),
    onSuccess: () => {
      invalidate();
      showToast("Rol desactivado", "info");
    },
    onError: (error: Error) => showToast(error.message, "error"),
  });

  const openCreate = () => {
    setSelectedRole(null);
    setRoleForm(emptyRoleForm);
    setPanelMode("create");
  };

  const openEdit = (role: AdminRole) => {
    setSelectedRole(role);
    setRoleForm({
      code: role.code,
      name: role.name,
      description: role.description ?? "",
      active: role.active,
    });
    setPanelMode("edit");
  };

  const openPermissions = (role: AdminRole) => {
    setSelectedRole(role);
    setPermissionSelection(new Set(role.permissionCodes));
    setPanelMode("permissions");
  };

  if (rolesQuery.isLoading || permissionsQuery.isLoading) return <PageSkeleton />;
  if (rolesQuery.isError) return <ErrorState message={rolesQuery.error.message} />;

  const permissionGroups = permissionsQuery.data ?? [];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        eyebrow="Administración"
        title="Roles y permisos"
        subtitle="Define roles, asigna permisos agrupados y controla el acceso RBAC de la plataforma."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo rol
          </Button>
        }
      />

      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por código o nombre..."
        chips={[
          { id: "all", label: "Todos", active: statusFilter === "all", onClick: () => setStatusFilter("all") },
          { id: "active", label: "Activos", active: statusFilter === "active", onClick: () => setStatusFilter("active") },
          {
            id: "inactive",
            label: "Inactivos",
            active: statusFilter === "inactive",
            onClick: () => setStatusFilter("inactive"),
          },
        ]}
        activeCount={statusFilter !== "all" ? 1 : 0}
        onClear={() => setStatusFilter("all")}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredRoles.map((role) => (
          <Card
            key={role.id}
            className="group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--app-shadow-lg)]"
          >
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <AdminAvatar name={role.name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-app-fg">{role.name}</p>
                    <p className="truncate text-xs font-mono text-app-muted">{role.code}</p>
                  </div>
                </div>
                <Badge tone={role.active ? "green" : "slate"}>{role.active ? "Activo" : "Inactivo"}</Badge>
              </div>

              {role.description && <p className="line-clamp-2 text-sm text-app-muted">{role.description}</p>}

              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-app-accent/10 px-2.5 py-1 text-[11px] font-semibold text-app-accent">
                  {role.permissionCodes.length} permisos
                </span>
                {role.permissionCodes.slice(0, 3).map((code) => (
                  <span
                    key={code}
                    className="rounded-full bg-app-hover px-2 py-0.5 text-[10px] font-medium text-app-muted"
                  >
                    {code.split(":")[0]}
                  </span>
                ))}
                {role.permissionCodes.length > 3 && (
                  <span className="text-[10px] text-app-muted">+{role.permissionCodes.length - 3}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="secondary" className="h-8 flex-1 text-xs" onClick={() => openPermissions(role)}>
                  <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Permisos
                </Button>
                <Button variant="ghost" className="h-8 flex-1 text-xs" onClick={() => openEdit(role)}>
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  className="h-8 px-2.5 text-red-600"
                  onClick={async () => {
                    const ok = await confirmDialog({
                      title: "Desactivar rol",
                      description: `¿Desactivar el rol ${role.name}? Los usuarios conservarán el código hasta reasignación.`,
                      confirmLabel: "Desactivar",
                      variant: "danger",
                    });
                    if (ok) deleteMutation.mutate(role.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="rounded-app border border-dashed border-app-border/60 py-16 text-center">
          <Shield className="mx-auto h-8 w-8 text-app-muted" />
          <p className="mt-3 text-sm font-medium text-app-fg">No hay roles que coincidan</p>
          <p className="mt-1 text-xs text-app-muted">Ajusta los filtros o crea un nuevo rol.</p>
        </div>
      )}

      <SidePanel
        open={panelMode === "create" || panelMode === "edit"}
        onOpenChange={(open) => !open && setPanelMode(null)}
        title={panelMode === "create" ? "Nuevo rol" : "Editar rol"}
        description={panelMode === "create" ? "Crea un rol con código único." : selectedRole?.code}
        icon={<Shield className="h-5 w-5" />}
        width="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPanelMode(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => (panelMode === "create" ? createMutation.mutate() : updateMutation.mutate())}
              disabled={createMutation.isPending || updateMutation.isPending || !roleForm.name.trim()}
            >
              {panelMode === "create" ? "Crear rol" : "Guardar cambios"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {panelMode === "create" && (
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-app-muted">Código</span>
              <input
                value={roleForm.code}
                onChange={(e) => setRoleForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="ADMIN, PM, VIEWER..."
                className="h-10 w-full rounded-app bg-app-input px-3 text-sm font-mono uppercase outline-none focus:ring-2 focus:ring-app-border/50"
              />
            </label>
          )}
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-app-muted">Nombre</span>
            <input
              value={roleForm.name}
              onChange={(e) => setRoleForm((f) => ({ ...f, name: e.target.value }))}
              className="h-10 w-full rounded-app bg-app-input px-3 text-sm outline-none focus:ring-2 focus:ring-app-border/50"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-app-muted">Descripción</span>
            <textarea
              value={roleForm.description}
              onChange={(e) => setRoleForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-app bg-app-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-app-border/50"
            />
          </label>
          <label className="flex items-center justify-between rounded-app bg-app-surface-muted px-4 py-3">
            <div>
              <p className="text-sm font-medium text-app-fg">Rol activo</p>
              <p className="text-xs text-app-muted">Los roles inactivos no se asignan a nuevos usuarios.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={roleForm.active}
              onClick={() => setRoleForm((f) => ({ ...f, active: !f.active }))}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                roleForm.active ? "bg-app-accent" : "bg-app-border/60",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                  roleForm.active && "translate-x-4",
                )}
              />
            </button>
          </label>
        </div>
      </SidePanel>

      <SidePanel
        open={panelMode === "permissions"}
        onOpenChange={(open) => !open && setPanelMode(null)}
        title="Permisos del rol"
        description={selectedRole?.name}
        icon={<KeyRound className="h-5 w-5" />}
        width="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPanelMode(null)}>
              Cancelar
            </Button>
            <Button onClick={() => permissionsMutation.mutate()} disabled={permissionsMutation.isPending}>
              Guardar permisos
            </Button>
          </>
        }
      >
        <PermissionGroupsEditor
          groups={permissionGroups}
          selected={permissionSelection}
          onChange={setPermissionSelection}
        />
      </SidePanel>
    </div>
  );
}
