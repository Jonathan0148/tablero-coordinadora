package com.coltefinanciera.itdashboard.security;

import java.util.Set;

public record AuthenticatedUser(
        Long userId,
        String username,
        String fullName,
        Set<String> permissions
) {
}
