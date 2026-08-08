package com.reqsync.reqsync_backend.requirement.dto;

import com.reqsync.reqsync_backend.requirement.enums.ExtractionStatus;

import java.time.LocalDateTime;
import java.util.List;

public class RequirementExtractionResponse {

    private Long extractionId;

    private Long projectId;

    private ExtractionStatus status;

    private Integer requirementCount;

    private List<ExtractedRequirementResponse> requirements;

    private String message;

    private LocalDateTime createdAt;

    public RequirementExtractionResponse() {
    }

    public RequirementExtractionResponse(
            Long extractionId,
            Long projectId,
            ExtractionStatus status,
            Integer requirementCount,
            List<ExtractedRequirementResponse> requirements,
            String message,
            LocalDateTime createdAt
    ) {
        this.extractionId = extractionId;
        this.projectId = projectId;
        this.status = status;
        this.requirementCount = requirementCount;
        this.requirements = requirements;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Long getExtractionId() {
        return extractionId;
    }

    public void setExtractionId(Long extractionId) {
        this.extractionId = extractionId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public ExtractionStatus getStatus() {
        return status;
    }

    public void setStatus(ExtractionStatus status) {
        this.status = status;
    }

    public Integer getRequirementCount() {
        return requirementCount;
    }

    public void setRequirementCount(Integer requirementCount) {
        this.requirementCount = requirementCount;
    }

    public List<ExtractedRequirementResponse> getRequirements() {
        return requirements;
    }

    public void setRequirements(
            List<ExtractedRequirementResponse> requirements
    ) {
        this.requirements = requirements;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}