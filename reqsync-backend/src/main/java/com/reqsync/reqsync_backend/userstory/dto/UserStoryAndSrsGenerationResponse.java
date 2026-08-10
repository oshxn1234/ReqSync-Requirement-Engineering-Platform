package com.reqsync.reqsync_backend.userstory.dto;

import java.util.List;

public record UserStoryAndSrsGenerationResponse(
    String projectName,
    List<UserStory> userStories,
    String srsDocument
) {}
