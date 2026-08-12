package com.reqsync.reqsync_backend.requirement.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reqsync.reqsync_backend.ai.client.GeminiClient;
import com.reqsync.reqsync_backend.project.entity.Project;
import com.reqsync.reqsync_backend.project.repository.ProjectRepository;
import com.reqsync.reqsync_backend.requirement.dto.ExtractedRequirementResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementExtractionRequest;
import com.reqsync.reqsync_backend.requirement.dto.RequirementExtractionResponse;
import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.entity.RequirementExtraction;
import com.reqsync.reqsync_backend.requirement.enums.ExtractionStatus;
import com.reqsync.reqsync_backend.requirement.repository.RequirementExtractionRepository;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;
import com.reqsync.reqsync_backend.requirement.service.semantic.RequirementEmbeddingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class RequirementExtractionService {

    private final GeminiClient geminiClient;

    private final RequirementRepository
            requirementRepository;

    private final RequirementExtractionRepository
            requirementExtractionRepository;

    private final RequirementValidationService
            validationService;

    private final ObjectMapper
            objectMapper;

    private final ProjectRepository
            projectRepository;

    private final RequirementEmbeddingService
            requirementEmbeddingService;

    private final RequirementCodeService
            requirementCodeService;


    public RequirementExtractionService(
            GeminiClient geminiClient,
            RequirementRepository requirementRepository,
            RequirementExtractionRepository requirementExtractionRepository,
            RequirementValidationService validationService,
            ObjectMapper objectMapper,
            ProjectRepository projectRepository,
            RequirementEmbeddingService requirementEmbeddingService,
            RequirementCodeService requirementCodeService
    ) {

        this.geminiClient =
                geminiClient;

        this.requirementRepository =
                requirementRepository;

        this.requirementExtractionRepository =
                requirementExtractionRepository;

        this.validationService =
                validationService;

        this.objectMapper =
                objectMapper;

        this.projectRepository =
                projectRepository;

        this.requirementEmbeddingService =
                requirementEmbeddingService;

        this.requirementCodeService =
                requirementCodeService;
    }


    /**
     * Main extraction method.
     */
    public RequirementExtractionResponse extract(
            RequirementExtractionRequest request
    ) {

        /*
         * STEP 1
         * Validate request.
         */
        validateExtractionRequest(
                request
        );


        /*
         * STEP 2
         * Verify project exists.
         */
        Project project =
                projectRepository
                        .findById(
                                request.getProjectId()
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Project not found: "
                                                        + request.getProjectId()
                                        )
                        );


        /*
         * STEP 3
         * Create extraction record.
         */
        RequirementExtraction extraction =
                new RequirementExtraction();

        extraction.setProjectId(
                project.getId()
        );

        /*
         * Temporary values while testing.
         *
         * Later these values should come
         * from the uploaded document.
         */
        extraction.setDocumentName(
                "Meeting Notes"
        );

        extraction.setDocumentType(
                "TEXT"
        );

        extraction.setRequirementCount(
                0
        );

        extraction.setStatus(
                ExtractionStatus.PROCESSING
        );


        extraction =
                requirementExtractionRepository.save(
                        extraction
                );


        try {

            /*
             * STEP 4
             * Build Gemini prompt.
             */
            String prompt =
                    buildPrompt(
                            request,
                            project
                    );


            /*
             * STEP 5
             * Send text to Gemini.
             */
            String aiResponse =
                    geminiClient.generateText(
                            prompt
                    );


            if (
                    aiResponse == null ||
                            aiResponse.isBlank()
            ) {

                throw new RuntimeException(
                        "Gemini returned an empty response."
                );
            }


            /*
             * STEP 6
             * Parse Gemini JSON.
             */
            List<ExtractedRequirementResponse>
                    extractedRequirements =
                    parseAiResponse(
                            aiResponse
                    );


            /*
             * STEP 7
             * Validate Gemini output.
             */
            List<String> validationErrors =
                    validationService.validate(
                            extractedRequirements
                    );


            if (
                    !validationErrors.isEmpty()
            ) {

                throw new RuntimeException(
                        "Requirement validation failed: "
                                + String.join(
                                "; ",
                                validationErrors
                        )
                );
            }


            /*
             * ------------------------------------------------
             * STEP 8
             * GET THE FIRST REQSYNC-GENERATED NUMBER
             * ------------------------------------------------
             *
             * Example:
             *
             * If this project already has:
             *
             * REQ-001 ... REQ-020
             *
             * nextRequirementNumber becomes:
             *
             * 21
             */
            int nextRequirementNumber =
                    requirementCodeService
                            .getNextRequirementNumber(
                                    project.getId()
                            );


            List<ExtractedRequirementResponse>
                    savedRequirements =
                    new ArrayList<>();


            /*
             * STEP 9
             * Process Gemini results one by one.
             */
            for (
                    ExtractedRequirementResponse extracted
                    : extractedRequirements
            ) {

                /*
                 * --------------------------------------------
                 * DUPLICATE CHECK
                 * --------------------------------------------
                 *
                 * Don't save exactly the same requirement
                 * twice in the same project.
                 */
                boolean duplicate =
                        requirementRepository
                                .existsByProjectIdAndTitleIgnoreCaseAndDescriptionIgnoreCase(
                                        project.getId(),
                                        extracted.getTitle(),
                                        extracted.getDescription()
                                );


                if (duplicate) {

                    System.out.println(
                            "Skipping duplicate requirement: "
                                    + extracted.getTitle()
                    );

                    continue;
                }


                /*
                 * --------------------------------------------
                 * REQSYNC GENERATES FINAL CODE
                 * --------------------------------------------
                 *
                 * Gemini may have returned:
                 *
                 * REQ-001
                 *
                 * but we IGNORE it.
                 */
                String generatedCode =
                        requirementCodeService
                                .generateCode(
                                        nextRequirementNumber
                                );


                /*
                 * Only advance the counter if
                 * the requirement will actually
                 * be saved.
                 */
                nextRequirementNumber++;


                /*
                 * Convert Gemini DTO to entity.
                 */
                Requirement requirement =
                        createRequirementEntity(
                                extracted,
                                project,
                                extraction
                        );


                /*
                 * Override Gemini-generated code
                 * with ReqSync-generated code.
                 */
                requirement.setCode(
                        generatedCode
                );


                /*
                 * Save requirement.
                 */
                Requirement savedRequirement =
                        requirementRepository.save(
                                requirement
                        );


                /*
                 * Generate embedding.
                 *
                 * Embedding failure should NOT
                 * cause requirement extraction
                 * itself to fail.
                 */
                /*try {

                    requirementEmbeddingService
                            .generateAndStoreEmbedding(
                                    savedRequirement.getId()
                            );

                } catch (Exception embeddingException) {

                    System.err.println(
                            "Embedding generation failed for "
                                    + savedRequirement.getCode()
                                    + ": "
                                    + embeddingException.getMessage()
                    );
                }
            */

                /*
                 * Return saved requirement with
                 * database-generated ID and
                 * ReqSync-generated code.
                 */
                savedRequirements.add(
                        toResponse(
                                savedRequirement
                        )
                );
            }


            /*
             * STEP 10
             * Finish extraction.
             */
            extraction.setRequirementCount(
                    savedRequirements.size()
            );

            extraction.setStatus(
                    ExtractionStatus.COMPLETED
            );

            extraction.setErrorMessage(
                    null
            );


            requirementExtractionRepository.save(
                    extraction
            );


            /*
             * STEP 11
             * Return result.
             */
            return new RequirementExtractionResponse(
                    extraction.getId(),
                    project.getId(),
                    ExtractionStatus.COMPLETED,
                    savedRequirements.size(),
                    savedRequirements,
                    "Requirements extracted successfully.",
                    extraction.getCreatedAt()
            );


        } catch (Exception exception) {

            /*
             * Mark extraction as FAILED.
             */
            extraction.setStatus(
                    ExtractionStatus.FAILED
            );


            String errorMessage =
                    exception.getMessage();


            if (
                    errorMessage != null &&
                            errorMessage.length() > 1900
            ) {

                errorMessage =
                        errorMessage.substring(
                                0,
                                1900
                        );
            }


            extraction.setErrorMessage(
                    errorMessage
            );


            requirementExtractionRepository.save(
                    extraction
            );


            throw new RuntimeException(
                    "Requirement extraction failed: "
                            + exception.getMessage(),
                    exception
            );
        }
    }


    /**
     * Validate extraction request.
     */
    private void validateExtractionRequest(
            RequirementExtractionRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Extraction request cannot be null."
            );
        }


        if (
                request.getProjectId() == null
        ) {

            throw new IllegalArgumentException(
                    "Project ID is required."
            );
        }


        if (
                request.getDocumentContent() == null ||
                        request.getDocumentContent().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Document content cannot be empty."
            );
        }
    }


    /**
     * Get latest extraction for project.
     */
    @Transactional(readOnly = true)
    public RequirementExtractionResponse
    getLatestExtraction(
            Long projectId
    ) {

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


        RequirementExtraction extraction =
                requirementExtractionRepository
                        .findFirstByProjectIdOrderByCreatedAtDesc(
                                projectId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "No extraction found for project: "
                                                        + projectId
                                        )
                        );


        List<ExtractedRequirementResponse>
                requirements =
                requirementRepository
                        .findByProjectId(
                                projectId
                        )
                        .stream()
                        .map(
                                this::toResponse
                        )
                        .toList();


        return new RequirementExtractionResponse(
                extraction.getId(),
                projectId,
                extraction.getStatus(),
                requirements.size(),
                requirements,
                "Latest extraction retrieved successfully.",
                extraction.getCreatedAt()
        );
    }


    /**
     * Build Gemini prompt.
     */
    private String buildPrompt(
            RequirementExtractionRequest request,
            Project project
    ) {

        StringBuilder prompt =
                new StringBuilder();


        prompt.append(
                """
                You are a professional software requirements
                engineering expert.

                Analyze the following software project document
                and extract clear software requirements.

                IMPORTANT RULES:

                1. Return ONLY valid JSON.
                2. Do not return Markdown.
                3. Do not use ```json.
                4. Do not include explanations outside JSON.
                5. Extract only requirements supported by the document.
                6. Do not invent unnecessary requirements.

                7. Give each extracted requirement a temporary
                   sequential code.

                8. Temporary codes may use:
                   REQ-001, REQ-002, REQ-003.

                9. The backend will generate the final
                   project-specific requirement code.

                10. Identify the requirement type.
                11. Identify the requirement priority.
                12. Set the initial status to DRAFT.
                13. Provide a confidence score between 0 and 1.

                Allowed requirement types:

                FUNCTIONAL
                NON_FUNCTIONAL
                BUSINESS
                TECHNICAL
                SECURITY
                PERFORMANCE

                Allowed priorities:

                LOW
                MEDIUM
                HIGH
                CRITICAL

                Allowed statuses:

                DRAFT
                REVIEW
                APPROVED
                REJECTED

                Return exactly this JSON structure:

                [
                  {
                    "code": "REQ-001",
                    "title": "User Login",
                    "description": "The system shall allow users to log in.",
                    "type": "FUNCTIONAL",
                    "priority": "HIGH",
                    "status": "DRAFT",
                    "confidenceScore": 0.95
                  }
                ]

                Project Name:
                """
        );


        prompt.append(
                project.getName()
        );


        prompt.append(
                "\n\nProject Description:\n"
        );


        if (
                project.getDescription() != null
        ) {

            prompt.append(
                    project.getDescription()
            );
        }


        prompt.append(
                "\n\nDocument Content:\n"
        );


        prompt.append(
                request.getDocumentContent()
        );


        return prompt.toString();
    }


    /**
     * Parse Gemini JSON.
     */
    private List<ExtractedRequirementResponse>
    parseAiResponse(
            String aiResponse
    ) {

        try {

            String cleanedResponse =
                    cleanJsonResponse(
                            aiResponse
                    );


            return objectMapper.readValue(
                    cleanedResponse,
                    new TypeReference<
                            List<ExtractedRequirementResponse>
                            >() {
                    }
            );


        } catch (Exception exception) {

            throw new RuntimeException(
                    "Unable to parse Gemini response as requirement JSON.",
                    exception
            );
        }
    }


    /**
     * Clean JSON fences.
     */
    private String cleanJsonResponse(
            String response
    ) {

        if (
                response == null ||
                        response.isBlank()
        ) {

            throw new RuntimeException(
                    "Gemini response is empty."
            );
        }


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


    /**
     * Convert Gemini result to Requirement entity.
     */
    private Requirement createRequirementEntity(
            ExtractedRequirementResponse extracted,
            Project project,
            RequirementExtraction extraction
    ) {

        Requirement requirement =
                new Requirement();


        requirement.setProjectId(
                project.getId()
        );


        requirement.setExtraction(
                extraction
        );


        /*
         * We intentionally do NOT set the
         * final requirement code here.
         *
         * The code is assigned later by:
         *
         * RequirementCodeService
         */
        requirement.setTitle(
                extracted.getTitle()
        );


        requirement.setDescription(
                extracted.getDescription()
        );


        requirement.setType(
                extracted.getType()
        );


        requirement.setPriority(
                extracted.getPriority()
        );


        requirement.setStatus(
                extracted.getStatus()
        );


        requirement.setConfidenceScore(
                extracted.getConfidenceScore()
        );


        return requirement;
    }


    /**
     * Convert saved Requirement to DTO.
     */
    private ExtractedRequirementResponse toResponse(
            Requirement requirement
    ) {

        return new ExtractedRequirementResponse(
                requirement.getId(),
                requirement.getCode(),
                requirement.getTitle(),
                requirement.getDescription(),
                requirement.getType(),
                requirement.getPriority(),
                requirement.getStatus(),
                requirement.getConfidenceScore()
        );
    }
}