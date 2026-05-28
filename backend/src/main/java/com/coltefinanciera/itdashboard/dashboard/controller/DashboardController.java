package com.coltefinanciera.itdashboard.dashboard.controller;

import com.coltefinanciera.itdashboard.dashboard.dto.AlertItemResponse;
import com.coltefinanciera.itdashboard.dashboard.dto.CommitteeSummaryResponse;
import com.coltefinanciera.itdashboard.dashboard.dto.DashboardSummaryResponse;
import com.coltefinanciera.itdashboard.dashboard.dto.ExecutiveDashboardResponse;
import com.coltefinanciera.itdashboard.dashboard.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class DashboardController {
    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/dashboard/summary")
    public DashboardSummaryResponse dashboardSummary() {
        return service.summary();
    }

    @GetMapping("/dashboard/executive")
    public ExecutiveDashboardResponse executiveDashboard() {
        return service.executiveDashboard();
    }

    @GetMapping("/dashboard/alerts")
    public List<AlertItemResponse> alerts() {
        return service.computeAlerts();
    }

    @GetMapping("/committee/summary")
    public CommitteeSummaryResponse committeeSummary() {
        return service.committeeSummary();
    }
}
