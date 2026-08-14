package com.reqsync.reqsync_backend.requirement.entity;

import com.reqsync.reqsync_backend.requirement.enums.RequirementPriority;
import com.reqsync.reqsync_backend.requirement.enums.RequirementStatus;
import com.reqsync.reqsync_backend.requirement.enums.RequirementType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "requirements",
        indexes = {
                @Index(name = "idx_requirement_project", columnList = "project_id"),
                @Index(name = "idx_requirement_code", columnList = "requirement_code")
        }
)
public class Requirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Project that owns this requirement.
     */
    @Column(name = "project_id", nullable = false)
    private Long projectId;

    /**
     * Requirement code.
     *
     * Example:
     * REQ-001
     * REQ-002
     */
    @Column(
            name = "requirement_code",
            nullable = false,
            length = 50
    )
    private String code;

    /**
     * Short title of the requirement.
     */
    @Column(
            nullable = false,
            length = 255
    )
    private String title;

    /**
     * Full requirement description.
     */
    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String description;

    /**
     * Type of requirement.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private RequirementType type;

    /**
     * Priority assigned to the requirement.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private RequirementPriority priority;

    /**
     * Current lifecycle status.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private RequirementStatus status;

    /**
     * Actor or user who interacts with this requirement.
     *
     * Example:
     * Customer
     * Administrator
     * Project Manager
     */
    @Column(length = 500)
    private String actors;

    /**
     * Preconditions required before the requirement can happen.
     */
    @Column(
            columnDefinition = "TEXT"
    )
    private String preconditions;

    /**
     * Expected result after the requirement is completed.
     */
    @Column(
            columnDefinition = "TEXT"
    )
    private String expectedOutcome;

    /**
     * AI confidence score.
     *
     * Example:
     * 0.94 = 94%
     */
    @Column
    private Double confidenceScore;

    /**
     * Extraction from which this requirement was generated.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "extraction_id"
    )
    private RequirementExtraction extraction;

    /**
     * Creation timestamp.
     */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * Last modification timestamp.
     */
    @Column(nullable = false)
    private LocalDateTime updatedAt;


    // ---------------------------------------------------------
    // JPA lifecycle methods
    // ---------------------------------------------------------

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = RequirementStatus.DRAFT;
        }

        if (priority == null) {
            priority = RequirementPriority.MEDIUM;
        }
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }


    // ---------------------------------------------------------
    // Constructors
    // ---------------------------------------------------------

    public Requirement() {
    }

    public Requirement(
            Long projectId,
            String code,
            String title,
            String description,
            RequirementType type
    ) {

        this.projectId = projectId;
        this.code = code;
        this.title = title;
        this.description = description;
        this.type = type;

        this.priority = RequirementPriority.MEDIUM;
        this.status = RequirementStatus.DRAFT;
    }


    // ---------------------------------------------------------
    // Getters and Setters
    // ---------------------------------------------------------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
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

    public String getActors() {
        return actors;
    }

    public void setActors(String actors) {
        this.actors = actors;
    }

    public String getPreconditions() {
        return preconditions;
    }

    public void setPreconditions(String preconditions) {
        this.preconditions = preconditions;
    }

    public String getExpectedOutcome() {
        return expectedOutcome;
    }

    public void setExpectedOutcome(String expectedOutcome) {
        this.expectedOutcome = expectedOutcome;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public RequirementExtraction getExtraction() {
        return extraction;
    }

    public void setExtraction(RequirementExtraction extraction) {
        this.extraction = extraction;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}