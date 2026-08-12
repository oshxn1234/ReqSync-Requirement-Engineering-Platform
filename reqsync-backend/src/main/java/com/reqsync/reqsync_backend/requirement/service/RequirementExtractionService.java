package com.reqsync.reqsync_backend.requirement.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reqsync.reqsync_backend.ai.client.GeminiClient;
import com.reqsync.reqsync_backend.requirement.dto.ExtractedRequirementResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementExtractionRequest;
import com.reqsync.reqsync_backend.requirement.dto.RequirementExtractionResponse;
import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.entity.RequirementExtraction;
import com.reqsync.reqsync_backend.requirement.enums.ExtractionStatus;
import com.reqsync.reqsync_backend.requirement.repository.RequirementExtractionRepository;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class RequirementExtractionService {

    private final GeminiClient geminiClient;

    private final RequirementRepository requirementRepository;

    private final RequirementExtractionRepository
            requirementExtractionRepository;

    private final RequirementValidationService
            validationService;

    private final ObjectMapper objectMapper;


    public RequirementExtractionService(
            GeminiClient geminiClient,
            RequirementRepository requirementRepository,
            RequirementExtractionRepository requirementExtractionRepository,
            RequirementValidationService validationService,
            ObjectMapper objectMapper
    ) {

        this.geminiClient = geminiClient;

        this.requirementRepository =
                requirementRepository;

        this.requirementExtractionRepository =
                requirementExtractionRepository;

        this.validationService =
                validationService;

        this.objectMapper =
                objectMapper;
    }


    /**
     * Main requirement extraction method.
     */
    public RequirementExtractionResponse extract(
            RequirementExtractionRequest request
    ) {

        /*
         * Validate request first.
         */
        validateExtractionRequest(
                request
        );


        /*
         * Create an extraction record before
         * sending the document to Gemini.
         */
        RequirementExtraction extraction =
                new RequirementExtraction();

        extraction.setProjectId(
                request.getProjectId()
        );

        /*
         * Temporary values while we are
         * testing through the console.
         *
         * Later these values can come from
         * the React frontend.
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


        /*
         * @PrePersist in RequirementExtraction
         * automatically sets createdAt and updatedAt.
         */
        extraction =
                requirementExtractionRepository.save(
                        extraction
                );


        try {

            /*
             * ------------------------------------------------
             * STEP 1
             * Build prompt for Gemini.
             * ------------------------------------------------
             */
            String prompt =
                    buildPrompt(
                            request
                    );


            /*
             * ------------------------------------------------
             * STEP 2
             * Send document content to Gemini.
             * ------------------------------------------------
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
             * ------------------------------------------------
             * STEP 3
             * Convert Gemini JSON into Java DTOs.
             * ------------------------------------------------
             */
            List<ExtractedRequirementResponse>
                    extractedRequirements =
                    parseAiResponse(
                            aiResponse
                    );


            /*
             * ------------------------------------------------
             * STEP 4
             * Validate the AI-generated requirements.
             * ------------------------------------------------
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
             * STEP 5
             * Save extracted requirements into PostgreSQL.
             * ------------------------------------------------
             *
             * IMPORTANT:
             *
             * The DTOs coming from Gemini do not have
             * PostgreSQL database IDs.
             *
             * Therefore:
             *
             * Gemini DTO
             *     ↓
             * Requirement entity
             *     ↓
             * save()
             *     ↓
             * PostgreSQL generates ID
             *     ↓
             * convert saved entity back into DTO
             *
             * This is why we create a separate
             * savedRequirements list.
             */
            List<ExtractedRequirementResponse>
                    savedRequirements =
                    new ArrayList<>();


            for (
                    ExtractedRequirementResponse extracted
                    : extractedRequirements
            ) {

                /*
                 * Convert Gemini DTO to entity.
                 */
                Requirement requirement =
                        createRequirementEntity(
                                extracted,
                                request,
                                extraction
                        );


                /*
                 * Save entity.
                 *
                 * PostgreSQL generates the primary key here.
                 */
                Requirement savedRequirement =
                        requirementRepository.save(
                                requirement
                        );


                /*
                 * Convert saved entity back into response DTO.
                 *
                 * savedRequirement.getId()
                 * now contains the generated database ID.
                 */
                ExtractedRequirementResponse
                        savedResponse =
                        toResponse(
                                savedRequirement
                        );


                savedRequirements.add(
                        savedResponse
                );
            }


            /*
             * ------------------------------------------------
             * STEP 6
             * Mark extraction as completed.
             * ------------------------------------------------
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
             * ------------------------------------------------
             * STEP 7
             * Return requirements with database IDs.
             * ------------------------------------------------
             */
            return new RequirementExtractionResponse(
                    extraction.getId(),
                    request.getProjectId(),
                    ExtractionStatus.COMPLETED,
                    savedRequirements.size(),
                    savedRequirements,
                    "Requirements extracted successfully.",
                    extraction.getCreatedAt()
            );


        } catch (Exception exception) {

            /*
             * ------------------------------------------------
             * FAILED extraction handling.
             * ------------------------------------------------
             */
            extraction.setStatus(
                    ExtractionStatus.FAILED
            );


            String errorMessage =
                    exception.getMessage();


            /*
             * Database error_message column
             * has a maximum length of 2000.
             */
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
     * Validate the request before processing.
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
                request.getProjectName() == null ||
                        request.getProjectName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Project name is required."
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
     * Get the latest extraction for a project.
     *
     * NOTE:
     * This currently retrieves all requirements
     * belonging to the project.
     *
     * We can improve this later so that it returns
     * only the requirements created by the latest
     * extraction.
     */
    @Transactional(readOnly = true)
    public RequirementExtractionResponse getLatestExtraction(
            Long projectId
    ) {

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
     * Build prompt sent to Gemini.
     */
    private String buildPrompt(
            RequirementExtractionRequest request
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
                7. Give every requirement a unique code.
                8. Use codes such as REQ-001, REQ-002, REQ-003.
                9. Identify the requirement type.
                10. Identify the requirement priority.
                11. Set the initial status to DRAFT.
                12. Provide a confidence score between 0 and 1.

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
                request.getProjectName()
        );


        prompt.append(
                "\n\nDocument Content:\n"
        );


        prompt.append(
                request.getDocumentContent()
        );


        return prompt.toString();
    }


    /**
     * Convert Gemini JSON response into DTO objects.
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
     * Remove Markdown code fences if Gemini
     * accidentally includes them.
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
     * Convert Gemini DTO into Requirement entity.
     */
    private Requirement createRequirementEntity(
            ExtractedRequirementResponse extracted,
            RequirementExtractionRequest request,
            RequirementExtraction extraction
    ) {

        Requirement requirement =
                new Requirement();


        /*
         * Project ownership.
         */
        requirement.setProjectId(
                request.getProjectId()
        );


        /*
         * Link requirement to the extraction.
         *
         * This creates:
         *
         * requirements.extraction_id
         */
        requirement.setExtraction(
                extraction
        );


        /*
         * Requirement code.
         */
        requirement.setCode(
                extracted.getCode()
        );


        /*
         * Requirement title.
         */
        requirement.setTitle(
                extracted.getTitle()
        );


        /*
         * Requirement description.
         */
        requirement.setDescription(
                extracted.getDescription()
        );


        /*
         * Requirement type.
         */
        requirement.setType(
                extracted.getType()
        );


        /*
         * Requirement priority.
         */
        requirement.setPriority(
                extracted.getPriority()
        );


        /*
         * Requirement lifecycle status.
         */
        requirement.setStatus(
                extracted.getStatus()
        );


        /*
         * AI confidence score.
         */
        requirement.setConfidenceScore(
                extracted.getConfidenceScore()
        );


        return requirement;
    }


    /**
     * Convert database Requirement entity
     * into response DTO.
     *
     * IMPORTANT:
     *
     * This method includes requirement.getId(),
     * so once the entity has been saved,
     * the DTO contains the PostgreSQL-generated ID.
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