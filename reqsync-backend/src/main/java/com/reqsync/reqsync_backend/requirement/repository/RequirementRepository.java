package com.reqsync.reqsync_backend.requirement.repository;

import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.enums.RequirementStatus;
import com.reqsync.reqsync_backend.requirement.enums.RequirementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RequirementRepository
        extends JpaRepository<Requirement, Long> {

    List<Requirement> findByProjectId(
            Long projectId
    );

    List<Requirement> findByProjectIdAndStatus(
            Long projectId,
            RequirementStatus status
    );

    List<Requirement> findByProjectIdAndType(
            Long projectId,
            RequirementType type
    );


    /**
     * Prevent saving an exact duplicate requirement
     * in the same project.
     */
    boolean existsByProjectIdAndTitleIgnoreCaseAndDescriptionIgnoreCase(
            Long projectId,
            String title,
            String description
    );


    /**
     * Find the largest numeric part of a requirement code.
     *
     * Examples:
     *
     * REQ-001 -> 1
     * REQ-020 -> 20
     * REQ-105 -> 105
     *
     * If the project has no requirements,
     * this query returns null.
     */
    @Query(
            value = """
                    SELECT MAX(
                        CAST(
                            SUBSTRING(requirement_code FROM 5)
                            AS INTEGER
                        )
                    )
                    FROM requirements
                    WHERE project_id = :projectId
                      AND requirement_code ~ '^REQ-[0-9]+$'
                    """,
            nativeQuery = true
    )
    Integer findMaximumRequirementNumber(
            @Param("projectId")
            Long projectId
    );


    Optional<Requirement> findByProjectIdAndCode(
            Long projectId,
            String code
    );
}