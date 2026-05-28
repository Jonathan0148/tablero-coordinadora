package com.coltefinanciera.itdashboard.portfolio.entity;

import com.coltefinanciera.itdashboard.catalog.entity.PipelineStatus;
import com.coltefinanciera.itdashboard.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "project")
public class Project extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_project_gen")
    @SequenceGenerator(name = "seq_project_gen", sequenceName = "seq_project", allocationSize = 1)
    @Column(name = "project_id")
    private Long id;

    @Column(name = "legacy_id", length = 100)
    private String legacyId;

    @Column(name = "name", nullable = false, length = 250)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pipeline_status_id")
    private PipelineStatus pipelineStatus;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "legacy_updated_at")
    private OffsetDateTime legacyUpdatedAt;

    @Column(name = "is_ghost", nullable = false, columnDefinition = "CHAR(1)")
    private String ghost = "N";
}
