package com.reqsync.reqsync_backend.project.repository;

import com.reqsync.reqsync_backend.project.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository
        extends JpaRepository<ProjectMember, Long> {

    boolean existsByProjectIdAndUserId(
            Long projectId,
            Long userId
    );

    List<ProjectMember> findByProjectId(
            Long projectId
    );

    List<ProjectMember> findByProjectIdAndActiveTrue(
            Long projectId
    );

    Optional<ProjectMember> findByProjectIdAndUserId(
            Long projectId,
            Long userId
    );

    List<ProjectMember> findByUserIdAndActiveTrue(
            Long userId
    );

    /**
     * IMPORTANT FOR SUITABILITY
     *
     * Returns the complete project history
     * of a user, including inactive memberships.
     */
    List<ProjectMember> findByUserId(
            Long userId
    );
}