"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Lock, Plus, Trash2, UserCog, Users } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { AdminAvatar } from "@/modules/admin/admin-avatar";
import { PermissionGroupsEditor } from "@/modules/admin/permission-groups-editor";
import { useConfirm } from "@/providers/confirm-provider";
import { useToast } from "@/providers/toast-provider";
import { adminService } from "@/services/admin.service";
import { Badge } from "@/shared/components/badge";
import { Button } from "@/shared/components/button";
import { PageSkeleton } from "@/shared/components/feedback/skeleton";
import { FilterToolbar } from "@/shared/components/layout/filter-toolbar";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SidePanel } from "@/shared/components/layout/side-panel";
import { ErrorState } from "@/shared/components/state";
import type { AdminRole, AdminUser } from "@/types/domain";
import { cn } from "@/shared/utils/cn";
import { fmtDateTime } from "@/shared/utils/format";

type PanelMode = "create" | "detail" | null;
type DetailTab = "profile" | "roles" | "password" | "permissions";

const emptyUserForm = {
  username: "",
  email: "",
  fullName: "",
  password: "",
  active: true,
  roleCodes: [] as string[],
};

function RoleChip({
  role,
  selected,
  onClick,
}: {
  role: AdminRole;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        selected
          ? "border-app-accent bg-app-accent/10 text-app-accent"
          : "border-app-border/50 bg-app-surface text-app-muted hover:border-app-border hover:text-app-fg",
      )}
    >
      <span className="font-mono text-[10px] opacity-70">{role.code}</span>
      {role.name}
    </button>
  );
}

