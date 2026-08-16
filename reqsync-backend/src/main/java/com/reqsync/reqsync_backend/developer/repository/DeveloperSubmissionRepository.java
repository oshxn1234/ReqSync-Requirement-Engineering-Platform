package com.reqsync.reqsync_backend.developer.repository;

import com.reqsync.reqsync_backend.developer.entity.DeveloperSubmission;
import com.reqsync.reqsync_backend.developer.entity.SubmissionStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface DeveloperSubmissionRepository
        extends JpaRepository<DeveloperSubmission, Long> {


    List<DeveloperSubmission> findByTaskId(
            Long taskId
    );


    List<DeveloperSubmission> findByDeveloperId(
            Long developerId
    );


    List<DeveloperSubmission> findByStatus(
            SubmissionStatus status
    );


    /*
     * QA queue/history.
     */
    List<DeveloperSubmission> findAllByOrderBySubmittedAtDesc();
}