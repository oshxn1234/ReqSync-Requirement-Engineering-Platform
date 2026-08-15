package com.reqsync.reqsync_backend.requirement.dto;

import com.reqsync.reqsync_backend.requirement.enums.CompletenessStatus;

import java.util.List;

public class RequirementCompletenessResponse {

    private Long requirementId;

    private String requirementCode;

    private int completenessScore;

    private CompletenessStatus status;

    private List<CompletenessCriterionResponse>
            criteria;

    private List<CoverageCheckResponse>
            coverageChecks;

    private List<String>
            confirmedMissing;

    private List<String>
            suggestions;


    public RequirementCompletenessResponse() {
    }


    public RequirementCompletenessResponse(
            Long requirementId,
            String requirementCode,
            int completenessScore,
            CompletenessStatus status,
            List<CompletenessCriterionResponse> criteria,
            List<CoverageCheckResponse> coverageChecks,
            List<String> confirmedMissing,
            List<String> suggestions
    ) {

        this.requirementId =
                requirementId;

        this.requirementCode =
                requirementCode;

        this.completenessScore =
                completenessScore;

        this.status =
                status;

        this.criteria =
                criteria;

        this.coverageChecks =
                coverageChecks;

        this.confirmedMissing =
                confirmedMissing;

        this.suggestions =
                suggestions;
    }


    public Long getRequirementId() {
        return requirementId;
    }


    public void setRequirementId(
            Long requirementId
    ) {
        this.requirementId = requirementId;
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


    public int getCompletenessScore() {
        return completenessScore;
    }


    public void setCompletenessScore(
            int completenessScore
    ) {
        this.completenessScore =
                completenessScore;
    }


    public CompletenessStatus getStatus() {
        return status;
    }


    public void setStatus(
            CompletenessStatus status
    ) {
        this.status = status;
    }


    public List<CompletenessCriterionResponse>
    getCriteria() {

        return criteria;
    }


    public void setCriteria(
            List<CompletenessCriterionResponse> criteria
    ) {
        this.criteria = criteria;
    }


    public List<CoverageCheckResponse>
    getCoverageChecks() {

        return coverageChecks;
    }


    public void setCoverageChecks(
            List<CoverageCheckResponse> coverageChecks
    ) {
        this.coverageChecks = coverageChecks;
    }


    public List<String> getConfirmedMissing() {
        return confirmedMissing;
    }


    public void setConfirmedMissing(
            List<String> confirmedMissing
    ) {
        this.confirmedMissing =
                confirmedMissing;
    }


    public List<String> getSuggestions() {
        return suggestions;
    }


    public void setSuggestions(
            List<String> suggestions
    ) {
        this.suggestions = suggestions;
    }
}