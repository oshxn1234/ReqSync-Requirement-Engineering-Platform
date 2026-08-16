package com.reqsync.reqsync_backend.developer.service;

import com.reqsync.reqsync_backend.developer.dto.DeveloperSubmissionRequest;
import com.reqsync.reqsync_backend.developer.entity.DeveloperSubmission;
import com.reqsync.reqsync_backend.developer.entity.DeveloperTask;
import com.reqsync.reqsync_backend.developer.entity.SubmissionStatus;
import com.reqsync.reqsync_backend.developer.entity.TaskStatus;
import com.reqsync.reqsync_backend.developer.repository.DeveloperSubmissionRepository;
import com.reqsync.reqsync_backend.developer.repository.DeveloperTaskRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DeveloperSubmissionService {

    private final DeveloperSubmissionRepository submissionRepository;

    private final DeveloperTaskRepository taskRepository;


    public DeveloperSubmissionService(
            DeveloperSubmissionRepository submissionRepository,
            DeveloperTaskRepository taskRepository
    ) {

        this.submissionRepository =
                submissionRepository;

        this.taskRepository =
                taskRepository;
    }


    // ==========================================
    // Submit Development Work
    // ==========================================

    @Transactional
    public DeveloperSubmission submit(
            Long taskId,
            Long developerId,
            DeveloperSubmissionRequest request
    ) {

        DeveloperTask task =
                taskRepository
                        .findById(taskId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Developer task not found."
                                )
                        );


        if (!task.getAssignedDeveloperId()
                .equals(developerId)) {

            throw new IllegalArgumentException(
                    "You are not assigned to this task."
            );
        }


        if (task.getStatus() !=
                TaskStatus.IN_PROGRESS &&
                task.getStatus() !=
                        TaskStatus.CHANGES_REQUESTED) {

            throw new IllegalStateException(
                    "Task is not ready for submission."
            );
        }


        if (request.getImplementationNotes() == null ||
                request.getImplementationNotes().isBlank()) {

            throw new IllegalArgumentException(
                    "Implementation notes are required."
            );
        }


        DeveloperSubmission submission =
                new DeveloperSubmission(
                        task,
                        developerId,
                        request.getImplementationNotes(),
                        request.getGithubBranch(),
                        request.getPullRequestUrl(),
                        request.getCommitHash()
                );


        task.setStatus(
                TaskStatus.READY_FOR_QA
        );

        taskRepository.save(task);


        return submissionRepository.save(
                submission
        );
    }


    // ==========================================
    // Get Task Submissions
    // ==========================================

    public List<DeveloperSubmission>
    getTaskSubmissions(
            Long taskId
    ) {

        return submissionRepository
                .findByTaskId(taskId);
    }


    // ==========================================
    // Get Developer Submissions
    // ==========================================

    public List<DeveloperSubmission>
    getDeveloperSubmissions(
            Long developerId
    ) {

        return submissionRepository
                .findByDeveloperId(
                        developerId
                );
    }
}