package com.reqsync.reqsync_backend.team.dto;

public class ExtractedProjectSkill {

    private String skillName;

    private Integer importance;

    private String reason;


    public ExtractedProjectSkill() {
    }


    public ExtractedProjectSkill(
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


    public String getSkillName() {
        return skillName;
    }


    public void setSkillName(
            String skillName
    ) {
        this.skillName = skillName;
    }


    public Integer getImportance() {
        return importance;
    }


    public void setImportance(
            Integer importance
    ) {
        this.importance = importance;
    }


    public String getReason() {
        return reason;
    }


    public void setReason(
            String reason
    ) {
        this.reason = reason;
    }
}