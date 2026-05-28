package com.coltefinanciera.itdashboard.catalog.repository;

import com.coltefinanciera.itdashboard.catalog.entity.TechRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TechRoleRepository extends JpaRepository<TechRole, Long> {
    Optional<TechRole> findByCode(String code);
}
