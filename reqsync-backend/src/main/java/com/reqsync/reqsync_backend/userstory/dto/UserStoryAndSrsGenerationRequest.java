package com.reqsync.reqsync_backend.userstory.dto;

import java.util.List;

public record UserStoryAndSrsGenerationRequest(
    String projectName,
    List<RequirementForUserStory> requirements
) {}
