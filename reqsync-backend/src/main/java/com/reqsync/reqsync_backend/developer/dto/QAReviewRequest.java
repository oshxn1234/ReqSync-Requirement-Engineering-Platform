package com.reqsync.reqsync_backend.developer.dto;

import com.reqsync.reqsync_backend.developer.entity.QAReviewStatus;

public class QAReviewRequest {

    private QAReviewStatus status;

    private String feedback;


    public QAReviewRequest() {
    }


    public QAReviewStatus getStatus() {
        return status;
    }

    public void setStatus(
            QAReviewStatus status
    ) {
        this.status = status;
    }


    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(
            String feedback
    ) {
        this.feedback = feedback;
    }
}