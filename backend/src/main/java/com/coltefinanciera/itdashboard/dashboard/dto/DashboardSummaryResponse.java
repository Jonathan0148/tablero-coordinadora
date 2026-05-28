package com.coltefinanciera.itdashboard.dashboard.dto;

import java.util.Map;

public record DashboardSummaryResponse(
        long totalProjects,
        long activeKanbanCards,
        long activityLogs,
        Map<String, Long> projectsByTrafficLight
) {
}
