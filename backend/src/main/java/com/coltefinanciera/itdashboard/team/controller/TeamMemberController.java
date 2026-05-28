package com.coltefinanciera.itdashboard.team.controller;

import com.coltefinanciera.itdashboard.shared.pagination.PageResponse;
import com.coltefinanciera.itdashboard.team.dto.CreateTeamMemberRequest;
import com.coltefinanciera.itdashboard.team.dto.TeamMemberResponse;
import com.coltefinanciera.itdashboard.team.dto.UpdateTeamMemberRequest;
import com.coltefinanciera.itdashboard.team.service.TeamMemberService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/team-members")
public class TeamMemberController {
    private final TeamMemberService service;

    public TeamMemberController(TeamMemberService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<TeamMemberResponse> findAll(@PageableDefault(size = 50) Pageable pageable) {
        return PageResponse.from(service.findAll(pageable));
    }

    @PostMapping
    public TeamMemberResponse create(@Valid @RequestBody CreateTeamMemberRequest request) {
        return service.create(request);
    }

    @PutMapping("/{memberId}")
    public TeamMemberResponse update(@PathVariable Long memberId, @Valid @RequestBody UpdateTeamMemberRequest request) {
        return service.update(memberId, request);
    }

    @DeleteMapping("/{memberId}")
    public void delete(@PathVariable Long memberId) {
        service.delete(memberId);
    }
}
