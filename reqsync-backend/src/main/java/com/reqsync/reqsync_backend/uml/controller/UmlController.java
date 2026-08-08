package com.reqsync.reqsync_backend.uml.controller;

import com.reqsync.reqsync_backend.uml.dto.*;
import com.reqsync.reqsync_backend.uml.entity.ClassDiagramVersion;
import com.reqsync.reqsync_backend.uml.service.UmlGenerationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/uml")
public class UmlController {

    private final UmlGenerationService umlService;

    public UmlController(UmlGenerationService umlService) {
        this.umlService = umlService;
    }

    @PostMapping("/generate")
    public ResponseEntity<UmlGenerationResponse> generate(
            @Valid
            @RequestBody
            UmlGenerationRequest request
    ) {
        return ResponseEntity.ok(
                umlService.generate(request)
        );
    }

    @GetMapping("/{diagramId}")
    public ResponseEntity<UmlGenerationResponse> getLatest(
            @PathVariable
            Long diagramId
    ) {
        return ResponseEntity.ok(
                umlService.getLatest(diagramId)
        );
    }

    @PostMapping("/{diagramId}/versions")
    public ResponseEntity<UmlGenerationResponse> createEditedVersion(
            @PathVariable
            Long diagramId,

            @Valid
            @RequestBody
            UmlEditRequest request
    ) {
        return ResponseEntity.ok(
                umlService.saveEditedVersion(
                        diagramId,
                        request
                )
        );
    }

    @GetMapping("/{diagramId}/versions")
    public ResponseEntity<List<ClassDiagramVersion>> getVersions(
            @PathVariable
            Long diagramId
    ) {
        return ResponseEntity.ok(
                umlService.findVersions(diagramId)
        );
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<UmlDiagramSummaryResponse>> getProjectDiagrams(
            @PathVariable
            Long projectId
    ) {
        return ResponseEntity.ok(
                umlService.findByProject(projectId)
        );
    }
}