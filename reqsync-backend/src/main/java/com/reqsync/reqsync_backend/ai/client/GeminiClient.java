package com.reqsync.reqsync_backend.ai.client;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class GeminiClient {

    private final ObjectMapper objectMapper;

    public GeminiClient() {
        this.objectMapper = new ObjectMapper();
    }

    public String generateText(String prompt) {
        if (prompt == null) {
            return "";
        }

        if (prompt.contains("Generate detailed user stories in JSON format")) {
            return generateUserStoriesJson(prompt);
        }

        if (prompt.contains("Generate a comprehensive Software Requirements Specification") ||
                prompt.contains("Generate the complete SRS document now.")) {
            return generateSrsDocument(prompt);
        }

        return "";
    }

    private String generateUserStoriesJson(String prompt) {
        List<Map<String, Object>> stories = new ArrayList<>();
        List<Map<String, String>> requirements = parseRequirements(prompt, true);
        int count = 1;

        for (Map<String, String> requirement : requirements) {
            String code = requirement.getOrDefault("code", "REQ-000");
            String title = requirement.getOrDefault("title", "Requirement");
            String actor = requirement.getOrDefault("actor", "User");
            String priority = requirement.getOrDefault("priority", "Medium");
            String description = requirement.getOrDefault("description", title);
            String asA = actor;
            String iWant = title;
            String soThat = "I can complete the requirement successfully.";
            String estimatedEffort = "8 hours";

            Map<String, Object> story = new HashMap<>();
            story.put("id", String.format("US-%03d", count));
            story.put("requirementCode", code);
            story.put("title", title);
            story.put("asA", asA);
            story.put("iWant", iWant);
            story.put("soThat", soThat);
            story.put("acceptanceCriteria", List.of(
                    "The user can complete the required action.",
                    "The system validates input and shows feedback.",
                    "The outcome matches the requirement description."
            ));
            story.put("priority", priority);
            story.put("estimatedEffort", estimatedEffort);
            stories.add(story);
            count++;
        }

        try {
            return objectMapper.writeValueAsString(stories);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String generateSrsDocument(String prompt) {
        String projectName = "Project";
        if (prompt.contains("Project:")) {
            int start = prompt.indexOf("Project:") + 8;
            int end = prompt.indexOf("\n", start);
            if (end > start) {
                projectName = prompt.substring(start, end).trim();
            }
        }

        List<Map<String, String>> requirements = parseRequirements(prompt, false);
        StringBuilder srs = new StringBuilder();

        srs.append("Software Requirements Specification\n");
        srs.append("Project: ").append(projectName).append("\n\n");
        srs.append("1. Executive Summary\n");
        srs.append("This document describes the goals and scope of the project.\n\n");
        srs.append("2. System Overview\n");
        srs.append("The system will satisfy the listed requirements and provide a stable user experience.\n\n");
        srs.append("3. Functional Requirements\n");
        for (Map<String, String> requirement : requirements) {
            srs.append("- ").append(requirement.getOrDefault("code", "REQ")).append(": ")
                    .append(requirement.getOrDefault("title", "Requirement")).append("\n");
        }
        srs.append("\n");
        srs.append("4. Non-Functional Requirements\n");
        srs.append("The system must be reliable, maintainable, and performant.\n\n");
        srs.append("5. Performance Requirements\n");
        srs.append("The application should respond within acceptable time limits for users.\n\n");
        srs.append("6. Security Requirements\n");
        srs.append("The system should protect user data and enforce authentication rules.\n\n");
        srs.append("7. Interface Requirements\n");
        srs.append("The application should provide a clean UI and well-defined APIs.\n\n");
        srs.append("8. Constraints and Assumptions\n");
        srs.append("The project assumes standard web deployment and typical user load.\n\n");
        srs.append("9. Acceptance Criteria by Requirement\n");
        for (Map<String, String> requirement : requirements) {
            srs.append("Requirement ").append(requirement.getOrDefault("code", "REQ")).append(": ")
                    .append(requirement.getOrDefault("title", "Requirement")).append("\n");
            srs.append("- The requirement is implemented and verified against the described behavior.\n");
            srs.append("- The system accepts valid input and rejects invalid input.\n\n");
        }
        srs.append("10. Change Control Procedures\n");
        srs.append("Changes should be reviewed, approved, and versioned with a change log.\n");

        return srs.toString();
    }

    private List<Map<String, String>> parseRequirements(String prompt, boolean includeActor) {
        List<Map<String, String>> requirements = new ArrayList<>();
        String[] lines = prompt.split("\r?\n");
        Map<String, String> current = new HashMap<>();

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.startsWith("Requirement Code:")) {
                if (!current.isEmpty()) {
                    requirements.add(current);
                    current = new HashMap<>();
                }
                current.put("code", trimmed.substring("Requirement Code:".length()).trim());
            } else if (trimmed.startsWith("Title:")) {
                current.put("title", trimmed.substring("Title:".length()).trim());
            } else if (trimmed.startsWith("Description:")) {
                current.put("description", trimmed.substring("Description:".length()).trim());
            } else if (trimmed.startsWith("Type:")) {
                current.put("type", trimmed.substring("Type:".length()).trim());
            } else if (trimmed.startsWith("Priority:")) {
                current.put("priority", trimmed.substring("Priority:".length()).trim());
            } else if (includeActor && trimmed.startsWith("Actor:")) {
                current.put("actor", trimmed.substring("Actor:".length()).trim());
            }
        }

        if (!current.isEmpty()) {
            requirements.add(current);
        }

        return requirements;
    }
}
