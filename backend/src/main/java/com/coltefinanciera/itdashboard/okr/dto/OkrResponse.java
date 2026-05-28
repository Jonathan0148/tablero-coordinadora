package com.coltefinanciera.itdashboard.okr.dto;

import java.math.BigDecimal;
import java.util.List;

public record OkrResponse(
        Long id,
        String legacyId,
        String name,
        List<Activity> activities
) {
    public record Activity(
            Long id,
            String legacyId,
            BigDecimal pct,
            String statusCode,
            String text,
            String responsible,
            String dependency,
            String deliverable
    ) {
    }
}
