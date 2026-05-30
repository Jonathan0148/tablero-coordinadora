package com.coltefinanciera.itdashboard.dashboard.dto;

import java.time.LocalDateTime;

public record DashboardActivityLogItem(
        Long id,
        String text,
        String areaCode,
        LocalDateTime loggedAt
) {
}
