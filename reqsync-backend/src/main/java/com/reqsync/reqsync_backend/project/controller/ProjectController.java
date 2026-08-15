package com.reqsync.reqsync_backend.project.controller;

import com.reqsync.reqsync_backend.project.dto.ProjectCreateRequest;
import com.reqsync.reqsync_backend.project.dto.ProjectResponse;
import com.reqsync.reqsync_backend.project.dto.ProjectUpdateRequest;
import com.reqsync.reqsync_backend.project.enums.ProjectStatus;
import com.reqsync.reqsync_backend.project.service.ProjectService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService
            projectService;


    public ProjectController(
            ProjectService projectService
    ) {

        this.projectService =
                projectService;
    }


    // =========================================================
    // CREATE PROJECT
    // =========================================================

    /**
     * Create project.
     *
     * Only CEO can create projects.
     *
     * POST /api/projects
     */
    @PostMapping
    @PreAuthorize(
            "hasRole('CEO')"
    )
    public ResponseEntity<ProjectResponse>
    createProject(
            @RequestBody
            ProjectCreateRequest request,

            Authentication authentication
    ) {

        ProjectResponse response =
                projectService
                        .createProject(
                                request,
                                authentication
                        );


        return ResponseEntity.ok(
                response
        );
    }


    // =========================================================
    // GET ALL PROJECTS
    // =========================================================

    /**
     * Get all projects belonging to
     * the authenticated user's business.
     *
     * GET /api/projects
     */
    @GetMapping
    public ResponseEntity<
            List<ProjectResponse>
            >
    getAllProjects(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                projectService
                        .getAllProjects(
                                authentication
                        )
        );
    }


    // =========================================================
    // GET ONE PROJECT
    // =========================================================

    /**
     * Get one project.
     *
     * The project must belong to
     * the authenticated user's business.
     *
     * GET /api/projects/1
     */
    @GetMapping(
            "/{projectId}"
    )
    public ResponseEntity<ProjectResponse>
    getProjectById(
            @PathVariable
            Long projectId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                projectService
                        .getProjectById(
                                projectId,
                                authentication
                        )
        );
    }


    // =========================================================
    // FILTER BY STATUS
    // =========================================================

    /**
     * Get projects belonging to
     * authenticated user's business
     * filtered by status.
     *
     * GET /api/projects/status/ACTIVE
     */
    @GetMapping(
            "/status/{status}"
    )
    public ResponseEntity<
            List<ProjectResponse>
            >
    getByStatus(
            @PathVariable
            ProjectStatus status,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                projectService
                        .getProjectsByStatus(
                                status,
                                authentication
                        )
        );
    }


    // =========================================================
    // UPDATE PROJECT
    // =========================================================

    /**
     * Update project.
     *
     * Only CEO can update
     * project information.
     *
     * PUT /api/projects/1
     */
    @PutMapping(
            "/{projectId}"
    )
    @PreAuthorize(
            "hasRole('CEO')"
    )
    public ResponseEntity<ProjectResponse>
    updateProject(
            @PathVariable
            Long projectId,

            @RequestBody
            ProjectUpdateRequest request,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                projectService
                        .updateProject(
                                projectId,
                                request,
                                authentication
                        )
        );
    }


    // =========================================================
    // DELETE PROJECT
    // =========================================================

    /**
     * Delete project.
     *
     * Only CEO can delete.
     *
     * DELETE /api/projects/1
     */
    @DeleteMapping(
            "/{projectId}"
    )
    @PreAuthorize(
            "hasRole('CEO')"
    )
    public ResponseEntity<Void>
    deleteProject(
            @PathVariable
            Long projectId,

            Authentication authentication
    ) {

        projectService
                .deleteProject(
                        projectId,
                        authentication
                );


        return ResponseEntity
                .noContent()
                .build();
    }

    // =========================================================
// ASSIGN PROJECT MANAGER
// =========================================================

    /**
     * CEO assigns Project Manager.
     *
     * PUT
     * /api/projects/{projectId}/project-manager/{managerId}
     *
     * Example:
     *
     * /api/projects/5/project-manager/8
     */
    @PutMapping(
            "/{projectId}/project-manager/{managerId}"
    )
    @PreAuthorize(
            "hasRole('CEO')"
    )
    public ResponseEntity<ProjectResponse>
    assignProjectManager(
            @PathVariable
            Long projectId,

            @PathVariable
            Long managerId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                projectService
                        .assignProjectManager(
                                projectId,
                                managerId,
                                authentication
                        )
        );
    }
}