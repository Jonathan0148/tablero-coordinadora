package com.coltefinanciera.itdashboard.identity;

import com.coltefinanciera.itdashboard.identity.service.AdminPermissionService;
import com.coltefinanciera.itdashboard.identity.service.AdminRoleService;
import com.coltefinanciera.itdashboard.security.AuthenticatedUser;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Set;

@SpringBootTest
@ActiveProfiles("local")
class AdminModuleIntegrationTest {

    @Autowired
    AdminRoleService roleService;

    @Autowired
    AdminPermissionService permissionService;

    @Test
    void listRolesAndPermissions() {
        authenticateAsAdmin();
        System.out.println("PERMISSIONS: " + permissionService.listGrouped().size());
        System.out.println("ROLES: " + roleService.findAll(PageRequest.of(0, 50)).getTotalElements());
    }

    private void authenticateAsAdmin() {
        var user = new AuthenticatedUser(1L, "admin", "Administrador Local", Set.of("security:admin"));
        var authorities = user.permissions().stream()
                .map(permission -> new SimpleGrantedAuthority("PERM_" + permission))
                .toList();
        var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
