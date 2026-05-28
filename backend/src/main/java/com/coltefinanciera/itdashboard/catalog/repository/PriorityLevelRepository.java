package com.coltefinanciera.itdashboard.catalog.repository;

import com.coltefinanciera.itdashboard.catalog.entity.PriorityLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PriorityLevelRepository extends JpaRepository<PriorityLevel, Long> {
    Optional<PriorityLevel> findByCode(String code);
}
