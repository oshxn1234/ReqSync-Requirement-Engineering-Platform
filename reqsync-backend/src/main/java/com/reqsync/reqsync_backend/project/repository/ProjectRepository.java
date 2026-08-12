package com.reqsync.reqsync_backend.project.repository;

import com.reqsync.reqsync_backend.project.entity.Project;
import com.reqsync.reqsync_backend.project.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository
        extends JpaRepository<Project, Long> {

    boolean existsByNameIgnoreCase(
            String name
    );


    List<Project> findByStatus(
            ProjectStatus status
    );
}