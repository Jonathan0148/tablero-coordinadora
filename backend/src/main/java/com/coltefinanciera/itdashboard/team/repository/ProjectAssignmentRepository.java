package com.coltefinanciera.itdashboard.team.repository;

import com.coltefinanciera.itdashboard.team.entity.ProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, Long> {

    List<ProjectAssignment> findByProjectIdAndDeleted(Long projectId, String deleted);

    List<ProjectAssignment> findByDeleted(String deleted);

    List<ProjectAssignment> findByProjectIdInAndLeadAndDeleted(List<Long> projectIds, String lead, String deleted);

    @Query("""
            select pa.project.id, count(pa)
            from ProjectAssignment pa
            where pa.deleted = 'N'
              and pa.project.id in :projectIds
            group by pa.project.id
            """)
    List<Object[]> countByProjectIds(List<Long> projectIds);

    @Query("""
            select pa.teamMember.id, count(pa)
            from ProjectAssignment pa
            where pa.deleted = 'N'
              and pa.teamMember.active = 'Y'
              and pa.teamMember.deleted = 'N'
            group by pa.teamMember.id
            """)
    List<Object[]> countActiveMemberAssignments();
}
