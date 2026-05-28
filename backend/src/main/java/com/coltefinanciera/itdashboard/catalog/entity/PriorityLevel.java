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
@Table(name = "priority_level")
public class PriorityLevel extends BaseCatalogEntity {
    @Id
    @Column(name = "priority_level_id")
    private Long id;

    @Column(name = "legacy_code", nullable = false, length = 30)
    private String legacyCode;
}
