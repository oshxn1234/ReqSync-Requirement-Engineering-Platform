package com.reqsync.reqsync_backend.userstory.dto;

import com.reqsync.reqsync_backend.requirement.enums.RequirementPriority;

import java.util.List;

public class UserStoryUpdateRequest {

    private String title;

    private String actor;

    private String goal;

    private String benefit;

    private List<String> acceptanceCriteria;

    private RequirementPriority priority;

    private Boolean reviewed;


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


    public List<String> getAcceptanceCriteria() {
        return acceptanceCriteria;
    }

    public void setAcceptanceCriteria(
            List<String> acceptanceCriteria
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


    public Boolean getReviewed() {
        return reviewed;
    }

    public void setReviewed(
            Boolean reviewed
    ) {
        this.reviewed = reviewed;
    }
}