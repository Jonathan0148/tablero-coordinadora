package com.coltefinanciera.itdashboard.team.dto;

import jakarta.validation.constraints.NotNull;

public record CreateProjectAssignmentRequest(
        @NotNull Long projectId,
        @NotNull Long teamMemberId,
        @NotNull String roleCode,
        boolean lead
) {
}
