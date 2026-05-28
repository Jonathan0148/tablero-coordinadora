package com.coltefinanciera.itdashboard.identity.entity;

import com.coltefinanciera.itdashboard.shared.audit.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "permission")
public class Permission extends AuditableEntity {

    @Id
    @Column(name = "permission_id")
    private Long id;

    @Column(name = "code", nullable = false, length = 100)
    private String code;

    @Column(name = "module", nullable = false, length = 60)
    private String module;

    @Column(name = "action", nullable = false, length = 60)
    private String action;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "active", nullable = false, columnDefinition = "CHAR(1)")
    private String active = "Y";
}
