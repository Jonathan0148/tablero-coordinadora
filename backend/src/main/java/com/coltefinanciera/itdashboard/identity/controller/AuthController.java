package com.coltefinanciera.itdashboard.identity.controller;

import com.coltefinanciera.itdashboard.identity.dto.AuthResponse;
import com.coltefinanciera.itdashboard.identity.dto.LoginRequest;
import com.coltefinanciera.itdashboard.identity.service.AuthService;
import com.coltefinanciera.itdashboard.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public AuthResponse.UserProfileResponse me(@AuthenticationPrincipal AuthenticatedUser user) {
        return authService.profile(user);
    }
}
