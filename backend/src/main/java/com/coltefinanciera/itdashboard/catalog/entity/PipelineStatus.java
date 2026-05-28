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
@Table(name = "pipeline_status")
public class PipelineStatus extends BaseCatalogEntity {
    @Id
    @Column(name = "pipeline_status_id")
    private Long id;
}
