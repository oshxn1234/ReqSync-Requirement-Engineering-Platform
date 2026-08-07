package com.reqsync.reqsync_backend.uml.controller;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RequirementForUml(

        @NotBlank(message = "Requirement code is required.")
        @Size(max = 20, message = "Requirement code cannot exceed 20 characters.")
        String code,

        @NotBlank(message = "Requirement title is required.")
        @Size(max = 150, message = "Requirement title cannot exceed 150 characters.")
        String title,

        @NotBlank(message = "Requirement description is required.")
        @Size(max = 5000, message = "Requirement description cannot exceed 5000 characters.")
        String description,

        @NotBlank(message = "Requirement type is required.")
        String type

)
