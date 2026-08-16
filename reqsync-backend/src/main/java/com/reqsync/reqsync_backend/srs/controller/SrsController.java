package com.reqsync.reqsync_backend.srs.controller;

import com.reqsync.reqsync_backend.srs.dto.SrsGenerationResponse;
import com.reqsync.reqsync_backend.srs.dto.SrsUpdateRequest;

import com.reqsync.reqsync_backend.srs.service.SrsGenerationService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SrsController {

    private final SrsGenerationService
            srsGenerationService;

    public SrsController(
            SrsGenerationService srsGenerationService
    ) {

        this.srsGenerationService =
                srsGenerationService;
    }


    // ==========================================
    // GENERATE SRS
    // ==========================================

    @PostMapping(
            "/projects/{projectId}/srs/generate"
    )
    @PreAuthorize(
            "hasRole('BUSINESS_ANALYST')"
    )
    public ResponseEntity<SrsGenerationResponse>
    generate(
            @PathVariable
            Long projectId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                srsGenerationService
                        .generate(
                                projectId,
                                authentication
                        )
        );
    }


    // ==========================================
    // GET PROJECT SRS
    // ==========================================

    @GetMapping(
            "/projects/{projectId}/srs"
    )
    public ResponseEntity<SrsGenerationResponse>
    getProjectSrs(
            @PathVariable
            Long projectId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                srsGenerationService
                        .getProjectSrs(
                                projectId,
                                authentication
                        )
        );
    }


    // ==========================================
    // GET ALL PROJECT SRS VERSIONS
    // ==========================================

    @GetMapping(
            "/projects/{projectId}/srs/versions"
    )
    public ResponseEntity<List<SrsGenerationResponse>>
    getAllProjectSrs(
            @PathVariable
            Long projectId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                srsGenerationService
                        .getAllProjectSrs(
                                projectId,
                                authentication
                        )
        );
    }


    // ==========================================
    // GET SINGLE SRS
    // ==========================================

    @GetMapping(
            "/srs/{srsId}"
    )
    public ResponseEntity<SrsGenerationResponse>
    getSrsById(
            @PathVariable
            Long srsId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                srsGenerationService
                        .getSrsById(
                                srsId,
                                authentication
                        )
        );
    }


    // ==========================================
    // UPDATE SRS
    // ==========================================

    @PutMapping(
            "/srs/{srsId}"
    )
    @PreAuthorize(
            "hasRole('BUSINESS_ANALYST')"
    )
    public ResponseEntity<SrsGenerationResponse>
    update(
            @PathVariable
            Long srsId,

            @RequestBody
            SrsUpdateRequest request,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                srsGenerationService
                        .update(
                                srsId,
                                request,
                                authentication
                        )
        );
    }


    // ==========================================
    // DELETE SRS
    // ==========================================

    @DeleteMapping(
            "/srs/{srsId}"
    )
    @PreAuthorize(
            "hasRole('BUSINESS_ANALYST')"
    )
    public ResponseEntity<Void>
    delete(
            @PathVariable
            Long srsId,

            Authentication authentication
    ) {

        srsGenerationService
                .delete(
                        srsId,
                        authentication
                );

        return ResponseEntity
                .noContent()
                .build();
    }
}
