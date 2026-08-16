package com.reqsync.reqsync_backend.traceability.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "traceability_links",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_traceability_requirement_artifact",
                        columnNames = {
                                "requirement_id",
                                "artifact_type",
                                "artifact_id",
                                "artifact_version",
                                "relation_type"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_traceability_project",
                        columnList = "project_id"
                ),
                @Index(
                        name = "idx_traceability_requirement",
                        columnList = "requirement_id"
                ),
                @Index(
                        name = "idx_traceability_artifact",
                        columnList = "artifact_type,artifact_id"
                )
        }
)
public class TraceabilityLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(
            name = "project_id",
            nullable = false
    )
    private Long projectId;


    @Column(
            name = "requirement_id",
            nullable = false
    )
    private Long requirementId;


    @Enumerated(EnumType.STRING)
    @Column(
            name = "artifact_type",
            nullable = false,
            length = 50
    )
    private TraceabilityArtifactType artifactType;


    @Enumerated(EnumType.STRING)
    @Column(
            name = "relation_type",
            nullable = false,
            length = 80
    )
    private TraceabilityRelationType relationType;


    @Column(
            name = "artifact_id",
            nullable = false
    )
    private Long artifactId;


    @Column(
            name = "artifact_code",
            length = 100
    )
    private String artifactCode;


    @Column(
            name = "artifact_title",
            length = 500
    )
    private String artifactTitle;


    /*
     * Non-versioned artifacts:
     * User Story = 0
     * Developer Submission = 0
     *
     * Versioned artifacts:
     * SRS = 1, 2, 3...
     * UML = 1, 2, 3...
     */
    @Column(
            name = "artifact_version",
            nullable = false
    )
    private Integer artifactVersion = 0;


    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;


    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;


    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (artifactVersion == null) {
            artifactVersion = 0;
        }

        createdAt = now;
        updatedAt = now;
    }


    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }


    public Long getId() {
        return id;
    }


    public Long getProjectId() {
        return projectId;
    }


    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }


    public Long getRequirementId() {
        return requirementId;
    }


    public void setRequirementId(Long requirementId) {
        this.requirementId = requirementId;
    }


    public TraceabilityArtifactType getArtifactType() {
        return artifactType;
    }


    public void setArtifactType(
            TraceabilityArtifactType artifactType
    ) {
        this.artifactType = artifactType;
    }


    public TraceabilityRelationType getRelationType() {
        return relationType;
    }


    public void setRelationType(
            TraceabilityRelationType relationType
    ) {
        this.relationType = relationType;
    }


    public Long getArtifactId() {
        return artifactId;
    }


    public void setArtifactId(Long artifactId) {
        this.artifactId = artifactId;
    }


    public String getArtifactCode() {
        return artifactCode;
    }


    public void setArtifactCode(String artifactCode) {
        this.artifactCode = artifactCode;
    }


    public String getArtifactTitle() {
        return artifactTitle;
    }


    public void setArtifactTitle(String artifactTitle) {
        this.artifactTitle = artifactTitle;
    }


    public Integer getArtifactVersion() {
        return artifactVersion;
    }


    public void setArtifactVersion(
            Integer artifactVersion
    ) {
        this.artifactVersion = artifactVersion;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}