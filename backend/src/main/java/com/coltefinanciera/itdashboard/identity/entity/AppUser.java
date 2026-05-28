package com.coltefinanciera.itdashboard.identity.entity;

import com.coltefinanciera.itdashboard.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "app_user")
public class AppUser extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_app_user_gen")
    @SequenceGenerator(name = "seq_app_user_gen", sequenceName = "seq_app_user", allocationSize = 1)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "username", nullable = false, length = 80)
    private String username;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(name = "active", nullable = false, columnDefinition = "CHAR(1)")
    private String active = "Y";

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    public boolean isActive() {
        return "Y".equals(active) && !isDeleted();
    }
}
