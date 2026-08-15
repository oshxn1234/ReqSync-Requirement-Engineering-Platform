package com.reqsync.reqsync_backend.team.service;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.project.entity.Project;
import com.reqsync.reqsync_backend.project.entity.ProjectMember;
import com.reqsync.reqsync_backend.project.enums.ProjectStatus;
import com.reqsync.reqsync_backend.project.repository.ProjectMemberRepository;
import com.reqsync.reqsync_backend.project.repository.ProjectRepository;

import com.reqsync.reqsync_backend.requirement.dto.SimilarRequirementResponse;
import com.reqsync.reqsync_backend.requirement.service.semantic.SemanticSearchService;

import com.reqsync.reqsync_backend.team.dto.BASuitabilityResponse;
import com.reqsync.reqsync_backend.team.dto.PastProjectMatchResponse;
import com.reqsync.reqsync_backend.team.dto.RequirementExperienceMatchResponse;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class BASuitabilityService {

    private final UserRepository
            userRepository;

    private final ProjectRepository
            projectRepository;

    private final ProjectMemberRepository
            projectMemberRepository;

    private final SemanticSearchService
            semanticSearchService;


    public BASuitabilityService(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            SemanticSearchService semanticSearchService
    ) {

        this.userRepository =
                userRepository;

        this.projectRepository =
                projectRepository;

        this.projectMemberRepository =
                projectMemberRepository;

        this.semanticSearchService =
                semanticSearchService;
    }


    // =========================================================
    // ANALYZE BA SUITABILITY
    // =========================================================

    public List<BASuitabilityResponse>
    analyzeBusinessAnalysts(
            Long projectId,
            Authentication authentication
    ) {

        /*
         * Get current logged-in user.
         */
        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        /*
         * Load project only if it belongs
         * to current user's business.
         */
        Project newProject =
                projectRepository
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


        /*
         * Project description is required because
         * requirements do not exist yet.
         */
        if (
                newProject.getDescription() == null
                        ||
                        newProject.getDescription().isBlank()
        ) {

            throw new RuntimeException(
                    "Project description is required before Business Analyst suitability analysis."
            );
        }


        /*
         * Find all Business Analysts
         * belonging to this business.
         */
        List<User> businessAnalysts =
                userRepository
                        .findByBusinessIdAndRole(
                                currentUser
                                        .getBusiness()
                                        .getId(),
                                Role.BUSINESS_ANALYST
                        );


        List<BASuitabilityResponse> results =
                new ArrayList<>();


        /*
         * Analyze each BA independently.
         */
        for (
                User businessAnalyst
                : businessAnalysts
        ) {

            BASuitabilityResponse response =
                    analyzeOneBusinessAnalyst(
                            businessAnalyst,
                            newProject
                    );


            results.add(
                    response
            );
        }


        /*
         * Highest suitability first.
         */
        results.sort(
                Comparator.comparing(
                        BASuitabilityResponse::getSuitabilityScore
                ).reversed()
        );


        return results;
    }


    // =========================================================
    // ANALYZE ONE BA
    // =========================================================

    private BASuitabilityResponse
    analyzeOneBusinessAnalyst(
            User businessAnalyst,
            Project newProject
    ) {

        /*
         * Get complete membership history,
         * not only active memberships.
         */
        List<ProjectMember> memberships =
                projectMemberRepository
                        .findByUserId(
                                businessAnalyst.getId()
                        );


        /*
         * Only completed historical projects
         * count as experience.
         */
        List<ProjectMember> completedMemberships =
                memberships
                        .stream()
                        .filter(
                                membership ->
                                        membership.getProject()
                                                != null
                        )
                        .filter(
                                membership ->
                                        membership
                                                .getProject()
                                                .getStatus()
                                                == ProjectStatus.COMPLETED
                        )
                        /*
                         * Never compare the new project
                         * against itself.
                         */
                        .filter(
                                membership ->
                                        !membership
                                                .getProject()
                                                .getId()
                                                .equals(
                                                        newProject.getId()
                                                )
                        )
                        .toList();


        /*
         * New BA with no completed history.
         */
        if (
                completedMemberships.isEmpty()
        ) {

            return createNoHistoryResponse(
                    businessAnalyst
            );
        }


        List<PastProjectMatchResponse>
                pastProjectMatches =
                new ArrayList<>();


        /*
         * Analyze each past completed project.
         */
        for (
                ProjectMember membership
                : completedMemberships
        ) {

            Project historicalProject =
                    membership.getProject();


            PastProjectMatchResponse match =
                    analyzeHistoricalProject(
                            historicalProject,
                            newProject.getDescription()
                    );


            /*
             * Only include projects where
             * semantic search returned evidence.
             */
            if (
                    match != null
            ) {

                pastProjectMatches.add(
                        match
                );
            }
        }


        /*
         * There may be historical projects but
         * no stored requirement embeddings.
         */
        if (
                pastProjectMatches.isEmpty()
        ) {

            return new BASuitabilityResponse(
                    businessAnalyst.getId(),
                    businessAnalyst.getFirstName(),
                    businessAnalyst.getLastName(),
                    businessAnalyst.getEmail(),
                    30.0,
                    "LOW",
                    completedMemberships.size(),
                    true,
                    "The Business Analyst has completed project history, but no usable requirement similarity evidence was found.",
                    new ArrayList<>()
            );
        }


        /*
         * Sort historical projects by relevance.
         */
        pastProjectMatches.sort(
                Comparator.comparing(
                        PastProjectMatchResponse::getRelevanceScore
                ).reversed()
        );


        /*
         * Calculate final score.
         *
         * We use up to the 3 strongest past projects.
         */
        double historicalScore =
                calculateHistoricalScore(
                        pastProjectMatches
                );


        /*
         * Role match is always 100 because
         * candidates were already filtered
         * to BUSINESS_ANALYST.
         *
         * Historical relevance = 80%
         * Role match          = 20%
         */
        double finalScore =
                (
                        historicalScore
                                * 0.80
                )
                        +
                        (
                                100.0
                                        * 0.20
                        );


        finalScore =
                round(
                        finalScore
                );


        String confidence =
                determineConfidence(
                        completedMemberships.size(),
                        pastProjectMatches.size(),
                        finalScore
                );


        String reason =
                buildReason(
                        completedMemberships.size(),
                        pastProjectMatches,
                        finalScore
                );


        return new BASuitabilityResponse(
                businessAnalyst.getId(),
                businessAnalyst.getFirstName(),
                businessAnalyst.getLastName(),
                businessAnalyst.getEmail(),
                finalScore,
                confidence,
                completedMemberships.size(),
                true,
                reason,
                pastProjectMatches
        );
    }


    // =========================================================
    // ANALYZE ONE HISTORICAL PROJECT
    // =========================================================

    private PastProjectMatchResponse
    analyzeHistoricalProject(
            Project historicalProject,
            String newProjectDescription
    ) {

        /*
         * Search the old project's requirements
         * using the NEW project's description.
         *
         * Top 3 relevant requirements are enough
         * for the first version.
         */
        List<SimilarRequirementResponse>
                similarRequirements =
                semanticSearchService
                        .searchProject(
                                historicalProject.getId(),
                                newProjectDescription,
                                3
                        );


        if (
                similarRequirements == null
                        ||
                        similarRequirements.isEmpty()
        ) {

            return null;
        }


        List<RequirementExperienceMatchResponse>
                requirementMatches =
                similarRequirements
                        .stream()
                        .map(
                                result ->
                                        new RequirementExperienceMatchResponse(
                                                result.getId(),
                                                result.getCode(),
                                                result.getTitle(),
                                                result.getDescription(),
                                                result.getSimilarity()
                                        )
                        )
                        .toList();


        /*
         * Average similarity across the top results.
         */
        double averageSimilarity =
                similarRequirements
                        .stream()
                        .mapToDouble(
                                SimilarRequirementResponse::getSimilarity
                        )
                        .average()
                        .orElse(
                                0.0
                        );


        /*
         * Similarity is 0 - 1.
         * Convert to percentage.
         */
        double relevanceScore =
                round(
                        averageSimilarity
                                * 100.0
                );


        return new PastProjectMatchResponse(
                historicalProject.getId(),
                historicalProject.getProjectNumber(),
                historicalProject.getName(),
                relevanceScore,
                requirementMatches
        );
    }


    // =========================================================
    // HISTORICAL SCORE
    // =========================================================

    private double calculateHistoricalScore(
            List<PastProjectMatchResponse>
                    matches
    ) {

        /*
         * Already sorted highest first.
         *
         * Take maximum of 3 projects so a user
         * isn't rewarded purely for having
         * dozens of irrelevant projects.
         */
        int numberOfProjects =
                Math.min(
                        3,
                        matches.size()
                );


        double total =
                0.0;


        for (
                int index = 0;
                index < numberOfProjects;
                index++
        ) {

            total +=
                    matches
                            .get(index)
                            .getRelevanceScore();
        }


        return total
                / numberOfProjects;
    }


    // =========================================================
    // NEW BA FALLBACK
    // =========================================================

    private BASuitabilityResponse
    createNoHistoryResponse(
            User businessAnalyst
    ) {

        /*
         * We intentionally do NOT score a new BA
         * as zero.
         *
         * 50 means neutral / insufficient history.
         *
         * Later EmployeeProfile / skills can
         * replace this fallback score.
         */
        return new BASuitabilityResponse(
                businessAnalyst.getId(),
                businessAnalyst.getFirstName(),
                businessAnalyst.getLastName(),
                businessAnalyst.getEmail(),
                50.0,
                "LOW",
                0,
                false,
                "No completed project history is available. The score is neutral until profile or skill information is available.",
                new ArrayList<>()
        );
    }


    // =========================================================
    // CONFIDENCE
    // =========================================================

    private String determineConfidence(
            int historicalProjectCount,
            int matchedProjectCount,
            double score
    ) {

        if (
                historicalProjectCount >= 3
                        &&
                        matchedProjectCount >= 2
                        &&
                        score >= 75
        ) {

            return "HIGH";
        }


        if (
                historicalProjectCount >= 1
                        &&
                        matchedProjectCount >= 1
        ) {

            return "MEDIUM";
        }


        return "LOW";
    }


    // =========================================================
    // EXPLANATION
    // =========================================================

    private String buildReason(
            int historicalProjectCount,
            List<PastProjectMatchResponse> matches,
            double score
    ) {

        PastProjectMatchResponse strongestMatch =
                matches.get(0);


        return "The Business Analyst has "
                + historicalProjectCount
                + " completed historical project(s). "
                + "The strongest semantic match is project '"
                + strongestMatch.getProjectName()
                + "' with a relevance score of "
                + strongestMatch.getRelevanceScore()
                + "%. Final suitability score: "
                + score
                + "%.";
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
    // ROUNDING
    // =========================================================

    private double round(
            double value
    ) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }
}