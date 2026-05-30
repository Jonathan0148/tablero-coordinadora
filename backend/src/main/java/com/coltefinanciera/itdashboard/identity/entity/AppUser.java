package com.coltefinanciera.itdashboard.identity.entity;

import com.coltefinanciera.itdashboard.shared.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
@Entity
@Table(name = "app_user")
public class AppUser extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    private LocalDateTime lastLoginAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<UserRole> userRoles = new HashSet<>();

    public Set<Role> getRoles() {
        return userRoles.stream()
                .filter(link -> !link.isDeleted())
                .map(UserRole::getRole)
                .filter(role -> role != null && !role.isDeleted())
                .collect(Collectors.toCollection(HashSet::new));
    }

    public void setRoles(Set<Role> roles) {
        userRoles.clear();
        if (roles == null || roles.isEmpty()) {
            return;
        }
        for (Role role : roles) {
            UserRole link = new UserRole();
            link.setUser(this);
            link.setRole(role);
            userRoles.add(link);
        }
    }

    public boolean isActive() {
        return "Y".equals(active) && !isDeleted();
    }
}
