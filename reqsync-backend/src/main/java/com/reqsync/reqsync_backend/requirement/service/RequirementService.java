package com.reqsync.reqsync_backend.requirement.service;

import com.reqsync.reqsync_backend.requirement.dto.ExtractedRequirementResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementSummaryResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementUpdateRequest;
import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.enums.RequirementStatus;
import com.reqsync.reqsync_backend.requirement.enums.RequirementType;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RequirementService {

    private final RequirementRepository requirementRepository;

    public RequirementService(
            RequirementRepository requirementRepository
    ) {
        this.requirementRepository = requirementRepository;
    }


    /**
     * Get one requirement by ID.
     */
    @Transactional(readOnly = true)
    public ExtractedRequirementResponse getById(Long requirementId) {

        Requirement requirement =
                requirementRepository.findById(requirementId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Requirement not found: "
                                                + requirementId
                                )
                        );

        return toResponse(requirement);
    }


    /**
     * Get all requirements belonging to a project.
     */
    @Transactional(readOnly = true)
    public List<RequirementSummaryResponse> getByProject(
            Long projectId
    ) {

        return requirementRepository
                .findByProjectId(projectId)
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }


    /**
     * Get requirements by project and status.
     */
    @Transactional(readOnly = true)
    public List<RequirementSummaryResponse> getByProjectAndStatus(
            Long projectId,
            RequirementStatus status
    ) {

        return requirementRepository
                .findByProjectIdAndStatus(
                        projectId,
                        status
                )
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }


    /**
     * Get requirements by project and type.
     */
    @Transactional(readOnly = true)
    public List<RequirementSummaryResponse> getByProjectAndType(
            Long projectId,
            RequirementType type
    ) {

        return requirementRepository
                .findByProjectIdAndType(
                        projectId,
                        type
                )
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }


    /**
     * Update an existing requirement.
     */
    public ExtractedRequirementResponse update(
            Long requirementId,
            RequirementUpdateRequest request
    ) {

        Requirement requirement =
                requirementRepository.findById(requirementId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Requirement not found: "
                                                + requirementId
                                )
                        );

        requirement.setTitle(request.getTitle());

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
                requirementRepository.save(requirement);

        return toResponse(updated);
    }


    /**
     * Delete a requirement.
     */
    public void delete(Long requirementId) {

        if (!requirementRepository.existsById(requirementId)) {

            throw new RuntimeException(
                    "Requirement not found: "
                            + requirementId
            );
        }

        requirementRepository.deleteById(requirementId);
    }


    /**
     * Convert entity → complete response.
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
     * Convert entity → summary response.
     */
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