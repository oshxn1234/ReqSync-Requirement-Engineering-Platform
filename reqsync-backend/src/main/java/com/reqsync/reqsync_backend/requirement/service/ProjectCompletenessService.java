package com.reqsync.reqsync_backend.requirement.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reqsync.reqsync_backend.ai.client.GeminiClient;
import com.reqsync.reqsync_backend.requirement.dto.*;
import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.enums.CompletenessStatus;
import com.reqsync.reqsync_backend.requirement.enums.CoverageStatus;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;
import com.reqsync.reqsync_backend.requirement.service.semantic.SemanticSearchService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

//@Service
@Transactional(readOnly = true)
public class ProjectCompletenessService {

    private final RequirementRepository
            requirementRepository;

    private final GeminiClient
            geminiClient;

    private final SemanticSearchService
            semanticSearchService;

    private final CompletenessScoreService
            completenessScoreService;

    private final ObjectMapper
            objectMapper;


    public ProjectCompletenessService(
            RequirementRepository requirementRepository,
            GeminiClient geminiClient,
            SemanticSearchService semanticSearchService,
            CompletenessScoreService completenessScoreService,
            ObjectMapper objectMapper
    ) {

        this.requirementRepository =
                requirementRepository;

        this.geminiClient =
                geminiClient;

        this.semanticSearchService =
                semanticSearchService;

        this.completenessScoreService =
                completenessScoreService;

        this.objectMapper =
                objectMapper;
    }


    public ProjectCompletenessResponse analyzeProject(
            Long projectId
    ) {

        /*
         * Retrieve ALL stored requirements
         * for the project.
         */
        List<Requirement> requirements =
                requirementRepository
                        .findByProjectId(
                                projectId
                        );


        if (requirements.isEmpty()) {

            throw new RuntimeException(
                    "No requirements found for project: "
                            + projectId
            );
        }


        /*
         * Analyze entire project requirement set.
         */
        InitialCompletenessResult initialResult =
                analyzeRequirementSet(
                        requirements
                );


        List<CoverageCheckResponse>
                coverageResults =
                new ArrayList<>();


        List<String>
                confirmedMissing =
                new ArrayList<>();


        /*
         * Confirm every possible project-level gap.
         */
        for (
                PotentialGapResponse gap
                : initialResult.getPotentialGaps()
        ) {

            String semanticQuery =
                    gap.getTopic()
                            + ". "
                            + gap.getDescription();


            /*
             * Search ALL project requirements.
             */
            List<SimilarRequirementResponse>
                    matches =
                    semanticSearchService
                            .searchProject(
                                    projectId,
                                    semanticQuery,
                                    5
                            );


            List<SimilarRequirementResponse>
                    strongMatches =
                    matches
                            .stream()
                            .filter(
                                    match ->
                                            match.getSimilarity()
                                                    >= 0.70
                            )
                            .limit(3)
                            .toList();


            CoverageCheckResponse
                    coverageResult;


            if (
                    strongMatches.isEmpty()
            ) {

                coverageResult =
                        createMissingCoverage(
                                gap
                        );

            } else {

                coverageResult =
                        validateProjectCoverage(
                                gap,
                                strongMatches
                        );
            }


            coverageResults.add(
                    coverageResult
            );


            if (
                    coverageResult.getStatus()
                            == CoverageStatus.MISSING
            ) {

                confirmedMissing.add(
                        gap.getDescription()
                );
            }
        }


        int completenessScore =
                completenessScoreService.calculate(
                        initialResult.getCriteria(),
                        confirmedMissing.size()
                );


        CompletenessStatus status =
                determineCompletenessStatus(
                        completenessScore
                );


        return new ProjectCompletenessResponse(
                projectId,
                requirements.size(),
                completenessScore,
                status,
                initialResult.getCriteria(),
                coverageResults,
                confirmedMissing,
                initialResult.getSuggestions()
        );
    }


