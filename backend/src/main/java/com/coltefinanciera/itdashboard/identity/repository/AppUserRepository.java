package com.coltefinanciera.itdashboard.identity.repository;

import com.coltefinanciera.itdashboard.identity.entity.AppUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsernameAndDeleted(String username, String deleted);

    Optional<AppUser> findByEmailAndDeleted(String email, String deleted);

    Optional<AppUser> findByIdAndDeleted(Long id, String deleted);

    Page<AppUser> findByDeleted(String deleted, Pageable pageable);

    @Query("""
            SELECT u FROM AppUser u
            WHERE u.deleted = 'N'
              AND (
                LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<AppUser> searchActive(@Param("search") String search, Pageable pageable);
}
