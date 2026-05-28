package com.coltefinanciera.itdashboard.tracking.entity;

import com.coltefinanciera.itdashboard.catalog.entity.ExecutiveStatus;
import com.coltefinanciera.itdashboard.catalog.entity.ResponsibleArea;
import com.coltefinanciera.itdashboard.catalog.entity.StopperImpact;
import com.coltefinanciera.itdashboard.catalog.entity.TrafficLight;
import com.coltefinanciera.itdashboard.portfolio.entity.Project;
import com.coltefinanciera.itdashboard.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "project_update")
public class ProjectUpdate extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_project_update_gen")
    @SequenceGenerator(name = "seq_project_update_gen", sequenceName = "seq_project_update", allocationSize = 1)
    @Column(name = "project_update_id")
    private Long id;

    @Column(name = "legacy_id", length = 100)
    private String legacyId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "updated_at_original", nullable = false)
    private OffsetDateTime updatedAtOriginal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "executive_status_id")
    private ExecutiveStatus executiveStatus;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "traffic_light_id")
    private TrafficLight trafficLight;

    @Lob
    @Column(name = "summary", nullable = false)
    private String summary;

    @Lob
    @Column(name = "pending_items")
    private String pendingItems;

    @Column(name = "has_stopper", nullable = false, columnDefinition = "CHAR(1)")
    private String hasStopper = "N";

    @Lob
    @Column(name = "stopper_desc")
    private String stopperDesc;

    @Column(name = "stopper_owner", length = 250)
    private String stopperOwner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stopper_impact_id")
    private StopperImpact stopperImpact;

    @Lob
    @Column(name = "relevant_risks")
    private String relevantRisks;

    @Column(name = "next_milestone", length = 500)
    private String nextMilestone;

    @Column(name = "next_milestone_date")
    private LocalDate nextMilestoneDate;

    @Lob
    @Column(name = "pending_decisions")
    private String pendingDecisions;

    @Column(name = "requires_coordination", nullable = false, columnDefinition = "CHAR(1)")
    private String requiresCoordination = "N";

    @Lob
    @Column(name = "coordination_desc")
    private String coordinationDesc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsible_area_id")
    private ResponsibleArea responsibleArea;

    @Lob
    @Column(name = "responsible_action")
    private String responsibleAction;

    @Lob
    @Column(name = "additional_notes")
    private String additionalNotes;
}
