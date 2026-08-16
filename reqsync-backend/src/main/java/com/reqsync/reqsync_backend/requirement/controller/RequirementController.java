package com.reqsync.reqsync_backend.requirement.controller;

import com.reqsync.reqsync_backend.requirement.dto.ExtractedRequirementResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementExtractionRequest;
import com.reqsync.reqsync_backend.requirement.dto.RequirementExtractionResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementStatusUpdateRequest;
import com.reqsync.reqsync_backend.requirement.dto.RequirementSummaryResponse;
import com.reqsync.reqsync_backend.requirement.service.RequirementExtractionService;
import com.reqsync.reqsync_backend.requirement.service.RequirementService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requirements")
public class RequirementController {

    private final RequirementExtractionService requirementExtractionService;
    private final RequirementService requirementService;

    public RequirementController(
            RequirementExtractionService requirementExtractionService,
            RequirementService requirementService
    ) {
        this.requirementExtractionService = requirementExtractionService;
        this.requirementService = requirementService;
    }

    @PostMapping("/extract")
    public ResponseEntity<RequirementExtractionResponse> extractRequirements(
            @RequestBody RequirementExtractionRequest request
    ) {
        return ResponseEntity.ok(
                requirementExtractionService.extract(request)
        );
    }

    @GetMapping("/project/{projectId}/latest")
    public ResponseEntity<RequirementExtractionResponse> getLatestExtraction(
            @PathVariable Long projectId
    ) {
        return ResponseEntity.ok(
                requirementExtractionService.getLatestExtraction(projectId)
        );
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<RequirementSummaryResponse>> getProjectRequirements(
            @PathVariable Long projectId
    ) {
        return ResponseEntity.ok(
                requirementService.getByProject(projectId)
        );
    }

    @PutMapping("/{requirementId}/status")
    @PreAuthorize("hasRole('BUSINESS_ANALYST')")
    public ResponseEntity<ExtractedRequirementResponse> updateRequirementStatus(
            @PathVariable Long requirementId,
            @Valid @RequestBody RequirementStatusUpdateRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                requirementService.updateStatus(
                        requirementId,
                        request,
                        authentication
                )
        );
    }
}
