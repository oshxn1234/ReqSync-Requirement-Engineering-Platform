package com.reqsync.reqsync_backend.requirement.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reqsync.reqsync_backend.ai.client.GeminiClient;
import com.reqsync.reqsync_backend.project.repository.ProjectRepository;
import com.reqsync.reqsync_backend.requirement.dto.CoverageCheckResponse;
import com.reqsync.reqsync_backend.requirement.dto.InitialCompletenessResult;
import com.reqsync.reqsync_backend.requirement.dto.PotentialGapResponse;
import com.reqsync.reqsync_backend.requirement.dto.ProjectCompletenessResponse;
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
public class ProjectCompletenessService {

    private static final double
            SIMILARITY_THRESHOLD = 0.70;


    private final RequirementRepository
            requirementRepository;

    private final ProjectRepository
            projectRepository;

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
            ProjectRepository projectRepository,
            GeminiClient geminiClient,
            SemanticSearchService semanticSearchService,
            CompletenessScoreService completenessScoreService,
            ObjectMapper objectMapper
    ) {

        this.requirementRepository =
                requirementRepository;

        this.projectRepository =
                projectRepository;

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
     * Analyze all requirements belonging
     * to a project.
     */
    public ProjectCompletenessResponse analyzeProject(
            Long projectId
    ) {

        /*
         * Verify project exists.
         */
        if (
                !projectRepository.existsById(
                        projectId
                )
        ) {

            throw new RuntimeException(
                    "Project not found: "
                            + projectId
            );
        }


        List<Requirement> requirements =
                requirementRepository
                        .findByProjectId(
                                projectId
                        );


        if (
                requirements.isEmpty()
        ) {

            throw new RuntimeException(
                    "No requirements found for project: "
                            + projectId
            );
        }


        /*
         * Initial project-wide analysis.
         */
        InitialCompletenessResult initialResult =
                analyzeRequirementSet(
                        requirements
                );


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
         * Verify each project-level gap using
         * semantic search across all requirements.
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
                            ? "Potential Project Gap"
                            : gap.getTopic();


            String semanticQuery =
                    topic
                            + ". "
                            + gap.getDescription();


            /*
             * Current SemanticSearchService method.
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
                        validateProjectCoverageWithGemini(
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


        return new ProjectCompletenessResponse(
                projectId,
                requirements.size(),
                score,
                status,
                initialResult.getCriteria(),
                coverageChecks,
                confirmedMissing,
                initialResult.getSuggestions()
        );
    }


    /**
     * Gemini analyzes the entire requirement set.
     */
    private InitialCompletenessResult
    analyzeRequirementSet(
            List<Requirement> requirements
    ) {

        StringBuilder requirementContext =
                new StringBuilder();


        for (
                Requirement requirement
                : requirements
        ) {

            requirementContext
                    .append(
                            requirement.getCode()
                    )
                    .append(
                            " | "
                    )

                    .append(
                            requirement.getType()
                    )
                    .append(
                            " | "
                    )

                    .append(
                            requirement.getTitle()
                    )
                    .append(
                            " | "
                    )

                    .append(
                            requirement.getDescription()
                    )
                    .append(
                            "\n"
                    );
        }


        String prompt =
                """
                You are a professional software requirements
                engineering expert.

                Analyze the COMPLETE SET of requirements below
                as one software project.

                Existing Requirements:

                %s


                Evaluate overall requirement completeness using:

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


                Also identify possible missing requirement areas.

                IMPORTANT:

                Do not immediately assume that a possible gap
                is truly missing.

                ReqSync will perform semantic search across all
                stored requirements to verify each possible gap.

                Do not invent requirements unrelated to the
                project.

                Return ONLY valid JSON.

                Return exactly:

                {
                  "criteria": [
                    {
                      "criterion": "FUNCTIONAL_COVERAGE",
                      "status": "PASS",
                      "explanation": "Core workflows are represented."
                    }
                  ],
                  "potentialGaps": [
                    {
                      "topic": "Audit Logging",
                      "description": "The project may require audit logging for important administrative actions."
                    }
                  ],
                  "suggestions": [
                    "Define failure handling for payment processing."
                  ]
                }
                """
                        .formatted(
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
                    InitialCompletenessResult.class
            );

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Unable to parse project completeness response.",
                    exception
            );
        }
    }


    private CoverageCheckResponse
    validateProjectCoverageWithGemini(
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
                    .append(
                            "\n"
                    )

                    .append(
                            "Title: "
                    )
                    .append(
                            match.getTitle()
                    )
                    .append(
                            "\n"
                    )

                    .append(
                            "Description: "
                    )
                    .append(
                            match.getDescription()
                    )
                    .append(
                            "\n"
                    )

                    .append(
                            "Similarity: "
                    )
                    .append(
                            match.getSimilarity()
                    )
                    .append(
                            "\n\n"
                    );
        }


        String prompt =
                """
                Determine whether the following possible
                project requirement gap is already covered.

                Topic:
                %s

                Description:
                %s


                Semantically related existing requirements:

                %s


                Classify the gap as:

                COVERED
                PARTIALLY_COVERED
                MISSING


                COVERED means an existing requirement
                adequately covers the concept.

                PARTIALLY_COVERED means some coverage exists
                but important details are still absent.

                MISSING means none of the existing requirements
                adequately covers it.


                Return ONLY valid JSON:

                {
                  "topic": "...",
                  "status": "COVERED",
                  "relatedRequirementCode": "REQ-001",
                  "reason": "..."
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
                    "Unable to parse project coverage response.",
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
                "No sufficiently similar requirement was found in the project."
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