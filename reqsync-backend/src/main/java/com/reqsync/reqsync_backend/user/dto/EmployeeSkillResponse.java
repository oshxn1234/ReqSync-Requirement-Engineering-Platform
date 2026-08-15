package com.reqsync.reqsync_backend.user.dto;

import com.reqsync.reqsync_backend.user.enums.SkillProficiency;

public class EmployeeSkillResponse {

    private Long id;

    private String skillName;

    private SkillProficiency proficiency;


    public EmployeeSkillResponse() {
    }


    public EmployeeSkillResponse(
            Long id,
            String skillName,
            SkillProficiency proficiency
    ) {

        this.id = id;
        this.skillName = skillName;
        this.proficiency = proficiency;
    }


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public String getSkillName() {
        return skillName;
    }


    public void setSkillName(
            String skillName
    ) {
        this.skillName = skillName;
    }


    public SkillProficiency getProficiency() {
        return proficiency;
    }


    public void setProficiency(
            SkillProficiency proficiency
    ) {
        this.proficiency = proficiency;
    }
}