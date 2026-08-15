package com.reqsync.reqsync_backend.user.dto;

import com.reqsync.reqsync_backend.auth.entity.Role;

import java.time.LocalDateTime;

public class UserResponse {

    private Long id;

    private Long businessId;

    private String firstName;

    private String lastName;

    private String email;

    private Role role;

    private boolean enabled;

    private boolean accountLocked;

    private LocalDateTime createdAt;


    public UserResponse() {
    }


    public UserResponse(
            Long id,
            Long businessId,
            String firstName,
            String lastName,
            String email,
            Role role,
            boolean enabled,
            boolean accountLocked,
            LocalDateTime createdAt
    ) {

        this.id = id;
        this.businessId = businessId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.enabled = enabled;
        this.accountLocked = accountLocked;
        this.createdAt = createdAt;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Long getBusinessId() {
        return businessId;
    }

    public void setBusinessId(Long businessId) {
        this.businessId = businessId;
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


    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(
            boolean enabled
    ) {
        this.enabled = enabled;
    }


    public boolean isAccountLocked() {
        return accountLocked;
    }

    public void setAccountLocked(
            boolean accountLocked
    ) {
        this.accountLocked = accountLocked;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }
}