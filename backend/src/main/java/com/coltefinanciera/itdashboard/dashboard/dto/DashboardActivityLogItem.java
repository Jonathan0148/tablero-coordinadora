package com.coltefinanciera.itdashboard.dashboard.dto;

import java.time.OffsetDateTime;

public record DashboardActivityLogItem(
        Long id,
        String text,
        String areaCode,
        OffsetDateTime loggedAt
) {
}
