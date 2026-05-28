package com.coltefinanciera.itdashboard.team.dto;

public record ProjectAssignmentResponse(
        Long id,
        String legacyId,
        Long projectId,
        String projectName,
        Long teamMemberId,
        String teamMemberName,
        String roleCode,
        String roleName,
        boolean lead
) {
}
