package com.coltefinanciera.itdashboard.team.entity;

import com.coltefinanciera.itdashboard.catalog.entity.TechRole;
import com.coltefinanciera.itdashboard.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "team_member")
public class TeamMember extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_team_member_gen")
    @SequenceGenerator(name = "seq_team_member_gen", sequenceName = "seq_team_member", allocationSize = 1)
    @Column(name = "team_member_id")
    private Long id;

    @Column(name = "legacy_id", length = 100)
    private String legacyId;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_role_id")
    private TechRole defaultRole;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "active", nullable = false, columnDefinition = "CHAR(1)")
    private String active = "Y";

    @Lob
    @Column(name = "notes")
    private String notes;
}
