package com.reqsync.reqsync_backend.developer.dto;

import com.reqsync.reqsync_backend.developer.entity.DeveloperTask;

public class DeveloperTaskResponse {

    private Long id;

    private Long requirementId;

    private Long userStoryId;

    private Long assignedDeveloperId;

    private String title;

    private String description;

    private String priority;

    private String status;

    private String implementationNotes;

    private String githubBranch;

    private String pullRequestUrl;


    public DeveloperTaskResponse() {
    }


    public static DeveloperTaskResponse from(
            DeveloperTask task
    ) {

        DeveloperTaskResponse response =
                new DeveloperTaskResponse();

        response.id =
                task.getId();

        response.requirementId =
                task.getRequirementId();

        response.userStoryId =
                task.getUserStoryId();

        response.assignedDeveloperId =
                task.getAssignedDeveloperId();

        response.title =
                task.getTitle();

        response.description =
                task.getDescription();

        response.priority =
                task.getPriority();

        response.status =
                task.getStatus().name();

        response.implementationNotes =
                task.getImplementationNotes();

        response.githubBranch =
                task.getGithubBranch();

        response.pullRequestUrl =
                task.getPullRequestUrl();

        return response;
    }


    public Long getId() {
        return id;
    }

    public Long getRequirementId() {
        return requirementId;
    }

    public Long getUserStoryId() {
        return userStoryId;
    }

    public Long getAssignedDeveloperId() {
        return assignedDeveloperId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getPriority() {
        return priority;
    }

    public String getStatus() {
        return status;
    }

    public String getImplementationNotes() {
        return implementationNotes;
    }

    public String getGithubBranch() {
        return githubBranch;
    }

    public String getPullRequestUrl() {
        return pullRequestUrl;
    }
}