export function AdminUsersView() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { confirm: confirmDialog } = useConfirm();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("profile");
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editForm, setEditForm] = useState({ email: "", fullName: "", active: true });
  const [roleSelection, setRoleSelection] = useState<Set<string>>(new Set());
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const usersQuery = useQuery({
    queryKey: ["admin-users", debouncedSearch],
    queryFn: () => adminService.users(debouncedSearch || undefined),
  });
  const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: () => adminService.roles() });
  const permissionsQuery = useQuery({ queryKey: ["admin-permissions"], queryFn: () => adminService.permissions() });

  const filteredUsers = useMemo(() => {
    return (usersQuery.data?.content ?? []).filter((user) => {
      if (statusFilter === "active") return user.active;
      if (statusFilter === "inactive") return !user.active;
      return true;
    });
  }, [usersQuery.data, statusFilter]);

  const permissionGroups = useMemo(() => {
    const effective = new Set(selectedUser?.effectivePermissions ?? []);
    return (permissionsQuery.data ?? []).map((group) => ({
      ...group,
      permissions: group.permissions.filter((p) => effective.has(p.code)),
    })).filter((g) => g.permissions.length > 0);
  }, [permissionsQuery.data, selectedUser]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const createMutation = useMutation({
    mutationFn: () =>
      adminService.createUser({
        username: userForm.username.trim(),
        email: userForm.email.trim(),
        fullName: userForm.fullName.trim(),
        password: userForm.password,
        active: userForm.active,
        roleCodes: userForm.roleCodes,
      }),
    onSuccess: () => {
      invalidate();
      setPanelMode(null);
      showToast("Usuario creado", "success");
    },
    onError: (error: Error) => showToast(error.message, "error"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      adminService.updateUser(selectedUser!.userId, {
        email: editForm.email.trim(),
        fullName: editForm.fullName.trim(),
        active: editForm.active,
      }),
    onSuccess: (updated) => {
      invalidate();
      setSelectedUser(updated);
      showToast("Usuario actualizado", "success");
    },
    onError: (error: Error) => showToast(error.message, "error"),
  });

  const rolesMutation = useMutation({
    mutationFn: () => adminService.assignUserRoles(selectedUser!.userId, [...roleSelection]),
    onSuccess: (updated) => {
      invalidate();
      setSelectedUser(updated);
      showToast("Roles actualizados", "success");
    },
    onError: (error: Error) => showToast(error.message, "error"),
  });

  const passwordMutation = useMutation({
    mutationFn: () => adminService.resetPassword(selectedUser!.userId, newPassword),
    onSuccess: () => {
      setNewPassword("");
      showToast("Contraseña restablecida", "success");
    },
    onError: (error: Error) => showToast(error.message, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => {
      invalidate();
      setPanelMode(null);
      showToast("Usuario desactivado", "info");
    },
    onError: (error: Error) => showToast(error.message, "error"),
  });

  const openCreate = () => {
    setUserForm(emptyUserForm);
    setPanelMode("create");
  };

  const openDetail = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({ email: user.email, fullName: user.fullName, active: user.active });
    setRoleSelection(new Set(user.roles.map((r) => r.code)));
    setNewPassword("");
    setDetailTab("profile");
    setPanelMode("detail");
  };

  const toggleCreateRole = (code: string) => {
    setUserForm((f) => ({
      ...f,
      roleCodes: f.roleCodes.includes(code)
        ? f.roleCodes.filter((c) => c !== code)
        : [...f.roleCodes, code],
    }));
  };

  const toggleDetailRole = (code: string) => {
    setRoleSelection((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  if (usersQuery.isLoading || rolesQuery.isLoading) return <PageSkeleton />;
  if (usersQuery.isError) return <ErrorState message={usersQuery.error.message} />;

  const allRoles = rolesQuery.data?.content ?? [];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader
        eyebrow="Administración"
        title="Usuarios"
        subtitle="Gestiona cuentas, roles múltiples, contraseñas y permisos efectivos del sistema."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo usuario
          </Button>
        }
      />

      <FilterToolbar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar por nombre, usuario o email..."
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

      <div className="overflow-hidden rounded-app bg-app-surface shadow-[var(--app-shadow)]">
        <div className="hidden md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] gap-4 border-b border-app-border/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-app-muted">
          <span>Usuario</span>
          <span>Email</span>
          <span>Roles</span>
          <span className="text-right">Acciones</span>
        </div>

        <div className="divide-y divide-app-border/30">
          {filteredUsers.map((user) => (
            <div
              key={user.userId}
              className="group flex flex-col gap-3 px-4 py-4 transition hover:bg-app-hover/40 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center md:gap-4 md:px-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <AdminAvatar name={user.fullName} size="md" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-app-fg">{user.fullName}</p>
                  <p className="truncate text-xs text-app-muted">@{user.username}</p>
                </div>
                <Badge tone={user.active ? "green" : "slate"} className="md:hidden">
                  {user.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <p className="truncate text-sm text-app-muted md:text-app-fg">{user.email}</p>

              <div className="flex flex-wrap gap-1.5">
                {user.roles.length === 0 && (
                  <span className="text-xs text-app-muted">Sin roles</span>
                )}
                {user.roles.slice(0, 2).map((role) => (
                  <Badge key={role.id} tone="purple">
                    {role.name}
                  </Badge>
                ))}
                {user.roles.length > 2 && (
                  <Badge tone="slate">+{user.roles.length - 2}</Badge>
                )}
              </div>

              <div className="flex items-center gap-2 md:justify-end">
                <Badge tone={user.active ? "green" : "slate"} className="hidden md:inline-flex">
                  {user.active ? "Activo" : "Inactivo"}
                </Badge>
                <Button variant="secondary" className="h-8 text-xs" onClick={() => openDetail(user)}>
                  <Eye className="mr-1.5 h-3.5 w-3.5" /> Gestionar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="rounded-app border border-dashed border-app-border/60 py-16 text-center">
          <Users className="mx-auto h-8 w-8 text-app-muted" />
          <p className="mt-3 text-sm font-medium text-app-fg">No hay usuarios que coincidan</p>
        </div>
      )}

      <SidePanel
        open={panelMode === "create"}
        onOpenChange={(open) => !open && setPanelMode(null)}
        title="Nuevo usuario"
        description="Crea una cuenta con roles iniciales."
        icon={<UserCog className="h-5 w-5" />}
        width="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPanelMode(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={
                createMutation.isPending ||
                !userForm.username.trim() ||
                !userForm.email.trim() ||
                !userForm.fullName.trim() ||
                userForm.password.length < 6
              }
            >
              Crear usuario
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-app-muted">Usuario</span>
              <input
                value={userForm.username}
                onChange={(e) => setUserForm((f) => ({ ...f, username: e.target.value }))}
                className="h-10 w-full rounded-app bg-app-input px-3 text-sm outline-none focus:ring-2 focus:ring-app-border/50"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-app-muted">Email</span>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                className="h-10 w-full rounded-app bg-app-input px-3 text-sm outline-none focus:ring-2 focus:ring-app-border/50"
              />
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-app-muted">Nombre completo</span>
            <input
              value={userForm.fullName}
              onChange={(e) => setUserForm((f) => ({ ...f, fullName: e.target.value }))}
              className="h-10 w-full rounded-app bg-app-input px-3 text-sm outline-none focus:ring-2 focus:ring-app-border/50"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-app-muted">Contraseña inicial</span>
            <input
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
              className="h-10 w-full rounded-app bg-app-input px-3 text-sm outline-none focus:ring-2 focus:ring-app-border/50"
            />
          </label>
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-app-muted">Roles iniciales</span>
            <div className="flex flex-wrap gap-2">
              {allRoles.filter((r) => r.active).map((role) => (
                <RoleChip
                  key={role.id}
                  role={role}
                  selected={userForm.roleCodes.includes(role.code)}
                  onClick={() => toggleCreateRole(role.code)}
                />
              ))}
            </div>
          </div>
        </div>
      </SidePanel>

      <SidePanel
        open={panelMode === "detail"}
        onOpenChange={(open) => !open && setPanelMode(null)}
        title={selectedUser?.fullName ?? "Usuario"}
        description={selectedUser ? `@${selectedUser.username}` : undefined}
        icon={<AdminAvatar name={selectedUser?.fullName ?? "U"} size="sm" />}
        width="xl"
      >
        {selectedUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-app bg-app-surface-muted p-4">
              <AdminAvatar name={selectedUser.fullName} size="xl" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-app-fg">{selectedUser.fullName}</p>
                <p className="text-sm text-app-muted">{selectedUser.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone={selectedUser.active ? "green" : "slate"}>
                    {selectedUser.active ? "Activo" : "Inactivo"}
                  </Badge>
                  {selectedUser.lastLoginAt && (
                    <span className="text-xs text-app-muted">
                      Último acceso: {fmtDateTime(selectedUser.lastLoginAt)}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-red-600"
                onClick={async () => {
                  const ok = await confirmDialog({
                    title: "Desactivar usuario",
                    description: `¿Desactivar a ${selectedUser.fullName}? No podrá iniciar sesión.`,
                    confirmLabel: "Desactivar",
                    variant: "danger",
                  });
                  if (ok) deleteMutation.mutate(selectedUser.userId);
                }}
              >
                <Trash2 className="mr-1.5 h-4 w-4" /> Desactivar
              </Button>
            </div>

            <div className="flex overflow-x-auto rounded-app bg-app-surface-muted p-1">
              {([
                ["profile", "Perfil", UserCog],
                ["roles", "Roles", Users],
                ["password", "Contraseña", Lock],
                ["permissions", "Permisos", Eye],
              ] as const).map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDetailTab(id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm",
                    detailTab === id ? "bg-app-surface text-app-fg shadow-sm" : "text-app-muted hover:text-app-fg",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {detailTab === "profile" && (
              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-app-muted">Nombre completo</span>
                  <input
                    value={editForm.fullName}
                    onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                    className="h-10 w-full rounded-app bg-app-input px-3 text-sm outline-none focus:ring-2 focus:ring-app-border/50"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-app-muted">Email</span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    className="h-10 w-full rounded-app bg-app-input px-3 text-sm outline-none focus:ring-2 focus:ring-app-border/50"
                  />
                </label>
                <label className="flex items-center justify-between rounded-app bg-app-surface-muted px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-app-fg">Cuenta activa</p>
                    <p className="text-xs text-app-muted">Controla si el usuario puede autenticarse.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={editForm.active}
                    onClick={() => setEditForm((f) => ({ ...f, active: !f.active }))}
                    className={cn(
                      "relative h-5 w-9 rounded-full transition-colors",
                      editForm.active ? "bg-app-accent" : "bg-app-border/60",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                        editForm.active && "translate-x-4",
                      )}
                    />
                  </button>
                </label>
                <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                  Guardar perfil
                </Button>
              </div>
            )}

            {detailTab === "roles" && (
              <div className="space-y-4">
                <p className="text-sm text-app-muted">
                  Asigna uno o varios roles. Los permisos efectivos son la unión de todos los roles.
                </p>
                <div className="flex flex-wrap gap-2">
                  {allRoles.filter((r) => r.active).map((role) => (
                    <RoleChip
                      key={role.id}
                      role={role}
                      selected={roleSelection.has(role.code)}
                      onClick={() => toggleDetailRole(role.code)}
                    />
                  ))}
                </div>
                <Button onClick={() => rolesMutation.mutate()} disabled={rolesMutation.isPending}>
                  Guardar roles
                </Button>
              </div>
            )}

            {detailTab === "password" && (
              <div className="space-y-4">
                <p className="text-sm text-app-muted">
                  Restablece la contraseña del usuario. La nueva contraseña no se mostrará después de guardar.
                </p>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-app-muted">Nueva contraseña</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="h-10 w-full rounded-app bg-app-input px-3 text-sm outline-none focus:ring-2 focus:ring-app-border/50"
                  />
                </label>
                <Button
                  onClick={() => passwordMutation.mutate()}
                  disabled={passwordMutation.isPending || newPassword.length < 6}
                >
                  Restablecer contraseña
                </Button>
              </div>
            )}

            {detailTab === "permissions" && (
              <div className="space-y-3">
                <p className="text-sm text-app-muted">
                  Permisos efectivos calculados desde los roles asignados ({selectedUser.effectivePermissions.length} total).
                </p>
                <PermissionGroupsEditor
                  groups={permissionGroups}
                  selected={new Set(selectedUser.effectivePermissions)}
                  onChange={() => {}}
                  readOnly
                />
              </div>
            )}
          </div>
        )}
      </SidePanel>
    </div>
  );
}
