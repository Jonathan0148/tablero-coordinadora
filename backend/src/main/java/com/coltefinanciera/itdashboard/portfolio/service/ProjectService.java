package com.coltefinanciera.itdashboard.portfolio.service;

import com.coltefinanciera.itdashboard.catalog.repository.PipelineStatusRepository;
import com.coltefinanciera.itdashboard.portfolio.dto.CreateProjectRequest;
import com.coltefinanciera.itdashboard.portfolio.dto.ProjectFilterRequest;
import com.coltefinanciera.itdashboard.portfolio.dto.ProjectListItemResponse;
import com.coltefinanciera.itdashboard.portfolio.dto.ProjectResponse;
import com.coltefinanciera.itdashboard.portfolio.dto.UpdateProjectRequest;
import com.coltefinanciera.itdashboard.portfolio.entity.Project;
import com.coltefinanciera.itdashboard.portfolio.mapper.ProjectMapper;
import com.coltefinanciera.itdashboard.portfolio.repository.ProjectRepository;
import com.coltefinanciera.itdashboard.portfolio.specification.ProjectSpecifications;
import com.coltefinanciera.itdashboard.shared.exception.NotFoundException;
import com.coltefinanciera.itdashboard.tracking.entity.ProjectUpdate;
import com.coltefinanciera.itdashboard.tracking.repository.ProjectUpdateRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final PipelineStatusRepository pipelineStatusRepository;
    private final ProjectUpdateRepository projectUpdateRepository;
    private final ProjectMapper projectMapper;
    private final ProjectEnrichmentService enrichmentService;

    public ProjectService(
            ProjectRepository projectRepository,
            PipelineStatusRepository pipelineStatusRepository,
            ProjectUpdateRepository projectUpdateRepository,
            ProjectMapper projectMapper,
            ProjectEnrichmentService enrichmentService
    ) {
        this.projectRepository = projectRepository;
        this.pipelineStatusRepository = pipelineStatusRepository;
        this.projectUpdateRepository = projectUpdateRepository;
        this.projectMapper = projectMapper;
        this.enrichmentService = enrichmentService;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_projects:read')")
    public Page<ProjectListItemResponse> findAll(ProjectFilterRequest filter, Pageable pageable) {
        Specification<Project> specification = ProjectSpecifications.fromFilter(filter);
        Page<Project> page = projectRepository.findAll(specification, pageable);
        List<Project> projects = page.getContent();
        Map<Long, ProjectUpdate> latestUpdates = enrichmentService.loadLatestUpdates(projects);
        Map<Long, String> leadNames = enrichmentService.loadLeadNames(projects);
        Map<Long, Long> assignmentCounts = enrichmentService.loadAssignmentCounts(projects);
        Map<Long, Long> openTaskCounts = enrichmentService.loadOpenTaskCounts(projects);
        return page.map(project -> enrichmentService.toListItem(
                project,
                latestUpdates.get(project.getId()),
                leadNames.get(project.getId()),
                assignmentCounts.getOrDefault(project.getId(), 0L),
                openTaskCounts.getOrDefault(project.getId(), 0L)
        ));
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_projects:read')")
    public ProjectResponse findById(Long id) {
        Project project = getActiveProject(id);
        ProjectUpdate latestUpdate = projectUpdateRepository
                .findFirstByProjectIdAndDeletedOrderByUpdatedAtOriginalDescIdDesc(project.getId(), "N")
                .orElse(null);
        Map<Long, String> leadNames = enrichmentService.loadLeadNames(List.of(project));
        Map<Long, Long> assignmentCounts = enrichmentService.loadAssignmentCounts(List.of(project));
        Map<Long, Long> openTaskCounts = enrichmentService.loadOpenTaskCounts(List.of(project));
        return projectMapper.toResponse(
                project,
                latestUpdate,
                leadNames.get(project.getId()),
                assignmentCounts.getOrDefault(project.getId(), 0L),
                openTaskCounts.getOrDefault(project.getId(), 0L)
        );
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_projects:create')")
    public ProjectResponse create(CreateProjectRequest request) {
        Project project = new Project();
        project.setName(request.name());
        project.setStartDate(request.startDate());
        project.setPipelineStatus(pipelineStatusRepository.findByCode(request.pipelineStatusCode())
                .orElseThrow(() -> new NotFoundException("Estado pipeline no encontrado")));
        Project saved = projectRepository.save(project);
        return projectMapper.toResponse(saved, null, null, 0L, 0L);
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_projects:update')")
    public ProjectResponse update(Long id, UpdateProjectRequest request) {
        Project project = getActiveProject(id);
        project.setName(request.name());
        project.setStartDate(request.startDate());
        project.setPipelineStatus(pipelineStatusRepository.findByCode(request.pipelineStatusCode())
                .orElseThrow(() -> new NotFoundException("Estado pipeline no encontrado")));
        ProjectUpdate latestUpdate = projectUpdateRepository
                .findFirstByProjectIdAndDeletedOrderByUpdatedAtOriginalDescIdDesc(project.getId(), "N")
                .orElse(null);
        Map<Long, String> leadNames = enrichmentService.loadLeadNames(List.of(project));
        Map<Long, Long> assignmentCounts = enrichmentService.loadAssignmentCounts(List.of(project));
        Map<Long, Long> openTaskCounts = enrichmentService.loadOpenTaskCounts(List.of(project));
        return projectMapper.toResponse(
                project,
                latestUpdate,
                leadNames.get(project.getId()),
                assignmentCounts.getOrDefault(project.getId(), 0L),
                openTaskCounts.getOrDefault(project.getId(), 0L)
        );
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_projects:delete')")
    public void softDelete(Long id) {
        getActiveProject(id).markDeleted();
    }

    public Project getActiveProject(Long id) {
        return projectRepository.findById(id)
                .filter(project -> !project.isDeleted())
                .orElseThrow(() -> new NotFoundException("Proyecto no encontrado"));
    }
}
