package com.reqsync.reqsync_backend.requirement.controller;

import com.reqsync.reqsync_backend.requirement.dto.RequirementExtractionRequest;
import com.reqsync.reqsync_backend.requirement.dto.RequirementExtractionResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementSummaryResponse;
import com.reqsync.reqsync_backend.requirement.service.RequirementExtractionService;
import com.reqsync.reqsync_backend.requirement.service.RequirementService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requirements")
public class RequirementController {

    private final RequirementExtractionService
            requirementExtractionService;

    private final RequirementService
            requirementService;


    public RequirementController(
            RequirementExtractionService requirementExtractionService,
            RequirementService requirementService
    ) {

        this.requirementExtractionService =
                requirementExtractionService;

        this.requirementService =
                requirementService;
    }


    /**
     * Extract requirements from document
     * content or meeting notes.
     *
     * POST /api/requirements/extract
     */
    @PostMapping("/extract")
    public ResponseEntity<RequirementExtractionResponse>
    extractRequirements(
            @RequestBody RequirementExtractionRequest request
    ) {

        RequirementExtractionResponse response =
                requirementExtractionService.extract(
                        request
                );

        return ResponseEntity.ok(
                response
        );
    }


    /**
     * Get the latest requirement extraction
     * for a project.
     *
     * GET /api/requirements/project/{projectId}/latest
     */
    @GetMapping("/project/{projectId}/latest")
    public ResponseEntity<RequirementExtractionResponse>
    getLatestExtraction(
            @PathVariable Long projectId
    ) {

        RequirementExtractionResponse response =
                requirementExtractionService
                        .getLatestExtraction(
                                projectId
                        );

        return ResponseEntity.ok(
                response
        );
    }


    /**
     * Get all requirements belonging
     * to a project.
     *
     * GET /api/requirements/project/{projectId}
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<RequirementSummaryResponse>>
    getProjectRequirements(
            @PathVariable Long projectId
    ) {

        List<RequirementSummaryResponse> requirements =
                requirementService
                        .getByProject(
                                projectId
                        );

        return ResponseEntity.ok(
                requirements
        );
    }
}