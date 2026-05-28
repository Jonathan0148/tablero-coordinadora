package com.coltefinanciera.itdashboard.identity.service;

import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.AdminUserResponse;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.AssignRolesRequest;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.CreateUserRequest;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.ResetPasswordRequest;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.RoleSummaryResponse;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.UpdateUserRequest;
import com.coltefinanciera.itdashboard.identity.entity.AppUser;
import com.coltefinanciera.itdashboard.identity.entity.Permission;
import com.coltefinanciera.itdashboard.identity.entity.Role;
import com.coltefinanciera.itdashboard.identity.repository.AppUserRepository;
import com.coltefinanciera.itdashboard.identity.repository.RoleRepository;
import com.coltefinanciera.itdashboard.shared.api.ApiResponseCode;
import com.coltefinanciera.itdashboard.shared.exception.BusinessException;
import com.coltefinanciera.itdashboard.shared.exception.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    private final AppUserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(
            AppUserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_security:admin')")
    public Page<AdminUserResponse> findAll(String search, Pageable pageable) {
        Page<AppUser> page = StringUtils.hasText(search)
                ? userRepository.searchActive(search.trim(), pageable)
                : userRepository.findByDeleted("N", pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_security:admin')")
    public AdminUserResponse findById(Long id) {
        return toResponse(getActiveUser(id));
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_security:admin')")
    public AdminUserResponse create(CreateUserRequest request) {
        String username = request.username().trim();
        userRepository.findByUsernameAndDeleted(username, "N").ifPresent(existing -> {
            throw new BusinessException(ApiResponseCode.USER_ALREADY_EXISTS);
        });
        userRepository.findByEmailAndDeleted(request.email().trim(), "N").ifPresent(existing -> {
            throw new BusinessException(ApiResponseCode.USER_ALREADY_EXISTS, "El email ya está registrado");
        });

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setEmail(request.email().trim());
        user.setFullName(request.fullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setActive(request.active() ? "Y" : "N");
        user.setRoles(resolveRoles(request.roleCodes()));
        return toResponse(userRepository.save(user));
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_security:admin')")
    public AdminUserResponse update(Long id, UpdateUserRequest request) {
        AppUser user = getActiveUser(id);
        userRepository.findByEmailAndDeleted(request.email().trim(), "N")
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException(ApiResponseCode.USER_ALREADY_EXISTS, "El email ya está registrado");
                });

        user.setEmail(request.email().trim());
        user.setFullName(request.fullName().trim());
        user.setActive(request.active() ? "Y" : "N");
        return toResponse(user);
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_security:admin')")
    public void delete(Long id) {
        AppUser user = getActiveUser(id);
        user.setActive("N");
        user.markDeleted();
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_security:admin')")
    public AdminUserResponse assignRoles(Long id, AssignRolesRequest request) {
        AppUser user = getActiveUser(id);
        user.setRoles(resolveRoles(request.roleCodes()));
        return toResponse(user);
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_security:admin')")
    public void resetPassword(Long id, ResetPasswordRequest request) {
        AppUser user = getActiveUser(id);
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    private AppUser getActiveUser(Long id) {
        return userRepository.findByIdAndDeleted(id, "N")
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    private Set<Role> resolveRoles(Set<String> roleCodes) {
        if (roleCodes == null || roleCodes.isEmpty()) {
            return new HashSet<>();
        }
        Set<Role> roles = new HashSet<>();
        for (String roleCode : roleCodes) {
            Role role = roleRepository.findByCodeAndDeleted(roleCode.trim().toUpperCase(), "N")
                    .filter(r -> "Y".equals(r.getActive()))
                    .orElseThrow(() -> new NotFoundException("Rol no encontrado: " + roleCode));
            roles.add(role);
        }
        return roles;
    }

    private AdminUserResponse toResponse(AppUser user) {
        List<RoleSummaryResponse> roles = user.getRoles().stream()
                .filter(role -> "Y".equals(role.getActive()) && !role.isDeleted())
                .sorted(java.util.Comparator.comparing(Role::getCode))
                .map(role -> new RoleSummaryResponse(role.getId(), role.getCode(), role.getName(), true))
                .toList();

        Set<String> effectivePermissions = user.getRoles().stream()
                .filter(role -> "Y".equals(role.getActive()) && !role.isDeleted())
                .flatMap(role -> role.getPermissions().stream())
                .filter(permission -> "Y".equals(permission.getActive()) && !permission.isDeleted())
                .map(Permission::getCode)
                .collect(Collectors.toCollection(java.util.TreeSet::new));

        return new AdminUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.isActive(),
                roles,
                effectivePermissions,
                user.getLastLoginAt()
        );
    }
}
