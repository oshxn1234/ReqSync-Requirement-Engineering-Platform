package com.reqsync.reqsync_backend.requirement.dto;

import com.reqsync.reqsync_backend.requirement.enums.RequirementPriority;
import com.reqsync.reqsync_backend.requirement.enums.RequirementStatus;
import com.reqsync.reqsync_backend.requirement.enums.RequirementType;

public class ExtractedRequirementResponse {

    private Long id;

    private String code;

    private String title;

    private String description;

    private RequirementType type;

    private RequirementPriority priority;

    private RequirementStatus status;

    private Double confidenceScore;

    public ExtractedRequirementResponse() {
    }

    public ExtractedRequirementResponse(
            Long id,
            String code,
            String title,
            String description,
            RequirementType type,
            RequirementPriority priority,
            RequirementStatus status,
            Double confidenceScore
    ) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.description = description;
        this.type = type;
        this.priority = priority;
        this.status = status;
        this.confidenceScore = confidenceScore;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
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

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
}