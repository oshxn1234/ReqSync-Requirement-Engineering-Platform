package com.reqsync.reqsync_backend.team.dto;

public class ProjectRequiredSkillResponse {

    private Long id;

    private Long projectId;

    private String skillName;

    private Integer importance;

    private String reason;


    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public ProjectRequiredSkillResponse() {
    }


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ProjectRequiredSkillResponse(
            Long id,
            Long projectId,
            String skillName,
            Integer importance,
            String reason
    ) {

        this.id =
                id;

        this.projectId =
                projectId;

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

    public Long getId() {

        return id;
    }


    public void setId(
            Long id
    ) {

        this.id =
                id;
    }


    public Long getProjectId() {

        return projectId;
    }


    public void setProjectId(
            Long projectId
    ) {

        this.projectId =
                projectId;
    }


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