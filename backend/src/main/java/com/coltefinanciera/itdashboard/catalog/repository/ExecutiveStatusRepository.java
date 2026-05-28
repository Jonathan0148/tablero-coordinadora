package com.coltefinanciera.itdashboard.catalog.repository;

import com.coltefinanciera.itdashboard.catalog.entity.ExecutiveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExecutiveStatusRepository extends JpaRepository<ExecutiveStatus, Long> {
    Optional<ExecutiveStatus> findByCode(String code);
}
