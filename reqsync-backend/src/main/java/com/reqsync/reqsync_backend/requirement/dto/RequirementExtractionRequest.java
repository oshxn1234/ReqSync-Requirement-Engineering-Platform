package com.reqsync.reqsync_backend.requirement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RequirementExtractionRequest {

    @NotNull(message = "Project ID is required.")
    private Long projectId;

    @NotBlank(message = "Project name cannot be empty.")
    @Size(max = 255, message = "Project name cannot exceed 255 characters.")
    private String projectName;

    @NotBlank(message = "Document content cannot be empty.")
    @Size(max = 500000, message = "Document content is too large.")
    private String documentContent;

    public RequirementExtractionRequest() {
    }

    public RequirementExtractionRequest(
            Long projectId,
            String projectName,
            String documentContent
    ) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.documentContent = documentContent;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getDocumentContent() {
        return documentContent;
    }

    public void setDocumentContent(String documentContent) {
        this.documentContent = documentContent;
    }
}