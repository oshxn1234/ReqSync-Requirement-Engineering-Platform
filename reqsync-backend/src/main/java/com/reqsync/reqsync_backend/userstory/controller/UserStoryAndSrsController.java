package com.reqsync.reqsync_backend.userstory.controller;

import com.reqsync.reqsync_backend.userstory.dto.*;
import com.reqsync.reqsync_backend.userstory.service.UserStoryAndSrsGenerationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/userstory")
public class UserStoryAndSrsController {

    private final UserStoryAndSrsGenerationService userStoryService;

    public UserStoryAndSrsController(
            UserStoryAndSrsGenerationService userStoryService
    ) {
        this.userStoryService = userStoryService;
    }

    @PostMapping("/generate")
    public ResponseEntity<UserStoryAndSrsGenerationResponse> generateUserStoriesAndSrs(
            @Valid
            @RequestBody
            UserStoryAndSrsGenerationRequest request
    ) {
        UserStoryAndSrsGenerationResponse response = 
                userStoryService.generateUserStoriesAndSrs(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/user-stories")
    public ResponseEntity<UserStoryAndSrsGenerationResponse> generateOnlyUserStories(
            @Valid
            @RequestBody
            UserStoryAndSrsGenerationRequest request
    ) {
        UserStoryAndSrsGenerationResponse response = 
                userStoryService.generateUserStoriesAndSrs(request);
        return ResponseEntity.ok(
                new UserStoryAndSrsGenerationResponse(
                        response.projectName(),
                        response.userStories(),
                        null
                )
        );
    }

    @PostMapping("/srs")
    public ResponseEntity<UserStoryAndSrsGenerationResponse> generateOnlySrs(
            @Valid
            @RequestBody
            UserStoryAndSrsGenerationRequest request
    ) {
        UserStoryAndSrsGenerationResponse response = 
                userStoryService.generateUserStoriesAndSrs(request);
        return ResponseEntity.ok(
                new UserStoryAndSrsGenerationResponse(
                        response.projectName(),
                        null,
                        response.srsDocument()
                )
        );
    }
}
