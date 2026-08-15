package com.reqsync.reqsync_backend.team.dto;

public class RequirementExperienceMatchResponse {

    private Long requirementId;

    private String requirementCode;

    private String requirementTitle;

    private String requirementDescription;

    private Double similarity;


    public RequirementExperienceMatchResponse() {
    }


    public RequirementExperienceMatchResponse(
            Long requirementId,
            String requirementCode,
            String requirementTitle,
            String requirementDescription,
            Double similarity
    ) {

        this.requirementId =
                requirementId;

        this.requirementCode =
                requirementCode;

        this.requirementTitle =
                requirementTitle;

        this.requirementDescription =
                requirementDescription;

        this.similarity =
                similarity;
    }


    public Long getRequirementId() {
        return requirementId;
    }


    public void setRequirementId(
            Long requirementId
    ) {
        this.requirementId =
                requirementId;
    }


    public String getRequirementCode() {
        return requirementCode;
    }


    public void setRequirementCode(
            String requirementCode
    ) {
        this.requirementCode =
                requirementCode;
    }


    public String getRequirementTitle() {
        return requirementTitle;
    }


    public void setRequirementTitle(
            String requirementTitle
    ) {
        this.requirementTitle =
                requirementTitle;
    }


    public String getRequirementDescription() {
        return requirementDescription;
    }


    public void setRequirementDescription(
            String requirementDescription
    ) {
        this.requirementDescription =
                requirementDescription;
    }


    public Double getSimilarity() {
        return similarity;
    }


    public void setSimilarity(
            Double similarity
    ) {
        this.similarity =
                similarity;
    }
}