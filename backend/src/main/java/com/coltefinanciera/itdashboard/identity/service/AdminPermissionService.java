package com.coltefinanciera.itdashboard.identity.service;

import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.PermissionGroupResponse;
import com.coltefinanciera.itdashboard.identity.dto.admin.AdminDtos.PermissionResponse;
import com.coltefinanciera.itdashboard.identity.entity.Permission;
import com.coltefinanciera.itdashboard.identity.repository.PermissionRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AdminPermissionService {

    private final PermissionRepository permissionRepository;

    public AdminPermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_security:admin')")
    public List<PermissionGroupResponse> listGrouped() {
        List<Permission> permissions = permissionRepository.findByDeletedOrderByModuleAscCodeAsc("N");
        Map<String, List<PermissionResponse>> grouped = new LinkedHashMap<>();

        for (Permission permission : permissions) {
            grouped.computeIfAbsent(permission.getModule(), key -> new ArrayList<>())
                    .add(toResponse(permission));
        }

        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey(String.CASE_INSENSITIVE_ORDER))
                .map(entry -> new PermissionGroupResponse(
                        entry.getKey(),
                        moduleLabel(entry.getKey()),
                        entry.getValue().stream()
                                .sorted(Comparator.comparing(PermissionResponse::code))
                                .toList()
                ))
                .toList();
    }

    private PermissionResponse toResponse(Permission permission) {
        return new PermissionResponse(
                permission.getId(),
                permission.getCode(),
                permission.getModule(),
                permission.getAction(),
                permission.getDescription(),
                "Y".equals(permission.getActive())
        );
    }

    private String moduleLabel(String module) {
        if (module == null || module.isBlank()) {
            return "General";
        }
        return module.substring(0, 1).toUpperCase(Locale.ROOT) + module.substring(1).replace('-', ' ');
    }
}
