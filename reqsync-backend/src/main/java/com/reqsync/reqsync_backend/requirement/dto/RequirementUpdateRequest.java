package com.reqsync.reqsync_backend.requirement.dto;

import com.reqsync.reqsync_backend.requirement.enums.RequirementPriority;
import com.reqsync.reqsync_backend.requirement.enums.RequirementStatus;
import com.reqsync.reqsync_backend.requirement.enums.RequirementType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RequirementUpdateRequest {

    @NotBlank(message = "Requirement title cannot be empty.")
    @Size(
            max = 255,
            message = "Requirement title cannot exceed 255 characters."
    )
    private String title;

    @NotBlank(message = "Requirement description cannot be empty.")
    @Size(
            max = 10000,
            message = "Requirement description cannot exceed 10000 characters."
    )
    private String description;

    @NotNull(message = "Requirement type is required.")
    private RequirementType type;

    @NotNull(message = "Requirement priority is required.")
    private RequirementPriority priority;

    @NotNull(message = "Requirement status is required.")
    private RequirementStatus status;

    public RequirementUpdateRequest() {
    }

    public RequirementUpdateRequest(
            String title,
            String description,
            RequirementType type,
            RequirementPriority priority,
            RequirementStatus status
    ) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.priority = priority;
        this.status = status;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public RequirementType getType() {
        return type;
    }

    public void setType(RequirementType type) {
        this.type = type;
    }

    public RequirementPriority getPriority() {
        return priority;
    }

    public void setPriority(RequirementPriority priority) {
        this.priority = priority;
    }

    public RequirementStatus getStatus() {
        return status;
    }

    public void setStatus(RequirementStatus status) {
        this.status = status;
    }
}