package com.reqsync.reqsync_backend.user.dto;

import com.reqsync.reqsync_backend.user.enums.AvailabilityStatus;
import com.reqsync.reqsync_backend.user.enums.ExperienceLevel;

import java.util.List;

public class EmployeeProfileRequest {

    private Integer yearsOfExperience;

    private ExperienceLevel experienceLevel;

    private AvailabilityStatus availabilityStatus;

    private Integer currentWorkloadPercentage;

    private List<EmployeeSkillRequest> skills;


    public EmployeeProfileRequest() {
    }


    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }


    public void setYearsOfExperience(
            Integer yearsOfExperience
    ) {
        this.yearsOfExperience = yearsOfExperience;
    }


    public ExperienceLevel getExperienceLevel() {
        return experienceLevel;
    }


    public void setExperienceLevel(
            ExperienceLevel experienceLevel
    ) {
        this.experienceLevel = experienceLevel;
    }


    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }


    public void setAvailabilityStatus(
            AvailabilityStatus availabilityStatus
    ) {
        this.availabilityStatus = availabilityStatus;
    }


    public Integer getCurrentWorkloadPercentage() {
        return currentWorkloadPercentage;
    }


    public void setCurrentWorkloadPercentage(
            Integer currentWorkloadPercentage
    ) {
        this.currentWorkloadPercentage =
                currentWorkloadPercentage;
    }


    public List<EmployeeSkillRequest> getSkills() {
        return skills;
    }


    public void setSkills(
            List<EmployeeSkillRequest> skills
    ) {
        this.skills = skills;
    }
}