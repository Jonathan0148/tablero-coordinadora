package com.coltefinanciera.itdashboard.identity.repository;

import com.coltefinanciera.itdashboard.identity.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsernameAndDeleted(String username, String deleted);
}
