package com.coltefinanciera.itdashboard.portfolio.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record ProjectListItemResponse(
        Long id,
        String legacyId,
        String name,
        String pipelineStatusCode,
        String pipelineStatusName,
        LocalDate startDate,
        OffsetDateTime legacyUpdatedAt,
        String currentTrafficLight,
        String currentExecutiveStatus,
        String leadName,
        int assignmentCount,
        int openTaskCount,
        Integer staleDays,
        boolean requiresCoordination,
        boolean hasStopper,
        String stopperImpactCode,
        String summaryPreview
) {
}
