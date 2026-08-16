package com.reqsync.reqsync_backend.developer.dto;

public class DeveloperSubmissionRequest {

    private String implementationNotes;

    private String githubBranch;

    private String pullRequestUrl;

    private String commitHash;


    public DeveloperSubmissionRequest() {
    }


    public String getImplementationNotes() {
        return implementationNotes;
    }


    public void setImplementationNotes(
            String implementationNotes
    ) {

        this.implementationNotes =
                implementationNotes;
    }


    public String getGithubBranch() {
        return githubBranch;
    }


    public void setGithubBranch(
            String githubBranch
    ) {

        this.githubBranch =
                githubBranch;
    }


    public String getPullRequestUrl() {
        return pullRequestUrl;
    }


    public void setPullRequestUrl(
            String pullRequestUrl
    ) {

        this.pullRequestUrl =
                pullRequestUrl;
    }


    public String getCommitHash() {
        return commitHash;
    }


    public void setCommitHash(
            String commitHash
    ) {

        this.commitHash =
                commitHash;
    }
}