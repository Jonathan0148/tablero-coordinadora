package com.coltefinanciera.itdashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing(dateTimeProviderRef = "auditingDateTimeProvider")
@SpringBootApplication
public class ItDashboardApplication {

    public static void main(String[] args) {
        SpringApplication.run(ItDashboardApplication.class, args);
    }
}
