package com.reqsync.reqsync_backend.requirement.controller;

import com.reqsync.reqsync_backend.requirement.dto.RequirementExtractionRequest;
import com.reqsync.reqsync_backend.requirement.dto.RequirementExtractionResponse;
import com.reqsync.reqsync_backend.requirement.service.RequirementExtractionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requirements")
public class RequirementController {

    private final RequirementExtractionService requirementExtractionService;

    public RequirementController(
            RequirementExtractionService requirementExtractionService
    ) {
        this.requirementExtractionService =
                requirementExtractionService;
    }


    //Extract requirements from project document / meeting notes.

    @PostMapping("/extract")
    public ResponseEntity<RequirementExtractionResponse> extractRequirements(
            @RequestBody RequirementExtractionRequest request
    ) {

        RequirementExtractionResponse response =
                requirementExtractionService.extract(request);

        return ResponseEntity.ok(response);
    }



     //Get the latest requirement extraction
     //belonging to a project.

    @GetMapping("/project/{projectId}/latest")
    public ResponseEntity<RequirementExtractionResponse> getLatestExtraction(
            @PathVariable Long projectId
    ) {

        RequirementExtractionResponse response =
                requirementExtractionService
                        .getLatestExtraction(projectId);

        return ResponseEntity.ok(response);
    }
}