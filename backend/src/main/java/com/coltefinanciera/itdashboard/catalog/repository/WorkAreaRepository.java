package com.coltefinanciera.itdashboard.catalog.repository;

import com.coltefinanciera.itdashboard.catalog.entity.WorkArea;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkAreaRepository extends JpaRepository<WorkArea, Long> {
    Optional<WorkArea> findByCode(String code);
    Optional<WorkArea> findByLegacyCode(String legacyCode);
}
