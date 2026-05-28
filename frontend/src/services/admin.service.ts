import { apiClient, unwrap } from "@/services/api-client";
import type { PageResponse } from "@/shared/types/api";
import type { AdminPermissionGroup, AdminRole, AdminUser } from "@/types/domain";

export type CreateRolePayload = {
  code: string;
  name: string;
  description?: string;
  active: boolean;
};

export type UpdateRolePayload = {
  name: string;
  description?: string;
  active: boolean;
};

export type CreateUserPayload = {
  username: string;
  email: string;
  fullName: string;
  password: string;
  active: boolean;
  roleCodes: string[];
};

export type UpdateUserPayload = {
  email: string;
  fullName: string;
  active: boolean;
};

export const adminService = {
  permissions() {
    return unwrap<AdminPermissionGroup[]>(apiClient.get("/v1/admin/permissions"));
  },
  roles(page = 0, size = 50) {
    return unwrap<PageResponse<AdminRole>>(
      apiClient.get("/v1/admin/roles", { params: { page, size, sort: "name,asc" } }),
    );
  },
  role(id: number) {
    return unwrap<AdminRole>(apiClient.get(`/v1/admin/roles/${id}`));
  },
  createRole(payload: CreateRolePayload) {
    return unwrap<AdminRole>(apiClient.post("/v1/admin/roles", payload));
  },
  updateRole(id: number, payload: UpdateRolePayload) {
    return unwrap<AdminRole>(apiClient.put(`/v1/admin/roles/${id}`, payload));
  },
  deleteRole(id: number) {
    return apiClient.delete(`/v1/admin/roles/${id}`);
  },
  assignRolePermissions(id: number, permissionCodes: string[]) {
    return unwrap<AdminRole>(apiClient.put(`/v1/admin/roles/${id}/permissions`, { permissionCodes }));
  },
  users(search?: string, page = 0, size = 50) {
    return unwrap<PageResponse<AdminUser>>(
      apiClient.get("/v1/admin/users", {
        params: { search: search || undefined, page, size, sort: "fullName,asc" },
      }),
    );
  },
  user(id: number) {
    return unwrap<AdminUser>(apiClient.get(`/v1/admin/users/${id}`));
  },
  createUser(payload: CreateUserPayload) {
    return unwrap<AdminUser>(apiClient.post("/v1/admin/users", payload));
  },
  updateUser(id: number, payload: UpdateUserPayload) {
    return unwrap<AdminUser>(apiClient.put(`/v1/admin/users/${id}`, payload));
  },
  deleteUser(id: number) {
    return apiClient.delete(`/v1/admin/users/${id}`);
  },
  assignUserRoles(id: number, roleCodes: string[]) {
    return unwrap<AdminUser>(apiClient.put(`/v1/admin/users/${id}/roles`, { roleCodes }));
  },
  resetPassword(id: number, newPassword: string) {
    return apiClient.put(`/v1/admin/users/${id}/password`, { newPassword });
  },
};
