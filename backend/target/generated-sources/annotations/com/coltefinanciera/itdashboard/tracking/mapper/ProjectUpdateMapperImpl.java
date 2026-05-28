package com.coltefinanciera.itdashboard.tracking.mapper;

import com.coltefinanciera.itdashboard.catalog.entity.ExecutiveStatus;
import com.coltefinanciera.itdashboard.catalog.entity.ResponsibleArea;
import com.coltefinanciera.itdashboard.catalog.entity.StopperImpact;
import com.coltefinanciera.itdashboard.catalog.entity.TrafficLight;
import com.coltefinanciera.itdashboard.portfolio.entity.Project;
import com.coltefinanciera.itdashboard.tracking.dto.ProjectUpdateResponse;
import com.coltefinanciera.itdashboard.tracking.entity.ProjectUpdate;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-28T13:34:27-0500",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class ProjectUpdateMapperImpl implements ProjectUpdateMapper {

    @Override
    public ProjectUpdateResponse toResponse(ProjectUpdate entity) {
        if ( entity == null ) {
            return null;
        }

        Long projectId = null;
        String executiveStatusCode = null;
        String executiveStatusName = null;
        String trafficLightCode = null;
        String trafficLightName = null;
        String stopperImpactCode = null;
        String responsibleAreaCode = null;
        Long id = null;
        String legacyId = null;
        OffsetDateTime updatedAtOriginal = null;
        String summary = null;
        String pendingItems = null;
        String stopperDesc = null;
        String stopperOwner = null;
        String relevantRisks = null;
        String nextMilestone = null;
        LocalDate nextMilestoneDate = null;
        String pendingDecisions = null;
        String coordinationDesc = null;
        String responsibleAction = null;
        String additionalNotes = null;

        projectId = entityProjectId( entity );
        executiveStatusCode = entityExecutiveStatusCode( entity );
        executiveStatusName = entityExecutiveStatusName( entity );
        trafficLightCode = entityTrafficLightCode( entity );
        trafficLightName = entityTrafficLightName( entity );
        stopperImpactCode = entityStopperImpactCode( entity );
        responsibleAreaCode = entityResponsibleAreaCode( entity );
        id = entity.getId();
        legacyId = entity.getLegacyId();
        updatedAtOriginal = entity.getUpdatedAtOriginal();
        summary = entity.getSummary();
        pendingItems = entity.getPendingItems();
        stopperDesc = entity.getStopperDesc();
        stopperOwner = entity.getStopperOwner();
        relevantRisks = entity.getRelevantRisks();
        nextMilestone = entity.getNextMilestone();
        nextMilestoneDate = entity.getNextMilestoneDate();
        pendingDecisions = entity.getPendingDecisions();
        coordinationDesc = entity.getCoordinationDesc();
        responsibleAction = entity.getResponsibleAction();
        additionalNotes = entity.getAdditionalNotes();

        boolean hasStopper = "Y".equals(entity.getHasStopper());
        boolean requiresCoordination = "Y".equals(entity.getRequiresCoordination());

        ProjectUpdateResponse projectUpdateResponse = new ProjectUpdateResponse( id, legacyId, projectId, updatedAtOriginal, executiveStatusCode, executiveStatusName, trafficLightCode, trafficLightName, summary, pendingItems, hasStopper, stopperDesc, stopperOwner, stopperImpactCode, relevantRisks, nextMilestone, nextMilestoneDate, pendingDecisions, requiresCoordination, coordinationDesc, responsibleAreaCode, responsibleAction, additionalNotes );

        return projectUpdateResponse;
    }

    private Long entityProjectId(ProjectUpdate projectUpdate) {
        Project project = projectUpdate.getProject();
        if ( project == null ) {
            return null;
        }
        return project.getId();
    }

    private String entityExecutiveStatusCode(ProjectUpdate projectUpdate) {
        ExecutiveStatus executiveStatus = projectUpdate.getExecutiveStatus();
        if ( executiveStatus == null ) {
            return null;
        }
        return executiveStatus.getCode();
    }

    private String entityExecutiveStatusName(ProjectUpdate projectUpdate) {
        ExecutiveStatus executiveStatus = projectUpdate.getExecutiveStatus();
        if ( executiveStatus == null ) {
            return null;
        }
        return executiveStatus.getName();
    }

    private String entityTrafficLightCode(ProjectUpdate projectUpdate) {
        TrafficLight trafficLight = projectUpdate.getTrafficLight();
        if ( trafficLight == null ) {
            return null;
        }
        return trafficLight.getCode();
    }

    private String entityTrafficLightName(ProjectUpdate projectUpdate) {
        TrafficLight trafficLight = projectUpdate.getTrafficLight();
        if ( trafficLight == null ) {
            return null;
        }
        return trafficLight.getName();
    }

    private String entityStopperImpactCode(ProjectUpdate projectUpdate) {
        StopperImpact stopperImpact = projectUpdate.getStopperImpact();
        if ( stopperImpact == null ) {
            return null;
        }
        return stopperImpact.getCode();
    }

    private String entityResponsibleAreaCode(ProjectUpdate projectUpdate) {
        ResponsibleArea responsibleArea = projectUpdate.getResponsibleArea();
        if ( responsibleArea == null ) {
            return null;
        }
        return responsibleArea.getCode();
    }
}
