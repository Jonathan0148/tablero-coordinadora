package com.coltefinanciera.itdashboard.team.controller;

import com.coltefinanciera.itdashboard.team.dto.CreateProjectAssignmentRequest;
import com.coltefinanciera.itdashboard.team.dto.ProjectAssignmentResponse;
import com.coltefinanciera.itdashboard.team.service.ProjectAssignmentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ProjectAssignmentController {

    private final ProjectAssignmentService service;

    public ProjectAssignmentController(ProjectAssignmentService service) {
        this.service = service;
    }

    @GetMapping("/projects/{projectId}/assignments")
    public List<ProjectAssignmentResponse> findByProject(@PathVariable Long projectId) {
        return service.findByProject(projectId);
    }

    @PostMapping("/projects/{projectId}/assignments")
    public ProjectAssignmentResponse createForProject(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateProjectAssignmentRequest request
    ) {
        CreateProjectAssignmentRequest normalized = new CreateProjectAssignmentRequest(
                projectId,
                request.teamMemberId(),
                request.roleCode(),
                request.lead()
        );
        return service.create(normalized);
    }

    @PostMapping("/assignments")
    public ProjectAssignmentResponse create(@Valid @RequestBody CreateProjectAssignmentRequest request) {
        return service.create(request);
    }

    @DeleteMapping("/assignments/{assignmentId}")
    public void remove(@PathVariable Long assignmentId) {
        service.remove(assignmentId);
    }
}
