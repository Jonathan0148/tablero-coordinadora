package com.coltefinanciera.itdashboard.logbook.entity;

import com.coltefinanciera.itdashboard.catalog.entity.WorkArea;
import com.coltefinanciera.itdashboard.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "activity_log")
public class ActivityLog extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_activity_log_gen")
    @SequenceGenerator(name = "seq_activity_log_gen", sequenceName = "seq_activity_log", allocationSize = 1)
    @Column(name = "activity_log_id")
    private Long id;

    @Column(name = "legacy_id", length = 100)
    private String legacyId;

    @Lob
    @Column(name = "text", nullable = false)
    private String text;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_area_id")
    private WorkArea workArea;

    @Column(name = "logged_at_original", nullable = false)
    private OffsetDateTime loggedAtOriginal;
}
