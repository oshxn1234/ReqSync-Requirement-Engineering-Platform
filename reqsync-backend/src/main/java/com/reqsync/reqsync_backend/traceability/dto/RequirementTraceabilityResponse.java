package com.reqsync.reqsync_backend.traceability.dto;

import java.util.List;

public class RequirementTraceabilityResponse {

    private Long requirementId;

    private String requirementCode;

    private String requirementTitle;

    private String requirementStatus;

    private Long extractionId;

    private String sourceDocument;

    private List<TraceabilityArtifactResponse> artifacts;


    public RequirementTraceabilityResponse(
            Long requirementId,
            String requirementCode,
            String requirementTitle,
            String requirementStatus,
            Long extractionId,
            String sourceDocument,
            List<TraceabilityArtifactResponse> artifacts
    ) {

        this.requirementId = requirementId;
        this.requirementCode = requirementCode;
        this.requirementTitle = requirementTitle;
        this.requirementStatus = requirementStatus;
        this.extractionId = extractionId;
        this.sourceDocument = sourceDocument;
        this.artifacts = artifacts;
    }


    public Long getRequirementId() {
        return requirementId;
    }


    public String getRequirementCode() {
        return requirementCode;
    }


    public String getRequirementTitle() {
        return requirementTitle;
    }


    public String getRequirementStatus() {
        return requirementStatus;
    }


    public Long getExtractionId() {
        return extractionId;
    }


    public String getSourceDocument() {
        return sourceDocument;
    }


    public List<TraceabilityArtifactResponse> getArtifacts() {
        return artifacts;
    }
}