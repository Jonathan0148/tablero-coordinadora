package com.coltefinanciera.itdashboard.tracking.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ProjectUpdateResponse(
        Long id,
        String legacyId,
        Long projectId,
        LocalDateTime updatedAtOriginal,
        String executiveStatusCode,
        String executiveStatusName,
        String trafficLightCode,
        String trafficLightName,
        String summary,
        String pendingItems,
        boolean hasStopper,
        String stopperDesc,
        String stopperOwner,
        String stopperImpactCode,
        String relevantRisks,
        String nextMilestone,
        LocalDate nextMilestoneDate,
        String pendingDecisions,
        boolean requiresCoordination,
        String coordinationDesc,
        String responsibleAreaCode,
        String responsibleAction,
        String additionalNotes
) {
}
