package com.coltefinanciera.itdashboard.shared.audit;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.domain.AuditorAware;

import java.time.LocalDateTime;
import java.util.Optional;

@Configuration
public class AuditorConfig {

    @Bean
    AuditorAware<String> auditorAware() {
        // created_by/updated_by are assigned by Oracle session audit triggers.
        return Optional::empty;
    }

    @Bean
    DateTimeProvider auditingDateTimeProvider() {
        return () -> Optional.of(LocalDateTime.now());
    }
}
