package com.coltefinanciera.itdashboard.okr.entity;

import com.coltefinanciera.itdashboard.catalog.entity.OkrActivityStatus;
import com.coltefinanciera.itdashboard.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "okr_activity")
public class OkrActivity extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "okr_activity_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "okr_id")
    private Okr okr;

    @Column(name = "legacy_id", length = 100)
    private String legacyId;

    @Column(name = "pct", nullable = false)
    private BigDecimal pct;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "status_id")
    private OkrActivityStatus status;

    @Lob
    @Column(name = "text", nullable = false)
    private String text;

    @Column(name = "responsible", length = 250)
    private String responsible;

    @Column(name = "dependency", length = 500)
    private String dependency;

    @Lob
    @Column(name = "deliverable")
    private String deliverable;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
}
