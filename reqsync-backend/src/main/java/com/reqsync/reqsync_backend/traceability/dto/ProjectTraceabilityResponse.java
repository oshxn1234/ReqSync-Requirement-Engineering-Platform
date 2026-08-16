package com.reqsync.reqsync_backend.traceability.dto;

import java.util.List;

public class ProjectTraceabilityResponse {

    private Long projectId;

    private Integer projectNumber;

    private String projectName;

    private Integer totalRequirements;

    private Integer approvedRequirements;

    private Integer tracedRequirements;

    private List<RequirementTraceabilityResponse> requirements;


    public ProjectTraceabilityResponse(
            Long projectId,
            Integer projectNumber,
            String projectName,
            Integer totalRequirements,
            Integer approvedRequirements,
            Integer tracedRequirements,
            List<RequirementTraceabilityResponse> requirements
    ) {

        this.projectId = projectId;
        this.projectNumber = projectNumber;
        this.projectName = projectName;
        this.totalRequirements = totalRequirements;
        this.approvedRequirements = approvedRequirements;
        this.tracedRequirements = tracedRequirements;
        this.requirements = requirements;
    }


    public Long getProjectId() {
        return projectId;
    }


    public Integer getProjectNumber() {
        return projectNumber;
    }


    public String getProjectName() {
        return projectName;
    }


    public Integer getTotalRequirements() {
        return totalRequirements;
    }


    public Integer getApprovedRequirements() {
        return approvedRequirements;
    }


    public Integer getTracedRequirements() {
        return tracedRequirements;
    }


    public List<RequirementTraceabilityResponse> getRequirements() {
        return requirements;
    }
}