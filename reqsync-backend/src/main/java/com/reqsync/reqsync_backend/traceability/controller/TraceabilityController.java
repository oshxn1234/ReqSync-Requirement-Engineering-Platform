package com.reqsync.reqsync_backend.traceability.controller;

import com.reqsync.reqsync_backend.traceability.dto.ProjectTraceabilityResponse;
import com.reqsync.reqsync_backend.traceability.dto.RequirementTraceabilityResponse;
import com.reqsync.reqsync_backend.traceability.service.TraceabilityService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TraceabilityController {

    private final TraceabilityService
            traceabilityService;


    public TraceabilityController(
            TraceabilityService traceabilityService
    ) {

        this.traceabilityService =
                traceabilityService;
    }


    // =========================================================
    // PROJECT TRACEABILITY
    // =========================================================

    @GetMapping(
            "/projects/{projectId}/traceability"
    )
    @PreAuthorize(
            "hasAnyRole(" +
                    "'CEO'," +
                    "'PROJECT_MANAGER'," +
                    "'BUSINESS_ANALYST'," +
                    "'DEVELOPER'," +
                    "'QA_ENGINEER'" +
                    ")"
    )
    public ResponseEntity<ProjectTraceabilityResponse>
    getProjectTraceability(
            @PathVariable
            Long projectId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                traceabilityService
                        .getProjectTraceability(
                                projectId,
                                authentication
                        )
        );
    }


    // =========================================================
    // REQUIREMENT TRACEABILITY
    // =========================================================

    @GetMapping(
            "/requirements/{requirementId}/traceability"
    )
    @PreAuthorize(
            "hasAnyRole(" +
                    "'CEO'," +
                    "'PROJECT_MANAGER'," +
                    "'BUSINESS_ANALYST'," +
                    "'DEVELOPER'," +
                    "'QA_ENGINEER'" +
                    ")"
    )
    public ResponseEntity<RequirementTraceabilityResponse>
    getRequirementTraceability(
            @PathVariable
            Long requirementId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                traceabilityService
                        .getRequirementTraceability(
                                requirementId,
                                authentication
                        )
        );
    }


    // =========================================================
    // SYNC EXISTING USER STORIES
    // =========================================================

    @PostMapping(
            "/projects/{projectId}/traceability/sync-user-stories"
    )
    @PreAuthorize(
            "hasAnyRole(" +
                    "'CEO'," +
                    "'PROJECT_MANAGER'," +
                    "'BUSINESS_ANALYST'" +
                    ")"
    )
    public ResponseEntity<Map<String, Object>>
    syncExistingUserStories(
            @PathVariable
            Long projectId,

            Authentication authentication
    ) {

        int synced =
                traceabilityService
                        .syncExistingUserStories(
                                projectId,
                                authentication
                        );


        Map<String, Object> response =
                new LinkedHashMap<>();


        response.put(
                "projectId",
                projectId
        );


        response.put(
                "syncedUserStories",
                synced
        );


        response.put(
                "message",
                "Approved requirement user story traceability synchronized successfully."
        );


        return ResponseEntity.ok(
                response
        );
    }
}