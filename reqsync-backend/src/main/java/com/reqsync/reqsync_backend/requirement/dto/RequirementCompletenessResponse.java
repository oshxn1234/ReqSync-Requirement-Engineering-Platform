package com.reqsync.reqsync_backend.requirement.dto;

import com.reqsync.reqsync_backend.requirement.enums.CompletenessStatus;

import java.util.List;

public class RequirementCompletenessResponse {

    private Long requirementId;

    private String requirementCode;

    private int completenessScore;

    private CompletenessStatus status;

    private List<CompletenessCriterionResponse> criteria;

    private List<CoverageCheckResponse> coverageResults;

    private List<String> missingRequirements;

    private List<String> suggestions;

    public RequirementCompletenessResponse(
            Long requirementId,
            String requirementCode,
            int completenessScore,
            CompletenessStatus status,
            List<CompletenessCriterionResponse> criteria,
            List<CoverageCheckResponse> coverageResults,
            List<String> missingRequirements,
            List<String> suggestions
    ) {

        this.requirementId = requirementId;
        this.requirementCode = requirementCode;
        this.completenessScore = completenessScore;
        this.status = status;
        this.criteria = criteria;
        this.coverageResults = coverageResults;
        this.missingRequirements = missingRequirements;
        this.suggestions = suggestions;
    }

    public Long getRequirementId() {
        return requirementId;
    }

    public String getRequirementCode() {
        return requirementCode;
    }

    public int getCompletenessScore() {
        return completenessScore;
    }

    public CompletenessStatus getStatus() {
        return status;
    }

    public List<CompletenessCriterionResponse> getCriteria() {
        return criteria;
    }

    public List<CoverageCheckResponse> getCoverageResults() {
        return coverageResults;
    }

    public List<String> getMissingRequirements() {
        return missingRequirements;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }
}