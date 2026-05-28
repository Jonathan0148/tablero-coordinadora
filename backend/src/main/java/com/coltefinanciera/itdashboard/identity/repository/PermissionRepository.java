package com.coltefinanciera.itdashboard.identity.repository;

import com.coltefinanciera.itdashboard.identity.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    List<Permission> findByDeletedOrderByModuleAscCodeAsc(String deleted);

    Optional<Permission> findByCodeAndDeleted(String code, String deleted);
}
