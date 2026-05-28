package com.coltefinanciera.itdashboard.identity;

import com.coltefinanciera.itdashboard.security.JwtService;
import com.coltefinanciera.itdashboard.security.AuthenticatedUser;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class AdminControllerIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    JwtService jwtService;

    @Test
    void adminRolesEndpoint() throws Exception {
        var user = new AuthenticatedUser(1L, "admin", "Administrador Local", Set.of("security:admin", "reports:read"));
        String token = jwtService.generateToken(user);

        mockMvc.perform(get("/api/v1/admin/roles")
                        .param("page", "0")
                        .param("size", "50")
                        .param("sort", "name,asc")
                        .header("Authorization", "Bearer " + token))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    void adminRolesForbiddenWithoutPermission() throws Exception {
        var user = new AuthenticatedUser(1L, "admin", "Administrador Local", Set.of("reports:read"));
        String token = jwtService.generateToken(user);

        mockMvc.perform(get("/api/v1/admin/roles")
                        .param("page", "0")
                        .param("size", "50")
                        .header("Authorization", "Bearer " + token))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    void adminPermissionsEndpoint() throws Exception {
        var user = new AuthenticatedUser(1L, "admin", "Administrador Local", Set.of("security:admin"));
        String token = jwtService.generateToken(user);

        mockMvc.perform(get("/api/v1/admin/permissions")
                        .header("Authorization", "Bearer " + token))
                .andDo(print())
                .andExpect(status().isOk());
    }
}
