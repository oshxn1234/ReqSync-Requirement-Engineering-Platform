package com.reqsync.reqsync_backend.project.dto;

import com.reqsync.reqsync_backend.project.enums.ProjectStatus;

public class ProjectUpdateRequest {

    private String name;

    private String description;

    private ProjectStatus status;


    public ProjectUpdateRequest() {
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
}