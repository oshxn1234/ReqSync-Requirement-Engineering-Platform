package com.reqsync.reqsync_backend.team.service;

import com.reqsync.reqsync_backend.team.entity.ProjectRequiredSkill;
import com.reqsync.reqsync_backend.team.repository.ProjectRequiredSkillRepository;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.project.entity.Project;
import com.reqsync.reqsync_backend.project.entity.ProjectMember;
import com.reqsync.reqsync_backend.project.enums.ProjectStatus;
import com.reqsync.reqsync_backend.project.repository.ProjectMemberRepository;
import com.reqsync.reqsync_backend.project.repository.ProjectRepository;

import com.reqsync.reqsync_backend.requirement.dto.SimilarRequirementResponse;
import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;
import com.reqsync.reqsync_backend.requirement.service.semantic.SemanticSearchService;

import com.reqsync.reqsync_backend.team.dto.TechnicalRequirementMatchResponse;
import com.reqsync.reqsync_backend.team.dto.TechnicalTeamSuitabilityResponse;

import com.reqsync.reqsync_backend.user.entity.EmployeeProfile;
import com.reqsync.reqsync_backend.user.entity.EmployeeSkill;

import com.reqsync.reqsync_backend.user.enums.AvailabilityStatus;
import com.reqsync.reqsync_backend.user.enums.ExperienceLevel;
import com.reqsync.reqsync_backend.user.enums.SkillProficiency;

import com.reqsync.reqsync_backend.user.repository.EmployeeProfileRepository;
import com.reqsync.reqsync_backend.user.repository.EmployeeSkillRepository;

