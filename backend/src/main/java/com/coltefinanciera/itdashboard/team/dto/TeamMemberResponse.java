package com.coltefinanciera.itdashboard.team.dto;

public record TeamMemberResponse(
        Long id,
        String legacyId,
        String name,
        String defaultRoleCode,
        String defaultRoleName,
        String email,
        boolean active,
        String notes
) {
}
