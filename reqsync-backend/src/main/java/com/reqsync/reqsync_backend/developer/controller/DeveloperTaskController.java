package com.reqsync.reqsync_backend.developer.controller;

import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.developer.dto.DeveloperSubmissionRequest;
import com.reqsync.reqsync_backend.developer.dto.DeveloperSubmissionResponse;
import com.reqsync.reqsync_backend.developer.dto.DeveloperTaskRequest;
import com.reqsync.reqsync_backend.developer.dto.DeveloperTaskResponse;
import com.reqsync.reqsync_backend.developer.dto.TaskStatusUpdateRequest;

import com.reqsync.reqsync_backend.developer.entity.DeveloperSubmission;
import com.reqsync.reqsync_backend.developer.entity.DeveloperTask;

import com.reqsync.reqsync_backend.developer.service.DeveloperSubmissionService;
import com.reqsync.reqsync_backend.developer.service.DeveloperTaskService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/developer")
public class DeveloperTaskController {

    private final DeveloperTaskService taskService;

    private final DeveloperSubmissionService submissionService;

    private final UserRepository userRepository;


    public DeveloperTaskController(
            DeveloperTaskService taskService,
            DeveloperSubmissionService submissionService,
            UserRepository userRepository
    ) {

        this.taskService =
                taskService;

        this.submissionService =
                submissionService;

        this.userRepository =
                userRepository;
    }


    // ==========================================
    // Create Developer Task
    // ==========================================

    @PostMapping("/tasks")
    public ResponseEntity<?> createTask(
            @RequestBody DeveloperTaskRequest request
    ) {

        DeveloperTask task =
                taskService.createTask(
                        request
                );


        return ResponseEntity.ok(
                DeveloperTaskResponse.from(task)
        );
    }


    // ==========================================
    // Get Task
    // ==========================================

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<?> getTask(
            @PathVariable Long taskId
    ) {

        DeveloperTask task =
                taskService.getTask(
                        taskId
                );


        return ResponseEntity.ok(
                DeveloperTaskResponse.from(task)
        );
    }


    // ==========================================
    // Get My Tasks
    // ==========================================

    @GetMapping("/tasks/my")
    public ResponseEntity<?> getMyTasks(
            Authentication authentication
    ) {

        Long developerId =
                getAuthenticatedUserId(
                        authentication
                );


        List<DeveloperTask> tasks =
                taskService
                        .getDeveloperTasks(
                                developerId
                        );


        List<DeveloperTaskResponse>
                response =
                tasks
                        .stream()
                        .map(
                                DeveloperTaskResponse::from
                        )
                        .collect(
                                Collectors.toList()
                        );


        return ResponseEntity.ok(
                response
        );
    }


    // ==========================================
    // Update Task Status
    // ==========================================

    @PutMapping("/tasks/{taskId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long taskId,
            @RequestBody TaskStatusUpdateRequest request,
            Authentication authentication
    ) {

        Long developerId =
                getAuthenticatedUserId(
                        authentication
                );


        DeveloperTask task =
                taskService.updateStatus(
                        taskId,
                        developerId,
                        request.getStatus()
                );


        return ResponseEntity.ok(
                DeveloperTaskResponse.from(task)
        );
    }


    // ==========================================
    // Submit Development Work
    // ==========================================

    @PostMapping(
            "/tasks/{taskId}/submissions"
    )
    public ResponseEntity<?> submitWork(
            @PathVariable Long taskId,
            @RequestBody DeveloperSubmissionRequest request,
            Authentication authentication
    ) {

        Long developerId =
                getAuthenticatedUserId(
                        authentication
                );


        DeveloperSubmission submission =
                submissionService.submit(
                        taskId,
                        developerId,
                        request
                );


        return ResponseEntity.ok(
                DeveloperSubmissionResponse.from(
                        submission
                )
        );
    }


    // ==========================================
    // Get Task Submissions
    // ==========================================

    @GetMapping(
            "/tasks/{taskId}/submissions"
    )
    public ResponseEntity<?> getSubmissions(
            @PathVariable Long taskId
    ) {

        List<DeveloperSubmission> submissions =
                submissionService
                        .getTaskSubmissions(
                                taskId
                        );


        List<DeveloperSubmissionResponse>
                response =
                submissions
                        .stream()
                        .map(
                                DeveloperSubmissionResponse::from
                        )
                        .collect(
                                Collectors.toList()
                        );


        return ResponseEntity.ok(
                response
        );
    }


    // ==========================================
    // Resolve Current User
    // ==========================================

    private Long getAuthenticatedUserId(
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "User is not authenticated."
            );
        }


        String email =
                authentication.getName();


        User user =
                userRepository
                        .findByEmailIgnoreCase(email)
                        .orElseThrow(
                                () -> new IllegalStateException(
                                        "Authenticated user not found."
                                )
                        );


        return user.getId();
    }
}