    /**
     * Gemini receives ALL requirements
     * belonging to the project.
     */
    private InitialCompletenessResult
    analyzeRequirementSet(
            List<Requirement> requirements
    ) {

        StringBuilder requirementsText =
                new StringBuilder();


        for (
                Requirement requirement
                : requirements
        ) {

            requirementsText
                    .append(
                            requirement.getCode()
                    )
                    .append(" | ")
                    .append(
                            requirement.getType()
                    )
                    .append(" | ")
                    .append(
                            requirement.getTitle()
                    )
                    .append(" | ")
                    .append(
                            requirement.getDescription()
                    )
                    .append("\n");
        }


        String prompt = """
                You are a professional software
                requirements engineering expert.

                Analyze the COMPLETE SET of project
                requirements below as one system.

                Existing Requirements:

                %s


                Analyze overall project completeness
                using:

                FUNCTIONAL_COVERAGE
                NON_FUNCTIONAL_COVERAGE
                SECURITY_COVERAGE
                PERFORMANCE_COVERAGE
                BUSINESS_RULE_COVERAGE
                ERROR_HANDLING_COVERAGE
                WORKFLOW_COVERAGE
                CONSISTENCY
                TESTABILITY
                REQUIREMENT_INTEGRATION


                For each criterion return:

                PASS
                PARTIAL
                FAIL


                Identify possible missing
                requirement areas.

                IMPORTANT:

                Do not assume a potential gap
                is definitely missing.

                ReqSync will search ALL stored
                project requirements using
                semantic search to validate
                each gap.


                Return ONLY JSON:

                {
                  "criteria": [
                    {
                      "criterion": "FUNCTIONAL_COVERAGE",
                      "status": "PASS",
                      "explanation": "..."
                    }
                  ],

                  "potentialGaps": [
                    {
                      "topic": "Audit Logging",
                      "description": "The system may require audit logging."
                    }
                  ],

                  "suggestions": [
                    "..."
                  ]
                }
                """.formatted(
                requirementsText
        );


        String aiResponse =
                geminiClient.generateText(
                        prompt
                );


        try {

            return objectMapper.readValue(
                    cleanJsonResponse(
                            aiResponse
                    ),
                    InitialCompletenessResult.class
            );

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Unable to parse project completeness analysis.",
                    exception
            );
        }
    }


    private CoverageCheckResponse
    validateProjectCoverage(
            PotentialGapResponse gap,
            List<SimilarRequirementResponse> matches
    ) {

        StringBuilder context =
                new StringBuilder();


        for (
                SimilarRequirementResponse match
                : matches
        ) {

            context
                    .append(
                            match.getCode()
                    )
                    .append(" | ")
                    .append(
                            match.getTitle()
                    )
                    .append(" | ")
                    .append(
                            match.getDescription()
                    )
                    .append("\n");
        }


        String prompt = """
                Evaluate whether the potential
                project requirement gap below
                is already covered.

                Potential Gap:

                Topic:
                %s

                Description:
                %s


                Semantically related requirements:

                %s


                Classify as:

                COVERED
                PARTIALLY_COVERED
                MISSING


                Return ONLY JSON:

                {
                  "topic": "...",
                  "status": "COVERED",
                  "relatedRequirementCode": "REQ-001",
                  "reason": "..."
                }
                """.formatted(
                gap.getTopic(),
                gap.getDescription(),
                context
        );


        String aiResponse =
                geminiClient.generateText(
                        prompt
                );


        try {

            return objectMapper.readValue(
                    cleanJsonResponse(
                            aiResponse
                    ),
                    CoverageCheckResponse.class
            );

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Unable to parse project coverage validation.",
                    exception
            );
        }
    }


    private CoverageCheckResponse
    createMissingCoverage(
            PotentialGapResponse gap
    ) {

        CoverageCheckResponse response =
                new CoverageCheckResponse();


        response.setTopic(
                gap.getTopic()
        );

        response.setStatus(
                CoverageStatus.MISSING
        );

        response.setRelatedRequirementCode(
                null
        );

        response.setReason(
                "No sufficiently similar requirement exists in the project."
        );


        return response;
    }


    private CompletenessStatus
    determineCompletenessStatus(
            int score
    ) {

        if (score >= 85) {

            return CompletenessStatus.COMPLETE;
        }

        if (score >= 60) {

            return CompletenessStatus.NEEDS_IMPROVEMENT;
        }

        return CompletenessStatus.INCOMPLETE;
    }


    private String cleanJsonResponse(
            String response
    ) {

        if (response == null ||
                response.isBlank()) {

            throw new RuntimeException(
                    "Gemini returned an empty response."
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
}