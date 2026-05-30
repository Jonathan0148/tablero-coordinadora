package com.coltefinanciera.itdashboard.team.service;

import com.coltefinanciera.itdashboard.catalog.repository.TechRoleRepository;
import com.coltefinanciera.itdashboard.portfolio.service.ProjectService;
import com.coltefinanciera.itdashboard.shared.exception.BusinessException;
import com.coltefinanciera.itdashboard.shared.exception.NotFoundException;
import com.coltefinanciera.itdashboard.team.dto.CreateProjectAssignmentRequest;
import com.coltefinanciera.itdashboard.team.dto.ProjectAssignmentResponse;
import com.coltefinanciera.itdashboard.team.entity.ProjectAssignment;
import com.coltefinanciera.itdashboard.team.entity.TeamMember;
import com.coltefinanciera.itdashboard.team.repository.ProjectAssignmentRepository;
import com.coltefinanciera.itdashboard.team.repository.TeamMemberRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProjectAssignmentService {

    private final ProjectAssignmentRepository repository;
    private final ProjectService projectService;
    private final TeamMemberRepository teamMemberRepository;
    private final TechRoleRepository techRoleRepository;

    public ProjectAssignmentService(
            ProjectAssignmentRepository repository,
            ProjectService projectService,
            TeamMemberRepository teamMemberRepository,
            TechRoleRepository techRoleRepository
    ) {
        this.repository = repository;
        this.projectService = projectService;
        this.teamMemberRepository = teamMemberRepository;
        this.techRoleRepository = techRoleRepository;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_assignments:read')")
    public List<ProjectAssignmentResponse> findByProject(Long projectId) {
        projectService.getActiveProject(projectId);
        return repository.findByProjectIdAndDeleted(projectId, "N").stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_assignments:create')")
    public ProjectAssignmentResponse create(CreateProjectAssignmentRequest request) {
        var project = projectService.getActiveProject(request.projectId());
        TeamMember member = teamMemberRepository.findById(request.teamMemberId())
                .filter(teamMember -> !teamMember.isDeleted())
                .orElseThrow(() -> new NotFoundException("Miembro del equipo no encontrado"));

        boolean duplicate = repository.findByProjectIdAndDeleted(request.projectId(), "N").stream()
                .anyMatch(assignment -> assignment.getTeamMember().getId().equals(request.teamMemberId()));
        if (duplicate) {
            throw new BusinessException("La persona ya está asignada a este proyecto");
        }

        if (request.lead()) {
            clearLeadForProject(request.projectId());
        }

        ProjectAssignment assignment = new ProjectAssignment();
        assignment.setProject(project);
        assignment.setTeamMember(member);
        assignment.setRole(techRoleRepository.findByCode(request.roleCode())
                .orElseThrow(() -> new NotFoundException("Rol no encontrado")));
        assignment.setLead(request.lead() ? "Y" : "N");
        assignment.setValidFrom(LocalDateTime.now());
        return toResponse(repository.save(assignment));
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_assignments:delete')")
    public void remove(Long assignmentId) {
        ProjectAssignment assignment = repository.findById(assignmentId)
                .filter(item -> !item.isDeleted())
                .orElseThrow(() -> new NotFoundException("Asignación no encontrada"));
        assignment.markDeleted();
    }

    private void clearLeadForProject(Long projectId) {
        repository.findByProjectIdAndDeleted(projectId, "N").stream()
                .filter(assignment -> "Y".equals(assignment.getLead()))
                .forEach(assignment -> assignment.setLead("N"));
    }

    private ProjectAssignmentResponse toResponse(ProjectAssignment assignment) {
        return new ProjectAssignmentResponse(
                assignment.getId(),
                assignment.getLegacyId(),
                assignment.getProject().getId(),
                assignment.getProject().getName(),
                assignment.getTeamMember().getId(),
                assignment.getTeamMember().getName(),
                assignment.getRole().getCode(),
                assignment.getRole().getName(),
                "Y".equals(assignment.getLead())
        );
    }
}
