package com.reqsync.reqsync_backend.project.repository;

import com.reqsync.reqsync_backend.project.entity.ProjectMember;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository
        extends JpaRepository<ProjectMember, Long> {


    /**
     * Check whether a user is already
     * assigned to a project.
     */
    boolean existsByProjectIdAndUserId(
            Long projectId,
            Long userId
    );


    /**
     * Get all memberships of a project.
     */
    List<ProjectMember> findByProjectId(
            Long projectId
    );


    /**
     * Get active project members.
     */
    List<ProjectMember>
    findByProjectIdAndActiveTrue(
            Long projectId
    );


    /**
     * Find membership for a particular
     * user and project.
     */
    Optional<ProjectMember>
    findByProjectIdAndUserId(
            Long projectId,
            Long userId
    );


    /**
     * Get projects assigned to a user.
     */
    List<ProjectMember>
    findByUserIdAndActiveTrue(
            Long userId
    );

    List<ProjectMember> findByUserId(Long userId);
}