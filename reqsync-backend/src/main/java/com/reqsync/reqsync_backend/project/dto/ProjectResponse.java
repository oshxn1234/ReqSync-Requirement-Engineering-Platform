package com.reqsync.reqsync_backend.project.dto;

import com.reqsync.reqsync_backend.project.enums.ProjectStatus;

import java.time.LocalDateTime;

public class ProjectResponse {

    private Long id;

    private String name;

    private String description;

    private ProjectStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    public ProjectResponse() {
    }


    public ProjectResponse(
            Long id,
            String name,
            String description,
            ProjectStatus status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {

        this.id = id;

        this.name = name;

        this.description =
                description;

        this.status = status;

        this.createdAt =
                createdAt;

        this.updatedAt =
                updatedAt;
    }


    public Long getId() {

        return id;
    }


    public void setId(
            Long id
    ) {

        this.id = id;
    }


    public String getName() {

        return name;
    }


    public void setName(
            String name
    ) {

        this.name = name;
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

        this.status = status;
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