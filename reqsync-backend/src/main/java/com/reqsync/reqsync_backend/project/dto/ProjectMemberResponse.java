package com.reqsync.reqsync_backend.project.dto;

import com.reqsync.reqsync_backend.auth.entity.Role;

import java.time.LocalDateTime;

public class ProjectMemberResponse {

    private Long membershipId;

    private Long projectId;

    private Integer projectNumber;

    private Long userId;

    private String firstName;

    private String lastName;

    private String email;

    private Role role;

    private boolean active;

    private LocalDateTime assignedAt;


    public ProjectMemberResponse() {
    }


    public ProjectMemberResponse(
            Long membershipId,
            Long projectId,
            Integer projectNumber,
            Long userId,
            String firstName,
            String lastName,
            String email,
            Role role,
            boolean active,
            LocalDateTime assignedAt
    ) {

        this.membershipId =
                membershipId;

        this.projectId =
                projectId;

        this.projectNumber =
                projectNumber;

        this.userId =
                userId;

        this.firstName =
                firstName;

        this.lastName =
                lastName;

        this.email =
                email;

        this.role =
                role;

        this.active =
                active;

        this.assignedAt =
                assignedAt;
    }


    public Long getMembershipId() {
        return membershipId;
    }


    public void setMembershipId(
            Long membershipId
    ) {
        this.membershipId =
                membershipId;
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


    public Integer getProjectNumber() {
        return projectNumber;
    }


    public void setProjectNumber(
            Integer projectNumber
    ) {
        this.projectNumber =
                projectNumber;
    }


    public Long getUserId() {
        return userId;
    }


    public void setUserId(
            Long userId
    ) {
        this.userId =
                userId;
    }


    public String getFirstName() {
        return firstName;
    }


    public void setFirstName(
            String firstName
    ) {
        this.firstName =
                firstName;
    }


    public String getLastName() {
        return lastName;
    }


    public void setLastName(
            String lastName
    ) {
        this.lastName =
                lastName;
    }


    public String getEmail() {
        return email;
    }


    public void setEmail(
            String email
    ) {
        this.email =
                email;
    }


    public Role getRole() {
        return role;
    }


    public void setRole(
            Role role
    ) {
        this.role =
                role;
    }


    public boolean isActive() {
        return active;
    }


    public void setActive(
            boolean active
    ) {
        this.active =
                active;
    }


    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }


    public void setAssignedAt(
            LocalDateTime assignedAt
    ) {
        this.assignedAt =
                assignedAt;
    }
}