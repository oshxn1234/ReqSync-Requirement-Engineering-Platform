package com.reqsync.reqsync_backend.uml.controller;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UmlGenerationRequest(

        @NotNull(message = "Project ID is required.")
        Long projectId,

        @NotBlank(message = "Project name is required.")
        String projectName,

        @NotEmpty(message = "At least one requirement is required.")
        List<@Valid RequirementForUml> requirements

) {
}