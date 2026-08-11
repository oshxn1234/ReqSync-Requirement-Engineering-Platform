package com.reqsync.reqsync_backend.requirement.repository;

import com.reqsync.reqsync_backend.requirement.entity.RequirementExtraction;
import com.reqsync.reqsync_backend.requirement.enums.ExtractionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RequirementExtractionRepository
        extends JpaRepository<RequirementExtraction, Long> {

    /*
     * Find all extraction records for a project.
     */
    List<RequirementExtraction> findByProjectId(
            Long projectId
    );

    /*
     * Find extractions for a project ordered by newest first.
     */
    List<RequirementExtraction> findByProjectIdOrderByCreatedAtDesc(
            Long projectId
    );

    /*
     * Find extractions by their status.
     */
    List<RequirementExtraction> findByProjectIdAndStatus(
            Long projectId,
            ExtractionStatus status
    );

    /*
     * Find the latest extraction for a project.
     */
    Optional<RequirementExtraction>
    findFirstByProjectIdOrderByCreatedAtDesc(
            Long projectId
    );

    /*
     * Count extraction records for a project.
     */
    long countByProjectId(Long projectId);
}