package com.coltefinanciera.itdashboard.okr.entity;

import com.coltefinanciera.itdashboard.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "okr")
public class Okr extends AuditableEntity {
    @Id
    @Column(name = "okr_id")
    private Long id;

    @Column(name = "legacy_id", length = 100)
    private String legacyId;

    @Column(name = "name", nullable = false, length = 1000)
    private String name;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @OneToMany(mappedBy = "okr")
    @OrderBy("sortOrder ASC")
    private List<OkrActivity> activities = new ArrayList<>();
}
