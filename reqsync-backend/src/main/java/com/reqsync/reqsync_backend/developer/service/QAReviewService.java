package com.reqsync.reqsync_backend.developer.service;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.developer.dto.QAReviewRequest;
import com.reqsync.reqsync_backend.developer.entity.DeveloperSubmission;
import com.reqsync.reqsync_backend.developer.entity.QAReview;
import com.reqsync.reqsync_backend.developer.entity.QAReviewStatus;

import com.reqsync.reqsync_backend.developer.repository.DeveloperSubmissionRepository;
import com.reqsync.reqsync_backend.developer.repository.QAReviewRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QAReviewService {

    private final QAReviewRepository qaReviewRepository;

    private final DeveloperSubmissionRepository
            submissionRepository;

    private final UserRepository userRepository;


    public QAReviewService(
            QAReviewRepository qaReviewRepository,
            DeveloperSubmissionRepository submissionRepository,
            UserRepository userRepository
    ) {

        this.qaReviewRepository =
                qaReviewRepository;

        this.submissionRepository =
                submissionRepository;

        this.userRepository =
                userRepository;
    }


    // =====================================================
    // QA Review
    // =====================================================

    @Transactional
    public QAReview reviewSubmission(
            Long submissionId,
            QAReviewRequest request,
            String qaEmail
    ) {

        // -------------------------------------------------
        // Find QA user
        // -------------------------------------------------

        User qaUser =
                userRepository
                        .findByEmailIgnoreCase(
                                qaEmail
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "QA user not found."
                                )
                        );


        // -------------------------------------------------
        // Verify QA role
        // -------------------------------------------------

        if (
                qaUser.getRole()
                        != Role.QA_ENGINEER
        ) {

            throw new RuntimeException(
                    "Only QA engineers can review submissions."
            );
        }


        // -------------------------------------------------
        // Find submission
        // -------------------------------------------------

        DeveloperSubmission submission =
                submissionRepository
                        .findById(submissionId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Developer submission not found."
                                )
                        );


        // -------------------------------------------------
        // Prevent duplicate review
        // -------------------------------------------------

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


        // -------------------------------------------------
        // Validate decision
        // -------------------------------------------------

        if (request.getStatus() == null) {

            throw new RuntimeException(
                    "QA review status is required."
            );
        }


        // -------------------------------------------------
        // Create QA Review
        // -------------------------------------------------

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


        // -------------------------------------------------
        // Update submission status
        // -------------------------------------------------

        /*
         * Your DeveloperSubmission entity should have
         * a status field.
         *
         * We will connect this section to your exact
         * existing status implementation.
         */

        return savedReview;
    }
}