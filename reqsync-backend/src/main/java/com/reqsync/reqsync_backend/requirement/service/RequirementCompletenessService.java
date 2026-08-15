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

@Service
@Transactional(readOnly = true)
public class RequirementCompletenessService {

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


    public RequirementCompletenessService(
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


    /**
     * Analyze ONE requirement.
     *
     * However, possible gaps are checked
     * against ALL OTHER requirements
     * within the same project.
     */
    public RequirementCompletenessResponse analyze(
            Long requirementId
    ) {

        Requirement selectedRequirement =
                requirementRepository
                        .findById(
                                requirementId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Requirement not found: "
                                                        + requirementId
                                        )
                        );


        Long projectId =
                selectedRequirement
                        .getProjectId();


        /*
         * Make sure project actually has
         * requirements stored.
         */
        List<Requirement> projectRequirements =
                requirementRepository
                        .findByProjectId(
                                projectId
                        );


        if (projectRequirements.isEmpty()) {

            throw new RuntimeException(
                    "No requirements found for project: "
                            + projectId
            );
        }


        /*
         * STEP 1
         *
         * Analyze ONLY selected requirement.
         */
        InitialCompletenessResult initialResult =
                analyzeSelectedRequirement(
                        selectedRequirement
                );


        /*
         * STEP 2
         *
         * Check every potential gap
         * against ALL OTHER project requirements.
         */
        List<CoverageCheckResponse>
                coverageResults =
                new ArrayList<>();


        List<String>
                confirmedMissing =
                new ArrayList<>();


        for (
                PotentialGapResponse gap
                : initialResult.getPotentialGaps()
        ) {

            String semanticQuery =
                    gap.getTopic()
                            + ". "
                            + gap.getDescription();


            List<SimilarRequirementResponse>
                    semanticMatches =
                    semanticSearchService
                            .searchProject(
                                    projectId,
                                    semanticQuery,
                                    5
                            );


            /*
             * 0.70 is only the starting threshold.
             * You can adjust it after testing.
             */
            List<SimilarRequirementResponse>
                    strongMatches =
                    semanticMatches
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


            if (strongMatches.isEmpty()) {

                coverageResult =
                        createMissingCoverage(
                                gap
                        );

            } else {

                coverageResult =
                        validateCoverageUsingGemini(
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


        /*
         * STEP 3
         *
         * ReqSync calculates score.
         */
        int completenessScore =
                completenessScoreService.calculate(
                        initialResult.getCriteria(),
                        confirmedMissing.size()
                );


        CompletenessStatus status =
                determineCompletenessStatus(
                        completenessScore
                );


        return new RequirementCompletenessResponse(
                selectedRequirement.getId(),
                selectedRequirement.getCode(),
                completenessScore,
                status,
                initialResult.getCriteria(),
                coverageResults,
                confirmedMissing,
                initialResult.getSuggestions()
        );
    }


    /**
     * Gemini analyzes the selected
     * requirement itself.
     */
    private InitialCompletenessResult
    analyzeSelectedRequirement(
            Requirement requirement
    ) {

        String prompt = """
                You are a professional software
                requirements engineering expert.

                Analyze ONLY the following selected
                software requirement.

                Requirement Code:
                %s

                Title:
                %s

                Description:
                %s


                Evaluate the requirement using
                the following completeness criteria:

                ACTOR
                ACTION
                OBJECT
                CONDITIONS
                BUSINESS_RULES
                EXPECTED_OUTCOME
                ERROR_HANDLING
                AMBIGUITY
                CONSISTENCY
                TESTABILITY


                For each criterion return exactly:

                PASS
                PARTIAL
                FAIL


                Also identify POSSIBLE related
                requirements that might be missing.

                IMPORTANT:

                Do NOT assume a potential gap is
                truly missing.

                Another stored requirement in
                the same project may already
                cover that concept.

                ReqSync will perform semantic
                search after this analysis.


                Return ONLY valid JSON.

                Do not include Markdown.

                Return exactly:

                {
                  "criteria": [
                    {
                      "criterion": "ACTOR",
                      "status": "PASS",
                      "explanation": "The actor is clearly identified."
                    }
                  ],

                  "potentialGaps": [
                    {
                      "topic": "Password Recovery",
                      "description": "Users may require a password recovery mechanism."
                    }
                  ],

                  "suggestions": [
                    "Specify expected system behavior when registration fails."
                  ]
                }
                """.formatted(
                requirement.getCode(),
                requirement.getTitle(),
                requirement.getDescription()
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
                    "Unable to parse Gemini completeness analysis.",
                    exception
            );
        }
    }


    /**
     * Semantic search found related requirements.
     *
     * Gemini now determines whether those
     * requirements actually cover the gap.
     */
    private CoverageCheckResponse
    validateCoverageUsingGemini(
            PotentialGapResponse gap,
            List<SimilarRequirementResponse> matches
    ) {

        StringBuilder requirementContext =
                new StringBuilder();


        for (
                SimilarRequirementResponse match
                : matches
        ) {

            requirementContext
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
                You are performing software
                requirement coverage analysis.

                Potential gap:

                Topic:
                %s

                Description:
                %s


                Existing semantically related
                requirements:

                %s


                Determine whether this potential
                gap is:

                COVERED

                = An existing requirement fully
                  addresses the concept.

                PARTIALLY_COVERED

                = An existing requirement addresses
                  part of the concept but important
                  details remain missing.

                MISSING

                = None of these requirements
                  adequately addresses the concept.


                Return ONLY valid JSON:

                {
                  "topic": "...",
                  "status": "COVERED",
                  "relatedRequirementCode": "REQ-001",
                  "reason": "..."
                }
                """.formatted(
                gap.getTopic(),
                gap.getDescription(),
                requirementContext
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
                    "Unable to parse requirement coverage analysis.",
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
                "No sufficiently similar requirement was found in the project."
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


    /**
     * Remove Markdown fences if Gemini
     * accidentally returns them.
     */
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