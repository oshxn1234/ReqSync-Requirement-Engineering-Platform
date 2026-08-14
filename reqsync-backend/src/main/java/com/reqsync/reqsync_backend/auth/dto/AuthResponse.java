package com.reqsync.reqsync_backend.auth.dto;

import com.reqsync.reqsync_backend.auth.entity.User;

public class AuthResponse {

    private Long id;

    private String email;

    private String firstName;

    private String lastName;

    private String role;

    private String token;

    private String message;


    public AuthResponse() {
    }


    public AuthResponse(
            Long id,
            String email,
            String firstName,
            String lastName,
            String role,
            String token,
            String message
    ) {

        this.id = id;

        this.email = email;

        this.firstName = firstName;

        this.lastName = lastName;

        this.role = role;

        this.token = token;

        this.message = message;
    }


    // ==========================================
    // Create Auth Response
    // ==========================================

    public static AuthResponse from(
            User user,
            String token,
            String message
    ) {

        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                token,
                message
        );
    }


    // ==========================================
    // Getters
    // ==========================================

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


    public String getToken() {
        return token;
    }


    public String getMessage() {
        return message;
    }
}