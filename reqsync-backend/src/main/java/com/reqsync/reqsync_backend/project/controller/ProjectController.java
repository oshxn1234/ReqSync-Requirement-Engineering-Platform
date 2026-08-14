package com.reqsync.reqsync_backend.project.controller;

import com.reqsync.reqsync_backend.project.dto.ProjectCreateRequest;
import com.reqsync.reqsync_backend.project.dto.ProjectResponse;
import com.reqsync.reqsync_backend.project.dto.ProjectUpdateRequest;
import com.reqsync.reqsync_backend.project.enums.ProjectStatus;
import com.reqsync.reqsync_backend.project.service.ProjectService;
import org.springframework.http.ResponseEntity;
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


    /**
     * Create project.
     *
     * POST /api/projects
     */
    @PostMapping
    public ResponseEntity<ProjectResponse>
    createProject(
            @RequestBody
            ProjectCreateRequest request
    ) {

        ProjectResponse response =
                projectService
                        .createProject(
                                request
                        );


        return ResponseEntity.ok(
                response
        );
    }


    /**
     * Get all projects.
     *
     * GET /api/projects
     */
    @GetMapping
    public ResponseEntity<List<ProjectResponse>>
    getAllProjects() {

        return ResponseEntity.ok(
                projectService
                        .getAllProjects()
        );
    }


    /**
     * Get one project.
     *
     * GET /api/projects/1
     */
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse>
    getProjectById(
            @PathVariable
            Long projectId
    ) {

        return ResponseEntity.ok(
                projectService
                        .getProjectById(
                                projectId
                        )
        );
    }


    /**
     * Filter projects by status.
     *
     * GET /api/projects/status/ACTIVE
     */
    @GetMapping(
            "/status/{status}"
    )
    public ResponseEntity<List<ProjectResponse>>
    getByStatus(
            @PathVariable
            ProjectStatus status
    ) {

        return ResponseEntity.ok(
                projectService
                        .getProjectsByStatus(
                                status
                        )
        );
    }


    /**
     * Update project.
     *
     * PUT /api/projects/1
     */
    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse>
    updateProject(
            @PathVariable
            Long projectId,

            @RequestBody
            ProjectUpdateRequest request
    ) {

        return ResponseEntity.ok(
                projectService
                        .updateProject(
                                projectId,
                                request
                        )
        );
    }


    /**
     * Delete project.
     *
     * DELETE /api/projects/1
     */
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void>
    deleteProject(
            @PathVariable
            Long projectId
    ) {

        projectService
                .deleteProject(
                        projectId
                );


        return ResponseEntity
                .noContent()
                .build();
    }
}