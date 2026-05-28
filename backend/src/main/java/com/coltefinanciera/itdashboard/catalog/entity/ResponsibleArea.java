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
@Table(name = "responsible_area")
public class ResponsibleArea extends BaseCatalogEntity {
    @Id
    @Column(name = "responsible_area_id")
    private Long id;
}