import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class TechnicalTeamSuitabilityService {

    // =========================================================
    // CONFIGURATION
    // =========================================================

    private static final double MATCH_THRESHOLD = 0.65;


    // =========================================================
    // DEPENDENCIES
    // =========================================================

    private final UserRepository userRepository;

    private final ProjectRepository projectRepository;

    private final ProjectMemberRepository projectMemberRepository;

    private final RequirementRepository requirementRepository;

    private final SemanticSearchService semanticSearchService;

    private final EmployeeProfileRepository employeeProfileRepository;

    private final EmployeeSkillRepository employeeSkillRepository;

    private final ProjectRequiredSkillRepository
            projectRequiredSkillRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public TechnicalTeamSuitabilityService(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            RequirementRepository requirementRepository,
            SemanticSearchService semanticSearchService,
            EmployeeProfileRepository employeeProfileRepository,
            EmployeeSkillRepository employeeSkillRepository,
            ProjectRequiredSkillRepository projectRequiredSkillRepository
    ) {

        this.userRepository =
                userRepository;

        this.projectRepository =
                projectRepository;

        this.projectMemberRepository =
                projectMemberRepository;

        this.requirementRepository =
                requirementRepository;

        this.semanticSearchService =
                semanticSearchService;

        this.employeeProfileRepository =
                employeeProfileRepository;

        this.employeeSkillRepository =
                employeeSkillRepository;

        this.projectRequiredSkillRepository =
                projectRequiredSkillRepository;
    }


    // =========================================================
    // ANALYZE TECHNICAL TEAM
    // =========================================================

    public List<TechnicalTeamSuitabilityResponse>
    analyzeTechnicalTeam(
            Long projectId,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        // CEO or PM only
        if (
                currentUser.getRole() != Role.PROJECT_MANAGER
                        &&
                        currentUser.getRole() != Role.CEO
        ) {

            throw new RuntimeException(
                    "Only the CEO or Project Manager can view technical team suitability."
            );
        }


        Project project =
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


        // PM must be the assigned PM
        if (
                currentUser.getRole()
                        == Role.PROJECT_MANAGER
        ) {

            if (
                    project.getProjectManager() == null
                            ||
                            !project
                                    .getProjectManager()
                                    .getId()
                                    .equals(
                                            currentUser.getId()
                                    )
            ) {

                throw new RuntimeException(
                        "You are not the assigned Project Manager for this project."
                );
            }
        }


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
                    "Requirement extraction must be completed before technical team suitability analysis."
            );
        }


        Long businessId =
                currentUser
                        .getBusiness()
                        .getId();


        // Candidate pool
        List<User> candidates =
                new ArrayList<>();


        candidates.addAll(
                userRepository
                        .findByBusinessIdAndRole(
                                businessId,
                                Role.DEVELOPER
                        )
        );


        candidates.addAll(
                userRepository
                        .findByBusinessIdAndRole(
                                businessId,
                                Role.QA_ENGINEER
                        )
        );


        // Existing members should not be recommended again
        List<Long> alreadyAssignedIds =
                projectMemberRepository
                        .findByProjectIdAndActiveTrue(
                                projectId
                        )
                        .stream()
                        .map(
                                membership ->
                                        membership
                                                .getUser()
                                                .getId()
                        )
                        .toList();


        List<TechnicalTeamSuitabilityResponse>
                results =
                new ArrayList<>();


        for (
                User candidate
                : candidates
        ) {

            if (
                    !candidate.isEnabled()
                            ||
                            candidate.isAccountLocked()
            ) {

                continue;
            }


            if (
                    alreadyAssignedIds
                            .contains(
                                    candidate.getId()
                            )
            ) {

                continue;
            }


            results.add(
                    analyzeCandidate(
                            candidate,
                            project,
                            requirements
                    )
            );
        }


        results.sort(
                Comparator.comparingDouble(
                        TechnicalTeamSuitabilityResponse::
                                getSuitabilityScore
                ).reversed()
        );


        return results;
    }


    // =========================================================
    // ANALYZE CANDIDATE
    // =========================================================

    private TechnicalTeamSuitabilityResponse
    analyzeCandidate(
            User candidate,
            Project newProject,
            List<Requirement> newRequirements
    ) {

        List<ProjectMember> memberships =
                projectMemberRepository
                        .findByUserId(
                                candidate.getId()
                        );


        List<Project> historicalProjects =
                memberships
                        .stream()

                        .map(
                                ProjectMember::getProject
                        )

                        .filter(
                                project ->
                                        project != null
                        )

                        .filter(
                                project ->
                                        project.getStatus()
                                                == ProjectStatus.COMPLETED
                        )

                        .filter(
                                project ->
                                        !project
                                                .getId()
                                                .equals(
                                                        newProject.getId()
                                                )
                        )

                        .distinct()

                        .toList();


        // =====================================================
        // NO HISTORY → PROFILE FALLBACK
        // =====================================================

        if (
                historicalProjects.isEmpty()
        ) {

            return createProfileBasedFallbackResponse(
                    candidate,
                    newProject
            );
        }


        // =====================================================
        // HISTORY-BASED ANALYSIS
        // =====================================================

        List<TechnicalRequirementMatchResponse>
                matches =
                new ArrayList<>();


        for (
                Requirement newRequirement
                : newRequirements
        ) {

            TechnicalRequirementMatchResponse strongestMatch =
                    findStrongestHistoricalMatch(
                            newRequirement,
                            historicalProjects
                    );


            if (
                    strongestMatch != null
            ) {

                matches.add(
                        strongestMatch
                );
            }
        }


        if (
                matches.isEmpty()
        ) {

            return new TechnicalTeamSuitabilityResponse(
                    candidate.getId(),
                    candidate.getFirstName(),
                    candidate.getLastName(),
                    candidate.getEmail(),
                    candidate.getRole(),

                    35.0,

                    "LOW",

                    historicalProjects.size(),

                    true,

                    0,

                    "The employee has completed project history, "
                            + "but no strong historical requirement matches were found.",

                    new ArrayList<>()
            );
        }


        double averageSimilarity =
                matches
                        .stream()
                        .mapToDouble(
                                TechnicalRequirementMatchResponse::
                                        getSimilarity
                        )
                        .average()
                        .orElse(
                                0.0
                        );


        double semanticScore =
                averageSimilarity
                        * 100.0;


        double coverageScore =
                (
                        (double) matches.size()
                                /
                                (double) newRequirements.size()
                )
                        * 100.0;


        double experienceScore =
                calculateHistoricalExperienceScore(
                        historicalProjects.size()
                );


        /*
         * HISTORICAL SCORING
         *
         * Semantic similarity = 55%
         * Requirement coverage = 25%
         * Project experience = 20%
         */
        double finalScore =
                semanticScore * 0.55
                        +
                        coverageScore * 0.25
                        +
                        experienceScore * 0.20;


        finalScore =
                round(
                        finalScore
                );


        matches.sort(
                Comparator.comparingDouble(
                        TechnicalRequirementMatchResponse::
                                getSimilarity
                ).reversed()
        );


        String confidence =
                determineHistoricalConfidence(
                        historicalProjects.size(),
                        matches.size(),
                        newRequirements.size(),
                        finalScore
                );


        String reason =
                candidate.getFirstName()
                        + " "
                        + candidate.getLastName()
                        + " has "
                        + historicalProjects.size()
                        + " completed historical project(s). "
                        + matches.size()
                        + " of "
                        + newRequirements.size()
                        + " new requirements had strong historical matches. "
                        + "Average semantic similarity: "
                        + round(
                        semanticScore
                )
                        + "%. Final suitability score: "
                        + finalScore
                        + "%.";


        return new TechnicalTeamSuitabilityResponse(
                candidate.getId(),
                candidate.getFirstName(),
                candidate.getLastName(),
                candidate.getEmail(),
                candidate.getRole(),

                finalScore,

                confidence,

                historicalProjects.size(),

                true,

                matches.size(),

                reason,

                matches
        );
    }


    // =========================================================
    // PROFILE FALLBACK
    // =========================================================

    private TechnicalTeamSuitabilityResponse
    createProfileBasedFallbackResponse(
            User candidate,
            Project project
    ) {

        EmployeeProfile profile =
                employeeProfileRepository
                        .findByUserId(
                                candidate.getId()
                        )
                        .orElse(
                                null
                        );


        // No history and no profile
        if (
                profile == null
        ) {

            return new TechnicalTeamSuitabilityResponse(
                    candidate.getId(),
                    candidate.getFirstName(),
                    candidate.getLastName(),
                    candidate.getEmail(),
                    candidate.getRole(),

                    40.0,

                    "LOW",

                    0,

                    false,

                    0,

                    "No completed project history or employee profile is available.",

                    new ArrayList<>()
            );
        }


        List<EmployeeSkill> employeeSkills =
                employeeSkillRepository
                        .findByEmployeeProfileId(
                                profile.getId()
                        );


        List<ProjectRequiredSkill> requiredSkills =
                projectRequiredSkillRepository
                        .findByProjectId(
                                project.getId()
                        );


        if (
                requiredSkills == null
                        ||
                        requiredSkills.isEmpty()
        ) {

            throw new RuntimeException(
                    "Project required skills have not been generated. "
                            + "Generate project skills before running profile-based suitability."
            );
        }


        double skillScore =
                calculateStructuredSkillScore(
                        employeeSkills,
                        requiredSkills
                );


        double experienceScore =
                calculateProfileExperienceScore(
                        profile
                );


        double availabilityScore =
                calculateAvailabilityScore(
                        profile.getAvailabilityStatus()
                );


        double workloadScore =
                calculateWorkloadScore(
                        profile.getCurrentWorkloadPercentage()
                );


        /*
         * Candidate pool already limits roles
         * to Developer + QA.
         */
        double roleScore =
                100.0;


        /*
         * PROFILE-BASED SCORING
         *
         * Skill match = 45%
         * Experience = 20%
         * Availability = 15%
         * Workload = 10%
         * Role = 10%
         */
        double finalScore =
                skillScore * 0.45
                        +
                        experienceScore * 0.20
                        +
                        availabilityScore * 0.15
                        +
                        workloadScore * 0.10
                        +
                        roleScore * 0.10;


        finalScore =
                round(
                        finalScore
                );


        String confidence =
                calculateProfileConfidence(
                        employeeSkills,
                        requiredSkills,
                        profile
                );


        String reason =
                candidate.getFirstName()
                        + " "
                        + candidate.getLastName()
                        + " has no completed project history, "
                        + "so profile-based suitability was used. "
                        + "Skill match: "
                        + round(skillScore)
                        + "%, experience: "
                        + round(experienceScore)
                        + "%, availability: "
                        + round(availabilityScore)
                        + "%, workload: "
                        + round(workloadScore)
                        + "%. Final suitability score: "
                        + finalScore
                        + "%.";


        return new TechnicalTeamSuitabilityResponse(
                candidate.getId(),
                candidate.getFirstName(),
                candidate.getLastName(),
                candidate.getEmail(),
                candidate.getRole(),

                finalScore,

                confidence,

                0,

                false,

                0,

                reason,

                new ArrayList<>()
        );
    }


    // =========================================================
    // STRUCTURED SKILL MATCHING
    // =========================================================

    private double calculateStructuredSkillScore(
            List<EmployeeSkill> employeeSkills,
            List<ProjectRequiredSkill> requiredSkills
    ) {

        if (
                employeeSkills == null
                        ||
                        employeeSkills.isEmpty()
                        ||
                        requiredSkills == null
                        ||
                        requiredSkills.isEmpty()
        ) {

            return 0.0;
        }


        double earnedPoints =
                0.0;

        double maximumPoints =
                0.0;


        for (
                ProjectRequiredSkill requiredSkill
                : requiredSkills
        ) {

            if (
                    requiredSkill.getSkillName()
                            == null
                            ||
                            requiredSkill
                                    .getSkillName()
                                    .isBlank()
            ) {

                continue;
            }


            int importance =
                    normalizeImportance(
                            requiredSkill.getImportance()
                    );


            // Maximum = Expert proficiency × importance
            maximumPoints +=
                    100.0
                            * importance;


            EmployeeSkill matchingEmployeeSkill =
                    employeeSkills
                            .stream()

                            .filter(
                                    skill ->
                                            skill.getSkillName()
                                                    != null
                            )

                            .filter(
                                    skill ->
                                            skill
                                                    .getSkillName()
                                                    .trim()
                                                    .equalsIgnoreCase(
                                                            requiredSkill
                                                                    .getSkillName()
                                                                    .trim()
                                                    )
                            )

                            .findFirst()

                            .orElse(
                                    null
                            );


            if (
                    matchingEmployeeSkill == null
            ) {

                continue;
            }


            double proficiencyScore =
                    proficiencyToScore(
                            matchingEmployeeSkill
                                    .getProficiency()
                    );


            earnedPoints +=
                    proficiencyScore
                            * importance;
        }


        if (
                maximumPoints <= 0.0
        ) {

            return 0.0;
        }


        return (
                earnedPoints
                        /
                        maximumPoints
        )
                * 100.0;
    }


    // =========================================================
    // IMPORTANCE
    // =========================================================

    private int normalizeImportance(
            Integer importance
    ) {

        if (
                importance == null
        ) {

            return 3;
        }


        return Math.max(
                1,
                Math.min(
                        5,
                        importance
                )
        );
    }


    // =========================================================
    // PROFICIENCY
    // =========================================================

    private double proficiencyToScore(
            SkillProficiency proficiency
    ) {

        if (
                proficiency == null
        ) {

            return 0.0;
        }


        return switch (
                proficiency
                ) {

            case BEGINNER ->
                    40.0;

            case INTERMEDIATE ->
                    65.0;

            case ADVANCED ->
                    85.0;

            case EXPERT ->
                    100.0;
        };
    }


    // =========================================================
    // PROFILE EXPERIENCE
    // =========================================================

    private double calculateProfileExperienceScore(
            EmployeeProfile profile
    ) {

        ExperienceLevel level =
                profile.getExperienceLevel();


        if (
                level != null
        ) {

            return switch (
                    level
                    ) {

                case JUNIOR ->
                        40.0;

                case MID_LEVEL ->
                        65.0;

                case SENIOR ->
                        85.0;

                case EXPERT ->
                        100.0;
            };
        }


        Integer years =
                profile.getYearsOfExperience();


        if (
                years == null
                        ||
                        years <= 0
        ) {

            return 20.0;
        }


        if (
                years >= 8
        ) {

            return 100.0;
        }


        if (
                years >= 5
        ) {

            return 85.0;
        }


        if (
                years >= 3
        ) {

            return 65.0;
        }


        if (
                years >= 1
        ) {

            return 40.0;
        }


        return 20.0;
    }


    // =========================================================
    // AVAILABILITY
    // =========================================================

    private double calculateAvailabilityScore(
            AvailabilityStatus availabilityStatus
    ) {

        if (
                availabilityStatus == null
        ) {

            return 50.0;
        }


        return switch (
                availabilityStatus
                ) {

            case AVAILABLE ->
                    100.0;

            case PARTIALLY_AVAILABLE ->
                    60.0;

            case UNAVAILABLE ->
                    0.0;
        };
    }


    // =========================================================
    // WORKLOAD
    // =========================================================

    private double calculateWorkloadScore(
            Integer workloadPercentage
    ) {

        if (
                workloadPercentage == null
        ) {

            return 50.0;
        }


        int workload =
                Math.max(
                        0,
                        Math.min(
                                100,
                                workloadPercentage
                        )
                );


        return 100.0
                -
                workload;
    }


    // =========================================================
    // PROFILE CONFIDENCE
    // =========================================================

    private String calculateProfileConfidence(
            List<EmployeeSkill> employeeSkills,
            List<ProjectRequiredSkill> requiredSkills,
            EmployeeProfile profile
    ) {

        if (
                employeeSkills == null
                        ||
                        employeeSkills.isEmpty()
        ) {

            return "LOW";
        }


        int matchedSkills =
                0;


        for (
                ProjectRequiredSkill requiredSkill
                : requiredSkills
        ) {

            boolean found =
                    employeeSkills
                            .stream()
                            .anyMatch(
                                    employeeSkill ->
                                            employeeSkill
                                                    .getSkillName()
                                                    != null
                                                    &&
                                                    requiredSkill
                                                            .getSkillName()
                                                            != null
                                                    &&
                                                    employeeSkill
                                                            .getSkillName()
                                                            .trim()
                                                            .equalsIgnoreCase(
                                                                    requiredSkill
                                                                            .getSkillName()
                                                                            .trim()
                                                            )
                            );


            if (
                    found
            ) {

                matchedSkills++;
            }
        }


        double skillCoverage =
                requiredSkills.isEmpty()
                        ?
                        0.0
                        :
                        (
                                (double) matchedSkills
                                        /
                                        requiredSkills.size()
                        );


        if (
                skillCoverage >= 0.70
                        &&
                        profile.getExperienceLevel()
                                != null
        ) {

            return "HIGH";
        }


        if (
                skillCoverage >= 0.30
        ) {

            return "MEDIUM";
        }


        return "LOW";
    }


    // =========================================================
    // HISTORICAL REQUIREMENT MATCH
    // =========================================================

    private TechnicalRequirementMatchResponse
    findStrongestHistoricalMatch(
            Requirement newRequirement,
            List<Project> historicalProjects
    ) {

        SimilarRequirementResponse strongestRequirement =
                null;

        Project strongestProject =
                null;


        for (
                Project historicalProject
                : historicalProjects
        ) {

            List<SimilarRequirementResponse>
                    searchResults;


            try {

                searchResults =
                        semanticSearchService
                                .searchProject(
                                        historicalProject
                                                .getId(),

                                        buildRequirementSearchText(
                                                newRequirement
                                        ),

                                        1
                                );

            } catch (
                    Exception exception
            ) {

                /*
                 * Historical project might
                 * not have embeddings.
                 */
                continue;
            }


            if (
                    searchResults == null
                            ||
                            searchResults.isEmpty()
            ) {

                continue;
            }


            SimilarRequirementResponse candidate =
                    searchResults.get(0);


            if (
                    candidate.getSimilarity()
                            < MATCH_THRESHOLD
            ) {

                continue;
            }


            if (
                    strongestRequirement == null
                            ||
                            candidate.getSimilarity()
                                    >
                                    strongestRequirement
                                            .getSimilarity()
            ) {

                strongestRequirement =
                        candidate;

                strongestProject =
                        historicalProject;
            }
        }


        if (
                strongestRequirement == null
                        ||
                        strongestProject == null
        ) {

            return null;
        }


        return new TechnicalRequirementMatchResponse(
                newRequirement.getId(),
                newRequirement.getCode(),
                newRequirement.getTitle(),

                strongestRequirement.getId(),
                strongestRequirement.getCode(),
                strongestRequirement.getTitle(),

                strongestProject.getId(),
                strongestProject.getName(),

                strongestRequirement.getSimilarity()
        );
    }


    // =========================================================
    // REQUIREMENT QUERY TEXT
    // =========================================================

    private String buildRequirementSearchText(
            Requirement requirement
    ) {

        StringBuilder text =
                new StringBuilder();


        if (
                requirement.getTitle()
                        != null
                        &&
                        !requirement.getTitle()
                                .isBlank()
        ) {

            text.append(
                    requirement.getTitle()
            );

            text.append(
                    ". "
            );
        }


        if (
                requirement.getDescription()
                        != null
                        &&
                        !requirement.getDescription()
                                .isBlank()
        ) {

            text.append(
                    requirement.getDescription()
            );
        }


        return text
                .toString()
                .trim();
    }


    // =========================================================
    // HISTORICAL EXPERIENCE
    // =========================================================

    private double calculateHistoricalExperienceScore(
            int completedProjects
    ) {

        if (
                completedProjects >= 4
        ) {

            return 100.0;
        }


        if (
                completedProjects == 3
        ) {

            return 80.0;
        }


        if (
                completedProjects == 2
        ) {

            return 60.0;
        }


        if (
                completedProjects == 1
        ) {

            return 40.0;
        }


        return 0.0;
    }


    // =========================================================
    // HISTORICAL CONFIDENCE
    // =========================================================

    private String determineHistoricalConfidence(
            int historicalProjects,
            int matchedRequirements,
            int totalRequirements,
            double finalScore
    ) {

        double coverage =
                totalRequirements == 0
                        ?
                        0.0
                        :
                        (
                                (double) matchedRequirements
                                        /
                                        totalRequirements
                        );


        if (
                historicalProjects >= 3
                        &&
                        coverage >= 0.70
                        &&
                        finalScore >= 75
        ) {

            return "HIGH";
        }


        if (
                historicalProjects >= 1
                        &&
                        coverage >= 0.30
        ) {

            return "MEDIUM";
        }


        return "LOW";
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
                        authentication.getName()
                                == null
                        ||
                        authentication.getName()
                                .isBlank()
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
    // ROUND
    // =========================================================

    private double round(
            double value
    ) {

        return Math.round(
                value * 100.0
        )
                /
                100.0;
    }
}