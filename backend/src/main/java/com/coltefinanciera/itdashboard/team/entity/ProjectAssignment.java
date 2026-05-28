package com.coltefinanciera.itdashboard.team.entity;

import com.coltefinanciera.itdashboard.catalog.entity.TechRole;
import com.coltefinanciera.itdashboard.portfolio.entity.Project;
import com.coltefinanciera.itdashboard.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "project_assignment")
public class ProjectAssignment extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_project_assignment_gen")
    @SequenceGenerator(name = "seq_project_assignment_gen", sequenceName = "seq_project_assignment", allocationSize = 1)
    @Column(name = "project_assignment_id")
    private Long id;

    @Column(name = "legacy_id", length = 100)
    private String legacyId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_member_id")
    private TeamMember teamMember;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id")
    private TechRole role;

    @Column(name = "is_lead", nullable = false, columnDefinition = "CHAR(1)")
    private String lead = "N";

    @Column(name = "valid_from")
    private OffsetDateTime validFrom;

    @Column(name = "valid_to")
    private OffsetDateTime validTo;
}
