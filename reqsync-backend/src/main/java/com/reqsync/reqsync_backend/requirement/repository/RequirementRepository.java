package com.reqsync.reqsync_backend.requirement.repository;

import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.enums.RequirementStatus;
import com.reqsync.reqsync_backend.requirement.enums.RequirementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RequirementRepository
        extends JpaRepository<Requirement, Long> {

    /*
     * Find all requirements belonging to a project.
     */
    List<Requirement> findByProjectId(Long projectId);

    /*
     * Find a specific requirement by project and requirement code.
     *
     * Example:
     * projectId = 1
     * code = REQ-001
     */
    Optional<Requirement> findByProjectIdAndCode(
            Long projectId,
            String code
    );

    /*
     * Find requirements by their current status.
     *
     * Example:
     * APPROVED
     * DRAFT
     * REVIEW
     */
    List<Requirement> findByProjectIdAndStatus(
            Long projectId,
            RequirementStatus status
    );

    /*
     * Find requirements by type.
     *
     * Example:
     * FUNCTIONAL
     * NON_FUNCTIONAL
     */
    List<Requirement> findByProjectIdAndType(
            Long projectId,
            RequirementType type
    );

    /*
     * Check whether a requirement code already exists
     * inside a project.
     */
    boolean existsByProjectIdAndCode(
            Long projectId,
            String code
    );

    /*
     * Delete all requirements belonging to an extraction.
     */
    void deleteByExtractionId(Long extractionId);

    /*
     * Count requirements belonging to a project.
     */
    long countByProjectId(Long projectId);

    /*
     * Count requirements by project and status.
     */
    long countByProjectIdAndStatus(
            Long projectId,
            RequirementStatus status
    );
}