package com.reqsync.reqsync_backend.project.service;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;
import com.reqsync.reqsync_backend.knowledge.service.KnowledgeService;
import com.reqsync.reqsync_backend.project.dto.ProjectCreateRequest;
import com.reqsync.reqsync_backend.project.dto.ProjectResponse;
import com.reqsync.reqsync_backend.project.dto.ProjectUpdateRequest;
import com.reqsync.reqsync_backend.project.entity.Project;
import com.reqsync.reqsync_backend.project.enums.ProjectStatus;
import com.reqsync.reqsync_backend.project.repository.ProjectRepository;
import com.reqsync.reqsync_backend.user.service.UserManagementService;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProjectService {

    private final UserRepository userRepository;
    private final ProjectRepository
            projectRepository;

    private final KnowledgeService
            knowledgeService;

    public ProjectService(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            KnowledgeService knowledgeService
    ) {

        this.projectRepository =
                projectRepository;

        this.userRepository =
                userRepository;

        this.knowledgeService =
                knowledgeService;
    }


    // =========================================================
    // CREATE PROJECT
    // =========================================================

    /**
     * Create a new project.
     *
     * Business ID is NOT sent from frontend.
     *
     * It comes from the authenticated CEO.
     */
    public ProjectResponse createProject(
            ProjectCreateRequest request,
            Authentication authentication
    ) {

        validateCreateRequest(
                request
        );


        /*
         * Find currently authenticated user
         * using the email stored in JWT.
         */
        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        /*
         * Only CEO can create projects.
         */
        if (
                currentUser.getRole()
                        != Role.CEO
        ) {

            throw new RuntimeException(
                    "Only the CEO can create projects."
            );
        }


        Long businessId =
                currentUser
                        .getBusiness()
                        .getId();


        /*
         * Project names need to be unique
         * only inside the same business.
         */
        if (
                projectRepository
                        .existsByBusinessIdAndNameIgnoreCase(
                                businessId,
                                request.getName().trim()
                        )
        ) {

            throw new RuntimeException(
                    "A project with this name already exists in your business."
            );
        }


        /*
         * Calculate project number specifically
         * for this business.
         */
        Integer projectNumber =
                getNextProjectNumber(
                        businessId
                );


        /*
         * Create project.
         */
        Project project =
                new Project();


        /*
         * Automatically link project to
         * authenticated CEO's business.
         */
        project.setBusiness(
                currentUser.getBusiness()
        );


        /*
         * Business-specific sequence.
         */
        project.setProjectNumber(
                projectNumber
        );


        project.setName(
                request.getName()
                        .trim()
        );


        project.setDescription(
                request.getDescription()
        );


        project.setStatus(
                ProjectStatus.PLANNING
        );


        /*
         * Project manager is intentionally
         * null initially.
         *
         * CEO will assign a PM later.
         */
        project.setProjectManager(
                null
        );


        Project savedProject =
                projectRepository.save(
                        project
                );


        return toResponse(
                savedProject
        );
    }


    // =========================================================
    // GET ALL PROJECTS FOR CURRENT BUSINESS
    // =========================================================

    /**
     * Get projects belonging ONLY to the
     * authenticated user's business.
     */
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects(
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        Long businessId =
                currentUser
                        .getBusiness()
                        .getId();


        return projectRepository
                .findByBusinessId(
                        businessId
                )
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }


    // =========================================================
    // GET ONE PROJECT
    // =========================================================

    /**
     * Get one project.
     *
     * User can only access projects belonging
     * to their own business.
     */
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(
            Long projectId,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        Project project =
                getProjectEntityForBusiness(
                        projectId,
                        currentUser
                                .getBusiness()
                                .getId()
                );


        return toResponse(
                project
        );
    }


    // =========================================================
    // GET PROJECTS BY STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public List<ProjectResponse>
    getProjectsByStatus(
            ProjectStatus status,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        Long businessId =
                currentUser
                        .getBusiness()
                        .getId();


        return projectRepository
                .findByBusinessIdAndStatus(
                        businessId,
                        status
                )
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }


    // =========================================================
    // UPDATE PROJECT
    // =========================================================

    /**
     * Update project.
     *
     * For now only the CEO can modify
     * basic project information.
     */
    public ProjectResponse updateProject(
            Long projectId,
            ProjectUpdateRequest request,
            Authentication authentication
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Project update request cannot be null."
            );
        }


        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        if (
                currentUser.getRole()
                        != Role.CEO
        ) {

            throw new RuntimeException(
                    "Only the CEO can update projects."
            );
        }


        Long businessId =
                currentUser
                        .getBusiness()
                        .getId();


        Project project =
                getProjectEntityForBusiness(
                        projectId,
                        businessId
                );

        ProjectStatus previousStatus =
                project.getStatus();


        /*
         * Update name.
         */
        if (
                request.getName() != null
                        &&
                        !request.getName().isBlank()
        ) {

            String newName =
                    request
                            .getName()
                            .trim();


            /*
             * Only perform duplicate check
             * when the name actually changes.
             */
            if (
                    !newName.equalsIgnoreCase(
                            project.getName()
                    )
                            &&
                            projectRepository
                                    .existsByBusinessIdAndNameIgnoreCase(
                                            businessId,
                                            newName
                                    )
            ) {

                throw new RuntimeException(
                        "A project with this name already exists in your business."
                );
            }


            project.setName(
                    newName
            );
        }


        /*
         * Update description.
         */
        if (
                request.getDescription()
                        != null
        ) {

            project.setDescription(
                    request.getDescription()
            );
        }


        /*
         * Update status.
         */
        if (
                request.getStatus()
                        != null
        ) {

            project.setStatus(
                    request.getStatus()
            );
        }


        Project updatedProject =
                projectRepository.save(
                        project
                );


        /*
         * When a project transitions to COMPLETED,
         * publish its SRS documents into the
         * Knowledge Vault so other projects can
         * reuse the historical data.
         */
        if (
                updatedProject.getStatus()
                        == ProjectStatus.COMPLETED
                        &&
                        previousStatus
                                != ProjectStatus.COMPLETED
        ) {

            knowledgeService
                    .publishProjectToVault(
                            updatedProject
                    );
        }


        return toResponse(
                updatedProject
        );
    }


    // =========================================================
    // DELETE PROJECT
    // =========================================================

    /**
     * Delete project.
     *
     * Only CEO of the project's business
     * can delete it.
     */
    public void deleteProject(
            Long projectId,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        if (
                currentUser.getRole()
                        != Role.CEO
        ) {

            throw new RuntimeException(
                    "Only the CEO can delete projects."
            );
        }


        Project project =
                getProjectEntityForBusiness(
                        projectId,
                        currentUser
                                .getBusiness()
                                .getId()
                );


        projectRepository.delete(
                project
        );
    }


    // =========================================================
    // GET PROJECT ENTITY
    // =========================================================

    /**
     * General internal project lookup.
     *
     * Use this from services where business
     * checking is performed separately.
     */
    @Transactional(readOnly = true)
    public Project getProjectEntity(
            Long projectId
    ) {

        if (projectId == null) {

            throw new IllegalArgumentException(
                    "Project ID cannot be null."
            );
        }


        return projectRepository
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
    }


    // =========================================================
    // BUSINESS-SAFE PROJECT LOOKUP
    // =========================================================

    /**
     * Get a project only if it belongs
     * to the specified business.
     *
     * Prevents:
     *
     * CEO Business 1
     *
     * accessing:
     *
     * Project belonging to Business 2
     */
    @Transactional(readOnly = true)
    public Project getProjectEntityForBusiness(
            Long projectId,
            Long businessId
    ) {

        if (projectId == null) {

            throw new IllegalArgumentException(
                    "Project ID cannot be null."
            );
        }


        if (businessId == null) {

            throw new IllegalArgumentException(
                    "Business ID cannot be null."
            );
        }


        return projectRepository
                .findByIdAndBusinessId(
                        projectId,
                        businessId
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Project not found or does not belong to your business."
                                )
                );
    }


    // =========================================================
    // PROJECT NUMBER GENERATION
    // =========================================================

    /**
     * Generate the next business-specific
     * project number.
     *
     * Example:
     *
     * Business 1:
     *
     * 1
     * 2
     * 3
     *
     * returns 4.
     *
     *
     * Business 2:
     *
     * 1
     *
     * returns 2.
     */
    private Integer getNextProjectNumber(
            Long businessId
    ) {

        Integer maximumProjectNumber =
                projectRepository
                        .findMaximumProjectNumber(
                                businessId
                        );


        if (
                maximumProjectNumber == null
        ) {

            return 1;
        }


        return maximumProjectNumber + 1;
    }


    // =========================================================
    // AUTHENTICATED USER
    // =========================================================

    /**
     * Get the logged-in user from
     * Spring Security Authentication.
     *
     * authentication.getName()
     * should contain the user's email
     * because your JWT authentication
     * uses email as the username.
     */
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
                                        "Authenticated user was not found."
                                )
                );
    }


    // =========================================================
    // CREATE REQUEST VALIDATION
    // =========================================================

    private void validateCreateRequest(
            ProjectCreateRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Project request cannot be null."
            );
        }


        if (
                request.getName() == null
                        ||
                        request.getName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Project name is required."
            );
        }
    }

    // =========================================================
