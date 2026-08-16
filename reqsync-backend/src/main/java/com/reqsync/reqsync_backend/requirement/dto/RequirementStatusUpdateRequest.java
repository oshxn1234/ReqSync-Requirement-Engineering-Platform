package com.reqsync.reqsync_backend.requirement.dto;

import com.reqsync.reqsync_backend.requirement.enums.RequirementStatus;

import jakarta.validation.constraints.NotNull;

public class RequirementStatusUpdateRequest {

    @NotNull(message = "Requirement status is required.")
    private RequirementStatus status;


    public RequirementStatusUpdateRequest() {
    }


    public RequirementStatusUpdateRequest(
            RequirementStatus status
    ) {

        this.status = status;
    }


    public RequirementStatus getStatus() {
        return status;
    }


    public void setStatus(
            RequirementStatus status
    ) {

        this.status = status;
    }
}
