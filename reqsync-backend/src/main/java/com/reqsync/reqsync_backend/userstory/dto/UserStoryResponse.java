package com.reqsync.reqsync_backend.userstory.dto;

import com.reqsync.reqsync_backend.requirement.enums.RequirementPriority;

import java.time.LocalDateTime;
import java.util.List;

public class UserStoryResponse {

    private Long id;

    private Long projectId;

    private Long sourceRequirementId;

    private String sourceRequirementCode;

    private String code;

    private String title;

    private String actor;

    private String goal;

    private String benefit;

    private String story;

    private List<String> acceptanceCriteria;

    private RequirementPriority priority;

    private boolean reviewed;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    public UserStoryResponse() {
    }


    public UserStoryResponse(
            Long id,
            Long projectId,
            Long sourceRequirementId,
            String sourceRequirementCode,
            String code,
            String title,
            String actor,
            String goal,
            String benefit,
            String story,
            List<String> acceptanceCriteria,
            RequirementPriority priority,
            boolean reviewed,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {

        this.id = id;
        this.projectId = projectId;
        this.sourceRequirementId =
                sourceRequirementId;
        this.sourceRequirementCode =
                sourceRequirementCode;
        this.code = code;
        this.title = title;
        this.actor = actor;
        this.goal = goal;
        this.benefit = benefit;
        this.story = story;
        this.acceptanceCriteria =
                acceptanceCriteria;
        this.priority = priority;
        this.reviewed = reviewed;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }


    public Long getId() {
        return id;
    }

    public Long getProjectId() {
        return projectId;
    }

    public Long getSourceRequirementId() {
        return sourceRequirementId;
    }

    public String getSourceRequirementCode() {
        return sourceRequirementCode;
    }

    public String getCode() {
        return code;
    }

    public String getTitle() {
        return title;
    }

    public String getActor() {
        return actor;
    }

    public String getGoal() {
        return goal;
    }

    public String getBenefit() {
        return benefit;
    }

    public String getStory() {
        return story;
    }

    public List<String> getAcceptanceCriteria() {
        return acceptanceCriteria;
    }

    public RequirementPriority getPriority() {
        return priority;
    }

    public boolean isReviewed() {
        return reviewed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}