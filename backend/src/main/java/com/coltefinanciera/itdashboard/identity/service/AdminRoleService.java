package com.coltefinanciera.itdashboard.identity.service;

import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.AssignPermissionsRequest;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.CreateRoleRequest;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.RoleResponse;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.UpdateRoleRequest;
import com.coltefinanciera.itdashboard.identity.entity.Permission;
import com.coltefinanciera.itdashboard.identity.entity.Role;
import com.coltefinanciera.itdashboard.identity.repository.PermissionRepository;
import com.coltefinanciera.itdashboard.identity.repository.RoleRepository;
import com.coltefinanciera.itdashboard.shared.api.ApiResponseCode;
import com.coltefinanciera.itdashboard.shared.exception.BusinessException;
import com.coltefinanciera.itdashboard.shared.exception.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminRoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public AdminRoleService(RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_security:admin')")
    public Page<RoleResponse> findAll(Pageable pageable) {
        return roleRepository.findByDeleted("N", pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_security:admin')")
    public RoleResponse findById(Long id) {
        return toResponse(getActiveRole(id));
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_security:admin')")
    public RoleResponse create(CreateRoleRequest request) {
        String code = request.code().trim().toUpperCase();
        roleRepository.findByCodeAndDeleted(code, "N").ifPresent(existing -> {
            throw new BusinessException(ApiResponseCode.VALIDATION_BUSINESS_RULE, "El rol ya existe");
        });

        Role role = new Role();
        role.setCode(code);
        role.setName(request.name().trim());
        role.setDescription(request.description());
        role.setActive(request.active() ? "Y" : "N");
        role.setPermissions(new HashSet<>());
        return toResponse(roleRepository.save(role));
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_security:admin')")
    public RoleResponse update(Long id, UpdateRoleRequest request) {
        Role role = getActiveRole(id);
        role.setName(request.name().trim());
        role.setDescription(request.description());
        role.setActive(request.active() ? "Y" : "N");
        return toResponse(role);
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_security:admin')")
    public void delete(Long id) {
        Role role = getActiveRole(id);
        role.markDeleted();
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_security:admin')")
    public RoleResponse assignPermissions(Long id, AssignPermissionsRequest request) {
        Role role = getActiveRole(id);
        Set<String> codes = request.permissionCodes() != null ? request.permissionCodes() : Set.of();
        Set<Permission> permissions = codes.stream()
                .map(code -> permissionRepository.findByCodeAndDeleted(code, "N")
                        .filter(permission -> "Y".equals(permission.getActive()))
                        .orElseThrow(() -> new NotFoundException("Permiso no encontrado: " + code)))
                .collect(Collectors.toSet());
        role.setPermissions(permissions);
        return toResponse(role);
    }

    private Role getActiveRole(Long id) {
        return roleRepository.findByIdAndDeleted(id, "N")
                .orElseThrow(() -> new NotFoundException("Rol no encontrado"));
    }

    private RoleResponse toResponse(Role role) {
        Set<String> permissionCodes = role.getPermissions().stream()
                .filter(permission -> "Y".equals(permission.getActive()) && !permission.isDeleted())
                .map(Permission::getCode)
                .collect(Collectors.toCollection(java.util.TreeSet::new));

        return new RoleResponse(
                role.getId(),
                role.getCode(),
                role.getName(),
                role.getDescription(),
                "Y".equals(role.getActive()),
                permissionCodes
        );
    }
}
