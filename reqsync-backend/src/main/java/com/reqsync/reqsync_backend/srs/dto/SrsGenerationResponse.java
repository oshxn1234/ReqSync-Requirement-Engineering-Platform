package com.reqsync.reqsync_backend.srs.dto;

import com.reqsync.reqsync_backend.srs.enums.SrsStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response returned for a generated SRS document.
 */
public class SrsGenerationResponse {

    private Long id;

    private Long projectId;

    private String projectName;

    private Integer version;

    private String title;

    private SrsStatus status;

    private List<SrsSection> sections;

    private String markdownContent;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public SrsGenerationResponse() {
    }

    public SrsGenerationResponse(
            Long id,
            Long projectId,
            String projectName,
            Integer version,
            String title,
            SrsStatus status,
            List<SrsSection> sections,
            String markdownContent,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {

        this.id = id;
        this.projectId = projectId;
        this.projectName = projectName;
        this.version = version;
        this.title = title;
        this.status = status;
        this.sections = sections;
        this.markdownContent = markdownContent;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getProjectId() {
        return projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public Integer getVersion() {
        return version;
    }

    public String getTitle() {
        return title;
    }

    public SrsStatus getStatus() {
        return status;
    }

    public List<SrsSection> getSections() {
        return sections;
    }

    public String getMarkdownContent() {
        return markdownContent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
