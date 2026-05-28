package com.coltefinanciera.itdashboard.tracking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateProjectUpdateRequest(
        @NotBlank String executiveStatusCode,
        @NotBlank String summary,
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
        String additionalNotes,
        @NotNull Boolean calculateTrafficLight
) {
}
