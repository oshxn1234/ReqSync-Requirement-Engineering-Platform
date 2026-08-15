package com.reqsync.reqsync_backend.team.controller;

import com.reqsync.reqsync_backend.team.dto.BASuitabilityResponse;
import com.reqsync.reqsync_backend.team.dto.TechnicalTeamSuitabilityResponse;

import com.reqsync.reqsync_backend.team.service.BASuitabilityService;
import com.reqsync.reqsync_backend.team.service.TechnicalTeamSuitabilityService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class TeamSuitabilityController {

    private final BASuitabilityService
            baSuitabilityService;

    private final TechnicalTeamSuitabilityService
            technicalTeamSuitabilityService;


    public TeamSuitabilityController(
            BASuitabilityService baSuitabilityService,
            TechnicalTeamSuitabilityService technicalTeamSuitabilityService
    ) {

        this.baSuitabilityService =
                baSuitabilityService;

        this.technicalTeamSuitabilityService =
                technicalTeamSuitabilityService;
    }


    // =========================================================
    // BA SUITABILITY
    // =========================================================

    /**
     * Used BEFORE requirement extraction.
     *
     * GET
     * /api/projects/1/suitability/business-analysts
     */
    @GetMapping(
            "/{projectId}/suitability/business-analysts"
    )
    public ResponseEntity<
            List<BASuitabilityResponse>
            >
    analyzeBusinessAnalysts(
            @PathVariable
            Long projectId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                baSuitabilityService
                        .analyzeBusinessAnalysts(
                                projectId,
                                authentication
                        )
        );
    }


    // =========================================================
    // DEVELOPER + QA SUITABILITY
    // =========================================================

    /**
     * Used AFTER requirement extraction.
     *
     * GET
     * /api/projects/1/suitability/team
     */
    @GetMapping(
            "/{projectId}/suitability/team"
    )
    public ResponseEntity<
            List<TechnicalTeamSuitabilityResponse>
            >
    analyzeTechnicalTeam(
            @PathVariable
            Long projectId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                technicalTeamSuitabilityService
                        .analyzeTechnicalTeam(
                                projectId,
                                authentication
                        )
        );
    }
}