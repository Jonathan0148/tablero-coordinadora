package com.coltefinanciera.itdashboard.identity.controller;

import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.AssignPermissionsRequest;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.AssignRolesRequest;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.CreateRoleRequest;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.CreateUserRequest;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.PermissionGroupResponse;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.ResetPasswordRequest;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.RoleResponse;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.AdminUserResponse;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.UpdateRoleRequest;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.UpdateUserRequest;
import com.coltefinanciera.itdashboard.identity.service.AdminPermissionService;
import com.coltefinanciera.itdashboard.identity.service.AdminRoleService;
import com.coltefinanciera.itdashboard.identity.service.AdminUserService;
import com.coltefinanciera.itdashboard.shared.pagination.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminUserService userService;
    private final AdminRoleService roleService;
    private final AdminPermissionService permissionService;

    public AdminController(
            AdminUserService userService,
            AdminRoleService roleService,
            AdminPermissionService permissionService
    ) {
        this.userService = userService;
        this.roleService = roleService;
        this.permissionService = permissionService;
    }

    @GetMapping("/permissions")
    public List<PermissionGroupResponse> permissions() {
        return permissionService.listGrouped();
    }

    @GetMapping("/roles")
    public PageResponse<RoleResponse> roles(@PageableDefault(size = 50) Pageable pageable) {
        return PageResponse.from(roleService.findAll(pageable));
    }

    @GetMapping("/roles/{roleId}")
    public RoleResponse role(@PathVariable Long roleId) {
        return roleService.findById(roleId);
    }

    @PostMapping("/roles")
    public RoleResponse createRole(@Valid @RequestBody CreateRoleRequest request) {
        return roleService.create(request);
    }

    @PutMapping("/roles/{roleId}")
    public RoleResponse updateRole(@PathVariable Long roleId, @Valid @RequestBody UpdateRoleRequest request) {
        return roleService.update(roleId, request);
    }

    @DeleteMapping("/roles/{roleId}")
    public void deleteRole(@PathVariable Long roleId) {
        roleService.delete(roleId);
    }

    @PutMapping("/roles/{roleId}/permissions")
    public RoleResponse assignRolePermissions(
            @PathVariable Long roleId,
            @Valid @RequestBody AssignPermissionsRequest request
    ) {
        return roleService.assignPermissions(roleId, request);
    }

    @GetMapping("/users")
    public PageResponse<AdminUserResponse> users(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 50) Pageable pageable
    ) {
        return PageResponse.from(userService.findAll(search, pageable));
    }

    @GetMapping("/users/{userId}")
    public AdminUserResponse user(@PathVariable Long userId) {
        return userService.findById(userId);
    }

    @PostMapping("/users")
    public AdminUserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }

    @PutMapping("/users/{userId}")
    public AdminUserResponse updateUser(@PathVariable Long userId, @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(userId, request);
    }

    @DeleteMapping("/users/{userId}")
    public void deleteUser(@PathVariable Long userId) {
        userService.delete(userId);
    }

    @PutMapping("/users/{userId}/roles")
    public AdminUserResponse assignUserRoles(
            @PathVariable Long userId,
            @Valid @RequestBody AssignRolesRequest request
    ) {
        return userService.assignRoles(userId, request);
    }

    @PutMapping("/users/{userId}/password")
    public void resetPassword(@PathVariable Long userId, @Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(userId, request);
    }
}
