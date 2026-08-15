package com.reqsync.reqsync_backend.userstory.dto;

import java.util.ArrayList;
import java.util.List;

public class GeneratedUserStory {

    private Long sourceRequirementId;

    private String title;

    private String actor;

    private String goal;

    private String benefit;

    private List<String> acceptanceCriteria =
            new ArrayList<>();


    public GeneratedUserStory() {
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
}