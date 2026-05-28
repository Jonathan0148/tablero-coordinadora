package com.coltefinanciera.itdashboard.dashboard.dto;

public record DashboardStaleProjectItem(
        Long projectId,
        String projectName,
        int staleDays
) {
}
