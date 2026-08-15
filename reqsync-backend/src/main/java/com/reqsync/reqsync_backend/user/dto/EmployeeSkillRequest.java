package com.reqsync.reqsync_backend.user.dto;

import com.reqsync.reqsync_backend.user.enums.SkillProficiency;

public class EmployeeSkillRequest {

    private String skillName;

    private SkillProficiency proficiency;


    public EmployeeSkillRequest() {
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