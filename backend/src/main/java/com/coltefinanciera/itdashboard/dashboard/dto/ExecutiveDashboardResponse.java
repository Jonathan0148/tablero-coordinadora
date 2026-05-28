package com.coltefinanciera.itdashboard.dashboard.dto;

import java.util.List;
import java.util.Map;

public record ExecutiveDashboardResponse(
        long totalProjects,
        Map<String, Long> trafficLightCounts,
        long stopperCount,
        long staleCount,
        long coordinationCount,
        Map<String, Long> executiveStatusBreakdown,
        List<DashboardMilestoneItem> upcomingMilestones,
        List<DashboardStaleProjectItem> staleProjects,
        List<DashboardActivityLogItem> recentActivityLogs,
        List<DashboardCoordinationProjectItem> coordinationProjects
) {
}
