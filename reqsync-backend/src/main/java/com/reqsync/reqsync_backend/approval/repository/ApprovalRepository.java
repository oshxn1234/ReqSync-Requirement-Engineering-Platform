package com.reqsync.reqsync_backend.approval.repository;

import com.reqsync.reqsync_backend.approval.entity.Approval;
import com.reqsync.reqsync_backend.approval.enums.ApprovalStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalRepository
        extends JpaRepository<Approval, Long> {

    List<Approval> findByProjectIdOrderByIdAsc(
            Long projectId
    );


    List<Approval> findByProjectIdAndStatus(
            Long projectId,
            ApprovalStatus status
    );


    Optional<Approval> findByCode(
            String code
    );


    boolean existsByCode(
            String code
    );


    long countByProjectId(
            Long projectId
    );


    /**
     * Find the largest numeric part of an approval code.
     *
     * APR-101 -> 101
     * APR-120 -> 120
     *
     * Returns null when the project has no approvals.
     */
    @Query(
            value = """
                    SELECT MAX(
                        CAST(
                            SUBSTRING(code FROM 5)
                            AS INTEGER
                        )
                    )
                    FROM approvals
                    WHERE project_id = :projectId
                      AND code ~ '^APR-[0-9]+$'
                    """,
            nativeQuery = true
    )
    Integer findMaximumApprovalNumber(
            @Param("projectId")
            Long projectId
    );
}
