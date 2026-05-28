package com.coltefinanciera.itdashboard.dashboard.dto;

import java.time.LocalDate;

public record DashboardMilestoneItem(
        Long projectId,
        String projectName,
        String milestone,
        LocalDate milestoneDate
) {
}
