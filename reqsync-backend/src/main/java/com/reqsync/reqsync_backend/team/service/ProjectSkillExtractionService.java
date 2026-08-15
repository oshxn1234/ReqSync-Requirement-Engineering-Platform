package com.reqsync.reqsync_backend.team.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.reqsync.reqsync_backend.ai.client.GeminiClient;

import com.reqsync.reqsync_backend.project.entity.Project;
import com.reqsync.reqsync_backend.project.repository.ProjectRepository;

import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;

import com.reqsync.reqsync_backend.team.dto.ExtractedProjectSkill;
import com.reqsync.reqsync_backend.team.dto.ProjectRequiredSkillResponse;

import com.reqsync.reqsync_backend.team.entity.ProjectRequiredSkill;
import com.reqsync.reqsync_backend.team.repository.ProjectRequiredSkillRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class ProjectSkillExtractionService {

    private final GeminiClient
            geminiClient;

    private final ProjectRepository
            projectRepository;

    private final RequirementRepository
            requirementRepository;

    private final ProjectRequiredSkillRepository
            projectRequiredSkillRepository;

    private final ObjectMapper
            objectMapper;


    public ProjectSkillExtractionService(
            GeminiClient geminiClient,
            ProjectRepository projectRepository,
            RequirementRepository requirementRepository,
            ProjectRequiredSkillRepository projectRequiredSkillRepository,
            ObjectMapper objectMapper
    ) {

        this.geminiClient =
                geminiClient;

        this.projectRepository =
                projectRepository;

        this.requirementRepository =
                requirementRepository;

        this.projectRequiredSkillRepository =
                projectRequiredSkillRepository;

        this.objectMapper =
                objectMapper;
    }


    // =========================================================
    // GENERATE PROJECT REQUIRED SKILLS
    // =========================================================

    public List<ProjectRequiredSkillResponse>
    generateProjectSkills(
            Long projectId
    ) {

        Project project =
                projectRepository
                        .findById(
                                projectId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Project not found: "
                                                        + projectId
                                        )
                        );


        List<Requirement> requirements =
                requirementRepository
                        .findByProjectId(
                                projectId
                        );


        if (
                requirements == null
                        ||
                        requirements.isEmpty()
        ) {

            throw new RuntimeException(
                    "Project requirements must exist before required skills can be generated."
            );
        }


        String prompt =
                buildPrompt(
                        project,
                        requirements
                );


        String aiResponse =
                geminiClient
                        .generateText(
                                prompt
                        );


        if (
                aiResponse == null
                        ||
                        aiResponse.isBlank()
        ) {

            throw new RuntimeException(
                    "Gemini returned an empty project skill response."
            );
        }


        List<ExtractedProjectSkill>
                extractedSkills =
                parseResponse(
                        aiResponse
                );


        if (
                extractedSkills.isEmpty()
        ) {

            throw new RuntimeException(
                    "No project skills were extracted."
            );
        }


        /*
         * Regeneration replaces the previous
         * generated skills.
         */
        projectRequiredSkillRepository
                .deleteByProjectId(
                        projectId
                );


        List<ProjectRequiredSkill>
                savedSkills =
                new ArrayList<>();


        for (
                ExtractedProjectSkill extracted
                : extractedSkills
        ) {

            if (
                    extracted.getSkillName()
                            == null
                            ||
                            extracted.getSkillName()
                                    .isBlank()
            ) {

                continue;
            }


            ProjectRequiredSkill skill =
                    new ProjectRequiredSkill();


            skill.setProject(
                    project
            );


            skill.setSkillName(
                    extracted
                            .getSkillName()
                            .trim()
            );


            skill.setImportance(
                    normalizeImportance(
                            extracted.getImportance()
                    )
            );


            skill.setReason(
                    extracted.getReason()
            );


            savedSkills.add(
                    projectRequiredSkillRepository
                            .save(
                                    skill
                            )
            );
        }


        return savedSkills
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }


    // =========================================================
    // GET PROJECT SKILLS
    // =========================================================

    @Transactional(readOnly = true)
    public List<ProjectRequiredSkillResponse>
    getProjectSkills(
            Long projectId
    ) {

        return projectRequiredSkillRepository
                .findByProjectId(
                        projectId
                )
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }


    // =========================================================
    // GEMINI PROMPT
    // =========================================================

    private String buildPrompt(
            Project project,
            List<Requirement> requirements
    ) {

        StringBuilder prompt =
                new StringBuilder();


        prompt.append(
                """
                You are a software engineering project
                skill analysis expert.

                Analyze the project requirements and identify
                the technical skills or competencies that a
                Developer or QA Engineer may need to work on
                this project.

                IMPORTANT RULES:

                1. Return ONLY valid JSON.
                2. Do not return Markdown.
                3. Do not use ```json.
                4. Do not include explanations outside JSON.
                5. Extract only skills supported by the requirements.
                6. Avoid duplicate skills.
                7. Keep skill names concise.
                8. Importance must be an integer from 1 to 5.

                Importance:

                1 = useful but low importance
                2 = somewhat useful
                3 = important
                4 = very important
                5 = critical

                Examples of skills:

                Java
                Spring Boot
                PostgreSQL
                REST API
                React
                Automated Testing
                API Testing
                Security Testing
                Payment Integration
                Authentication
                Database Design

                Do not assume a specific programming language
                or framework unless the requirements clearly
                support it.

                Return exactly this JSON structure:

                [
                  {
                    "skillName": "REST API",
                    "importance": 4,
                    "reason": "The requirements include integration between system components."
                  }
                ]

                Project:
                """
        );


        prompt.append(
                project.getName()
        );


        prompt.append(
                "\n\nProject Description:\n"
        );


        if (
                project.getDescription()
                        != null
        ) {

            prompt.append(
                    project.getDescription()
            );
        }


        prompt.append(
                "\n\nRequirements:\n"
        );


        for (
                Requirement requirement
                : requirements
        ) {

            prompt
                    .append(
                            requirement.getCode()
                    )
                    .append(" - ")
                    .append(
                            requirement.getTitle()
                    )
                    .append(": ")
                    .append(
                            requirement.getDescription()
                    )
                    .append("\n");
        }


        return prompt.toString();
    }


    // =========================================================
    // PARSE JSON
    // =========================================================

    private List<ExtractedProjectSkill>
    parseResponse(
            String response
    ) {

        try {

            String cleaned =
                    cleanJson(
                            response
                    );


            return objectMapper
                    .readValue(
                            cleaned,
                            new TypeReference<
                                    List<ExtractedProjectSkill>
                                    >() {
                            }
                    );


        } catch (
                Exception exception
        ) {

            throw new RuntimeException(
                    "Unable to parse Gemini project skill response.",
                    exception
            );
        }
    }


    private String cleanJson(
            String response
    ) {

        String cleaned =
                response
                        .trim();


        if (
                cleaned.startsWith(
                        "```json"
                )
        ) {

            cleaned =
                    cleaned.substring(
                            7
                    );
        }


        if (
                cleaned.startsWith(
                        "```"
                )
        ) {

            cleaned =
                    cleaned.substring(
                            3
                    );
        }


        if (
                cleaned.endsWith(
                        "```"
                )
        ) {

            cleaned =
                    cleaned.substring(
                            0,
                            cleaned.length() - 3
                    );
        }


        return cleaned.trim();
    }


    // =========================================================
    // IMPORTANCE
    // =========================================================

    private int normalizeImportance(
            Integer importance
    ) {

        if (
                importance == null
        ) {

            return 3;
        }


        return Math.max(
                1,
                Math.min(
                        5,
                        importance
                )
        );
    }


    // =========================================================
    // RESPONSE
    // =========================================================

    private ProjectRequiredSkillResponse
    toResponse(
            ProjectRequiredSkill skill
    ) {

        return new ProjectRequiredSkillResponse(
                skill.getId(),
                skill
                        .getProject()
                        .getId(),
                skill.getSkillName(),
                skill.getImportance(),
                skill.getReason()
        );
    }
}