package com.coltefinanciera.itdashboard.team.repository;

import com.coltefinanciera.itdashboard.team.entity.TeamMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    Page<TeamMember> findByDeleted(String deleted, Pageable pageable);
}
