package com.coltefinanciera.itdashboard.identity.service;

import com.coltefinanciera.itdashboard.identity.dto.AuthResponse;
import com.coltefinanciera.itdashboard.identity.dto.LoginRequest;
import com.coltefinanciera.itdashboard.identity.entity.AppUser;
import com.coltefinanciera.itdashboard.identity.entity.Permission;
import com.coltefinanciera.itdashboard.identity.entity.Role;
import com.coltefinanciera.itdashboard.identity.repository.AppUserRepository;
import com.coltefinanciera.itdashboard.security.AuthenticatedUser;
import com.coltefinanciera.itdashboard.security.JwtProperties;
import com.coltefinanciera.itdashboard.security.JwtService;
import com.coltefinanciera.itdashboard.shared.api.ApiResponseCode;
import com.coltefinanciera.itdashboard.shared.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AppUserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public AuthService(
            AppUserRepository userRepository,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            JwtProperties jwtProperties
    ) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password())
            );
        } catch (BadCredentialsException ex) {
            log.warn("Login failed for email '{}': bad credentials", email);
            throw new BusinessException(ApiResponseCode.AUTH_INVALID_LOGIN);
        } catch (AuthenticationException ex) {
            log.warn("Login failed for email '{}': {}", email, ex.getMessage());
            throw new BusinessException(ApiResponseCode.AUTH_INVALID_LOGIN);
        }

        AppUser user = userRepository.findByEmailIgnoreCaseAndDeleted(email, "N")
                .filter(AppUser::isActive)
                .orElseThrow(() -> new BusinessException(ApiResponseCode.AUTH_INVALID_LOGIN));

        user.setLastLoginAt(OffsetDateTime.now());
        Set<String> permissions = permissions(user);
        Set<String> roles = roles(user);
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(user.getId(), user.getUsername(), user.getFullName(), permissions);

        return new AuthResponse(
                jwtService.generateToken(authenticatedUser),
                "Bearer",
                jwtProperties.accessTokenMinutes(),
                new AuthResponse.UserProfileResponse(user.getId(), user.getUsername(), user.getFullName(), roles, permissions)
        );
    }

    public AuthResponse.UserProfileResponse profile(AuthenticatedUser user) {
        AppUser appUser = userRepository.findById(user.userId())
                .orElseThrow(() -> new BusinessException(ApiResponseCode.AUTH_UNAUTHORIZED, "Usuario autenticado no encontrado"));
        Set<String> roles = roles(appUser);
        return new AuthResponse.UserProfileResponse(
                appUser.getId(),
                appUser.getUsername(),
                appUser.getFullName(),
                roles,
                user.permissions()
        );
    }

    public static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private Set<String> permissions(AppUser user) {
        return user.getRoles().stream()
                .filter(this::isActive)
                .flatMap(role -> role.getPermissions().stream())
                .filter(this::isActive)
                .map(Permission::getCode)
                .collect(Collectors.toUnmodifiableSet());
    }

    private Set<String> roles(AppUser user) {
        return user.getRoles().stream()
                .filter(this::isActive)
                .map(Role::getCode)
                .collect(Collectors.toUnmodifiableSet());
    }

    private boolean isActive(Role role) {
        return "Y".equals(role.getActive()) && !role.isDeleted();
    }

    private boolean isActive(Permission permission) {
        return "Y".equals(permission.getActive()) && !permission.isDeleted();
    }
}
