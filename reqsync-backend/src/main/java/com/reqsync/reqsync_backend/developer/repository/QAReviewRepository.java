package com.reqsync.reqsync_backend.developer.repository;

import com.reqsync.reqsync_backend.developer.entity.QAReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QAReviewRepository
        extends JpaRepository<QAReview, Long> {

    Optional<QAReview> findBySubmissionId(
            Long submissionId
    );
}