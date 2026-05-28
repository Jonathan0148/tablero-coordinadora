package com.coltefinanciera.itdashboard.portfolio.mapper;

import com.coltefinanciera.itdashboard.portfolio.dto.ProjectResponse;
import com.coltefinanciera.itdashboard.portfolio.entity.Project;
import com.coltefinanciera.itdashboard.portfolio.service.ProjectEnrichmentService;
import com.coltefinanciera.itdashboard.tracking.entity.ProjectUpdate;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    private final ProjectEnrichmentService enrichmentService;

    public ProjectMapper(ProjectEnrichmentService enrichmentService) {
        this.enrichmentService = enrichmentService;
    }

    public ProjectResponse toResponse(
            Project project,
            ProjectUpdate currentUpdate,
            String leadName,
            long assignmentCount,
            long openTaskCount
    ) {
        return new ProjectResponse(
                project.getId(),
                project.getLegacyId(),
                project.getName(),
                project.getPipelineStatus().getCode(),
                project.getPipelineStatus().getName(),
                project.getStartDate(),
                project.getLegacyUpdatedAt(),
                currentUpdate == null ? "GRIS" : currentUpdate.getTrafficLight().getCode(),
                currentUpdate == null ? null : currentUpdate.getExecutiveStatus().getCode(),
                leadName,
                (int) assignmentCount,
                (int) openTaskCount,
                enrichmentService.computeStaleDays(project, currentUpdate),
                currentUpdate != null && "Y".equals(currentUpdate.getRequiresCoordination()),
                currentUpdate != null && "Y".equals(currentUpdate.getHasStopper()),
                currentUpdate == null || currentUpdate.getStopperImpact() == null
                        ? null
                        : currentUpdate.getStopperImpact().getCode(),
                enrichmentService.buildSummaryPreview(currentUpdate)
        );
    }
}
