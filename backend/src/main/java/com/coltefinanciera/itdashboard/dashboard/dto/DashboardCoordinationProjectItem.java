package com.coltefinanciera.itdashboard.dashboard.dto;

public record DashboardCoordinationProjectItem(
        Long projectId,
        String projectName,
        String coordinationDesc,
        String responsibleAreaName,
        String responsibleAction
) {
}
