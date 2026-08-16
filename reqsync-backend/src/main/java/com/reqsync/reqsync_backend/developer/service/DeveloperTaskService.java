package com.reqsync.reqsync_backend.developer.service;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.developer.dto.DeveloperTaskRequest;
import com.reqsync.reqsync_backend.developer.entity.DeveloperTask;
import com.reqsync.reqsync_backend.developer.entity.TaskStatus;
import com.reqsync.reqsync_backend.developer.repository.DeveloperTaskRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DeveloperTaskService {

    private final DeveloperTaskRepository taskRepository;

    private final UserRepository userRepository;


    public DeveloperTaskService(
            DeveloperTaskRepository taskRepository,
            UserRepository userRepository
    ) {

        this.taskRepository =
                taskRepository;

        this.userRepository =
                userRepository;
    }


    // ==========================================
    // Create Task
    // ==========================================

    @Transactional
    public DeveloperTask createTask(
            DeveloperTaskRequest request
    ) {

        validateRequest(request);


        User developer =
                userRepository
                        .findById(
                                request.getAssignedDeveloperId()
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Developer not found."
                                )
                        );


        if (developer.getRole()
                != Role.DEVELOPER) {

            throw new IllegalArgumentException(
                    "Selected user is not a developer."
            );
        }


        if (!developer.isEnabled()) {

            throw new IllegalArgumentException(
                    "Developer account is disabled."
            );
        }


        if (developer.isAccountLocked()) {

            throw new IllegalArgumentException(
                    "Developer account is locked."
            );
        }


        DeveloperTask task =
                new DeveloperTask(
                        request.getRequirementId(),
                        request.getUserStoryId(),
                        request.getAssignedDeveloperId(),
                        request.getTitle(),
                        request.getDescription(),
                        request.getPriority()
                );


        return taskRepository.save(task);
    }


    // ==========================================
    // Get Task
    // ==========================================

    public DeveloperTask getTask(
            Long taskId
    ) {

        return taskRepository
                .findById(taskId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Developer task not found."
                        )
                );
    }


    // ==========================================
    // Get Developer Tasks
    // ==========================================

    public List<DeveloperTask> getDeveloperTasks(
            Long developerId
    ) {

        return taskRepository
                .findByAssignedDeveloperId(
                        developerId
                );
    }


    // ==========================================
    // Update Task Status
    // ==========================================

    @Transactional
    public DeveloperTask updateStatus(
            Long taskId,
            Long developerId,
            String status
    ) {

        DeveloperTask task =
                getTask(taskId);


        if (!task.getAssignedDeveloperId()
                .equals(developerId)) {

            throw new IllegalArgumentException(
                    "You are not assigned to this task."
            );
        }


        TaskStatus newStatus;


        try {

            newStatus =
                    TaskStatus.valueOf(
                            status.toUpperCase()
                    );

        } catch (IllegalArgumentException exception) {

            throw new IllegalArgumentException(
                    "Invalid task status."
            );
        }


        task.setStatus(newStatus);


        return taskRepository.save(task);
    }


    // ==========================================
    // Validate Request
    // ==========================================

    private void validateRequest(
            DeveloperTaskRequest request
    ) {

        if (request.getRequirementId() == null) {

            throw new IllegalArgumentException(
                    "Requirement ID is required."
            );
        }


        if (request.getUserStoryId() == null) {

            throw new IllegalArgumentException(
                    "User story ID is required."
            );
        }


        if (request.getAssignedDeveloperId() == null) {

            throw new IllegalArgumentException(
                    "Developer ID is required."
            );
        }


        if (request.getTitle() == null ||
                request.getTitle().isBlank()) {

            throw new IllegalArgumentException(
                    "Task title is required."
            );
        }


        if (request.getDescription() == null ||
                request.getDescription().isBlank()) {

            throw new IllegalArgumentException(
                    "Task description is required."
            );
        }
    }
}