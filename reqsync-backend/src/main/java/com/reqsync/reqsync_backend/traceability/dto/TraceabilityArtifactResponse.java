package com.reqsync.reqsync_backend.traceability.dto;

import java.time.LocalDateTime;

public class TraceabilityArtifactResponse {

    private Long linkId;

    private String relationType;

    private String artifactType;

    private Long artifactId;

    private String artifactCode;

    private String artifactTitle;

    private Integer artifactVersion;

    private LocalDateTime linkedAt;


    public TraceabilityArtifactResponse(
            Long linkId,
            String relationType,
            String artifactType,
            Long artifactId,
            String artifactCode,
            String artifactTitle,
            Integer artifactVersion,
            LocalDateTime linkedAt
    ) {

        this.linkId = linkId;
        this.relationType = relationType;
        this.artifactType = artifactType;
        this.artifactId = artifactId;
        this.artifactCode = artifactCode;
        this.artifactTitle = artifactTitle;
        this.artifactVersion = artifactVersion;
        this.linkedAt = linkedAt;
    }


    public Long getLinkId() {
        return linkId;
    }


    public String getRelationType() {
        return relationType;
    }


    public String getArtifactType() {
        return artifactType;
    }


    public Long getArtifactId() {
        return artifactId;
    }


    public String getArtifactCode() {
        return artifactCode;
    }


    public String getArtifactTitle() {
        return artifactTitle;
    }


    public Integer getArtifactVersion() {
        return artifactVersion;
    }


    public LocalDateTime getLinkedAt() {
        return linkedAt;
    }
}