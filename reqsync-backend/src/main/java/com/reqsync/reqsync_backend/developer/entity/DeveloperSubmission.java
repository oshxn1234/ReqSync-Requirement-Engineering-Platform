package com.reqsync.reqsync_backend.developer.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "developer_submissions")
public class DeveloperSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ==========================================
    // Task
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "task_id",
            nullable = false
    )
    private DeveloperTask task;


    // ==========================================
    // Developer
    // ==========================================

    @Column(nullable = false)
    private Long developerId;


    // ==========================================
    // Implementation
    // ==========================================

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String implementationNotes;


    @Column(length = 300)
    private String githubBranch;


    @Column(length = 500)
    private String pullRequestUrl;


    @Column(length = 100)
    private String commitHash;


    // ==========================================
    // Status
    // ==========================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SubmissionStatus status;


    // ==========================================
    // Date
    // ==========================================

    @Column(nullable = false)
    private LocalDateTime submittedAt;


    // ==========================================
    // Constructors
    // ==========================================

    public DeveloperSubmission() {
    }


    public DeveloperSubmission(
            DeveloperTask task,
            Long developerId,
            String implementationNotes,
            String githubBranch,
            String pullRequestUrl,
            String commitHash
    ) {

        this.task = task;
        this.developerId = developerId;
        this.implementationNotes = implementationNotes;
        this.githubBranch = githubBranch;
        this.pullRequestUrl = pullRequestUrl;
        this.commitHash = commitHash;

        this.status =
                SubmissionStatus.SUBMITTED;
    }


    // ==========================================
    // JPA Lifecycle
    // ==========================================

    @PrePersist
    protected void onCreate() {

        submittedAt =
                LocalDateTime.now();
    }


    // ==========================================
    // Getters / Setters
    // ==========================================

    public Long getId() {
        return id;
    }


    public DeveloperTask getTask() {
        return task;
    }


    public void setTask(DeveloperTask task) {
        this.task = task;
    }


    public Long getDeveloperId() {
        return developerId;
    }


    public void setDeveloperId(Long developerId) {
        this.developerId = developerId;
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


    public SubmissionStatus getStatus() {
        return status;
    }


    public void setStatus(
            SubmissionStatus status
    ) {

        this.status =
                status;
    }


    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
}