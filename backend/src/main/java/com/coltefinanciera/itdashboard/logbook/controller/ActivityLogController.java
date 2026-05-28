package com.coltefinanciera.itdashboard.logbook.controller;

import com.coltefinanciera.itdashboard.logbook.dto.ActivityLogDto;
import com.coltefinanciera.itdashboard.logbook.service.ActivityLogService;
import com.coltefinanciera.itdashboard.shared.pagination.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/activity-logs")
public class ActivityLogController {
    private final ActivityLogService service;

    public ActivityLogController(ActivityLogService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<ActivityLogDto> findAll(
            @RequestParam(required = false) String area,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return PageResponse.from(service.findAll(area, pageable));
    }

    @PostMapping
    public ActivityLogDto create(@Valid @RequestBody ActivityLogDto request) {
        return service.create(request);
    }

    @DeleteMapping("/{logId}")
    public void delete(@PathVariable Long logId) {
        service.delete(logId);
    }
}
