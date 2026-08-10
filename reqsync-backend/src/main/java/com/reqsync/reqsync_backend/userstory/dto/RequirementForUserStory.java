package com.reqsync.reqsync_backend.userstory.dto;

public record RequirementForUserStory(
    String code,
    String title,
    String description,
    String type,
    String priority,
    String actor
) {}
