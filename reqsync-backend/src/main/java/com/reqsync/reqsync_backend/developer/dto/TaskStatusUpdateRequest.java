package com.reqsync.reqsync_backend.developer.dto;

public class TaskStatusUpdateRequest {

    private String status;


    public TaskStatusUpdateRequest() {
    }


    public String getStatus() {
        return status;
    }


    public void setStatus(String status) {
        this.status = status;
    }
}