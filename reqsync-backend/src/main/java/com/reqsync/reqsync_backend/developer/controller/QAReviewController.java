package com.reqsync.reqsync_backend.developer.controller;

import com.reqsync.reqsync_backend.developer.dto.DeveloperSubmissionResponse;
import com.reqsync.reqsync_backend.developer.dto.QAReviewRequest;
import com.reqsync.reqsync_backend.developer.dto.QAReviewResponse;

import com.reqsync.reqsync_backend.developer.service.QAReviewService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/developer/qa")
@PreAuthorize(
        "hasRole('QA_ENGINEER')"
)
public class QAReviewController {

    private final QAReviewService
            qaReviewService;


    public QAReviewController(
            QAReviewService qaReviewService
    ) {

        this.qaReviewService =
                qaReviewService;
    }


    // =====================================================
    // GET ALL QA SUBMISSIONS
    // =====================================================

    @GetMapping(
            "/submissions"
    )
    public ResponseEntity<
            List<DeveloperSubmissionResponse>
            >
    getSubmissions(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                qaReviewService
                        .getSubmissions(
                                authentication.getName()
                        )
        );
    }


    // =====================================================
    // GET PENDING QA SUBMISSIONS
    // =====================================================

    @GetMapping(
            "/submissions/pending"
    )
    public ResponseEntity<
            List<DeveloperSubmissionResponse>
            >
    getPendingSubmissions(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                qaReviewService
                        .getPendingSubmissions(
                                authentication.getName()
                        )
        );
    }


    // =====================================================
    // GET APPROVED SUBMISSIONS
    // =====================================================

    @GetMapping(
            "/submissions/approved"
    )
    public ResponseEntity<
            List<DeveloperSubmissionResponse>
            >
    getApprovedSubmissions(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                qaReviewService
                        .getApprovedSubmissions(
                                authentication.getName()
                        )
        );
    }


    // =====================================================
    // GET REJECTED SUBMISSIONS
    // =====================================================

    @GetMapping(
            "/submissions/rejected"
    )
    public ResponseEntity<
            List<DeveloperSubmissionResponse>
            >
    getRejectedSubmissions(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                qaReviewService
                        .getRejectedSubmissions(
                                authentication.getName()
                        )
        );
    }


    // =====================================================
    // REVIEW SUBMISSION
    // =====================================================

    @PostMapping(
            "/submissions/{submissionId}/review"
    )
    public ResponseEntity<
            QAReviewResponse
            >
    reviewSubmission(
            @PathVariable
            Long submissionId,

            @RequestBody
            QAReviewRequest request,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                qaReviewService
                        .reviewSubmission(
                                submissionId,
                                request,
                                authentication.getName()
                        )
        );
    }
}