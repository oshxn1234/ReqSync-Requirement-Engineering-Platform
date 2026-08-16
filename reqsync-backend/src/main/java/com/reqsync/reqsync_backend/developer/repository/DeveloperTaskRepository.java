package com.reqsync.reqsync_backend.developer.repository;

import com.reqsync.reqsync_backend.developer.entity.DeveloperTask;
import com.reqsync.reqsync_backend.developer.entity.TaskStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeveloperTaskRepository
        extends JpaRepository<DeveloperTask, Long> {


    List<DeveloperTask> findByAssignedDeveloperId(
            Long developerId
    );


    List<DeveloperTask> findByAssignedDeveloperIdAndStatus(
            Long developerId,
            TaskStatus status
    );


    List<DeveloperTask> findByRequirementId(
            Long requirementId
    );


    List<DeveloperTask> findByUserStoryId(
            Long userStoryId
    );
}