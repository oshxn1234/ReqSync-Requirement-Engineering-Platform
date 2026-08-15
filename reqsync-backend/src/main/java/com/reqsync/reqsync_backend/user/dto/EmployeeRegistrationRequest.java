package com.reqsync.reqsync_backend.user.dto;

import com.reqsync.reqsync_backend.auth.entity.Role;

public class EmployeeRegistrationRequest {

    private String firstName;

    private String lastName;

    private String email;

    private String password;

    private Role role;


    public EmployeeRegistrationRequest() {
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


    public String getPassword() {
        return password;
    }

    public void setPassword(
            String password
    ) {
        this.password = password;
    }


    public Role getRole() {
        return role;
    }

    public void setRole(
            Role role
    ) {
        this.role = role;
    }
}