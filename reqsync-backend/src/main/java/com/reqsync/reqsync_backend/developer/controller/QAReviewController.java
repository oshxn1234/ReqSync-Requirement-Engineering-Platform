package com.reqsync.reqsync_backend.developer.controller;

import com.reqsync.reqsync_backend.developer.dto.QAReviewRequest;
import com.reqsync.reqsync_backend.developer.entity.QAReview;
import com.reqsync.reqsync_backend.developer.service.QAReviewService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/developer/qa")
public class QAReviewController {

    private final QAReviewService qaReviewService;


    public QAReviewController(
            QAReviewService qaReviewService
    ) {

        this.qaReviewService =
                qaReviewService;
    }


    // =====================================================
    // QA Review Developer Submission
    // =====================================================

    @PostMapping(
            "/submissions/{submissionId}/review"
    )
    public ResponseEntity<?> reviewSubmission(

            @PathVariable Long submissionId,

            @RequestBody QAReviewRequest request,

            Authentication authentication
    ) {

        QAReview review =
                qaReviewService.reviewSubmission(
                        submissionId,
                        request,
                        authentication.getName()
                );


        return ResponseEntity.ok(
                review
        );
    }
}