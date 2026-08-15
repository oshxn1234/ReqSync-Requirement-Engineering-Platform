package com.reqsync.reqsync_backend.userstory.entity;

import com.reqsync.reqsync_backend.requirement.enums.RequirementPriority;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_stories",

        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_project_user_story_code",
                        columnNames = {
                                "project_id",
                                "story_code"
                        }
                )
        },

        indexes = {
                @Index(
                        name = "idx_user_story_project",
                        columnList = "project_id"
                ),

                @Index(
                        name = "idx_user_story_requirement",
                        columnList = "source_requirement_id"
                )
        }
)
public class UserStory {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    // ==========================================
    // Project
    // ==========================================

    @Column(
            name = "project_id",
            nullable = false
    )
    private Long projectId;


    // ==========================================
    // Source Requirement
    // ==========================================

    @Column(
            name = "source_requirement_id",
            nullable = false
    )
    private Long sourceRequirementId;


    // ==========================================
    // Story Code
    // ==========================================

    @Column(
            name = "story_code",
            nullable = false,
            length = 50
    )
    private String code;


    // ==========================================
    // Title
    // ==========================================

    @Column(
            nullable = false,
            length = 255
    )
    private String title;


    // ==========================================
    // User Story Components
    // ==========================================

    @Column(
            nullable = false,
            length = 255
    )
    private String actor;


    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String goal;


    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String benefit;


    // ==========================================
    // Acceptance Criteria
    // ==========================================

    /**
     * Stored as JSON text.
     *
     * Example:
     *
     * [
     *   "Customer can login",
     *   "Invalid credentials are rejected"
     * ]
     */
    @Column(
            name = "acceptance_criteria",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String acceptanceCriteria;


    // ==========================================
    // Priority
    // ==========================================

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 20
    )
    private RequirementPriority priority;


    // ==========================================
    // Review State
    // ==========================================

    @Column(
            nullable = false
    )
    private boolean reviewed = false;


    // ==========================================
    // Timestamps
    // ==========================================

    @Column(
            nullable = false
    )
    private LocalDateTime createdAt;


    @Column(
            nullable = false
    )
    private LocalDateTime updatedAt;


    // ==========================================
    // Lifecycle
    // ==========================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;

        updatedAt = now;

        if (priority == null) {
            priority =
                    RequirementPriority.MEDIUM;
        }
    }


    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }


    // ==========================================
    // Constructor
    // ==========================================

    public UserStory() {
    }


    // ==========================================
    // Getters / Setters
    // ==========================================

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }


    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(
            Long projectId
    ) {
        this.projectId = projectId;
    }


    public Long getSourceRequirementId() {
        return sourceRequirementId;
    }

    public void setSourceRequirementId(
            Long sourceRequirementId
    ) {
        this.sourceRequirementId =
                sourceRequirementId;
    }


    public String getCode() {
        return code;
    }

    public void setCode(
            String code
    ) {
        this.code = code;
    }


    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title
    ) {
        this.title = title;
    }


    public String getActor() {
        return actor;
    }

    public void setActor(
            String actor
    ) {
        this.actor = actor;
    }


    public String getGoal() {
        return goal;
    }

    public void setGoal(
            String goal
    ) {
        this.goal = goal;
    }


    public String getBenefit() {
        return benefit;
    }

    public void setBenefit(
            String benefit
    ) {
        this.benefit = benefit;
    }


    public String getAcceptanceCriteria() {
        return acceptanceCriteria;
    }

    public void setAcceptanceCriteria(
            String acceptanceCriteria
    ) {
        this.acceptanceCriteria =
                acceptanceCriteria;
    }


    public RequirementPriority getPriority() {
        return priority;
    }

    public void setPriority(
            RequirementPriority priority
    ) {
        this.priority = priority;
    }


    public boolean isReviewed() {
        return reviewed;
    }

    public void setReviewed(
            boolean reviewed
    ) {
        this.reviewed = reviewed;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt = updatedAt;
    }
}