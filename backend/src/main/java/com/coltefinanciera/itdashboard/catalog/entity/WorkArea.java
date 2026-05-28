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
@Table(name = "work_area")
public class WorkArea extends BaseCatalogEntity {
    @Id
    @Column(name = "work_area_id")
    private Long id;

    @Column(name = "legacy_code", nullable = false, length = 30)
    private String legacyCode;
}
