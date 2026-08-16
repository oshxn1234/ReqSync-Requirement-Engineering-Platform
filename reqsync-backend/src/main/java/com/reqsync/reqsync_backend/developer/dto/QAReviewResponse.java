package com.reqsync.reqsync_backend.developer.dto;

import com.reqsync.reqsync_backend.developer.entity.QAReview;

import java.time.LocalDateTime;


public class QAReviewResponse {

    private Long id;

    private Long submissionId;

    private Long taskId;

    private Long developerId;

    private Long qaUserId;

    private String qaName;

    private String status;

    private String feedback;

    private LocalDateTime reviewedAt;


    public QAReviewResponse() {
    }


    public static QAReviewResponse from(
            QAReview review
    ) {

        QAReviewResponse response =
                new QAReviewResponse();


        response.id =
                review.getId();


        response.submissionId =
                review
                        .getSubmission()
                        .getId();


        response.taskId =
                review
                        .getSubmission()
                        .getTask()
                        .getId();


        response.developerId =
                review
                        .getSubmission()
                        .getDeveloperId();


        response.qaUserId =
                review
                        .getQaUser()
                        .getId();


        response.qaName =
                (
                        review
                                .getQaUser()
                                .getFirstName()
                                + " "
                                +
                                review
                                        .getQaUser()
                                        .getLastName()
                ).trim();


        response.status =
                review
                        .getStatus()
                        .name();


        response.feedback =
                review.getFeedback();


        response.reviewedAt =
                review.getReviewedAt();


        return response;
    }


    public Long getId() {
        return id;
    }


    public Long getSubmissionId() {
        return submissionId;
    }


    public Long getTaskId() {
        return taskId;
    }


    public Long getDeveloperId() {
        return developerId;
    }


    public Long getQaUserId() {
        return qaUserId;
    }


    public String getQaName() {
        return qaName;
    }


    public String getStatus() {
        return status;
    }


    public String getFeedback() {
        return feedback;
    }


    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }
}