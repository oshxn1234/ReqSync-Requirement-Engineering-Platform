package com.reqsync.reqsync_backend.requirement.entity;

import com.reqsync.reqsync_backend.requirement.enums.ExtractionStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "requirement_extractions")
public class RequirementExtraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID of the project this extraction belongs to.
     *
     * We are keeping this as Long for now instead of directly
     * connecting to a Project entity.
     */
    @Column(nullable = false)
    private Long projectId;

    /**
     * Name of the uploaded document.
     */
    @Column(nullable = false)
    private String documentName;

    /**
     * Original document type.
     *
     * Examples:
     * PDF, DOCX, PPTX, TXT
     */
    @Column(length = 20)
    private String documentType;

    /**
     * Current extraction status.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExtractionStatus status;

    /**
     * Number of requirements extracted from the document.
     */
    @Column(nullable = false)
    private Integer requirementCount = 0;

    /**
     * Error message if extraction fails.
     */
    @Column(length = 2000)
    private String errorMessage;

    /**
     * Date and time when extraction started.
     */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * Date and time when extraction was last updated.
     */
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Requirements generated during this extraction.
     */
    @OneToMany(
            mappedBy = "extraction",
            cascade = CascadeType.ALL,
            orphanRemoval = false
    )
    private List<Requirement> requirements = new ArrayList<>();


    // ---------------------------------------------------------
    // JPA lifecycle methods
    // ---------------------------------------------------------

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = ExtractionStatus.PROCESSING;
        }

        if (requirementCount == null) {
            requirementCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }


    // ---------------------------------------------------------
    // Constructors
    // ---------------------------------------------------------

    public RequirementExtraction() {
    }

    public RequirementExtraction(
            Long projectId,
            String documentName,
            String documentType
    ) {

        this.projectId = projectId;
        this.documentName = documentName;
        this.documentType = documentType;
        this.status = ExtractionStatus.PROCESSING;
        this.requirementCount = 0;
    }


    // ---------------------------------------------------------
    // Helper methods
    // ---------------------------------------------------------

    public void addRequirement(Requirement requirement) {

        requirements.add(requirement);
        requirement.setExtraction(this);

        requirementCount = requirements.size();
    }

    public void removeRequirement(Requirement requirement) {

        requirements.remove(requirement);
        requirement.setExtraction(null);

        requirementCount = requirements.size();
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

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
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

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
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

    public List<Requirement> getRequirements() {
        return requirements;
    }

    public void setRequirements(List<Requirement> requirements) {
        this.requirements = requirements;

        if (requirements != null) {
            this.requirementCount = requirements.size();
        }
    }
}