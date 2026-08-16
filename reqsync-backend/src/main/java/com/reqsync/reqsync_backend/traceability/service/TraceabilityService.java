package com.reqsync.reqsync_backend.traceability.service;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.project.entity.Project;
import com.reqsync.reqsync_backend.project.entity.ProjectMember;
import com.reqsync.reqsync_backend.project.repository.ProjectMemberRepository;
import com.reqsync.reqsync_backend.project.repository.ProjectRepository;

import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;

import com.reqsync.reqsync_backend.traceability.dto.ProjectTraceabilityResponse;
import com.reqsync.reqsync_backend.traceability.dto.RequirementTraceabilityResponse;
import com.reqsync.reqsync_backend.traceability.dto.TraceabilityArtifactResponse;

import com.reqsync.reqsync_backend.traceability.entity.TraceabilityArtifactType;
import com.reqsync.reqsync_backend.traceability.entity.TraceabilityLink;
import com.reqsync.reqsync_backend.traceability.entity.TraceabilityRelationType;

import com.reqsync.reqsync_backend.traceability.repository.TraceabilityLinkRepository;

import com.reqsync.reqsync_backend.userstory.entity.UserStory;
import com.reqsync.reqsync_backend.userstory.repository.UserStoryRepository;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class TraceabilityService {

    private final TraceabilityLinkRepository
            traceabilityLinkRepository;

    private final RequirementRepository
            requirementRepository;

    private final ProjectRepository
            projectRepository;

    private final ProjectMemberRepository
            projectMemberRepository;

    private final UserRepository
            userRepository;

    private final UserStoryRepository
            userStoryRepository;


    public TraceabilityService(
            TraceabilityLinkRepository traceabilityLinkRepository,
            RequirementRepository requirementRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            UserRepository userRepository,
            UserStoryRepository userStoryRepository
    ) {

        this.traceabilityLinkRepository =
                traceabilityLinkRepository;

        this.requirementRepository =
                requirementRepository;

        this.projectRepository =
                projectRepository;

        this.projectMemberRepository =
                projectMemberRepository;

        this.userRepository =
                userRepository;

        this.userStoryRepository =
                userStoryRepository;
    }


    // =========================================================
    // GENERIC ARTIFACT LINK
    // =========================================================

    @Transactional
    public TraceabilityLink linkArtifact(
            Long projectId,
            Long requirementId,
            TraceabilityArtifactType artifactType,
            TraceabilityRelationType relationType,
            Long artifactId,
            String artifactCode,
            String artifactTitle,
            Integer artifactVersion
    ) {

        if (projectId == null) {
            throw new IllegalArgumentException(
                    "Project ID is required."
            );
        }

        if (requirementId == null) {
            throw new IllegalArgumentException(
                    "Requirement ID is required."
            );
        }

        if (artifactType == null) {
            throw new IllegalArgumentException(
                    "Artifact type is required."
            );
        }

        if (relationType == null) {
            throw new IllegalArgumentException(
                    "Traceability relation type is required."
            );
        }

        if (artifactId == null) {
            throw new IllegalArgumentException(
                    "Artifact ID is required."
            );
        }


        Requirement requirement =
                requirementRepository
                        .findById(requirementId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Requirement not found: "
                                                        + requirementId
                                        )
                        );


        if (
                requirement.getProjectId() == null
                        ||
                        !requirement
                                .getProjectId()
                                .equals(projectId)
        ) {

            throw new IllegalArgumentException(
                    "Requirement does not belong to project "
                            + projectId
            );
        }


        /*
         * =====================================================
         * CRITICAL BUSINESS RULE
         *
         * ONLY BA-APPROVED REQUIREMENTS ARE ALLOWED
         * TO ENTER END-TO-END TRACEABILITY.
         * =====================================================
         */
        validateApprovedRequirement(
                requirement
        );


        int normalizedVersion =
                artifactVersion == null
                        ? 0
                        : artifactVersion;


        TraceabilityLink link =
                traceabilityLinkRepository
                        .findByRequirementIdAndArtifactTypeAndArtifactIdAndArtifactVersionAndRelationType(
                                requirementId,
                                artifactType,
                                artifactId,
                                normalizedVersion,
                                relationType
                        )
                        .orElseGet(
                                TraceabilityLink::new
                        );


        link.setProjectId(
                projectId
        );

        link.setRequirementId(
                requirementId
        );

        link.setArtifactType(
                artifactType
        );

        link.setRelationType(
                relationType
        );

        link.setArtifactId(
                artifactId
        );

        link.setArtifactCode(
                artifactCode
        );

        link.setArtifactTitle(
                artifactTitle
        );

        link.setArtifactVersion(
                normalizedVersion
        );


        return traceabilityLinkRepository
                .save(
                        link
                );
    }


    // =========================================================
    // USER STORY LINK
    // =========================================================

    @Transactional
    public TraceabilityLink linkUserStory(
            Long projectId,
            Long requirementId,
            Long userStoryId,
            String storyCode,
            String storyTitle
    ) {

        return linkArtifact(
                projectId,
                requirementId,

                TraceabilityArtifactType.USER_STORY,

                TraceabilityRelationType
                        .GENERATED_AS_USER_STORY,

                userStoryId,
                storyCode,
                storyTitle,
                0
        );
    }


    // =========================================================
    // SRS VERSION LINK
    // =========================================================

    @Transactional
    public TraceabilityLink linkSrsVersion(
            Long projectId,
            Long requirementId,
            Long srsVersionId,
            Integer versionNumber,
            String srsTitle
    ) {

        return linkArtifact(
                projectId,
                requirementId,

                TraceabilityArtifactType.SRS_VERSION,

                TraceabilityRelationType
                        .DOCUMENTED_IN_SRS,

                srsVersionId,

                versionNumber == null
                        ? "SRS"
                        : "SRS-V" + versionNumber,

                srsTitle,

                versionNumber
        );
    }


    // =========================================================
    // UML VERSION LINK
    // =========================================================

    @Transactional
    public TraceabilityLink linkUmlVersion(
            Long projectId,
            Long requirementId,
            Long umlVersionId,
            Integer versionNumber,
            String diagramTitle
    ) {

        return linkArtifact(
                projectId,
                requirementId,

                TraceabilityArtifactType
                        .UML_DIAGRAM_VERSION,

                TraceabilityRelationType
                        .DESIGNED_IN_UML,

                umlVersionId,

                versionNumber == null
                        ? "UML"
                        : "UML-V" + versionNumber,

                diagramTitle,

                versionNumber
        );
    }


    // =========================================================
    // DEVELOPER SUBMISSION LINK
    // =========================================================

    @Transactional
    public TraceabilityLink linkDeveloperSubmission(
            Long projectId,
            Long requirementId,
            Long submissionId,
            String submissionCode,
            String submissionTitle
    ) {

        return linkArtifact(
                projectId,
                requirementId,

                TraceabilityArtifactType
                        .DEVELOPER_SUBMISSION,

                TraceabilityRelationType
                        .IMPLEMENTED_BY_DEVELOPER_SUBMISSION,

                submissionId,
                submissionCode,
                submissionTitle,
                0
        );
    }


    // =========================================================
    // REMOVE LINKS FOR DELETED ARTIFACT
    // =========================================================

    @Transactional
    public void removeArtifactLinks(
            TraceabilityArtifactType artifactType,
            Long artifactId
    ) {

        if (
                artifactType == null
                        ||
                        artifactId == null
        ) {
            return;
        }


        traceabilityLinkRepository
                .deleteByArtifactTypeAndArtifactId(
                        artifactType,
                        artifactId
                );
    }


    // =========================================================
    // REMOVE EVERYTHING FOR A REQUIREMENT
    // =========================================================

    @Transactional
    public void removeRequirementLinks(
            Long requirementId
    ) {

        if (requirementId == null) {
            return;
        }


        traceabilityLinkRepository
                .deleteByRequirementId(
                        requirementId
                );
    }


    // =========================================================
    // SYNC OLD USER STORIES
    // =========================================================

    @Transactional
    public int syncExistingUserStories(
            Long projectId,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        Project project =
                getProject(
                        projectId
                );


        validateProjectAccess(
                currentUser,
                project
        );


        List<UserStory> stories =
                userStoryRepository
                        .findByProjectIdOrderByIdAsc(
                                projectId
                        );


        int synced = 0;


        for (
                UserStory story
                : stories
        ) {

            if (
                    story.getSourceRequirementId()
                            == null
            ) {
                continue;
            }


            Requirement requirement =
                    requirementRepository
                            .findById(
                                    story.getSourceRequirementId()
                            )
                            .orElse(null);


            if (requirement == null) {
                continue;
            }


            if (
                    requirement.getProjectId() == null
                            ||
                            !requirement
                                    .getProjectId()
                                    .equals(projectId)
            ) {

                continue;
            }


            /*
             * Do NOT sync DRAFT or REJECTED requirements.
             */
            if (!isApproved(requirement)) {
                continue;
            }


            linkUserStory(
                    projectId,
                    requirement.getId(),
                    story.getId(),
                    story.getCode(),
                    story.getTitle()
            );


            synced++;
        }


        return synced;
    }


    // =========================================================
    // PROJECT TRACEABILITY
    // =========================================================

    @Transactional(readOnly = true)
    public ProjectTraceabilityResponse
    getProjectTraceability(
            Long projectId,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        Project project =
                getProject(
                        projectId
                );


        validateProjectAccess(
                currentUser,
                project
        );


        List<Requirement> allRequirements =
                new ArrayList<>(
                        requirementRepository
                                .findByProjectId(
                                        projectId
                                )
                );


        /*
         * Traceability output itself contains
         * APPROVED requirements only.
         */
        List<Requirement> approvedRequirements =
                allRequirements
                        .stream()
                        .filter(
                                this::isApproved
                        )
                        .sorted(
                                Comparator.comparing(
                                        Requirement::getId
                                )
                        )
                        .toList();


        List<RequirementTraceabilityResponse>
                requirementResponses =
                new ArrayList<>();


        int tracedRequirements = 0;


        for (
                Requirement requirement
                : approvedRequirements
        ) {

            RequirementTraceabilityResponse response =
                    buildRequirementTraceability(
                            requirement
                    );


            if (
                    response.getArtifacts() != null
                            &&
                            !response
                                    .getArtifacts()
                                    .isEmpty()
            ) {

                tracedRequirements++;
            }


            requirementResponses.add(
                    response
            );
        }


        return new ProjectTraceabilityResponse(
                project.getId(),
                project.getProjectNumber(),
                project.getName(),

                allRequirements.size(),

                approvedRequirements.size(),

                tracedRequirements,

                requirementResponses
        );
    }


    // =========================================================
    // SINGLE REQUIREMENT TRACEABILITY
    // =========================================================

    @Transactional(readOnly = true)
    public RequirementTraceabilityResponse
    getRequirementTraceability(
            Long requirementId,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        Requirement requirement =
                requirementRepository
                        .findById(
                                requirementId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Requirement not found."
                                        )
                        );


        /*
         * DRAFT/REJECTED requirements cannot expose
         * traceability.
         */
        validateApprovedRequirement(
                requirement
        );


        Project project =
                getProject(
                        requirement.getProjectId()
                );


        validateProjectAccess(
                currentUser,
                project
        );


        return buildRequirementTraceability(
                requirement
        );
    }


    // =========================================================
    // RESPONSE BUILDER
    // =========================================================

    private RequirementTraceabilityResponse
    buildRequirementTraceability(
            Requirement requirement
    ) {

        List<TraceabilityLink> links =
                traceabilityLinkRepository
                        .findByRequirementIdOrderByCreatedAtAsc(
                                requirement.getId()
                        );


        List<TraceabilityArtifactResponse>
                artifactResponses =
                links
                        .stream()
                        .map(
                                link ->
                                        new TraceabilityArtifactResponse(
                                                link.getId(),

                                                link
                                                        .getRelationType()
                                                        .name(),

                                                link
                                                        .getArtifactType()
                                                        .name(),

                                                link.getArtifactId(),

                                                link.getArtifactCode(),

                                                link.getArtifactTitle(),

                                                link.getArtifactVersion(),

                                                link.getCreatedAt()
                                        )
                        )
                        .toList();


        Long extractionId =
                null;

        String sourceDocument =
                null;


        if (
                requirement.getExtraction()
                        != null
        ) {

            extractionId =
                    requirement
                            .getExtraction()
                            .getId();


            sourceDocument =
                    requirement
                            .getExtraction()
                            .getDocumentName();
        }


        String status =
                requirement.getStatus() == null
                        ? null
                        : requirement
                        .getStatus()
                        .name();


        return new RequirementTraceabilityResponse(
                requirement.getId(),
                requirement.getCode(),
                requirement.getTitle(),
                status,
                extractionId,
                sourceDocument,
                artifactResponses
        );
    }


    // =========================================================
    // APPROVAL HELPERS
    // =========================================================

    private boolean isApproved(
            Requirement requirement
    ) {

        return requirement != null
                &&
                requirement.getStatus() != null
                &&
                "APPROVED".equalsIgnoreCase(
                        requirement
                                .getStatus()
                                .name()
                );
    }


    private void validateApprovedRequirement(
            Requirement requirement
    ) {

        if (!isApproved(requirement)) {

            throw new IllegalStateException(
                    "Only APPROVED requirements can participate in end-to-end traceability."
            );
        }
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
                    "Authentication is required."
            );
        }


        /*
         * This matches your existing UserStory service.
         */
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
    // PROJECT
    // =========================================================

    private Project getProject(
            Long projectId
    ) {

        if (projectId == null) {

            throw new IllegalArgumentException(
                    "Project ID is required."
            );
        }


        return projectRepository
                .findById(
                        projectId
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Project not found."
                                )
                );
    }


    // =========================================================
    // PROJECT ACCESS
    // =========================================================

    private void validateProjectAccess(
            User currentUser,
            Project project
    ) {

        if (
                currentUser.getBusiness() == null
                        ||
                        project.getBusiness() == null
                        ||
                        !currentUser
                                .getBusiness()
                                .getId()
                                .equals(
                                        project
                                                .getBusiness()
                                                .getId()
                                )
        ) {

            throw new RuntimeException(
                    "You do not have access to this project."
            );
        }


        /*
         * CEO of same business.
         */
        if (
                currentUser.getRole()
                        == Role.CEO
        ) {

            return;
        }


        /*
         * Assigned Project Manager.
         */
        if (
                currentUser.getRole()
                        == Role.PROJECT_MANAGER
        ) {

            if (
                    project.getProjectManager()
                            != null
                            &&
                            project
                                    .getProjectManager()
                                    .getId()
                                    .equals(
                                            currentUser.getId()
                                    )
            ) {

                return;
            }


            throw new RuntimeException(
                    "You are not the Project Manager assigned to this project."
            );
        }


        /*
         * BA / Developer / QA must be active members.
         */
        if (
                currentUser.getRole()
                        == Role.BUSINESS_ANALYST
                        ||
                        currentUser.getRole()
                                == Role.DEVELOPER
                        ||
                        currentUser.getRole()
                                == Role.QA_ENGINEER
        ) {

            ProjectMember membership =
                    projectMemberRepository
                            .findByProjectIdAndUserId(
                                    project.getId(),
                                    currentUser.getId()
                            )
                            .orElseThrow(
                                    () ->
                                            new RuntimeException(
                                                    "You are not assigned to this project."
                                            )
                            );


            if (!membership.isActive()) {

                throw new RuntimeException(
                        "You are not an active member of this project."
                );
            }


            return;
        }


        throw new RuntimeException(
                "You do not have permission to view project traceability."
        );
    }
}