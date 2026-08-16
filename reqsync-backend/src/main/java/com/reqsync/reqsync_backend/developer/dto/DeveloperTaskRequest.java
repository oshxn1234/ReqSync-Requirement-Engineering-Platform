package com.reqsync.reqsync_backend.developer.dto;

public class DeveloperTaskRequest {

    private Long requirementId;

    private Long userStoryId;

    private Long assignedDeveloperId;

    private String title;

    private String description;

    private String priority;


    public DeveloperTaskRequest() {
    }


    public Long getRequirementId() {
        return requirementId;
    }

    public void setRequirementId(
            Long requirementId
    ) {

        this.requirementId =
                requirementId;
    }


    public Long getUserStoryId() {
        return userStoryId;
    }

    public void setUserStoryId(
            Long userStoryId
    ) {

        this.userStoryId =
                userStoryId;
    }


    public Long getAssignedDeveloperId() {
        return assignedDeveloperId;
    }

    public void setAssignedDeveloperId(
            Long assignedDeveloperId
    ) {

        this.assignedDeveloperId =
                assignedDeveloperId;
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

    public void setDescription(
            String description
    ) {

        this.description =
                description;
    }


    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }
}