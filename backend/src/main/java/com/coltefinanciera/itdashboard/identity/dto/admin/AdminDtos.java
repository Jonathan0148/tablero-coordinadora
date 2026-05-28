package com.coltefinanciera.itdashboard.identity.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.Set;

public final class AdminDtos {

    private AdminDtos() {
    }

    public record PermissionResponse(
            Long id,
            String code,
            String module,
            String action,
            String description,
            boolean active
    ) {
    }

    public record PermissionGroupResponse(
            String module,
            String label,
            java.util.List<PermissionResponse> permissions
    ) {
    }

    public record RoleSummaryResponse(
            Long id,
            String code,
            String name,
            boolean active
    ) {
    }

    public record RoleResponse(
            Long id,
            String code,
            String name,
            String description,
            boolean active,
            Set<String> permissionCodes
    ) {
    }

    public record CreateRoleRequest(
            @NotBlank @Size(max = 60) String code,
            @NotBlank @Size(max = 150) String name,
            @Size(max = 500) String description,
            boolean active
    ) {
    }

    public record UpdateRoleRequest(
            @NotBlank @Size(max = 150) String name,
            @Size(max = 500) String description,
            boolean active
    ) {
    }

    public record AssignPermissionsRequest(
            Set<@NotBlank String> permissionCodes
    ) {
    }

    public record AdminUserResponse(
            Long userId,
            String username,
            String email,
            String fullName,
            boolean active,
            java.util.List<RoleSummaryResponse> roles,
            Set<String> effectivePermissions,
            java.time.OffsetDateTime lastLoginAt
    ) {
    }

    public record CreateUserRequest(
            @NotBlank @Size(max = 80) String username,
            @NotBlank @Size(max = 150) String email,
            @NotBlank @Size(max = 200) String fullName,
            @NotBlank @Size(min = 6, max = 100) String password,
            boolean active,
            Set<@NotBlank String> roleCodes
    ) {
    }

    public record UpdateUserRequest(
            @NotBlank @Size(max = 150) String email,
            @NotBlank @Size(max = 200) String fullName,
            boolean active
    ) {
    }

    public record AssignRolesRequest(
            Set<@NotBlank String> roleCodes
    ) {
    }

    public record ResetPasswordRequest(
            @NotBlank @Size(min = 6, max = 100) String newPassword
    ) {
    }
}
