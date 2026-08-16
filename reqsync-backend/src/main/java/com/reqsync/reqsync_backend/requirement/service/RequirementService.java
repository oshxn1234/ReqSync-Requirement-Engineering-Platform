package com.reqsync.reqsync_backend.requirement.service;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.project.entity.ProjectMember;
import com.reqsync.reqsync_backend.project.repository.ProjectMemberRepository;

import com.reqsync.reqsync_backend.requirement.dto.ExtractedRequirementResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementStatusUpdateRequest;
import com.reqsync.reqsync_backend.requirement.dto.RequirementSummaryResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementUpdateRequest;

import com.reqsync.reqsync_backend.requirement.entity.Requirement;

import com.reqsync.reqsync_backend.requirement.enums.RequirementStatus;
import com.reqsync.reqsync_backend.requirement.enums.RequirementType;

import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;

import com.reqsync.reqsync_backend.requirement.service.semantic.RequirementEmbeddingService;

import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RequirementService {

    private final RequirementRepository requirementRepository;

    private final RequirementEmbeddingService requirementEmbeddingService;

    private final UserRepository userRepository;

    private final ProjectMemberRepository projectMemberRepository;


    public RequirementService(
            RequirementRepository requirementRepository,
            RequirementEmbeddingService requirementEmbeddingService,
            UserRepository userRepository,
            ProjectMemberRepository projectMemberRepository
    ) {

        this.requirementRepository =
                requirementRepository;

        this.requirementEmbeddingService =
                requirementEmbeddingService;

        this.userRepository =
                userRepository;

        this.projectMemberRepository =
                projectMemberRepository;
    }


    // ==========================================
    // GET REQUIREMENT BY ID
    // ==========================================

    @Transactional(readOnly = true)
    public ExtractedRequirementResponse getById(
            Long requirementId
    ) {

        Requirement requirement =
                getRequirement(
                        requirementId
                );

        return toResponse(
                requirement
        );
    }


    // ==========================================
    // GET PROJECT REQUIREMENTS
    // ==========================================

    @Transactional(readOnly = true)
    public List<RequirementSummaryResponse> getByProject(
            Long projectId
    ) {

        return requirementRepository
                .findByProjectId(
                        projectId
                )
                .stream()
                .map(
                        this::toSummaryResponse
                )
                .toList();
    }


    // ==========================================
    // GET BY STATUS
    // ==========================================

    @Transactional(readOnly = true)
    public List<RequirementSummaryResponse>
    getByProjectAndStatus(
            Long projectId,
            RequirementStatus status
    ) {

        return requirementRepository
                .findByProjectIdAndStatus(
                        projectId,
                        status
                )
                .stream()
                .map(
                        this::toSummaryResponse
                )
                .toList();
    }


    // ==========================================
    // GET BY TYPE
    // ==========================================

    @Transactional(readOnly = true)
    public List<RequirementSummaryResponse>
    getByProjectAndType(
            Long projectId,
            RequirementType type
    ) {

        return requirementRepository
                .findByProjectIdAndType(
                        projectId,
                        type
                )
                .stream()
                .map(
                        this::toSummaryResponse
                )
                .toList();
    }


    // ==========================================
    // FULL UPDATE
    // ==========================================

    public ExtractedRequirementResponse update(
            Long requirementId,
            RequirementUpdateRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Requirement update request cannot be null."
            );
        }


        Requirement requirement =
                getRequirement(
                        requirementId
                );


        requirement.setTitle(
                request.getTitle()
        );

        requirement.setDescription(
                request.getDescription()
        );

        requirement.setType(
                request.getType()
        );

        requirement.setPriority(
                request.getPriority()
        );

        requirement.setStatus(
                request.getStatus()
        );


        Requirement updated =
                requirementRepository.save(
                        requirement
                );


        /*
         * Regenerate semantic embedding because
         * title or description may have changed.
         */
        try {

            requirementEmbeddingService
                    .generateAndStoreEmbedding(
                            updated.getId()
                    );

        } catch (Exception exception) {

            System.err.println(
                    "Unable to regenerate embedding for requirement "
                            + updated.getCode()
                            + ": "
                            + exception.getMessage()
            );
        }


        return toResponse(
                updated
        );
    }


    // ==========================================
    // BA APPROVE / REJECT
    // ==========================================

    public ExtractedRequirementResponse updateStatus(
            Long requirementId,
            RequirementStatusUpdateRequest request,
            Authentication authentication
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Requirement status update request cannot be null."
            );
        }


        RequirementStatus newStatus =
                request.getStatus();


        if (newStatus == null) {

            throw new IllegalArgumentException(
                    "Requirement status is required."
            );
        }


        /*
         * BA review endpoint only performs
         * final approve/reject decisions.
         */
        if (
                newStatus != RequirementStatus.APPROVED
                        &&
                newStatus != RequirementStatus.REJECTED
        ) {

            throw new IllegalArgumentException(
                    "Requirement status must be APPROVED or REJECTED."
            );
        }


        Requirement requirement =
                getRequirement(
                        requirementId
                );


        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        if (
                currentUser.getRole()
                        != Role.BUSINESS_ANALYST
        ) {

            throw new RuntimeException(
                    "Only a Business Analyst can approve or reject requirements."
            );
        }


        /*
         * BA must belong to the requirement's project.
         */
        ProjectMember membership =
                projectMemberRepository
                        .findByProjectIdAndUserId(
                                requirement.getProjectId(),
                                currentUser.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Business Analyst is not assigned to this project."
                                        )
                        );


        if (!membership.isActive()) {

            throw new RuntimeException(
                    "Business Analyst project membership is inactive."
            );
        }


        /*
         * Status-only change.
         *
         * No embedding regeneration is required
         * because title and description do not change.
         */
        requirement.setStatus(
                newStatus
        );


        Requirement updated =
                requirementRepository.save(
                        requirement
                );


        return toResponse(
                updated
        );
    }


    // ==========================================
    // DELETE
    // ==========================================

    public void delete(
            Long requirementId
    ) {

        if (
                !requirementRepository
                        .existsById(
                                requirementId
                        )
        ) {

            throw new RuntimeException(
                    "Requirement not found: "
                            + requirementId
            );
        }


        requirementRepository
                .deleteById(
                        requirementId
                );
    }


    // ==========================================
    // REQUIREMENT LOOKUP
    // ==========================================

    private Requirement getRequirement(
            Long requirementId
    ) {

        if (requirementId == null) {

            throw new IllegalArgumentException(
                    "Requirement ID is required."
            );
        }


        return requirementRepository
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
    }


    // ==========================================
    // AUTH USER
    // ==========================================

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


    // ==========================================
    // FULL RESPONSE
    // ==========================================

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


    // ==========================================
    // SUMMARY RESPONSE
    // ==========================================

    private RequirementSummaryResponse toSummaryResponse(
            Requirement requirement
    ) {

        return new RequirementSummaryResponse(
                requirement.getId(),
                requirement.getCode(),
                requirement.getTitle(),
                requirement.getType(),
                requirement.getPriority(),
                requirement.getStatus(),
                requirement.getConfidenceScore()
        );
    }
}
