package com.reqsync.reqsync_backend.requirement.dto;

import java.util.List;

public class InitialCompletenessResult {

    private List<CompletenessCriterionResponse> criteria;

    private List<PotentialGapResponse> potentialGaps;

    private List<String> suggestions;

    public InitialCompletenessResult() {
    }

    public List<CompletenessCriterionResponse> getCriteria() {
        return criteria == null
                ? List.of()
                : criteria;
    }

    public void setCriteria(
            List<CompletenessCriterionResponse> criteria
    ) {
        this.criteria = criteria;
    }

    public List<PotentialGapResponse> getPotentialGaps() {
        return potentialGaps == null
                ? List.of()
                : potentialGaps;
    }

    public void setPotentialGaps(
            List<PotentialGapResponse> potentialGaps
    ) {
        this.potentialGaps = potentialGaps;
    }

    public List<String> getSuggestions() {
        return suggestions == null
                ? List.of()
                : suggestions;
    }

    public void setSuggestions(
            List<String> suggestions
    ) {
        this.suggestions = suggestions;
    }
}