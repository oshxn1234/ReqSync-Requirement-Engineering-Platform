package com.reqsync.reqsync_backend.developer.service;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.developer.dto.DeveloperSubmissionResponse;
import com.reqsync.reqsync_backend.developer.dto.QAReviewRequest;
import com.reqsync.reqsync_backend.developer.dto.QAReviewResponse;

import com.reqsync.reqsync_backend.developer.entity.DeveloperSubmission;
import com.reqsync.reqsync_backend.developer.entity.DeveloperTask;
import com.reqsync.reqsync_backend.developer.entity.QAReview;
import com.reqsync.reqsync_backend.developer.entity.QAReviewStatus;
import com.reqsync.reqsync_backend.developer.entity.SubmissionStatus;
import com.reqsync.reqsync_backend.developer.entity.TaskStatus;

import com.reqsync.reqsync_backend.developer.repository.DeveloperSubmissionRepository;
import com.reqsync.reqsync_backend.developer.repository.DeveloperTaskRepository;
import com.reqsync.reqsync_backend.developer.repository.QAReviewRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class QAReviewService {

    private final QAReviewRepository
            qaReviewRepository;

    private final DeveloperSubmissionRepository
            submissionRepository;

    private final DeveloperTaskRepository
            taskRepository;

    private final UserRepository
            userRepository;


    public QAReviewService(
            QAReviewRepository qaReviewRepository,
            DeveloperSubmissionRepository submissionRepository,
            DeveloperTaskRepository taskRepository,
            UserRepository userRepository
    ) {

        this.qaReviewRepository =
                qaReviewRepository;

        this.submissionRepository =
                submissionRepository;

        this.taskRepository =
                taskRepository;

        this.userRepository =
                userRepository;
    }


    // =====================================================
    // GET QA SUBMISSIONS
    // =====================================================

    @Transactional(readOnly = true)
    public List<DeveloperSubmissionResponse>
    getSubmissions(
            String qaEmail
    ) {

        getQAUser(
                qaEmail
        );


        return submissionRepository
                .findAllByOrderBySubmittedAtDesc()
                .stream()
                .map(
                        DeveloperSubmissionResponse::from
                )
                .toList();
    }


    // =====================================================
    // GET PENDING QA SUBMISSIONS
    // =====================================================

    @Transactional(readOnly = true)
    public List<DeveloperSubmissionResponse>
    getPendingSubmissions(
            String qaEmail
    ) {

        getQAUser(
                qaEmail
        );


        return submissionRepository
                .findByStatus(
                        SubmissionStatus.SUBMITTED
                )
                .stream()
                .map(
                        DeveloperSubmissionResponse::from
                )
                .toList();
    }


    // =====================================================
    // GET APPROVED SUBMISSIONS
    // =====================================================

    @Transactional(readOnly = true)
    public List<DeveloperSubmissionResponse>
    getApprovedSubmissions(
            String qaEmail
    ) {

        getQAUser(
                qaEmail
        );


        return submissionRepository
                .findByStatus(
                        SubmissionStatus.APPROVED
                )
                .stream()
                .map(
                        DeveloperSubmissionResponse::from
                )
                .toList();
    }


    // =====================================================
    // GET REJECTED SUBMISSIONS
    // =====================================================

    @Transactional(readOnly = true)
    public List<DeveloperSubmissionResponse>
    getRejectedSubmissions(
            String qaEmail
    ) {

        getQAUser(
                qaEmail
        );


        return submissionRepository
                .findByStatus(
                        SubmissionStatus.REJECTED
                )
                .stream()
                .map(
                        DeveloperSubmissionResponse::from
                )
                .toList();
    }


    // =====================================================
    // QA REVIEW
    // =====================================================

    @Transactional
    public QAReviewResponse reviewSubmission(
            Long submissionId,
            QAReviewRequest request,
            String qaEmail
    ) {

        User qaUser =
                getQAUser(
                        qaEmail
                );


        DeveloperSubmission submission =
                submissionRepository
                        .findById(
                                submissionId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Developer submission not found."
                                        )
                        );


        /*
         * Only submitted items should enter QA.
         */
        if (
                submission.getStatus()
                        != SubmissionStatus.SUBMITTED
        ) {

            throw new RuntimeException(
                    "This submission is not waiting for QA review."
            );
        }


        /*
         * Prevent duplicate review.
         */
        if (
                qaReviewRepository
                        .findBySubmissionId(
                                submissionId
                        )
                        .isPresent()
        ) {

            throw new RuntimeException(
                    "This submission has already been reviewed."
            );
        }


        if (
                request.getStatus()
                        == null
        ) {

            throw new RuntimeException(
                    "QA review status is required."
            );
        }


        /*
         * Feedback should be provided when QA
         * rejects developer work.
         */
        if (
                request.getStatus()
                        == QAReviewStatus.REJECTED
                        &&
                        (
                                request.getFeedback()
                                        == null
                                        ||
                                        request.getFeedback()
                                                .isBlank()
                        )
        ) {

            throw new RuntimeException(
                    "QA feedback is required when requesting changes."
            );
        }


        DeveloperTask task =
                submission.getTask();


        /*
         * Temporarily mark QA processing.
         */
        submission.setStatus(
                SubmissionStatus.QA_REVIEW
        );


        task.setStatus(
                TaskStatus.QA_IN_PROGRESS
        );


        submissionRepository.save(
                submission
        );


        taskRepository.save(
                task
        );


        QAReview review =
                new QAReview(
                        submission,
                        qaUser,
                        request.getStatus(),
                        request.getFeedback()
                );


        QAReview savedReview =
                qaReviewRepository.save(
                        review
                );


        // =================================================
        // APPROVED
        // =================================================

        if (
                request.getStatus()
                        == QAReviewStatus.APPROVED
        ) {

            submission.setStatus(
                    SubmissionStatus.APPROVED
            );


            task.setStatus(
                    TaskStatus.COMPLETED
            );
        }


        // =================================================
        // REJECTED / CHANGES REQUESTED
        // =================================================

        else if (
                request.getStatus()
                        == QAReviewStatus.REJECTED
        ) {

            submission.setStatus(
                    SubmissionStatus.REJECTED
            );


            /*
             * Developer can now continue the task
             * and resubmit work.
             */
            task.setStatus(
                    TaskStatus.CHANGES_REQUESTED
            );
        }


        submissionRepository.save(
                submission
        );


        taskRepository.save(
                task
        );


        return QAReviewResponse.from(
                savedReview
        );
    }


    // =====================================================
    // GET QA USER
    // =====================================================

    private User getQAUser(
            String qaEmail
    ) {

        User qaUser =
                userRepository
                        .findByEmailIgnoreCase(
                                qaEmail
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "QA user not found."
                                        )
                        );


        if (
                qaUser.getRole()
                        != Role.QA_ENGINEER
        ) {

            throw new RuntimeException(
                    "Only QA engineers can access QA reviews."
            );
        }


        if (
                !qaUser.isEnabled()
        ) {

            throw new RuntimeException(
                    "QA account is disabled."
            );
        }


        if (
                qaUser.isAccountLocked()
        ) {

            throw new RuntimeException(
                    "QA account is locked."
            );
        }


        return qaUser;
    }
}