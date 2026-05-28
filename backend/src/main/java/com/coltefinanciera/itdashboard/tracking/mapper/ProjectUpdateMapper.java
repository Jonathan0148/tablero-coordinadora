package com.coltefinanciera.itdashboard.tracking.mapper;

import com.coltefinanciera.itdashboard.tracking.dto.ProjectUpdateResponse;
import com.coltefinanciera.itdashboard.tracking.entity.ProjectUpdate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProjectUpdateMapper {

    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "executiveStatusCode", source = "executiveStatus.code")
    @Mapping(target = "executiveStatusName", source = "executiveStatus.name")
    @Mapping(target = "trafficLightCode", source = "trafficLight.code")
    @Mapping(target = "trafficLightName", source = "trafficLight.name")
    @Mapping(target = "hasStopper", expression = "java(\"Y\".equals(entity.getHasStopper()))")
    @Mapping(target = "stopperImpactCode", source = "stopperImpact.code")
    @Mapping(target = "requiresCoordination", expression = "java(\"Y\".equals(entity.getRequiresCoordination()))")
    @Mapping(target = "responsibleAreaCode", source = "responsibleArea.code")
    ProjectUpdateResponse toResponse(ProjectUpdate entity);
}
