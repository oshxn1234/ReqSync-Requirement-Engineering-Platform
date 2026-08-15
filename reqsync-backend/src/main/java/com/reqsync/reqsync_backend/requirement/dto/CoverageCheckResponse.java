package com.reqsync.reqsync_backend.requirement.dto;

import com.reqsync.reqsync_backend.requirement.enums.CoverageStatus;

public class CoverageCheckResponse {

    private String topic;

    private CoverageStatus status;

    private String relatedRequirementCode;

    private String reason;


    public CoverageCheckResponse() {
    }


    public CoverageCheckResponse(
            String topic,
            CoverageStatus status,
            String relatedRequirementCode,
            String reason
    ) {

        this.topic = topic;
        this.status = status;
        this.relatedRequirementCode =
                relatedRequirementCode;
        this.reason = reason;
    }


    public String getTopic() {
        return topic;
    }


    public void setTopic(
            String topic
    ) {
        this.topic = topic;
    }


    public CoverageStatus getStatus() {
        return status;
    }


    public void setStatus(
            CoverageStatus status
    ) {
        this.status = status;
    }


    public String getRelatedRequirementCode() {
        return relatedRequirementCode;
    }


    public void setRelatedRequirementCode(
            String relatedRequirementCode
    ) {
        this.relatedRequirementCode =
                relatedRequirementCode;
    }


    public String getReason() {
        return reason;
    }


    public void setReason(
            String reason
    ) {
        this.reason = reason;
    }
}