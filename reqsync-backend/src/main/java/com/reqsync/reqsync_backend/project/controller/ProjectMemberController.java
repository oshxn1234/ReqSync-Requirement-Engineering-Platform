package com.reqsync.reqsync_backend.project.controller;

import com.reqsync.reqsync_backend.project.dto.ProjectMemberResponse;
import com.reqsync.reqsync_backend.project.service.ProjectMemberService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(
        "/api/projects/{projectId}/members"
)
public class ProjectMemberController {

    private final ProjectMemberService
            projectMemberService;


    public ProjectMemberController(
            ProjectMemberService projectMemberService
    ) {

        this.projectMemberService =
                projectMemberService;
    }


    // ==========================================
    // ADD EXISTING EMPLOYEE
    // ==========================================

    /**
     * PM does NOT create the employee.
     *
     * PM only assigns an existing employee.
     *
     * POST
     * /api/projects/1/members/8
     */
    @PostMapping(
            "/{userId}"
    )
    @PreAuthorize(
            "hasRole('PROJECT_MANAGER')"
    )
    public ResponseEntity<ProjectMemberResponse>
    addMember(
            @PathVariable
            Long projectId,

            @PathVariable
            Long userId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                projectMemberService
                        .addMember(
                                projectId,
                                userId,
                                authentication
                        )
        );
    }


    // ==========================================
    // GET MEMBERS
    // ==========================================

    @GetMapping
    public ResponseEntity<
            List<ProjectMemberResponse>
            >
    getProjectMembers(
            @PathVariable
            Long projectId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                projectMemberService
                        .getProjectMembers(
                                projectId,
                                authentication
                        )
        );
    }


    // ==========================================
    // REMOVE MEMBER
    // ==========================================

    /**
     * Does NOT delete User.
     *
     * Only removes project membership.
     */
    @DeleteMapping(
            "/{userId}"
    )
    @PreAuthorize(
            "hasRole('PROJECT_MANAGER')"
    )
    public ResponseEntity<Void>
    removeMember(
            @PathVariable
            Long projectId,

            @PathVariable
            Long userId,

            Authentication authentication
    ) {

        projectMemberService
                .removeMember(
                        projectId,
                        userId,
                        authentication
                );


        return ResponseEntity
                .noContent()
                .build();
    }
}