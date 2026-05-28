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
@Table(name = "okr_activity_status")
public class OkrActivityStatus extends BaseCatalogEntity {
    @Id
    @Column(name = "okr_activity_status_id")
    private Long id;
}
