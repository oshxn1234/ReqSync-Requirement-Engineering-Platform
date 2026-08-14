package com.reqsync.reqsync_backend.requirement.dto;

public class RequirementExtractionRequest {

    private Long projectId;

    private String documentContent;


    public RequirementExtractionRequest() {
    }


    public Long getProjectId() {
        return projectId;
    }


    public void setProjectId(
            Long projectId
    ) {
        this.projectId = projectId;
    }


    public String getDocumentContent() {
        return documentContent;
    }


    public void setDocumentContent(
            String documentContent
    ) {
        this.documentContent = documentContent;
    }
}