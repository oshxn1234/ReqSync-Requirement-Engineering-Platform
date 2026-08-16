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
import com.reqsync.reqsync_backend.requirement.enums.RequirementStatus;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;

import com.reqsync.reqsync_backend.traceability.entity.TraceabilityArtifactType;
import com.reqsync.reqsync_backend.traceability.service.TraceabilityService;

import com.reqsync.reqsync_backend.userstory.dto.GeneratedUserStory;
import com.reqsync.reqsync_backend.userstory.dto.UserStoryResponse;
import com.reqsync.reqsync_backend.userstory.dto.UserStoryUpdateRequest;

import com.reqsync.reqsync_backend.userstory.entity.UserStory;
import com.reqsync.reqsync_backend.userstory.repository.UserStoryRepository;

import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


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

    private final TraceabilityService
            traceabilityService;


    public UserStoryGenerationService(
            GeminiClient geminiClient,
            UserStoryRepository userStoryRepository,
            RequirementRepository requirementRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper,
            TraceabilityService traceabilityService
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

        this.traceabilityService =
                traceabilityService;
    }


    // ==========================================
    // GENERATE
    // ==========================================

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


        List<Requirement> allRequirements =
                requirementRepository
                        .findByProjectId(
                                projectId
                        );


        if (
                allRequirements == null
                        ||
                        allRequirements.isEmpty()
        ) {

            throw new RuntimeException(
                    "No requirements exist for this project."
            );
        }


        /*
         * Only APPROVED requirements are allowed
         * to generate user stories.
         *
         * Draft, Review and Rejected requirements
         * are completely ignored.
         *
         * Requirements that already have a user story
         * are also ignored.
         */
        List<Requirement> approvedRequirements =
                allRequirements
                        .stream()
                        .filter(
                                requirement ->
                                        requirement.getStatus()
                                                != null
                                                &&
                                                "APPROVED"
                                                        .equalsIgnoreCase(
                                                                requirement
                                                                        .getStatus()
                                                                        .name()
                                                        )
                        )
                        .toList();


        if (
                approvedRequirements.isEmpty()
        ) {

            throw new RuntimeException(
                    "No approved requirements are available. " +
                            "The Business Analyst must approve requirements before generating user stories."
            );
        }


        /*
         * Existing user stories created before traceability
         * was introduced are linked automatically if their
         * source Requirement is now APPROVED.
         */
        syncExistingUserStoryTraceability(
                projectId
        );


        /*
         * Generate only missing stories.
         */
        List<Requirement> requirementsToGenerate =
                approvedRequirements
                        .stream()
                        .filter(
                                requirement ->
                                        requirement.getStatus()
                                                == RequirementStatus.APPROVED
                        )

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

            boolean hasApprovedRequirement =
                    requirements
                            .stream()

                            .anyMatch(
                                    requirement ->
                                            requirement.getStatus()
                                                    == RequirementStatus.APPROVED
                            );


            /*
             * No approved requirements exist.
             */
            if (
                    !hasApprovedRequirement
            ) {

                throw new RuntimeException(
                        "No approved requirements are available for user story generation."
                );
            }


            /*
             * Approved requirements exist,
             * but they already have generated stories.
             */
            return getProjectUserStories(
                    projectId,
                    authentication
            );
        }


        /*
         * Only approved requirements reach Gemini.
         */
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


        if (
                geminiResponse == null
                        ||
                        geminiResponse.isBlank()
        ) {

            throw new RuntimeException(
                    "Gemini returned an empty response."
            );
        }


        List<GeneratedUserStory> generatedStories =
                parseGeminiResponse(
                        geminiResponse
                );


        if (
                generatedStories == null
                        ||
                        generatedStories.isEmpty()
        ) {

            throw new RuntimeException(
                    "Gemini did not generate any user stories."
            );
        }


        List<UserStory> savedStories =
                new ArrayList<>();


        Set<Long> processedRequirementIds =
                new HashSet<>();


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

            validateGeneratedStory(
                    generated
            );


            Long sourceRequirementId =
                    generated
                            .getSourceRequirementId();


            /*
             * Gemini cannot return two stories for
             * the same requirement during one run.
             */
            if (
                    processedRequirementIds
                            .contains(
                                    sourceRequirementId
                            )
            ) {

                continue;
            }


            Requirement sourceRequirement =
                    requirementsToGenerate
                            .stream()
                            .filter(
                                    requirement ->
                                            requirement
                                                    .getId()
                                                    .equals(
                                                            sourceRequirementId
                                                    )
                            )
                            .findFirst()
                            .orElse(null);


            /*
             * Do not allow Gemini to create
             * references to requirements that
             * do not belong to the approved
             * requirement list.
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


            story.setPriority(
                    sourceRequirement
                            .getPriority()
            );


            story.setReviewed(
                    false
            );


            UserStory savedStory =
                    userStoryRepository
                            .save(
                                    story
                            );


            /*
             * =================================================
             * END-TO-END TRACEABILITY
             *
             * REQ-001 → US-001
             * =================================================
             */
            traceabilityService
                    .linkUserStory(
                            projectId,
                            sourceRequirement.getId(),
                            savedStory.getId(),
                            savedStory.getCode(),
                            savedStory.getTitle()
                    );


            savedStories.add(
                    savedStory
            );


            processedRequirementIds.add(
                    sourceRequirement.getId()
            );


            storyNumber++;
        }


        if (
                savedStories.isEmpty()
        ) {

            throw new RuntimeException(
                    "Gemini did not return valid user stories for the approved requirements."
            );
        }


        return savedStories
                .stream()

                .map(
                        this::toResponse
                )

                .toList();
    }


    // ==========================================
    // GET STORIES
    // ==========================================

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


    // ==========================================
    // UPDATE STORY
    // ==========================================

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


        /*
         * A User Story belonging to a non-approved
         * source Requirement cannot continue downstream.
         */
        Requirement sourceRequirement =
                requirementRepository
                        .findById(
                                story.getSourceRequirementId()
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Source requirement not found."
                                        )
                        );


        if (
                sourceRequirement.getStatus() == null
                        ||
                        !"APPROVED".equalsIgnoreCase(
                                sourceRequirement
                                        .getStatus()
                                        .name()
                        )
        ) {

            throw new IllegalStateException(
                    "Only user stories linked to APPROVED requirements can be modified in the traceable workflow."
            );
        }


        if (
                request.getTitle() != null
                        &&
                        !request.getTitle().isBlank()
        ) {

            story.setTitle(
                    request
                            .getTitle()
                            .trim()
            );
        }


        if (
                request.getActor() != null
                        &&
                        !request.getActor().isBlank()
        ) {

            story.setActor(
                    request
                            .getActor()
                            .trim()
            );
        }


        if (
                request.getGoal() != null
                        &&
                        !request.getGoal().isBlank()
        ) {

            story.setGoal(
                    request
                            .getGoal()
                            .trim()
            );
        }


        if (
                request.getBenefit() != null
                        &&
                        !request.getBenefit().isBlank()
        ) {

            story.setBenefit(
                    request
                            .getBenefit()
                            .trim()
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
                request.getPriority()
                        != null
        ) {

            story.setPriority(
                    request.getPriority()
            );
        }


        if (
                request.getReviewed()
                        != null
        ) {

            story.setReviewed(
                    request.getReviewed()
            );
        }


        UserStory savedStory =
                userStoryRepository
                        .save(
                                story
                        );


        /*
         * UPSERT traceability metadata.
         */
        traceabilityService
                .linkUserStory(
                        savedStory.getProjectId(),
                        savedStory.getSourceRequirementId(),
                        savedStory.getId(),
                        savedStory.getCode(),
                        savedStory.getTitle()
                );


        return toResponse(
                savedStory
        );
    }


    // ==========================================
    // DELETE
    // ==========================================

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


        /*
         * Remove traceability link before deleting story.
         */
        traceabilityService
                .removeArtifactLinks(
                        TraceabilityArtifactType.USER_STORY,
                        story.getId()
                );


        userStoryRepository
                .delete(
                        story
                );
    }


    // =========================================================
    // SYNC PRE-EXISTING USER STORY LINKS
    // =========================================================

    private void syncExistingUserStoryTraceability(
            Long projectId
    ) {

        List<UserStory> existingStories =
                userStoryRepository
                        .findByProjectIdOrderByIdAsc(
                                projectId
                        );


        for (
                UserStory story
                : existingStories
        ) {

            if (
                    story.getSourceRequirementId()
                            == null
            ) {

                continue;
            }


            Requirement requirement =
                    requirementRepository
                            .findById(
                                    story.getSourceRequirementId()
                            )
                            .orElse(null);


            if (
                    requirement == null
            ) {

                continue;
            }


            if (
                    requirement.getProjectId()
                            == null
                            ||
                            !requirement
                                    .getProjectId()
                                    .equals(
                                            projectId
                                    )
            ) {

                continue;
            }


            /*
             * Existing stories are traced ONLY when their
             * source Requirement is currently APPROVED.
             */
            if (
                    requirement.getStatus()
                            == null
                            ||
                            !"APPROVED".equalsIgnoreCase(
                                    requirement
                                            .getStatus()
                                            .name()
                            )
            ) {

                continue;
            }


            traceabilityService
                    .linkUserStory(
                            projectId,
                            requirement.getId(),
                            story.getId(),
                            story.getCode(),
                            story.getTitle()
                    );
        }
    }


    // ==========================================
    // PROMPT
    // ==========================================

    private String buildPrompt(
            Project project,
            List<Requirement> requirements
    ) {

        StringBuilder prompt =
                new StringBuilder();


        prompt.append(
                """
                You are a senior Business Analyst.

                Generate user stories ONLY from the supplied APPROVED software requirements.

                IMPORTANT RULES:

                1. Return ONLY valid JSON.
                2. Do not use Markdown.
                3. Do not use ```json code fences.
                4. Each generated story MUST reference the exact sourceRequirementId supplied.
                5. Do not invent requirement IDs.
                6. Generate at most one primary user story for each supplied requirement.
                7. Create a user story only when the requirement represents user or system behaviour.
                8. Ignore purely internal technical statements that cannot reasonably become a user story.
                9. Actor must represent the person or system role benefiting from the behaviour.
                10. goal must NOT include "I want".
                11. benefit must NOT include "so that".
                12. Generate 2 to 5 clear and testable acceptance criteria.
                13. Do not introduce functionality that does not exist in the supplied requirement.

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
                "\n\nAPPROVED Requirements:\n"
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


            prompt.append(
                    "\nstatus: APPROVED"
            );
        }


        return prompt.toString();
    }


    // ==========================================
    // PARSE GEMINI
    // ==========================================

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


            int firstArray =
                    cleaned.indexOf(
                            '['
                    );


            int lastArray =
                    cleaned.lastIndexOf(
                            ']'
                    );


            if (
                    firstArray >= 0
                            &&
                            lastArray > firstArray
            ) {

                cleaned =
                        cleaned.substring(
                                firstArray,
                                lastArray + 1
                        );
            }


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


    // ==========================================
    // VALIDATE GENERATED STORY
    // ==========================================

    private void validateGeneratedStory(
            GeneratedUserStory story
    ) {

        if (
                story == null
        ) {

            throw new RuntimeException(
                    "Gemini generated an invalid user story."
            );
        }


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
                        story
                                .getAcceptanceCriteria()
                                .isEmpty()
        ) {

            throw new RuntimeException(
                    "Generated user story has no acceptance criteria."
            );
        }
    }


    // ==========================================
    // PROJECT
    // ==========================================

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


    // ==========================================
    // BA ACCESS
    // ==========================================

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


    // ==========================================
    // AUTH USER
    // ==========================================

    private User getAuthenticatedUser(
            Authentication authentication
    ) {

        if (
                authentication == null
                        ||
                        authentication.getName()
                                == null
                        ||
                        authentication.getName()
                                .isBlank()
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


    // ==========================================
    // RESPONSE
    // ==========================================

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

            if (
                    story.getAcceptanceCriteria()
                            != null
                            &&
                            !story
                                    .getAcceptanceCriteria()
                                    .isBlank()
            ) {

                criteria =
                        objectMapper
                                .readValue(
                                        story.getAcceptanceCriteria(),

                                        new TypeReference<
                                                List<String>
                                                >() {
                                        }
                                );
            }

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