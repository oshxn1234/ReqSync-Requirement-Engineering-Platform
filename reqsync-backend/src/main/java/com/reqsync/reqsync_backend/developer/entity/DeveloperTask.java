package com.reqsync.reqsync_backend.developer.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "developer_tasks")
public class DeveloperTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ==========================================
    // Requirement / User Story References
    // ==========================================

    @Column(nullable = false)
    private Long requirementId;

    @Column(nullable = false)
    private Long userStoryId;


    // ==========================================
    // Developer
    // ==========================================

    @Column(nullable = false)
    private Long assignedDeveloperId;


    // ==========================================
    // Task Information
    // ==========================================

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 30)
    private String priority;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TaskStatus status;


    // ==========================================
    // Implementation Information
    // ==========================================

    @Column(columnDefinition = "TEXT")
    private String implementationNotes;

    @Column(length = 300)
    private String githubBranch;

    @Column(length = 500)
    private String pullRequestUrl;


    // ==========================================
    // Dates
    // ==========================================

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;


    // ==========================================
    // Constructors
    // ==========================================

    public DeveloperTask() {
    }


    public DeveloperTask(
            Long requirementId,
            Long userStoryId,
            Long assignedDeveloperId,
            String title,
            String description,
            String priority
    ) {

        this.requirementId = requirementId;
        this.userStoryId = userStoryId;
        this.assignedDeveloperId = assignedDeveloperId;
        this.title = title;
        this.description = description;
        this.priority = priority;

        this.status = TaskStatus.TODO;
    }


    // ==========================================
    // JPA Lifecycle
    // ==========================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }


    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }


    // ==========================================
    // Getters / Setters
    // ==========================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Long getRequirementId() {
        return requirementId;
    }

    public void setRequirementId(Long requirementId) {
        this.requirementId = requirementId;
    }


    public Long getUserStoryId() {
        return userStoryId;
    }

    public void setUserStoryId(Long userStoryId) {
        this.userStoryId = userStoryId;
    }


    public Long getAssignedDeveloperId() {
        return assignedDeveloperId;
    }

    public void setAssignedDeveloperId(Long assignedDeveloperId) {
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

    public void setDescription(String description) {
        this.description = description;
    }


    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }


    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
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

    public void setGithubBranch(String githubBranch) {
        this.githubBranch = githubBranch;
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


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}