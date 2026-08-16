package com.reqsync.reqsync_backend.srs.entity;

import com.reqsync.reqsync_backend.srs.enums.SrsStatus;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "srs_documents",

        indexes = {
                @Index(
                        name = "idx_srs_project",
                        columnList = "project_id"
                ),
                @Index(
                        name = "idx_srs_project_version",
                        columnList = "project_id, version"
                )
        }
)
public class SrsDocument {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    /**
     * Project that owns this SRS document.
     */
    @Column(
            name = "project_id",
            nullable = false
    )
    private Long projectId;

    /**
     * Project name snapshot at generation time.
     */
    @Column(
            name = "project_name",
            nullable = false,
            length = 255
    )
    private String projectName;

    /**
     * Sequential document version inside one project.
     *
     * Each regeneration creates the next version.
     */
    @Column(
            nullable = false
    )
    private Integer version;

    /**
     * Document title.
     *
     * Example:
     * Software Requirements Specification - Online Banking
     */
    @Column(
            nullable = false,
            length = 255
    )
    private String title;

    /**
     * Full SRS document in Markdown format.
     */
    @Column(
            name = "markdown_content",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String markdownContent;

    /**
     * Parsed sections stored as JSON text.
     *
     * Example:
     *
     * [
     *   {
     *     "title": "Introduction",
     *     "content": "...",
     *     "order": 1
     *   }
     * ]
     */
    @Column(
            name = "sections_json",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String sectionsJson;

    /**
     * Current lifecycle state.
     */
    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 20
    )
    private SrsStatus status;

    /**
     * User id that generated the document.
     */
    @Column(
            name = "generated_by"
    )
    private Long generatedBy;

    @Column(
            name = "created_at",
            nullable = false
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

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = SrsStatus.GENERATED;
        }
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }

    public SrsDocument() {
    }

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

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMarkdownContent() {
        return markdownContent;
    }

    public void setMarkdownContent(String markdownContent) {
        this.markdownContent = markdownContent;
    }

    public String getSectionsJson() {
        return sectionsJson;
    }

    public void setSectionsJson(String sectionsJson) {
        this.sectionsJson = sectionsJson;
    }

    public SrsStatus getStatus() {
        return status;
    }

    public void setStatus(SrsStatus status) {
        this.status = status;
    }

    public Long getGeneratedBy() {
        return generatedBy;
    }

    public void setGeneratedBy(Long generatedBy) {
        this.generatedBy = generatedBy;
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
