package com.reqsync.reqsync_backend.project.dto;

public class ProjectCreateRequest {

    private String name;

    private String description;


    public ProjectCreateRequest() {
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
}