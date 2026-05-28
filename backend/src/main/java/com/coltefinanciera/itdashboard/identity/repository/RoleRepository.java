package com.coltefinanciera.itdashboard.identity.repository;

import com.coltefinanciera.itdashboard.identity.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Page<Role> findByDeleted(String deleted, Pageable pageable);

    List<Role> findByDeletedAndActive(String deleted, String active);

    Optional<Role> findByCodeAndDeleted(String code, String deleted);

    Optional<Role> findByIdAndDeleted(Long id, String deleted);
}
