package com.coltefinanciera.itdashboard.team.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateTeamMemberRequest(
        @NotBlank String name,
        String roleCode,
        String email,
        boolean active,
        String notes
) {
}
