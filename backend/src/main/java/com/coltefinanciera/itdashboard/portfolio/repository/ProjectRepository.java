package com.coltefinanciera.itdashboard.portfolio.repository;

import com.coltefinanciera.itdashboard.portfolio.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {

    Page<Project> findByDeleted(String deleted, Pageable pageable);

    List<Project> findByDeleted(String deleted);
}
