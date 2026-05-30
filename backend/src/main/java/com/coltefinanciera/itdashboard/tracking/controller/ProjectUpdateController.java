package com.coltefinanciera.itdashboard.tracking.controller;

import com.coltefinanciera.itdashboard.shared.pagination.PageResponse;
import com.coltefinanciera.itdashboard.tracking.dto.CreateProjectUpdateRequest;
import com.coltefinanciera.itdashboard.tracking.dto.ProjectUpdateResponse;
import com.coltefinanciera.itdashboard.tracking.service.ProjectUpdateService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/projects/{projectId}")
public class ProjectUpdateController {

    private final ProjectUpdateService service;

    public ProjectUpdateController(ProjectUpdateService service) {
        this.service = service;
    }

    @GetMapping("/updates")
    public PageResponse<ProjectUpdateResponse> findByProject(
            @PathVariable Long projectId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return PageResponse.from(service.findByProject(projectId, pageable));
    }

    @PostMapping("/updates")
    public ProjectUpdateResponse create(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateProjectUpdateRequest request
    ) {
        return service.create(projectId, request);
    }

    @GetMapping("/current-status")
    public ProjectUpdateResponse currentStatus(@PathVariable Long projectId) {
        return service.currentStatus(projectId);
    }

    @GetMapping("/status-at")
    public ProjectUpdateResponse statusAt(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime at
    ) {
        return service.statusAt(projectId, at);
    }
}
