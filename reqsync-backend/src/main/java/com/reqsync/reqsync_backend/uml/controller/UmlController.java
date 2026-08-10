package com.reqsync.reqsync_backend.uml.controller;

import com.reqsync.reqsync_backend.uml.dto.UmlDiagramSummaryResponse;
import com.reqsync.reqsync_backend.uml.dto.UmlEditRequest;
import com.reqsync.reqsync_backend.uml.dto.UmlGenerationRequest;
import com.reqsync.reqsync_backend.uml.dto.UmlGenerationResponse;

import com.reqsync.reqsync_backend.uml.entity.ClassDiagramVersion;

import com.reqsync.reqsync_backend.uml.service.UmlGenerationService;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/uml")
public class UmlController {

    private final UmlGenerationService umlService;


    public UmlController(
            UmlGenerationService umlService
    ) {

        this.umlService =
                umlService;
    }


    // Old manual generate

    @PostMapping("/generate")
    public ResponseEntity<UmlGenerationResponse>
    generate(@Valid @RequestBody UmlGenerationRequest request) {

        return ResponseEntity.ok(umlService.generate(request));
    }


    // Generate UML from database requirements

    @PostMapping(
            "/generate-from-db/{projectId}"
    )
    public ResponseEntity<UmlGenerationResponse>
    generateFromDatabase(

            @PathVariable
            Long projectId,

            @RequestParam
            String projectName
    ) {

        return ResponseEntity.ok(

                umlService.generateFromDatabase(
                        projectId,
                        projectName
                )
        );
    }

    // Get latest UML version

    @GetMapping("/{diagramId}")
    public ResponseEntity<UmlGenerationResponse>
    getLatest(@PathVariable Long diagramId) {

        return ResponseEntity.ok(

                umlService.getLatest(
                        diagramId
                )
        );
    }


    // Get specific UML version

    @GetMapping(
            "/{diagramId}/version/{versionNumber}"
    )
    public ResponseEntity<UmlGenerationResponse>
    getVersion(

            @PathVariable
            Long diagramId,

            @PathVariable
            Integer versionNumber
    ) {

        return ResponseEntity.ok(

                umlService.getVersion(
                        diagramId,
                        versionNumber
                )
        );
    }

    // Save manual edit

    @PostMapping(
            "/{diagramId}/versions"
    )
    public ResponseEntity<UmlGenerationResponse>
    saveEditedVersion(

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


    // Get UML version history

    @GetMapping(
            "/{diagramId}/versions"
    )
    public ResponseEntity<List<ClassDiagramVersion>>
    findVersions(

            @PathVariable
            Long diagramId
    ) {

        return ResponseEntity.ok(

                umlService.findVersions(
                        diagramId
                )
        );
    }


    // Get project UML diagrams

    @GetMapping(
            "/project/{projectId}"
    )
    public ResponseEntity<List<UmlDiagramSummaryResponse>>
    findByProject(

            @PathVariable
            Long projectId
    ) {

        return ResponseEntity.ok(

                umlService.findByProject(
                        projectId
                )
        );
    }


    // Generate SVG visualization

    @GetMapping(
            value = "/{diagramId}/svg",
            produces = "image/svg+xml"
    )
    public ResponseEntity<String>
    viewSvg(

            @PathVariable
            Long diagramId
    ) {

        UmlGenerationResponse response =
                umlService.getLatest(
                        diagramId
                );


        byte[] decoded =
                Base64
                        .getDecoder()
                        .decode(
                                response.svgBase64()
                        );


        String svg =
                new String(
                        decoded,
                        StandardCharsets.UTF_8
                );


        return ResponseEntity
                .ok()
                .contentType(
                        MediaType.parseMediaType(
                                "image/svg+xml"
                        )
                )
                .body(svg);
    }
}