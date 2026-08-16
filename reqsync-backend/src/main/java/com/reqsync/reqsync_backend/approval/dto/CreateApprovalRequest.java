package com.reqsync.reqsync_backend.approval.dto;

import com.reqsync.reqsync_backend.approval.enums.ApprovalType;

public class CreateApprovalRequest {

    private Long projectId;

    private String title;

    private ApprovalType type;

    private String requestedOn;


    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(
            Long projectId
    ) {
        this.projectId = projectId;
    }


    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title
    ) {
        this.title = title;
    }


    public ApprovalType getType() {
        return type;
    }

    public void setType(
            ApprovalType type
    ) {
        this.type = type;
    }


    public String getRequestedOn() {
        return requestedOn;
    }

    public void setRequestedOn(
            String requestedOn
    ) {
        this.requestedOn = requestedOn;
    }
}
