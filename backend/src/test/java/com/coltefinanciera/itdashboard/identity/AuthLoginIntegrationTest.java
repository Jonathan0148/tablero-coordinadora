package com.coltefinanciera.itdashboard.identity;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.StringUtils;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class AuthLoginIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Value("${app.test.admin-email:}")
    private String adminEmail;

    @Value("${app.test.admin-password:}")
    private String adminPassword;

    @Test
    void loginWithEmailSucceeds() throws Exception {
        Assumptions.assumeTrue(
                StringUtils.hasText(adminEmail) && StringUtils.hasText(adminPassword),
                "Configure TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD to run login E2E against Oracle"
        );

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(adminEmail.trim(), adminPassword)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value(notNullValue()))
                .andExpect(jsonPath("$.data.user.username").value(notNullValue()))
                .andExpect(jsonPath("$.data.user.permissions").isArray());
    }

    @Test
    void loginWithUsernamePayloadIsRejected() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "admin",
                                  "password": "admin123"
                                }
                                """))
                .andDo(print())
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.data.details[0].field").value("email"))
                .andExpect(jsonPath("$.message", containsString("email")));
    }

    @Test
    void loginWithInvalidEmailIsRejected() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "not-an-email",
                                  "password": "admin123"
                                }
                                """))
                .andDo(print())
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.data.details[0].field").value("email"));
    }
}
