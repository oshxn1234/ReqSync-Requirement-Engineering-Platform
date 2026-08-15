package com.reqsync.reqsync_backend.user.dto;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.user.enums.AvailabilityStatus;
import com.reqsync.reqsync_backend.user.enums.ExperienceLevel;

import java.util.List;

public class EmployeeProfileResponse {

    private Long profileId;

    private Long userId;

    private String firstName;

    private String lastName;

    private String email;

    private Role role;

    private Integer yearsOfExperience;

    private ExperienceLevel experienceLevel;

    private AvailabilityStatus availabilityStatus;

    private Integer currentWorkloadPercentage;

    private List<EmployeeSkillResponse> skills;


    public EmployeeProfileResponse() {
    }


    public EmployeeProfileResponse(
            Long profileId,
            Long userId,
            String firstName,
            String lastName,
            String email,
            Role role,
            Integer yearsOfExperience,
            ExperienceLevel experienceLevel,
            AvailabilityStatus availabilityStatus,
            Integer currentWorkloadPercentage,
            List<EmployeeSkillResponse> skills
    ) {

        this.profileId = profileId;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.yearsOfExperience = yearsOfExperience;
        this.experienceLevel = experienceLevel;
        this.availabilityStatus = availabilityStatus;
        this.currentWorkloadPercentage =
                currentWorkloadPercentage;
        this.skills = skills;
    }


    public Long getProfileId() {
        return profileId;
    }


    public void setProfileId(
            Long profileId
    ) {
        this.profileId = profileId;
    }


    public Long getUserId() {
        return userId;
    }


    public void setUserId(
            Long userId
    ) {
        this.userId = userId;
    }


    public String getFirstName() {
        return firstName;
    }


    public void setFirstName(
            String firstName
    ) {
        this.firstName = firstName;
    }


    public String getLastName() {
        return lastName;
    }


    public void setLastName(
            String lastName
    ) {
        this.lastName = lastName;
    }


    public String getEmail() {
        return email;
    }


    public void setEmail(
            String email
    ) {
        this.email = email;
    }


    public Role getRole() {
        return role;
    }


    public void setRole(
            Role role
    ) {
        this.role = role;
    }


    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }


    public void setYearsOfExperience(
            Integer yearsOfExperience
    ) {
        this.yearsOfExperience =
                yearsOfExperience;
    }


    public ExperienceLevel getExperienceLevel() {
        return experienceLevel;
    }


    public void setExperienceLevel(
            ExperienceLevel experienceLevel
    ) {
        this.experienceLevel =
                experienceLevel;
    }


    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }


    public void setAvailabilityStatus(
            AvailabilityStatus availabilityStatus
    ) {
        this.availabilityStatus =
                availabilityStatus;
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


    public List<EmployeeSkillResponse> getSkills() {
        return skills;
    }


    public void setSkills(
            List<EmployeeSkillResponse> skills
    ) {
        this.skills = skills;
    }
}