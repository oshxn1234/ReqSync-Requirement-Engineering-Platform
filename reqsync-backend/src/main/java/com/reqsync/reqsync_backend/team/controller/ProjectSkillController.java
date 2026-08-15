package com.reqsync.reqsync_backend.team.controller;

import com.reqsync.reqsync_backend.team.dto.ProjectRequiredSkillResponse;
import com.reqsync.reqsync_backend.team.service.ProjectSkillExtractionService;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(
        "/api/projects/{projectId}/skills"
)
public class ProjectSkillController {

    private final ProjectSkillExtractionService
            projectSkillExtractionService;


    public ProjectSkillController(
            ProjectSkillExtractionService projectSkillExtractionService
    ) {

        this.projectSkillExtractionService =
                projectSkillExtractionService;
    }


    // =========================================================
    // GENERATE SKILLS
    // =========================================================

    /**
     * POST
     * /api/projects/1/skills/generate
     */
    @PostMapping(
            "/generate"
    )
    public ResponseEntity<
            List<ProjectRequiredSkillResponse>
            >
    generateProjectSkills(
            @PathVariable
            Long projectId
    ) {

        return ResponseEntity.ok(
                projectSkillExtractionService
                        .generateProjectSkills(
                                projectId
                        )
        );
    }


    // =========================================================
    // GET SKILLS
    // =========================================================

    /**
     * GET
     * /api/projects/1/skills
     */
    @GetMapping
    public ResponseEntity<
            List<ProjectRequiredSkillResponse>
            >
    getProjectSkills(
            @PathVariable
            Long projectId
    ) {

        return ResponseEntity.ok(
                projectSkillExtractionService
                        .getProjectSkills(
                                projectId
                        )
        );
    }
}