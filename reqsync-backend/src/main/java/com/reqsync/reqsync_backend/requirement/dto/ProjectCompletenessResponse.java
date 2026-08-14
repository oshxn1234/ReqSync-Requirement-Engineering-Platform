package com.reqsync.reqsync_backend.requirement.dto;

import com.reqsync.reqsync_backend.requirement.enums.CompletenessStatus;

import java.util.List;

public class ProjectCompletenessResponse {

    private Long projectId;

    private int requirementCount;

    private int completenessScore;

    private CompletenessStatus status;

    private List<CompletenessCriterionResponse> criteria;

    private List<CoverageCheckResponse> coverageResults;

    private List<String> missingRequirements;

    private List<String> suggestions;

    public ProjectCompletenessResponse(
            Long projectId,
            int requirementCount,
            int completenessScore,
            CompletenessStatus status,
            List<CompletenessCriterionResponse> criteria,
            List<CoverageCheckResponse> coverageResults,
            List<String> missingRequirements,
            List<String> suggestions
    ) {

        this.projectId = projectId;
        this.requirementCount = requirementCount;
        this.completenessScore = completenessScore;
        this.status = status;
        this.criteria = criteria;
        this.coverageResults = coverageResults;
        this.missingRequirements = missingRequirements;
        this.suggestions = suggestions;
    }

    public Long getProjectId() {
        return projectId;
    }

    public int getRequirementCount() {
        return requirementCount;
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