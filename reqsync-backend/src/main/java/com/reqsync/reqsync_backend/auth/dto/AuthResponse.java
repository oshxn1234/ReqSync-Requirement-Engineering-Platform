package com.reqsync.reqsync_backend.auth.dto;

import com.reqsync.reqsync_backend.auth.entity.User;

public class AuthResponse {

    private Long id;

    private String email;

    private String firstName;

    private String lastName;

    private String role;

    private String message;


    public AuthResponse() {
    }


    public AuthResponse(
            Long id,
            String email,
            String firstName,
            String lastName,
            String role,
            String message
    ) {

        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.message = message;
    }


    public static AuthResponse from(
            User user,
            String message
    ) {

        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                message
        );
    }


    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }
}