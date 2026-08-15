package com.reqsync.reqsync_backend.team.dto;

public class RequiredSkillResponse {

    private String skillName;

    private Integer importance;

    private String reason;


    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public RequiredSkillResponse() {
    }


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public RequiredSkillResponse(
            String skillName,
            Integer importance,
            String reason
    ) {

        this.skillName =
                skillName;

        this.importance =
                importance;

        this.reason =
                reason;
    }


    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public String getSkillName() {

        return skillName;
    }


    public void setSkillName(
            String skillName
    ) {

        this.skillName =
                skillName;
    }


    public Integer getImportance() {

        return importance;
    }


    public void setImportance(
            Integer importance
    ) {

        this.importance =
                importance;
    }


    public String getReason() {

        return reason;
    }


    public void setReason(
            String reason
    ) {

        this.reason =
                reason;
    }
}