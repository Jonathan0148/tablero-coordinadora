package com.coltefinanciera.itdashboard.dashboard.dto;

import java.time.LocalDate;
import java.util.List;

public record CommitteeSummaryResponse(
        PortfolioStats portfolioStats,
        ImmediateAttention immediateAttention,
        FollowUp followUp,
        ResourceLoad resourceLoad,
        Milestones30Days milestones30Days
) {

    public record PortfolioStats(
            long totalProjects,
            long redCount,
            long amberCount,
            long greenCount,
            long stopperCount,
            long staleCount,
            long coordinationCount
    ) {
    }

    public record ImmediateAttention(List<CommitteeProjectItem> projects) {
    }

    public record FollowUp(List<CommitteeProjectItem> projects) {
    }

    public record ResourceLoad(
            int activeMemberCount,
            int totalAssignments,
            List<ResourceLoadItem> topMembers
    ) {
    }

    public record Milestones30Days(List<CommitteeMilestoneItem> milestones) {
    }

    public record CommitteeProjectItem(
            Long projectId,
            String projectName,
            String trafficLightCode,
            String executiveStatusCode,
            String executiveStatusName,
            boolean requiresCoordination,
            String coordinationDesc,
            String responsibleAreaName,
            String responsibleAction,
            boolean hasStopper,
            String stopperImpactName,
            String stopperDesc,
            String leadName,
            String nextMilestone,
            LocalDate nextMilestoneDate,
            Integer staleDays,
            String pendingDecisions
    ) {
    }

    public record CommitteeMilestoneItem(
            Long projectId,
            String projectName,
            String milestone,
            LocalDate milestoneDate
    ) {
    }

    public record ResourceLoadItem(
            Long memberId,
            String memberName,
            int assignmentCount
    ) {
    }
}
