package com.reqsync.reqsync_backend.requirement.controller;

import com.reqsync.reqsync_backend.requirement.dto.ProjectCompletenessResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementCompletenessResponse;
import com.reqsync.reqsync_backend.requirement.service.ProjectCompletenessService;
import com.reqsync.reqsync_backend.requirement.service.RequirementCompletenessService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class RequirementCompletenessController {

    private final RequirementCompletenessService
            requirementCompletenessService;

    private final ProjectCompletenessService
            projectCompletenessService;


    public RequirementCompletenessController(
            RequirementCompletenessService requirementCompletenessService,
            ProjectCompletenessService projectCompletenessService
    ) {

        this.requirementCompletenessService =
                requirementCompletenessService;

        this.projectCompletenessService =
                projectCompletenessService;
    }


    /**
     * Analyze ONE selected requirement.
     *
     * POST:
     *
     * /api/requirements/5/completeness
     */
    @PostMapping(
            "/requirements/{requirementId}/completeness"
    )
    public ResponseEntity<
            RequirementCompletenessResponse
            >
    analyzeRequirement(
            @PathVariable
            Long requirementId
    ) {

        RequirementCompletenessResponse response =
                requirementCompletenessService
                        .analyze(
                                requirementId
                        );


        return ResponseEntity.ok(
                response
        );
    }


    /**
     * Analyze ALL requirements
     * belonging to a project.
     *
     * POST:
     *
     * /api/projects/1/requirements/completeness
     */
    @PostMapping(
            "/projects/{projectId}/requirements/completeness"
    )
    public ResponseEntity<
            ProjectCompletenessResponse
            >
    analyzeProject(
            @PathVariable
            Long projectId
    ) {

        ProjectCompletenessResponse response =
                projectCompletenessService
                        .analyzeProject(
                                projectId
                        );


        return ResponseEntity.ok(
                response
        );
    }
}