package com.coltefinanciera.itdashboard.okr.repository;

import com.coltefinanciera.itdashboard.okr.entity.OkrActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OkrActivityRepository extends JpaRepository<OkrActivity, Long> {
    Optional<OkrActivity> findByIdAndDeleted(Long id, String deleted);
}
