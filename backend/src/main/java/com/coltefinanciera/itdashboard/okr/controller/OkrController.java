package com.coltefinanciera.itdashboard.okr.controller;

import com.coltefinanciera.itdashboard.okr.dto.OkrResponse;
import com.coltefinanciera.itdashboard.okr.dto.UpdateOkrActivityRequest;
import com.coltefinanciera.itdashboard.okr.service.OkrService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/okrs")
public class OkrController {
    private final OkrService service;

    public OkrController(OkrService service) {
        this.service = service;
    }

    @GetMapping
    public List<OkrResponse> findAll() {
        return service.findAll();
    }

    @PatchMapping("/{okrId}/activities/{activityId}")
    public OkrResponse.Activity updateActivity(
            @PathVariable Long okrId,
            @PathVariable Long activityId,
            @RequestBody UpdateOkrActivityRequest request
    ) {
        return service.updateActivity(okrId, activityId, request);
    }
}
