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
@Table(name = "tech_role")
public class TechRole extends BaseCatalogEntity {
    @Id
    @Column(name = "tech_role_id")
    private Long id;
}
