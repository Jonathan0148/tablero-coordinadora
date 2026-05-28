package com.coltefinanciera.itdashboard.catalog.repository;

import com.coltefinanciera.itdashboard.catalog.entity.PipelineStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PipelineStatusRepository extends JpaRepository<PipelineStatus, Long> {
    Optional<PipelineStatus> findByCode(String code);
}
