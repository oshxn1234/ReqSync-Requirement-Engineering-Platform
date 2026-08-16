package com.reqsync.reqsync_backend.approval.dto;

import com.reqsync.reqsync_backend.approval.enums.ApprovalStatus;
import com.reqsync.reqsync_backend.approval.enums.ApprovalType;

public class ApprovalResponse {

    private String id;

    private Long projectId;

    private String title;

    private ApprovalType type;

    private String requestedBy;

    private String requestedOn;

    private ApprovalStatus status;

    private String decidedBy;

    private String decidedOn;


    public ApprovalResponse() {
    }


    public ApprovalResponse(
            String id,
            Long projectId,
            String title,
            ApprovalType type,
            String requestedBy,
            String requestedOn,
            ApprovalStatus status,
            String decidedBy,
            String decidedOn
    ) {

        this.id = id;
        this.projectId = projectId;
        this.title = title;
        this.type = type;
        this.requestedBy = requestedBy;
        this.requestedOn = requestedOn;
        this.status = status;
        this.decidedBy = decidedBy;
        this.decidedOn = decidedOn;
    }


    public String getId() {
        return id;
    }

    public void setId(
            String id
    ) {
        this.id = id;
    }


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


    public String getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(
            String requestedBy
    ) {
        this.requestedBy = requestedBy;
    }


    public String getRequestedOn() {
        return requestedOn;
    }

    public void setRequestedOn(
            String requestedOn
    ) {
        this.requestedOn = requestedOn;
    }


    public ApprovalStatus getStatus() {
        return status;
    }

    public void setStatus(
            ApprovalStatus status
    ) {
        this.status = status;
    }


    public String getDecidedBy() {
        return decidedBy;
    }

    public void setDecidedBy(
            String decidedBy
    ) {
        this.decidedBy = decidedBy;
    }


    public String getDecidedOn() {
        return decidedOn;
    }

    public void setDecidedOn(
            String decidedOn
    ) {
        this.decidedOn = decidedOn;
    }
}
