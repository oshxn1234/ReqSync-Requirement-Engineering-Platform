package com.reqsync.reqsync_backend.srs.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.reqsync.reqsync_backend.ai.client.GeminiClient;

import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.knowledge.service.KnowledgeService;

import com.reqsync.reqsync_backend.project.entity.Project;
import com.reqsync.reqsync_backend.project.repository.ProjectRepository;

import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;

import com.reqsync.reqsync_backend.srs.dto.SrsGenerationResponse;
import com.reqsync.reqsync_backend.srs.dto.SrsSection;
import com.reqsync.reqsync_backend.srs.dto.SrsUpdateRequest;
import com.reqsync.reqsync_backend.srs.entity.SrsDocument;
import com.reqsync.reqsync_backend.srs.enums.SrsStatus;
import com.reqsync.reqsync_backend.srs.repository.SrsDocumentRepository;

import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Transactional
public class SrsGenerationService {

    private static final Pattern HEADING_PATTERN =
            Pattern.compile("^#{2}\\s+(.+)$");

    private final GeminiClient geminiClient;

    private final SrsDocumentRepository
            srsDocumentRepository;

    private final RequirementRepository
            requirementRepository;

    private final ProjectRepository
            projectRepository;

    private final UserRepository
            userRepository;

    private final KnowledgeService
            knowledgeService;

    private final ObjectMapper
            objectMapper;

    public SrsGenerationService(
            GeminiClient geminiClient,
            SrsDocumentRepository srsDocumentRepository,
            RequirementRepository requirementRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            KnowledgeService knowledgeService,
            ObjectMapper objectMapper
    ) {

        this.geminiClient =
                geminiClient;

        this.srsDocumentRepository =
                srsDocumentRepository;

        this.requirementRepository =
                requirementRepository;

        this.projectRepository =
                projectRepository;

        this.userRepository =
                userRepository;

        this.knowledgeService =
                knowledgeService;

        this.objectMapper =
                objectMapper;
    }


    // =========================================================
    // GENERATE SRS
    // =========================================================

