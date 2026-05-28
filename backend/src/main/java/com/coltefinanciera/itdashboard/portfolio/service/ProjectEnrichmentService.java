package com.coltefinanciera.itdashboard.portfolio.service;

import com.coltefinanciera.itdashboard.portfolio.dto.ProjectListItemResponse;
import com.coltefinanciera.itdashboard.portfolio.entity.Project;
import com.coltefinanciera.itdashboard.team.entity.ProjectAssignment;
import com.coltefinanciera.itdashboard.team.repository.ProjectAssignmentRepository;
import com.coltefinanciera.itdashboard.tracking.entity.ProjectUpdate;
import com.coltefinanciera.itdashboard.tracking.repository.ProjectUpdateRepository;
import com.coltefinanciera.itdashboard.work.repository.KanbanCardRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ProjectEnrichmentService {

    private static final int SUMMARY_PREVIEW_LENGTH = 120;

    private final ProjectUpdateRepository projectUpdateRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final KanbanCardRepository kanbanCardRepository;

    public ProjectEnrichmentService(
            ProjectUpdateRepository projectUpdateRepository,
            ProjectAssignmentRepository projectAssignmentRepository,
            KanbanCardRepository kanbanCardRepository
    ) {
        this.projectUpdateRepository = projectUpdateRepository;
        this.projectAssignmentRepository = projectAssignmentRepository;
        this.kanbanCardRepository = kanbanCardRepository;
    }

    public Map<Long, ProjectUpdate> loadLatestUpdates(List<Project> projects) {
        if (projects.isEmpty()) {
            return Map.of();
        }
        List<Long> projectIds = projects.stream().map(Project::getId).toList();
        return projectUpdateRepository.findLatestByProjectIds(projectIds).stream()
                .collect(Collectors.toMap(update -> update.getProject().getId(), Function.identity(), (a, b) -> a));
    }

    public Map<Long, String> loadLeadNames(List<Project> projects) {
        if (projects.isEmpty()) {
            return Map.of();
        }
        List<Long> projectIds = projects.stream().map(Project::getId).toList();
        Map<Long, String> leadNames = new HashMap<>();
        projectAssignmentRepository.findByProjectIdInAndLeadAndDeleted(projectIds, "Y", "N")
                .forEach(assignment -> leadNames.put(assignment.getProject().getId(), assignment.getTeamMember().getName()));
        return leadNames;
    }

    public Map<Long, Long> loadAssignmentCounts(List<Project> projects) {
        if (projects.isEmpty()) {
            return Map.of();
        }
        List<Long> projectIds = projects.stream().map(Project::getId).toList();
        Map<Long, Long> counts = new HashMap<>();
        projectAssignmentRepository.countByProjectIds(projectIds).forEach(row ->
                counts.put((Long) row[0], (Long) row[1]));
        return counts;
    }

    public Map<Long, Long> loadOpenTaskCounts(List<Project> projects) {
        if (projects.isEmpty()) {
            return Map.of();
        }
        List<Long> projectIds = projects.stream().map(Project::getId).toList();
        Map<Long, Long> counts = new HashMap<>();
        kanbanCardRepository.countOpenTasksByProjectIds(projectIds).forEach(row ->
                counts.put((Long) row[0], (Long) row[1]));
        return counts;
    }

    public Integer computeStaleDays(Project project, ProjectUpdate latestUpdate) {
        OffsetDateTime reference = latestUpdate != null
                ? latestUpdate.getUpdatedAtOriginal()
                : (project.getLegacyUpdatedAt() != null ? project.getLegacyUpdatedAt() : project.getUpdatedAt());
        if (reference == null) {
            return null;
        }
        long days = ChronoUnit.DAYS.between(reference.toLocalDate(), OffsetDateTime.now().toLocalDate());
        return (int) days;
    }

    public boolean isStale(Project project, ProjectUpdate latestUpdate) {
        Integer staleDays = computeStaleDays(project, latestUpdate);
        return staleDays != null && staleDays > 7;
    }

    public String buildSummaryPreview(ProjectUpdate latestUpdate) {
        if (latestUpdate == null || !StringUtils.hasText(latestUpdate.getSummary())) {
            return null;
        }
        String summary = latestUpdate.getSummary().trim();
        if (summary.length() <= SUMMARY_PREVIEW_LENGTH) {
            return summary;
        }
        return summary.substring(0, SUMMARY_PREVIEW_LENGTH) + "…";
    }

    public ProjectListItemResponse toListItem(
            Project project,
            ProjectUpdate latestUpdate,
            String leadName,
            long assignmentCount,
            long openTaskCount
    ) {
        Integer staleDays = computeStaleDays(project, latestUpdate);
        return new ProjectListItemResponse(
                project.getId(),
                project.getLegacyId(),
                project.getName(),
                project.getPipelineStatus().getCode(),
                project.getPipelineStatus().getName(),
                project.getStartDate(),
                project.getLegacyUpdatedAt(),
                latestUpdate == null ? "GRIS" : latestUpdate.getTrafficLight().getCode(),
                latestUpdate == null ? null : latestUpdate.getExecutiveStatus().getCode(),
                leadName,
                (int) assignmentCount,
                (int) openTaskCount,
                staleDays,
                latestUpdate != null && "Y".equals(latestUpdate.getRequiresCoordination()),
                latestUpdate != null && "Y".equals(latestUpdate.getHasStopper()),
                latestUpdate == null || latestUpdate.getStopperImpact() == null
                        ? null
                        : latestUpdate.getStopperImpact().getCode(),
                buildSummaryPreview(latestUpdate)
        );
    }

    public String resolveLeadName(Long projectId, Map<Long, String> leadNames, List<ProjectAssignment> assignments) {
        if (leadNames.containsKey(projectId)) {
            return leadNames.get(projectId);
        }
        return assignments.stream()
                .filter(assignment -> assignment.getProject().getId().equals(projectId))
                .filter(assignment -> "Y".equals(assignment.getLead()))
                .map(assignment -> assignment.getTeamMember().getName())
                .findFirst()
                .orElse(null);
    }
}
