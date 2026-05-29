package com.coltefinanciera.itdashboard.identity;

import com.coltefinanciera.itdashboard.security.JwtService;
import com.coltefinanciera.itdashboard.security.AuthenticatedUser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Set;
import java.util.UUID;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class AdminControllerIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    JwtService jwtService;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    void createUserWithRoleAssignmentPersistsUserRole() throws Exception {
        String token = adminToken();
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String username = "qa.user." + suffix;
        String email = "qa.user." + suffix + "@local.dev";

        MvcResult createResult = mockMvc.perform(post("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + token)
                        .content("""
                                {
                                  "username": "%s",
                                  "email": "%s",
                                  "fullName": "QA User %s",
                                  "password": "TestPass123!",
                                  "active": true,
                                  "roleCodes": ["VIEWER"]
                                }
                                """.formatted(username, email, suffix)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value(username))
                .andExpect(jsonPath("$.data.roles[*].code").value(hasItem("VIEWER")))
                .andReturn();

        JsonNode data = objectMapper.readTree(createResult.getResponse().getContentAsString()).path("data");
        long userId = data.path("userId").asLong();

        mockMvc.perform(get("/api/v1/admin/users/{userId}", userId)
                        .header("Authorization", "Bearer " + token))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.roles[*].code").value(hasItem("VIEWER")));

        mockMvc.perform(delete("/api/v1/admin/users/{userId}", userId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void assignRolePermissionsPersistsRolePermission() throws Exception {
        String token = adminToken();
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String roleCode = "QA_PERM_" + suffix;

        MvcResult createResult = mockMvc.perform(post("/api/v1/admin/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + token)
                        .content("""
                                {
                                  "code": "%s",
                                  "name": "QA Role Permissions",
                                  "description": "Integration test role",
                                  "active": true
                                }
                                """.formatted(roleCode)))
                .andExpect(status().isOk())
                .andReturn();

        long roleId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/v1/admin/roles/{roleId}/permissions", roleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + token)
                        .content("""
                                {
                                  "permissionCodes": ["projects:read", "reports:read"]
                                }
                                """))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.permissionCodes").value(hasItem("projects:read")))
                .andExpect(jsonPath("$.data.permissionCodes").value(hasItem("reports:read")));

        mockMvc.perform(delete("/api/v1/admin/roles/{roleId}", roleId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

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

    private String adminToken() {
        var user = new AuthenticatedUser(1L, "admin", "Administrador Local", Set.of("security:admin", "reports:read"));
        return jwtService.generateToken(user);
    }
}