// ASSIGN PROJECT MANAGER
// =========================================================

    /**
     * CEO assigns a Project Manager
     * to one of their projects.
     */
    public ProjectResponse assignProjectManager(
            Long projectId,
            Long managerId,
            Authentication authentication
    ) {

        /*
         * Get CEO from JWT.
         */
        User ceo =
                getAuthenticatedUser(
                        authentication
                );


        /*
         * Only CEO can assign PM.
         */
        if (
                ceo.getRole()
                        != Role.CEO
        ) {

            throw new RuntimeException(
                    "Only the CEO can assign project managers."
            );
        }


        Long businessId =
                ceo
                        .getBusiness()
                        .getId();


        /*
         * Get project, but ONLY if it belongs
         * to CEO's business.
         */
        Project project =
                projectRepository
                        .findByIdAndBusinessId(
                                projectId,
                                businessId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Project not found or does not belong to your business."
                                        )
                        );


        /*
         * Get selected manager, but ONLY if
         * they belong to CEO's business.
         */
        User projectManager =
                userRepository
                        .findByIdAndBusinessId(
                                managerId,
                                businessId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found or does not belong to your business."
                                        )
                        );


        /*
         * Verify role.
         */
        if (
                projectManager.getRole()
                        != Role.PROJECT_MANAGER
        ) {

            throw new RuntimeException(
                    "Selected user is not a Project Manager."
            );
        }


        /*
         * Account should be active.
         */
        if (
                !projectManager.isEnabled()
        ) {

            throw new RuntimeException(
                    "Selected Project Manager account is disabled."
            );
        }


        if (
                projectManager.isAccountLocked()
        ) {

            throw new RuntimeException(
                    "Selected Project Manager account is locked."
            );
        }


        /*
         * Assign PM.
         */
        project.setProjectManager(
                projectManager
        );


        Project savedProject =
                projectRepository.save(
                        project
                );


        return toResponse(
                savedProject
        );
    }

    // =========================================================
    // DTO CONVERSION
    // =========================================================

    private ProjectResponse toResponse(
            Project project
    ) {

        Long businessId =
                null;

        Long projectManagerId =
                null;

        String projectManagerName =
                null;


        if (
                project.getBusiness() != null
        ) {

            businessId =
                    project.getBusiness()
                            .getId();
        }


        if (
                project.getProjectManager()
                        != null
        ) {

            projectManagerId =
                    project.getProjectManager()
                            .getId();


            String firstName =
                    project.getProjectManager()
                            .getFirstName();

            String lastName =
                    project.getProjectManager()
                            .getLastName();


            projectManagerName =
                    (
                            firstName
                                    + " "
                                    + lastName
                    )
                            .trim();
        }


        return new ProjectResponse(
                project.getId(),
                businessId,
                project.getProjectNumber(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                projectManagerId,
                projectManagerName,
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}