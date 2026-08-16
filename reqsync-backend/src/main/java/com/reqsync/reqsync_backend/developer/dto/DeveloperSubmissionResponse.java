package com.reqsync.reqsync_backend.developer.dto;

import com.reqsync.reqsync_backend.developer.entity.DeveloperSubmission;

public class DeveloperSubmissionResponse {

    private Long id;

    private Long taskId;

    private Long developerId;

    private String implementationNotes;

    private String githubBranch;

    private String pullRequestUrl;

    private String commitHash;

    private String status;


    public DeveloperSubmissionResponse() {
    }


    public static DeveloperSubmissionResponse from(
            DeveloperSubmission submission
    ) {

        DeveloperSubmissionResponse response =
                new DeveloperSubmissionResponse();

        response.id =
                submission.getId();

        response.taskId =
                submission.getTask().getId();

        response.developerId =
                submission.getDeveloperId();

        response.implementationNotes =
                submission.getImplementationNotes();

        response.githubBranch =
                submission.getGithubBranch();

        response.pullRequestUrl =
                submission.getPullRequestUrl();

        response.commitHash =
                submission.getCommitHash();

        response.status =
                submission.getStatus().name();

        return response;
    }


    public Long getId() {
        return id;
    }

    public Long getTaskId() {
        return taskId;
    }

    public Long getDeveloperId() {
        return developerId;
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

    public String getCommitHash() {
        return commitHash;
    }

    public String getStatus() {
        return status;
    }
}