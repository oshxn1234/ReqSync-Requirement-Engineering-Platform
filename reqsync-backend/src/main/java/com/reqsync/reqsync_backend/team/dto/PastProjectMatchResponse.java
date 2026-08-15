package com.reqsync.reqsync_backend.team.dto;

import java.util.List;

public class PastProjectMatchResponse {

    private Long projectId;

    private Integer projectNumber;

    private String projectName;

    private Double relevanceScore;

    private List<RequirementExperienceMatchResponse>
            requirementMatches;


    public PastProjectMatchResponse() {
    }


    public PastProjectMatchResponse(
            Long projectId,
            Integer projectNumber,
            String projectName,
            Double relevanceScore,
            List<RequirementExperienceMatchResponse>
                    requirementMatches
    ) {

        this.projectId =
                projectId;

        this.projectNumber =
                projectNumber;

        this.projectName =
                projectName;

        this.relevanceScore =
                relevanceScore;

        this.requirementMatches =
                requirementMatches;
    }


    public Long getProjectId() {
        return projectId;
    }


    public void setProjectId(
            Long projectId
    ) {
        this.projectId =
                projectId;
    }


    public Integer getProjectNumber() {
        return projectNumber;
    }


    public void setProjectNumber(
            Integer projectNumber
    ) {
        this.projectNumber =
                projectNumber;
    }


    public String getProjectName() {
        return projectName;
    }


    public void setProjectName(
            String projectName
    ) {
        this.projectName =
                projectName;
    }


    public Double getRelevanceScore() {
        return relevanceScore;
    }


    public void setRelevanceScore(
            Double relevanceScore
    ) {
        this.relevanceScore =
                relevanceScore;
    }


    public List<RequirementExperienceMatchResponse>
    getRequirementMatches() {
        return requirementMatches;
    }


    public void setRequirementMatches(
            List<RequirementExperienceMatchResponse>
                    requirementMatches
    ) {
        this.requirementMatches =
                requirementMatches;
    }
}