package com.reqsync.reqsync_backend.userstory.dto;

import java.util.List;

public record UserStory(
    String id,
    String requirementCode,
    String title,
    String asA,
    String iWant,
    String soThat,
    List<String> acceptanceCriteria,
    String priority,
    String estimatedEffort
) {}
