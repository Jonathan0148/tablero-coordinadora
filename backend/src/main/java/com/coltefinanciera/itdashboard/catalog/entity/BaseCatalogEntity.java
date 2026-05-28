package com.coltefinanciera.itdashboard.catalog.entity;

import com.coltefinanciera.itdashboard.shared.audit.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public abstract class BaseCatalogEntity extends AuditableEntity {

    @Column(name = "code", nullable = false, length = 60)
    private String code;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "active", nullable = false, columnDefinition = "CHAR(1)")
    private String active = "Y";
}
