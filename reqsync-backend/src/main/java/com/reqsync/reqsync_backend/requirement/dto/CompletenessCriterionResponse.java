package com.reqsync.reqsync_backend.requirement.dto;

import com.reqsync.reqsync_backend.requirement.enums.CriterionStatus;

public class CompletenessCriterionResponse {

    private String criterion;

    private CriterionStatus status;

    private String explanation;


    public CompletenessCriterionResponse() {
    }


    public CompletenessCriterionResponse(
            String criterion,
            CriterionStatus status,
            String explanation
    ) {

        this.criterion = criterion;
        this.status = status;
        this.explanation = explanation;
    }


    public String getCriterion() {
        return criterion;
    }


    public void setCriterion(
            String criterion
    ) {
        this.criterion = criterion;
    }


    public CriterionStatus getStatus() {
        return status;
    }


    public void setStatus(
            CriterionStatus status
    ) {
        this.status = status;
    }


    public String getExplanation() {
        return explanation;
    }


    public void setExplanation(
            String explanation
    ) {
        this.explanation = explanation;
    }
}