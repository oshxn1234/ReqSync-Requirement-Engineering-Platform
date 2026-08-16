package com.reqsync.reqsync_backend.developer.entity;

import com.reqsync.reqsync_backend.auth.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "qa_reviews")
public class QAReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // Developer Submission
    // =====================================================

    @OneToOne
    @JoinColumn(
            name = "submission_id",
            nullable = false,
            unique = true
    )
    private DeveloperSubmission submission;


    // =====================================================
    // QA Engineer
    // =====================================================

    @ManyToOne
    @JoinColumn(
            name = "qa_user_id",
            nullable = false
    )
    private User qaUser;


    // =====================================================
    // Review Status
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private QAReviewStatus status;


    // =====================================================
    // QA Feedback
    // =====================================================

    @Column(
            columnDefinition = "TEXT"
    )
    private String feedback;


    // =====================================================
    // Review Time
    // =====================================================

    @Column(nullable = false)
    private LocalDateTime reviewedAt;


    // =====================================================
    // Constructors
    // =====================================================

    public QAReview() {
    }


    public QAReview(
            DeveloperSubmission submission,
            User qaUser,
            QAReviewStatus status,
            String feedback
    ) {

        this.submission = submission;
        this.qaUser = qaUser;
        this.status = status;
        this.feedback = feedback;
        this.reviewedAt = LocalDateTime.now();
    }


    // =====================================================
    // Getters / Setters
    // =====================================================

    public Long getId() {
        return id;
    }

    public DeveloperSubmission getSubmission() {
        return submission;
    }

    public void setSubmission(
            DeveloperSubmission submission
    ) {
        this.submission = submission;
    }

    public User getQaUser() {
        return qaUser;
    }

    public void setQaUser(User qaUser) {
        this.qaUser = qaUser;
    }

    public QAReviewStatus getStatus() {
        return status;
    }

    public void setStatus(QAReviewStatus status) {
        this.status = status;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(
            LocalDateTime reviewedAt
    ) {
        this.reviewedAt = reviewedAt;
    }
}