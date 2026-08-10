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

import java.time.LocalDateTime;
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

        this.objectMapper = objectMapper;
    }


    /**
     * Main requirement extraction method.
     */
    public RequirementExtractionResponse extract(
            RequirementExtractionRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Extraction request cannot be null."
            );
        }

        /*
         * Create extraction record first.
         */
        RequirementExtraction extraction =
                new RequirementExtraction();

        extraction.setProjectId(
                request.getProjectId()
        );

        extraction.setStatus(
                ExtractionStatus.PROCESSING
        );

        extraction.setCreatedAt(
                LocalDateTime.now()
        );

        extraction =
                requirementExtractionRepository.save(
                        extraction
                );


        try {

            /*
             * Build AI prompt.
             */
            String prompt =
                    buildPrompt(request);


            /*
             * Send document content to Gemini.
             */
            String aiResponse =
                    geminiClient.generateText(prompt);


            if (aiResponse == null ||
                    aiResponse.isBlank()) {

                throw new RuntimeException(
                        "Gemini returned an empty response."
                );
            }


            /*
             * Convert Gemini JSON response
             * into Java DTOs.
             */
            List<ExtractedRequirementResponse>
                    extractedRequirements =
                    parseAiResponse(aiResponse);


            /*
             * Validate AI output.
             */
            List<String> validationErrors =
                    validationService.validate(
                            extractedRequirements
                    );


            if (!validationErrors.isEmpty()) {

                throw new RuntimeException(
                        "Requirement validation failed: "
                                + String.join(
                                "; ",
                                validationErrors
                        )
                );
            }


            /*
             * Save requirements.
             */
            for (
                    ExtractedRequirementResponse extracted
                    : extractedRequirements
            ) {

                Requirement requirement =
                        createRequirementEntity(
                                extracted,
                                request,
                                extraction
                        );

                requirementRepository.save(
                        requirement
                );
            }


            /*
             * Mark extraction as completed.
             */
            extraction.setStatus(
                    ExtractionStatus.COMPLETED
            );

            requirementExtractionRepository.save(
                    extraction
            );


            return new RequirementExtractionResponse(
                    extraction.getId(),
                    request.getProjectId(),
                    ExtractionStatus.COMPLETED,
                    extractedRequirements.size(),
                    extractedRequirements,
                    "Requirements extracted successfully.",
                    extraction.getCreatedAt()
            );

        } catch (Exception exception) {

            /*
             * Mark extraction as failed.
             */
            extraction.setStatus(
                    ExtractionStatus.FAILED
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
     * Get the latest extraction for a project.
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
                                () -> new RuntimeException(
                                        "No extraction found for project: "
                                                + projectId
                                )
                        );

        List<ExtractedRequirementResponse>
                requirements =
                requirementRepository
                        .findByProjectId(projectId)
                        .stream()
                        .map(this::toResponse)
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
     * Build the prompt that is sent to Gemini.
     */
    private String buildPrompt(
            RequirementExtractionRequest request
    ) {

        StringBuilder prompt =
                new StringBuilder();

        prompt.append("""
                You are a professional software requirements
                engineering expert.

                Analyze the following software project document
                and extract clear software requirements.

                IMPORTANT RULES:

                1. Return ONLY valid JSON.
                2. Do not return Markdown.
                3. Do not use ```json.
                4. Do not include explanations outside the JSON.
                5. Extract only requirements supported by the document.
                6. Do not invent unnecessary requirements.
                7. Give each requirement a unique code.
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

                Return the result using exactly this JSON structure:

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
                """);

        prompt.append(
                request.getProjectName()
        );

        prompt.append("\n\nDocument Content:\n");

        prompt.append(
                request.getDocumentContent()
        );

        return prompt.toString();
    }


    /**
     * Parse the JSON returned by Gemini.
     */
    private List<ExtractedRequirementResponse>
    parseAiResponse(String aiResponse) {

        try {

            String cleanedResponse =
                    cleanJsonResponse(aiResponse);

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
     * accidentally returns them.
     */
    private String cleanJsonResponse(
            String response
    ) {

        String cleaned =
                response.trim();

        if (cleaned.startsWith("```json")) {

            cleaned =
                    cleaned.substring(
                            7
                    );
        }

        if (cleaned.startsWith("```")) {

            cleaned =
                    cleaned.substring(
                            3
                    );
        }

        if (cleaned.endsWith("```")) {

            cleaned =
                    cleaned.substring(
                            0,
                            cleaned.length() - 3
                    );
        }

        return cleaned.trim();
    }


    /**
     * Convert extracted DTO → database entity.
     */
    private Requirement createRequirementEntity(
            ExtractedRequirementResponse extracted,
            RequirementExtractionRequest request,
            RequirementExtraction extraction
    ) {

        Requirement requirement =
                new Requirement();

        requirement.setProjectId(
                request.getProjectId()
        );

        /*
         * Link the requirement to the extraction.
         *
         * Requirement.java contains:
         *
         * private RequirementExtraction extraction;
         *
         * Therefore we set the entity relationship
         * directly. JPA will store the extraction ID
         * in the extraction_id column.
         */
        requirement.setExtraction(
                extraction
        );

        requirement.setCode(
                extracted.getCode()
        );

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
     * Convert database entity → DTO.
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