package com.reqsync.reqsync_backend.userstory.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reqsync.reqsync_backend.ai.client.GeminiClient;
import com.reqsync.reqsync_backend.userstory.dto.RequirementForUserStory;
import com.reqsync.reqsync_backend.userstory.dto.UserStory;
import com.reqsync.reqsync_backend.userstory.dto.UserStoryAndSrsGenerationRequest;
import com.reqsync.reqsync_backend.userstory.dto.UserStoryAndSrsGenerationResponse;

@Service
public class UserStoryAndSrsGenerationService {

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    public UserStoryAndSrsGenerationService(
            GeminiClient geminiClient
    ) {
        this.geminiClient = geminiClient;
        this.objectMapper = new ObjectMapper();
    }

    public UserStoryAndSrsGenerationResponse generateUserStoriesAndSrs(
            UserStoryAndSrsGenerationRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Generation request cannot be null."
            );
        }

        String userStoriesJson = generateUserStories(request);
        String srsDocument = generateSrsDocument(request);

        List<UserStory> userStories = parseUserStories(userStoriesJson);

        return new UserStoryAndSrsGenerationResponse(
                request.projectName(),
                userStories,
                srsDocument
        );
    }

    private String generateUserStories(
            UserStoryAndSrsGenerationRequest request
    ) {
        String prompt = buildUserStoryPrompt(request);
        String response = geminiClient.generateText(prompt);

        if (response == null || response.isBlank()) {
            throw new RuntimeException(
                    "Gemini returned an empty response for user stories."
            );
        }

        return response;
    }

    private String generateSrsDocument(
            UserStoryAndSrsGenerationRequest request
    ) {
        String prompt = buildSrsPrompt(request);
        String response = geminiClient.generateText(prompt);

        if (response == null || response.isBlank()) {
            throw new RuntimeException(
                    "Gemini returned an empty response for SRS."
            );
        }

        return response;
    }

    private String buildUserStoryPrompt(
            UserStoryAndSrsGenerationRequest request
    ) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("""
                You are a requirements engineering expert specializing in user story creation.
                
                Generate detailed user stories in JSON format based on the provided requirements.
                
                IMPORTANT RULES:
                
                1. Return ONLY valid JSON array.
                2. Each user story MUST have: id, requirementCode, title, asA, iWant, soThat, acceptanceCriteria (array), priority, estimatedEffort
                3. Follow the format: "As a [actor], I want [feature], so that [benefit]"
                4. Acceptance criteria should be specific and measurable.
                5. Do not add markdown or code fences.
                6. Ensure JSON is valid and parseable.
                
                Project: """);

        prompt.append(request.projectName()).append("\n\n");
        prompt.append("Requirements:\n");

        for (RequirementForUserStory requirement : request.requirements()) {
            prompt.append("\nRequirement Code: ").append(requirement.code()).append("\n");
            prompt.append("Title: ").append(requirement.title()).append("\n");
            prompt.append("Description: ").append(requirement.description()).append("\n");
            prompt.append("Type: ").append(requirement.type()).append("\n");
            prompt.append("Priority: ").append(requirement.priority()).append("\n");
            prompt.append("Actor: ").append(requirement.actor()).append("\n");
        }

        prompt.append("""
                
                Generate user stories now as a JSON array.
                """);

        return prompt.toString();
    }

    private String buildSrsPrompt(
            UserStoryAndSrsGenerationRequest request
    ) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("""
                You are a software requirements specification expert.
                
                Generate a comprehensive Software Requirements Specification (SRS) document based on the provided requirements.
                
                The SRS should include:
                1. Executive Summary
                2. System Overview
                3. Functional Requirements
                4. Non-Functional Requirements
                5. Performance Requirements
                6. Security Requirements
                7. Interface Requirements
                8. Constraints and Assumptions
                9. Acceptance Criteria by Requirement
                10. Change Control Procedures
                
                Format as a professional document with clear sections and subsections.
                
                Project: """);

        prompt.append(request.projectName()).append("\n\n");
        prompt.append("Requirements:\n");

        for (RequirementForUserStory requirement : request.requirements()) {
            prompt.append("\nRequirement Code: ").append(requirement.code()).append("\n");
            prompt.append("Title: ").append(requirement.title()).append("\n");
            prompt.append("Description: ").append(requirement.description()).append("\n");
            prompt.append("Type: ").append(requirement.type()).append("\n");
            prompt.append("Priority: ").append(requirement.priority()).append("\n");
        }

        prompt.append("""
                
                Generate the complete SRS document now.
                """);

        return prompt.toString();
    }

    private List<UserStory> parseUserStories(String jsonResponse) {
        try {
            String cleanJson = jsonResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            UserStory[] userStories = objectMapper.readValue(cleanJson, UserStory[].class);
            return Arrays.asList(userStories);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to parse user stories from Gemini response: " + e.getMessage()
            );
        }
    }
}