    public SrsGenerationResponse generate(
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
                    "No requirements exist for this project. "
                            + "Add requirements before generating the SRS."
            );
        }

        String prompt =
                buildPrompt(
                        project,
                        requirements
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
                    "Gemini returned an empty SRS document."
            );
        }

        String cleanedContent =
                stripCodeFences(
                        geminiResponse.trim()
                );

        List<SrsSection> sections =
                parseSections(
                        cleanedContent
                );

        SrsDocument document =
                new SrsDocument();

        document.setProjectId(
                projectId
        );

        document.setProjectName(
                project.getName()
        );

        document.setVersion(
                nextVersion(
                        projectId
                )
        );

        document.setTitle(
                "Software Requirements Specification - "
                        + project.getName()
        );

        document.setStatus(
                SrsStatus.GENERATED
        );

        document.setGeneratedBy(
                currentUser.getId()
        );

        document.setMarkdownContent(
                cleanedContent
        );

        document.setSectionsJson(
                toJson(
                        sections
                )
        );

        SrsDocument savedDocument =
                srsDocumentRepository
                        .save(
                                document
                        );

        /*
         * Only completed projects publish their
         * SRS document into the Knowledge Vault.
         *
         * publishSrsToVault() ignores non-completed
         * projects, so work in progress is never
         * exposed as reusable knowledge.
         */
        knowledgeService
                .publishSrsToVault(
                        project,
                        savedDocument
                );

        return toResponse(
                savedDocument
        );
    }


    // =========================================================
    // GET PROJECT SRS
    // =========================================================

    @Transactional(readOnly = true)
    public SrsGenerationResponse getProjectSrs(
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

        return srsDocumentRepository
                .findTopByProjectIdOrderByVersionDesc(
                        projectId
                )
                .map(
                        this::toResponse
                )
                .orElse(
                        null
                );
    }


    // =========================================================
    // GET ALL PROJECT SRS VERSIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<SrsGenerationResponse> getAllProjectSrs(
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

        return srsDocumentRepository
                .findByProjectIdOrderByVersionDesc(
                        projectId
                )
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }


    // =========================================================
    // GET SINGLE SRS
    // =========================================================

    @Transactional(readOnly = true)
    public SrsGenerationResponse getSrsById(
            Long srsId,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );

        SrsDocument document =
                srsDocumentRepository
                        .findById(
                                srsId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "SRS document not found."
                                        )
                        );

        getProject(
                document.getProjectId(),
                currentUser
        );

        return toResponse(
                document
        );
    }


    // =========================================================
    // UPDATE SRS
    // =========================================================

    public SrsGenerationResponse update(
            Long srsId,
            SrsUpdateRequest request,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );

        SrsDocument document =
                srsDocumentRepository
                        .findById(
                                srsId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "SRS document not found."
                                        )
                        );

        Project project =
                getProject(
                        document.getProjectId(),
                        currentUser
                );

        if (
                request.title() != null
                        &&
                        !request.title().isBlank()
        ) {

            document.setTitle(
                    request.title().trim()
            );
        }

        if (
                request.content() != null
                        &&
                        !request.content().isBlank()
        ) {

            String cleanedContent =
                    stripCodeFences(
                            request.content().trim()
                    );

            document.setMarkdownContent(
                    cleanedContent
            );

            document.setSectionsJson(
                    toJson(
                            parseSections(
                                    cleanedContent
                            )
                    )
            );
        }

        if (
                request.status() != null
                        &&
                        !request.status().isBlank()
        ) {

            try {

                document.setStatus(
                        SrsStatus.valueOf(
                                request.status().trim()
                                        .toUpperCase()
                        )
                );

            } catch (IllegalArgumentException exception) {

                throw new IllegalArgumentException(
                        "Invalid SRS status: "
                                + request.status()
                );
            }
        }

        return toResponse(
                srsDocumentRepository
                        .save(
                                document
                        )
        );
    }


    // =========================================================
    // DELETE SRS
    // =========================================================

    public void delete(
            Long srsId,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );

        SrsDocument document =
                srsDocumentRepository
                        .findById(
                                srsId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "SRS document not found."
                                        )
                        );

        Project project =
                getProject(
                        document.getProjectId(),
                        currentUser
                );

        srsDocumentRepository
                .delete(
                        document
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
                You are a senior software requirements engineer.

                Generate a complete Software Requirements Specification (SRS)
                document for the supplied project using the SRS Standard
                Template v3.0.

                Document structure (use EXACTLY these ## headings):

                ## 1. Introduction
                  ### 1.1 Purpose
                  ### 1.2 Scope
                  ### 1.3 Definitions and Acronyms
                  ### 1.4 References
                  ### 1.5 Overview

                ## 2. Overall Description
                  ### 2.1 Product Perspective
                  ### 2.2 Product Functions
                  ### 2.3 User Characteristics
                  ### 2.4 Constraints and Assumptions

                ## 3. Specific Requirements
                  ### 3.1 Functional Requirements
                  ### 3.2 Non-Functional Requirements
                  ### 3.3 Data Requirements
                  ### 3.4 Interface Requirements

                ## 4. Verification and Acceptance Criteria

                ## 5. Appendices

                RULES:
                1. Return ONLY the SRS document as Markdown.
                2. Use ## for the main sections and ### for subsections exactly
                   as listed above.
                3. Every supplied requirement MUST be traceable inside the
                   Functional Requirements subsection using its requirement code.
                4. Group functional requirements by type and priority.
                5. Include realistic performance, security and usability
                   targets that match the requirement types.
                6. Do NOT use HTML, do NOT wrap the document in code fences,
                   and do NOT add any commentary outside the document.
                """
        );

        prompt.append(
                "\nProject: "
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
                    "code: "
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
                    "\npriority: "
            );

            prompt.append(
                    requirement.getPriority()
            );

            prompt.append(
                    "\nactors: "
            );

            prompt.append(
                    requirement.getActors()
            );

            prompt.append(
                    "\npreconditions: "
            );

            prompt.append(
                    requirement.getPreconditions()
            );

            prompt.append(
                    "\nexpectedOutcome: "
            );

            prompt.append(
                    requirement.getExpectedOutcome()
            );
        }

        prompt.append(
                "\n\nGenerate the complete SRS document now."
        );

        return prompt.toString();
    }


    // =========================================================
    // PARSE SECTIONS
    // =========================================================

    private List<SrsSection> parseSections(
            String markdown
    ) {

        List<SrsSection> sections =
                new ArrayList<>();

        String currentTitle =
                null;

        StringBuilder currentContent =
                new StringBuilder();

        int order =
                0;

        for (
                String rawLine
                : markdown.split(
                        "\\R"
                )
        ) {

            String line =
                    rawLine.trim();

            Matcher matcher =
                    HEADING_PATTERN
                            .matcher(
                                    line
                            );

            if (
                    matcher.matches()
            ) {

                if (
                        currentTitle != null
                ) {

                    sections.add(
                            new SrsSection(
                                    currentTitle,
                                    currentContent
                                            .toString()
                                            .trim(),
                                    order
                            )
                    );

                    order++;
                }

                currentTitle =
                        matcher.group(1)
                                .trim();

                currentContent =
                        new StringBuilder();
            }

            else {

                currentContent
                        .append(
                                rawLine
                        );

                currentContent
                        .append(
                                "\n"
                        );
            }
        }

        if (
                currentTitle != null
        ) {

            sections.add(
                    new SrsSection(
                            currentTitle,
                            currentContent
                                    .toString()
                                    .trim(),
                            order
                    )
            );
        }

        return sections;
    }


    // =========================================================
    // HELPERS
    // =========================================================

    private String stripCodeFences(
            String content
    ) {

        String cleaned =
                content.trim();

        if (
                cleaned.startsWith(
                        "```markdown"
                )
        ) {

            cleaned =
                    cleaned.substring(
                            11
                    );
        }

        else if (
                cleaned.startsWith(
                        "```md"
                )
        ) {

            cleaned =
                    cleaned.substring(
                            5
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

        return cleaned.trim();
    }


    private int nextVersion(
            Long projectId
    ) {

        return srsDocumentRepository
                .findTopByProjectIdOrderByVersionDesc(
                        projectId
                )
                .map(
                        document ->
                                document.getVersion() + 1
                )
                .orElse(1);
    }


    private String toJson(
            List<SrsSection> sections
    ) {

        try {

            return objectMapper
                    .writeValueAsString(
                            sections
                    );

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Unable to serialize SRS sections.",
                    exception
            );
        }
    }


    private List<SrsSection> fromJson(
            String sectionsJson
    ) {

        try {

            if (
                    sectionsJson == null
                            ||
                            sectionsJson.isBlank()
            ) {

                return List.of();
            }

            return objectMapper
                    .readValue(
                            sectionsJson,
                            new TypeReference<
                                    List<SrsSection>
                                    >() {
                            }
                    );

        } catch (Exception exception) {

            return List.of();
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

    private SrsGenerationResponse toResponse(
            SrsDocument document
    ) {

        return new SrsGenerationResponse(
                document.getId(),
                document.getProjectId(),
                document.getProjectName(),
                document.getVersion(),
                document.getTitle(),
                document.getStatus(),
                fromJson(
                        document.getSectionsJson()
                ),
                document.getMarkdownContent(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }
}
