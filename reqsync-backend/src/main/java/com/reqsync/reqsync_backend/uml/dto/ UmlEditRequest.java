package com.reqsync.reqsync_backend.uml.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UmlEditRequest(

        @NotBlank(message = "PlantUML code cannot be empty.")
        @Size(max = 100000, message = "PlantUML code is too large.")
        String plantUmlCode

) {
}