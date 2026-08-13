package com.reqsync.reqsync_backend.requirement.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reqsync.reqsync_backend.ai.client.GeminiClient;
import com.reqsync.reqsync_backend.requirement.dto.CompletenessCriterionResponse;
import com.reqsync.reqsync_backend.requirement.dto.CoverageCheckResponse;
import com.reqsync.reqsync_backend.requirement.dto.InitialCompletenessResult;
import com.reqsync.reqsync_backend.requirement.dto.PotentialGapResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementCompletenessResponse;
import com.reqsync.reqsync_backend.requirement.dto.SimilarRequirementResponse;
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

    private static final double
            SIMILARITY_THRESHOLD = 0.70;


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
     * Analyze ONE selected requirement.
     */
    public RequirementCompletenessResponse analyze(
            Long requirementId
    ) {

        /*
         * STEP 1
         * Get selected requirement.
         */
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


        /*
         * STEP 2
         * Gemini checks the selected
         * requirement itself.
         */
        InitialCompletenessResult initialResult =
                analyzeSelectedRequirement(
                        selectedRequirement
                );


        /*
         * Defensive null handling.
         */
        if (
                initialResult.getCriteria()
                        == null
        ) {

            initialResult.setCriteria(
                    new ArrayList<>()
            );
        }


        if (
                initialResult.getPotentialGaps()
                        == null
        ) {

            initialResult.setPotentialGaps(
                    new ArrayList<>()
            );
        }


        if (
                initialResult.getSuggestions()
                        == null
        ) {

            initialResult.setSuggestions(
                    new ArrayList<>()
            );
        }


        List<CoverageCheckResponse>
                coverageChecks =
                new ArrayList<>();


        List<String>
                confirmedMissing =
                new ArrayList<>();


        /*
         * STEP 3
         * Check every possible gap.
         */
        for (
                PotentialGapResponse gap
                : initialResult.getPotentialGaps()
        ) {

            if (
                    gap == null ||
                            gap.getDescription() == null ||
                            gap.getDescription().isBlank()
            ) {

                continue;
            }


            String topic =
                    gap.getTopic() == null
                            ? "Potential Requirement Gap"
                            : gap.getTopic();


            String semanticQuery =
                    topic
                            + ". "
                            + gap.getDescription();


            /*
             * Search OTHER requirements
             * in the same project.
             */
            List<SimilarRequirementResponse>
                    matches =
                    semanticSearchService
                            .searchRelatedRequirements(
                                    requirementId,
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
                                                    >= SIMILARITY_THRESHOLD
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
                        validateCoverageWithGemini(
                                gap,
                                strongMatches
                        );
            }


            coverageChecks.add(
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
         * STEP 4
         * ReqSync calculates the score.
         */
        int score =
                completenessScoreService
                        .calculate(
                                initialResult.getCriteria(),
                                confirmedMissing.size()
                        );


        CompletenessStatus status =
                determineStatus(
                        score
                );


        return new RequirementCompletenessResponse(
                selectedRequirement.getId(),
                selectedRequirement.getCode(),
                score,
                status,
                initialResult.getCriteria(),
                coverageChecks,
                confirmedMissing,
                initialResult.getSuggestions()
        );
    }


    /**
     * Initial AI analysis of ONE requirement.
     */
    private InitialCompletenessResult
    analyzeSelectedRequirement(
            Requirement requirement
    ) {

        String prompt =
                """
                You are a software requirements engineering expert.

                Analyze ONLY the selected software requirement below.

                Requirement Code:
                %s

                Title:
                %s

                Description:
                %s


                Evaluate the requirement using these criteria:

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


                For each criterion return one of:

                PASS
                PARTIAL
                FAIL


                Definitions:

                PASS:
                The criterion is clearly satisfied.

                PARTIAL:
                Some information exists but it is incomplete
                or insufficiently clear.

                FAIL:
                Important information for the criterion is absent
                or unusable.


                Also identify possible related requirements
                that may be missing.

                IMPORTANT:

                A possible gap is NOT automatically a confirmed
                missing requirement.

                Another requirement in the same project may
                already cover it.

                ReqSync will perform semantic search after
                this analysis.

                Do not invent unrelated requirements.

                Return ONLY valid JSON.

                Do not use Markdown.

                Return exactly this structure:

                {
                  "criteria": [
                    {
                      "criterion": "ACTOR",
                      "status": "PASS",
                      "explanation": "The customer is clearly identified."
                    }
                  ],
                  "potentialGaps": [
                    {
                      "topic": "Password Recovery",
                      "description": "A related password recovery requirement may be needed."
                    }
                  ],
                  "suggestions": [
                    "Specify what happens when authentication fails."
                  ]
                }
                """
                        .formatted(
                                safe(
                                        requirement.getCode()
                                ),
                                safe(
                                        requirement.getTitle()
                                ),
                                safe(
                                        requirement.getDescription()
                                )
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
                    "Unable to parse requirement completeness response.",
                    exception
            );
        }
    }


    /**
     * Gemini determines whether semantic
     * matches really cover the possible gap.
     */
    private CoverageCheckResponse
    validateCoverageWithGemini(
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
                            "Code: "
                    )
                    .append(
                            match.getCode()
                    )
                    .append("\n")

                    .append(
                            "Title: "
                    )
                    .append(
                            match.getTitle()
                    )
                    .append("\n")

                    .append(
                            "Description: "
                    )
                    .append(
                            match.getDescription()
                    )
                    .append("\n")

                    .append(
                            "Similarity: "
                    )
                    .append(
                            match.getSimilarity()
                    )
                    .append("\n\n");
        }


        String prompt =
                """
                You are performing software requirement
                coverage validation.

                Possible requirement gap:

                Topic:
                %s

                Description:
                %s


                Semantically related existing requirements:

                %s


                Determine whether the possible gap is:

                COVERED

                = One existing requirement sufficiently
                  addresses the concept.

                PARTIALLY_COVERED

                = An existing requirement addresses part
                  of the concept, but important information
                  remains missing.

                MISSING

                = None of the existing requirements
                  adequately addresses the concept.


                Use semantic meaning, not keyword matching.

                Return ONLY valid JSON.

                Return exactly:

                {
                  "topic": "...",
                  "status": "COVERED",
                  "relatedRequirementCode": "REQ-003",
                  "reason": "The password reset requirement already covers this concept."
                }
                """
                        .formatted(
                                safe(
                                        gap.getTopic()
                                ),
                                safe(
                                        gap.getDescription()
                                ),
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
                    "Unable to parse requirement coverage result.",
                    exception
            );
        }
    }


    private CoverageCheckResponse
    createMissingCoverage(
            PotentialGapResponse gap
    ) {

        return new CoverageCheckResponse(
                gap.getTopic(),
                CoverageStatus.MISSING,
                null,
                "No sufficiently similar requirement was found in the same project."
        );
    }


    private CompletenessStatus determineStatus(
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

        if (
                response == null ||
                        response.isBlank()
        ) {

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


    private String safe(
            String value
    ) {

        return value == null
                ? ""
                : value;
    }
}