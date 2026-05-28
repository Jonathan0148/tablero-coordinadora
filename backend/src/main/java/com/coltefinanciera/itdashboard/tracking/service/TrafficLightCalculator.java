package com.coltefinanciera.itdashboard.tracking.service;

import com.coltefinanciera.itdashboard.tracking.dto.CreateProjectUpdateRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Set;

@Component
public class TrafficLightCalculator {

    public String calculate(CreateProjectUpdateRequest request) {
        if (request.requiresCoordination()) {
            return "ROJO";
        }
        if ("BLOQUEADO".equals(request.executiveStatusCode())) {
            return "ROJO";
        }
        if (request.hasStopper() && Set.of("ALTO", "CRITICO").contains(request.stopperImpactCode())) {
            return "ROJO";
        }
        if (Set.of("EN_RIESGO", "REQUIERE_DECISION").contains(request.executiveStatusCode())) {
            return "AMARILLO";
        }
        if (request.hasStopper() && Set.of("BAJO", "MEDIO").contains(request.stopperImpactCode())) {
            return "AMARILLO";
        }
        if (StringUtils.hasText(request.relevantRisks()) && "EN_CURSO".equals(request.executiveStatusCode())) {
            return "AMARILLO";
        }
        if (Set.of("EN_CURSO", "COMPLETADO").contains(request.executiveStatusCode())) {
            return "VERDE";
        }
        return "GRIS";
    }
}
