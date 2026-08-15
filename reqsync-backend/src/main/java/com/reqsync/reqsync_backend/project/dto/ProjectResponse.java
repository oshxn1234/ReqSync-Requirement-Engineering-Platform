package com.reqsync.reqsync_backend.project.dto;

import com.reqsync.reqsync_backend.project.enums.ProjectStatus;

import java.time.LocalDateTime;

public class ProjectResponse {

    /**
     * Global database primary key.
     */
    private Long id;


    /**
     * Business that owns the project.
     */
    private Long businessId;


    /**
     * Project sequence number inside
     * the business.
     *
     * Example:
     *
     * Business 1:
     * 1, 2, 3...
     *
     * Business 2:
     * 1, 2, 3...
     */
    private Integer projectNumber;


    private String name;


    private String description;


    private ProjectStatus status;


    /**
     * Assigned project manager.
     *
     * Can be null until CEO assigns one.
     */
    private Long projectManagerId;


    /**
     * Useful for displaying the PM
     * directly in the frontend.
     */
    private String projectManagerName;


    private LocalDateTime createdAt;


    private LocalDateTime updatedAt;


    // =========================================================
    // Constructors
    // =========================================================

    public ProjectResponse() {
    }


    public ProjectResponse(
            Long id,
            Long businessId,
            Integer projectNumber,
            String name,
            String description,
            ProjectStatus status,
            Long projectManagerId,
            String projectManagerName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {

        this.id =
                id;

        this.businessId =
                businessId;

        this.projectNumber =
                projectNumber;

        this.name =
                name;

        this.description =
                description;

        this.status =
                status;

        this.projectManagerId =
                projectManagerId;

        this.projectManagerName =
                projectManagerName;

        this.createdAt =
                createdAt;

        this.updatedAt =
                updatedAt;
    }


    // =========================================================
    // Getters / Setters
    // =========================================================

    public Long getId() {
        return id;
    }


    public void setId(
            Long id
    ) {
        this.id = id;
    }


    public Long getBusinessId() {
        return businessId;
    }


    public void setBusinessId(
            Long businessId
    ) {
        this.businessId =
                businessId;
    }


    public Integer getProjectNumber() {
        return projectNumber;
    }


    public void setProjectNumber(
            Integer projectNumber
    ) {
        this.projectNumber =
                projectNumber;
    }


    public String getName() {
        return name;
    }


    public void setName(
            String name
    ) {
        this.name =
                name;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(
            String description
    ) {
        this.description =
                description;
    }


    public ProjectStatus getStatus() {
        return status;
    }


    public void setStatus(
            ProjectStatus status
    ) {
        this.status =
                status;
    }


    public Long getProjectManagerId() {
        return projectManagerId;
    }


    public void setProjectManagerId(
            Long projectManagerId
    ) {
        this.projectManagerId =
                projectManagerId;
    }


    public String getProjectManagerName() {
        return projectManagerName;
    }


    public void setProjectManagerName(
            String projectManagerName
    ) {
        this.projectManagerName =
                projectManagerName;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt =
                createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt =
                updatedAt;
    }
}