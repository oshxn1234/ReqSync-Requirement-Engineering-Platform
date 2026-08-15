package com.reqsync.reqsync_backend.userstory.controller;

import com.reqsync.reqsync_backend.userstory.dto.UserStoryResponse;
import com.reqsync.reqsync_backend.userstory.dto.UserStoryUpdateRequest;

import com.reqsync.reqsync_backend.userstory.service.UserStoryGenerationService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserStoryController {

    private final UserStoryGenerationService
            userStoryGenerationService;


    public UserStoryController(
            UserStoryGenerationService userStoryGenerationService
    ) {

        this.userStoryGenerationService =
                userStoryGenerationService;
    }


    // ==========================================
    // GENERATE
    // ==========================================

    @PostMapping(
            "/projects/{projectId}/user-stories/generate"
    )
    @PreAuthorize(
            "hasRole('BUSINESS_ANALYST')"
    )
    public ResponseEntity<List<UserStoryResponse>>
    generate(
            @PathVariable
            Long projectId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                userStoryGenerationService
                        .generate(
                                projectId,
                                authentication
                        )
        );
    }


    // ==========================================
    // GET PROJECT USER STORIES
    // ==========================================

    @GetMapping(
            "/projects/{projectId}/user-stories"
    )
    public ResponseEntity<List<UserStoryResponse>>
    getProjectUserStories(
            @PathVariable
            Long projectId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                userStoryGenerationService
                        .getProjectUserStories(
                                projectId,
                                authentication
                        )
        );
    }


    // ==========================================
    // UPDATE
    // ==========================================

    @PutMapping(
            "/user-stories/{storyId}"
    )
    @PreAuthorize(
            "hasRole('BUSINESS_ANALYST')"
    )
    public ResponseEntity<UserStoryResponse>
    update(
            @PathVariable
            Long storyId,

            @RequestBody
            UserStoryUpdateRequest request,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                userStoryGenerationService
                        .update(
                                storyId,
                                request,
                                authentication
                        )
        );
    }


    // ==========================================
    // DELETE
    // ==========================================

    @DeleteMapping(
            "/user-stories/{storyId}"
    )
    @PreAuthorize(
            "hasRole('BUSINESS_ANALYST')"
    )
    public ResponseEntity<Void>
    delete(
            @PathVariable
            Long storyId,

            Authentication authentication
    ) {

        userStoryGenerationService
                .delete(
                        storyId,
                        authentication
                );


        return ResponseEntity
                .noContent()
                .build();
    }
}