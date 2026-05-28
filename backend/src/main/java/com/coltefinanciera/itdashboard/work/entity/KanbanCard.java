package com.coltefinanciera.itdashboard.work.entity;

import com.coltefinanciera.itdashboard.catalog.entity.KanbanStatus;
import com.coltefinanciera.itdashboard.catalog.entity.PriorityLevel;
import com.coltefinanciera.itdashboard.catalog.entity.WorkArea;
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
@Table(name = "kanban_card")
public class KanbanCard extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_kanban_card_gen")
    @SequenceGenerator(name = "seq_kanban_card_gen", sequenceName = "seq_kanban_card", allocationSize = 1)
    @Column(name = "kanban_card_id")
    private Long id;

    @Column(name = "legacy_id", length = 100)
    private String legacyId;

    @Lob
    @Column(name = "text", nullable = false)
    private String text;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_area_id")
    private WorkArea workArea;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "priority_level_id")
    private PriorityLevel priorityLevel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kanban_status_id")
    private KanbanStatus kanbanStatus;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "reminder_at")
    private OffsetDateTime reminderAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "created_at_original")
    private OffsetDateTime createdAtOriginal;
}
