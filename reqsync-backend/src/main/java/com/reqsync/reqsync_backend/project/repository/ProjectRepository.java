package com.reqsync.reqsync_backend.project.repository;

import com.reqsync.reqsync_backend.project.entity.Project;
import com.reqsync.reqsync_backend.project.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository
        extends JpaRepository<Project, Long> {


    /**
     * Check whether a project name already exists
     * inside a particular business.
     *
     * Different businesses CAN have projects
     * with the same name.
     */
    boolean existsByBusinessIdAndNameIgnoreCase(
            Long businessId,
            String name
    );


    /**
     * Get all projects belonging to one business.
     */
    List<Project> findByBusinessId(
            Long businessId
    );


    /**
     * Get projects belonging to a business
     * filtered by project status.
     */
    List<Project> findByBusinessIdAndStatus(
            Long businessId,
            ProjectStatus status
    );


    /**
     * Find one project only if it belongs
     * to the specified business.
     *
     * This is important for business isolation.
     */
    Optional<Project> findByIdAndBusinessId(
            Long projectId,
            Long businessId
    );


    /**
     * Find the largest project number currently
     * used by one business.
     *
     * Example:
     *
     * Business 1:
     *
     * PRJ 1
     * PRJ 2
     * PRJ 3
     *
     * Returns 3.
     *
     * Business 2 can independently have:
     *
     * PRJ 1
     * PRJ 2
     */
    @Query("""
            SELECT MAX(p.projectNumber)
            FROM Project p
            WHERE p.business.id = :businessId
            """)
    Integer findMaximumProjectNumber(
            @Param("businessId")
            Long businessId
    );
}