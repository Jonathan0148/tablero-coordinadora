package com.coltefinanciera.itdashboard.team.service;

import com.coltefinanciera.itdashboard.catalog.repository.TechRoleRepository;
import com.coltefinanciera.itdashboard.shared.exception.NotFoundException;
import com.coltefinanciera.itdashboard.team.dto.CreateTeamMemberRequest;
import com.coltefinanciera.itdashboard.team.dto.TeamMemberResponse;
import com.coltefinanciera.itdashboard.team.dto.UpdateTeamMemberRequest;
import com.coltefinanciera.itdashboard.team.entity.ProjectAssignment;
import com.coltefinanciera.itdashboard.team.entity.TeamMember;
import com.coltefinanciera.itdashboard.team.repository.ProjectAssignmentRepository;
import com.coltefinanciera.itdashboard.team.repository.TeamMemberRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class TeamMemberService {
    private final TeamMemberRepository repository;
    private final TechRoleRepository techRoleRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;

    public TeamMemberService(
            TeamMemberRepository repository,
            TechRoleRepository techRoleRepository,
            ProjectAssignmentRepository projectAssignmentRepository
    ) {
        this.repository = repository;
        this.techRoleRepository = techRoleRepository;
        this.projectAssignmentRepository = projectAssignmentRepository;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERM_teams:read')")
    public Page<TeamMemberResponse> findAll(Pageable pageable) {
        return repository.findByDeleted("N", pageable).map(this::toResponse);
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_teams:create')")
    public TeamMemberResponse create(CreateTeamMemberRequest request) {
        TeamMember member = new TeamMember();
        apply(member, request.name(), request.roleCode(), request.email(), request.active(), request.notes());
        return toResponse(repository.save(member));
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_teams:update')")
    public TeamMemberResponse update(Long id, UpdateTeamMemberRequest request) {
        TeamMember member = getActiveMember(id);
        apply(member, request.name(), request.roleCode(), request.email(), request.active(), request.notes());
        return toResponse(member);
    }

    @Transactional
    @PreAuthorize("hasAuthority('PERM_teams:delete')")
    public void delete(Long id) {
        TeamMember member = getActiveMember(id);
        member.markDeleted();
        projectAssignmentRepository.findByDeleted("N").stream()
                .filter(assignment -> assignment.getTeamMember().getId().equals(id))
                .forEach(ProjectAssignment::markDeleted);
    }

    private TeamMember getActiveMember(Long id) {
        return repository.findById(id)
                .filter(member -> !member.isDeleted())
                .orElseThrow(() -> new NotFoundException("Miembro del equipo no encontrado"));
    }

    private void apply(
            TeamMember member,
            String name,
            String roleCode,
            String email,
            boolean active,
            String notes
    ) {
        member.setName(name);
        member.setEmail(email);
        member.setActive(active ? "Y" : "N");
        member.setNotes(notes);
        if (StringUtils.hasText(roleCode)) {
            member.setDefaultRole(techRoleRepository.findByCode(roleCode)
                    .orElseThrow(() -> new NotFoundException("Rol no encontrado")));
        } else {
            member.setDefaultRole(null);
        }
    }

    private TeamMemberResponse toResponse(TeamMember member) {
        return new TeamMemberResponse(
                member.getId(),
                member.getLegacyId(),
                member.getName(),
                member.getDefaultRole() == null ? null : member.getDefaultRole().getCode(),
                member.getDefaultRole() == null ? null : member.getDefaultRole().getName(),
                member.getEmail(),
                "Y".equals(member.getActive()),
                member.getNotes()
        );
    }
}
