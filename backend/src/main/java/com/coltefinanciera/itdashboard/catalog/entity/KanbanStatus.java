package com.coltefinanciera.itdashboard.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "kanban_status")
public class KanbanStatus extends BaseCatalogEntity {
    @Id
    @Column(name = "kanban_status_id")
    private Long id;

    @Column(name = "legacy_code", nullable = false, length = 30)
    private String legacyCode;
}
