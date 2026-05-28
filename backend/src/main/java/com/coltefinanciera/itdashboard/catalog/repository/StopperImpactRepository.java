package com.coltefinanciera.itdashboard.catalog.repository;

import com.coltefinanciera.itdashboard.catalog.entity.StopperImpact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StopperImpactRepository extends JpaRepository<StopperImpact, Long> {
    Optional<StopperImpact> findByCode(String code);
}
