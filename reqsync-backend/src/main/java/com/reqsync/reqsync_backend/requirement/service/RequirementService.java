package com.reqsync.reqsync_backend.requirement.service;

import com.reqsync.reqsync_backend.requirement.dto.ExtractedRequirementResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementSummaryResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementUpdateRequest;
import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.enums.RequirementStatus;
import com.reqsync.reqsync_backend.requirement.enums.RequirementType;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;
import com.reqsync.reqsync_backend.requirement.service.semantic.RequirementEmbeddingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RequirementService {

    private final RequirementRepository
            requirementRepository;

    private final RequirementEmbeddingService
            requirementEmbeddingService;


    public RequirementService(
            RequirementRepository requirementRepository,
            RequirementEmbeddingService requirementEmbeddingService
    ) {

        this.requirementRepository =
                requirementRepository;

        this.requirementEmbeddingService =
                requirementEmbeddingService;
    }


    /**
     * Get one requirement by ID.
     */
    @Transactional(readOnly = true)
    public ExtractedRequirementResponse getById(
            Long requirementId
    ) {

        Requirement requirement =
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


        return toResponse(
                requirement
        );
    }


    /**
     * Get all requirements belonging
     * to a project.
     */
    @Transactional(readOnly = true)
    public List<RequirementSummaryResponse>
    getByProject(
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


    /**
     * Get requirements by project
     * and status.
     */
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


    /**
     * Get requirements by project
     * and type.
     */
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


    /**
     * Update an existing requirement.
     *
     * Important:
     * After updating title or description,
     * regenerate semantic embedding.
     */
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
         * Update title.
         */
        requirement.setTitle(
                request.getTitle()
        );


        /*
         * Update description.
         */
        requirement.setDescription(
                request.getDescription()
        );


        /*
         * Update requirement type.
         */
        requirement.setType(
                request.getType()
        );


        /*
         * Update priority.
         */
        requirement.setPriority(
                request.getPriority()
        );


        /*
         * Update lifecycle status.
         */
        requirement.setStatus(
                request.getStatus()
        );


        /*
         * Save changes.
         */
        Requirement updated =
                requirementRepository.save(
                        requirement
                );


        /*
         * ------------------------------------------------
         * REGENERATE EMBEDDING
         * ------------------------------------------------
         *
         * The old embedding represented the
         * previous title and description.
         *
         * Once requirement text changes,
         * the semantic representation must
         * also be updated.
         */
        try {

            requirementEmbeddingService
                    .generateAndStoreEmbedding(
                            updated.getId()
                    );

        } catch (Exception embeddingException) {

            /*
             * Requirement update itself should
             * not fail just because the external
             * embedding API is temporarily unavailable.
             */
            System.err.println(
                    "Unable to regenerate embedding for requirement "
                            + updated.getCode()
                            + ": "
                            + embeddingException.getMessage()
            );
        }


        return toResponse(
                updated
        );
    }


    /**
     * Delete a requirement.
     *
     * No separate embedding deletion is needed
     * because the embedding exists in the same
     * requirements table row.
     */
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


    /**
     * Convert entity into complete DTO.
     */
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


    /**
     * Convert entity into summary DTO.
     */
    private RequirementSummaryResponse
    toSummaryResponse(
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