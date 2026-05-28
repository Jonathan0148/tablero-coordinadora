package com.coltefinanciera.itdashboard.portfolio.controller;

import com.coltefinanciera.itdashboard.portfolio.dto.CreateProjectRequest;
import com.coltefinanciera.itdashboard.portfolio.dto.ProjectFilterRequest;
import com.coltefinanciera.itdashboard.portfolio.dto.ProjectListItemResponse;
import com.coltefinanciera.itdashboard.portfolio.dto.ProjectResponse;
import com.coltefinanciera.itdashboard.portfolio.dto.UpdateProjectRequest;
import com.coltefinanciera.itdashboard.portfolio.service.ProjectService;
import com.coltefinanciera.itdashboard.shared.pagination.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public PageResponse<ProjectListItemResponse> findAll(
            @RequestParam(required = false) String pipelineStatus,
            @RequestParam(required = false) List<String> pipelineStatuses,
            @RequestParam(required = false) String trafficLight,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean stale,
            @RequestParam(required = false) Boolean requiresCoordination,
            @RequestParam(required = false) Boolean hasStopper,
            @RequestParam(required = false) Boolean activeOnly,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        ProjectFilterRequest filter = new ProjectFilterRequest(
                pipelineStatus,
                pipelineStatuses,
                trafficLight,
                search,
                stale,
                requiresCoordination,
                hasStopper,
                activeOnly
        );
        return PageResponse.from(projectService.findAll(filter, pageable));
    }

    @GetMapping("/{projectId}")
    public ProjectResponse findById(@PathVariable Long projectId) {
        return projectService.findById(projectId);
    }

    @PostMapping
    public ProjectResponse create(@Valid @RequestBody CreateProjectRequest request) {
        return projectService.create(request);
    }

    @PutMapping("/{projectId}")
    public ProjectResponse update(@PathVariable Long projectId, @Valid @RequestBody UpdateProjectRequest request) {
        return projectService.update(projectId, request);
    }

    @DeleteMapping("/{projectId}")
    public void delete(@PathVariable Long projectId) {
        projectService.softDelete(projectId);
    }
}
