package com.coltefinanciera.itdashboard.portfolio.dto;

import java.util.List;

public record ProjectFilterRequest(
        String pipelineStatus,
        List<String> pipelineStatuses,
        String trafficLight,
        String search,
        Boolean stale,
        Boolean requiresCoordination,
        Boolean hasStopper,
        Boolean activeOnly
) {
}
