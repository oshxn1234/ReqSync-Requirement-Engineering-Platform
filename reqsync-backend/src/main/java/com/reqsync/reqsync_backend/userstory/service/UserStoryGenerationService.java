package com.reqsync.reqsync_backend.userstory.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.reqsync.reqsync_backend.ai.client.GeminiClient;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.project.entity.Project;
import com.reqsync.reqsync_backend.project.entity.ProjectMember;
import com.reqsync.reqsync_backend.project.repository.ProjectMemberRepository;
import com.reqsync.reqsync_backend.project.repository.ProjectRepository;

import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;

import com.reqsync.reqsync_backend.userstory.dto.GeneratedUserStory;
import com.reqsync.reqsync_backend.userstory.dto.UserStoryResponse;
import com.reqsync.reqsync_backend.userstory.dto.UserStoryUpdateRequest;

import com.reqsync.reqsync_backend.userstory.entity.UserStory;
import com.reqsync.reqsync_backend.userstory.repository.UserStoryRepository;

import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class UserStoryGenerationService {

    private final GeminiClient geminiClient;

    private final UserStoryRepository
            userStoryRepository;

    private final RequirementRepository
            requirementRepository;

    private final ProjectRepository
            projectRepository;

    private final ProjectMemberRepository
            projectMemberRepository;

    private final UserRepository
            userRepository;

    private final ObjectMapper
            objectMapper;


    public UserStoryGenerationService(
            GeminiClient geminiClient,
            UserStoryRepository userStoryRepository,
            RequirementRepository requirementRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {

        this.geminiClient =
                geminiClient;

        this.userStoryRepository =
                userStoryRepository;

        this.requirementRepository =
                requirementRepository;

        this.projectRepository =
                projectRepository;

        this.projectMemberRepository =
                projectMemberRepository;

        this.userRepository =
                userRepository;

        this.objectMapper =
                objectMapper;
    }


    // =========================================================
    // GENERATE
    // =========================================================

    public List<UserStoryResponse>
    generate(
            Long projectId,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        Project project =
                getProject(
                        projectId,
                        currentUser
                );


        validateBAAccess(
                project,
                currentUser
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
                    "No requirements exist for this project."
            );
        }


        /*
         * Only send requirements that do not
         * already have generated user stories.
         */
        List<Requirement> requirementsToGenerate =
                requirements
                        .stream()

                        .filter(
                                requirement ->
                                        !userStoryRepository
                                                .existsByProjectIdAndSourceRequirementId(
                                                        projectId,
                                                        requirement.getId()
                                                )
                        )

                        .toList();


        if (
                requirementsToGenerate.isEmpty()
        ) {

            return getProjectUserStories(
                    projectId,
                    authentication
            );
        }


        String prompt =
                buildPrompt(
                        project,
                        requirementsToGenerate
                );


        String geminiResponse =
                geminiClient
                        .generateText(
                                prompt
                        );


        List<GeneratedUserStory> generatedStories =
                parseGeminiResponse(
                        geminiResponse
                );


        List<UserStory> savedStories =
                new ArrayList<>();


        long existingCount =
                userStoryRepository
                        .countByProjectId(
                                projectId
                        );


        int storyNumber =
                (int) existingCount + 1;


        for (
                GeneratedUserStory generated
                : generatedStories
        ) {

            Requirement sourceRequirement =
                    requirementsToGenerate
                            .stream()

                            .filter(
                                    requirement ->
                                            requirement
                                                    .getId()
                                                    .equals(
                                                            generated
                                                                    .getSourceRequirementId()
                                                    )
                            )

                            .findFirst()

                            .orElse(
                                    null
                            );


            /*
             * Do not allow Gemini to create
             * references to requirements that
             * do not belong to this project.
             */
            if (
                    sourceRequirement == null
            ) {

                continue;
            }


            if (
                    userStoryRepository
                            .existsByProjectIdAndSourceRequirementId(
                                    projectId,
                                    sourceRequirement.getId()
                            )
            ) {

                continue;
            }


            validateGeneratedStory(
                    generated
            );


            UserStory story =
                    new UserStory();


            story.setProjectId(
                    projectId
            );


            story.setSourceRequirementId(
                    sourceRequirement.getId()
            );


            story.setCode(
                    String.format(
                            "US-%03d",
                            storyNumber
                    )
            );


            story.setTitle(
                    generated
                            .getTitle()
                            .trim()
            );


            story.setActor(
                    generated
                            .getActor()
                            .trim()
            );


            story.setGoal(
                    generated
                            .getGoal()
                            .trim()
            );


            story.setBenefit(
                    generated
                            .getBenefit()
                            .trim()
            );


            try {

                story.setAcceptanceCriteria(
                        objectMapper
                                .writeValueAsString(
                                        generated
                                                .getAcceptanceCriteria()
                                )
                );

            } catch (Exception exception) {

                throw new RuntimeException(
                        "Unable to store acceptance criteria.",
                        exception
                );
            }


            /*
             * Preserve requirement priority.
             */
            story.setPriority(
                    sourceRequirement
                            .getPriority()
            );


            story.setReviewed(
                    false
            );


            savedStories.add(
                    userStoryRepository
                            .save(
                                    story
                            )
            );


            storyNumber++;
        }


        return savedStories
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }


    // =========================================================
    // GET STORIES
    // =========================================================

    @Transactional(readOnly = true)
    public List<UserStoryResponse>
    getProjectUserStories(
            Long projectId,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        getProject(
                projectId,
                currentUser
        );


        return userStoryRepository
                .findByProjectIdOrderByIdAsc(
                        projectId
                )
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }


    // =========================================================
    // UPDATE STORY
    // =========================================================

    public UserStoryResponse update(
            Long storyId,
            UserStoryUpdateRequest request,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        UserStory story =
                userStoryRepository
                        .findById(
                                storyId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User story not found."
                                        )
                        );


        Project project =
                getProject(
                        story.getProjectId(),
                        currentUser
                );


        validateBAAccess(
                project,
                currentUser
        );


        if (
                request.getTitle() != null
                        &&
                        !request.getTitle().isBlank()
        ) {

            story.setTitle(
                    request.getTitle().trim()
            );
        }


        if (
                request.getActor() != null
                        &&
                        !request.getActor().isBlank()
        ) {

            story.setActor(
                    request.getActor().trim()
            );
        }


        if (
                request.getGoal() != null
                        &&
                        !request.getGoal().isBlank()
        ) {

            story.setGoal(
                    request.getGoal().trim()
            );
        }


        if (
                request.getBenefit() != null
                        &&
                        !request.getBenefit().isBlank()
        ) {

            story.setBenefit(
                    request.getBenefit().trim()
            );
        }


        if (
                request.getAcceptanceCriteria()
                        != null
        ) {

            try {

                story.setAcceptanceCriteria(
                        objectMapper
                                .writeValueAsString(
                                        request
                                                .getAcceptanceCriteria()
                                )
                );

            } catch (Exception exception) {

                throw new RuntimeException(
                        "Unable to update acceptance criteria.",
                        exception
                );
            }
        }


        if (
                request.getPriority() != null
        ) {

            story.setPriority(
                    request.getPriority()
            );
        }


        if (
                request.getReviewed() != null
        ) {

            story.setReviewed(
                    request.getReviewed()
            );
        }


        return toResponse(
                userStoryRepository
                        .save(
                                story
                        )
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    public void delete(
            Long storyId,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        UserStory story =
                userStoryRepository
                        .findById(
                                storyId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User story not found."
                                        )
                        );


        Project project =
                getProject(
                        story.getProjectId(),
                        currentUser
                );


        validateBAAccess(
                project,
                currentUser
        );


        userStoryRepository.delete(
                story
        );
    }


    // =========================================================
    // PROMPT
    // =========================================================

    private String buildPrompt(
            Project project,
            List<Requirement> requirements
    ) {

        StringBuilder prompt =
                new StringBuilder();


        prompt.append(
                """
                You are a senior Business Analyst.

                Generate user stories from the supplied software requirements.

                IMPORTANT RULES:

                1. Return ONLY valid JSON.
                2. Do not use Markdown.
                3. Do not use ```json code fences.
                4. Each generated story MUST reference the exact sourceRequirementId supplied.
                5. Do not invent requirement IDs.
                6. Create one primary user story for each requirement that represents user/system behaviour.
                7. Ignore purely internal technical statements that cannot reasonably become a user story.
                8. Actor must represent the person or system role benefiting from the behaviour.
                9. goal must NOT include "I want".
                10. benefit must NOT include "so that".
                11. Generate 2 to 5 testable acceptance criteria.

                Return this exact JSON array structure:

                [
                  {
                    "sourceRequirementId": 1,
                    "title": "Secure Customer Login",
                    "actor": "Customer",
                    "goal": "securely log in to the application",
                    "benefit": "access my account and protected services",
                    "acceptanceCriteria": [
                      "Customer can log in using valid credentials",
                      "Invalid credentials are rejected"
                    ]
                  }
                ]

                Project:
                """
        );


        prompt.append(
                project.getName()
        );


        prompt.append(
                "\n\nRequirements:\n"
        );


        for (
                Requirement requirement
                : requirements
        ) {

            prompt.append(
                    "\n---\n"
            );

            prompt.append(
                    "sourceRequirementId: "
            );

            prompt.append(
                    requirement.getId()
            );


            prompt.append(
                    "\ncode: "
            );

            prompt.append(
                    requirement.getCode()
            );


            prompt.append(
                    "\ntitle: "
            );

            prompt.append(
                    requirement.getTitle()
            );


            prompt.append(
                    "\ndescription: "
            );

            prompt.append(
                    requirement.getDescription()
            );


            prompt.append(
                    "\ntype: "
            );

            prompt.append(
                    requirement.getType()
            );


            prompt.append(
                    "\nactors: "
            );

            prompt.append(
                    requirement.getActors()
            );


            prompt.append(
                    "\nexpectedOutcome: "
            );

            prompt.append(
                    requirement.getExpectedOutcome()
            );
        }


        return prompt.toString();
    }


    // =========================================================
    // PARSE GEMINI
    // =========================================================

    private List<GeneratedUserStory>
    parseGeminiResponse(
            String response
    ) {

        try {

            String cleaned =
                    response.trim();


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

            else if (
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


            cleaned =
                    cleaned.trim();


            return objectMapper
                    .readValue(
                            cleaned,
                            new TypeReference<
                                    List<GeneratedUserStory>
                                    >() {
                            }
                    );


        } catch (Exception exception) {

            throw new RuntimeException(
                    "Unable to parse Gemini user story response.",
                    exception
            );
        }
    }


    // =========================================================
    // VALIDATE GENERATED STORY
    // =========================================================

    private void validateGeneratedStory(
            GeneratedUserStory story
    ) {

        if (
                story.getSourceRequirementId()
                        == null
        ) {

            throw new RuntimeException(
                    "Generated user story has no source requirement."
            );
        }


        if (
                story.getTitle() == null
                        ||
                        story.getTitle().isBlank()
        ) {

            throw new RuntimeException(
                    "Generated user story has no title."
            );
        }


        if (
                story.getActor() == null
                        ||
                        story.getActor().isBlank()
        ) {

            throw new RuntimeException(
                    "Generated user story has no actor."
            );
        }


        if (
                story.getGoal() == null
                        ||
                        story.getGoal().isBlank()
        ) {

            throw new RuntimeException(
                    "Generated user story has no goal."
            );
        }


        if (
                story.getBenefit() == null
                        ||
                        story.getBenefit().isBlank()
        ) {

            throw new RuntimeException(
                    "Generated user story has no benefit."
            );
        }


        if (
                story.getAcceptanceCriteria()
                        == null
                        ||
                        story.getAcceptanceCriteria()
                                .isEmpty()
        ) {

            throw new RuntimeException(
                    "Generated user story has no acceptance criteria."
            );
        }
    }


    // =========================================================
    // PROJECT
    // =========================================================

    private Project getProject(
            Long projectId,
            User currentUser
    ) {

        return projectRepository
                .findByIdAndBusinessId(
                        projectId,
                        currentUser
                                .getBusiness()
                                .getId()
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Project not found or does not belong to your business."
                                )
                );
    }


    // =========================================================
    // BA ACCESS
    // =========================================================

    private void validateBAAccess(
            Project project,
            User currentUser
    ) {

        if (
                currentUser.getRole()
                        != Role.BUSINESS_ANALYST
        ) {

            throw new RuntimeException(
                    "Only Business Analysts can generate or modify user stories."
            );
        }


        ProjectMember membership =
                projectMemberRepository
                        .findByProjectIdAndUserId(
                                project.getId(),
                                currentUser.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Business Analyst is not assigned to this project."
                                        )
                        );


        if (
                !membership.isActive()
        ) {

            throw new RuntimeException(
                    "Business Analyst is not an active member of this project."
            );
        }
    }


    // =========================================================
    // AUTH USER
    // =========================================================

    private User getAuthenticatedUser(
            Authentication authentication
    ) {

        if (
                authentication == null
                        ||
                        authentication.getName() == null
                        ||
                        authentication.getName().isBlank()
        ) {

            throw new RuntimeException(
                    "Authenticated user could not be determined."
            );
        }


        return userRepository
                .findByEmailIgnoreCase(
                        authentication.getName()
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Authenticated user not found."
                                )
                );
    }


    // =========================================================
    // RESPONSE
    // =========================================================

    private UserStoryResponse toResponse(
            UserStory story
    ) {

        Requirement requirement =
                requirementRepository
                        .findById(
                                story.getSourceRequirementId()
                        )
                        .orElse(
                                null
                        );


        List<String> criteria =
                new ArrayList<>();


        try {

            criteria =
                    objectMapper
                            .readValue(
                                    story.getAcceptanceCriteria(),
                                    new TypeReference<
                                            List<String>
                                            >() {
                                    }
                            );

        } catch (Exception ignored) {
        }


        String formattedStory =
                "As a "
                        + story.getActor()
                        + ", I want to "
                        + story.getGoal()
                        + ", so that "
                        + story.getBenefit()
                        + ".";


        return new UserStoryResponse(
                story.getId(),

                story.getProjectId(),

                story.getSourceRequirementId(),

                requirement == null
                        ?
                        null
                        :
                        requirement.getCode(),

                story.getCode(),

                story.getTitle(),

                story.getActor(),

                story.getGoal(),

                story.getBenefit(),

                formattedStory,

                criteria,

                story.getPriority(),

                story.isReviewed(),

                story.getCreatedAt(),

                story.getUpdatedAt()
        );
    }
}