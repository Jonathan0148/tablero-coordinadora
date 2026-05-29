package com.coltefinanciera.itdashboard.identity.entity;

import com.coltefinanciera.itdashboard.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
@Entity
@Table(name = "role")
public class Role extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_role_gen")
    @SequenceGenerator(name = "seq_role_gen", sequenceName = "seq_role", allocationSize = 1)
    @Column(name = "role_id")
    private Long id;

    @Column(name = "code", nullable = false, length = 60)
    private String code;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "active", nullable = false, columnDefinition = "CHAR(1)")
    private String active = "Y";

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<RolePermission> rolePermissions = new HashSet<>();

    public Set<Permission> getPermissions() {
        return rolePermissions.stream()
                .filter(link -> !link.isDeleted())
                .map(RolePermission::getPermission)
                .filter(permission -> permission != null && !permission.isDeleted())
                .collect(Collectors.toCollection(HashSet::new));
    }

    public void setPermissions(Set<Permission> permissions) {
        rolePermissions.clear();
        if (permissions == null || permissions.isEmpty()) {
            return;
        }
        for (Permission permission : permissions) {
            RolePermission link = new RolePermission();
            link.setRole(this);
            link.setPermission(permission);
            rolePermissions.add(link);
        }
    }
}
