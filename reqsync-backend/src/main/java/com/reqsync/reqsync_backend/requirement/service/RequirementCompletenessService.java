package com.reqsync.reqsync_backend.requirement.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reqsync.reqsync_backend.ai.client.GeminiClient;
import com.reqsync.reqsync_backend.requirement.dto.CoverageCheckResponse;
import com.reqsync.reqsync_backend.requirement.dto.InitialCompletenessResult;
import com.reqsync.reqsync_backend.requirement.dto.PotentialGapResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementCompletenessResponse;
import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.enums.CompletenessStatus;
import com.reqsync.reqsync_backend.requirement.enums.CoverageStatus;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class RequirementCompletenessService {

    private final RequirementRepository requirementRepository;

    private final GeminiClient geminiClient;

    private final CompletenessScoreService completenessScoreService;

    private final ObjectMapper objectMapper;


    public RequirementCompletenessService(
            RequirementRepository requirementRepository,
            GeminiClient geminiClient,
            CompletenessScoreService completenessScoreService,
            ObjectMapper objectMapper
    ) {

        this.requirementRepository =
                requirementRepository;

        this.geminiClient =
                geminiClient;

        this.completenessScoreService =
                completenessScoreService;

        this.objectMapper =
                objectMapper;
    }


    /**
     * Analyze one selected requirement.
     *
     * This version does NOT require pgvector.
     *
     * Flow:
     *
     * 1. Gemini analyzes selected requirement.
     * 2. Load other requirements from same project.
     * 3. Gemini checks whether potential gaps are already
     *    covered by another requirement.
     * 4. Calculate completeness score.
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


        /*
         * STEP 1
         * Analyze selected requirement itself.
         */
        InitialCompletenessResult initialResult =
                analyzeSelectedRequirement(
                        selectedRequirement
                );


        if (
                initialResult.getCriteria() == null
        ) {

            initialResult.setCriteria(
                    new ArrayList<>()
            );
        }


        if (
                initialResult.getPotentialGaps() == null
        ) {

            initialResult.setPotentialGaps(
                    new ArrayList<>()
            );
        }


        if (
                initialResult.getSuggestions() == null
        ) {

            initialResult.setSuggestions(
                    new ArrayList<>()
            );
        }


        /*
         * STEP 2
         * Get all requirements from same project.
         */
        List<Requirement> projectRequirements =
                requirementRepository
                        .findByProjectId(
                                selectedRequirement
                                        .getProjectId()
                        );


        /*
         * Remove currently selected requirement.
         */
        List<Requirement> otherRequirements =
                projectRequirements
                        .stream()
                        .filter(
                                requirement ->
                                        !requirement
                                                .getId()
                                                .equals(
                                                        requirementId
                                                )
                        )
                        .toList();


        List<CoverageCheckResponse>
                coverageChecks =
                new ArrayList<>();


        List<String>
                confirmedMissing =
                new ArrayList<>();


        /*
         * STEP 3
         * Validate every possible gap using Gemini
         * against other existing requirements.
         *
         * No pgvector.
         * No embedding.
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


            CoverageCheckResponse coverageResult =
                    validateCoverageWithGemini(
                            gap,
                            otherRequirements
                    );


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
         * Calculate final score.
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
     * Initial AI analysis of selected requirement.
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

                Actor:
                %s

                Preconditions:
                %s

                Expected Outcome:
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


                PASS:
                The criterion is clearly satisfied.

                PARTIAL:
                Some information exists but it is incomplete
                or insufficiently clear.

                FAIL:
                Important information for the criterion is absent
                or unusable.


                Also identify possible related requirement areas
                that may be missing.

                IMPORTANT:

                A possible gap is NOT automatically confirmed
                missing.

                Another requirement in the same project may
                already cover it.

                Do not invent unrelated requirements.

                Return ONLY valid JSON.

                Do not use Markdown.

                Return exactly:

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
                                ),
                                safe(
                                        requirement.getActors()
                                ),
                                safe(
                                        requirement.getPreconditions()
                                ),
                                safe(
                                        requirement.getExpectedOutcome()
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
     * Validate possible gap against all other requirements
     * using Gemini directly.
     *
     * This replaces pgvector semantic search.
     */
    private CoverageCheckResponse
    validateCoverageWithGemini(
            PotentialGapResponse gap,
            List<Requirement> otherRequirements
    ) {

        if (
                otherRequirements == null ||
                        otherRequirements.isEmpty()
        ) {

            return createMissingCoverage(
                    gap
            );
        }


        StringBuilder context =
                new StringBuilder();


        for (
                Requirement requirement
                : otherRequirements
        ) {

            context
                    .append(
                            "Code: "
                    )
                    .append(
                            safe(
                                    requirement.getCode()
                            )
                    )
                    .append("\n")

                    .append(
                            "Title: "
                    )
                    .append(
                            safe(
                                    requirement.getTitle()
                            )
                    )
                    .append("\n")

                    .append(
                            "Description: "
                    )
                    .append(
                            safe(
                                    requirement.getDescription()
                            )
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


                Existing requirements from the SAME project:

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


                Compare semantic meaning, not only exact words.

                If covered or partially covered,
                return the best matching requirement code.

                If missing,
                relatedRequirementCode must be null.

                Return ONLY valid JSON.

                Do not use Markdown.

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

            CoverageCheckResponse result =
                    objectMapper.readValue(
                            cleanJsonResponse(
                                    aiResponse
                            ),
                            CoverageCheckResponse.class
                    );


            /*
             * Defensive fallback.
             */
            if (
                    result.getTopic() == null ||
                            result.getTopic().isBlank()
            ) {

                result.setTopic(
                        gap.getTopic()
                );
            }


            if (
                    result.getStatus() == null
            ) {

                result.setStatus(
                        CoverageStatus.MISSING
                );
            }


            return result;

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
                "No other requirement in the same project covers this potential gap."
        );
    }


    private CompletenessStatus determineStatus(
            int score
    ) {

        if (
                score >= 85
        ) {

            return CompletenessStatus.COMPLETE;
        }


        if (
                score >= 60
        ) {

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