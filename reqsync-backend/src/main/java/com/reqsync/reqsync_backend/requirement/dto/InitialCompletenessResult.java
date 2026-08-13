package com.reqsync.reqsync_backend.requirement.dto;

import java.util.ArrayList;
import java.util.List;

public class InitialCompletenessResult {

    private List<CompletenessCriterionResponse>
            criteria = new ArrayList<>();

    private List<PotentialGapResponse>
            potentialGaps = new ArrayList<>();

    private List<String>
            suggestions = new ArrayList<>();


    public InitialCompletenessResult() {
    }


    public InitialCompletenessResult(
            List<CompletenessCriterionResponse> criteria,
            List<PotentialGapResponse> potentialGaps,
            List<String> suggestions
    ) {

        this.criteria = criteria;
        this.potentialGaps = potentialGaps;
        this.suggestions = suggestions;
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


    public List<PotentialGapResponse>
    getPotentialGaps() {

        return potentialGaps;
    }


    public void setPotentialGaps(
            List<PotentialGapResponse> potentialGaps
    ) {

        this.potentialGaps = potentialGaps;
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