package com.coltefinanciera.itdashboard.catalog.repository;

import com.coltefinanciera.itdashboard.catalog.entity.TrafficLight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrafficLightRepository extends JpaRepository<TrafficLight, Long> {
    Optional<TrafficLight> findByCode(String code);
}
