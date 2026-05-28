package com.coltefinanciera.itdashboard.identity.dto;

import java.util.Set;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInMinutes,
        UserProfileResponse user
) {
    public record UserProfileResponse(
            Long userId,
            String username,
            String fullName,
            Set<String> roles,
            Set<String> permissions
    ) {
    }
}
